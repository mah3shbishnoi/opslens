# OpsLens — Engineering Operations Console

**OpsLens** is an editorial engineering operations and repository observability console designed for software engineering teams and technical leaders. Rather than simulating synthetic infrastructure metrics, OpsLens connects to live source code repository telemetry via the **GitHub REST API** to answer critical operational questions:

* What is the engineering team actively delivering?
* How quickly are pull requests reviewed and merged into the main branch?
* Are unresolved issues accumulating or decreasing over time?
* What is the frequency and cadence of production milestone releases?
* Who are the active contributors driving the codebase?
* Are there anomalies or velocity drops in recent engineering throughput?

---

## Key Capabilities & Views

### 1. Operations Overview
* **Repository Identity**: Direct metadata inspection (stars, forks, open work, default branch, language, license).
* **Engineering Activity Visualization**: Continuous 30-day commit volume trajectory plotted via restrained, publication-grade charts.
* **Dual-Flow Analysis**: Asymmetric comparison between **Pull Request Velocity** (open, merged, average merge duration) and **Issue Resolution Flow** (open backlog, closed ratio).
* **Chronological Activity Stream**: Unified, real-time activity feed spanning code merges, branch pushes, issue filings, and tag releases.
* **Milestone Highlight**: Detailed breakdown of the latest published release and changelog notes.

### 2. Pull Request Pipeline (`/pull-requests`)
* Real-time tracking of open, merged, and closed pull requests.
* Inspection of author identity, branch transitions (`head` &rarr; `base`), relative PR age, and scoped labels.
* Slide-out PR Dossier with markdown description rendering and direct GitHub links.
* URL state persistence (`/pull-requests?state=open&search=compiler`).

### 3. Issue Triage & Resolution (`/issues`)
* Separation of active backlog items from resolved tickets.
* Author tracking, label badges with luminance-aware contrast, community reply counts, and age metrics.
* Detail inspection drawer for deep context.

### 4. Commit Activity Stream (`/commits`)
* Chronological timeline grouped by calendar date.
* Commit SHAs with one-click copy, author avatars, and multi-line commit message formatting.

### 5. Releases & Milestones (`/releases`)
* Prominent latest stable release hero milestone with changelog notes.
* Historical releases timeline tracking release notes and asset distributions.
* Derived **Release Cadence** metric calculating the average days between releases.

### 6. Contributor Directory (`/contributors`)
* Ranked catalog of core maintainers and open-source contributors.
* Relative activity share progress bar computing proportional codebase ownership.

### 7. Console Configuration & Token Manager (`/settings`)
* **Repository Switcher**: Switch between curated engineering projects (`vuejs/core`, `facebook/react`, `vitejs/vite`, `tailwindlabs/tailwindcss`, `denoland/deno`) or analyze any custom public GitHub repository (`owner/repo`).
* **GitHub Personal Access Token (PAT)**: Optional token configuration stored strictly in browser `localStorage` to expand API quota from 60 req/hour to 5,000 req/hour.
* **Appearance Toggle**: Light-first warm editorial theme or high-contrast dark charcoal mode.
* **API Quota Gauge**: Real-time remaining calls and reset countdown.

---

## Telemetry Architecture & Data Source

OpsLens connects directly to GitHub's public REST API v3 using a decoupled, service-oriented architecture:

```
GitHub REST API v3 (api.github.com)
  ↓
API Client & Rate Quota Inspector (src/api/github/client.ts)
  ↓
Resource Fetchers (repositories, pullRequests, issues, commits, releases, contributors)
  ↓
Data Transformation & Sanitization
  ↓
Pinia Central State (repositoryStore.ts & preferencesStore.ts)
  ↓
Computed Derived Analytics & Formula Layer
  ↓
Light-First Editorial Vue 3 Interface
```

### GitHub API Endpoints Used

| Endpoint | Method | Purpose in OpsLens |
| :--- | :--- | :--- |
| `/repos/{owner}/{repo}` | GET | Repository metadata, stars, forks, language, license, open issue count |
| `/repos/{owner}/{repo}/pulls` | GET | Pull request pipeline, merge timestamps, review branches |
| `/repos/{owner}/{repo}/issues` | GET | Issue tracking and community discussions (PR items filtered out) |
| `/repos/{owner}/{repo}/commits` | GET | Revision history and commit volume over time |
| `/repos/{owner}/{repo}/releases` | GET | Tagged milestones and changelog markdown notes |
| `/repos/{owner}/{repo}/contributors` | GET | Contributor rankings and total commit shares |

### Metrics Directly Returned vs. Calculated by OpsLens

#### Directly Returned by GitHub:
* Star and fork counts
* Open issues counter
* Individual commit timestamps and author identities
* Pull request creation and merge timestamps (`created_at`, `merged_at`)
* Release publish timestamps

#### Calculated by OpsLens (Derived Analytics):
* **Open Work Volume**: `open_issues_count + open_prs_count`
* **PR Merge Velocity**: `average(merged_at - created_at)` across merged pull requests (expressed in hours or days).
* **Release Cadence**: `average(release[i].published_at - release[i+1].published_at)` in days.
* **Issue Resolution Ratio**: `closed_issues / (open_issues + closed_issues) * 100` (percentage).
* **30-Day Commit Trend**: Daily bucket aggregation grouped by author commit dates.
* **Engineering Velocity Index**: Transparent composite score: `commits * 1.5 + merged_prs * 3.0 + closed_issues * 2.0`.

### Rate Limiting & Demo Fallback Strategy
* **Rate Limits**: Unauthenticated browser requests are subject to GitHub's IP rate limit of 60 requests per hour. Authenticated requests with a Personal Access Token receive 5,000 requests per hour.
* **Quota Tracking**: OpsLens reads `x-ratelimit-remaining`, `x-ratelimit-limit`, and `x-ratelimit-reset` on every API response.
* **Fallback Guarantee**: If rate limits are exhausted or network connectivity fails, OpsLens automatically transitions to a curated sample dataset for `vuejs/core`.
* **Honest Transparency**: OpsLens **never** fakes live data. When operating in fallback mode, a distinct notice banner alerts the operator:
  > *"Notice: Live GitHub API unreachable (rate limit or offline) — displaying curated sample dataset."*

---

## Design System Principles

OpsLens intentionally avoids generic AI-generated templates:
* **Light-First Canvas**: Crafted on a warm, editorial `#FAFAF9` stone canvas with dark charcoal ink typography (`#1C1917`).
* **Editorial Composition**: Replaces repetitive 4-card grids with horizontal information bands, asymmetric columns, two-flow comparative strips, and high-density data tables.
* **Typography as Hierarchy**: Uses font weights, uppercase tracking, and tabular figures (`tabular-nums`) to direct focus without visual noise.
* **Monospace Selectivity**: Monospace font (`JetBrains Mono`) is reserved strictly for technical tokens: commit SHAs, PR numbers, version tags, and timestamps.
* **Restrained Palette**: Single-purpose semantic accents (Emerald for open items, Violet for merges, Rose for closed issues, Cobalt for links).

---

## Tech Stack

* **Framework**: Vue 3 (Composition API with `<script setup>`)
* **Type System**: Strict TypeScript
* **State Management**: Pinia
* **Routing**: Vue Router 4 (with URL query synchronization)
* **Styling**: Tailwind CSS with bespoke editorial tokens
* **Charting**: Apache ECharts (`echarts`)
* **Icons**: Lucide Icons (`lucide-vue-next`)

---

## Local Development

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/mah3shbishnoi/opslens.git
cd opslens
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```
Type checks the application via `vue-tsc` and compiles optimized static assets using Vite.

---

## License
MIT License &copy; 2025 OpsLens Contributors
