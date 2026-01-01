output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = module.api.api_gateway_url
}

output "api_gateway_stage" {
  description = "API Gateway stage name"
  value       = module.api.api_stage_name
}

output "projects_table_name" {
  description = "DynamoDB Projects table name"
  value       = module.database.projects_table_name
}

output "testimonials_table_name" {
  description = "DynamoDB Testimonials table name"
  value       = module.database.testimonials_table_name
}

output "contacts_table_name" {
  description = "DynamoDB Contacts table name"
  value       = module.database.contacts_table_name
}

output "newsletter_table_name" {
  description = "DynamoDB Newsletter table name"
  value       = module.database.newsletter_table_name
}

output "blog_posts_table_name" {
  description = "DynamoDB Blog Posts table name"
  value       = module.database.blog_posts_table_name
}

output "images_bucket_name" {
  description = "S3 bucket for image uploads"
  value       = module.storage.images_bucket_name
}

output "images_bucket_regional_domain" {
  description = "S3 bucket regional domain name"
  value       = module.storage.images_bucket_regional_domain
}

output "ses_verified_email" {
  description = "SES verified email identity"
  value       = module.email.ses_verified_email
}

output "ses_identity_arn" {
  description = "SES identity ARN"
  value       = module.email.ses_identity_arn
}
