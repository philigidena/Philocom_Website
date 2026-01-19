# AWS Cognito User Pool for Admin Authentication
# Free tier: 50,000 MAUs

resource "aws_cognito_user_pool" "admin" {
  name = "${var.project_name}-${var.environment}-admin-pool"

  # Password policy
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  # Account recovery via email
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # Auto-verify email
  auto_verified_attributes = ["email"]

  # Email configuration (using Cognito default for free tier)
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # Username attributes
  username_attributes = ["email"]

  # Schema attributes
  schema {
    name                     = "email"
    attribute_data_type      = "String"
    required                 = true
    mutable                  = true
    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    name                     = "name"
    attribute_data_type      = "String"
    required                 = true
    mutable                  = true
    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  # Custom attribute for employee's assigned company email
  schema {
    name                     = "assigned_email"
    attribute_data_type      = "String"
    required                 = false
    mutable                  = true
    string_attribute_constraints {
      min_length = 0
      max_length = 256
    }
  }

  # Custom attribute for employee's personal email (backup contact)
  schema {
    name                     = "personal_email"
    attribute_data_type      = "String"
    required                 = false
    mutable                  = true
    string_attribute_constraints {
      min_length = 0
      max_length = 256
    }
  }

  # MFA configuration (optional - off for simplicity)
  mfa_configuration = "OFF"

  # User pool add-ons
  user_pool_add_ons {
    advanced_security_mode = "OFF"  # Free tier
  }

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-admin-pool"
    }
  )
}

# User Pool Client for Admin App
resource "aws_cognito_user_pool_client" "admin_client" {
  name         = "${var.project_name}-${var.environment}-admin-client"
  user_pool_id = aws_cognito_user_pool.admin.id

  # Auth flows
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]

  # Token validity
  access_token_validity  = 1   # 1 hour
  id_token_validity      = 1   # 1 hour
  refresh_token_validity = 30  # 30 days

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  # No client secret (for SPA)
  generate_secret = false

  # Prevent user existence errors
  prevent_user_existence_errors = "ENABLED"

  # Supported identity providers
  supported_identity_providers = ["COGNITO"]

  # Callback URLs (update with your actual URLs)
  callback_urls = [
    "${var.frontend_url}/admin",
    "${var.frontend_url}/admin/callback",
    "${var.frontend_url}/employee",
    "${var.frontend_url}/employee/callback",
    "http://localhost:5173/admin",
    "http://localhost:5173/admin/callback",
    "http://localhost:5173/employee",
    "http://localhost:5173/employee/callback"
  ]

  logout_urls = [
    "${var.frontend_url}/admin/login",
    "${var.frontend_url}/employee/login",
    "http://localhost:5173/admin/login",
    "http://localhost:5173/employee/login"
  ]

  # OAuth settings
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
}

# Admin User Group
resource "aws_cognito_user_group" "admins" {
  name         = "admins"
  user_pool_id = aws_cognito_user_pool.admin.id
  description  = "Admin users with full access"
}

# Editor User Group (for future use)
resource "aws_cognito_user_group" "editors" {
  name         = "editors"
  user_pool_id = aws_cognito_user_pool.admin.id
  description  = "Editor users with content management access"
}

# Employee User Group
resource "aws_cognito_user_group" "employees" {
  name         = "employees"
  user_pool_id = aws_cognito_user_pool.admin.id
  description  = "Employee users with personal email inbox access"
}
