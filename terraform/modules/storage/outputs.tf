output "images_bucket_name" {
  description = "S3 bucket name for images"
  value       = aws_s3_bucket.images.bucket
}

output "images_bucket_arn" {
  description = "S3 bucket ARN for images"
  value       = aws_s3_bucket.images.arn
}

output "images_bucket_regional_domain" {
  description = "S3 bucket regional domain name"
  value       = aws_s3_bucket.images.bucket_regional_domain_name
}

output "images_bucket_domain_name" {
  description = "S3 bucket domain name"
  value       = aws_s3_bucket.images.bucket_domain_name
}
