resource "google_monitoring_dashboard" "ecotrace_dashboard" {
  project        = var.project_id
  dashboard_json = <<EOF
{
  "displayName": "EcoTrace Platform Performance Dashboard",
  "gridLayout": {
    "columns": "2",
    "widgets": [
      {
        "title": "Cloud Run Request Count",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/request_count\"",
                  "aggregation": {
                    "alignmentPeriod": "60s",
                    "crossSeriesReducer": "REDUCE_SUM",
                    "perSeriesAligner": "ALIGN_RATE"
                  }
                }
              },
              "targetAxis": "Y1"
            }
          ]
        }
      },
      {
        "title": "Cloud Run Latency",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/request_latencies\"",
                  "aggregation": {
                    "alignmentPeriod": "60s",
                    "perSeriesAligner": "ALIGN_PERCENTILE_99"
                  }
                }
              },
              "targetAxis": "Y1"
            }
          ]
        }
      }
    ]
  }
}
EOF

  depends_on = [google_project_service.apis["monitoring.googleapis.com"]]
}
