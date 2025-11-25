# ============================================================================
# MONITORING MODULE - VARIABLES
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
# KMS
# ============================================================================

variable "kms_key_arn" {
  description = "ARN de la KMS key para encriptación"
  type        = string
}

# ============================================================================
# ALARM CONFIGURATION
# ============================================================================

variable "critical_alarm_email" {
  description = "Email para recibir alarmas críticas"
  type        = string
}

variable "enable_composite_alarms" {
  description = "Habilitar alarmas compuestas"
  type        = bool
  default     = true
}

variable "enable_anomaly_detection" {
  description = "Habilitar detección de anomalías"
  type        = bool
  default     = true
}

# ============================================================================
# RESOURCE IDS (para crear alarmas)
# ============================================================================

variable "api_gateway_id" {
  description = "ID de la API Gateway"
  type        = string
  default     = ""
}

variable "api_cpu_alarm_name" {
  description = "Nombre de la alarma de CPU del API"
  type        = string
  default     = ""
}

variable "rds_cpu_alarm_name" {
  description = "Nombre de la alarma de CPU de RDS"
  type        = string
  default     = ""
}

variable "api_5xx_alarm_name" {
  description = "Nombre de la alarma de errores 5XX del API"
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
