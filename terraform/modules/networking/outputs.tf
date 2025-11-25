# ============================================================================
# NETWORKING MODULE - OUTPUTS
# ============================================================================

output "vpc_id" {
  description = "ID de la VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "CIDR block de la VPC"
  value       = aws_vpc.main.cidr_block
}

output "vpc_arn" {
  description = "ARN de la VPC"
  value       = aws_vpc.main.arn
}

# ============================================================================
# INTERNET GATEWAY
# ============================================================================

output "internet_gateway_id" {
  description = "ID del Internet Gateway"
  value       = aws_internet_gateway.main.id
}

# ============================================================================
# PUBLIC SUBNETS
# ============================================================================

output "public_subnet_ids" {
  description = "IDs de las subnets públicas"
  value       = aws_subnet.public[*].id
}

output "public_subnet_cidrs" {
  description = "CIDR blocks de las subnets públicas"
  value       = aws_subnet.public[*].cidr_block
}

output "public_subnet_arns" {
  description = "ARNs de las subnets públicas"
  value       = aws_subnet.public[*].arn
}

output "public_route_table_id" {
  description = "ID de la route table pública"
  value       = aws_route_table.public.id
}

# ============================================================================
# PRIVATE APP SUBNETS
# ============================================================================

output "private_app_subnet_ids" {
  description = "IDs de las subnets privadas de aplicación"
  value       = aws_subnet.private_app[*].id
}

output "private_app_subnet_cidrs" {
  description = "CIDR blocks de las subnets privadas de aplicación"
  value       = aws_subnet.private_app[*].cidr_block
}

output "private_app_subnet_arns" {
  description = "ARNs de las subnets privadas de aplicación"
  value       = aws_subnet.private_app[*].arn
}

output "private_app_route_table_ids" {
  description = "IDs de las route tables privadas de aplicación"
  value       = aws_route_table.private_app[*].id
}

# ============================================================================
# PRIVATE DB SUBNETS
# ============================================================================

output "private_db_subnet_ids" {
  description = "IDs de las subnets privadas de base de datos"
  value       = aws_subnet.private_db[*].id
}

output "private_db_subnet_cidrs" {
  description = "CIDR blocks de las subnets privadas de base de datos"
  value       = aws_subnet.private_db[*].cidr_block
}

output "private_db_subnet_arns" {
  description = "ARNs de las subnets privadas de base de datos"
  value       = aws_subnet.private_db[*].arn
}

output "private_db_route_table_ids" {
  description = "IDs de las route tables privadas de base de datos"
  value       = aws_route_table.private_db[*].id
}

# ============================================================================
# NAT GATEWAYS
# ============================================================================

output "nat_gateway_ids" {
  description = "IDs de los NAT Gateways"
  value       = var.enable_nat_gateway ? aws_nat_gateway.main[*].id : []
}

output "nat_gateway_public_ips" {
  description = "IPs públicas de los NAT Gateways"
  value       = var.enable_nat_gateway ? aws_eip.nat[*].public_ip : []
}

# ============================================================================
# VPC ENDPOINTS
# ============================================================================

output "vpc_endpoint_s3_id" {
  description = "ID del VPC Endpoint de S3"
  value       = var.enable_vpc_endpoints ? aws_vpc_endpoint.s3[0].id : null
}

output "vpc_endpoint_dynamodb_id" {
  description = "ID del VPC Endpoint de DynamoDB"
  value       = var.enable_vpc_endpoints ? aws_vpc_endpoint.dynamodb[0].id : null
}

output "vpc_endpoint_ecr_api_id" {
  description = "ID del VPC Endpoint de ECR API"
  value       = var.enable_vpc_endpoints ? aws_vpc_endpoint.ecr_api[0].id : null
}

output "vpc_endpoint_ecr_dkr_id" {
  description = "ID del VPC Endpoint de ECR DKR"
  value       = var.enable_vpc_endpoints ? aws_vpc_endpoint.ecr_dkr[0].id : null
}

output "vpc_endpoint_logs_id" {
  description = "ID del VPC Endpoint de CloudWatch Logs"
  value       = var.enable_vpc_endpoints ? aws_vpc_endpoint.logs[0].id : null
}

output "vpc_endpoint_secretsmanager_id" {
  description = "ID del VPC Endpoint de Secrets Manager"
  value       = var.enable_vpc_endpoints ? aws_vpc_endpoint.secretsmanager[0].id : null
}

output "vpc_endpoints_security_group_id" {
  description = "ID del Security Group para VPC Endpoints"
  value       = var.enable_vpc_endpoints ? aws_security_group.vpc_endpoints[0].id : null
}

# ============================================================================
# FLOW LOGS
# ============================================================================

output "flow_log_id" {
  description = "ID del VPC Flow Log"
  value       = var.enable_flow_logs ? aws_flow_log.main[0].id : null
}

output "flow_log_cloudwatch_log_group" {
  description = "CloudWatch Log Group para VPC Flow Logs"
  value       = var.enable_flow_logs ? aws_cloudwatch_log_group.vpc_flow_logs[0].name : null
}

# ============================================================================
# AVAILABILITY ZONES
# ============================================================================

output "availability_zones" {
  description = "Lista de Availability Zones en uso"
  value       = var.availability_zones
}

# ============================================================================
# SUMMARY
# ============================================================================

output "network_summary" {
  description = "Resumen de la configuración de red"
  value = {
    vpc_id              = aws_vpc.main.id
    vpc_cidr            = aws_vpc.main.cidr_block
    availability_zones  = var.availability_zones
    public_subnets      = length(aws_subnet.public)
    private_app_subnets = length(aws_subnet.private_app)
    private_db_subnets  = length(aws_subnet.private_db)
    nat_gateways        = var.enable_nat_gateway ? length(aws_nat_gateway.main) : 0
    vpc_endpoints       = var.enable_vpc_endpoints ? "enabled" : "disabled"
    flow_logs           = var.enable_flow_logs ? "enabled" : "disabled"
  }
}
