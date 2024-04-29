resource "aws_cloudwatch_log_group" "ecs_logs" {
  name = "/ecs/mello-logs"  # Naming the log group
}
