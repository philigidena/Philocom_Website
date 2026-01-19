# IAM Role for Lambda Functions
resource "aws_iam_role" "lambda_execution" {
  name = "${var.project_name}-${var.environment}-lambda-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })

  tags = var.common_tags
}

# Attach basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# IAM Policy for DynamoDB Access
resource "aws_iam_policy" "dynamodb_access" {
  name        = "${var.project_name}-${var.environment}-dynamodb-access"
  description = "Allow Lambda to access DynamoDB tables"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ]
      Resource = [
        var.projects_table_arn,
        "${var.projects_table_arn}/index/*",
        var.testimonials_table_arn,
        "${var.testimonials_table_arn}/index/*",
        var.contacts_table_arn,
        "${var.contacts_table_arn}/index/*",
        var.newsletter_table_arn,
        "${var.newsletter_table_arn}/index/*",
        var.blog_posts_table_arn,
        "${var.blog_posts_table_arn}/index/*"
      ]
    }]
  })

  tags = var.common_tags
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.dynamodb_access.arn
}

# IAM Policy for SES Access
resource "aws_iam_policy" "ses_access" {
  name        = "${var.project_name}-${var.environment}-ses-access"
  description = "Allow Lambda to send emails via SES"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ]
      Resource = var.ses_identity_arn
    }]
  })

  tags = var.common_tags
}

resource "aws_iam_role_policy_attachment" "lambda_ses" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.ses_access.arn
}

# IAM Policy for S3 Access (Image uploads)
resource "aws_iam_policy" "s3_access" {
  name        = "${var.project_name}-${var.environment}-s3-access"
  description = "Allow Lambda to access S3 for image uploads"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ]
      Resource = [
        var.images_bucket_arn,
        "${var.images_bucket_arn}/*"
      ]
    }]
  })

  tags = var.common_tags
}

resource "aws_iam_role_policy_attachment" "lambda_s3" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.s3_access.arn
}

# Lambda Layer for shared dependencies (AWS SDK, etc.)
resource "aws_lambda_layer_version" "dependencies" {
  filename            = "${path.module}/lambda_layer.zip"  # You'll create this
  layer_name          = "${var.project_name}-${var.environment}-dependencies"
  compatible_runtimes = ["nodejs20.x"]
  description         = "Shared dependencies for Lambda functions"

  lifecycle {
    ignore_changes = [filename]
  }
}

# API Gateway REST API
resource "aws_api_gateway_rest_api" "main" {
  name        = "${var.project_name}-${var.environment}-api"
  description = "Philocom Portfolio API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = var.common_tags
}

# API Gateway Resource - /projects
resource "aws_api_gateway_resource" "projects" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "projects"
}

# API Gateway Resource - /testimonials
resource "aws_api_gateway_resource" "testimonials" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "testimonials"
}

# API Gateway Resource - /contact
resource "aws_api_gateway_resource" "contact" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "contact"
}

# API Gateway Resource - /newsletter
resource "aws_api_gateway_resource" "newsletter" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "newsletter"
}

# API Gateway Resource - /blog
resource "aws_api_gateway_resource" "blog" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "blog"
}

# Lambda Function - Get Projects
resource "aws_lambda_function" "get_projects" {
  filename      = "${path.module}/lambda_functions.zip"  # You'll create this
  function_name = "${var.project_name}-${var.environment}-get-projects"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/projects.getProjects"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      PROJECTS_TABLE = var.projects_table_name
      CORS_ORIGIN    = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Permission for API Gateway - Get Projects
resource "aws_lambda_permission" "api_gateway_get_projects" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_projects.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# API Gateway Method - GET /projects
resource "aws_api_gateway_method" "get_projects" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.projects.id
  http_method   = "GET"
  authorization = "NONE"
}

# API Gateway Integration - GET /projects
resource "aws_api_gateway_integration" "get_projects" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.projects.id
  http_method             = aws_api_gateway_method.get_projects.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_projects.invoke_arn
}

# Lambda Function - Contact Form Handler
resource "aws_lambda_function" "contact_handler" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-contact-handler"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/contact.handleContact"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      CONTACTS_TABLE = var.contacts_table_name
      CORS_ORIGIN    = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# API Gateway Method - POST /contact
resource "aws_api_gateway_method" "post_contact" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.contact.id
  http_method   = "POST"
  authorization = "NONE"
}

# API Gateway Integration - POST /contact
resource "aws_api_gateway_integration" "post_contact" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.contact.id
  http_method             = aws_api_gateway_method.post_contact.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.contact_handler.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_contact" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.contact_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# Lambda Function - Newsletter Subscription
resource "aws_lambda_function" "newsletter_handler" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-newsletter-handler"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/newsletter.handleNewsletter"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      NEWSLETTER_TABLE = var.newsletter_table_name
      CORS_ORIGIN      = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# API Gateway Method - POST /newsletter
resource "aws_api_gateway_method" "post_newsletter" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.newsletter.id
  http_method   = "POST"
  authorization = "NONE"
}

# API Gateway Integration - POST /newsletter
resource "aws_api_gateway_integration" "post_newsletter" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.newsletter.id
  http_method             = aws_api_gateway_method.post_newsletter.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.newsletter_handler.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_newsletter" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.newsletter_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# Lambda Function - Get Testimonials
resource "aws_lambda_function" "get_testimonials" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-get-testimonials"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/testimonials.getTestimonials"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      TESTIMONIALS_TABLE = var.testimonials_table_name
      CORS_ORIGIN        = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# API Gateway Method - GET /testimonials
resource "aws_api_gateway_method" "get_testimonials" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.testimonials.id
  http_method   = "GET"
  authorization = "NONE"
}

# API Gateway Integration - GET /testimonials
resource "aws_api_gateway_integration" "get_testimonials" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.testimonials.id
  http_method             = aws_api_gateway_method.get_testimonials.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_testimonials.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_get_testimonials" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_testimonials.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# Lambda Function - Get Blog Posts
resource "aws_lambda_function" "get_blog_posts" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-get-blog-posts"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/blog.getBlogPosts"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      BLOG_POSTS_TABLE = var.blog_posts_table_name
      CORS_ORIGIN      = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# API Gateway Method - GET /blog
resource "aws_api_gateway_method" "get_blog_posts" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.blog.id
  http_method   = "GET"
  authorization = "NONE"
}

# API Gateway Integration - GET /blog
resource "aws_api_gateway_integration" "get_blog_posts" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.blog.id
  http_method             = aws_api_gateway_method.get_blog_posts.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_blog_posts.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_get_blog_posts" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_blog_posts.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.projects.id,
      aws_api_gateway_method.get_projects.id,
      aws_api_gateway_integration.get_projects.id,
      aws_api_gateway_resource.contact.id,
      aws_api_gateway_method.post_contact.id,
      aws_api_gateway_integration.post_contact.id,
      aws_api_gateway_resource.newsletter.id,
      aws_api_gateway_method.post_newsletter.id,
      aws_api_gateway_integration.post_newsletter.id,
      aws_api_gateway_resource.testimonials.id,
      aws_api_gateway_method.get_testimonials.id,
      aws_api_gateway_integration.get_testimonials.id,
      aws_api_gateway_resource.blog.id,
      aws_api_gateway_method.get_blog_posts.id,
      aws_api_gateway_integration.get_blog_posts.id,
      # Admin email endpoints
      aws_api_gateway_resource.admin_emails.id,
      aws_api_gateway_method.get_admin_emails.id,
      aws_api_gateway_integration.get_admin_emails.id,
      aws_api_gateway_resource.admin_emails_id.id,
      aws_api_gateway_resource.admin_emails_send.id,
      # Admin employees endpoints
      aws_api_gateway_resource.admin_employees.id,
      aws_api_gateway_resource.admin_employees_id.id,
      # Employee panel endpoints
      aws_api_gateway_resource.employee.id,
      aws_api_gateway_resource.employee_emails.id,
      aws_api_gateway_resource.employee_emails_id.id,
      aws_api_gateway_resource.employee_emails_send.id,
      aws_api_gateway_resource.employee_contacts.id,
      aws_api_gateway_resource.employee_projects.id,
      aws_api_gateway_resource.employee_profile.id,
      # Force redeployment for employee endpoints
      "employee-panel-v1",
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# API Gateway Stage
resource "aws_api_gateway_stage" "main" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = var.environment

  xray_tracing_enabled = false

  tags = var.common_tags
}

# API Gateway Method Settings
resource "aws_api_gateway_method_settings" "all" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  stage_name  = aws_api_gateway_stage.main.stage_name
  method_path = "*/*"

  settings {
    metrics_enabled = true
    logging_level   = "OFF"  # Disabled - requires CloudWatch Logs role in account settings
  }
}

# CORS configuration for all methods
module "cors_projects" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.projects.id
  allow_origin    = var.frontend_url
}

module "cors_contact" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.contact.id
  allow_origin    = var.frontend_url
}

module "cors_newsletter" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.newsletter.id
  allow_origin    = var.frontend_url
}

module "cors_testimonials" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.testimonials.id
  allow_origin    = var.frontend_url
}

module "cors_blog" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.blog.id
  allow_origin    = var.frontend_url
}

# ============================================
# ADMIN PANEL API ENDPOINTS
# ============================================

# Cognito Authorizer for Admin Routes
resource "aws_api_gateway_authorizer" "cognito" {
  name            = "${var.project_name}-${var.environment}-cognito-authorizer"
  rest_api_id     = aws_api_gateway_rest_api.main.id
  type            = "COGNITO_USER_POOLS"
  provider_arns   = [var.cognito_user_pool_arn]
  identity_source = "method.request.header.Authorization"
}

# IAM Policy for Email Tables Access
resource "aws_iam_policy" "email_tables_access" {
  name        = "${var.project_name}-${var.environment}-email-tables-access"
  description = "Allow Lambda to access email DynamoDB tables"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ]
      Resource = [
        var.emails_table_arn,
        "${var.emails_table_arn}/index/*",
        var.email_templates_table_arn,
        "${var.email_templates_table_arn}/index/*",
        var.email_contacts_table_arn,
        "${var.email_contacts_table_arn}/index/*"
      ]
    }]
  })

  tags = var.common_tags
}

resource "aws_iam_role_policy_attachment" "lambda_email_tables" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.email_tables_access.arn
}

# IAM Policy for SSM Parameter Access (Resend API Key)
resource "aws_iam_policy" "ssm_access" {
  name        = "${var.project_name}-${var.environment}-ssm-access"
  description = "Allow Lambda to read SSM parameters"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "ssm:GetParameter",
        "ssm:GetParameters"
      ]
      Resource = [
        "arn:aws:ssm:*:*:parameter/philocom/*"
      ]
    }]
  })

  tags = var.common_tags
}

resource "aws_iam_role_policy_attachment" "lambda_ssm" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.ssm_access.arn
}

# API Gateway Resource - /admin
resource "aws_api_gateway_resource" "admin" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "admin"
}

# API Gateway Resource - /admin/emails
resource "aws_api_gateway_resource" "admin_emails" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.admin.id
  path_part   = "emails"
}

# API Gateway Resource - /admin/emails/{id}
resource "aws_api_gateway_resource" "admin_emails_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.admin_emails.id
  path_part   = "{id}"
}

# API Gateway Resource - /admin/emails/send
resource "aws_api_gateway_resource" "admin_emails_send" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.admin_emails.id
  path_part   = "send"
}

# API Gateway Resource - /webhook
resource "aws_api_gateway_resource" "webhook" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "webhook"
}

# API Gateway Resource - /webhook/email
resource "aws_api_gateway_resource" "webhook_email" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.webhook.id
  path_part   = "email"
}

# Lambda Function - Admin Get Emails (Inbox)
resource "aws_lambda_function" "admin_get_emails" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-get-emails"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/emails.getEmails"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      EMAILS_TABLE = var.emails_table_name
      CORS_ORIGIN  = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Admin Get Single Email
resource "aws_lambda_function" "admin_get_email" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-get-email"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/emails.getEmail"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      EMAILS_TABLE = var.emails_table_name
      CORS_ORIGIN  = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Admin Send Email (via Resend)
resource "aws_lambda_function" "admin_send_email" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-send-email"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/emails.sendEmail"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      EMAILS_TABLE         = var.emails_table_name
      EMAIL_CONTACTS_TABLE = var.email_contacts_table_name
      RESEND_API_KEY_PARAM = var.resend_api_key_param
      SENDER_EMAIL         = "support@philocom.co"
      CORS_ORIGIN          = var.frontend_url
      IMAGES_BUCKET_NAME   = var.images_bucket_name
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Webhook Email Receiver (Resend)
resource "aws_lambda_function" "webhook_email" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-webhook-email"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/webhook/email.handleIncoming"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      EMAILS_TABLE         = var.emails_table_name
      EMAIL_CONTACTS_TABLE = var.email_contacts_table_name
      EMPLOYEES_TABLE      = var.employees_table_name
      WEBHOOK_SECRET_PARAM = "/philocom/webhook-secret"
      RESEND_API_KEY_PARAM = var.resend_api_key_param
      IMAGES_BUCKET_NAME   = var.images_bucket_name
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# API Gateway Method - GET /admin/emails (NO AUTH for fallback compatibility)
resource "aws_api_gateway_method" "get_admin_emails" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_emails.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_admin_emails" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_emails.id
  http_method             = aws_api_gateway_method.get_admin_emails.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_get_emails.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_admin_get_emails" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_get_emails.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# API Gateway Method - GET /admin/emails/{id} (NO AUTH for fallback compatibility)
resource "aws_api_gateway_method" "get_admin_email" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_emails_id.id
  http_method   = "GET"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "get_admin_email" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_emails_id.id
  http_method             = aws_api_gateway_method.get_admin_email.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_get_email.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_admin_get_email" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_get_email.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# API Gateway Method - POST /admin/emails/send (NO AUTH for fallback compatibility)
resource "aws_api_gateway_method" "post_admin_send_email" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_emails_send.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_admin_send_email" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_emails_send.id
  http_method             = aws_api_gateway_method.post_admin_send_email.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_send_email.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_admin_send_email" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_send_email.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# API Gateway Method - POST /webhook/email (NO AUTH - verified by secret)
resource "aws_api_gateway_method" "post_webhook_email" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.webhook_email.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_webhook_email" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.webhook_email.id
  http_method             = aws_api_gateway_method.post_webhook_email.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.webhook_email.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_webhook_email" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.webhook_email.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# CORS for Admin Emails
module "cors_admin_emails" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.admin_emails.id
  allow_origin    = var.frontend_url
}

module "cors_admin_emails_id" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.admin_emails_id.id
  allow_origin    = var.frontend_url
}

module "cors_admin_emails_send" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.admin_emails_send.id
  allow_origin    = var.frontend_url
}

# ============================================
# ADMIN PROJECTS CRUD ENDPOINTS
# ============================================

# API Gateway Resource - /admin/projects
resource "aws_api_gateway_resource" "admin_projects" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.admin.id
  path_part   = "projects"
}

# API Gateway Resource - /admin/projects/{id}
resource "aws_api_gateway_resource" "admin_projects_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.admin_projects.id
  path_part   = "{id}"
}

# Lambda Function - Admin Get Projects
resource "aws_lambda_function" "admin_get_projects" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-get-projects"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/projects.getProjects"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      PROJECTS_TABLE = var.projects_table_name
      CORS_ORIGIN    = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Admin Create Project
resource "aws_lambda_function" "admin_create_project" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-create-project"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/projects.createProject"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      PROJECTS_TABLE = var.projects_table_name
      CORS_ORIGIN    = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Admin Update Project
resource "aws_lambda_function" "admin_update_project" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-update-project"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/projects.updateProject"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      PROJECTS_TABLE = var.projects_table_name
      CORS_ORIGIN    = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Admin Delete Project
resource "aws_lambda_function" "admin_delete_project" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-delete-project"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/projects.deleteProject"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      PROJECTS_TABLE = var.projects_table_name
      CORS_ORIGIN    = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# GET /admin/projects
resource "aws_api_gateway_method" "get_admin_projects" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_projects.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_admin_projects" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_projects.id
  http_method             = aws_api_gateway_method.get_admin_projects.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_get_projects.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_admin_get_projects" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_get_projects.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# POST /admin/projects
resource "aws_api_gateway_method" "post_admin_projects" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_projects.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_admin_projects" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_projects.id
  http_method             = aws_api_gateway_method.post_admin_projects.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_create_project.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_admin_create_project" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_create_project.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# PUT /admin/projects/{id}
resource "aws_api_gateway_method" "put_admin_projects" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_projects_id.id
  http_method   = "PUT"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "put_admin_projects" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_projects_id.id
  http_method             = aws_api_gateway_method.put_admin_projects.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_update_project.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_admin_update_project" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_update_project.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# DELETE /admin/projects/{id}
resource "aws_api_gateway_method" "delete_admin_projects" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_projects_id.id
  http_method   = "DELETE"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "delete_admin_projects" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_projects_id.id
  http_method             = aws_api_gateway_method.delete_admin_projects.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_delete_project.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_admin_delete_project" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_delete_project.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# CORS for admin projects
module "cors_admin_projects" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.admin_projects.id
  allow_origin    = var.frontend_url
}

module "cors_admin_projects_id" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.admin_projects_id.id
  allow_origin    = var.frontend_url
}

# ============================================
# ADMIN BLOG CRUD ENDPOINTS
# ============================================

# API Gateway Resource - /admin/blog
resource "aws_api_gateway_resource" "admin_blog" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.admin.id
  path_part   = "blog"
}

# API Gateway Resource - /admin/blog/{id}
resource "aws_api_gateway_resource" "admin_blog_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.admin_blog.id
  path_part   = "{id}"
}

# Lambda Function - Admin Get Blog Posts
resource "aws_lambda_function" "admin_get_blog" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-get-blog"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/blog.getPosts"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      BLOG_POSTS_TABLE = var.blog_posts_table_name
      CORS_ORIGIN      = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Admin Create Blog Post
resource "aws_lambda_function" "admin_create_blog" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-create-blog"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/blog.createPost"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      BLOG_POSTS_TABLE = var.blog_posts_table_name
      CORS_ORIGIN      = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Admin Update Blog Post
resource "aws_lambda_function" "admin_update_blog" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-update-blog"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/blog.updatePost"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      BLOG_POSTS_TABLE = var.blog_posts_table_name
      CORS_ORIGIN      = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Admin Delete Blog Post
resource "aws_lambda_function" "admin_delete_blog" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-delete-blog"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/blog.deletePost"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      BLOG_POSTS_TABLE = var.blog_posts_table_name
      CORS_ORIGIN      = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# GET /admin/blog
resource "aws_api_gateway_method" "get_admin_blog" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_blog.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_admin_blog" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_blog.id
  http_method             = aws_api_gateway_method.get_admin_blog.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_get_blog.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_admin_get_blog" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_get_blog.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# POST /admin/blog
resource "aws_api_gateway_method" "post_admin_blog" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_blog.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_admin_blog" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_blog.id
  http_method             = aws_api_gateway_method.post_admin_blog.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_create_blog.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_admin_create_blog" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_create_blog.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# PUT /admin/blog/{id}
resource "aws_api_gateway_method" "put_admin_blog" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_blog_id.id
  http_method   = "PUT"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "put_admin_blog" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_blog_id.id
  http_method             = aws_api_gateway_method.put_admin_blog.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_update_blog.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_admin_update_blog" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_update_blog.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# DELETE /admin/blog/{id}
resource "aws_api_gateway_method" "delete_admin_blog" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_blog_id.id
  http_method   = "DELETE"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "delete_admin_blog" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_blog_id.id
  http_method             = aws_api_gateway_method.delete_admin_blog.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_delete_blog.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_admin_delete_blog" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_delete_blog.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# CORS for admin blog
module "cors_admin_blog" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.admin_blog.id
  allow_origin    = var.frontend_url
}

module "cors_admin_blog_id" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.admin_blog_id.id
  allow_origin    = var.frontend_url
}

# ============================================
# ADMIN IMAGES ENDPOINTS
# ============================================

# API Gateway Resource - /admin/images
resource "aws_api_gateway_resource" "admin_images" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.admin.id
  path_part   = "images"
}

# API Gateway Resource - /admin/images/presigned-url
resource "aws_api_gateway_resource" "admin_images_presigned" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.admin_images.id
  path_part   = "presigned-url"
}

# API Gateway Resource - /admin/images/upload
resource "aws_api_gateway_resource" "admin_images_upload" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.admin_images.id
  path_part   = "upload"
}

# API Gateway Resource - /admin/images/{key}
resource "aws_api_gateway_resource" "admin_images_key" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.admin_images.id
  path_part   = "{key}"
}

# Lambda Function - Get Presigned URL
resource "aws_lambda_function" "admin_get_presigned_url" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-get-presigned-url"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/images.getPresignedUrl"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      IMAGES_BUCKET_NAME = var.images_bucket_name
      CORS_ORIGIN        = var.frontend_url
    }
  }

  source_code_hash = filebase64sha256("${path.module}/lambda_functions.zip")
  layers           = [aws_lambda_layer_version.dependencies.arn]
  tags             = var.common_tags
}

resource "aws_lambda_permission" "admin_get_presigned_url" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_get_presigned_url.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# POST /admin/images/presigned-url
resource "aws_api_gateway_method" "post_admin_presigned_url" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_images_presigned.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_admin_presigned_url" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_images_presigned.id
  http_method             = aws_api_gateway_method.post_admin_presigned_url.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_get_presigned_url.invoke_arn
}

# Lambda Function - Upload Image
resource "aws_lambda_function" "admin_upload_image" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-upload-image"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/images.uploadImage"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      IMAGES_BUCKET_NAME = var.images_bucket_name
      CORS_ORIGIN        = var.frontend_url
    }
  }

  source_code_hash = filebase64sha256("${path.module}/lambda_functions.zip")
  layers           = [aws_lambda_layer_version.dependencies.arn]
  tags             = var.common_tags
}

resource "aws_lambda_permission" "admin_upload_image" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_upload_image.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# POST /admin/images/upload
resource "aws_api_gateway_method" "post_admin_upload_image" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_images_upload.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_admin_upload_image" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_images_upload.id
  http_method             = aws_api_gateway_method.post_admin_upload_image.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_upload_image.invoke_arn
}

# Lambda Function - Delete Image
resource "aws_lambda_function" "admin_delete_image" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-delete-image"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/images.deleteImage"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      IMAGES_BUCKET_NAME = var.images_bucket_name
      CORS_ORIGIN        = var.frontend_url
    }
  }

  source_code_hash = filebase64sha256("${path.module}/lambda_functions.zip")
  layers           = [aws_lambda_layer_version.dependencies.arn]
  tags             = var.common_tags
}

resource "aws_lambda_permission" "admin_delete_image" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_delete_image.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# DELETE /admin/images/{key}
resource "aws_api_gateway_method" "delete_admin_image" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_images_key.id
  http_method   = "DELETE"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "delete_admin_image" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_images_key.id
  http_method             = aws_api_gateway_method.delete_admin_image.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_delete_image.invoke_arn
}

# CORS for admin images
module "cors_admin_images" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.admin_images.id
  allow_origin    = var.frontend_url
}

module "cors_admin_images_presigned" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.admin_images_presigned.id
  allow_origin    = var.frontend_url
}

module "cors_admin_images_upload" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.admin_images_upload.id
  allow_origin    = var.frontend_url
}

module "cors_admin_images_key" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.admin_images_key.id
  allow_origin    = var.frontend_url
}

# ============================================
# ADMIN EMAIL ATTACHMENTS ENDPOINTS
# ============================================

# API Gateway Resource - /admin/email-attachments
resource "aws_api_gateway_resource" "admin_email_attachments" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.admin.id
  path_part   = "email-attachments"
}

# API Gateway Resource - /admin/email-attachments/presigned-url
resource "aws_api_gateway_resource" "admin_email_attachments_presigned" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.admin_email_attachments.id
  path_part   = "presigned-url"
}

# API Gateway Resource - /admin/email-attachments/upload
resource "aws_api_gateway_resource" "admin_email_attachments_upload" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.admin_email_attachments.id
  path_part   = "upload"
}

# API Gateway Resource - /admin/email-attachments/{key}
resource "aws_api_gateway_resource" "admin_email_attachments_key" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.admin_email_attachments.id
  path_part   = "{key}"
}

# Lambda Function - Get Email Attachment Presigned URL
resource "aws_lambda_function" "admin_get_email_attachment_presigned_url" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-get-email-attachment-presigned-url"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/emailAttachments.getPresignedUrl"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      IMAGES_BUCKET_NAME = var.images_bucket_name
      
    }
  }

  tags = var.common_tags
}

resource "aws_lambda_permission" "api_gateway_invoke_email_attachment_presigned" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_get_email_attachment_presigned_url.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# POST /admin/email-attachments/presigned-url
resource "aws_api_gateway_method" "post_admin_email_attachment_presigned_url" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_email_attachments_presigned.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_admin_email_attachment_presigned_url" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_email_attachments_presigned.id
  http_method             = aws_api_gateway_method.post_admin_email_attachment_presigned_url.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_get_email_attachment_presigned_url.invoke_arn
}

# Lambda Function - Upload Email Attachment
resource "aws_lambda_function" "admin_upload_email_attachment" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-upload-email-attachment"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/emailAttachments.uploadAttachment"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      IMAGES_BUCKET_NAME = var.images_bucket_name
      
    }
  }

  tags = var.common_tags
}

resource "aws_lambda_permission" "api_gateway_invoke_upload_email_attachment" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_upload_email_attachment.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# POST /admin/email-attachments/upload
resource "aws_api_gateway_method" "post_admin_upload_email_attachment" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_email_attachments_upload.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_admin_upload_email_attachment" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_email_attachments_upload.id
  http_method             = aws_api_gateway_method.post_admin_upload_email_attachment.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_upload_email_attachment.invoke_arn
}

# Lambda Function - Get Email Attachment Download URL
resource "aws_lambda_function" "admin_get_email_attachment_download_url" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-get-email-attachment-download-url"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/emailAttachments.getDownloadUrl"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      IMAGES_BUCKET_NAME = var.images_bucket_name
      
    }
  }

  tags = var.common_tags
}

resource "aws_lambda_permission" "api_gateway_invoke_email_attachment_download_url" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_get_email_attachment_download_url.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# GET /admin/email-attachments/{key}
resource "aws_api_gateway_method" "get_admin_email_attachment_download_url" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_email_attachments_key.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_admin_email_attachment_download_url" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_email_attachments_key.id
  http_method             = aws_api_gateway_method.get_admin_email_attachment_download_url.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_get_email_attachment_download_url.invoke_arn
}

# Lambda Function - Delete Email Attachment
resource "aws_lambda_function" "admin_delete_email_attachment" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-delete-email-attachment"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/emailAttachments.deleteAttachment"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      IMAGES_BUCKET_NAME = var.images_bucket_name
      
    }
  }

  tags = var.common_tags
}

resource "aws_lambda_permission" "api_gateway_invoke_delete_email_attachment" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_delete_email_attachment.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# DELETE /admin/email-attachments/{key}
resource "aws_api_gateway_method" "delete_admin_email_attachment" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_email_attachments_key.id
  http_method   = "DELETE"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "delete_admin_email_attachment" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_email_attachments_key.id
  http_method             = aws_api_gateway_method.delete_admin_email_attachment.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_delete_email_attachment.invoke_arn
}

# CORS for admin email attachments
module "cors_admin_email_attachments" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.admin_email_attachments.id
  allow_origin    = var.frontend_url
}

module "cors_admin_email_attachments_presigned" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.admin_email_attachments_presigned.id
  allow_origin    = var.frontend_url
}

module "cors_admin_email_attachments_upload" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.admin_email_attachments_upload.id
  allow_origin    = var.frontend_url
}

module "cors_admin_email_attachments_key" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.admin_email_attachments_key.id
  allow_origin    = var.frontend_url
}

# ============================================
# ADMIN CONTACTS ENDPOINTS
# ============================================

# API Gateway Resource - /admin/contacts
resource "aws_api_gateway_resource" "admin_contacts" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.admin.id
  path_part   = "contacts"
}

# API Gateway Resource - /admin/contacts/{id}
resource "aws_api_gateway_resource" "admin_contacts_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.admin_contacts.id
  path_part   = "{id}"
}

# Lambda Function - Admin Get Contacts
resource "aws_lambda_function" "admin_get_contacts" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-get-contacts"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/contacts.getContacts"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      CONTACTS_TABLE = var.contacts_table_name
      CORS_ORIGIN    = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Admin Update Contact
resource "aws_lambda_function" "admin_update_contact" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-update-contact"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/contacts.updateContact"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      CONTACTS_TABLE = var.contacts_table_name
      CORS_ORIGIN    = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Admin Delete Contact
resource "aws_lambda_function" "admin_delete_contact" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-delete-contact"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/contacts.deleteContact"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      CONTACTS_TABLE = var.contacts_table_name
      CORS_ORIGIN    = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# GET /admin/contacts
resource "aws_api_gateway_method" "get_admin_contacts" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_contacts.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_admin_contacts" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_contacts.id
  http_method             = aws_api_gateway_method.get_admin_contacts.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_get_contacts.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_admin_get_contacts" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_get_contacts.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# PUT /admin/contacts/{id}
resource "aws_api_gateway_method" "put_admin_contacts" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_contacts_id.id
  http_method   = "PUT"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "put_admin_contacts" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_contacts_id.id
  http_method             = aws_api_gateway_method.put_admin_contacts.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_update_contact.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_admin_update_contact" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_update_contact.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# DELETE /admin/contacts/{id}
resource "aws_api_gateway_method" "delete_admin_contacts" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_contacts_id.id
  http_method   = "DELETE"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "delete_admin_contacts" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_contacts_id.id
  http_method             = aws_api_gateway_method.delete_admin_contacts.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_delete_contact.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_admin_delete_contact" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_delete_contact.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# CORS for admin contacts
module "cors_admin_contacts" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.admin_contacts.id
  allow_origin    = var.frontend_url
}

module "cors_admin_contacts_id" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.admin_contacts_id.id
  allow_origin    = var.frontend_url
}

# ============================================
# ADMIN EMPLOYEES CRUD ENDPOINTS
# ============================================

# IAM Policy for Employees Table Access
resource "aws_iam_policy" "employees_table_access" {
  name        = "${var.project_name}-${var.environment}-employees-table-access"
  description = "Allow Lambda to access employees DynamoDB table"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ]
      Resource = [
        var.employees_table_arn,
        "${var.employees_table_arn}/index/*"
      ]
    }]
  })

  tags = var.common_tags
}

resource "aws_iam_role_policy_attachment" "lambda_employees_table" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.employees_table_access.arn
}

# IAM Policy for Cognito Admin Access (for employee management)
resource "aws_iam_policy" "cognito_admin_access" {
  name        = "${var.project_name}-${var.environment}-cognito-admin-access"
  description = "Allow Lambda to manage Cognito users"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminDeleteUser",
        "cognito-idp:AdminUpdateUserAttributes",
        "cognito-idp:AdminAddUserToGroup",
        "cognito-idp:AdminRemoveUserFromGroup",
        "cognito-idp:AdminSetUserPassword",
        "cognito-idp:AdminGetUser"
      ]
      Resource = var.cognito_user_pool_arn
    }]
  })

  tags = var.common_tags
}

resource "aws_iam_role_policy_attachment" "lambda_cognito_admin" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.cognito_admin_access.arn
}

# API Gateway Resource - /admin/employees
resource "aws_api_gateway_resource" "admin_employees" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.admin.id
  path_part   = "employees"
}

# API Gateway Resource - /admin/employees/{id}
resource "aws_api_gateway_resource" "admin_employees_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.admin_employees.id
  path_part   = "{id}"
}

# Lambda Function - Admin Get Employees
resource "aws_lambda_function" "admin_get_employees" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-get-employees"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/employees.getEmployees"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      EMPLOYEES_TABLE = var.employees_table_name
      CORS_ORIGIN     = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Admin Get Single Employee
resource "aws_lambda_function" "admin_get_employee" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-get-employee"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/employees.getEmployee"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      EMPLOYEES_TABLE = var.employees_table_name
      CORS_ORIGIN     = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Admin Create Employee
resource "aws_lambda_function" "admin_create_employee" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-create-employee"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/employees.createEmployee"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      EMPLOYEES_TABLE      = var.employees_table_name
      COGNITO_USER_POOL_ID = var.cognito_user_pool_id
      CORS_ORIGIN          = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Admin Update Employee
resource "aws_lambda_function" "admin_update_employee" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-update-employee"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/employees.updateEmployee"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      EMPLOYEES_TABLE      = var.employees_table_name
      COGNITO_USER_POOL_ID = var.cognito_user_pool_id
      CORS_ORIGIN          = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Admin Delete Employee
resource "aws_lambda_function" "admin_delete_employee" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-admin-delete-employee"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/admin/employees.deleteEmployee"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      EMPLOYEES_TABLE      = var.employees_table_name
      COGNITO_USER_POOL_ID = var.cognito_user_pool_id
      CORS_ORIGIN          = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# GET /admin/employees
resource "aws_api_gateway_method" "get_admin_employees" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_employees.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_admin_employees" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_employees.id
  http_method             = aws_api_gateway_method.get_admin_employees.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_get_employees.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_admin_get_employees" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_get_employees.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# GET /admin/employees/{id}
resource "aws_api_gateway_method" "get_admin_employee" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_employees_id.id
  http_method   = "GET"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "get_admin_employee" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_employees_id.id
  http_method             = aws_api_gateway_method.get_admin_employee.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_get_employee.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_admin_get_employee" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_get_employee.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# POST /admin/employees
resource "aws_api_gateway_method" "post_admin_employees" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_employees.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_admin_employees" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_employees.id
  http_method             = aws_api_gateway_method.post_admin_employees.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_create_employee.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_admin_create_employee" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_create_employee.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# PUT /admin/employees/{id}
resource "aws_api_gateway_method" "put_admin_employees" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_employees_id.id
  http_method   = "PUT"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "put_admin_employees" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_employees_id.id
  http_method             = aws_api_gateway_method.put_admin_employees.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_update_employee.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_admin_update_employee" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_update_employee.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# DELETE /admin/employees/{id}
resource "aws_api_gateway_method" "delete_admin_employees" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_employees_id.id
  http_method   = "DELETE"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "delete_admin_employees" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.admin_employees_id.id
  http_method             = aws_api_gateway_method.delete_admin_employees.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_delete_employee.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_admin_delete_employee" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_delete_employee.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# CORS for admin employees
module "cors_admin_employees" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.admin_employees.id
  allow_origin    = var.frontend_url
}

module "cors_admin_employees_id" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.admin_employees_id.id
  allow_origin    = var.frontend_url
}

# ============================================
# EMPLOYEE PANEL API ENDPOINTS
# ============================================

# API Gateway Resource - /employee
resource "aws_api_gateway_resource" "employee" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "employee"
}

# API Gateway Resource - /employee/emails
resource "aws_api_gateway_resource" "employee_emails" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.employee.id
  path_part   = "emails"
}

# API Gateway Resource - /employee/emails/{id}
resource "aws_api_gateway_resource" "employee_emails_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.employee_emails.id
  path_part   = "{id}"
}

# API Gateway Resource - /employee/emails/send
resource "aws_api_gateway_resource" "employee_emails_send" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.employee_emails.id
  path_part   = "send"
}

# API Gateway Resource - /employee/contacts
resource "aws_api_gateway_resource" "employee_contacts" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.employee.id
  path_part   = "contacts"
}

# API Gateway Resource - /employee/projects
resource "aws_api_gateway_resource" "employee_projects" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.employee.id
  path_part   = "projects"
}

# API Gateway Resource - /employee/profile
resource "aws_api_gateway_resource" "employee_profile" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.employee.id
  path_part   = "profile"
}

# Lambda Function - Employee Get Emails
resource "aws_lambda_function" "employee_get_emails" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-employee-get-emails"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/employee/emails.getEmails"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      EMAILS_TABLE    = var.emails_table_name
      EMPLOYEES_TABLE = var.employees_table_name
      CORS_ORIGIN     = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Employee Get Single Email
resource "aws_lambda_function" "employee_get_email" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-employee-get-email"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/employee/emails.getEmail"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      EMAILS_TABLE    = var.emails_table_name
      EMPLOYEES_TABLE = var.employees_table_name
      CORS_ORIGIN     = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Employee Send Email
resource "aws_lambda_function" "employee_send_email" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-employee-send-email"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/employee/emails.sendEmail"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      EMAILS_TABLE         = var.emails_table_name
      EMPLOYEES_TABLE      = var.employees_table_name
      EMAIL_CONTACTS_TABLE = var.email_contacts_table_name
      RESEND_API_KEY_PARAM = var.resend_api_key_param
      CORS_ORIGIN          = var.frontend_url
      IMAGES_BUCKET_NAME   = var.images_bucket_name
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Employee Update Email
resource "aws_lambda_function" "employee_update_email" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-employee-update-email"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/employee/emails.updateEmail"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      EMAILS_TABLE    = var.emails_table_name
      EMPLOYEES_TABLE = var.employees_table_name
      CORS_ORIGIN     = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Employee Get Contacts (read-only)
resource "aws_lambda_function" "employee_get_contacts" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-employee-get-contacts"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/employee/contacts.getContacts"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      CONTACTS_TABLE  = var.contacts_table_name
      EMPLOYEES_TABLE = var.employees_table_name
      CORS_ORIGIN     = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Employee Get Projects (read-only)
resource "aws_lambda_function" "employee_get_projects" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-employee-get-projects"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/employee/projects.getProjects"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      PROJECTS_TABLE  = var.projects_table_name
      EMPLOYEES_TABLE = var.employees_table_name
      CORS_ORIGIN     = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Employee Get Profile
resource "aws_lambda_function" "employee_get_profile" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-employee-get-profile"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/employee/profile.getProfile"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      EMPLOYEES_TABLE = var.employees_table_name
      EMAILS_TABLE    = var.emails_table_name
      CORS_ORIGIN     = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# Lambda Function - Employee Update Profile
resource "aws_lambda_function" "employee_update_profile" {
  filename      = "${path.module}/lambda_functions.zip"
  function_name = "${var.project_name}-${var.environment}-employee-update-profile"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "handlers/employee/profile.updateProfile"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      EMPLOYEES_TABLE = var.employees_table_name
      CORS_ORIGIN     = var.frontend_url
    }
  }

  layers = [aws_lambda_layer_version.dependencies.arn]

  lifecycle {
    ignore_changes = [filename]
  }

  tags = var.common_tags
}

# GET /employee/emails
resource "aws_api_gateway_method" "get_employee_emails" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.employee_emails.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_employee_emails" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.employee_emails.id
  http_method             = aws_api_gateway_method.get_employee_emails.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.employee_get_emails.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_employee_get_emails" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.employee_get_emails.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# GET /employee/emails/{id}
resource "aws_api_gateway_method" "get_employee_email" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.employee_emails_id.id
  http_method   = "GET"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "get_employee_email" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.employee_emails_id.id
  http_method             = aws_api_gateway_method.get_employee_email.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.employee_get_email.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_employee_get_email" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.employee_get_email.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# PUT /employee/emails/{id}
resource "aws_api_gateway_method" "put_employee_email" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.employee_emails_id.id
  http_method   = "PUT"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "put_employee_email" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.employee_emails_id.id
  http_method             = aws_api_gateway_method.put_employee_email.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.employee_update_email.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_employee_update_email" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.employee_update_email.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# POST /employee/emails/send
resource "aws_api_gateway_method" "post_employee_send_email" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.employee_emails_send.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_employee_send_email" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.employee_emails_send.id
  http_method             = aws_api_gateway_method.post_employee_send_email.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.employee_send_email.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_employee_send_email" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.employee_send_email.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# GET /employee/contacts
resource "aws_api_gateway_method" "get_employee_contacts" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.employee_contacts.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_employee_contacts" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.employee_contacts.id
  http_method             = aws_api_gateway_method.get_employee_contacts.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.employee_get_contacts.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_employee_get_contacts" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.employee_get_contacts.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# GET /employee/projects
resource "aws_api_gateway_method" "get_employee_projects" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.employee_projects.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_employee_projects" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.employee_projects.id
  http_method             = aws_api_gateway_method.get_employee_projects.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.employee_get_projects.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_employee_get_projects" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.employee_get_projects.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# GET /employee/profile
resource "aws_api_gateway_method" "get_employee_profile" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.employee_profile.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_employee_profile" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.employee_profile.id
  http_method             = aws_api_gateway_method.get_employee_profile.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.employee_get_profile.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_employee_get_profile" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.employee_get_profile.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# PUT /employee/profile
resource "aws_api_gateway_method" "put_employee_profile" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.employee_profile.id
  http_method   = "PUT"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "put_employee_profile" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.employee_profile.id
  http_method             = aws_api_gateway_method.put_employee_profile.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.employee_update_profile.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_employee_update_profile" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.employee_update_profile.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# CORS for employee endpoints
module "cors_employee_emails" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.employee_emails.id
  allow_origin    = var.frontend_url
}

module "cors_employee_emails_id" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.employee_emails_id.id
  allow_origin    = var.frontend_url
}

module "cors_employee_emails_send" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.employee_emails_send.id
  allow_origin    = var.frontend_url
}

module "cors_employee_contacts" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.employee_contacts.id
  allow_origin    = var.frontend_url
}

module "cors_employee_projects" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.employee_projects.id
  allow_origin    = var.frontend_url
}

module "cors_employee_profile" {
  source = "./cors"

  api_id          = aws_api_gateway_rest_api.main.id
  api_resource_id = aws_api_gateway_resource.employee_profile.id
  allow_origin    = var.frontend_url
}
