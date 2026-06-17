resource "google_service_account" "functions_sa" {
  account_id   = "ecotrace-functions-sa"
  display_name = "EcoTrace Cloud Functions Service Account"
  project      = var.project_id
}

resource "google_storage_bucket" "functions_source" {
  name                        = "ecotrace-functions-source-${var.project_id}"
  location                    = var.location
  project                     = var.project_id
  force_destroy               = true
  uniform_bucket_level_access = true

  depends_on = [google_project_service.apis["storage.googleapis.com"]]
}
