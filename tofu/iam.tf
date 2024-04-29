resource "aws_iam_role" "ecs_execution_role" {
  name = "ecs_execution_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        },
        Effect = "Allow",
      },
    ]
  })

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
  ]
}

resource "aws_iam_role" "ecs_task_role" {
  name = "ecs_task_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        },
        Effect = "Allow",
      },
    ]
  })

  # Attach additional policies if needed
}

resource "aws_iam_policy" "ssm_access" {
  name        = "SSMParameterAccess"
  description = "Allow access to specific SSM parameters required by ECS tasks"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "ssm:GetParameters",
          "ssm:GetParameter",
          "ssm:DescribeParameters"
        ],
        Resource = [
          "arn:aws:ssm:us-east-1:915898657279:parameter/mello/access-key",
          "arn:aws:ssm:us-east-1:915898657279:parameter/mello/secret-key"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_access_attach" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = aws_iam_policy.ssm_access.arn
}

resource "aws_iam_policy" "ecs_logging" {
  name        = "ecs_logging"
  path        = "/"
  description = "Allows ECS tasks to send logs to CloudWatch"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Effect = "Allow",
        Resource = aws_cloudwatch_log_group.ecs_logs.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_logging_attachment" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = aws_iam_policy.ecs_logging.arn
}