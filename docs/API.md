# EcoTrace API Specification

All endpoints require JWT token verification via the `Authorization: Bearer <token>` header (except health check).

## Auth Headers
```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 1. Activities Log
Manage personal carbon activity entries.

### POST `/activities`
Create an activity log.
- **Request Body:**
  ```json
  {
    "category": "transport",
    "subcategory": "car",
    "value": 15.5,
    "details": {
      "vehicleType": "petrol",
      "passengers": 1
    },
    "timestamp": "2026-06-15T23:00:00Z"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "act_doc_id",
    "uid": "user_id",
    "category": "transport",
    "subcategory": "car",
    "value": 15.5,
    "kg_co2e": 3.255,
    "details": {
      "vehicleType": "petrol",
      "passengers": 1
    },
    "timestamp": "2026-06-15T23:00:00Z"
  }
  ```

### GET `/activities`
Retrieve paginated activities for the logged-in user.
- **Query Params:**
  - `limit`: number (default: 10)
  - `startAfter`: string (doc ID cursor)
- **Response (200 OK):**
  ```json
  [
    {
      "id": "act_id",
      "category": "food",
      "subcategory": "beef",
      "value": 2,
      "kg_co2e": 13.22,
      "timestamp": "2026-06-15T22:00:00Z"
    }
  ]
  ```

### DELETE `/activities/:id`
Delete an activity entry.
- **Response (200 OK):**
  ```json
  { "message": "Activity successfully deleted" }
  ```

---

## 2. Dashboard
Pulls aggregated metrics and trend arrays.

### GET `/dashboard`
- **Response (200 OK):**
  ```json
  {
    "stats": {
      "today": { "value": 12.5, "deltaPct": -5.2 },
      "week": { "value": 38.2, "deltaPct": -1.5 },
      "month": { "value": 142.1, "vsNationalAvgPct": -10.2 },
      "streak": { "days": 5 }
    },
    "charts": {
      "trend": [
        { "date": "2026-06-15", "value": 12.5, "rollingAvg": 11.2 }
      ],
      "categories": [
        { "category": "transport", "value": 15.5, "percentage": 40.5 }
      ]
    },
    "recentActivities": []
  }
  ```

---

## 3. Gemini AI Insights

### POST `/ai/insights`
Generate weekly carbon budget evaluation feedback.
- **Response (200 OK):**
  ```json
  { "insight": "Great job reducing transport emissions this week. Consider cutting electricity..." }
  ```

### POST `/ai/chat`
Streaming chatbot interface utilizing Server-Sent Events (SSE).
- **Request Body:**
  ```json
  {
    "history": [
      { "role": "user", "parts": [{ "text": "How do I cut down electricity footprint?" }] }
    ]
  }
  ```
- **Response Stream (text/event-stream):**
  Chunks returned in format:
  ```
  data: {"text": "You can "}
  data: {"text": "switch to "}
  data: {"text": "LED lighting..."}
  data: [DONE]
  ```

---

## 4. Reduction Goals

### POST `/goals`
Create reduction targets.
- **Request Body:**
  ```json
  {
    "category": "all",
    "targetReductionPct": 15,
    "durationWeeks": 4
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "goal_id",
    "category": "all",
    "targetReductionPct": 15,
    "durationWeeks": 4,
    "baselineWeekly": 44.0,
    "targetWeekly": 37.4,
    "status": "active",
    "createdAt": "2026-06-15T23:00:00Z"
  }
  ```

### GET `/goals`
Fetch user reduction goals list.

### GET `/goals/:id/progress`
Aggregate weekly performance vs targets.
- **Response (200 OK):**
  ```json
  [
    {
      "weekIndex": 1,
      "startDate": "2026-06-15",
      "endDate": "2026-06-22",
      "target": 37.4,
      "actual": 34.2
    }
  ]
  ```

---

## 5. Community & Leaderboards

### GET `/community`
Compare user standing to regional standards and anonymous leaderboards.
- **Response (200 OK):**
  ```json
  {
    "percentile": 82,
    "leaderboard": [
      { "displayName": "A*", "weekly_kg_co2e": 28.5, "rank": 1, "isCurrentUser": false }
    ],
    "benchmarks": {
      "indiaWeeklyAvg": 36.5,
      "globalWeeklyAvg": 90.4,
      "carbonBudgetWeeklyTarget": 44.2
    }
  }
  ```

---

## 6. Export Reports

### GET `/export/csv`
Download spreadsheet logs. If `stream=true`, pipes directly. Otherwise uploads to storage.

### GET `/export/pdf`
Download Monthly summary report in PDF format. If `stream=true`, pipes directly. Otherwise uploads to storage.
