terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.0"
    }
    neon = {
      source  = "terraform-community-providers/neon"
      version = ">= 0.5"
    }
  }
}

# ──────────────────────────────────────────────
# Providers
# ──────────────────────────────────────────────

provider "google" {
  project = var.gcp_project
  region  = var.gcp_region
}

provider "neon" {
  project_id = var.neon_project_id
}

# ──────────────────────────────────────────────
# Neon PostgreSQL (DB)
# ──────────────────────────────────────────────

resource "neon_database" "main" {
  project_id = var.neon_project_id
  branch     = var.neon_branch_id
  db_name    = var.neon_db_name

  username = var.neon_db_user
  password = var.neon_db_password
}

# ──────────────────────────────────────────────
# Artifact Registry (Container images)
# ──────────────────────────────────────────────

resource "google_artifact_registry_repository" "repo" {
  project       = var.gcp_project
  location      = var.artifact_registry_location
  repository_id = var.artifact_registry_repository
  format        = "DOCKER"
}

# ──────────────────────────────────────────────
# Cloud Run Service
# ──────────────────────────────────────────────

resource "google_cloud_run_service" "service" {
  name     = var.cloud_run_service_name
  location = var.gcp_region

  template {
    spec {
      containers {
        image = "${google_artifact_registry_repository.repo.repository_url}:${var.image_tag}"

        env {
          name  = "DATABASE_URL"
          value = neon_database.main.connection_url
        }
        env {
          name  = "ADMIN_TOKEN"
          value = var.admin_token
        }
      }
    }
  }

  traffics {
    percent         = 100
    latest_revision = true
  }

  autogenerate_revision_name = true
}

# Make the Cloud Run service publicly accessible
resource "google_cloud_run_service_iam_member" "public_invoker" {
  service  = google_cloud_run_service.service.name
  location = google_cloud_run_service.service.location
  project  = google_cloud_run_service.service.project

  role   = "roles/run.invoker"
  member = "allUsers"
}

# ──────────────────────────────────────────────
# Outputs
# ──────────────────────────────────────────────

output "cloud_run_url" {
  description = "Public URL of the Cloud Run service"
  value       = google_cloud_run_service.service.status[0].url
}

output "postgres_connection_url" {
  description = "Neon Postgres connection URL"
  value       = neon_database.main.connection_url
  sensitive   = true
}
