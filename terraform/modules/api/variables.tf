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
