# ============================================================================
# PRODUCTION ENVIRONMENT - VARIABLES
# ============================================================================

variable "project_name" {
  description = "Nombre del proyecto"
  type        = string
  default     = "hergon"
}

variable "environment" {
  description = "Ambiente"
  type        = string
  default     = "prod"
}

variable "region" {
  description = "AWS Region"
  type        = string
  default     = "us-east-1"
}

# ============================================================================
# NETWORKING
# ============================================================================

variable "vpc_cidr" {
  description = "CIDR block para la VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Lista de Availability Zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks para subnets públicas"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_app_subnet_cidrs" {
  description = "CIDR blocks para subnets privadas de aplicación"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
}

variable "private_db_subnet_cidrs" {
  description = "CIDR blocks para subnets privadas de base de datos"
  type        = list(string)
  default     = ["10.0.21.0/24", "10.0.22.0/24", "10.0.23.0/24"]
}

# ============================================================================
# AZURE AD CONFIGURATION
# ============================================================================

variable "azure_tenant_id" {
  description = "Azure AD Tenant ID"
  type        = string
  sensitive   = true
}

variable "azure_client_id" {
  description = "Azure AD Client ID"
  type        = string
  sensitive   = true
}

variable "azure_client_secret" {
  description = "Azure AD Client Secret"
  type        = string
  sensitive   = true
}

variable "azure_audience" {
  description = "Azure AD Audience (API identifier)"
  type        = string
  default     = "api://hergon-api-production"
}

# ============================================================================
# DATABASE
# ============================================================================

variable "db_master_password" {
  description = "Master password para RDS PostgreSQL"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.db_master_password) >= 16
    error_message = "Database password debe tener al menos 16 caracteres."
  }
}

# ============================================================================
# CONTAINER IMAGES
# ============================================================================

variable "ecr_repository_url" {
  description = "URL base del ECR repository"
  type        = string
  default     = ""  # Se configurará después de crear ECR
}

# ============================================================================
# SSL/TLS
# ============================================================================

variable "ssl_certificate_arn" {
  description = "ARN del certificado SSL/TLS en ACM para el ALB"
  type        = string
  default     = ""  # Debe ser creado manualmente o via otro proceso
}

# ============================================================================
# MONITORING
# ============================================================================

variable "alert_email" {
  description = "Email para recibir alertas de CloudWatch"
  type        = string
}

# ============================================================================
# TAGS
# ============================================================================

variable "additional_tags" {
  description = "Tags adicionales para todos los recursos"
  type        = map(string)
  default = {
    Terraform   = "true"
    Repository  = "hergon-vector01"
    Team        = "Engineering"
    CostCenter  = "Engineering"
    Compliance  = "CONSAR"
  }
}
