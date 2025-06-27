// variables.tf

// ──────────────────────────────────────────────
// Google Cloud
// ──────────────────────────────────────────────

variable "gcp_project" {
  type        = string
  description = "GCP project ID where Cloud Run & Artifact Registry will be created"
}

variable "gcp_region" {
  type        = string
  default     = "us-central1"
  description = "GCP region for Cloud Run, Artifact Registry, etc."
}

variable "cloud_run_service_name" {
  type        = string
  default     = "feedback-service"
  description = "Name of the Cloud Run service"
}

// ──────────────────────────────────────────────
// Neon PostgreSQL (Database)
// ──────────────────────────────────────────────

variable "neon_project_id" {
  type        = string
  description = "Neon project identifier"
}

variable "neon_branch_id" {
  type        = string
  default     = "main"
  description = "Neon branch to deploy to (e.g. 'main')"
}

variable "neon_db_user" {
  type        = string
  description = "Username for Neon database"
}

variable "neon_db_password" {
  type      = string
  sensitive = true
  description = "Password for Neon database"
}

variable "neon_db_name" {
  type        = string
  default     = "defaultdb"
  description = "Database name on Neon"
}

// ──────────────────────────────────────────────
// Artifact Registry (Container images)
// ──────────────────────────────────────────────

variable "artifact_registry_repository" {
  type        = string
  default     = "feedback-service"
  description = "Artifact Registry repository name"
}

variable "artifact_registry_location" {
  type        = string
  default     = "us-central1"
  description = "Location for the Artifact Registry repository"
}

variable "image_tag" {
  type        = string
  default     = "latest"
  description = "Tag for the Docker image to deploy"
}

// ──────────────────────────────────────────────
// App‐specific
// ──────────────────────────────────────────────

variable "admin_token" {
  type      = string
  sensitive = true
  description = "ADMIN_TOKEN to protect your /admin endpoints"
}
