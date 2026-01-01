output "ses_verified_email" {
  description = "SES verified email identity"
  value       = aws_ses_email_identity.noreply.email
}

output "ses_identity_arn" {
  description = "SES email identity ARN"
  value       = aws_ses_email_identity.noreply.arn
}

output "ses_configuration_set_name" {
  description = "SES configuration set name"
  value       = aws_ses_configuration_set.main.name
}

output "ses_send_email_policy_arn" {
  description = "IAM policy ARN for SES send email"
  value       = aws_iam_policy.ses_send_email.arn
}
