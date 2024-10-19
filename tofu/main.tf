# terraform {
#   required_providers {
#     aws = {
#         source = "hashicorp/aws",
#         version =  "~> 5.31"
#     }
#   }

#   required_version = ">= 1.2.0"

#   backend "s3" {
#     bucket         = "mello-state-bucket"
#     key            = "state"
#     region         = "us-east-1"
#     dynamodb_table = "mello-tofu-state-lock"
#     encrypt        = false
#   }
# }

# provider "aws" {
#     region  = "us-east-1"
#     # profile = "default" # uncomment for local development
# }

terraform {
  required_providers {
    vercel = {
      source = "vercel/vercel"
      version = "~> 0.3"
    }
  }
}

provider "vercel" {
  # Or omit this for the api_token to be read
  # from the VERCEL_API_TOKEN environment variable
  api_token = ""
}