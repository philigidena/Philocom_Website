variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "frontend_url" {
  description = "Frontend URL for CORS"
  type        = string
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}

# DynamoDB Table Names
variable "projects_table_name" {
  description = "Projects DynamoDB table name"
  type        = string
}

variable "testimonials_table_name" {
  description = "Testimonials DynamoDB table name"
  type        = string
}

variable "contacts_table_name" {
  description = "Contacts DynamoDB table name"
  type        = string
}

variable "newsletter_table_name" {
  description = "Newsletter DynamoDB table name"
  type        = string
}

variable "blog_posts_table_name" {
  description = "Blog Posts DynamoDB table name"
  type        = string
}

# DynamoDB Table ARNs
variable "projects_table_arn" {
  description = "Projects DynamoDB table ARN"
  type        = string
}

variable "testimonials_table_arn" {
  description = "Testimonials DynamoDB table ARN"
  type        = string
}

variable "contacts_table_arn" {
  description = "Contacts DynamoDB table ARN"
  type        = string
}

variable "newsletter_table_arn" {
  description = "Newsletter DynamoDB table ARN"
  type        = string
}

variable "blog_posts_table_arn" {
  description = "Blog Posts DynamoDB table ARN"
  type        = string
}

# SES
variable "ses_identity_arn" {
  description = "SES identity ARN"
  type        = string
}

# Email System Tables
variable "emails_table_name" {
  description = "Emails DynamoDB table name"
  type        = string
}

variable "emails_table_arn" {
  description = "Emails DynamoDB table ARN"
  type        = string
}

variable "email_templates_table_name" {
  description = "Email Templates DynamoDB table name"
  type        = string
}

variable "email_templates_table_arn" {
  description = "Email Templates DynamoDB table ARN"
  type        = string
}

variable "email_contacts_table_name" {
  description = "Email Contacts DynamoDB table name"
  type        = string
}

variable "email_contacts_table_arn" {
  description = "Email Contacts DynamoDB table ARN"
  type        = string
}

# Cognito
variable "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN for authorizer"
  type        = string
}

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  type        = string
}

# Resend API Key (stored in SSM Parameter Store)
variable "resend_api_key_param" {
  description = "SSM Parameter name for Resend API key"
  type        = string
  default     = "/philocom/resend-api-key"
}

# Employees Table
variable "employees_table_name" {
  description = "Employees DynamoDB table name"
  type        = string
}

variable "employees_table_arn" {
  description = "Employees DynamoDB table ARN"
  type        = string
}

# S3 Storage
variable "images_bucket_name" {
  description = "S3 bucket name for images"
  type        = string
}

variable "images_bucket_arn" {
  description = "S3 bucket ARN for images"
  type        = string
}
