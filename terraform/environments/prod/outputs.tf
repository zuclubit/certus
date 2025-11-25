# ============================================================================
# PRODUCTION ENVIRONMENT - OUTPUTS
# ============================================================================

# ============================================================================
# NETWORKING
# ============================================================================

output "vpc_id" {
  description = "ID de la VPC"
  value       = module.networking.vpc_id
}

output "vpc_cidr" {
  description = "CIDR block de la VPC"
  value       = module.networking.vpc_cidr
}

output "public_subnet_ids" {
  description = "IDs de las subnets públicas"
  value       = module.networking.public_subnet_ids
}

output "private_app_subnet_ids" {
  description = "IDs de las subnets privadas de aplicación"
  value       = module.networking.private_app_subnet_ids
}

output "private_db_subnet_ids" {
  description = "IDs de las subnets privadas de base de datos"
  value       = module.networking.private_db_subnet_ids
}

output "nat_gateway_ips" {
  description = "IPs públicas de los NAT Gateways"
  value       = module.networking.nat_gateway_public_ips
}

# ============================================================================
# SECURITY
# ============================================================================

output "kms_key_id" {
  description = "ID de la KMS key"
  value       = module.security.kms_key_id
}

output "alb_security_group_id" {
  description = "ID del Security Group del ALB"
  value       = module.security.alb_security_group_id
}

output "ecs_tasks_security_group_id" {
  description = "ID del Security Group de ECS tasks"
  value       = module.security.ecs_tasks_security_group_id
}

# ============================================================================
# DATABASE
# ============================================================================

output "catalog_db_endpoint" {
  description = "Endpoint de la base de datos Catalog"
  value       = module.database.catalog_db_endpoint
  sensitive   = true
}

output "validation_db_endpoint" {
  description = "Endpoint de la base de datos Validation"
  value       = module.database.validation_db_endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Endpoint de Redis"
  value       = module.database.redis_endpoint
  sensitive   = true
}

output "event_store_table_name" {
  description = "Nombre de la tabla DynamoDB Event Store"
  value       = module.database.event_store_table_name
}

output "validation_cache_table_name" {
  description = "Nombre de la tabla DynamoDB Validation Cache"
  value       = module.database.validation_cache_table_name
}

# ============================================================================
# STORAGE
# ============================================================================

output "raw_files_bucket_name" {
  description = "Nombre del bucket de archivos raw"
  value       = module.storage.raw_files_bucket_name
}

output "processed_files_bucket_name" {
  description = "Nombre del bucket de archivos processed"
  value       = module.storage.processed_files_bucket_name
}

output "reports_bucket_name" {
  description = "Nombre del bucket de reportes"
  value       = module.storage.reports_bucket_name
}

output "backups_bucket_name" {
  description = "Nombre del bucket de backups"
  value       = module.storage.backups_bucket_name
}

# ============================================================================
# ECS
# ============================================================================

output "ecs_cluster_name" {
  description = "Nombre del cluster ECS"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ARN del cluster ECS"
  value       = aws_ecs_cluster.main.arn
}

output "api_service_name" {
  description = "Nombre del servicio ECS de API"
  value       = aws_ecs_service.api.name
}

# ============================================================================
# LOAD BALANCER
# ============================================================================

output "alb_dns_name" {
  description = "DNS name del Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "alb_arn" {
  description = "ARN del Application Load Balancer"
  value       = aws_lb.main.arn
}

output "alb_zone_id" {
  description = "Zone ID del Application Load Balancer (para Route 53)"
  value       = aws_lb.main.zone_id
}

# ============================================================================
# MESSAGING
# ============================================================================

output "sns_events_topic_arn" {
  description = "ARN del SNS topic de eventos"
  value       = aws_sns_topic.events.arn
}

output "sqs_validation_requests_url" {
  description = "URL de la cola SQS de validation requests"
  value       = aws_sqs_queue.validation_requests.url
}

# ============================================================================
# MONITORING
# ============================================================================

output "alarms_topic_arn" {
  description = "ARN del SNS topic de alarmas"
  value       = aws_sns_topic.alarms.arn
}

# ============================================================================
# CONNECTION INFO (para aplicaciones)
# ============================================================================

output "application_config" {
  description = "Configuración para aplicaciones (usar con cuidado, contiene info sensible)"
  value = {
    environment = var.environment
    region      = var.region

    database = {
      catalog_endpoint   = module.database.catalog_db_endpoint
      validation_endpoint = module.database.validation_db_endpoint
      catalog_name       = module.database.catalog_db_name
      validation_name    = module.database.validation_db_name
    }

    redis = {
      endpoint = module.database.redis_endpoint
      port     = module.database.redis_port
    }

    s3 = {
      raw_files       = module.storage.raw_files_bucket_name
      processed_files = module.storage.processed_files_bucket_name
      reports         = module.storage.reports_bucket_name
      backups         = module.storage.backups_bucket_name
    }

    dynamodb = {
      event_store       = module.database.event_store_table_name
      validation_cache  = module.database.validation_cache_table_name
    }

    messaging = {
      sns_events_topic       = aws_sns_topic.events.arn
      sqs_validation_requests = aws_sqs_queue.validation_requests.url
    }

    load_balancer = {
      dns_name = aws_lb.main.dns_name
    }
  }
  sensitive = true
}

# ============================================================================
# SUMMARY
# ============================================================================

output "deployment_summary" {
  description = "Resumen del deployment"
  value = {
    environment        = var.environment
    region             = var.region
    vpc_id             = module.networking.vpc_id
    ecs_cluster        = aws_ecs_cluster.main.name
    alb_dns            = aws_lb.main.dns_name
    database_endpoints = {
      catalog    = module.database.catalog_db_endpoint
      validation = module.database.validation_db_endpoint
      redis      = module.database.redis_endpoint
    }
    s3_buckets = {
      raw_files       = module.storage.raw_files_bucket_name
      processed_files = module.storage.processed_files_bucket_name
      reports         = module.storage.reports_bucket_name
      backups         = module.storage.backups_bucket_name
    }
  }
}
