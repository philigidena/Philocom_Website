# DynamoDB Table for Projects
resource "aws_dynamodb_table" "projects" {
  name           = "${var.project_name}-${var.environment}-projects"
  billing_mode   = "PAY_PER_REQUEST"  # Free tier eligible
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "N"
  }

  global_secondary_index {
    name            = "CreatedAtIndex"
    hash_key        = "createdAt"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = false
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-projects"
    }
  )
}

# DynamoDB Table for Testimonials
resource "aws_dynamodb_table" "testimonials" {
  name           = "${var.project_name}-${var.environment}-testimonials"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "featured"
    type = "N"
  }

  global_secondary_index {
    name            = "FeaturedIndex"
    hash_key        = "featured"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-testimonials"
    }
  )
}

# DynamoDB Table for Contact Submissions
resource "aws_dynamodb_table" "contacts" {
  name           = "${var.project_name}-${var.environment}-contacts"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "submittedAt"
    type = "N"
  }

  global_secondary_index {
    name            = "SubmittedAtIndex"
    hash_key        = "submittedAt"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-contacts"
    }
  )
}

# DynamoDB Table for Newsletter Subscribers
resource "aws_dynamodb_table" "newsletter" {
  name           = "${var.project_name}-${var.environment}-newsletter"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "email"

  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "subscribedAt"
    type = "N"
  }

  global_secondary_index {
    name            = "SubscribedAtIndex"
    hash_key        = "subscribedAt"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-newsletter"
    }
  )
}

# DynamoDB Table for Blog Posts
resource "aws_dynamodb_table" "blog_posts" {
  name           = "${var.project_name}-${var.environment}-blog-posts"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "publishedAt"
    type = "N"
  }

  attribute {
    name = "category"
    type = "S"
  }

  global_secondary_index {
    name            = "PublishedAtIndex"
    hash_key        = "publishedAt"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "CategoryIndex"
    hash_key        = "category"
    range_key       = "publishedAt"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-blog-posts"
    }
  )
}
