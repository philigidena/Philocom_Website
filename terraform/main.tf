locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# DynamoDB Tables Module
module "database" {
  source = "./modules/database"

  project_name = var.project_name
  environment  = var.environment
  common_tags  = local.common_tags
}

# Lambda Functions & API Gateway Module
module "api" {
  source = "./modules/api"

  project_name     = var.project_name
  environment      = var.environment
  frontend_url     = var.frontend_url
  common_tags      = local.common_tags

  # DynamoDB table names from database module
  projects_table_name      = module.database.projects_table_name
  testimonials_table_name  = module.database.testimonials_table_name
  contacts_table_name      = module.database.contacts_table_name
  newsletter_table_name    = module.database.newsletter_table_name
  blog_posts_table_name    = module.database.blog_posts_table_name

  # DynamoDB table ARNs for IAM permissions
  projects_table_arn      = module.database.projects_table_arn
  testimonials_table_arn  = module.database.testimonials_table_arn
  contacts_table_arn      = module.database.contacts_table_arn
  newsletter_table_arn    = module.database.newsletter_table_arn
  blog_posts_table_arn    = module.database.blog_posts_table_arn

  # SES identity ARN
  ses_identity_arn = module.email.ses_identity_arn

  depends_on = [module.database, module.email]
}

# SES Email Service Module
module "email" {
  source = "./modules/email"

  project_name       = var.project_name
  environment        = var.environment
  domain_name        = var.domain_name
  verified_email     = var.ses_verified_email
  admin_email        = var.admin_email
  common_tags        = local.common_tags
}

# S3 Storage for Images & Assets Module
module "storage" {
  source = "./modules/storage"

  project_name = var.project_name
  environment  = var.environment
  common_tags  = local.common_tags
}
