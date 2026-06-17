variable "project_id" {
  type        = string
  description = "The GCP Project ID"
  default     = "virtual-promptwars-492614"
}

variable "region" {
  type        = string
  description = "The target deployment region for Cloud Run and Functions"
  default     = "asia-south1"
}

variable "location" {
  type        = string
  description = "GCP multi-region or regional location for buckets/Firestore"
  default     = "asia-south1"
}
