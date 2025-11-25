# ============================================================================
# MONITORING MODULE - CloudWatch Dashboards, Alarms, Logs Insights
# ============================================================================

# ============================================================================
# CLOUDWATCH DASHBOARD - MAIN OVERVIEW
# ============================================================================

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-overview-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      # API Gateway Requests
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApiGateway", "Count", { stat = "Sum", label = "Total Requests" }],
            [".", "4XXError", { stat = "Sum", label = "4XX Errors" }],
            [".", "5XXError", { stat = "Sum", label = "5XX Errors" }]
          ]
          period = 300
          stat   = "Sum"
          region = var.region
          title  = "API Gateway Requests"
          yAxis = {
            left = {
              min = 0
            }
          }
        }
        width  = 12
        height = 6
        x      = 0
        y      = 0
      },
      # API Gateway Latency
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApiGateway", "Latency", { stat = "Average", label = "Average" }],
            ["...", { stat = "p99", label = "p99" }],
            ["...", { stat = "p50", label = "p50" }]
          ]
          period = 300
          stat   = "Average"
          region = var.region
          title  = "API Gateway Latency (ms)"
          yAxis = {
            left = {
              min = 0
            }
          }
        }
        width  = 12
        height = 6
        x      = 12
        y      = 0
      },
      # ECS CPU & Memory
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", { stat = "Average", label = "CPU %" }],
            [".", "MemoryUtilization", { stat = "Average", label = "Memory %" }]
          ]
          period = 300
          stat   = "Average"
          region = var.region
          title  = "ECS Service Utilization"
          yAxis = {
            left = {
              min = 0
              max = 100
            }
          }
        }
        width  = 12
        height = 6
        x      = 0
        y      = 6
      },
      # RDS Metrics
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", { stat = "Average", label = "CPU %" }],
            [".", "DatabaseConnections", { stat = "Average", label = "Connections" }],
            [".", "FreeableMemory", { stat = "Average", label = "Free Memory (MB)", yAxis = "right" }]
          ]
          period = 300
          stat   = "Average"
          region = var.region
          title  = "RDS Performance"
        }
        width  = 12
        height = 6
        x      = 12
        y      = 6
      },
      # DynamoDB Consumed Capacity
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/DynamoDB", "ConsumedReadCapacityUnits", { stat = "Sum", label = "Read Units" }],
            [".", "ConsumedWriteCapacityUnits", { stat = "Sum", label = "Write Units" }]
          ]
          period = 300
          stat   = "Sum"
          region = var.region
          title  = "DynamoDB Consumed Capacity"
        }
        width  = 12
        height = 6
        x      = 0
        y      = 12
      },
      # Lambda Metrics
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", { stat = "Sum", label = "Invocations" }],
            [".", "Errors", { stat = "Sum", label = "Errors" }],
            [".", "Throttles", { stat = "Sum", label = "Throttles" }]
          ]
          period = 300
          stat   = "Sum"
          region = var.region
          title  = "Lambda Executions"
        }
        width  = 12
        height = 6
        x      = 12
        y      = 12
      },
      # S3 Bucket Size
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/S3", "BucketSizeBytes", { stat = "Average", label = "Bucket Size" }],
            [".", "NumberOfObjects", { stat = "Average", label = "Object Count", yAxis = "right" }]
          ]
          period = 86400  # Daily
          stat   = "Average"
          region = var.region
          title  = "S3 Storage"
        }
        width  = 12
        height = 6
        x      = 0
        y      = 18
      },
      # ElastiCache Redis
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ElastiCache", "CPUUtilization", { stat = "Average", label = "CPU %" }],
            [".", "DatabaseMemoryUsagePercentage", { stat = "Average", label = "Memory %" }],
            [".", "NetworkBytesIn", { stat = "Sum", label = "Network In", yAxis = "right" }],
            [".", "NetworkBytesOut", { stat = "Sum", label = "Network Out", yAxis = "right" }]
          ]
          period = 300
          stat   = "Average"
          region = var.region
          title  = "ElastiCache Redis Performance"
        }
        width  = 12
        height = 6
        x      = 12
        y      = 18
      }
    ]
  })
}

# ============================================================================
# CLOUDWATCH DASHBOARD - COSTS
# ============================================================================

resource "aws_cloudwatch_dashboard" "costs" {
  dashboard_name = "${var.project_name}-costs-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      # Estimated Charges
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/Billing", "EstimatedCharges", { stat = "Maximum", label = "Total Cost" }]
          ]
          period = 86400  # Daily
          stat   = "Maximum"
          region = "us-east-1"  # Billing metrics only in us-east-1
          title  = "Estimated AWS Charges (USD)"
        }
        width  = 24
        height = 6
        x      = 0
        y      = 0
      },
      # Cost by Service
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/Billing", "EstimatedCharges", { stat = "Maximum", dimensions = { ServiceName = "AmazonEC2" }, label = "EC2/ECS" }],
            ["...", { dimensions = { ServiceName = "AmazonRDS" }, label = "RDS" }],
            ["...", { dimensions = { ServiceName = "AmazonDynamoDB" }, label = "DynamoDB" }],
            ["...", { dimensions = { ServiceName = "AmazonS3" }, label = "S3" }],
            ["...", { dimensions = { ServiceName = "AmazonElastiCache" }, label = "ElastiCache" }],
            ["...", { dimensions = { ServiceName = "AWSLambda" }, label = "Lambda" }],
            ["...", { dimensions = { ServiceName = "AmazonApiGateway" }, label = "API Gateway" }]
          ]
          period = 86400
          stat   = "Maximum"
          region = "us-east-1"
          title  = "Cost by Service (USD)"
        }
        width  = 24
        height = 6
        x      = 0
        y      = 6
      }
    ]
  })
}

# ============================================================================
# CLOUDWATCH LOGS INSIGHTS - SAVED QUERIES
# ============================================================================

resource "aws_cloudwatch_query_definition" "api_errors" {
  name = "${var.project_name}-api-errors-${var.environment}"

  log_group_names = [
    "/aws/apigateway/${var.project_name}-${var.environment}"
  ]

  query_string = <<-QUERY
    fields @timestamp, @message, status, httpMethod, routeKey
    | filter status >= 400
    | sort @timestamp desc
    | limit 100
  QUERY
}

resource "aws_cloudwatch_query_definition" "ecs_errors" {
  name = "${var.project_name}-ecs-errors-${var.environment}"

  log_group_names = [
    "/ecs/${var.project_name}-api-service-${var.environment}"
  ]

  query_string = <<-QUERY
    fields @timestamp, @message
    | filter @message like /error|exception|fail/i
    | sort @timestamp desc
    | limit 100
  QUERY
}

resource "aws_cloudwatch_query_definition" "lambda_performance" {
  name = "${var.project_name}-lambda-performance-${var.environment}"

  log_group_names = [
    "/aws/lambda/${var.project_name}-*-${var.environment}"
  ]

  query_string = <<-QUERY
    filter @type = "REPORT"
    | fields @requestId, @billedDuration, @memorySize / 1000000 as memoryUsedMB, @maxMemoryUsed / 1000000 as maxMemoryUsedMB
    | stats avg(@billedDuration), max(@billedDuration), avg(memoryUsedMB), max(maxMemoryUsedMB) by bin(5m)
  QUERY
}

resource "aws_cloudwatch_query_definition" "api_latency" {
  name = "${var.project_name}-api-latency-${var.environment}"

  log_group_names = [
    "/aws/apigateway/${var.project_name}-${var.environment}"
  ]

  query_string = <<-QUERY
    fields @timestamp, routeKey, integrationLatency, responseLatency
    | stats avg(integrationLatency), p50(integrationLatency), p90(integrationLatency), p99(integrationLatency) by routeKey
  QUERY
}

# ============================================================================
# SNS TOPIC PARA ALARMAS CRÍTICAS
# ============================================================================

resource "aws_sns_topic" "critical_alarms" {
  name              = "${var.project_name}-critical-alarms-${var.environment}"
  display_name      = "Hergon Critical Alarms"
  kms_master_key_id = var.kms_key_arn

  tags = {
    Name        = "${var.project_name}-critical-alarms-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_sns_topic_subscription" "critical_alarms_email" {
  count = var.critical_alarm_email != "" ? 1 : 0

  topic_arn = aws_sns_topic.critical_alarms.arn
  protocol  = "email"
  endpoint  = var.critical_alarm_email
}

# ============================================================================
# CLOUDWATCH COMPOSITE ALARMS
# ============================================================================

# Composite Alarm: System Health
resource "aws_cloudwatch_composite_alarm" "system_health" {
  count = var.enable_composite_alarms ? 1 : 0

  alarm_name          = "${var.project_name}-system-health-${var.environment}"
  alarm_description   = "Overall system health composite alarm"
  actions_enabled     = true
  alarm_actions       = [aws_sns_topic.critical_alarms.arn]
  ok_actions          = [aws_sns_topic.critical_alarms.arn]

  alarm_rule = "ALARM(${var.api_cpu_alarm_name}) OR ALARM(${var.rds_cpu_alarm_name}) OR ALARM(${var.api_5xx_alarm_name})"
}

# ============================================================================
# CLOUDWATCH METRIC FILTERS (para logs personalizados)
# ============================================================================

# Metric filter: Validation errors
resource "aws_cloudwatch_log_metric_filter" "validation_errors" {
  name           = "${var.project_name}-validation-errors-${var.environment}"
  log_group_name = "/ecs/${var.project_name}-api-service-${var.environment}"
  pattern        = "[timestamp, request_id, level=ERROR*, message=*validation*]"

  metric_transformation {
    name      = "ValidationErrors"
    namespace = "${var.project_name}/${var.environment}"
    value     = "1"
  }
}

# Alarm based on metric filter
resource "aws_cloudwatch_metric_alarm" "validation_errors" {
  alarm_name          = "${var.project_name}-validation-errors-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "ValidationErrors"
  namespace           = "${var.project_name}/${var.environment}"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "High number of validation errors detected"
  alarm_actions       = [aws_sns_topic.critical_alarms.arn]
}

# ============================================================================
# CLOUDWATCH ANOMALY DETECTOR
# ============================================================================

# Anomaly detector for API Gateway requests
resource "aws_cloudwatch_metric_alarm" "api_requests_anomaly" {
  count = var.enable_anomaly_detection ? 1 : 0

  alarm_name          = "${var.project_name}-api-requests-anomaly-${var.environment}"
  comparison_operator = "LessThanLowerOrGreaterThanUpperThreshold"
  evaluation_periods  = "2"
  threshold_metric_id = "e1"
  alarm_description   = "API request count anomaly detected"
  alarm_actions       = [aws_sns_topic.critical_alarms.arn]

  metric_query {
    id          = "e1"
    expression  = "ANOMALY_DETECTION_BAND(m1)"
    label       = "Request Count (Expected)"
    return_data = "true"
  }

  metric_query {
    id = "m1"

    metric {
      metric_name = "Count"
      namespace   = "AWS/ApiGateway"
      period      = "300"
      stat        = "Sum"

      dimensions = {
        ApiId = var.api_gateway_id
      }
    }
  }
}

# ============================================================================
# EVENTBRIDGE RULES (para automatización)
# ============================================================================

# EventBridge rule: ECS task failures
resource "aws_cloudwatch_event_rule" "ecs_task_failure" {
  name        = "${var.project_name}-ecs-task-failure-${var.environment}"
  description = "Capture ECS task state changes to STOPPED"

  event_pattern = jsonencode({
    source      = ["aws.ecs"]
    detail-type = ["ECS Task State Change"]
    detail = {
      lastStatus  = ["STOPPED"]
      stoppedReason = [{
        "anything-but" = ["Task stopped by user"]
      }]
    }
  })
}

resource "aws_cloudwatch_event_target" "ecs_task_failure_sns" {
  rule      = aws_cloudwatch_event_rule.ecs_task_failure.name
  target_id = "SendToSNS"
  arn       = aws_sns_topic.critical_alarms.arn
}

# EventBridge rule: RDS failures
resource "aws_cloudwatch_event_rule" "rds_failure" {
  name        = "${var.project_name}-rds-failure-${var.environment}"
  description = "Capture RDS instance failures"

  event_pattern = jsonencode({
    source      = ["aws.rds"]
    detail-type = ["RDS DB Instance Event"]
    detail = {
      EventCategories = ["failure"]
    }
  })
}

resource "aws_cloudwatch_event_target" "rds_failure_sns" {
  rule      = aws_cloudwatch_event_rule.rds_failure.name
  target_id = "SendToSNS"
  arn       = aws_sns_topic.critical_alarms.arn
}

# SNS topic policy for EventBridge
resource "aws_sns_topic_policy" "critical_alarms_eventbridge" {
  arn = aws_sns_topic.critical_alarms.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
        Action   = "SNS:Publish"
        Resource = aws_sns_topic.critical_alarms.arn
      }
    ]
  })
}
