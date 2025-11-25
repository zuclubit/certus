# ============================================================================
# STORAGE MODULE - S3 Buckets
# ============================================================================

# ============================================================================
# S3 BUCKET - RAW FILES (archivos originales de AFOREs)
# ============================================================================

resource "aws_s3_bucket" "raw_files" {
  bucket = "${var.project_name}-raw-files-${var.environment}-${var.aws_account_id}"

  tags = {
    Name        = "${var.project_name}-raw-files-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Original AFORE files uploaded for validation"
  }
}

resource "aws_s3_bucket_versioning" "raw_files" {
  bucket = aws_s3_bucket.raw_files.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "raw_files" {
  bucket = aws_s3_bucket.raw_files.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "raw_files" {
  bucket = aws_s3_bucket.raw_files.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "raw_files" {
  bucket = aws_s3_bucket.raw_files.id

  rule {
    id     = "transition-to-glacier"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "GLACIER_IR"
    }

    transition {
      days          = 180
      storage_class = "DEEP_ARCHIVE"
    }

    expiration {
      days = 2555 # 7 años para compliance CONSAR
    }
  }

  rule {
    id     = "delete-old-versions"
    status = "Enabled"

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "GLACIER_IR"
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

# ============================================================================
# S3 BUCKET - PROCESSED FILES (archivos procesados/transformados)
# ============================================================================

resource "aws_s3_bucket" "processed_files" {
  bucket = "${var.project_name}-processed-files-${var.environment}-${var.aws_account_id}"

  tags = {
    Name        = "${var.project_name}-processed-files-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Processed and transformed files after validation"
  }
}

resource "aws_s3_bucket_versioning" "processed_files" {
  bucket = aws_s3_bucket.processed_files.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "processed_files" {
  bucket = aws_s3_bucket.processed_files.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "processed_files" {
  bucket = aws_s3_bucket.processed_files.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "processed_files" {
  bucket = aws_s3_bucket.processed_files.id

  rule {
    id     = "transition-to-intelligent-tiering"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "INTELLIGENT_TIERING"
    }

    expiration {
      days = 2555 # 7 años para compliance CONSAR
    }
  }
}

# ============================================================================
# S3 BUCKET - REPORTS (reportes generados)
# ============================================================================

resource "aws_s3_bucket" "reports" {
  bucket = "${var.project_name}-reports-${var.environment}-${var.aws_account_id}"

  tags = {
    Name        = "${var.project_name}-reports-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Generated validation reports and summaries"
  }
}

resource "aws_s3_bucket_versioning" "reports" {
  bucket = aws_s3_bucket.reports.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "reports" {
  bucket = aws_s3_bucket.reports.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "reports" {
  bucket = aws_s3_bucket.reports.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "reports" {
  bucket = aws_s3_bucket.reports.id

  rule {
    id     = "transition-to-intelligent-tiering"
    status = "Enabled"

    transition {
      days          = 7
      storage_class = "INTELLIGENT_TIERING"
    }

    expiration {
      days = 365 # 1 año para reportes
    }
  }
}

# ============================================================================
# S3 BUCKET - BACKUPS (backups de bases de datos)
# ============================================================================

resource "aws_s3_bucket" "backups" {
  bucket = "${var.project_name}-backups-${var.environment}-${var.aws_account_id}"

  tags = {
    Name        = "${var.project_name}-backups-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Database backups and disaster recovery"
  }
}

resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "backups" {
  bucket = aws_s3_bucket.backups.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    id     = "transition-to-glacier"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "GLACIER_IR"
    }

    transition {
      days          = 90
      storage_class = "DEEP_ARCHIVE"
    }

    expiration {
      days = var.environment == "prod" ? 2555 : 90 # 7 años prod, 90 días staging
    }
  }
}

# ============================================================================
# S3 BUCKET NOTIFICATIONS (para triggers de Lambda)
# ============================================================================

resource "aws_s3_bucket_notification" "raw_files" {
  count  = var.enable_s3_notifications ? 1 : 0
  bucket = aws_s3_bucket.raw_files.id

  lambda_function {
    lambda_function_arn = var.file_processor_lambda_arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "uploads/"
    filter_suffix       = ".txt"
  }

  depends_on = [var.file_processor_lambda_arn]
}

# ============================================================================
# S3 BUCKET POLICIES
# ============================================================================

# Policy para acceso desde ECS tasks y Lambda
resource "aws_s3_bucket_policy" "raw_files" {
  bucket = aws_s3_bucket.raw_files.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowECSAndLambdaAccess"
        Effect = "Allow"
        Principal = {
          AWS = [
            var.ecs_task_role_arn,
            var.lambda_execution_role_arn
          ]
        }
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.raw_files.arn}/*"
      },
      {
        Sid    = "AllowListBucket"
        Effect = "Allow"
        Principal = {
          AWS = [
            var.ecs_task_role_arn,
            var.lambda_execution_role_arn
          ]
        }
        Action = [
          "s3:ListBucket"
        ]
        Resource = aws_s3_bucket.raw_files.arn
      },
      {
        Sid    = "DenyInsecureTransport"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:*"
        Resource = [
          aws_s3_bucket.raw_files.arn,
          "${aws_s3_bucket.raw_files.arn}/*"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      }
    ]
  })
}

resource "aws_s3_bucket_policy" "processed_files" {
  bucket = aws_s3_bucket.processed_files.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowECSAndLambdaAccess"
        Effect = "Allow"
        Principal = {
          AWS = [
            var.ecs_task_role_arn,
            var.lambda_execution_role_arn
          ]
        }
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.processed_files.arn}/*"
      },
      {
        Sid    = "AllowListBucket"
        Effect = "Allow"
        Principal = {
          AWS = [
            var.ecs_task_role_arn,
            var.lambda_execution_role_arn
          ]
        }
        Action = [
          "s3:ListBucket"
        ]
        Resource = aws_s3_bucket.processed_files.arn
      },
      {
        Sid    = "DenyInsecureTransport"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:*"
        Resource = [
          aws_s3_bucket.processed_files.arn,
          "${aws_s3_bucket.processed_files.arn}/*"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      }
    ]
  })
}

resource "aws_s3_bucket_policy" "reports" {
  bucket = aws_s3_bucket.reports.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowECSAndLambdaAccess"
        Effect = "Allow"
        Principal = {
          AWS = [
            var.ecs_task_role_arn,
            var.lambda_execution_role_arn
          ]
        }
        Action = [
          "s3:GetObject",
          "s3:PutObject"
        ]
        Resource = "${aws_s3_bucket.reports.arn}/*"
      },
      {
        Sid    = "DenyInsecureTransport"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:*"
        Resource = [
          aws_s3_bucket.reports.arn,
          "${aws_s3_bucket.reports.arn}/*"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      }
    ]
  })
}

resource "aws_s3_bucket_policy" "backups" {
  bucket = aws_s3_bucket.backups.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowBackupAccess"
        Effect = "Allow"
        Principal = {
          AWS = var.ecs_task_role_arn
        }
        Action = [
          "s3:PutObject"
        ]
        Resource = "${aws_s3_bucket.backups.arn}/*"
      },
      {
        Sid    = "DenyInsecureTransport"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:*"
        Resource = [
          aws_s3_bucket.backups.arn,
          "${aws_s3_bucket.backups.arn}/*"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      }
    ]
  })
}
