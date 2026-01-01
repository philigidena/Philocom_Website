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
    logging_level   = "INFO"
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
