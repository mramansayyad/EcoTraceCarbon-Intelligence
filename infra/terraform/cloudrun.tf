resource "google_service_account" "cloudrun_sa" {
  account_id   = "ecotrace-api-sa"
  display_name = "EcoTrace Cloud Run API Service Account"
  project      = var.project_id
}

resource "google_cloud_run_v2_service" "ecotrace_api" {
  name     = "ecotrace-api"
  location = var.region
  project  = var.project_id
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.cloudrun_sa.email

    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello:latest"

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }

      volume_mounts {
        name       = "secrets"
        mount_path = "/secrets"
      }
    }

    volumes {
      name = "secrets"
      secret {
        secret = google_secret_manager_secret.gemini_key.secret_id
        items {
          version = "latest"
          path    = "gemini-api-key"
        }
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  depends_on = [
    google_project_service.apis["run.googleapis.com"],
    google_service_account.cloudrun_sa,
    google_secret_manager_secret.gemini_key
  ]
}

resource "google_cloud_run_v2_service_iam_member" "noauth" {
  location = google_cloud_run_v2_service.ecotrace_api.location
  project  = google_cloud_run_v2_service.ecotrace_api.project
  name     = google_cloud_run_v2_service.ecotrace_api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
