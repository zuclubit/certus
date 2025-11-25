# ============================================================================
# STORAGE MODULE - VARIABLES
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

variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
}

# ============================================================================
# ENCRYPTION
# ============================================================================

variable "kms_key_arn" {
  description = "ARN de la KMS key para encriptación de S3"
  type        = string
}

# ============================================================================
# IAM ROLES
# ============================================================================

variable "ecs_task_role_arn" {
  description = "ARN del ECS Task Role para permisos de S3"
  type        = string
}

variable "lambda_execution_role_arn" {
  description = "ARN del Lambda Execution Role para permisos de S3"
  type        = string
}

# ============================================================================
# S3 NOTIFICATIONS
# ============================================================================

variable "enable_s3_notifications" {
  description = "Habilitar notificaciones de S3 a Lambda"
  type        = bool
  default     = false
}

variable "file_processor_lambda_arn" {
  description = "ARN de la función Lambda para procesar archivos"
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
