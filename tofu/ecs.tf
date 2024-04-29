resource "aws_ecs_cluster" "mello_ecs_cluster" {
  name = "mello-cluster"
}

resource "aws_ecs_task_definition" "mello_task" {
  family                   = "mello-deploy"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name        = "mello",
    image       = "${aws_ecr_repository.mello_image_repository.repository_url}:latest",
    cpu         = 256,
    memory      = 512,
    essential   = true,
    portMappings = [{
      containerPort = 3000,
      hostPort      = 3000,
      protocol      = "tcp"
    }],
    secrets = [
      {
        name      = "AWS_ACCESS_KEY_ID",
        valueFrom = "/mello/access-key"
      },
      {
        name      = "AWS_SECRET_ACCESS_KEY",
        valueFrom = "/mello/secret-key"
      }
    ],
    logConfiguration = {
      logDriver = "awslogs",
      options = {
        awslogs-group         = aws_cloudwatch_log_group.ecs_logs.name,
        awslogs-region        = "us-east-1",  # Specify your AWS region
        awslogs-stream-prefix = "ecs"
      }
    }
  }])
}