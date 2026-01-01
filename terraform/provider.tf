terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Using local backend for initial deployment
  # Migrate to S3 backend later for team collaboration
  # backend "s3" {
  #   bucket         = "philocom-terraform-state"
  #   key            = "portfolio/terraform.tfstate"
  #   region         = "eu-central-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Philocom Portfolio"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
