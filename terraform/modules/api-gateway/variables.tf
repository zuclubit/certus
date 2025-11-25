# ============================================================================
# API GATEWAY MODULE - VARIABLES
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

variable "private_subnet_ids" {
  description = "IDs de las subnets privadas para VPC Link"
  type        = list(string)
}

variable "vpc_link_security_group_id" {
  description = "ID del Security Group para VPC Link"
  type        = string
}

# ============================================================================
# ALB INTEGRATION
# ============================================================================

variable "alb_listener_arn" {
  description = "ARN del ALB listener para integración"
  type        = string
}

# ============================================================================
# AZURE AD CONFIGURATION
# ============================================================================

variable "azure_tenant_id" {
  description = "Azure AD Tenant ID para JWT validation"
  type        = string
  sensitive   = true
}

variable "azure_audience" {
  description = "Azure AD Audience esperada en los JWT tokens"
  type        = string
}

# ============================================================================
# CORS
# ============================================================================

variable "cors_allowed_origins" {
  description = "Orígenes permitidos para CORS"
  type        = list(string)
  default     = ["*"]
}

# ============================================================================
# CUSTOM DOMAIN
# ============================================================================

variable "custom_domain_name" {
  description = "Nombre de dominio personalizado (opcional)"
  type        = string
  default     = ""
}

variable "acm_certificate_arn" {
  description = "ARN del certificado ACM para custom domain"
  type        = string
  default     = ""
}

# ============================================================================
# WAF
# ============================================================================

variable "enable_waf" {
  description = "Habilitar AWS WAF para protección"
  type        = bool
  default     = true
}

variable "allowed_countries" {
  description = "Códigos de país permitidos (vacío = todos permitidos)"
  type        = list(string)
  default     = []  # Ejemplo: ["MX", "US", "CA"] para México, USA, Canadá
}

# ============================================================================
# MONITORING
# ============================================================================

variable "alarm_sns_topic_arn" {
  description = "ARN del SNS topic para alarmas"
  type        = string
}

# ============================================================================
# TAGS
# ============================================================================

variable "additional_tags" {
  description = "Tags adicionales para aplicar a todos los recursos"
  type        = map(string)
  default     = {}
}
