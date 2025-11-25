# ============================================================================
# SECURITY MODULE - OUTPUTS
# ============================================================================

# ============================================================================
# SECURITY GROUPS
# ============================================================================

output "alb_security_group_id" {
  description = "ID del Security Group del ALB"
  value       = aws_security_group.alb.id
}

output "ecs_tasks_security_group_id" {
  description = "ID del Security Group de ECS tasks"
  value       = aws_security_group.ecs_tasks.id
}

output "lambda_security_group_id" {
  description = "ID del Security Group de Lambda functions"
  value       = aws_security_group.lambda.id
}

output "rds_security_group_id" {
  description = "ID del Security Group de RDS"
  value       = aws_security_group.rds.id
}

output "redis_security_group_id" {
  description = "ID del Security Group de Redis"
  value       = aws_security_group.redis.id
}

# ============================================================================
# IAM ROLES - ECS
# ============================================================================

output "ecs_task_execution_role_arn" {
  description = "ARN del ECS Task Execution Role"
  value       = aws_iam_role.ecs_task_execution.arn
}

output "ecs_task_execution_role_name" {
  description = "Nombre del ECS Task Execution Role"
  value       = aws_iam_role.ecs_task_execution.name
}

output "ecs_task_role_arn" {
  description = "ARN del ECS Task Role"
  value       = aws_iam_role.ecs_task.arn
}

output "ecs_task_role_name" {
  description = "Nombre del ECS Task Role"
  value       = aws_iam_role.ecs_task.name
}

# ============================================================================
# IAM ROLES - Lambda
# ============================================================================

output "lambda_execution_role_arn" {
  description = "ARN del Lambda Execution Role"
  value       = aws_iam_role.lambda_execution.arn
}

output "lambda_execution_role_name" {
  description = "Nombre del Lambda Execution Role"
  value       = aws_iam_role.lambda_execution.name
}

# ============================================================================
# IAM ROLES - API Gateway
# ============================================================================

output "api_gateway_cloudwatch_role_arn" {
  description = "ARN del API Gateway CloudWatch Logs Role"
  value       = aws_iam_role.api_gateway_cloudwatch.arn
}

# ============================================================================
# SECRETS MANAGER
# ============================================================================

output "azure_ad_secret_arn" {
  description = "ARN del secret de Azure AD"
  value       = aws_secretsmanager_secret.azure_ad_client_secret.arn
}

output "azure_ad_secret_name" {
  description = "Nombre del secret de Azure AD"
  value       = aws_secretsmanager_secret.azure_ad_client_secret.name
}

output "db_master_password_secret_arn" {
  description = "ARN del secret de RDS master password"
  value       = aws_secretsmanager_secret.db_master_password.arn
}

output "db_master_password_secret_name" {
  description = "Nombre del secret de RDS master password"
  value       = aws_secretsmanager_secret.db_master_password.name
}

# ============================================================================
# KMS
# ============================================================================

output "kms_key_id" {
  description = "ID de la KMS key"
  value       = aws_kms_key.main.key_id
}

output "kms_key_arn" {
  description = "ARN de la KMS key"
  value       = aws_kms_key.main.arn
}

output "kms_key_alias" {
  description = "Alias de la KMS key"
  value       = aws_kms_alias.main.name
}

# ============================================================================
# SUMMARY
# ============================================================================

output "security_summary" {
  description = "Resumen de configuración de seguridad"
  value = {
    security_groups = {
      alb        = aws_security_group.alb.id
      ecs_tasks  = aws_security_group.ecs_tasks.id
      lambda     = aws_security_group.lambda.id
      rds        = aws_security_group.rds.id
      redis      = aws_security_group.redis.id
    }
    iam_roles = {
      ecs_task_execution = aws_iam_role.ecs_task_execution.arn
      ecs_task           = aws_iam_role.ecs_task.arn
      lambda_execution   = aws_iam_role.lambda_execution.arn
      api_gateway        = aws_iam_role.api_gateway_cloudwatch.arn
    }
    secrets = {
      azure_ad          = aws_secretsmanager_secret.azure_ad_client_secret.name
      db_master_password = aws_secretsmanager_secret.db_master_password.name
    }
    kms = {
      key_id = aws_kms_key.main.key_id
      alias  = aws_kms_alias.main.name
    }
  }
}
