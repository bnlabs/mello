resource "aws_ssm_parameter" "ssm_access_key" {
  name  = "/mello/access-key"
  type  = "SecureString"
  value = "uninitialized"
 lifecycle {
    ignore_changes = [
      value,  # Ignore changes to the 'value' attribute
    ]
  }
}

resource "aws_ssm_parameter" "ssm_secret_key" {
  name  = "/mello/secret-key"
  type  = "SecureString"
  value = "uninitialized"
 lifecycle {
    ignore_changes = [
      value,  # Ignore changes to the 'value' attribute
    ]
  }
}
