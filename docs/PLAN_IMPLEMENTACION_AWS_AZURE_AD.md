# PLAN DE IMPLEMENTACIÓN: AWS + AZURE AD
## Arquitectura Híbrida para Hergon-Vector01

**Fecha:** 20 Noviembre 2025
**Decisión:** Infraestructura AWS + Autenticación Azure AD
**Objetivo:** Best of both worlds - Costo optimizado + SSO enterprise

---

## DECISIÓN ESTRATÉGICA

### ✅ Por Qué Esta Arquitectura es BRILLANTE

**Infraestructura en AWS:**
- 15-20% más barato ($3,800/año ahorro)
- Graviton4 (40% mejor precio-performance)
- Lambda SnapStart (cold start 200ms)
- Mayor cobertura Latinoamérica

**Autenticación en Azure AD:**
- AFOREs ya tienen Azure AD (no crear identities desde cero)
- SSO enterprise (Single Sign-On)
- Multi-Factor Authentication nativo
- Compliance y auditoría enterprise
- Conditional Access policies
- Zero costo (AFOREs ya lo pagan)

**Resultado:**
- Ahorro en infra (AWS)
- Enterprise auth sin costo adicional (Azure AD)
- Mejor experiencia usuario (SSO)
- Compliance automático (Azure AD ya certificado)

---

## ARQUITECTURA HÍBRIDA AWS + AZURE AD

### Diagrama de Alto Nivel

```
┌──────────────────────────────────────────────────────────────────┐
│                    USUARIOS FINALES (AFOREs)                      │
│   • Analistas Contables                                           │
│   • Supervisores                                                  │
│   • Administradores                                               │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ 1. Login redirect
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│              AZURE AD B2C / ENTRA ID (Microsoft)                  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Tenant: hergon.onmicrosoft.com                             │ │
│  │                                                              │ │
│  │  • OAuth 2.0 / OpenID Connect                               │ │
│  │  • Multi-Factor Authentication (MFA)                        │ │
│  │  • Conditional Access (IP, device, location)                │ │
│  │  • B2B Collaboration (invitar usuarios AFORE)               │ │
│  │                                                              │ │
│  │  Custom Claims:                                              │ │
│  │    - aforeId: 544                                           │ │
│  │    - fondoId: 1980                                          │ │
│  │    - role: [Analista, Supervisor, Admin]                   │ │
│  │    - country: MX                                            │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ 2. JWT Token (signed)
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                       AWS CLOUD (mx-central-1)                    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  AMAZON COGNITO (Identity Federation)                      │  │
│  │  • Identity Pool (federated with Azure AD)                 │  │
│  │  • Map Azure AD roles → AWS IAM roles                      │  │
│  │  • Session management                                      │  │
│  └────────────────────────┬───────────────────────────────────┘  │
│                           │                                       │
│                           │ 3. AWS credentials                    │
│                           ▼                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  AMAZON API GATEWAY (HTTP API)                             │  │
│  │  • JWT Authorizer (validates Azure AD token)               │  │
│  │  • Custom authorizer (claims validation)                   │  │
│  │  • Rate limiting per aforeId                               │  │
│  └────────────────────────┬───────────────────────────────────┘  │
│                           │                                       │
│                           │ 4. Authenticated request              │
│         ┌─────────────────┴─────────────────┐                    │
│         ▼                                   ▼                    │
│  ┌──────────────────┐             ┌──────────────────┐          │
│  │  ECS FARGATE     │             │  LAMBDA          │          │
│  │  (Graviton4)     │             │  (Graviton4)     │          │
│  │                  │             │                  │          │
│  │  • API Service   │             │  • Validators    │          │
│  │  • Worker Svc    │             │  • Parser        │          │
│  │                  │             │  • Reports       │          │
│  │  Context:        │             │                  │          │
│  │    userId        │             │  Context:        │          │
│  │    aforeId       │             │    userId        │          │
│  │    role          │             │    aforeId       │          │
│  └──────────────────┘             └──────────────────┘          │
│         │                                   │                    │
│         └─────────────────┬─────────────────┘                    │
│                           ▼                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  DATA LAYER (RDS, DynamoDB, S3)                            │  │
│  │  • Row-Level Security por aforeId                          │  │
│  │  • Audit log incluye userId de Azure AD                    │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Flujo de Autenticación Completo

```
PASO 1: Usuario accede a app
  User → https://app.hergon.com

PASO 2: Redirect a Azure AD
  App → https://login.microsoftonline.com/hergon.onmicrosoft.com

PASO 3: Login Azure AD (con MFA si configurado)
  User → Ingresa credenciales + MFA code

PASO 4: Azure AD emite JWT
  Azure AD → JWT Token con claims:
  {
    "sub": "juan.perez@afore544.com",
    "email": "juan.perez@afore544.com",
    "name": "Juan Pérez",
    "aforeId": "544",
    "fondoIds": ["1980", "1981"],
    "role": "Analista",
    "country": "MX"
  }

PASO 5: App recibe token y llama AWS
  App → API Gateway con Authorization: Bearer <JWT>

PASO 6: API Gateway valida token
  API Gateway → Verifica:
    - Signature (Azure AD public keys)
    - Expiration
    - Issuer (hergon.onmicrosoft.com)
    - Audience

PASO 7: Request autorizado llega a backend
  Backend (Fargate/Lambda) → Recibe context:
    userId, aforeId, role, etc.

PASO 8: Backend aplica Row-Level Security
  SQL Query → WHERE aforeId = :aforeId
  (del token, no user input)
```

---

## COMPONENTES DE LA ARQUITECTURA

### 1. Azure AD Configuration

**Recursos necesarios en Azure:**

```yaml
Azure AD Tenant:
  Name: hergon.onmicrosoft.com
  Type: B2C (Business to Customer)
  Costo: $0 (hasta 50,000 MAU)

App Registration:
  Name: hergon-api-production
  Redirect URIs:
    - https://app.hergon.com/auth/callback
    - http://localhost:3000/auth/callback (dev)

  Token Configuration:
    - Optional Claims:
      - email
      - given_name
      - family_name
      - upn
    - Custom Claims (via claims mapping):
      - aforeId (from user profile extension)
      - fondoIds (from user profile extension)
      - role (from Azure AD groups)
      - country

  API Permissions:
    - Microsoft Graph: User.Read
    - Microsoft Graph: GroupMember.Read.All

  Certificates & Secrets:
    - Client Secret (para server-to-server)
    - Expires: 24 months
    - Stored in: AWS Secrets Manager
```

**Azure AD Groups (para roles):**

```
hergon-afore-analista
├─ Members: Analistas contables
└─ Claim: role=Analista

hergon-afore-supervisor
├─ Members: Supervisores
└─ Claim: role=Supervisor

hergon-afore-admin
├─ Members: Administradores de sistema
└─ Claim: role=Admin

hergon-afore-544
├─ Members: Usuarios de AFORE 544
└─ Claim: aforeId=544
```

### 2. AWS Infrastructure (Completa)

**Region:** mx-central-1 (México Central)

#### Networking

```hcl
# VPC
resource "aws_vpc" "hergon_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "hergon-vpc-prod"
    Environment = "production"
    Project     = "hergon-vector01"
  }
}

# Subnets (3 AZs para HA)
resource "aws_subnet" "public" {
  count             = 3
  vpc_id            = aws_vpc.hergon_vpc.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  map_public_ip_on_launch = true

  tags = {
    Name = "hergon-public-${count.index + 1}"
    Tier = "Public"
  }
}

resource "aws_subnet" "private" {
  count             = 3
  vpc_id            = aws_vpc.hergon_vpc.id
  cidr_block        = "10.0.${count.index + 11}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "hergon-private-${count.index + 1}"
    Tier = "Private"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.hergon_vpc.id

  tags = {
    Name = "hergon-igw"
  }
}

# NAT Gateways (1 por AZ para HA)
resource "aws_eip" "nat" {
  count  = 3
  domain = "vpc"

  tags = {
    Name = "hergon-nat-eip-${count.index + 1}"
  }
}

resource "aws_nat_gateway" "nat" {
  count         = 3
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "hergon-nat-${count.index + 1}"
  }
}
```

#### Security Groups

```hcl
# ALB Security Group
resource "aws_security_group" "alb" {
  name_description = "hergon-alb-sg"
  vpc_id           = aws_vpc.hergon_vpc.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS from internet"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "hergon-alb-sg"
  }
}

# Fargate Tasks Security Group
resource "aws_security_group" "fargate_tasks" {
  name_description = "hergon-fargate-tasks-sg"
  vpc_id           = aws_vpc.hergon_vpc.id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    description     = "From ALB"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "hergon-fargate-tasks-sg"
  }
}

# RDS Security Group
resource "aws_security_group" "rds" {
  name_description = "hergon-rds-sg"
  vpc_id           = aws_vpc.hergon_vpc.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [
      aws_security_group.fargate_tasks.id,
      aws_security_group.lambda.id
    ]
    description = "PostgreSQL from Fargate and Lambda"
  }

  tags = {
    Name = "hergon-rds-sg"
  }
}
```

#### API Gateway

```hcl
resource "aws_apigatewayv2_api" "hergon_api" {
  name          = "hergon-api-prod"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = [
      "https://app.hergon.com",
      "http://localhost:3000"
    ]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Authorization", "Content-Type"]
    max_age       = 300
  }

  tags = {
    Name        = "hergon-api-prod"
    Environment = "production"
  }
}

# JWT Authorizer (Azure AD)
resource "aws_apigatewayv2_authorizer" "azure_ad" {
  api_id           = aws_apigatewayv2_api.hergon_api.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "azure-ad-authorizer"

  jwt_configuration {
    audience = ["api://hergon-api-production"]
    issuer   = "https://login.microsoftonline.com/${var.azure_tenant_id}/v2.0"
  }
}

# Integration with ALB
resource "aws_apigatewayv2_integration" "fargate" {
  api_id             = aws_apigatewayv2_api.hergon_api.id
  integration_type   = "HTTP_PROXY"
  integration_uri    = aws_lb_listener.fargate_https.arn
  integration_method = "ANY"
  connection_type    = "VPC_LINK"
  connection_id      = aws_apigatewayv2_vpc_link.hergon.id
}

# Routes
resource "aws_apigatewayv2_route" "files" {
  api_id             = aws_apigatewayv2_api.hergon_api.id
  route_key          = "ANY /api/v1/files/{proxy+}"
  target             = "integrations/${aws_apigatewayv2_integration.fargate.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.azure_ad.id
}

# Stage
resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.hergon_api.id
  name        = "prod"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
      error          = "$context.error.message"
      integrationError = "$context.integrationErrorMessage"
    })
  }

  default_route_settings {
    throttling_burst_limit = 5000
    throttling_rate_limit  = 2000
  }
}
```

#### ECS Fargate (Graviton4)

```hcl
# ECS Cluster
resource "aws_ecs_cluster" "hergon" {
  name = "hergon-cluster-prod"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  configuration {
    execute_command_configuration {
      logging = "OVERRIDE"
      log_configuration {
        cloud_watch_log_group_name = aws_cloudwatch_log_group.ecs_exec.name
      }
    }
  }

  tags = {
    Name        = "hergon-cluster-prod"
    Environment = "production"
  }
}

# Task Definition (API Service)
resource "aws_ecs_task_definition" "api_service" {
  family                   = "hergon-api-service"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "1024"  # 1 vCPU
  memory                   = "2048"  # 2 GB
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  # Graviton4 (arm64)
  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }

  container_definitions = jsonencode([{
    name      = "api-service"
    image     = "${aws_ecr_repository.api_service.repository_url}:latest"
    essential = true

    portMappings = [{
      containerPort = 8080
      protocol      = "tcp"
    }]

    environment = [
      { name = "ASPNETCORE_ENVIRONMENT", value = "Production" },
      { name = "ASPNETCORE_URLS", value = "http://+:8080" },
      { name = "AWS_REGION", value = "mx-central-1" }
    ]

    secrets = [
      {
        name      = "ConnectionStrings__CatalogDb"
        valueFrom = "${aws_secretsmanager_secret.catalog_db.arn}:connectionString::"
      },
      {
        name      = "AzureAd__ClientSecret"
        valueFrom = "${aws_secretsmanager_secret.azure_ad.arn}:clientSecret::"
      }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.api_service.name
        "awslogs-region"        = "mx-central-1"
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
  }])

  tags = {
    Name        = "hergon-api-service"
    Environment = "production"
  }
}

# ECS Service (API)
resource "aws_ecs_service" "api_service" {
  name            = "hergon-api-service"
  cluster         = aws_ecs_cluster.hergon.id
  task_definition = aws_ecs_task_definition.api_service.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.fargate_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api_service.arn
    container_name   = "api-service"
    container_port   = 8080
  }

  # Auto-scaling
  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 100
  }

  enable_execute_command = true

  tags = {
    Name        = "hergon-api-service"
    Environment = "production"
  }
}

# Auto-scaling
resource "aws_appautoscaling_target" "api_service" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.hergon.name}/${aws_ecs_service.api_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "api_service_cpu" {
  name               = "api-service-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api_service.resource_id
  scalable_dimension = aws_appautoscaling_target.api_service.scalable_dimension
  service_namespace  = aws_appautoscaling_target.api_service.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = 70.0

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}
```

#### Lambda Functions (Graviton4)

```hcl
# Lambda Function (Validator)
resource "aws_lambda_function" "validator" {
  function_name = "hergon-validator-${var.validation_id}"
  role          = aws_iam_role.lambda_exec.arn

  # Graviton4 (arm64)
  architectures = ["arm64"]

  # .NET 8 runtime
  runtime = "dotnet8"
  handler = "Hergon.Validators::Hergon.Validators.Function::FunctionHandler"

  filename         = "validator-${var.validation_id}.zip"
  source_code_hash = filebase64sha256("validator-${var.validation_id}.zip")

  memory_size = 512
  timeout     = 300  # 5 min max

  # SnapStart enabled (cold start optimization)
  snap_start {
    apply_on = "PublishedVersions"
  }

  environment {
    variables = {
      ASPNETCORE_ENVIRONMENT = "Production"
      AWS_REGION             = "mx-central-1"
      VALIDATION_ID          = var.validation_id
    }
  }

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  # Reserv concurrency for critical validators
  reserved_concurrent_executions = var.is_critical ? 10 : -1

  tags = {
    Name        = "hergon-validator-${var.validation_id}"
    Environment = "production"
    ValidationId = var.validation_id
  }
}

# SQS Trigger
resource "aws_lambda_event_source_mapping" "validator_queue" {
  event_source_arn = aws_sqs_queue.validation_queue.arn
  function_name    = aws_lambda_function.validator.arn

  batch_size                         = 10
  maximum_batching_window_in_seconds = 5

  scaling_config {
    maximum_concurrency = 100
  }
}
```

#### RDS PostgreSQL (Graviton4)

```hcl
# DB Subnet Group
resource "aws_db_subnet_group" "hergon" {
  name       = "hergon-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "hergon-db-subnet-group"
  }
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "catalog" {
  identifier = "hergon-catalog-db-prod"

  # Graviton4 (db.r7g)
  engine         = "postgres"
  engine_version = "16.1"
  instance_class = "db.r7g.large"  # 2 vCPU, 16 GB RAM, Graviton4

  allocated_storage     = 100
  max_allocated_storage = 1000  # Auto-scaling hasta 1TB
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id            = aws_kms_key.rds.arn

  db_name  = "catalogdb"
  username = "hergon_admin"
  password = random_password.rds_password.result

  # High Availability
  multi_az               = true
  db_subnet_group_name   = aws_db_subnet_group.hergon.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  # Backup
  backup_retention_period = 35  # 35 días
  backup_window           = "03:00-04:00"  # 3-4 AM Mexico time
  maintenance_window      = "sun:04:00-sun:05:00"

  # Performance Insights
  performance_insights_enabled    = true
  performance_insights_kms_key_id = aws_kms_key.rds.arn
  performance_insights_retention_period = 7

  # Monitoring
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  monitoring_interval             = 60
  monitoring_role_arn             = aws_iam_role.rds_monitoring.arn

  # Deletion protection
  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "hergon-catalog-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  tags = {
    Name        = "hergon-catalog-db-prod"
    Environment = "production"
    Database    = "CatalogDB"
  }
}

# Read Replica
resource "aws_db_instance" "catalog_replica" {
  identifier = "hergon-catalog-db-replica"

  replicate_source_db = aws_db_instance.catalog.identifier
  instance_class      = "db.r7g.large"

  publicly_accessible = false

  tags = {
    Name        = "hergon-catalog-db-replica"
    Environment = "production"
    Type        = "ReadReplica"
  }
}
```

#### DynamoDB (Event Store)

```hcl
resource "aws_dynamodb_table" "event_store" {
  name           = "hergon-event-store-prod"
  billing_mode   = "PAY_PER_REQUEST"  # On-demand
  hash_key       = "PK"  # Partition key: streamId
  range_key      = "SK"  # Sort key: eventId

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"  # aforeId
    type = "S"
  }

  attribute {
    name = "GSI1SK"  # timestamp
    type = "S"
  }

  attribute {
    name = "eventType"
    type = "S"
  }

  # GSI para queries por AFORE
  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  # GSI para queries por tipo de evento
  global_secondary_index {
    name            = "EventTypeIndex"
    hash_key        = "eventType"
    range_key       = "SK"
    projection_type = "INCLUDE"
    non_key_attributes = ["timestamp", "aforeId"]
  }

  # DynamoDB Streams (para projections)
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  # Point-in-time recovery
  point_in_time_recovery {
    enabled = true
  }

  # Encryption
  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.dynamodb.arn
  }

  # TTL for old events (optional)
  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = {
    Name        = "hergon-event-store-prod"
    Environment = "production"
  }
}

# Stream processor (Lambda)
resource "aws_lambda_function" "event_projector" {
  function_name = "hergon-event-projector"
  role          = aws_iam_role.lambda_exec.arn

  architectures = ["arm64"]
  runtime       = "dotnet8"
  handler       = "Hergon.EventProjector::Hergon.EventProjector.Function::FunctionHandler"

  filename         = "event-projector.zip"
  source_code_hash = filebase64sha256("event-projector.zip")

  memory_size = 1024
  timeout     = 60

  environment {
    variables = {
      CATALOG_DB_SECRET_ARN = aws_secretsmanager_secret.catalog_db.arn
    }
  }

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }
}

resource "aws_lambda_event_source_mapping" "dynamodb_stream" {
  event_source_arn  = aws_dynamodb_table.event_store.stream_arn
  function_name     = aws_lambda_function.event_projector.arn
  starting_position = "LATEST"

  batch_size                         = 100
  maximum_batching_window_in_seconds = 5
  parallelization_factor             = 10

  filter_criteria {
    filter {
      pattern = jsonencode({
        eventName = ["INSERT", "MODIFY"]
      })
    }
  }
}
```

---

## INTEGRACIÓN AWS ↔ AZURE AD

### Configuración Step-by-Step

#### PASO 1: Setup Azure AD App Registration

```bash
# 1. Create Azure AD B2C Tenant
az ad b2c tenant create \
  --name hergon \
  --domain-name hergon.onmicrosoft.com \
  --country-code MX \
  --location "Mexico Central"

# 2. Register Application
az ad app create \
  --display-name "Hergon API Production" \
  --sign-in-audience "AzureADandPersonalMicrosoftAccount" \
  --web-redirect-uris \
    "https://api.hergon.com/auth/callback" \
    "http://localhost:3000/auth/callback" \
  --identifier-uris "api://hergon-api-production"

# 3. Create Client Secret
az ad app credential reset \
  --id <app-id> \
  --append \
  --display-name "AWS Integration Secret" \
  --years 2

# Output:
# {
#   "appId": "12345678-1234-1234-1234-123456789012",
#   "password": "abc123~xyz789",
#   "tenant": "hergon.onmicrosoft.com"
# }

# 4. Configure API Permissions
az ad app permission add \
  --id <app-id> \
  --api 00000003-0000-0000-c000-000000000000 \  # Microsoft Graph
  --api-permissions \
    e1fe6dd8-ba31-4d61-89e7-88639da4683d=Scope \  # User.Read
    62a82d76-70ea-41e2-9197-370581804d09=Role     # GroupMember.Read.All

az ad app permission grant \
  --id <app-id> \
  --api 00000003-0000-0000-c000-000000000000

az ad app permission admin-consent \
  --id <app-id>
```

#### PASO 2: Configure Custom Claims

```javascript
// Azure AD B2C Custom Policy (XML)
<ClaimsProvider>
  <DisplayName>Custom Claims</DisplayName>
  <TechnicalProfiles>
    <TechnicalProfile Id="GetCustomClaims">
      <DisplayName>Get AFORE Custom Claims</DisplayName>
      <Protocol Name="Proprietary" Handler="Web.TPEngine.Providers.RestfulProvider, Web.TPEngine, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null" />
      <Metadata>
        <Item Key="ServiceUrl">https://api.hergon.com/auth/get-user-claims</Item>
        <Item Key="SendClaimsIn">Body</Item>
        <Item Key="AuthenticationType">Bearer</Item>
      </Metadata>
      <InputClaims>
        <InputClaim ClaimTypeReferenceId="objectId" />
        <InputClaim ClaimTypeReferenceId="email" />
      </InputClaims>
      <OutputClaims>
        <OutputClaim ClaimTypeReferenceId="extension_aforeId" />
        <OutputClaim ClaimTypeReferenceId="extension_fondoIds" />
        <OutputClaim ClaimTypeReferenceId="extension_country" />
      </OutputClaims>
    </TechnicalProfile>
  </TechnicalProfiles>
</ClaimsProvider>
```

#### PASO 3: Store Secrets in AWS Secrets Manager

```bash
# Store Azure AD credentials in AWS
aws secretsmanager create-secret \
  --name hergon/azure-ad/prod \
  --description "Azure AD credentials for Hergon production" \
  --secret-string '{
    "tenantId": "12345678-1234-1234-1234-123456789012",
    "clientId": "87654321-4321-4321-4321-210987654321",
    "clientSecret": "abc123~xyz789",
    "issuer": "https://login.microsoftonline.com/hergon.onmicrosoft.com/v2.0",
    "audience": "api://hergon-api-production"
  }' \
  --region mx-central-1

# Output:
# {
#   "ARN": "arn:aws:secretsmanager:mx-central-1:123456789012:secret:hergon/azure-ad/prod-AbCdEf",
#   "Name": "hergon/azure-ad/prod",
#   "VersionId": "12345678-1234-1234-1234-123456789012"
# }
```

#### PASO 4: Configure API Gateway JWT Authorizer

```terraform
resource "aws_apigatewayv2_authorizer" "azure_ad" {
  api_id           = aws_apigatewayv2_api.hergon_api.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "azure-ad-jwt-authorizer"

  jwt_configuration {
    audience = ["api://hergon-api-production"]
    issuer   = "https://login.microsoftonline.com/${data.aws_secretsmanager_secret_version.azure_ad.secret_string["tenantId"]}/v2.0"
  }
}

# Lambda Authorizer (para custom claims validation)
resource "aws_lambda_function" "custom_authorizer" {
  function_name = "hergon-custom-authorizer"
  role          = aws_iam_role.lambda_exec.arn

  architectures = ["arm64"]
  runtime       = "dotnet8"
  handler       = "Hergon.Authorizer::Hergon.Authorizer.Function::FunctionHandler"

  filename         = "custom-authorizer.zip"
  source_code_hash = filebase64sha256("custom-authorizer.zip")

  memory_size = 256
  timeout     = 10

  environment {
    variables = {
      AZURE_AD_SECRET_ARN = data.aws_secretsmanager_secret.azure_ad.arn
      JWKS_URI            = "https://login.microsoftonline.com/common/discovery/v2.0/keys"
    }
  }
}

resource "aws_apigatewayv2_authorizer" "custom" {
  api_id                            = aws_apigatewayv2_api.hergon_api.id
  authorizer_type                   = "REQUEST"
  authorizer_uri                    = aws_lambda_function.custom_authorizer.invoke_arn
  identity_sources                  = ["$request.header.Authorization"]
  name                              = "azure-ad-custom-authorizer"
  authorizer_payload_format_version = "2.0"
  enable_simple_responses           = true
  authorizer_result_ttl_in_seconds  = 300  # Cache 5 min
}
```

#### PASO 5: Backend Code (API Service)

```csharp
// Program.cs - API Service
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Configure Azure AD Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Get Azure AD config from AWS Secrets Manager
        var azureAdConfig = await GetAzureAdConfigFromSecretsManager();

        options.Authority = $"https://login.microsoftonline.com/{azureAdConfig.TenantId}/v2.0";
        options.Audience = azureAdConfig.Audience;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.Zero
        };

        // Map custom claims
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = context =>
            {
                var claims = context.Principal.Claims;

                // Extract custom claims
                var aforeId = claims.FirstOrDefault(c => c.Type == "aforeId")?.Value;
                var role = claims.FirstOrDefault(c => c.Type == "role")?.Value;
                var userId = claims.FirstOrDefault(c => c.Type == "sub")?.Value;

                // Store in HttpContext for use in controllers
                context.HttpContext.Items["AforeId"] = aforeId;
                context.HttpContext.Items["Role"] = role;
                context.HttpContext.Items["UserId"] = userId;

                return Task.CompletedTask;
            }
        };
    });

// Configure Authorization policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAnalista", policy =>
        policy.RequireClaim("role", "Analista", "Supervisor", "Admin"));

    options.AddPolicy("RequireSupervisor", policy =>
        policy.RequireClaim("role", "Supervisor", "Admin"));

    options.AddPolicy("RequireAdmin", policy =>
        policy.RequireClaim("role", "Admin"));
});

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();


// FileController.cs
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]  // Requires Azure AD authentication
public class FilesController : ControllerBase
{
    private readonly IFileService _fileService;

    [HttpPost]
    [Authorize(Policy = "RequireAnalista")]
    public async Task<IActionResult> UploadFile(IFormFile file)
    {
        // Get user context from Azure AD token
        var aforeId = HttpContext.Items["AforeId"]?.ToString();
        var userId = HttpContext.Items["UserId"]?.ToString();
        var role = HttpContext.Items["Role"]?.ToString();

        // Validate user can only upload files for their AFORE
        if (!await _fileService.UserHasAccessToAfore(userId, aforeId))
        {
            return Forbid("User does not have access to this AFORE");
        }

        // Process file upload
        var result = await _fileService.UploadFileAsync(
            file,
            aforeId: int.Parse(aforeId),
            uploadedBy: userId
        );

        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetFiles(
        [FromQuery] int? fondoId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var aforeId = HttpContext.Items["AforeId"]?.ToString();

        // Automatically filter by user's AFORE (Row-Level Security)
        var files = await _fileService.GetFilesAsync(
            aforeId: int.Parse(aforeId),
            fondoId: fondoId,
            startDate: startDate,
            endDate: endDate
        );

        return Ok(files);
    }
}
```

---

## COSTOS DETALLADOS

### Azure AD (Autenticación)

| Concepto | Cantidad | Costo Unitario | Costo Mensual |
|----------|----------|----------------|---------------|
| **Azure AD B2C** | | | |
| Primeros 50,000 MAU | 50,000 | $0 | **$0** |
| MAU adicionales | 0 | $0.00325 | $0 |
| **Total Azure** | | | **$0/mes** |

**MAU (Monthly Active Users):** Usuarios únicos que se autentican en un mes
**Para 2 AFOREs:** ~100-200 usuarios = **GRATIS**

### AWS (Infraestructura)

| Componente | Especificación | Costo/mes |
|------------|----------------|-----------|
| **Compute (Graviton4)** | |
| Fargate (API Service) | 2-10 tasks, 1 vCPU, 2GB | $150 |
| Fargate (Worker) | 2-20 tasks, 1 vCPU, 2GB | $180 |
| Lambda Provisioned (10) | 512MB, 10 concurrent | $85 |
| Lambda On-demand (27) | 512MB, pay-per-use | $30 |
| **Data** | |
| RDS PostgreSQL (r7g.large) | 2 vCPU, 16GB, Multi-AZ | $480 |
| RDS Read Replica | 2 vCPU, 16GB | $240 |
| DynamoDB On-demand | ~10GB, low traffic | $50 |
| ElastiCache Redis (r7g.large) | 1GB, Multi-AZ | $45 |
| S3 Intelligent-Tiering | 1TB, lifecycle | $22 |
| **Integration** | |
| API Gateway HTTP | 10M requests/month | $35 |
| SNS + SQS | 50M messages | $8 |
| EventBridge | 10M events | $10 |
| **Networking** | |
| ALB | 2 LB units | $35 |
| VPC, NAT Gateways | 3 NAT Gateways | $108 |
| CloudFront | 1TB transfer | $85 |
| **Observability** | |
| CloudWatch Logs | 100GB ingestion | $50 |
| CloudWatch Metrics | Custom metrics | $30 |
| X-Ray | 10M traces | $20 |
| **Security** | |
| Secrets Manager | 10 secrets | $4 |
| KMS | 3 keys | $3 |
| **Total AWS** | | **$1,650/mes** |

### Costo Total (AWS + Azure AD)

```
AWS:      $1,650/mes = $19,800/año
Azure AD: $0/mes = $0/año

TOTAL:    $1,650/mes = $19,800/año
```

**Con Savings Plans (1 año):**
```
Compute: -40% = $60 ahorro
RDS:     -45% = $324 ahorro
Total:   $1,266/mes = $15,192/año

AHORRO: $4,608/año (23%)
```

---

## ROADMAP DE IMPLEMENTACIÓN

### FASE 0: Preparación (Semana 1-2)

**Azure AD Setup:**
- [ ] Crear Azure AD B2C tenant
- [ ] Registrar aplicación en Azure AD
- [ ] Configurar custom claims (aforeId, role)
- [ ] Crear grupos de seguridad
- [ ] Configurar MFA
- [ ] Definir Conditional Access policies

**AWS Account Setup:**
- [ ] Crear AWS account (si no existe)
- [ ] Configurar AWS Organizations
- [ ] Setup billing alerts
- [ ] Configurar Cost Explorer
- [ ] Crear IAM roles y policies
- [ ] Setup Secrets Manager

**Herramientas:**
- [ ] Instalar Terraform
- [ ] Configurar AWS CLI
- [ ] Configurar Azure CLI
- [ ] Setup Git repository
- [ ] Configurar VS Code / Rider

### FASE 1: Infraestructura Base (Semana 3-4)

**Terraform - Networking:**
```bash
cd terraform/environments/prod
terraform init
terraform plan -target=module.networking
terraform apply -target=module.networking

# Outputs:
# vpc_id = vpc-12345678
# private_subnet_ids = [subnet-aaa, subnet-bbb, subnet-ccc]
# public_subnet_ids = [subnet-xxx, subnet-yyy, subnet-zzz]
```

**Terraform - Data Layer:**
```bash
terraform plan -target=module.rds
terraform plan -target=module.dynamodb
terraform plan -target=module.elasticache
terraform plan -target=module.s3

terraform apply -target=module.rds
# Wait for RDS to be available (~15 min)

terraform apply -target=module.dynamodb
terraform apply -target=module.elasticache
terraform apply -target=module.s3
```

**Validación:**
```bash
# Test RDS connectivity
psql -h hergon-catalog-db-prod.xxx.mx-central-1.rds.amazonaws.com \
     -U hergon_admin \
     -d catalogdb

# Test DynamoDB
aws dynamodb list-tables --region mx-central-1

# Test S3
aws s3 ls s3://hergon-files-prod/
```

### FASE 2: API Gateway + Auth (Semana 5)

**Terraform - API Gateway:**
```bash
terraform plan -target=module.api_gateway
terraform apply -target=module.api_gateway

# Output:
# api_gateway_url = https://abc123.execute-api.mx-central-1.amazonaws.com/prod
```

**Configure JWT Authorizer:**
```bash
# Store Azure AD config in Secrets Manager
aws secretsmanager create-secret \
  --name hergon/azure-ad/prod \
  --secret-string file://azure-ad-config.json \
  --region mx-central-1

# Test authorizer
curl -X GET https://abc123.execute-api.mx-central-1.amazonaws.com/prod/api/v1/health \
  -H "Authorization: Bearer <azure-ad-token>"
```

**Validación:**
```bash
# 1. Get token from Azure AD
TOKEN=$(curl -X POST https://login.microsoftonline.com/<tenant-id>/oauth2/v2.0/token \
  -d "client_id=<client-id>" \
  -d "client_secret=<client-secret>" \
  -d "scope=api://hergon-api-production/.default" \
  -d "grant_type=client_credentials" \
  | jq -r '.access_token')

# 2. Call API Gateway
curl -X GET https://abc123.execute-api.mx-central-1.amazonaws.com/prod/api/v1/health \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK
```

### FASE 3: Container Images (Semana 6)

**Build API Service:**
```bash
cd src/Hergon.ApiService

# Build for arm64 (Graviton4)
docker build --platform linux/arm64 \
  -t hergon-api-service:latest \
  -f Dockerfile .

# Tag and push to ECR
aws ecr get-login-password --region mx-central-1 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.mx-central-1.amazonaws.com

docker tag hergon-api-service:latest \
  123456789012.dkr.ecr.mx-central-1.amazonaws.com/hergon-api-service:latest

docker push 123456789012.dkr.ecr.mx-central-1.amazonaws.com/hergon-api-service:latest
```

**Build Worker Service:**
```bash
cd src/Hergon.WorkerService

docker build --platform linux/arm64 \
  -t hergon-worker-service:latest \
  -f Dockerfile .

docker tag hergon-worker-service:latest \
  123456789012.dkr.ecr.mx-central-1.amazonaws.com/hergon-worker-service:latest

docker push 123456789012.dkr.ecr.mx-central-1.amazonaws.com/hergon-worker-service:latest
```

### FASE 4: ECS Fargate Deployment (Semana 7)

**Terraform - ECS:**
```bash
terraform plan -target=module.ecs
terraform apply -target=module.ecs

# Wait for tasks to be running (~5 min)
aws ecs list-tasks --cluster hergon-cluster-prod --region mx-central-1

# Check task status
aws ecs describe-tasks \
  --cluster hergon-cluster-prod \
  --tasks <task-arn> \
  --region mx-central-1
```

**Verificación Health Check:**
```bash
# Get ALB DNS
ALB_DNS=$(terraform output -raw alb_dns_name)

# Test health endpoint
curl http://$ALB_DNS/health

# Expected:
# {
#   "status": "Healthy",
#   "version": "1.0.0",
#   "timestamp": "2025-11-20T10:30:00Z"
# }
```

### FASE 5: Lambda Functions (Semana 8-9)

**Deploy Validators:**
```bash
# Build all 37 validators
cd src/Hergon.Validators

for i in {1..37}; do
  dotnet publish -c Release -r linux-arm64 --self-contained \
    -p:ValidationId=$i \
    -o publish/validator-$i

  cd publish/validator-$i
  zip -r ../../validator-$i.zip .
  cd ../..
done

# Deploy via Terraform
terraform plan -target=module.lambda_validators
terraform apply -target=module.lambda_validators
```

**Test Validator:**
```bash
# Invoke validator directly
aws lambda invoke \
  --function-name hergon-validator-1 \
  --payload '{"fileId":"abc-123","validationId":1}' \
  --region mx-central-1 \
  response.json

cat response.json
# {
#   "validationId": 1,
#   "result": "Pass",
#   "duration": 234
# }
```

### FASE 6: Database Schemas (Semana 10)

**Deploy Schema:**
```bash
cd database/migrations

# Run migrations
flyway -url="jdbc:postgresql://hergon-catalog-db-prod.xxx.mx-central-1.rds.amazonaws.com:5432/catalogdb" \
  -user="hergon_admin" \
  -password="$(aws secretsmanager get-secret-value --secret-id hergon/rds/catalog/password --query SecretString --output text)" \
  migrate

# Verify
flyway info
```

**Seed Data:**
```sql
-- Seed validations
INSERT INTO cat_validacion_archivo_consar
  (id_archivo_consar, nombre_validacion, script_validacion, activo)
VALUES
  (1101, 'Longitud Encabezado', 'SELECT ...', true),
  (1101, 'Formato Fecha', 'SELECT ...', true),
  -- ... 35 more
```

### FASE 7: Integration Testing (Semana 11)

**End-to-End Test:**
```bash
# 1. Authenticate with Azure AD
TOKEN=$(./scripts/get-azure-ad-token.sh)

# 2. Upload file
FILE_ID=$(curl -X POST https://api.hergon.com/api/v1/files \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-files/20250804_SB_544_001980.0300" \
  | jq -r '.fileId')

# 3. Check validation status
while true; do
  STATUS=$(curl -X GET https://api.hergon.com/api/v1/files/$FILE_ID \
    -H "Authorization: Bearer $TOKEN" \
    | jq -r '.status')

  if [ "$STATUS" = "Completed" ]; then
    break
  fi

  echo "Status: $STATUS, waiting..."
  sleep 5
done

# 4. Download report
curl -X GET https://api.hergon.com/api/v1/files/$FILE_ID/report \
  -H "Authorization: Bearer $TOKEN" \
  -o report.xlsx
```

### FASE 8: Production Go-Live (Semana 12)

**Pre-Launch Checklist:**
- [ ] Load testing completed (500 archivos/hora)
- [ ] Security audit passed
- [ ] Backup/restore tested
- [ ] Monitoring dashboards configured
- [ ] On-call rotation setup
- [ ] Runbooks documented
- [ ] User training completed
- [ ] Go/No-Go decision meeting

**Launch Day:**
```bash
# 1. Final smoke test
./scripts/smoke-test-prod.sh

# 2. Enable production traffic
terraform apply -var="enable_production=true"

# 3. Monitor dashboards
# - CloudWatch Dashboard
# - X-Ray Service Map
# - Cost Explorer

# 4. Announce to users
# Send email: "Hergon Vector01 is now live!"
```

---

## MONITOREO Y OBSERVABILIDAD

### CloudWatch Dashboards

```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "title": "API Gateway - Requests per Minute",
        "metrics": [
          ["AWS/ApiGateway", "Count", {"stat": "Sum", "period": 60}]
        ],
        "region": "mx-central-1"
      }
    },
    {
      "type": "metric",
      "properties": {
        "title": "Lambda - Validation Duration",
        "metrics": [
          ["AWS/Lambda", "Duration", {"stat": "Average"}],
          [".", ".", {"stat": "p99"}]
        ]
      }
    },
    {
      "type": "metric",
      "properties": {
        "title": "RDS - CPU Utilization",
        "metrics": [
          ["AWS/RDS", "CPUUtilization", {
            "DBInstanceIdentifier": "hergon-catalog-db-prod"
          }]
        ]
      }
    }
  ]
}
```

### Alarmas Críticas

```hcl
# API Gateway 5xx errors
resource "aws_cloudwatch_metric_alarm" "api_5xx" {
  alarm_name          = "hergon-api-5xx-errors-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "API Gateway 5xx errors > 10 in 5 minutes"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

# RDS CPU high
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "hergon-rds-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "RDS CPU > 80% for 10 minutes"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.catalog.id
  }
}

# Lambda errors
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "hergon-lambda-errors-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 60
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Lambda errors > 5 per minute"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
```

---

## SEGURIDAD Y COMPLIANCE

### Security Best Practices Implementadas

✅ **Network Security:**
- Private subnets para compute y data
- NAT Gateways para egress
- Security Groups con least privilege
- No public access a databases

✅ **Identity & Access:**
- Azure AD con MFA obligatorio
- Conditional Access policies
- JWT token validation
- Row-Level Security en base de datos

✅ **Data Protection:**
- Encryption at rest (KMS)
- Encryption in transit (TLS 1.3)
- Secrets en Secrets Manager
- Backup automatizado

✅ **Audit & Compliance:**
- CloudTrail enabled
- VPC Flow Logs
- DynamoDB event sourcing (7 años)
- Immutable S3 objects

### Compliance Checklist

- [ ] SOC 2 Type I (mes 6)
- [ ] ISO 27001 foundation (mes 12)
- [ ] Penetration testing (trimestral)
- [ ] LFPDPPP compliance (México privacy law)
- [ ] CONSAR audit requirements

---

## COSTOS FINALES Y ROI

### TCO (Total Cost of Ownership) Año 1

| Concepto | Costo Anual |
|----------|-------------|
| **Infraestructura AWS** | $15,192 (con Savings Plans) |
| **Azure AD B2C** | $0 |
| **Herramientas** | $3,600 (GitHub, monitoring tools) |
| **Personal (4.5 FTE)** | $216,000 |
| **Otros** | $65,000 (certs, legal, marketing) |
| **TOTAL** | **$299,792** |

### Revenue Proyectado

**Año 1:**
- 2 AFOREs × 5 fondos × $7,500/año = **$75,000**
- Pérdida: -$224,792

**Año 2:**
- 6 AFOREs × 5 fondos × $7,500/año = **$225,000**
- Pérdida: -$74,792

**Año 3:**
- 12 AFOREs × 6 fondos × $7,500/año = **$540,000**
- **Profit: $240,208**

**Break-even: Mes 22** (con 9-10 AFOREs)

---

## PRÓXIMOS PASOS

¿Qué necesitas que genere ahora?

1. **Terraform completo** (todos los módulos listos para deploy)
2. **Scripts de deployment** (deploy.sh, rollback.sh)
3. **Código .NET ejemplo** (API Service con Azure AD)
4. **Database migrations** (Flyway SQL scripts)
5. **CI/CD pipeline** (GitHub Actions workflow)
6. **Runbooks operacionales** (incident response, DR procedures)
7. **Cost calculator** (Excel con tu volumetría)
8. **Onboarding guide** (para nuevas AFOREs)

**Recomiendo empezar con: #1 Terraform completo** para que puedas validar costos reales antes de full commit.
