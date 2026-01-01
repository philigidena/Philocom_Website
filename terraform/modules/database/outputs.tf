output "projects_table_name" {
  description = "Projects DynamoDB table name"
  value       = aws_dynamodb_table.projects.name
}

output "projects_table_arn" {
  description = "Projects DynamoDB table ARN"
  value       = aws_dynamodb_table.projects.arn
}

output "testimonials_table_name" {
  description = "Testimonials DynamoDB table name"
  value       = aws_dynamodb_table.testimonials.name
}

output "testimonials_table_arn" {
  description = "Testimonials DynamoDB table ARN"
  value       = aws_dynamodb_table.testimonials.arn
}

output "contacts_table_name" {
  description = "Contacts DynamoDB table name"
  value       = aws_dynamodb_table.contacts.name
}

output "contacts_table_arn" {
  description = "Contacts DynamoDB table ARN"
  value       = aws_dynamodb_table.contacts.arn
}

output "newsletter_table_name" {
  description = "Newsletter DynamoDB table name"
  value       = aws_dynamodb_table.newsletter.name
}

output "newsletter_table_arn" {
  description = "Newsletter DynamoDB table ARN"
  value       = aws_dynamodb_table.newsletter.arn
}

output "blog_posts_table_name" {
  description = "Blog Posts DynamoDB table name"
  value       = aws_dynamodb_table.blog_posts.name
}

output "blog_posts_table_arn" {
  description = "Blog Posts DynamoDB table ARN"
  value       = aws_dynamodb_table.blog_posts.arn
}
