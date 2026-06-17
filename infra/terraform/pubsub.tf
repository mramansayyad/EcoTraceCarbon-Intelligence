resource "google_pubsub_topic" "activities" {
  name    = "activities"
  project = var.project_id

  depends_on = [google_project_service.apis["pubsub.googleapis.com"]]
}

resource "google_pubsub_subscription" "activities_sub" {
  name    = "activities-subscription"
  topic   = google_pubsub_topic.activities.name
  project = var.project_id

  ack_deadline_seconds = 60

  depends_on = [google_project_service.apis["pubsub.googleapis.com"]]
}
