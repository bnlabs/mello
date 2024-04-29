resource "aws_ecr_repository" "mello_image_repository" {
  name                 = "mello"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository_policy" "public_policy" {
  repository = aws_ecr_repository.mello_image_repository.name

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid    = "AllowPublicPull"
        Effect = "Allow"
        Principal = "*"
        Action   = "ecr:GetDownloadUrlForLayer",
        Action   = "ecr:BatchGetImage",
        Action   = "ecr:BatchCheckLayerAvailability"
      }
    ]
  })
}
