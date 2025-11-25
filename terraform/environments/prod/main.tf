# ============================================================================
# HERGON VECTOR01 - PRODUCTION ENVIRONMENT
# AWS Infrastructure with Azure AD Authentication
# ============================================================================

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    # Configuración definida en backend.tf
  }
}

# ============================================================================
# PROVIDER CONFIGURATION
# ============================================================================

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "Terraform"
      CostCenter  = "Engineering"
      Compliance  = "CONSAR"
    }
  }
}

# ============================================================================
# DATA SOURCES
# ============================================================================

data "aws_caller_identity" "current" {}

data "aws_availability_zones" "available" {
  state = "available"
}

# ============================================================================
# NETWORKING MODULE
# ============================================================================

module "networking" {
  source = "../../modules/networking"

  project_name       = var.project_name
  environment        = var.environment
  region             = var.region
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones

  public_subnet_cidrs      = var.public_subnet_cidrs
  private_app_subnet_cidrs = var.private_app_subnet_cidrs
  private_db_subnet_cidrs  = var.private_db_subnet_cidrs

  enable_nat_gateway   = true
  enable_vpc_endpoints = true
  enable_flow_logs     = true

  flow_logs_retention_days = 7

  additional_tags = var.additional_tags
}

# ============================================================================
# SECURITY MODULE
# ============================================================================

module "security" {
  source = "../../modules/security"

  project_name   = var.project_name
  environment    = var.environment
  region         = var.region
  aws_account_id = data.aws_caller_identity.current.account_id

  vpc_id = module.networking.vpc_id

  # Azure AD Configuration
  azure_tenant_id     = var.azure_tenant_id
  azure_client_id     = var.azure_client_id
  azure_client_secret = var.azure_client_secret
  azure_audience      = var.azure_audience

  # Database Configuration
  db_master_password = var.db_master_password

  additional_tags = var.additional_tags

  depends_on = [module.networking]
}

# ============================================================================
# DATABASE MODULE
# ============================================================================

module "database" {
  source = "../../modules/database"

  project_name   = var.project_name
  environment    = var.environment
  region         = var.region

  vpc_id                 = module.networking.vpc_id
  private_db_subnet_ids  = module.networking.private_db_subnet_ids
  availability_zones     = var.availability_zones

  rds_security_group_id   = module.security.rds_security_group_id
  redis_security_group_id = module.security.redis_security_group_id
  kms_key_arn             = module.security.kms_key_arn

  db_master_password = var.db_master_password

  additional_tags = var.additional_tags

  depends_on = [module.security]
}

# ============================================================================
# STORAGE MODULE
# ============================================================================

module "storage" {
  source = "../../modules/storage"

  project_name   = var.project_name
  environment    = var.environment
  aws_account_id = data.aws_caller_identity.current.account_id

  kms_key_arn = module.security.kms_key_arn

  ecs_task_role_arn          = module.security.ecs_task_role_arn
  lambda_execution_role_arn  = module.security.lambda_execution_role_arn

  # S3 notifications se configurarán después de crear Lambda functions
  enable_s3_notifications    = false
  file_processor_lambda_arn  = ""

  additional_tags = var.additional_tags

  depends_on = [module.security]
}

# ============================================================================
# ECS CLUSTER
# ============================================================================

resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "${var.project_name}-cluster-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE"
  }
}

# ============================================================================
# APPLICATION LOAD BALANCER
# ============================================================================

resource "aws_lb" "main" {
  name               = "${var.project_name}-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [module.security.alb_security_group_id]
  subnets            = module.networking.public_subnet_ids

  enable_deletion_protection = true
  enable_http2               = true
  enable_cross_zone_load_balancing = true

  access_logs {
    bucket  = module.storage.raw_files_bucket_name
    prefix  = "alb-logs"
    enabled = true
  }

  tags = {
    Name        = "${var.project_name}-alb-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }

  depends_on = [module.storage]
}

# ALB Target Group para API Service
resource "aws_lb_target_group" "api" {
  name        = "${var.project_name}-api-tg-${var.environment}"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = module.networking.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 3
  }

  deregistration_delay = 30

  tags = {
    Name        = "${var.project_name}-api-tg-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# ALB Listener HTTPS
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.ssl_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

# ALB Listener HTTP (redirect to HTTPS)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# ============================================================================
# ECS TASK DEFINITION - API SERVICE
# ============================================================================

resource "aws_cloudwatch_log_group" "api_service" {
  name              = "/ecs/${var.project_name}-api-service-${var.environment}"
  retention_in_days = 7

  tags = {
    Name        = "${var.project_name}-api-service-logs-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_ecs_task_definition" "api_service" {
  family                   = "${var.project_name}-api-service-${var.environment}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "1024"  # 1 vCPU
  memory                   = "2048"  # 2 GB

  execution_role_arn = module.security.ecs_task_execution_role_arn
  task_role_arn      = module.security.ecs_task_role_arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"  # Graviton4
  }

  container_definitions = jsonencode([
    {
      name  = "api-service"
      image = "${var.ecr_repository_url}/api-service:latest"

      portMappings = [
        {
          containerPort = 8080
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "ASPNETCORE_ENVIRONMENT"
          value = "Production"
        },
        {
          name  = "ASPNETCORE_URLS"
          value = "http://+:8080"
        },
        {
          name  = "Environment"
          value = var.environment
        },
        {
          name  = "AWS_REGION"
          value = var.region
        },
        {
          name  = "DatabaseCatalog__Host"
          value = module.database.catalog_db_address
        },
        {
          name  = "DatabaseCatalog__Port"
          value = tostring(module.database.catalog_db_port)
        },
        {
          name  = "DatabaseCatalog__Database"
          value = module.database.catalog_db_name
        },
        {
          name  = "Redis__Endpoint"
          value = module.database.redis_endpoint
        },
        {
          name  = "Redis__Port"
          value = tostring(module.database.redis_port)
        },
        {
          name  = "S3__RawFilesBucket"
          value = module.storage.raw_files_bucket_name
        },
        {
          name  = "S3__ProcessedFilesBucket"
          value = module.storage.processed_files_bucket_name
        },
        {
          name  = "S3__ReportsBucket"
          value = module.storage.reports_bucket_name
        },
        {
          name  = "DynamoDB__EventStoreTable"
          value = module.database.event_store_table_name
        },
        {
          name  = "DynamoDB__ValidationCacheTable"
          value = module.database.validation_cache_table_name
        }
      ]

      secrets = [
        {
          name      = "DatabaseCatalog__Password"
          valueFrom = "${module.security.db_master_password_secret_arn}:password::"
        },
        {
          name      = "AzureAd__TenantId"
          valueFrom = "${module.security.azure_ad_secret_arn}:tenantId::"
        },
        {
          name      = "AzureAd__ClientId"
          valueFrom = "${module.security.azure_ad_secret_arn}:clientId::"
        },
        {
          name      = "AzureAd__Audience"
          valueFrom = "${module.security.azure_ad_secret_arn}:audience::"
        },
        {
          name      = "Redis__AuthToken"
          valueFrom = "arn:aws:secretsmanager:${var.region}:${data.aws_caller_identity.current.account_id}:secret:/hergon/${var.environment}/redis/auth-token"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.api_service.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8080/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name        = "${var.project_name}-api-service-task-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# ============================================================================
# ECS SERVICE - API SERVICE
# ============================================================================

resource "aws_ecs_service" "api" {
  name            = "${var.project_name}-api-service-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api_service.arn
  desired_count   = 3  # Producción: 3 instancias

  launch_type = "FARGATE"

  network_configuration {
    subnets          = module.networking.private_app_subnet_ids
    security_groups  = [module.security.ecs_tasks_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api-service"
    container_port   = 8080
  }

  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 100

    deployment_circuit_breaker {
      enable   = true
      rollback = true
    }
  }

  enable_execute_command = true

  tags = {
    Name        = "${var.project_name}-api-service-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }

  depends_on = [
    aws_lb_listener.https,
    aws_lb_listener.http
  ]
}

# ============================================================================
# AUTO SCALING
# ============================================================================

resource "aws_appautoscaling_target" "api" {
  max_capacity       = 10
  min_capacity       = 3
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# Auto scaling basado en CPU
resource "aws_appautoscaling_policy" "api_cpu" {
  name               = "${var.project_name}-api-cpu-scaling-${var.environment}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension
  service_namespace  = aws_appautoscaling_target.api.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

# Auto scaling basado en memoria
resource "aws_appautoscaling_policy" "api_memory" {
  name               = "${var.project_name}-api-memory-scaling-${var.environment}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension
  service_namespace  = aws_appautoscaling_target.api.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value       = 80.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

# ============================================================================
# SNS & SQS (para mensajería asíncrona)
# ============================================================================

resource "aws_sns_topic" "events" {
  name              = "${var.project_name}-events-${var.environment}"
  display_name      = "Hergon Events Topic"
  kms_master_key_id = module.security.kms_key_arn

  tags = {
    Name        = "${var.project_name}-events-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_sqs_queue" "validation_requests" {
  name                       = "${var.project_name}-validation-requests-${var.environment}"
  delay_seconds              = 0
  max_message_size           = 262144  # 256 KB
  message_retention_seconds  = 1209600 # 14 días
  receive_wait_time_seconds  = 20      # Long polling
  visibility_timeout_seconds = 300     # 5 minutos

  kms_master_key_id                 = module.security.kms_key_arn
  kms_data_key_reuse_period_seconds = 300

  tags = {
    Name        = "${var.project_name}-validation-requests-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_sqs_queue" "validation_requests_dlq" {
  name                      = "${var.project_name}-validation-requests-dlq-${var.environment}"
  message_retention_seconds = 1209600 # 14 días

  kms_master_key_id                 = module.security.kms_key_arn
  kms_data_key_reuse_period_seconds = 300

  tags = {
    Name        = "${var.project_name}-validation-requests-dlq-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_sqs_queue_redrive_policy" "validation_requests" {
  queue_url = aws_sqs_queue.validation_requests.id
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.validation_requests_dlq.arn
    maxReceiveCount     = 3
  })
}

# ============================================================================
# CLOUDWATCH ALARMS
# ============================================================================

resource "aws_sns_topic" "alarms" {
  name = "${var.project_name}-alarms-${var.environment}"

  tags = {
    Name        = "${var.project_name}-alarms-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_sns_topic_subscription" "alarms_email" {
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# Alarm: API Service CPU alta
resource "aws_cloudwatch_metric_alarm" "api_cpu_high" {
  alarm_name          = "${var.project_name}-api-cpu-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "API Service CPU utilization is too high"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.api.name
  }
}

# Alarm: RDS CPU alta
resource "aws_cloudwatch_metric_alarm" "rds_cpu_high" {
  alarm_name          = "${var.project_name}-rds-cpu-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "RDS CPU utilization is too high"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    DBInstanceIdentifier = module.database.catalog_db_identifier
  }
}

# Alarm: RDS conexiones
resource "aws_cloudwatch_metric_alarm" "rds_connections_high" {
  alarm_name          = "${var.project_name}-rds-connections-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "180"  # 90% de max_connections (200)
  alarm_description   = "RDS database connections are too high"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    DBInstanceIdentifier = module.database.catalog_db_identifier
  }
}
