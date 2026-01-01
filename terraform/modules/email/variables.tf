variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "domain_name" {
  description = "Domain name for email verification"
  type        = string
}

variable "verified_email" {
  description = "Email address for SES verification"
  type        = string
}

variable "admin_email" {
  description = "Admin email address"
  type        = string
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
