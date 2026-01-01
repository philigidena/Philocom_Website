output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = aws_api_gateway_stage.main.invoke_url
}

output "api_gateway_id" {
  description = "API Gateway ID"
  value       = aws_api_gateway_rest_api.main.id
}

output "api_stage_name" {
  description = "API Gateway stage name"
  value       = aws_api_gateway_stage.main.stage_name
}

output "lambda_functions" {
  description = "Lambda function names"
  value = {
    get_projects      = aws_lambda_function.get_projects.function_name
    contact_handler   = aws_lambda_function.contact_handler.function_name
    newsletter        = aws_lambda_function.newsletter_handler.function_name
    get_testimonials  = aws_lambda_function.get_testimonials.function_name
    get_blog_posts    = aws_lambda_function.get_blog_posts.function_name
  }
}
