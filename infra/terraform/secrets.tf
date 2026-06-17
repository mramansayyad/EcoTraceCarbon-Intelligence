resource "google_secret_manager_secret" "gemini_key" {
  secret_id = "gemini-api-key"
  project   = var.project_id
  replication {
    automatic = true
  }
  depends_on = [google_project_service.apis["secretmanager.googleapis.com"]]
}

resource "google_secret_manager_secret" "maps_key" {
  secret_id = "maps-api-key"
  project   = var.project_id
  replication {
    automatic = true
  }
  depends_on = [google_project_service.apis["secretmanager.googleapis.com"]]
}

resource "google_secret_manager_secret" "electricity_map_key" {
  secret_id = "electricity-map-key"
  project   = var.project_id
  replication {
    automatic = true
  }
  depends_on = [google_project_service.apis["secretmanager.googleapis.com"]]
}
