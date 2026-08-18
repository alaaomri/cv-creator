# Agent Instructions & Architecture Guide: CV Studio Cloud

This document serves as the architectural reference and operating instructions for AI Agents interacting with, modifying, or extending the **CV Studio Cloud** codebase.

---

## 1. Project Overview & Personas

**CV Studio Cloud** is a full-stack, production-ready curriculum vitae engineering platform and web publisher. It serves three distinct user personas with isolated navigation surfaces:

1. **Candidate (Studio & Éditeur / Mes CVs)**:
   - Default application interface at `/`.
   - Comprehensive multi-section CV builder (Profile, Experiences, Education, Skills, Languages, Projects, Certifications, Custom Sections).
   - Real-time Gemini 3.7 Flash AI Copilot (bullet point generation, ATS keyword optimization, summary refinement).
   - 6 custom layout templates (*Modern Clean*, *Tech Developer*, *Executive*, *Creative Minimal*, *Academic Classic*, *Accent Split*) with customizable accent palette.
   - High-definition A4 PDF exporter (`html2canvas` + `jspdf`) and instant JSON import/export.
   - Multi-version management & CV duplication.
   - 1-click Web deployment with custom slug and QR Code generator.

2. **Recruiter / Public Viewer (`PublicCVPage`)**:
   - Accessed directly via URL parameter: `/?p=<custom-slug>`.
   - Strips all editing bars, studio navigation, and admin controls.
   - Renders a clean, high-performance, responsive presentation of the candidate's deployed CV.
   - Features: High-fidelity PDF download, direct email contact button, and automatic view count tracking.

3. **Administrator / SRE (`AdminPortal`)**:
   - Accessed via URL parameter `/?admin=true` or `/?view=admin`, keyboard shortcut <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd>, or the discreet footer link.
   - Business & Platform KPIs: Web deployment rate (%), PDF/JSON/Email export ratios, Gemini AI usage volume, Redis L2 cache hit-ratio, and template distribution.
   - Data Explorer & Inspector: Full search/filter across all candidate CVs in memory/DB, live status toggling, and interactive raw JSON modal inspector.
   - Global DB backup export (`/api/admin/export/all`).
   - Observability & live Prometheus telemetry feed (`/api/metrics`).

---

## 2. Directory Structure

```
├── AGENTS.md                  # This architecture and agent guidelines file
├── package.json               # Dependencies and scripts (dev, build, start, lint)
├── server.ts                  # Express backend, Gemini API proxy, REST API, caching & metrics
├── index.html                 # Single-page application root entry HTML
├── src/
│   ├── main.tsx               # React application entry point
│   ├── App.tsx                # Main router, navigation header, studio state & modal orchestrator
│   ├── types.ts               # Core TypeScript schemas (CVData, Experience, Education, Skill, etc.)
│   ├── data/
│   │   └── sampleCV.ts        # Pre-seeded reference developer/architect CV
│   ├── utils/
│   │   ├── pdfExport.ts       # Client-side A4 vector PDF engine (html2canvas + jsPDF)
│   │   └── cvTransformer.ts   # Normalization utilities for legacy/incoming payloads
│   └── components/
│       ├── admin/
│       │   └── AdminPortal.tsx            # Dedicated private Admin & Data Portal
│       ├── dashboard/
│       │   └── VersionManagerDashboard.tsx # Multi-version CV card manager & duplicator
│       ├── devops/
│       │   └── DevOpsArchitectureHub.tsx  # Interactive architecture & telemetry visualizer
│       ├── editor/
│       │   ├── CVFormEditor.tsx           # Multi-tab data entry form (sections, experiences, etc.)
│       │   └── LiveCVPreview.tsx          # Real-time preview container with zoom & page frame
│       ├── modals/
│       │   ├── AIAssistantModal.tsx       # AI prompt wizard for tailoring CV content
│       │   ├── PublishModal.tsx           # Web deployment, slug configurator & QR code modal
│       │   ├── ShareModal.tsx             # Email sharing & link copier
│       │   └── TemplateSelectorModal.tsx  # Visual gallery of the 6 layout templates
│       ├── public/
│       │   └── PublicCVPage.tsx           # Lightweight recruiter public landing page
│       └── templates/
│           ├── ModernCleanTemplate.tsx    # Two-column modern layout with left sidebar
│           ├── TechDeveloperTemplate.tsx  # Dark-accented developer layout with terminal badges
│           ├── ExecutiveTemplate.tsx      # Formal serif typography & balanced two-column grid
│           ├── CreativeMinimalTemplate.tsx# Minimalist layout with generous whitespace & bold rules
│           ├── AcademicClassicTemplate.tsx# ATS-compliant single-column academic format
│           └── AccentSplitTemplate.tsx    # Vibrant header banner & structured split content
```

---

## 3. Technology Stack & Runtime

- **Frontend**: React 18+, TypeScript, Vite, Tailwind CSS.
- **Icons**: `lucide-react` exclusively.
- **Animations / Micro-interactions**: `motion` (`motion/react`) & `canvas-confetti`.
- **Backend**: Node.js, Express (`server.ts`).
- **AI SDK**: `@google/genai` on the server using `process.env.GEMINI_API_KEY` (model: `gemini-3.7-flash`).
- **Port & Ingress**: Port `3000` on host `0.0.0.0` (required for container reverse proxy).

---

## 4. API Endpoints Reference

### Authentication & RBAC Endpoints
| Method | Path | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/auth/me` | Optional (Cookie/Header) | Returns current authenticated user session |
| `POST` | `/api/auth/login` | None | Authenticates user and issues 256-bit JWT HttpOnly cookie |
| `POST` | `/api/auth/register` | None | Registers a new account (default role: `USER`) |
| `POST` | `/api/auth/logout` | None | Clears authentication HttpOnly cookie |
| `POST` | `/api/auth/demo-switch` | None | 1-Click quick account switcher for testing (`ADMIN` vs `USER`) |

### Candidate & Studio Endpoints
| Method | Path | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cvs` | Optional | Returns all stored CVs in memory/DB |
| `GET` | `/api/cvs/:id` | Optional | Returns single CV with caching |
| `POST` | `/api/cvs` | Optional | Creates a new CV |
| `PUT` | `/api/cvs/:id` | Optional | Updates an existing CV (invalidates cache) |
| `DELETE` | `/api/cvs/:id` | Optional | Deletes a CV version |
| `POST` | `/api/cvs/:id/publish` | Optional | Toggles publication state and registers public slug |
| `POST` | `/api/cvs/:id/duplicate` | Optional | Creates a cloned version with a new unique ID |
| `POST` | `/api/ai/generate` | Optional | Server-side Gemini AI content enhancer & summary optimizer |

### Public & Recruiter Endpoints
| Method | Path | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/public/cv/:slug` | Public | Resolves public CV by slug, checks `isPublished`, increments `viewCount` |

### Admin, Tracking & Observability Endpoints
| Method | Path | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | **ADMIN** | Aggregated analytics (deployment rate, export ratios, template distribution, health) |
| `GET` | `/api/admin/cvs` | **ADMIN** | Full inventory with raw JSON payloads for the Admin Data Explorer |
| `GET` | `/api/admin/users` | **ADMIN** | User accounts directory with role management |
| `PUT` | `/api/admin/users/:id/role` | **ADMIN** | Promotes or demotes user privileges (`USER` <-> `ADMIN`) |
| `GET` | `/api/admin/export/all`| **ADMIN** | Downloads complete DB snapshot backup (records + activity logs) |
| `POST` | `/api/track/export` | Public | Telemetry tracker for PDF exports, JSON downloads, and email shares |
| `GET` | `/api/metrics` | Public | Prometheus-compatible metrics scraping endpoint |
| `GET` | `/api/health` | Public | System health check (status, uptime, memory, DB status) |

---

## 5. Architectural Principles & Security Layer

1. **JWT & HttpOnly Cookie Protocol**: Authentication uses SHA256-signed JWTs stored in `HttpOnly`, `SameSite=Lax` cookies to prevent XSS injection attacks. The server also supports fallback parsing from the `Authorization: Bearer <token>` header.
2. **Role-Based Access Control (RBAC)**: All administrative endpoints under `/api/admin/*` are strictly guarded by `requireAdmin` middleware. Unauthorized attempts return `HTTP 403 Forbidden`.
3. **API Proxy & Anti-Data Leak Middleware**: The backend employs an active interception proxy (`apiProxySecurityMiddleware`) on `res.json` that deep-scans and scrubs sensitive properties (`passwordHash`, `token`, `secret`, `apiKey`, `GEMINI_API_KEY`) from outgoing JSON responses.
4. **PostgreSQL / Supabase + Prisma ORM with In-Memory Fallback**: Production database connects to PostgreSQL/Supabase via Prisma ORM (`prisma/schema.prisma`). If the remote database is unreachable or unset, the server smoothly falls back to an in-memory replica with identical schema guarantees.
5. **Strict Key Privacy**: Never expose `GEMINI_API_KEY` or third-party credentials to the client. All generative AI calls MUST proxy through `server.ts` via `POST /api/ai/generate`.

---

## 6. Backend Technical Specifications (`server.ts`)

### 6.1 Runtime, Network & Ingress Constraints
- **Framework & Runtime**: Express 4.x on Node.js (v18+ LTS).
- **TypeScript Execution**:
  - *Development*: Handled natively via `tsx server.ts` with embedded Vite middleware (`createServer({ server: { middlewareMode: true }, appType: "spa" })`).
  - *Production*: Compiled into a single self-contained CommonJS artifact at `dist/server.cjs` via `esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap`.
- **Port & Host Binding**:
  - **Must bind strictly to `0.0.0.0:3000`**. The container ingress proxy routes all external traffic exclusively through port 3000. Any other port is unreachable.
- **Middleware Ordering**:
  1. `express.json({ limit: '10mb' })` and `express.urlencoded({ extended: true })` for incoming payload parsing.
  2. Request interceptor logging and global telemetry counter incrementation (`metrics.totalRequests++`).
  3. API routes mounted under `/api/*`.
  4. Static file serving / Vite SPA fallback middleware (`*` handler for `dist/index.html`).

---

### 6.2 Data Model & In-Memory Database Schema

The backend uses a thread-safe in-memory store (`cvDatabase = new Map<string, StoredCV>()`) seeded with a standard reference profile on boot.

#### Data Schema Definition:
```typescript
interface StoredCV {
  id: string;                      // Unique identifier (UUID or kebab-case slug)
  slug: string;                    // Public URL routing slug (e.g., 'alexandre-dubois-dev')
  title: string;                   // Internal version title (e.g., 'CV Lead DevOps Cloud')
  isPublished: boolean;            // Public access gatekeeper
  publishedAt?: string;            // ISO 8601 UTC timestamp of publication
  viewCount: number;               // Atomic counter incremented on GET /api/public/cv/:slug
  lastViewedAt?: string;           // ISO 8601 UTC timestamp of last recruiter consultation
  createdAt: string;               // ISO 8601 UTC timestamp of creation
  updatedAt: string;               // ISO 8601 UTC timestamp of latest mutation
  data: CVData;                    // Complete normalized CV document payload
}

interface CVData {
  id: string;
  templateId: 'modern-clean' | 'tech-developer' | 'executive' | 'creative-minimal' | 'academic-classic' | 'accent-split';
  primaryColor: string;            // Hex color code (e.g., '#0284c7')
  fontFamily: string;              // CSS font family definition
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone?: string;
    location?: string;
    summary?: string;
    avatarUrl?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  experiences: Array<{
    id: string;
    role: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description: string;
    highlights?: string[];
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    location?: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    category: 'tech' | 'soft' | 'tools' | 'languages';
    level?: number;                // 1 to 5 scale
  }>;
  languages?: Array<{ id: string; name: string; proficiency: string }>;
  projects?: Array<{ id: string; name: string; description: string; link?: string; tags?: string[] }>;
  certifications?: Array<{ id: string; name: string; issuer: string; date?: string; url?: string }>;
  customSections?: Array<{ id: string; title: string; content: string }>;
}
```

---

### 6.3 Caching Architecture & Invalidation Protocol

A simulated L2 TTL cache (`redisCache = new Map<string, { value: any, expiresAt: number }>()`) optimizes public read latency:

1. **Read Strategy (Cache-Aside)**:
   - When resolving `GET /api/cvs/:id` or `GET /api/public/cv/:slug`, the backend checks `redisCache.get(key)`.
   - If found and `Date.now() < item.expiresAt`: increments `metrics.cacheHits` and returns cached payload immediately (< 5ms response).
   - If missing or expired: increments `metrics.cacheMisses`, fetches from `cvDatabase`, seeds the cache with a 30-second TTL, and responds.
2. **Write & Invalidation Protocol**:
   - Every mutating request (`PUT /api/cvs/:id`, `POST /api/cvs/:id/publish`, `DELETE /api/cvs/:id`) MUST immediately execute `redisCache.delete(key)` for both `cv:id:${id}` and `cv:slug:${slug}` to guarantee data consistency.

---

### 6.4 Gemini AI Service Pipeline (`POST /api/ai/generate`)

Generative enhancements are performed server-side via the `@google/genai` SDK using `gemini-3.7-flash`:

- **Security Constraint**: `process.env.GEMINI_API_KEY` is loaded strictly in server-side scope and is never passed in client responses.
- **Lazy Initialization**: The client is initialized on-demand:
  ```typescript
  import { GoogleGenAI } from "@google/genai";
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  ```
- **Supported Operations**:
  - `generate_bullets`: Formats unstructured role details into high-impact, ATS-optimized action verbs and quantifiable achievements.
  - `improve_summary`: Refines executive bio/pitch to match candidate career level and industry tone.
  - `ats_keywords`: Recommends missing industry keywords based on the candidate's target job title.
  - `translate`: Translates CV sections into English, French, Spanish, or German while preserving technical terminology.
- **Graceful Fallback**: If `GEMINI_API_KEY` is not provided or rate limits are reached, the endpoint returns a deterministic, structured heuristic response with HTTP 200 and a warning flag (`isSimulatedFallback: true`), ensuring zero UI disruption.

---

### 6.5 Complete REST API Contract & Payloads

#### 1. `GET /api/cvs`
- **Response**: `{ success: true, count: number, items: StoredCV[] }`

#### 2. `GET /api/cvs/:id`
- **Response (200)**: `{ success: true, item: StoredCV, source: 'cache' | 'database' }`
- **Error (404)**: `{ success: false, error: 'CV non trouvé' }`

#### 3. `POST /api/cvs`
- **Request Body**: `{ title?: string, slug?: string, ...CVData }`
- **Response (201)**: `{ success: true, id: string, item: StoredCV }`

#### 4. `PUT /api/cvs/:id`
- **Request Body**: Full or partial `CVData` payload.
- **Response (200)**: `{ success: true, id: string, item: StoredCV }`

#### 5. `POST /api/cvs/:id/publish`
- **Request Body**: `{ isPublished: boolean, slug?: string }`
- **Response (200)**: `{ success: true, isPublished: boolean, slug: string, publicUrl: string }`

#### 6. `GET /api/public/cv/:slug`
- **Behavior**: Public access for recruiters. Verifies `item.isPublished === true`, atomically increments `item.viewCount`, updates `item.lastViewedAt`, and logs activity.
- **Response (200)**: `{ success: true, item: StoredCV, publicSlug: string }`
- **Error (403/404)**: `{ success: false, error: 'Ce CV est actuellement privé ou non publié.' }`

#### 7. `POST /api/track/export`
- **Request Body**: `{ type: 'pdf' | 'json' | 'email', cvId: string, candidateName?: string, title?: string }`
- **Response (200)**: `{ success: true, recorded: string, currentMetrics: object }`

#### 8. `GET /api/admin/stats`
- **Response (200)**:
  ```json
  {
    "success": true,
    "overview": {
      "totalCvs": 3,
      "publishedCvs": 2,
      "draftCvs": 1,
      "deploymentRatePercent": 66.7,
      "totalViews": 142,
      "totalExports": 33,
      "pdfExports": 18,
      "jsonExports": 6,
      "emailShares": 9,
      "exportToCreationRatio": 11.0,
      "aiGenerationsCount": 14,
      "cacheHitRatioPercent": 94.2,
      "totalRequests": 312,
      "uptimeSeconds": 1420
    },
    "templateDistribution": {
      "tech-developer": 2,
      "modern-clean": 1,
      "executive": 0
    },
    "recentActivity": [ ... ],
    "systemHealth": {
      "status": "HEALTHY",
      "memoryUsageMb": "42.5",
      "totalMemoryMb": "68.2",
      "cachedEntries": 3,
      "dbRecordsCount": 3
    }
  }
  ```

#### 9. `GET /api/admin/export/all`
- **Headers**: `Content-Disposition: attachment; filename=cv-studio-admin-backup-<timestamp>.json`
- **Response (200)**: Complete database snapshot with full records, activity history, and telemetry counters.

#### 10. `GET /api/metrics`
- **Purpose**: Prometheus pull scraping endpoint.
- **Response (200)**: Exposes standard metrics (`http_requests_total`, `cache_hit_ratio`, `active_cv_records`, `published_cv_records`, `pdf_exports_total`, `ai_invocations_total`, `process_uptime_seconds`, `nodejs_heap_used_bytes`).

#### 11. `GET /api/health`
- **Purpose**: Container liveness and readiness probe for Cloud Run ingress.
- **Response (200)**: `{ status: "ok", uptime: number, timestamp: string }`
