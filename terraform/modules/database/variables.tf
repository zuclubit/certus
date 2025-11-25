# ============================================================================
# DATABASE MODULE - VARIABLES
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

# ============================================================================
# NETWORKING
# ============================================================================

variable "vpc_id" {
  description = "ID de la VPC"
  type        = string
}

variable "private_db_subnet_ids" {
  description = "IDs de las subnets privadas de base de datos"
  type        = list(string)
}

variable "availability_zones" {
  description = "Lista de Availability Zones"
  type        = list(string)
}

# ============================================================================
# SECURITY
# ============================================================================

variable "rds_security_group_id" {
  description = "ID del Security Group para RDS"
  type        = string
}

variable "redis_security_group_id" {
  description = "ID del Security Group para Redis"
  type        = string
}

variable "kms_key_arn" {
  description = "ARN de la KMS key para encriptación"
  type        = string
}

# ============================================================================
# RDS CONFIGURATION
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

variable "db_master_username" {
  description = "Master username para RDS PostgreSQL"
  type        = string
  default     = "hergon_admin"

  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9_]*$", var.db_master_username))
    error_message = "Database username debe empezar con letra y contener solo letras, números y guiones bajos."
  }
}

# ============================================================================
# TAGS
# ============================================================================

variable "additional_tags" {
  description = "Tags adicionales para aplicar a todos los recursos"
  type        = map(string)
  default     = {}
}
