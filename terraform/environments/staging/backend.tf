# ============================================================================
# TERRAFORM BACKEND CONFIGURATION - STAGING
# S3 Backend para state management con DynamoDB locking
# ============================================================================

terraform {
  backend "s3" {
    bucket = "hergon-terraform-state-staging"
    key    = "environments/staging/terraform.tfstate"
    region = "us-east-1"

    dynamodb_table = "hergon-terraform-lock"
    encrypt        = true
  }
}

# ============================================================================
# SETUP COMMANDS (ejecutar UNA VEZ antes del terraform init)
# ============================================================================

# PASO 1: Crear S3 bucket
#
# aws s3api create-bucket \
#   --bucket hergon-terraform-state-staging \
#   --region us-east-1
#
# aws s3api put-bucket-versioning \
#   --bucket hergon-terraform-state-staging \
#   --versioning-configuration Status=Enabled
#
# aws s3api put-bucket-encryption \
#   --bucket hergon-terraform-state-staging \
#   --server-side-encryption-configuration '{
#     "Rules": [{
#       "ApplyServerSideEncryptionByDefault": {
#         "SSEAlgorithm": "AES256"
#       }
#     }]
#   }'
#
# aws s3api put-public-access-block \
#   --bucket hergon-terraform-state-staging \
#   --public-access-block-configuration \
#     BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# PASO 2: La tabla DynamoDB es la misma que producción (hergon-terraform-lock)
#         Si no existe, crearla con:
#
# aws dynamodb create-table \
#   --table-name hergon-terraform-lock \
#   --attribute-definitions AttributeName=LockID,AttributeType=S \
#   --key-schema AttributeName=LockID,KeyType=HASH \
#   --billing-mode PAY_PER_REQUEST \
#   --region us-east-1

# PASO 3: terraform init
