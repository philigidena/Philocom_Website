# SES Email Identity Verification
resource "aws_ses_email_identity" "noreply" {
  email = var.verified_email
}

resource "aws_ses_email_identity" "admin" {
  email = var.admin_email
}

# SES Configuration Set for tracking
resource "aws_ses_configuration_set" "main" {
  name = "${var.project_name}-${var.environment}-ses-config"

  delivery_options {
    tls_policy = "Require"
  }

  reputation_metrics_enabled = true
}

# SES Event Destination for bounce/complaint tracking
resource "aws_ses_event_destination" "cloudwatch" {
  name                   = "cloudwatch-destination"
  configuration_set_name = aws_ses_configuration_set.main.name
  enabled                = true
  matching_types         = ["send", "bounce", "complaint", "delivery"]

  cloudwatch_destination {
    default_value  = "default"
    dimension_name = "ses:configuration-set"
    value_source   = "emailHeader"
  }
}

# IAM Policy for Lambda to send emails via SES
resource "aws_iam_policy" "ses_send_email" {
  name        = "${var.project_name}-${var.environment}-ses-send-email"
  description = "Allow Lambda functions to send emails via SES"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:SendTemplatedEmail"
        ]
        Resource = [
          aws_ses_email_identity.noreply.arn,
          aws_ses_email_identity.admin.arn,
          aws_ses_configuration_set.main.arn
        ]
      }
    ]
  })

  tags = var.common_tags
}
