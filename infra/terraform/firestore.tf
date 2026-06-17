resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.location
  type        = "FIRESTORE_ONLY"

  concurrency_mode           = "OPTIMISTIC"
  app_engine_integration_mode = "DISABLED"

  depends_on = [google_project_service.apis["firestore.googleapis.com"]]
}
