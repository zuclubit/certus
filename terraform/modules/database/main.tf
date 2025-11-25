# ============================================================================
# DATABASE MODULE - RDS PostgreSQL, DynamoDB, ElastiCache Redis
# ============================================================================

# ============================================================================
# RDS POSTGRESQL - DB SUBNET GROUP
# ============================================================================

resource "aws_db_subnet_group" "main" {
  name_prefix = "${var.project_name}-db-subnet-"
  description = "DB Subnet Group for RDS instances"
  subnet_ids  = var.private_db_subnet_ids

  tags = {
    Name        = "${var.project_name}-db-subnet-group-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ============================================================================
# RDS POSTGRESQL - PARAMETER GROUP
# ============================================================================

resource "aws_db_parameter_group" "postgres" {
  name_prefix = "${var.project_name}-postgres16-"
  family      = "postgres16"
  description = "Custom parameter group for PostgreSQL 16 - Hergon ${var.environment}"

  # Performance tuning
  parameter {
    name  = "shared_buffers"
    value = var.environment == "prod" ? "8388608" : "2097152" # 8GB prod, 2GB staging (en 8KB pages)
  }

  parameter {
    name  = "effective_cache_size"
    value = var.environment == "prod" ? "25165824" : "3145728" # 24GB prod, 3GB staging
  }

  parameter {
    name  = "maintenance_work_mem"
    value = var.environment == "prod" ? "2097152" : "524288" # 2GB prod, 512MB staging (en KB)
  }

  parameter {
    name  = "work_mem"
    value = var.environment == "prod" ? "52428" : "16384" # 50MB prod, 16MB staging (en KB)
  }

  # Logging
  parameter {
    name  = "log_statement"
    value = var.environment == "prod" ? "ddl" : "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = var.environment == "prod" ? "1000" : "500" # Log queries > 1s prod, > 500ms staging
  }

  # Connection settings
  parameter {
    name  = "max_connections"
    value = var.environment == "prod" ? "200" : "50"
  }

  tags = {
    Name        = "${var.project_name}-postgres16-params-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ============================================================================
# RDS POSTGRESQL - CATALOG DATABASE (Main transactional DB)
# ============================================================================

resource "aws_db_instance" "catalog" {
  identifier     = "${var.project_name}-catalog-db-${var.environment}"
  engine         = "postgres"
  engine_version = "16.1"

  # Instance class (Graviton4 ARM64)
  instance_class = var.environment == "prod" ? "db.r7g.large" : "db.t4g.medium"

  # Storage
  allocated_storage     = var.environment == "prod" ? 100 : 20
  max_allocated_storage = var.environment == "prod" ? 500 : 100
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id            = var.kms_key_arn
  iops                  = var.environment == "prod" ? 3000 : null
  storage_throughput    = var.environment == "prod" ? 125 : null

  # Credentials
  db_name  = "hergon_catalog"
  username = "hergon_admin"
  password = var.db_master_password

  # Network & Security
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.rds_security_group_id]
  publicly_accessible    = false
  port                   = 5432

  # High Availability
  multi_az               = var.environment == "prod" ? true : false
  availability_zone      = var.environment == "prod" ? null : var.availability_zones[0]

  # Backup & Maintenance
  backup_retention_period   = var.environment == "prod" ? 30 : 7
  backup_window             = "03:00-04:00"
  maintenance_window        = "sun:04:00-sun:05:00"
  delete_automated_backups  = var.environment == "prod" ? false : true
  skip_final_snapshot       = var.environment == "prod" ? false : true
  final_snapshot_identifier = var.environment == "prod" ? "${var.project_name}-catalog-final-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  # Performance & Monitoring
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  performance_insights_enabled    = true
  performance_insights_retention_period = var.environment == "prod" ? 7 : 7
  performance_insights_kms_key_id = var.kms_key_arn
  monitoring_interval             = var.environment == "prod" ? 60 : 0
  monitoring_role_arn             = var.environment == "prod" ? aws_iam_role.rds_monitoring[0].arn : null

  # Parameter and option groups
  parameter_group_name = aws_db_parameter_group.postgres.name

  # Auto minor version upgrade
  auto_minor_version_upgrade = true

  # Deletion protection
  deletion_protection = var.environment == "prod" ? true : false

  tags = {
    Name        = "${var.project_name}-catalog-db-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
    Database    = "catalog"
    Purpose     = "Transactional database for AFORE catalogs, users, files metadata"
  }

  lifecycle {
    ignore_changes = [
      password,
      final_snapshot_identifier
    ]
  }
}

# ============================================================================
# RDS POSTGRESQL - VALIDATION DATABASE (Read-heavy queries)
# ============================================================================

resource "aws_db_instance" "validation" {
  identifier     = "${var.project_name}-validation-db-${var.environment}"
  engine         = "postgres"
  engine_version = "16.1"

  # Instance class (Graviton4 ARM64)
  instance_class = var.environment == "prod" ? "db.r7g.xlarge" : "db.t4g.medium"

  # Storage
  allocated_storage     = var.environment == "prod" ? 200 : 30
  max_allocated_storage = var.environment == "prod" ? 1000 : 100
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id            = var.kms_key_arn
  iops                  = var.environment == "prod" ? 3000 : null
  storage_throughput    = var.environment == "prod" ? 125 : null

  # Credentials
  db_name  = "hergon_validation"
  username = "hergon_admin"
  password = var.db_master_password

  # Network & Security
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.rds_security_group_id]
  publicly_accessible    = false
  port                   = 5432

  # High Availability
  multi_az               = var.environment == "prod" ? true : false
  availability_zone      = var.environment == "prod" ? null : var.availability_zones[0]

  # Backup & Maintenance
  backup_retention_period   = var.environment == "prod" ? 30 : 7
  backup_window             = "03:00-04:00"
  maintenance_window        = "sun:04:00-sun:05:00"
  delete_automated_backups  = var.environment == "prod" ? false : true
  skip_final_snapshot       = var.environment == "prod" ? false : true
  final_snapshot_identifier = var.environment == "prod" ? "${var.project_name}-validation-final-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  # Performance & Monitoring
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  performance_insights_enabled    = true
  performance_insights_retention_period = var.environment == "prod" ? 7 : 7
  performance_insights_kms_key_id = var.kms_key_arn
  monitoring_interval             = var.environment == "prod" ? 60 : 0
  monitoring_role_arn             = var.environment == "prod" ? aws_iam_role.rds_monitoring[0].arn : null

  # Parameter and option groups
  parameter_group_name = aws_db_parameter_group.postgres.name

  # Auto minor version upgrade
  auto_minor_version_upgrade = true

  # Deletion protection
  deletion_protection = var.environment == "prod" ? true : false

  tags = {
    Name        = "${var.project_name}-validation-db-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
    Database    = "validation"
    Purpose     = "Validation rules, execution results, regulatory data"
  }

  lifecycle {
    ignore_changes = [
      password,
      final_snapshot_identifier
    ]
  }
}

# ============================================================================
# RDS MONITORING IAM ROLE
# ============================================================================

resource "aws_iam_role" "rds_monitoring" {
  count = var.environment == "prod" ? 1 : 0

  name_prefix = "${var.project_name}-rds-monitoring-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-rds-monitoring-role-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  count = var.environment == "prod" ? 1 : 0

  role       = aws_iam_role.rds_monitoring[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# ============================================================================
# DYNAMODB - EVENT STORE (Immutable audit log)
# ============================================================================

resource "aws_dynamodb_table" "event_store" {
  name         = "${var.project_name}-event-store-${var.environment}"
  billing_mode = "PAY_PER_REQUEST" # On-demand para flexibilidad

  hash_key  = "aggregateId"
  range_key = "eventTimestamp"

  attribute {
    name = "aggregateId"
    type = "S"
  }

  attribute {
    name = "eventTimestamp"
    type = "S"
  }

  attribute {
    name = "eventType"
    type = "S"
  }

  attribute {
    name = "aforeId"
    type = "S"
  }

  # GSI para buscar por tipo de evento
  global_secondary_index {
    name            = "EventTypeIndex"
    hash_key        = "eventType"
    range_key       = "eventTimestamp"
    projection_type = "ALL"
  }

  # GSI para buscar por AFORE
  global_secondary_index {
    name            = "AforeIndex"
    hash_key        = "aforeId"
    range_key       = "eventTimestamp"
    projection_type = "ALL"
  }

  # TTL para compliance (7 años = 2555 días)
  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  # Point-in-time recovery para producción
  point_in_time_recovery {
    enabled = var.environment == "prod" ? true : false
  }

  # Server-side encryption
  server_side_encryption {
    enabled     = true
    kms_key_arn = var.kms_key_arn
  }

  # Stream para Event Sourcing
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  tags = {
    Name        = "${var.project_name}-event-store-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Immutable event store for audit trail (7 years retention)"
  }
}

# ============================================================================
# DYNAMODB - VALIDATION CACHE (Fast lookups)
# ============================================================================

resource "aws_dynamodb_table" "validation_cache" {
  name         = "${var.project_name}-validation-cache-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "cacheKey"
  range_key = "version"

  attribute {
    name = "cacheKey"
    type = "S"
  }

  attribute {
    name = "version"
    type = "N"
  }

  # TTL para expiración automática de cache (24 horas)
  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  # Point-in-time recovery para producción
  point_in_time_recovery {
    enabled = var.environment == "prod" ? true : false
  }

  # Server-side encryption
  server_side_encryption {
    enabled     = true
    kms_key_arn = var.kms_key_arn
  }

  tags = {
    Name        = "${var.project_name}-validation-cache-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Cache for validation results (24h TTL)"
  }
}

# ============================================================================
# ELASTICACHE REDIS - SESSION & CACHE
# ============================================================================

# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-redis-subnet-${var.environment}"
  subnet_ids = var.private_db_subnet_ids

  tags = {
    Name        = "${var.project_name}-redis-subnet-group-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# ElastiCache Parameter Group
resource "aws_elasticache_parameter_group" "redis" {
  name_prefix = "${var.project_name}-redis7-"
  family      = "redis7"
  description = "Custom parameter group for Redis 7 - Hergon ${var.environment}"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  parameter {
    name  = "timeout"
    value = "300"
  }

  tags = {
    Name        = "${var.project_name}-redis7-params-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ElastiCache Replication Group
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "${var.project_name}-redis-${var.environment}"
  description          = "Redis cluster for session and cache - Hergon ${var.environment}"

  engine               = "redis"
  engine_version       = "7.1"
  node_type            = var.environment == "prod" ? "cache.r7g.large" : "cache.t4g.micro" # Graviton3
  num_cache_clusters   = var.environment == "prod" ? 2 : 1
  parameter_group_name = aws_elasticache_parameter_group.redis.name
  port                 = 6379

  # Network & Security
  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [var.redis_security_group_id]

  # High Availability
  automatic_failover_enabled = var.environment == "prod" ? true : false
  multi_az_enabled           = var.environment == "prod" ? true : false

  # Backup
  snapshot_retention_limit = var.environment == "prod" ? 7 : 1
  snapshot_window          = "03:00-04:00"
  maintenance_window       = "sun:04:00-sun:05:00"

  # Encryption
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token_enabled         = true
  kms_key_id                 = var.kms_key_arn

  # Logging
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis_slow_log.name
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    log_type         = "slow-log"
  }

  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis_engine_log.name
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    log_type         = "engine-log"
  }

  # Auto minor version upgrade
  auto_minor_version_upgrade = true

  tags = {
    Name        = "${var.project_name}-redis-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Session storage, distributed cache, rate limiting"
  }
}

# CloudWatch Log Groups for Redis
resource "aws_cloudwatch_log_group" "redis_slow_log" {
  name              = "/aws/elasticache/${var.project_name}-redis-${var.environment}/slow-log"
  retention_in_days = var.environment == "prod" ? 7 : 3

  tags = {
    Name        = "${var.project_name}-redis-slow-log-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_cloudwatch_log_group" "redis_engine_log" {
  name              = "/aws/elasticache/${var.project_name}-redis-${var.environment}/engine-log"
  retention_in_days = var.environment == "prod" ? 7 : 3

  tags = {
    Name        = "${var.project_name}-redis-engine-log-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}
