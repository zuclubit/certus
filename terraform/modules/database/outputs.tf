# ============================================================================
# DATABASE MODULE - OUTPUTS
# ============================================================================

# ============================================================================
# RDS POSTGRESQL - CATALOG
# ============================================================================

output "catalog_db_endpoint" {
  description = "Endpoint de conexión de la base de datos Catalog"
  value       = aws_db_instance.catalog.endpoint
}

output "catalog_db_address" {
  description = "Hostname de la base de datos Catalog"
  value       = aws_db_instance.catalog.address
}

output "catalog_db_port" {
  description = "Puerto de la base de datos Catalog"
  value       = aws_db_instance.catalog.port
}

output "catalog_db_name" {
  description = "Nombre de la base de datos Catalog"
  value       = aws_db_instance.catalog.db_name
}

output "catalog_db_arn" {
  description = "ARN de la base de datos Catalog"
  value       = aws_db_instance.catalog.arn
}

output "catalog_db_identifier" {
  description = "Identifier de la base de datos Catalog"
  value       = aws_db_instance.catalog.identifier
}

# ============================================================================
# RDS POSTGRESQL - VALIDATION
# ============================================================================

output "validation_db_endpoint" {
  description = "Endpoint de conexión de la base de datos Validation"
  value       = aws_db_instance.validation.endpoint
}

output "validation_db_address" {
  description = "Hostname de la base de datos Validation"
  value       = aws_db_instance.validation.address
}

output "validation_db_port" {
  description = "Puerto de la base de datos Validation"
  value       = aws_db_instance.validation.port
}

output "validation_db_name" {
  description = "Nombre de la base de datos Validation"
  value       = aws_db_instance.validation.db_name
}

output "validation_db_arn" {
  description = "ARN de la base de datos Validation"
  value       = aws_db_instance.validation.arn
}

output "validation_db_identifier" {
  description = "Identifier de la base de datos Validation"
  value       = aws_db_instance.validation.identifier
}

# ============================================================================
# DYNAMODB - EVENT STORE
# ============================================================================

output "event_store_table_name" {
  description = "Nombre de la tabla DynamoDB Event Store"
  value       = aws_dynamodb_table.event_store.name
}

output "event_store_table_arn" {
  description = "ARN de la tabla DynamoDB Event Store"
  value       = aws_dynamodb_table.event_store.arn
}

output "event_store_stream_arn" {
  description = "ARN del stream de DynamoDB Event Store"
  value       = aws_dynamodb_table.event_store.stream_arn
}

output "event_store_stream_label" {
  description = "Label del stream de DynamoDB Event Store"
  value       = aws_dynamodb_table.event_store.stream_label
}

# ============================================================================
# DYNAMODB - VALIDATION CACHE
# ============================================================================

output "validation_cache_table_name" {
  description = "Nombre de la tabla DynamoDB Validation Cache"
  value       = aws_dynamodb_table.validation_cache.name
}

output "validation_cache_table_arn" {
  description = "ARN de la tabla DynamoDB Validation Cache"
  value       = aws_dynamodb_table.validation_cache.arn
}

# ============================================================================
# ELASTICACHE REDIS
# ============================================================================

output "redis_endpoint" {
  description = "Endpoint de conexión de Redis (primary)"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "redis_reader_endpoint" {
  description = "Endpoint de lectura de Redis (reader)"
  value       = aws_elasticache_replication_group.redis.reader_endpoint_address
}

output "redis_port" {
  description = "Puerto de conexión de Redis"
  value       = aws_elasticache_replication_group.redis.port
}

output "redis_replication_group_id" {
  description = "ID del Replication Group de Redis"
  value       = aws_elasticache_replication_group.redis.id
}

output "redis_arn" {
  description = "ARN del Replication Group de Redis"
  value       = aws_elasticache_replication_group.redis.arn
}

# ============================================================================
# CONNECTION STRINGS (para uso en aplicaciones)
# ============================================================================

output "catalog_connection_string" {
  description = "String de conexión para la base de datos Catalog (sin password)"
  value       = "postgresql://${aws_db_instance.catalog.username}@${aws_db_instance.catalog.address}:${aws_db_instance.catalog.port}/${aws_db_instance.catalog.db_name}"
  sensitive   = true
}

output "validation_connection_string" {
  description = "String de conexión para la base de datos Validation (sin password)"
  value       = "postgresql://${aws_db_instance.validation.username}@${aws_db_instance.validation.address}:${aws_db_instance.validation.port}/${aws_db_instance.validation.db_name}"
  sensitive   = true
}

output "redis_connection_string" {
  description = "String de conexión para Redis (sin auth token)"
  value       = "rediss://${aws_elasticache_replication_group.redis.primary_endpoint_address}:${aws_elasticache_replication_group.redis.port}"
  sensitive   = true
}

# ============================================================================
# SUMMARY
# ============================================================================

output "database_summary" {
  description = "Resumen de configuración de bases de datos"
  value = {
    rds_catalog = {
      endpoint       = aws_db_instance.catalog.endpoint
      instance_class = aws_db_instance.catalog.instance_class
      multi_az       = aws_db_instance.catalog.multi_az
      storage_gb     = aws_db_instance.catalog.allocated_storage
    }
    rds_validation = {
      endpoint       = aws_db_instance.validation.endpoint
      instance_class = aws_db_instance.validation.instance_class
      multi_az       = aws_db_instance.validation.multi_az
      storage_gb     = aws_db_instance.validation.allocated_storage
    }
    dynamodb = {
      event_store       = aws_dynamodb_table.event_store.name
      validation_cache  = aws_dynamodb_table.validation_cache.name
      billing_mode      = aws_dynamodb_table.event_store.billing_mode
    }
    redis = {
      endpoint     = aws_elasticache_replication_group.redis.primary_endpoint_address
      node_type    = aws_elasticache_replication_group.redis.node_type
      num_clusters = aws_elasticache_replication_group.redis.num_cache_clusters
      multi_az     = aws_elasticache_replication_group.redis.multi_az_enabled
    }
  }
}
