# ============================================================================
# TERRAFORM BACKEND CONFIGURATION - PRODUCTION
# S3 Backend para state management con DynamoDB locking
# ============================================================================

terraform {
  backend "s3" {
    # S3 Bucket para almacenar el state
    bucket = "hergon-terraform-state-prod"
    key    = "environments/prod/terraform.tfstate"
    region = "us-east-1"

    # DynamoDB para state locking
    dynamodb_table = "hergon-terraform-lock"

    # Encriptación del state
    encrypt = true

    # KMS key para encriptación adicional (opcional pero recomendado)
    # kms_key_id = "arn:aws:kms:us-east-1:ACCOUNT_ID:key/KEY_ID"
  }
}

# ============================================================================
# INSTRUCCIONES DE SETUP
# ============================================================================

# PASO 1: Crear el S3 bucket para el state (ejecutar UNA VEZ antes del terraform init)
#
# aws s3api create-bucket \
#   --bucket hergon-terraform-state-prod \
#   --region us-east-1
#
# aws s3api put-bucket-versioning \
#   --bucket hergon-terraform-state-prod \
#   --versioning-configuration Status=Enabled
#
# aws s3api put-bucket-encryption \
#   --bucket hergon-terraform-state-prod \
#   --server-side-encryption-configuration '{
#     "Rules": [{
#       "ApplyServerSideEncryptionByDefault": {
#         "SSEAlgorithm": "AES256"
#       }
#     }]
#   }'
#
# aws s3api put-public-access-block \
#   --bucket hergon-terraform-state-prod \
#   --public-access-block-configuration \
#     BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# PASO 2: Crear la tabla DynamoDB para locking (ejecutar UNA VEZ antes del terraform init)
#
# aws dynamodb create-table \
#   --table-name hergon-terraform-lock \
#   --attribute-definitions AttributeName=LockID,AttributeType=S \
#   --key-schema AttributeName=LockID,KeyType=HASH \
#   --billing-mode PAY_PER_REQUEST \
#   --region us-east-1 \
#   --tags Key=Environment,Value=prod Key=Project,Value=hergon Key=Purpose,Value=terraform-lock

# PASO 3: Una vez creados el bucket y la tabla, ejecutar:
#
# terraform init
# terraform plan
# terraform apply

# ============================================================================
# NOTAS IMPORTANTES
# ============================================================================

# 1. El bucket y la tabla DynamoDB deben existir ANTES de ejecutar terraform init
# 2. El bucket debe tener versioning habilitado para poder recuperar states anteriores
# 3. El bucket debe tener encriptación habilitada para proteger datos sensibles
# 4. El bucket NO debe ser público
# 5. La tabla DynamoDB usa billing mode PAY_PER_REQUEST (costo muy bajo)
# 6. El state contiene información sensible (passwords, endpoints), mantenerlo seguro
# 7. Para trabajar en equipo, todos deben tener acceso al bucket y la tabla
# 8. NUNCA hacer commit del archivo terraform.tfstate al repositorio git

# ============================================================================
# RECUPERACIÓN DE STATE ANTERIOR
# ============================================================================

# Si necesitas recuperar una versión anterior del state:
#
# 1. Listar versiones del state:
#    aws s3api list-object-versions \
#      --bucket hergon-terraform-state-prod \
#      --prefix environments/prod/terraform.tfstate
#
# 2. Descargar versión específica:
#    aws s3api get-object \
#      --bucket hergon-terraform-state-prod \
#      --key environments/prod/terraform.tfstate \
#      --version-id VERSION_ID \
#      terraform.tfstate.backup
#
# 3. Restaurar (con MUCHO cuidado):
#    terraform state push terraform.tfstate.backup

# ============================================================================
# BACKUP DEL STATE
# ============================================================================

# Backup manual del state actual:
#
# terraform state pull > terraform-state-backup-$(date +%Y%m%d-%H%M%S).json
#
# Se recomienda hacer backup antes de:
# - Cambios grandes de infraestructura
# - Migraciones de recursos
# - Destrucción de recursos críticos
