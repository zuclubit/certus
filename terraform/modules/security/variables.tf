# ============================================================================
# SECURITY MODULE - VARIABLES
# ============================================================================

variable "project_name" {
  description = "Nombre del proyecto"
  type        = string
  default     = "hergon"
}

variable "environment" {
  description = "Ambiente (prod, staging, dev)"
  type        = string

  validation {
    condition     = contains(["prod", "staging", "dev"], var.environment)
    error_message = "Environment debe ser prod, staging, o dev."
  }
}

variable "region" {
  description = "AWS Region"
  type        = string
  default     = "us-east-1"
}

variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
}

# ============================================================================
# NETWORKING
# ============================================================================

variable "vpc_id" {
  description = "ID de la VPC"
  type        = string
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
  description = "Azure AD Client ID (Application ID)"
  type        = string
  sensitive   = true
}

variable "azure_client_secret" {
  description = "Azure AD Client Secret"
  type        = string
  sensitive   = true
}

variable "azure_audience" {
  description = "Azure AD Audience (API identifier URI)"
  type        = string
  default     = ""
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
# KMS
# ============================================================================

variable "kms_key_arn" {
  description = "ARN de KMS key existente (opcional, se creará una nueva si no se proporciona)"
  type        = string
  default     = ""
}

# ============================================================================
# TAGS
# ============================================================================

variable "additional_tags" {
  description = "Tags adicionales para aplicar a todos los recursos"
  type        = map(string)
  default     = {}
}
