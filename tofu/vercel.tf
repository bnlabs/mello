
resource "vercel_project" "mello" {
  name      = "mello"
  framework = "nuxtjs"
  git_repository = {
    type = "github"
    repo = "bnlabs/mello"
    production_branch = "main"
  }
}