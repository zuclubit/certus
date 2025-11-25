# ============================================================================
# STORAGE MODULE - OUTPUTS
# ============================================================================

# ============================================================================
# S3 BUCKETS - ARNs
# ============================================================================

output "raw_files_bucket_arn" {
  description = "ARN del bucket de archivos raw"
  value       = aws_s3_bucket.raw_files.arn
}

output "processed_files_bucket_arn" {
  description = "ARN del bucket de archivos processed"
  value       = aws_s3_bucket.processed_files.arn
}

output "reports_bucket_arn" {
  description = "ARN del bucket de reportes"
  value       = aws_s3_bucket.reports.arn
}

output "backups_bucket_arn" {
  description = "ARN del bucket de backups"
  value       = aws_s3_bucket.backups.arn
}

# ============================================================================
# S3 BUCKETS - Names
# ============================================================================

output "raw_files_bucket_name" {
  description = "Nombre del bucket de archivos raw"
  value       = aws_s3_bucket.raw_files.id
}

output "processed_files_bucket_name" {
  description = "Nombre del bucket de archivos processed"
  value       = aws_s3_bucket.processed_files.id
}

output "reports_bucket_name" {
  description = "Nombre del bucket de reportes"
  value       = aws_s3_bucket.reports.id
}

output "backups_bucket_name" {
  description = "Nombre del bucket de backups"
  value       = aws_s3_bucket.backups.id
}

# ============================================================================
# S3 BUCKETS - Domains
# ============================================================================

output "raw_files_bucket_domain_name" {
  description = "Domain name del bucket de archivos raw"
  value       = aws_s3_bucket.raw_files.bucket_domain_name
}

output "processed_files_bucket_domain_name" {
  description = "Domain name del bucket de archivos processed"
  value       = aws_s3_bucket.processed_files.bucket_domain_name
}

output "reports_bucket_domain_name" {
  description = "Domain name del bucket de reportes"
  value       = aws_s3_bucket.reports.bucket_domain_name
}

output "backups_bucket_domain_name" {
  description = "Domain name del bucket de backups"
  value       = aws_s3_bucket.backups.bucket_domain_name
}

# ============================================================================
# SUMMARY
# ============================================================================

output "storage_summary" {
  description = "Resumen de configuración de almacenamiento"
  value = {
    buckets = {
      raw_files       = aws_s3_bucket.raw_files.id
      processed_files = aws_s3_bucket.processed_files.id
      reports         = aws_s3_bucket.reports.id
      backups         = aws_s3_bucket.backups.id
    }
    encryption = {
      enabled = true
      kms_key = var.kms_key_arn
    }
    versioning = {
      enabled = true
    }
    lifecycle_policies = {
      raw_files       = "90d → Glacier IR → 180d Deep Archive → 7y delete"
      processed_files = "30d → Intelligent Tiering → 7y delete"
      reports         = "7d → Intelligent Tiering → 1y delete"
      backups         = var.environment == "prod" ? "30d → Glacier IR → 90d Deep Archive → 7y delete" : "30d → Glacier IR → 90d delete"
    }
  }
}
