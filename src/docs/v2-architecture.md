# v2 Architecture — TxT Sanitizer

## 1. System Overview

- Framework: Next.js (App Router)
- Rendering: Client-first for sanitizer functionality
- Backend: Next.js API routes
- Storage:
  - localStorage → user data (presets, history, UI state)
  - database → system presets, popup config, admin settings

---

## 2. Core Modules

### 2.1 Sanitizer Engine (Shared Logic)

Location: /lib/sanitizer/

Responsibilities:
- Apply rule pipeline (sequential transformations)
- Support:
  - plain string replacement
  - regex replacement
- Return:
  - final output string
  - match metadata (for highlighting and restore)

---

### 2.2 Preset System

Two types:

1. System Presets (server-controlled)
- stored in database
- fetched via API
- read-only for users

2. User Presets (client-controlled)
- stored in localStorage
- fully editable

Merge strategy:
finalPresets = [...systemPresets, ...userPresets]

---

### 2.3 Tab Workspace System

- max tabs: 3
- client-side only (no persistence)

Each tab contains:
- input text
- output text
- selected preset

Lifecycle:
- created dynamically
- destroyed on close
- reset on refresh

---

### 2.4 Highlighting Engine

Two independent systems:

1. Preset Highlighting
- source: sanitizer match metadata
- applied to output text only

2. Search Highlighting
- source: find & replace tool
- applied to input text only

Rules:
- no overlap between systems
- active match uses stronger highlight

---

### 2.5 Restore Engine

Requires transformation mapping:

Structure:
[
  {
    original: string,
    replaced: string,
    startIndex: number,
    endIndex: number
  }
]

Behavior:
- restore replaces only selected segment
- updates output without re-running full sanitize

---

### 2.6 Find & Replace Tool

Scope:
- operates on both input and output

Features:
- regex support
- case sensitivity toggle
- navigation between matches
- replace one / replace all

---

### 2.7 Popup System (Admin-Controlled)

Stored in database:
- content
- enabled flag
- trigger type (first_visit)

Client behavior:
- checks localStorage flag
- shows popup if not previously seen
- sets seen flag after display

---

### 2.8 Feedback System

Frontend:
- modal form (email, subject, message)

Backend:
- API route: /api/feedback
- sends email using SMTP

Protection:
- basic validation
- simple rate limiting

---

### 2.9 Admin Dashboard

Route: /admin

Responsibilities:
- manage system presets (CRUD)
- manage popup configuration
- configure feedback receiving email
- view lightweight analytics

Constraints:
- minimal authentication (MVP level)
- no heavy analytics processing

---

### 2.10 Ads-Ready Layout

- no placeholders rendered by default

Reserved integration points:
- below navbar
- right sidebar

Requirement:
- layout must support future ad insertion without structural changes

---

## 3. Folder Structure

/app
  /page.tsx
  /history
  /settings
  /about
  /admin

/app/api
  /presets
  /popup
  /feedback

/lib
  /sanitizer
  /highlight
  /restore
  /storage

/components
  /tabs
  /editor
  /output
  /modals
  /admin

/hooks
  useTabs
  useSanitizer
  useHighlight

---

## 4. Data Boundaries

Client (localStorage):
- user presets
- history
- tabs
- UI state

Server (database):
- system presets
- popup configuration
- admin settings

Rule:
- user data must never be stored in database

---

## 5. Constraints

- no global state library
- no complex authentication
- minimal API surface (3–4 endpoints)
- no unnecessary dependencies
- prioritize performance and SEO

---

## 6. Feature Preservation

All legacy features must remain:
- sanitizer functionality
- preset system
- history tracking
- settings management
- about page (SEO content)

Enhancements:
- multi-tab system
- highlighting + restore
- admin-controlled presets
- popup system
- feedback system
- ads-ready layout