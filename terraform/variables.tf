variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-central-1"
}

variable "environment" {
  description = "Environment name (dev/prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "philocom"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "philocom.co"
}

variable "frontend_url" {
  description = "Frontend URL (Vercel deployment)"
  type        = string
  default     = "https://philocom.co"
}

variable "cors_origin" {
  description = "CORS allowed origin (* for development)"
  type        = string
  default     = "*"
}

variable "admin_email" {
  description = "Admin email for notifications"
  type        = string
  default     = "admin@philocom.co"
}

variable "ses_verified_email" {
  description = "SES verified sender email"
  type        = string
  default     = "noreply@philocom.co"
}
