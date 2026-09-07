# Project Context

## Purpose
MP-LogManager (GAS Edition) is a task and journal management application for medical physics workflows.
The primary interface is the Web App/PWA, designed for daily entry from PC browsers and iPhone/iPad.
Personal Tasks and Journal data are stored in the user's own Google Drive through Google Apps Script (GAS), not in GitHub.

## Tech Stack

### Web App (Main)
- **Framework**: Vanilla JavaScript, HTML5, CSS3
- **UI target**: PC browser, mobile browser, and PWA usage
- **Libraries**: EasyMDE, marked.js, highlight.js
- **Deployment**: GitHub Pages
- **Backend/storage**: Google Apps Script API writing JSON data in Google Drive
- **Repository role**: Hosts app code, setup docs, OpenSpec files, and non-sensitive project metadata

### Google Apps Script Backend
- Stores Tasks and Journal JSON files in Google Drive.
- Handles GAS connectivity checks and persistence requests.
- Provides Google Calendar and Google Tasks sync endpoints where enabled.
- Requires manual authorization in the GAS editor after setup.

### Desktop App (Legacy)
- The old Python/CustomTkinter desktop app is no longer the primary product.
- Keep legacy references only when they are needed for migration history or archived documentation.

## Project Conventions

### Code Style
- Keep JavaScript simple and framework-free unless a proposal explicitly approves a larger change.
- Preserve UTF-8 for all documentation and source files.
- Japanese user-facing text and documentation are allowed, but be careful on Windows/PowerShell.
- Prefer existing module boundaries under `web/js/` and avoid broad rewrites for narrow fixes.

### Architecture Patterns
- Web App first: new user-facing behavior should fit the PWA flow.
- GAS contract stability matters: do not change request/response semantics without an approved spec.
- Persistence is full-file JSON save/load through GAS and Google Drive unless a future proposal changes it.
- Calendar sync is manual unless a specific approved change says otherwise.

### Testing Strategy
- Run syntax checks for changed JavaScript files with `node --check`.
- Run OpenSpec validation for spec/proposal changes.
- Use manual browser checks for user-facing Web App behavior.
- Keep release and handover notes in sync after substantial work.

### Git Workflow
- Do not commit local-only tooling such as `.codex-tools/`.
- Do not revert user changes unless explicitly asked.
- Keep docs/spec cleanup separate from implementation changes when practical.
- On Windows/PowerShell, avoid commands that can reinterpret Japanese text or file encodings.

## Domain Context
- Core entities are Tasks and Journal entries.
- Tasks may include category, priority, due date, status, details, and optional Google sync settings.
- Journal supports multiple entries per date with title, content, ID, and created timestamp.
- The app may be used around medical work, so avoid storing patient-identifying or sensitive personal data in GitHub.

## Important Constraints
- Current v2.3.3-line constraints:
  - Do not change the JSON schema or top-level data structure.
  - Do not change the GAS API contract.
  - Do not change Calendar sync semantics.
  - Do not implement stable Calendar event matching, event ID persistence, upsert behavior, deduplication, JSON splitting, differential save, or archive migration without a separate approved proposal.
  - Save does not automatically sync Calendar events; manual sync remains required.
- Keep current OpenSpec specs aligned with deployed behavior.
- Keep archived proposals as history; do not treat archived-only behavior as live product behavior unless it exists in the app.

## External Dependencies
- EasyMDE
- marked.js
- highlight.js
- Google Apps Script
- Google Drive
- Optional Google Calendar and Google Tasks services
