# System-Level Specification: TxT Sanitizer

## 1. Core Features (input -> output with examples)
- Text sanitization workspace: user enters or pastes raw text, selects a mode/preset, runs sanitize, and gets read-only sanitized output.
- Preset-driven transformation: sanitization behavior is configured by named presets containing ordered find/replace rules.
- Reprocessing loop: user can push output back to input and sanitize again.
- History tracking: each sanitize action is persisted as a timestamped record with input, output, and preset metadata.
- Preset management: create, edit, delete, import, export custom presets.
- Storage management: clear history only, or clear all local app data.

Examples:
- Input: `Hello   world` + preset rule (`find: "  "`, `replace: " "`) -> Output: `Hello world`.
- Input: `foo-bar` + preset rule (`find: "-"`, `replace: " "`) -> Output: `foo bar`.
- Imported presets file containing 5 presets where 2 names already exist -> Output: 3 imported, 2 skipped, user receives result message.

## 2. End-to-End Data Flow (connected system view)
1. App bootstraps device-scoped storage identity.
2. Presets are loaded from device storage; if missing/corrupt, defaults are used.
3. User edits text and selects a preset mode.
4. Sanitization runs (using selected preset rules) and produces output text.
5. Output is shown immediately and can be copied or re-input for another pass.
6. Sanitization result is saved to history storage.
7. History page reads stored records, sorts for display, supports copy/edit/delete/clear.
8. Edit-from-history navigates back to main workspace with text + preset in route state to re-run sanitization.
9. Settings page mutates preset/history storage; changes feed back into main flow on next read/reload.

## 3. Processing Pipeline (ordered transformation steps)
1. Resolve active device ID.
2. Resolve active preset set:
   - Read stored presets.
   - Fallback to default preset dataset.
3. Resolve selected mode:
   - Base tab selection and overflow dropdown selection update active mode.
4. Transform text:
   - Apply preset-defined rule list (find/replace semantics configured in preset data).
   - Emit sanitized output text.
5. Persist event:
   - Create history entry with generated ID + timestamp + input/output/preset metadata.
   - Prepend to history list.
   - Truncate history to max 100 entries.
6. Present derived views:
   - Main output area.
   - History list sorted by timestamp order preference.
   - Preview truncation for long history output text.
7. Optional external transfer:
   - Export custom presets to JSON.
   - Import presets from JSON with duplicate-name skip logic.

    ### Transformation Rules (Detailed Behavior)

    - Rules are applied sequentially (top → bottom).
    - Each rule contains:
    - `find`: string or regex pattern
    - `replace`: replacement string
    - Each rule operates on the result of the previous rule.
    - Matching behavior:
    - (define: global replace? first match only?)
    - (case sensitive or not?)
    - If regex is supported:
    - pattern flags (g, i, etc.) must be specified or defaulted
    - Empty input:
    - (what happens? return empty or skip?)
## 4. State Model (global view)
- No centralized global store; state is split across page/component-local React state plus persistent browser storage.
- Persistent state (localStorage, device-scoped):
  - Device ID
  - Presets list
  - History list
- UI/session state (React local):
  - Current input/output text and selected mode (workspace layer)
  - Tab/dropdown visibility for mode chooser
  - Modal visibility flags (add/edit/delete/clear dialogs)
  - Form drafts for preset creation/editing
  - Sort order and card expansion state in history
- Route state:
  - History -> workspace handoff carries edit text, preset, and auto-sanitize intent.

## 5. User Triggers (interaction points)
- Type in input text area.
- Paste text action.
- Clear input action.
- Run sanitize action.
- Copy output action.
- Reinput output action.
- Select mode via visible tab.
- Select mode via More dropdown.
- Upload text/markdown file to load input.
- Toggle history sort order.
- Expand/collapse long history output preview.
- Copy history output.
- Edit history entry (navigate back to workspace).
- Delete one history entry.
- Clear all history.
- Create new preset (name + rules).
- Edit existing preset name/rules.
- Add/remove rules in create/edit forms.
- Delete preset.
- Export presets.
- Import presets from JSON file.
- Clear all data (presets + history + device identity).

## 6. Side Effects
- localStorage reads/writes/removals for device, presets, and history.
- Clipboard write for copy actions.
- File read (FileReader) for preset import.
- File download creation (Blob + object URL + anchor click) for preset export.
- Browser navigation between routes with route state payload.
- Document title mutation per page mount/unmount.
- Alert dialogs for validation and operation outcomes.
- Console logging for diagnostics and error reporting.

## 7. Business Rules (explicit + implicit)
- Device-scoped data isolation via generated/stored device ID.
- Default presets are used when no device presets exist or parsing fails.
- New preset IDs and history IDs are generated as short random strings.
- History is capped to latest 100 entries.
- History display supports newest-first or oldest-first.
- Import requires JSON containing a presets array.
- Import deduplicates by preset name (existing names are skipped).
- Export includes only non-default presets.
- Preset creation requires:
  - Non-empty trimmed preset name.
  - All find fields non-empty (trimmed).
- Rule lists cannot be reduced below one rule in UI.
- Clear-all removes device key and device-scoped preset/history keys, effectively resetting identity and data.
- Preset tab behavior is index-based for first 4 visible items (base flow) vs others (generic mode select).

## 8. Structural Observations (duplication, inefficiencies)
- Repeated modal patterns and confirm/cancel flows suggest a reusable dialog abstraction is missing.
- Rule list manipulation logic (add/remove/re-prioritize) is duplicated for create and edit flows.
- Sorting is performed in storage retrieval and again at view level, creating redundant work/coupling.
- Storage API mixes concerns:
  - Some operations are abstracted in utility functions.
  - Clear-all directly manipulates storage keys in UI layer.
- Async/await is used around storage functions that are effectively synchronous localStorage operations, adding unnecessary async ceremony.
- Preset tab routing uses hardcoded positional rule (index < 4), creating tight coupling between UI layout and behavior.
- Validation and error handling are UI-local (alerts), with no shared validation/result contract for consistent UX across pages.

## 9. Data Models

### Preset
- id: string
- name: string
- rules: Rule[]

### Rule
- find: string
- replace: string

### HistoryEntry
- id: string
- timestamp: number
- input: string
- output: string
- presetId: string
- presetName: string

### Device
- deviceId: string (stored in localStorage)

## 10. Control Logic / Guards

- If input is empty:
  - Sanitization is blocked OR returns empty output
- If preset is missing:
  - Fallback to default preset
- If preset rules are invalid:
  - Show error and skip processing
- On sanitize:
  - Always overwrite previous output
  - Always create new history entry