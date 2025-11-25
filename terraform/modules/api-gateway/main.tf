# ============================================================================
# API GATEWAY MODULE - HTTP API with JWT Authorizer (Azure AD)
# ============================================================================

# ============================================================================
# API GATEWAY V2 (HTTP API - más económico y simple que REST API)
# ============================================================================

resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-api-${var.environment}"
  protocol_type = "HTTP"
  description   = "Hergon API Gateway with Azure AD JWT authentication"

  cors_configuration {
    allow_origins     = var.cors_allowed_origins
    allow_methods     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers     = ["Authorization", "Content-Type", "X-Amz-Date", "X-Api-Key", "X-Amz-Security-Token"]
    expose_headers    = ["X-Request-Id"]
    max_age           = 300
    allow_credentials = true
  }

  tags = {
    Name        = "${var.project_name}-api-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# ============================================================================
# JWT AUTHORIZER (Azure AD)
# ============================================================================

resource "aws_apigatewayv2_authorizer" "azure_ad" {
  api_id           = aws_apigatewayv2_api.main.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "azure-ad-jwt-authorizer"

  jwt_configuration {
    audience = [var.azure_audience]
    issuer   = "https://login.microsoftonline.com/${var.azure_tenant_id}/v2.0"
  }
}

# ============================================================================
# VPC LINK (para conectar con ECS en subnets privadas)
# ============================================================================

resource "aws_apigatewayv2_vpc_link" "main" {
  name               = "${var.project_name}-vpc-link-${var.environment}"
  security_group_ids = [var.vpc_link_security_group_id]
  subnet_ids         = var.private_subnet_ids

  tags = {
    Name        = "${var.project_name}-vpc-link-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# ============================================================================
# INTEGRATION con ALB (Application Load Balancer)
# ============================================================================

resource "aws_apigatewayv2_integration" "alb" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "HTTP_PROXY"

  integration_uri    = var.alb_listener_arn
  integration_method = "ANY"
  connection_type    = "VPC_LINK"
  connection_id      = aws_apigatewayv2_vpc_link.main.id

  request_parameters = {
    "overwrite:header.X-Forwarded-For" = "$request.header.X-Forwarded-For"
  }
}

# ============================================================================
# ROUTES
# ============================================================================

# Route para API pública (con autenticación)
resource "aws_apigatewayv2_route" "api_authenticated" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /api/{proxy+}"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.azure_ad.id

  target = "integrations/${aws_apigatewayv2_integration.alb.id}"
}

# Route para health check (sin autenticación)
resource "aws_apigatewayv2_route" "health" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /health"

  authorization_type = "NONE"

  target = "integrations/${aws_apigatewayv2_integration.alb.id}"
}

# Route para webhooks (sin autenticación pero con API key)
resource "aws_apigatewayv2_route" "webhooks" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /webhooks/{proxy+}"

  authorization_type = "NONE"

  target = "integrations/${aws_apigatewayv2_integration.alb.id}"
}

# ============================================================================
# STAGE (Deployment)
# ============================================================================

resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = var.environment
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn

    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      errorMessage   = "$context.error.message"
      errorType      = "$context.error.messageString"
      authorizerError = "$context.authorizer.error"
    })
  }

  default_route_settings {
    throttling_burst_limit = var.environment == "prod" ? 5000 : 100
    throttling_rate_limit  = var.environment == "prod" ? 2000 : 50
    detailed_metrics_enabled = true
  }

  tags = {
    Name        = "${var.project_name}-api-stage-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# ============================================================================
# CLOUDWATCH LOG GROUP
# ============================================================================

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.project_name}-${var.environment}"
  retention_in_days = var.environment == "prod" ? 30 : 7

  tags = {
    Name        = "${var.project_name}-api-gateway-logs-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# ============================================================================
# CUSTOM DOMAIN (opcional)
# ============================================================================

resource "aws_apigatewayv2_domain_name" "main" {
  count = var.custom_domain_name != "" ? 1 : 0

  domain_name = var.custom_domain_name

  domain_name_configuration {
    certificate_arn = var.acm_certificate_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }

  tags = {
    Name        = "${var.project_name}-api-domain-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_apigatewayv2_api_mapping" "main" {
  count = var.custom_domain_name != "" ? 1 : 0

  api_id      = aws_apigatewayv2_api.main.id
  domain_name = aws_apigatewayv2_domain_name.main[0].id
  stage       = aws_apigatewayv2_stage.main.id
}

# ============================================================================
# WAF WEB ACL (para protección contra ataques)
# ============================================================================

resource "aws_wafv2_web_acl" "api_gateway" {
  count = var.enable_waf ? 1 : 0

  name  = "${var.project_name}-api-waf-${var.environment}"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  # Rate limiting
  rule {
    name     = "RateLimitRule"
    priority = 1

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = var.environment == "prod" ? 2000 : 500
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-rate-limit-${var.environment}"
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Rules - Core Rule Set
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-common-rules-${var.environment}"
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Rules - Known Bad Inputs
  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 3

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-bad-inputs-${var.environment}"
      sampled_requests_enabled   = true
    }
  }

  # Geographic restriction (opcional)
  dynamic "rule" {
    for_each = length(var.allowed_countries) > 0 ? [1] : []

    content {
      name     = "GeoBlockingRule"
      priority = 4

      action {
        block {}
      }

      statement {
        not_statement {
          statement {
            geo_match_statement {
              country_codes = var.allowed_countries
            }
          }
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = "${var.project_name}-geo-blocking-${var.environment}"
        sampled_requests_enabled   = true
      }
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project_name}-waf-${var.environment}"
    sampled_requests_enabled   = true
  }

  tags = {
    Name        = "${var.project_name}-api-waf-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Associate WAF with API Gateway
resource "aws_wafv2_web_acl_association" "api_gateway" {
  count = var.enable_waf ? 1 : 0

  resource_arn = aws_apigatewayv2_stage.main.arn
  web_acl_arn  = aws_wafv2_web_acl.api_gateway[0].arn
}

# ============================================================================
# CLOUDWATCH ALARMS
# ============================================================================

# Alarm: API Gateway 5XX errors
resource "aws_cloudwatch_metric_alarm" "api_5xx_errors" {
  alarm_name          = "${var.project_name}-api-5xx-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Sum"
  threshold           = var.environment == "prod" ? "10" : "5"
  alarm_description   = "API Gateway 5XX errors are too high"
  alarm_actions       = [var.alarm_sns_topic_arn]

  dimensions = {
    ApiId = aws_apigatewayv2_api.main.id
    Stage = aws_apigatewayv2_stage.main.name
  }
}

# Alarm: API Gateway 4XX errors
resource "aws_cloudwatch_metric_alarm" "api_4xx_errors" {
  alarm_name          = "${var.project_name}-api-4xx-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "4XXError"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Sum"
  threshold           = var.environment == "prod" ? "100" : "50"
  alarm_description   = "API Gateway 4XX errors are too high"
  alarm_actions       = [var.alarm_sns_topic_arn]

  dimensions = {
    ApiId = aws_apigatewayv2_api.main.id
    Stage = aws_apigatewayv2_stage.main.name
  }
}

# Alarm: API Gateway latency
resource "aws_cloudwatch_metric_alarm" "api_latency" {
  alarm_name          = "${var.project_name}-api-latency-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Latency"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Average"
  threshold           = var.environment == "prod" ? "1000" : "2000"  # 1s prod, 2s staging
  alarm_description   = "API Gateway latency is too high"
  alarm_actions       = [var.alarm_sns_topic_arn]

  dimensions = {
    ApiId = aws_apigatewayv2_api.main.id
    Stage = aws_apigatewayv2_stage.main.name
  }
}
