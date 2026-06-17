resource "google_storage_bucket" "exports" {
  name                        = "ecotrace-exports-${var.project_id}"
  location                    = var.location
  project                     = var.project_id
  force_destroy               = true
  uniform_bucket_level_access = true

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = 1 # 1 day / 24 hours
    }
  }

  depends_on = [google_project_service.apis["storage.googleapis.com"]]
}
