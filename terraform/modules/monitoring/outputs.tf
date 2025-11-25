# ============================================================================
# MONITORING MODULE - OUTPUTS
# ============================================================================

# ============================================================================
# DASHBOARDS
# ============================================================================

output "main_dashboard_name" {
  description = "Nombre del dashboard principal"
  value       = aws_cloudwatch_dashboard.main.dashboard_name
}

output "main_dashboard_url" {
  description = "URL del dashboard principal"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.region}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
}

output "costs_dashboard_name" {
  description = "Nombre del dashboard de costos"
  value       = aws_cloudwatch_dashboard.costs.dashboard_name
}

output "costs_dashboard_url" {
  description = "URL del dashboard de costos"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.region}#dashboards:name=${aws_cloudwatch_dashboard.costs.dashboard_name}"
}

# ============================================================================
# SNS TOPICS
# ============================================================================

output "critical_alarms_topic_arn" {
  description = "ARN del SNS topic de alarmas críticas"
  value       = aws_sns_topic.critical_alarms.arn
}

output "critical_alarms_topic_name" {
  description = "Nombre del SNS topic de alarmas críticas"
  value       = aws_sns_topic.critical_alarms.name
}

# ============================================================================
# LOG INSIGHTS QUERIES
# ============================================================================

output "log_insights_query_names" {
  description = "Nombres de las queries guardadas de Logs Insights"
  value = {
    api_errors         = aws_cloudwatch_query_definition.api_errors.name
    ecs_errors         = aws_cloudwatch_query_definition.ecs_errors.name
    lambda_performance = aws_cloudwatch_query_definition.lambda_performance.name
    api_latency        = aws_cloudwatch_query_definition.api_latency.name
  }
}

# ============================================================================
# EVENTBRIDGE RULES
# ============================================================================

output "eventbridge_rules" {
  description = "Nombres de las reglas de EventBridge"
  value = {
    ecs_task_failure = aws_cloudwatch_event_rule.ecs_task_failure.name
    rds_failure      = aws_cloudwatch_event_rule.rds_failure.name
  }
}

# ============================================================================
# SUMMARY
# ============================================================================

output "monitoring_summary" {
  description = "Resumen de configuración de monitoreo"
  value = {
    dashboards = {
      main  = aws_cloudwatch_dashboard.main.dashboard_name
      costs = aws_cloudwatch_dashboard.costs.dashboard_name
    }
    alarms = {
      critical_topic    = aws_sns_topic.critical_alarms.name
      composite_enabled = var.enable_composite_alarms
      anomaly_enabled   = var.enable_anomaly_detection
    }
    log_insights = {
      saved_queries = 4
    }
    automation = {
      eventbridge_rules = 2
    }
  }
}

# ============================================================================
# QUICK ACCESS LINKS
# ============================================================================

output "quick_links" {
  description = "Enlaces rápidos a consola de AWS"
  value = {
    main_dashboard = "https://console.aws.amazon.com/cloudwatch/home?region=${var.region}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
    costs_dashboard = "https://console.aws.amazon.com/cloudwatch/home?region=${var.region}#dashboards:name=${aws_cloudwatch_dashboard.costs.dashboard_name}"
    alarms = "https://console.aws.amazon.com/cloudwatch/home?region=${var.region}#alarmsV2:"
    logs_insights = "https://console.aws.amazon.com/cloudwatch/home?region=${var.region}#logsV2:logs-insights"
    metrics = "https://console.aws.amazon.com/cloudwatch/home?region=${var.region}#metricsV2:"
  }
}
