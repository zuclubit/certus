# ============================================================================
# NETWORKING MODULE - VARIABLES
# ============================================================================

variable "project_name" {
  description = "Nombre del proyecto (usado en tags y nombres de recursos)"
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
# VPC CONFIGURATION
# ============================================================================

variable "vpc_cidr" {
  description = "CIDR block para la VPC"
  type        = string
  default     = "10.0.0.0/16"

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "VPC CIDR debe ser un bloque CIDR válido."
  }
}

variable "availability_zones" {
  description = "Lista de Availability Zones a usar"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

# ============================================================================
# SUBNET CONFIGURATION
# ============================================================================

variable "public_subnet_cidrs" {
  description = "CIDR blocks para subnets públicas (1 por AZ)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]

  validation {
    condition     = length(var.public_subnet_cidrs) >= 1
    error_message = "Debe haber al menos 1 subnet pública."
  }
}

variable "private_app_subnet_cidrs" {
  description = "CIDR blocks para subnets privadas de aplicación (1 por AZ)"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]

  validation {
    condition     = length(var.private_app_subnet_cidrs) >= 1
    error_message = "Debe haber al menos 1 subnet privada de aplicación."
  }
}

variable "private_db_subnet_cidrs" {
  description = "CIDR blocks para subnets privadas de base de datos (1 por AZ)"
  type        = list(string)
  default     = ["10.0.21.0/24", "10.0.22.0/24", "10.0.23.0/24"]

  validation {
    condition     = length(var.private_db_subnet_cidrs) >= 1
    error_message = "Debe haber al menos 1 subnet privada de base de datos."
  }
}

# ============================================================================
# NAT GATEWAY
# ============================================================================

variable "enable_nat_gateway" {
  description = "Habilitar NAT Gateway (requerido para acceso a internet desde subnets privadas)"
  type        = bool
  default     = true
}

# ============================================================================
# VPC ENDPOINTS
# ============================================================================

variable "enable_vpc_endpoints" {
  description = "Habilitar VPC Endpoints (reduce costos NAT y mejora seguridad)"
  type        = bool
  default     = true
}

# ============================================================================
# FLOW LOGS
# ============================================================================

variable "enable_flow_logs" {
  description = "Habilitar VPC Flow Logs para auditoría y troubleshooting"
  type        = bool
  default     = true
}

variable "flow_logs_retention_days" {
  description = "Días de retención para VPC Flow Logs"
  type        = number
  default     = 7

  validation {
    condition     = contains([1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653], var.flow_logs_retention_days)
    error_message = "Retention days debe ser uno de los valores permitidos por CloudWatch Logs."
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
