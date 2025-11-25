# ============================================================================
# API GATEWAY MODULE - OUTPUTS
# ============================================================================

# ============================================================================
# API GATEWAY
# ============================================================================

output "api_id" {
  description = "ID de la API Gateway"
  value       = aws_apigatewayv2_api.main.id
}

output "api_arn" {
  description = "ARN de la API Gateway"
  value       = aws_apigatewayv2_api.main.arn
}

output "api_endpoint" {
  description = "Endpoint de la API Gateway"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "api_execution_arn" {
  description = "ARN de ejecución de la API Gateway"
  value       = aws_apigatewayv2_api.main.execution_arn
}

# ============================================================================
# STAGE
# ============================================================================

output "stage_id" {
  description = "ID del stage"
  value       = aws_apigatewayv2_stage.main.id
}

output "stage_invoke_url" {
  description = "URL de invocación del stage"
  value       = aws_apigatewayv2_stage.main.invoke_url
}

# ============================================================================
# AUTHORIZER
# ============================================================================

output "authorizer_id" {
  description = "ID del JWT authorizer"
  value       = aws_apigatewayv2_authorizer.azure_ad.id
}

# ============================================================================
# VPC LINK
# ============================================================================

output "vpc_link_id" {
  description = "ID del VPC Link"
  value       = aws_apigatewayv2_vpc_link.main.id
}

output "vpc_link_arn" {
  description = "ARN del VPC Link"
  value       = aws_apigatewayv2_vpc_link.main.arn
}

# ============================================================================
# CUSTOM DOMAIN
# ============================================================================

output "custom_domain_name" {
  description = "Nombre de dominio personalizado (si está configurado)"
  value       = var.custom_domain_name != "" ? aws_apigatewayv2_domain_name.main[0].domain_name : null
}

output "custom_domain_target" {
  description = "Target del dominio personalizado para Route 53 (si está configurado)"
  value       = var.custom_domain_name != "" ? aws_apigatewayv2_domain_name.main[0].domain_name_configuration[0].target_domain_name : null
}

output "custom_domain_hosted_zone_id" {
  description = "Hosted Zone ID del dominio personalizado para Route 53 (si está configurado)"
  value       = var.custom_domain_name != "" ? aws_apigatewayv2_domain_name.main[0].domain_name_configuration[0].hosted_zone_id : null
}

# ============================================================================
# WAF
# ============================================================================

output "waf_web_acl_id" {
  description = "ID del WAF Web ACL (si está habilitado)"
  value       = var.enable_waf ? aws_wafv2_web_acl.api_gateway[0].id : null
}

output "waf_web_acl_arn" {
  description = "ARN del WAF Web ACL (si está habilitado)"
  value       = var.enable_waf ? aws_wafv2_web_acl.api_gateway[0].arn : null
}

# ============================================================================
# CLOUDWATCH
# ============================================================================

output "cloudwatch_log_group_name" {
  description = "Nombre del CloudWatch Log Group"
  value       = aws_cloudwatch_log_group.api_gateway.name
}

output "cloudwatch_log_group_arn" {
  description = "ARN del CloudWatch Log Group"
  value       = aws_cloudwatch_log_group.api_gateway.arn
}

# ============================================================================
# SUMMARY
# ============================================================================

output "api_gateway_summary" {
  description = "Resumen de configuración de API Gateway"
  value = {
    api_endpoint    = aws_apigatewayv2_api.main.api_endpoint
    stage_url       = aws_apigatewayv2_stage.main.invoke_url
    custom_domain   = var.custom_domain_name != "" ? var.custom_domain_name : "not configured"
    waf_enabled     = var.enable_waf
    authorizer      = "Azure AD JWT"
    cors_enabled    = true
    vpc_link        = aws_apigatewayv2_vpc_link.main.id
    throttling = {
      burst_limit = aws_apigatewayv2_stage.main.default_route_settings[0].throttling_burst_limit
      rate_limit  = aws_apigatewayv2_stage.main.default_route_settings[0].throttling_rate_limit
    }
  }
}

# ============================================================================
# CURL EXAMPLES (para testing)
# ============================================================================

output "curl_examples" {
  description = "Ejemplos de curl para testing"
  value = {
    health_check = "curl -X GET ${aws_apigatewayv2_stage.main.invoke_url}/health"
    authenticated_request = "curl -X GET ${aws_apigatewayv2_stage.main.invoke_url}/api/validation-files -H 'Authorization: Bearer YOUR_AZURE_AD_TOKEN'"
  }
}
