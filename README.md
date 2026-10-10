# 🏙️ CivicAlert - Public Infrastructure Issue Reporting & Management System

[![Status](https://img.shields.io/badge/status-active_production-emerald.svg)](https://public-infra-reporting.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node: >=22](https://img.shields.io/badge/node-%3E%3D22.0.0-green.svg)](https://nodejs.org)
[![Tests: Passing](https://img.shields.io/badge/tests-7%2F7%20passing-brightgreen.svg)](#)

A digital platform empowering citizens to report public infrastructure issues (such as potholes, broken streetlights, overflowing garbage, blocked drainage, and damaged amenities) with exact GPS coordinates and photographic evidence, while providing municipal authorities with a centralized dashboard to prioritize, dispatch, track, and verify resolutions.

---

## 🚀 Quick Start (Opening in VS Code)

### 1. Open in Visual Studio Code
Open your terminal and run:
```bash
code C:\Users\ELCOT\.gemini\antigravity\scratch\public-infra-reporting
```
*(Or open VS Code, click **File > Open Folder...**, and select `C:\Users\ELCOT\.gemini\antigravity\scratch\public-infra-reporting`)*

### 2. Run the Full Stack Application
In VS Code, open the integrated terminal (`Ctrl + \``) and run:
```bash
npm run dev
```
This runs both the Express backend API and the Vite React frontend concurrently:
- **Frontend Portal:** [http://localhost:3000](http://localhost:3000)
- **Backend REST API:** [http://localhost:5000](http://localhost:5000)

### 3. VS Code One-Click Debugging & Tasks
- Press **`F5`** to launch the pre-configured **"Run Full Stack"** debugger profile.
- Press **`Ctrl + Shift + B`** to trigger the build and start task.

---

## 🌟 Key Features

### 👤 Citizen Portal
- **Interactive Reporting Wizard:**
  - Categorized issues: *Roads & Potholes*, *Broken Streetlights*, *Waste & Garbage*, *Drainage & Water Leakage*, *Traffic Signals*, *Public Parks & Facilities*.
  - Drag-and-drop photographic evidence upload with instant preview.
  - Interactive Leaflet / OpenStreetMap pinpointing with auto-reverse geocoding to street address.
  - "Use My Current GPS Location" button.
  - Urgency indicator (*Low*, *Medium*, *High*, *Critical Hazard*).
- **Public City Map & Feed:**
  - Interactive OpenStreetMap with color-coded incident markers.
  - Multi-criteria filtering (by status, category, urgency, or keyword search).
  - Community upvoting (*"Me Too"*) to prioritize high-impact issues without duplicate reports.
- **Visual Complaint Tracker:**
  - Search by Ticket ID (e.g. `INFRA-1001`).
  - 5-stage visual progress pipeline (*Reported* $\rightarrow$ *Under Review* $\rightarrow$ *Assigned* $\rightarrow$ *In Progress* $\rightarrow$ *Resolved*).
  - Before/After evidence comparison photos.
  - Citizen satisfaction feedback & 5-star rating system upon resolution.

### 🏛️ Municipal Authority & Admin Operations Console
- **Executive Analytics:**
  - Real-time metrics: Total issues, pending review, currently in progress, resolved, critical hazards.
  - Department workload distribution and resolution rate metrics.
- **Triage & Department Assignment:**
  - Assign issues to departments (*Roads & Highways*, *Sanitation & Waste*, *Electrical Board*, *Water & Drainage*, *Parks & Amenities*).
  - Assign specific field inspectors or maintenance crews.
- **Audit Trail & Proof of Work:**
  - Official remarks and action notes recorded on each status transition.
  - Upload resolution proof photos (*After-Fix Photo*) before marking resolved.
- **Export Reports:**
  - One-click CSV export of municipal complaints.

---

## 📂 Project Architecture

```
public-infra-reporting/
├── .vscode/                  # VS Code turnkey settings & launch configurations
│   ├── launch.json           # F5 debug configurations
│   ├── tasks.json            # npm tasks
│   ├── settings.json         # Workspace format settings
│   └── extensions.json       # Recommended extensions
├── server/                   # Express.js REST API
│   ├── data/                 # SQLite database (using Node.js 24 built-in node:sqlite)
│   │   └── infra_issues.sqlite
│   ├── uploads/              # Uploaded photographic evidence
│   ├── db.js                 # SQLite schema, tables & seed data
│   ├── server.js             # API routes & multer file handling
│   └── package.json
├── client/                   # Modern React Frontend (Vite + Tailwind CSS)
│   ├── index.html
│   ├── vite.config.js        # Configured proxy to :5000 backend
│   ├── tailwind.config.js
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── IssueCard.jsx
│       │   ├── IssueMap.jsx   # Interactive Leaflet OpenStreetMap
│       │   ├── StatusBadge.jsx
│       │   └── Timeline.jsx   # 5-stage progress pipeline
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── ReportIssuePage.jsx
│       │   ├── TrackIssuePage.jsx
│       │   └── AdminDashboardPage.jsx
│       ├── services/
│       │   └── api.js        # Fetch API client & reverse geocoding
│       ├── App.jsx
│       └── main.jsx
├── package.json              # Root package orchestrating dev servers
└── README.md
```

---

## 📡 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register` | `POST` | Register a new citizen account |
| `/api/auth/login` | `POST` | Authenticate citizen or municipal officer |
| `/api/auth/me` | `GET` | Get authenticated user profile |
| `/api/issues` | `GET` | List issues (supports `status`, `category_id`, `department_id`, `priority`, `search` filters) |
| `/api/issues/my` | `GET` | List complaints submitted by authenticated citizen |
| `/api/issues/:id` | `GET` | Get single issue with full timeline events |
| `/api/issues` | `POST` | Submit a new issue with multipart image upload |
| `/api/issues/:id/status` | `PATCH` | Authority triage, update status, assign department & field officer, attach resolution photo |
| `/api/issues/:id/upvote` | `POST` | Citizen "Me Too" upvote |
| `/api/issues/:id/feedback`| `POST` | Submit 1-5 star citizen rating & comments on resolved ticket |
| `/api/categories` | `GET` | List all issue categories |
| `/api/departments` | `GET` | List departments with active & resolved counts |
| `/api/stats` | `GET` | System-wide statistics and workload breakdown |

---

## 🏛️ System Architecture & Workflow

```
[Citizen Client]
     │
     ├── 1. Report Issue (Photo, GPS Coordinates, Category)
     ├── 2. Track Real-time Progress (Ticket ID)
     └── 3. Submit Resolution Feedback
            │
            ▼
   [Express.js REST API] <─────> [SQLite Database (node:sqlite)]
            ▲
            │
     ├── 4. Triage & Verify Complaint
     ├── 5. Assign Work Order to Department
     └── 6. Attach Proof of Work & Mark Resolved
            │
[Municipal Authority Console]
```

### Database Entity Relationship (ER) Summary
- **users:** `id`, `name`, `email`, `phone`, `password`, `role` (citizen/officer/admin), `department_id`
- **departments:** `id`, `name`, `email`, `phone`, `head_officer`
- **categories:** `id`, `name`, `default_dept_id`, `icon`
- **issues:** `id`, `title`, `description`, `category_id`, `priority`, `status`, `latitude`, `longitude`, `address`, `landmark`, `image_url`, `resolution_image_url`, `department_id`, `assigned_officer`, `upvotes`, `citizen_rating`, `citizen_feedback`
- **timeline:** `id`, `issue_id`, `status`, `title`, `description`, `actor`, `created_at`

