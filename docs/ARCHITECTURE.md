# EcoTrace System Architecture

EcoTrace is a modern Carbon Footprint Awareness PWA built on Google Cloud Platform (GCP).

## System Architecture Diagram
Refer to the C4 diagram in the [Implementation Plan](../implementation_plan.md) for a visual summary.

## Component Layers

### 1. Frontend Client
- **Framework:** Next.js 14 (App Router) + TypeScript.
- **State Management:**
  - **Zustand:** Synchronous client-only UI/Modal states (`uiStore.ts`) and user authentication contexts (`authStore.ts`).
  - **React Query:** Asynchronous server cache synchronization, cache invalidations (e.g., refreshing `dashboard` query when log activity succeeds).
- **Styling:** Tailwind CSS v4 variables mapping with custom Space Grotesk display typography and a custom forest floor dark theme.
- **Charts:** Recharts SVG components displaying carbon trend and breakdown metrics.

### 2. Backend Server
- **Framework:** Express.js (Node 20 runtime), containerized with Docker.
- **Routing:** Segmented endpoints for Activities, Dashboard, Goals, Community, and Exports.
- **Services:**
  - `emissionService.ts`: Standard EPA calculation engine.
  - `geminiService.ts`: Connects to Vertex AI SDK using Gemini 1.5 Pro to stream chat feedback and generate insights.
  - `exportService.ts`: Compiles CSV files and PDF document pipelines.
- **Middleware:**
  - `auth.ts`: Decodes and verifies Firebase client ID tokens.
  - `rateLimit.ts`: Protects chatbot and data generation endpoints.
  - `validate.ts`: Enforces strict compile-time check using Zod schemas.

### 3. Database & Authentication
- **Firestore:** Multi-document NoSQL database holding collections:
  - `users`: User Profile data, baseline weekly target, streak days.
  - `activities`: Individual daily carbon emission records.
  - `goals`: Active target scopes (transport, food, energy, shopping, all).
  - `emission_factors`: Reference coefficients.
- **Firebase Auth:** Handles registration, OAuth logins, and session token generation.

### 4. Background Workers (Cloud Functions)
- **weeklySummary:** Triggered weekly by Pub/Sub event to calculate 7-day carbon totals, updating user baseline metrics.
- **emissionFactorSync:** Scheduled weekly cron synchronizing Firestore coefficients.
- **goalNudge:** Runs daily to inspect logging inactivity (alerting if > 3 days since last active date).

### 5. Secrets Management
- Enforced security utilizing GCP Secret Manager. Loaded environment variables map to fallbacks locally.
