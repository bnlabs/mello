resource "aws_dynamodb_table" "mello_connected_users" {
  name           = "mello-connected-users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "ID"

  attribute {
    name = "ID"
    type = "S"
  }

  attribute {
    name = "username"
    type = "S"
  }

  attribute {
    name = "room"
    type = "S"
  }

  # Global Secondary Index for username
  global_secondary_index {
    name               = "UsernameIndex"
    hash_key           = "username"
    projection_type    = "ALL"
  }

  # Global Secondary Index for room
  global_secondary_index {
    name               = "RoomIndex"
    hash_key           = "room"
    projection_type    = "ALL"
  }

  # Enable server-side encryption
  server_side_encryption {
    enabled = true
  }

  # Tags for resource management
  tags = {
    Purpose    = "Store WebSocket user connections"
    ManagedBy  = "Terraform"
  }
}
