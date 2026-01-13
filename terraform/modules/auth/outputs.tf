output "user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.admin.id
}

output "user_pool_arn" {
  description = "Cognito User Pool ARN"
  value       = aws_cognito_user_pool.admin.arn
}

output "user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  value       = aws_cognito_user_pool_client.admin_client.id
}

output "user_pool_endpoint" {
  description = "Cognito User Pool endpoint"
  value       = aws_cognito_user_pool.admin.endpoint
}

output "user_pool_domain" {
  description = "Cognito User Pool domain prefix"
  value       = "${var.project_name}-${var.environment}"
}
