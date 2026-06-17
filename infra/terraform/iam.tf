# Datastore User for Cloud Run SA to read/write Firestore
resource "google_project_iam_member" "cloudrun_firestore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

# Vertex AI User for Cloud Run SA to call Gemini
resource "google_project_iam_member" "cloudrun_vertex" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

# Pub/Sub Publisher for Cloud Run SA to ingest activities
resource "google_project_iam_member" "cloudrun_pubsub" {
  project = var.project_id
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

# Secret Manager Access for Cloud Run SA
resource "google_secret_manager_secret_iam_member" "gemini_accessor" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.gemini_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "maps_accessor" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.maps_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "electricity_map_accessor" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.electricity_map_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

# Storage Access for Cloud Run SA on the exports bucket
resource "google_storage_bucket_iam_member" "cloudrun_storage" {
  bucket = google_storage_bucket.exports.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

# Datastore User for Cloud Functions SA to read/write Firestore
resource "google_project_iam_member" "functions_firestore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.functions_sa.email}"
}

# Vertex AI User for Cloud Functions SA to call Gemini
resource "google_project_iam_member" "functions_vertex" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.functions_sa.email}"
}

# Secret Manager Access for Cloud Functions SA
resource "google_secret_manager_secret_iam_member" "functions_gemini_accessor" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.gemini_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.functions_sa.email}"
}
