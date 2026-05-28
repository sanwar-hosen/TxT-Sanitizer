# TxT Sanitizer V2 — Finalized Implementation Plan

## Status: 🚀 Phase 8 Complete — Moving to Phase 9

---

## 1. Resolved Decisions

| Question | Decision |
|---|---|
| **Q1 Database** | **Cloudflare D1** — free, native Cloudflare Pages integration |
| **Q2 Admin Auth** | **Hardcoded password via `.env`** — single `ADMIN_PASSWORD` env var + session cookie |
| **Q3 Feedback Email** | **Nodemailer + Gmail SMTP** — see setup guide in §2.4 |
| **Q4 UI Style** | **Modernized** — same blue palette (`#004AAD`) + Rubik font, but premium feel: richer shadows, micro-animations, glassmorphism cards |
| **Q5 Preset Tabs** | Max 3 visible. Default order: last-selected preset first → rest in natural order. Overflow via "More" icon button; selecting from overflow moves that preset to position 1 |
| **Q6 Feedback** | **Footer link** — clicking opens a feedback modal |
| **Q7 About CMS** | **Phase 7** — About page content editable via admin dashboard, stored in D1 |

---

## 2. Tech Stack (Final)

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 14** (App Router) | SSR for About/SEO |
| Styling | **Tailwind CSS** | Primary; raw CSS only if something truly can't be done with Tailwind |
| State | React local state + custom hooks | No global state library |
| Tab Persistence | **localStorage** | Tabs persist across reloads |
| User Data | **localStorage** | Presets, history, dark mode pref |
| System Data | **Cloudflare D1** | System presets, notification alert config, About content, analytics |
| Email | **Nodemailer + Gmail SMTP** | Free, no external service |
| Deployment | **Cloudflare Pages** | Existing, no change |
| Font | **Rubik** (Google Fonts via `next/font`) | Brand consistency |

### 2.1 Tailwind Config
```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: '#004AAD',
      'brand-hover': '#0056C7',
      'brand-light': '#3370CC',
    },
    fontFamily: {
      sans: ['Rubik', 'Verdana', 'sans-serif'],
    }
  }
}
```

**Dark mode strategy:** Tailwind `dark:` variant with `class` strategy — toggling `dark` class on `<html>`, persisted in localStorage.

### 2.2 Cloudflare D1 Schema

```sql
CREATE TABLE IF NOT EXISTS presets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rules TEXT NOT NULL,           -- JSON: Rule[]
  is_default INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,     -- incremented on update for cache-busting
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notification_alert (
  id INTEGER PRIMARY KEY DEFAULT 1,
  enabled INTEGER DEFAULT 0,        -- 0 = off, 1 = on
  heading TEXT NOT NULL DEFAULT '',  -- brief one-line title shown in the alert bar
  has_learn_more INTEGER DEFAULT 0,  -- 0 = heading only, 1 = show Learn More button
  body TEXT DEFAULT '',              -- required when has_learn_more = 1; article-style detail text
  version INTEGER DEFAULT 1,         -- bump to re-show to all users
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS about_content (
  id INTEGER PRIMARY KEY DEFAULT 1,
  html_content TEXT NOT NULL DEFAULT '',
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,   -- 'page_view' | 'sanitize' | 'feedback'
  metadata TEXT,              -- JSON metadata: { presetId, charCount, etc. }
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS feedback_rate_limit (
  ip TEXT PRIMARY KEY,
  last_sent_at INTEGER NOT NULL
);
```

### 2.3 Preset JSON Format (Canonical)

```json
[
  {
    "id": "default01",
    "name": "ChatGPT → Normal",
    "rules": [
      { "priority": 1, "find": "**", "replace": "" },
      { "priority": 2, "find": "*",  "replace": "-" },
      { "priority": 3, "find": "##", "replace": "" },
      { "priority": 4, "find": "#",  "replace": "" }
    ],
    "isDefault": true
  },
  {
    "id": "default02",
    "name": "Fiverr Words",
    "rules": [
      { "priority": 1,  "find": "email",     "replace": "em-ail" },
      { "priority": 2,  "find": "mail",      "replace": "ma-il" },
      { "priority": 3,  "find": "phone",     "replace": "pho-ne" }
    ],
    "isDefault": true
  }
]
```

**Rule contract:**
- `id`: unique string — `default01`, `default02`, user-generated UUID
- `name`: human-readable label shown in the preset tab
- `rules[]`: ordered by `priority` (lower = applied first)
- `find`: literal string (no regex)
- `replace`: literal string, can be empty (deletion)
- `isDefault`: `true` = system preset (fetched from D1)

### 2.4 Nodemailer Gmail SMTP Setup

> **What you need to give me (only needed when we reach Phase 6):**
> 1. A Gmail address that will be the **sender** (e.g. `txtsanitizer@gmail.com` or your own)
> 2. A **Gmail App Password** — NOT your regular Gmail password
>
> **How to get an App Password:**
> 1. Go to your Google Account → Security
> 2. Enable **2-Step Verification** (required)
> 3. Search "App Passwords" → Create one → App: Mail, Device: Other (Custom name)
> 4. Copy the 16-character password Google generates
> 5. Provide: `GMAIL_USER=youremail@gmail.com` and `GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx`
>
> These go in `.env.local` (never committed to git) and Cloudflare Pages environment variables.

---

## 3. Feature Inventory

### 3.1 Preserved from V1 (must not regress)
- [x] Dual-pane text editor (input + read-only output)
- [x] Preset tab system with "More" overflow dropdown
- [x] Sanitize via button click or `Ctrl+Enter`
- [x] **Sanitize button hidden/disabled when input is empty**
- [x] Copy output button
- [x] History tracking — **max 50 entries**, saved only on Sanitize click
- [x] History actions: copy, edit (sends back to workspace), delete, sort
- [x] Settings: user preset CRUD, import/export presets, clear history, clear all data
- [x] About page (SEO content preserved)
- [x] Footer with links

### 3.2 Removed from V2
- ~~File upload (.txt, .md)~~ — **removed**

### 3.3 New in V2

| # | Feature | Complexity |
|---|---|---|
| 1 | **Multi-tab workspace** — max 3 tabs, full state persisted per tab in localStorage | Medium |
| 2 | **Word count** beside char count on input side | Low |
| 3 | **Matched word count** on output side | Low |
| 4 | **Preset highlighting** — matched/changed words highlighted amber in output | High |
| 5 | **Restore button** — hover-only, floats under cursor (`position:fixed`), no layout shift | High |
| 6 | **Find & Replace tool** — 🔍 icon at top-right of Output panel, expands full tool, operates on output text | High |
| 7 | **Search highlighting** in output (blue tone, distinct from amber preset highlights) | Medium |
| 8 | **Dark mode toggle** in navbar | Medium |
| 9 | **Feedback form** in Footer — modal with email/subject/message → Nodemailer | Medium |
| 10 | **System presets** — fetched once, cached in localStorage, user-editable locally, "Reset to default" per preset | Medium |
| 11 | **Admin dashboard** (`/admin`) — CRUD presets, popup, About CMS, ads toggle, analytics | High |
| 12 | **Notification Alert system** — slide-in banner from top of site, center-top hover zone, heading + optional "Learn More" modal; admin-controlled | Medium |
| 13 | **Ads-ready layout** — reserved slots (below navbar, right sidebar), **admin-toggleable** | Low |
| 14 | **Button opacity on typing** — sanitize button dims while typing, restores on blur/stop | Low |
| 15 | **Reinput button** — icon only, moves output → input, clears output | Low |
| 16 | **Centralized Styling & DaisyUI** — standalone components + daisyui integration | Medium |
| 17 | **Multi-Theme System** — daisyui themes (light, dark, cupcake, emerald, synthwave, retro, halloween, forest, wireframe, dracula, night, coffee, abyss, sunset, silk) via hover dropdown | Medium |
| 18 | **Automatic Real-Time Sanitization** — toggleable real-time mode, auto-sanitizes, hides sanitize button | Medium |
| 19 | **Save Message Session** — save active tab to a Saved page | Low-Medium |

---

## 4. Architecture

```
/app
  page.tsx                    ← Homepage (client-first)
  /history/page.tsx
  /settings/page.tsx
  /about/page.tsx             ← Server Component (SSR for SEO)
  /admin/page.tsx             ← Admin dashboard
  /api/presets/route.ts       ← GET (public) / POST,PUT,DELETE (admin)
  /api/notification-alert/route.ts  ← GET notification alert config (public) / PUT (admin)
  /api/about/route.ts               ← GET/PUT about content
  /api/feedback/route.ts      ← POST → Nodemailer
  /api/admin/login/route.ts   ← POST admin login
  /api/admin/analytics/route.ts ← GET analytics summary (admin-only)
  /api/analytics/route.ts     ← POST event log

/components
  /navbar
    Navbar.tsx
  /footer
    Footer.tsx
    FeedbackModal.tsx
  /sanitizer
    PresetTabs.tsx             ← max 3 visible, last-selected first, More overflow
    MorePresetsDropdown.tsx
    InputPanel.tsx
    OutputPanel.tsx
    FindReplacePanel.tsx       ← slides in from output panel top-right icon
    SanitizeButton.tsx
  /tabs
    TabBar.tsx                 ← multi-tab workspace (max 3)
  /history
    HistoryList.tsx
    HistoryItem.tsx
  /settings
    PresetEditor.tsx
    ImportExport.tsx
    StorageManager.tsx
  /admin
    AdminPresetManager.tsx
    AdminNotificationAlert.tsx
    AdminAboutEditor.tsx
    AdminAnalytics.tsx
    AdminAdsControl.tsx
  /notification
    NotificationAlert.tsx      ← slide-in banner + hover-reveal + Learn More modal
  /shared
    Modal.tsx
    Tooltip.tsx

/lib
  sanitizer.ts                 ← pure fn: sanitize(text, rules) → { output, matches[] }
  highlight.ts                 ← build mark segments from matches[]
  restore.ts                   ← splice original back at [start, end]
  storage.ts                   ← localStorage abstraction

/hooks
  useTabs.ts                   ← tab state (persisted to localStorage)
  useSanitizer.ts              ← sanitize action + match metadata
  useHighlight.ts              ← highlight state
  useFindReplace.ts            ← search state + navigation + replace (output-side)
  usePresets.ts                ← merge system + user presets, last-selected ordering
  useDarkMode.ts               ← theme toggle + localStorage

/data
  defaultPresets.ts            ← Fallback if API unreachable
```

---

## 5. Detailed Feature Specs

### 5.1 Sanitizer Engine
- Pure function: `sanitize(text, rules) → { output, matches[] }`
- `matches[]`: `{ original, replaced, startIndex, endIndex }` per transformation
- Literal text only (no regex)
- Rules applied sequentially (each rule operates on the result of the prior)
- Empty input → button hidden, no processing, no history entry

### 5.2 Multi-Tab Workspace
- Max **3 tabs**
- Each tab state: `{ id, label, inputText, outputText, selectedPresetId, matchMetadata }`
- **Persisted to localStorage** — survives page refresh
- Tab label: "Tab 1", "Tab 2", "Tab 3"
- Close button hidden when only 1 tab; Add button hidden when 3 tabs exist

### 5.3 Preset Tab UX

**Ordering Logic:**
1. Last preset the user actively selected → always shown **first**
2. Remaining presets fill positions 2 and 3 in natural order
3. Any beyond 3 go into the **More** overflow

**"More" Button Behavior:**
- Appears only when total presets > 3
- Icon button (e.g. `⋯`) at the end of the tab row
- Clicking opens a dropdown list of hidden presets
- Selecting from dropdown → makes it active + **moves it to position 1**
- Previous position-1 moves to position 2, etc.
- Dropdown closes after selection

```ts
interface PresetTabState {
  visiblePresets: Preset[];   // max 3
  overflowPresets: Preset[];  // rest
  activePresetId: string;
  lastSelectedId: string;     // persisted in localStorage
}
```

### 5.4 System Presets Behavior

```
On first visit:
  1. Fetch system presets from GET /api/presets
  2. Store in localStorage under "systemPresets" key with a version field

On subsequent visits:
  1. Load from localStorage (no re-fetch unless version changed)

User editing a system preset:
  - Changes saved to localStorage only (under user's copy)
  - Original system preset in DB is untouched
  - Admin pushing a new version does NOT override user's local edits
  - "Reset to default" button per preset restores the admin version

Merge for display:
  finalPresets = [...systemPresets_with_local_overrides, ...userPresets]
```

### 5.5 Preset Highlighting (Output Panel)
- After sanitize, output rendered as `<div contenteditable="false">` with inline `<mark>` spans
- Each `<mark>` = one word/segment matched and replaced by a rule
- Style: amber/warning tone (`bg-amber-200` / dark: `bg-amber-800/40`)
- Matched word count shown in output footer: e.g. `12 matches · 430 Char`

### 5.6 Restore Button
- **Zero inline DOM presence** — no button rendered in default state
- On `mouseenter` of a `<mark>` span → show floating button via `position: fixed` + mouse coordinates
- Small delay on `mouseleave` before hiding (to allow clicking the button)
- On click → restore that segment to its pre-sanitize value, update matched word count
- **Zero layout shift** — button is outside document flow

### 5.7 Find & Replace Tool
- Triggered by **🔍 icon button at the top-right of the Output panel**
- Clicking expands a slide-in panel (above or below the output area)
- Also triggerable via `Ctrl+Shift+F`
- **Operates on output text** (find/replace in the sanitized result)
- Features:
  - Literal text search + replace
  - Case sensitivity toggle
  - Match navigation: Previous / Next (with keyboard shortcuts when open)
  - Replace One (current match) / Replace All
  - Match counter: `3 of 12 matches`
  - Search highlights use **blue tone** — distinct from amber preset highlights
- Closing the tool clears search highlights; preset highlights are preserved

### 5.8 Feedback Modal
- Footer link: "Send Feedback"
- Clicking opens a centered modal
- Fields: **Email** (optional), **Subject**, **Message** (all except email required)
- Submit → `POST /api/feedback` → Nodemailer → Gmail inbox
- Rate limiting: max 5 submissions per IP per hour
- Success and error states shown inline

### 5.9 Admin Dashboard (`/admin`)
- **Auth:** `POST /api/admin/login` — compare password against `process.env.ADMIN_PASSWORD`, set `HttpOnly` session cookie (24h)
- Sections:
  1. **Preset Manager** — CRUD system presets, import/export JSON
  2. **Notification Alert Config** — enabled toggle, heading, learn more settings, version bump
  3. **About Page Editor** — markdown/rich-text editor for About page content, stored in D1
  4. **Ads Slots Control** — toggle show/hide for below-navbar slot and right-sidebar slot
  5. **Analytics** — Interactive analytics tab:
     - Monthly Line Charts: Responsive, theme-aware SVG charts showing trends for Page Views, Sanitizations, and Feedbacks over the last 12 months.
     - Summary Statistics: Total counts and percentage changes for key metrics.
     - Usage Analytics: Top presets used (extracted from sanitize event metadata), average sanitized text length.
     - Date Filters: Toggle between last 30 days, last 6 months, and last 12 months.
  6. **Email Config** — display current GMAIL_USER status (read-only, set via env)

### 5.10 Ads Layout
- Two reserved `<div>` slots built into the HTML from day one:
  - `<div id="ad-below-navbar">` — hidden by default
  - `<div id="ad-sidebar">` — hidden by default
- Admin dashboard toggle controls visibility of each slot
- When visible: empty container ready for ad code; layout already accounts for width/height

### 5.11 Notification Alert System

#### Behaviour
- On page load: fetch `GET /api/notification-alert`, check `enabled`.
- If `enabled`: slide the alert bar in from the **top of the page** with a smooth CSS translate animation (`slideDown` keyframe, ~300 ms ease-out).
- The alert bar rests at the very top of the viewport (above the navbar) but is **only visible / interactive when the user hovers the top-center zone** of the page — outside that hover zone it collapses back to ~4 px "peek" strip so it never covers content.
- The bar auto-dismisses (collapses) when the user moves the cursor away, but re-expands on hover for the session duration (no "seen" localStorage flag — it is always available while the page is open).
- Version-awareness: store `alertVersion` in localStorage; if admin bumps the version the collapsed state resets on next visit.

#### Visual Design
- Adapts to the active **DaisyUI theme** — background uses `bg-base-200`, text uses `text-base-content`, button uses `btn btn-primary`. Matches all 15 supported themes automatically.
- Layout:
  - Left: `ⓘ` info icon + **heading text** (single line, bold).
  - Right (conditional): `Learn More` pill button + `✕` close/dismiss button.
  - When `has_learn_more = false`: only heading + `✕` button.
- Rounded pill shape (`rounded-full` on mobile/tablet, `rounded-2xl` on desktop), subtle shadow.

#### Learn More Modal
- Clicking "Learn More" opens a simple centered `<dialog>` modal (reuses the shared `<Modal>` component).
- Modal contains:
  - **Heading** — same heading text from the alert bar.
  - **Body** — full article-style text from the `body` DB field (supports line breaks; no rich HTML).
  - A close button (top-right `✕`).
- Modal inherits active theme colors via `bg-base-100` / `text-base-content`.
- Backdrop click also closes the modal.

#### New Component & API
- `src/components/notification/NotificationAlert.tsx` — the slide-in bar + modal logic.
- `GET /api/notification-alert` — returns `{ enabled, heading, has_learn_more, body, version }`.

#### Admin Controls (§5.9 Admin Dashboard)
The **Notification Alert** section in the admin panel exposes:
1. **Enabled toggle** — on/off switch.
2. **Heading field** — required text input (max ~120 chars).
3. **Learn More toggle** — enables/disables the "Learn More" button.
4. When Learn More is ON → **Body text area** becomes required (admin cannot save without filling it).
5. When Learn More is OFF → body textarea is hidden/disabled.
6. **Version bump** — "Re-show to all users" button that increments `version`.
7. Live preview strip below the form showing how the alert will look in the current admin theme.

### 5.12 Centralized Styling & DaisyUI
- Refactor the codebase to use `daisyui` classes (`bg-base-100`, `text-base-content`, `btn`, `btn-primary`, etc.).
- Configure custom `light` and `dark` themes in daisyUI settings to match our current brand (`#004AAD`, etc.).
- Create reusable `Button` and `Alert/Notice` components in `src/components/shared/` leveraging daisyUI classes.
- Admin dashboard elements will also use these components to ensure brand consistency.

### 5.12.1 DaisyUI Migration Risks & Mitigation Strategy
Integrating DaisyUI into a pre-styled Tailwind v4 codebase carries specific layout and styling risks. We will mitigate them proactively:

1. **Background/Surface Conflicts:**
   - *Risk:* DaisyUI's base reset forces `bg-base-100` on the `<body>`, potentially wiping out our custom `--surface-dim` look.
   - *Fix:* Ensure our custom `light` and `dark` daisyUI configurations explicitly define `base-100`, `base-200`, and `base-300` to perfectly match our existing `--surface`, `--surface-2`, and `--surface-dim` hex codes. 
2. **Textarea Highlights Alignment Breakdown:**
   - *Risk:* The `InputPanel` relies on exact pixel-perfect padding and invisible text to render the `<mark>` highlights behind the text. Applying DaisyUI's `.textarea` class will add default paddings/borders that break this alignment.
   - *Fix:* **Do not apply the `.textarea` class** to the main input pane. Instead, keep the current structural CSS and only apply DaisyUI's semantic color variables (e.g., `text-base-content`, `placeholder-base-content/50`) so it themes correctly without breaking the overlay.
3. **Button Padding & Animation Clashes:**
   - *Risk:* Our buttons use custom `scale-110` and `active:scale-95` animations. DaisyUI `.btn` has its own click animations and rigid padding rules.
   - *Fix:* Strip out hardcoded paddings on existing buttons when converting them to `.btn`. Use DaisyUI shape modifiers (`btn-sm`, `btn-square`, `btn-ghost`) and carefully remove conflicting scale animations to avoid double-transforms.
4. **Custom Modal Regression:**
   - *Risk:* Using DaisyUI's `<dialog class="modal">` requires re-wiring our React state and could lose our custom fade-in/slide-up keyframes.
   - *Fix:* Keep our existing React `Modal.tsx` component structure. Just update its internal classes to use `bg-base-100` and `text-base-content` so it automatically inherits theme colors without breaking functionality.
5. **Dark Mode Toggle Failure:**
   - *Risk:* DaisyUI themes trigger via the `data-theme` attribute on `<html>`, but our current system uses `class="dark"`.
   - *Fix:* Refactor `useDarkMode.ts` into a `useTheme.ts` hook that manages `data-theme` attribute instead of `classList.toggle('dark')`.

### 5.13 Multi-Theme Dropdown
- Implement 15 themes via `daisyui`: Custom Light/Dark (matching brand), cupcake, emerald, synthwave, retro, halloween, forest, wireframe, dracula, night, coffee, abyss, sunset, silk.
- Hovering the theme toggle button in the Navbar reveals a curved, boxed dropdown of available themes.
- Selection saves to `localStorage` (`data-theme` on `<html>`).

### 5.14 Automatic Real-Time Sanitization Mode
- Controlled by a `manualSanitize` boolean in `localStorage` (default `false` for auto).
- **Auto Mode (`false`)**: Sanitization runs automatically on text change. The manual "Sanitize" button is hidden. No automatic writes to history to prevent bloat.
- **Manual Mode (`true`)**: "Sanitize" button visible. Clicking it/Ctrl+Enter runs sanitization and writes to history.
- **History Page Check**: If Auto Mode is active, the history page shows an alert: "In order to see history you have to enable the sanitize button." with an "Enable" button that switches the mode.
- Settings page includes a toggle for this mode.

### 5.15 Future: Save Message Session
- "Save" icon button on the sanitizer toolbar, visible only when input is present.
- Copies current active tab state into a `savedSessions` array in `localStorage`.
- Similar to history page, but explicitly triggered by user.

---

## 6. Build Phases

### Phase 1 — Project Foundation ✅ DONE
- [x] `npx create-next-app@latest ./` with TypeScript + App Router + Tailwind
- [x] Configure Tailwind: brand colors (`#004AAD`), Rubik font (`next/font`), full color token system
- [x] Static skeleton prototype matching `docs/asd.html` layout
- [x] Browser-tab style preset tabs + workspace tabs in toolbar
- [x] Dual-pane card layout with status bar
- [x] Dark mode: Tailwind `class` strategy, `useDarkMode` hook (Phase 5)
- [x] Navbar/Footer components (Phase 5)
- [x] Basic routing (Phase 5)
- [x] `wrangler.toml` setup with D1 binding (Phase 6)

### Phase 2 — Core Sanitizer + Workspace ✅ DONE
- [x] Sanitizer engine (`/lib/sanitizer.ts`) — returns `{ output, matches[] }`
- [x] `useTabs` hook with localStorage persistence (max 3 tabs)
- [x] `usePresets` hook (last-selected ordering, overflow split, max 3 visible)
- [x] `PresetTabs` component + overflow "More" dropdown
- [x] `TabBar` component (add/close tabs)
- [x] Input panel — textarea, live word+char count bottom-left, paste button, Sanitize hidden when empty, Ctrl+Enter
- [x] Output panel — char count, match count, Copy button (Copied! feedback), Reinput button, Find & Replace icon stub
- [x] Sanitize button hidden when input empty, Ctrl+Enter shortcut
- [x] Full flow wired: tab state → preset → sanitize → output → history
- [x] `defaultPresets.ts` with two default presets (ChatGPT→Normal, Fiverr Words)
- [x] `useHistory` hook + `storage.ts` localStorage abstraction
- [x] `src/types/preset.ts` — shared TypeScript types

### Phase 3 — Highlighting + Restore ✅ DONE
- [x] Highlight engine (`/lib/highlight.ts`) — maps `matches[]` to `<mark>` segments
- [x] Output panel renders rich `<div>` with `<mark>` spans
- [x] Hover → floating restore button (`position:fixed`, mouse coords)
- [x] Restore engine (`/lib/restore.ts`) — splices original back
- [x] Update matched word count after restore

### Phase 4 — Find & Replace ✅ DONE
- [x] 🔍 icon button at top-right of the Input panel
- [x] `useFindReplace` hook (query, case toggle, match nav, replace)
- [x] Slide-in F&R panel (animated)
- [x] Match navigation (prev/next + keyboard shortcuts)
- [x] Replace One / Replace All
- [x] `Ctrl+Shift+F` shortcut

### Phase 5 — History & Settings ✅ DONE
- [x] History page (sort, expand/collapse, copy, edit-to-workspace, delete)
- [x] Settings page (user preset CRUD, system preset local edit + "Reset to default")
- [x] Import/Export user presets
- [x] Clear History, Clear All Data
- [x] Reusable `<Modal>` shared component
- [x] `<FeedbackModal>` component wired to footer

### Phase 6 — Backend & System Presets ✅ DONE
- [x] D1 schema migration (`wrangler d1 execute`) — `docs/schema.sql` created with seeds
- [x] `GET /api/presets` — return system presets with version
- [x] `GET /api/notification-alert` — return alert config
- [x] `GET /api/about` — return about content
- [x] `POST /api/feedback` — validate + Nodemailer send (rate-limited 5/hr/IP)
- [x] `POST /api/analytics` — log events to D1
- [x] Client: `useSystemPresets` hook — fetch + cache system presets in localStorage, merge with user presets
- [x] "Reset to default" per system preset (settings page wired to fetched presets)

### Phase 6.5 — Centralized Styling & DaisyUI Integration ✅ DONE
- [x] Install `daisyui` plugin.
- [x] Create custom `light` and `dark` themes in `tailwind` to match the brand via daisyUI config.
- [x] Refactor UI to use daisyUI utility classes instead of fixed Tailwind colors.
- [x] Create reusable `Button` and `Alert` components for shared usage (including admin).

### Phase 6.6 — Multi-Theme Dropdown ✅ DONE
- [x] Enable off-the-shelf themes in daisyUI config.
- [x] Create a hover-triggered dropdown in the Navbar for theme selection.
- [x] Save selected theme to `localStorage` and apply `data-theme` to document root.

### Phase 6.7 — Automatic Real-Time Sanitization ✅ DONE
- [x] Implement `manualSanitize` state toggle in settings and context.
- [x] Auto-run `sanitize()` on input changes when in Auto mode.
- [x] Block history page with an "Enable Manual Mode" prompt when in Auto mode.

### Phase 7 — Admin Dashboard ✅ DONE
- [x] Admin login page + `POST /api/admin/login`
- [x] `POST /api/admin/logout` — clear session cookie
- [x] `src/lib/adminAuth.ts` — session cookie middleware helper for all admin API routes
- [x] Preset Manager UI (full CRUD → D1)
- [x] **Notification Alert Config UI**:
  - [x] Enabled toggle
  - [x] Heading text input (required, max 120 chars)
  - [x] "Learn More" toggle — when ON, body textarea appears and is required before saving
  - [x] Body textarea (hidden/disabled when Learn More is OFF)
  - [x] Version bump button ("Re-show to all users")
  - [x] Live theme-aware preview strip
- [x] **About Page Editor** (HTML editor with edit/preview tabs → D1 via `/api/admin/about`)
- [x] Ads Slots Control (toggle show/hide per slot)
- [x] **Analytics View & Charts**:
  - [x] `GET /api/admin/analytics` route querying aggregated statistics from D1
  - [x] Interactive, theme-aware responsive SVG line charts for monthly event trends (Page Views, Sanitizations, Feedbacks)
  - [x] Summary stats cards (Total counts)
  - [x] Preset usage popularity list (Top presets table with bar chart)
  - [x] Usage metrics (avg char count, sanitize/page view ratio, etc.)
  - [x] Date range filter (Last 30 Days, Last 6 Months, Last 12 Months)
  - [x] Clean tabbed layout for Analytics within the admin dashboard

### Phase 8 — Notification Alert + Ads ✅ DONE
- [x] `NotificationAlert.tsx` component — slide-in from top, collapses to 4px peek strip, hover-reveal over top-center zone, theme-aware via daisyUI
- [x] `GET /api/notification-alert` route — public endpoint reading from `notification_alert` D1 table with 60s cache
- [x] `PUT /api/notification-alert` route — admin-only, updates alert config (already existed from Phase 7)
- [x] Version-aware localStorage (`txts_v2_alertVersion`) to reset dismiss state on version bump
- [x] Learn More modal wired to shared `<Modal>` component
- [x] `id="ad-below-navbar"` div in `layout.tsx` — hidden by default, admin-toggled
- [x] `id="ad-sidebar"` div in `page.tsx` workspace — hidden by default, admin-toggled
- [x] Fixed pre-existing Next.js 16 async params type error in `/api/admin/presets/[id]/route.ts`

### Phase 8.5 — Feedback rate limit cooldown, Resend integration, bug fixes, and drag animation ✅ DONE
- [x] Replaced Nodemailer SMTP with Edge-compatible Resend API utilizing `RESEND_API_KEY` (kept Gmail REST API as fallback)
- [x] Implemented a 24-hour rate limit cooldown per IP address on feedback submission stored in D1 database (`feedback_rate_limit` table)
- [x] Added local storage cooldown validation (`txts_v2_feedbackCooldownUntil`) and live countdown ticker inside the `<FeedbackModal>` UI
- [x] Fixed Admin Panel SMTP config component to fetch configuration status securely via server-side API rather than client-side `process.env` variables
- [x] Fixed Sanitizer page to read and merge dynamic system presets from D1 database instead of hardcoded default values
- [x] **Drag-reorder background animation** — added CSS keyframe animations (`shiftDown`/`shiftUp`) and drop-indicator border line to the preset rule list in the Preset Editor modal; dragged item fades/scales down, items between source and destination animate to indicate direction of movement, and a brand-colored top/bottom border shows the precise drop target position

### Phase 9 — About Page + SEO
- [ ] About page as SSR Server Component — fetches content from D1
- [ ] Title tags + meta descriptions for all routes
- [ ] OG tags
- [ ] Semantic HTML hierarchy
- [ ] JSON-LD structured data

### Phase 10 — Polish & QA
- [ ] Keyboard shortcut audit
- [ ] Responsive layout (desktop-first, tablet acceptable)
- [ ] Accessibility: focus management, ARIA labels, contrast
- [ ] Performance: code splitting, font optimization
- [ ] Cross-browser testing
- [ ] Final deploy to Cloudflare Pages

### Phase 11 — Save Message Session (Future)
- [ ] "Save Session" button in workspace action bar.
- [ ] `savedSessions` localStorage model.
- [ ] "Saved" page similar to History, with copy/restore/delete functionality.

---

## 7. What You Need to Provide Before Phase 6

> [!IMPORTANT]
> Before Phase 6 (backend), provide:
> 1. **Gmail address** — the sender address for feedback emails
> 2. **Gmail App Password** — see setup steps in §2.4
>
> These go in `.env.local` as `GMAIL_USER` and `GMAIL_APP_PASSWORD`. I'll remind you when we get there.

---

## 8. V1 → V2 Delta Summary

| Dimension | V1 | V2 |
|---|---|---|
| Framework | React + Vite | Next.js 14 App Router |
| Styling | Tailwind CSS | **Tailwind CSS** (same) |
| File upload | ✅ | ❌ Removed |
| History limit | 100 | **50 entries** |
| Tab persistence | No | **Yes (localStorage)** |
| Presets | User-local only | System (D1, locally editable) + User |
| Workspace tabs | 1 | **Up to 3, each persisted** |
| Output area | Plain textarea | **Rich div with `<mark>` highlights** |
| Visual feedback | None | **Amber highlights on matched words** |
| Restore | None | **Hover-only floating button under cursor** |
| Find & Replace | None | **Output panel 🔍 icon → full tool** |
| Dark mode | None | **Yes, toggle in navbar** |
| Feedback | None | **Footer link → modal → Resend API (Gmail REST fallback) + 24h IP cooldown** |
| Admin | None | **Full dashboard at `/admin`** |
| Analytics | None | **Dashboard tab with monthly SVG line charts, summary cards, and preset usage statistics** |
| About CMS | Static | **Admin-editable via D1** |
| Notification Alert | None | **Slide-in top banner, hover-reveal, heading + optional Learn More modal, theme-aware, admin-controlled** |
| Ads layout | None | **Reserved slots, admin-toggled** |
| Sanitize button | Always visible | **Hidden when input is empty** |
| Word count | No | **Yes (input + matched in output)** |
| Reinput button | No | **Icon only** |
| Preset ordering | Fixed | **Last-selected first + More overflow** |
