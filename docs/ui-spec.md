## Layout Structure

- Navbar (top, existing navbar with added feedback and darkmode icon button beside the about button)
- Main workspace (center)
- Tabs (top of workspace)
- Preset list (below tabs, above text editor)
- Text editor (input area)
- Output panel (right or below)
- Footer (bottom, existing footer)

---

## Components

### Text Editor
- large textarea
- supports paste, typing
- no auto-resize beyond container
- word count beside the existing character count (input side, bottom-right under the text editor)
- while typing:
  - sanitize and paste buttons reduce opacity
  - return to normal after user stops typing or on blur

---

### Output Box
- read-only
- supports highlighting:
  - preset-based highlighting
  - find & replace highlighting
- copy button
- reinput text button (moves output → input)
- matched word count displayed beside character count (bottom-right under the output box, visually emphasized)
- find & replace tool:
  - triggered by button (top-left of output box)
  - optional shortcut: Ctrl + Shift + F

---

### Tabs
- max 3 tabs
- active tab highlighted
- each tab maintains:
  - input text
  - output text
  - selected preset
- behavior:
  - if only 1 tab → hide close button
  - if 3 tabs → hide add button

---

### Preset List
- positioned directly below Tabs
- appears above Text Editor
- dropdown list if overflow (click to expand hidden presets)
- selected preset is visually highlighted

---

### Restore Button
- appears when hovering over preset-highlighted text in output box
- small inline button/icon
- does not shift layout
- only available for preset-based highlights

---

## Interaction Rules

- sanitize runs on:
  - button click
  - keyboard shortcut: Ctrl + Enter
- output updates immediately after clicking sanitize
- switching tabs preserves state
- typing reduces opacity of action buttons (sanitize, paste)
- restore action updates output instantly without re-running full sanitize

---

## Highlighting System

### Preset-based highlighting
- applied on output text only
- matches based on:
  - plain string (literal match)
  - regex (if rule is regex)
- style:
  - background color: alert/warning tone

### Highlight Priority
- preset highlighting and search highlighting never overlap
- each applies only to its respective area (output vs input)

### Search-based highlighting
- applied on input text only
- style:
  - background color: primary/blue tone

### Active match
- stronger/darker highlight than other matches

---

## Visual Style (loose constraints)

- minimal, clean
- no heavy shadows
- consistent spacing
- responsive (desktop-first)
- colors inspired by existing logo:
  - primary
  - secondary
  - success
  - alert

---

## Additional Pages

### History Page
- list of past results
- sorted by timestamp
- actions:
  - copy
  - delete
  - edit (send back to workspace)
- keep the ui layout and structure same
---

### Settings Page
- manage user presets
- clear history
- clear all data
- keep the ui layout and structure same
---

### About Page
- SEO-focused static content
- content editable via admin dashboard
- must preserve existing headings, structure, and content hierarchy for SEO