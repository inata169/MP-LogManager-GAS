# Handover Context - 2026-09-07

## Current Status
v2.3.4 is deployed, tagged, published as a GitHub Release, and physically verified on iPhone SE (3rd generation, 2022), iOS 26.6.1. It centralizes safe Markdown rendering, removes remaining reviewed dynamic HTML/event interpolation, protects unsaved Task edits and failed saves, adds accessible modal focus behavior, and permits page zoom. Data formats, GAS contracts, and Google sync semantics are unchanged.

## v2.3.4 Changes
- Shared `web/js/safe-render.js` owns Marked + DOMPurify 3.4.14 rendering and literal-text fail-closed behavior.
- Task/Journal lists, Journal print, diagnostics, and toasts no longer interpret external strings as application HTML.
- Task dirty close is shared by ×, Cancel, backdrop, and Escape. Actual save failure keeps the modal and input; accepted-but-unconfirmed GAS requests retain the existing completion policy.
- Task and Settings dialogs have names, initial focus, Tab wrapping, Escape, body lock, background inertness, and opener focus restoration.
- Viewport zoom prohibition is removed. No iPhone SE/device-name branch exists; CSS remains width-responsive.
- Asset queries and Service Worker cache are v2.3.4.
- Added `web/tests/security-regression.html` and `web/tests/journal-performance.html`.

## v2.3.4 Verification
- Passed: production JavaScript syntax; single approved dynamic `innerHTML` sink; 13/13 browser security regression; dirty close paths; failed-save retention; modal focus/body/background behavior; dark mode; 320×568, 375×667, 390×844, 430×932, landscape, iPad, and desktop layouts; non-iOS finite virtualization with 1,000/5,000 lines.
- Public GitHub Pages returned HTTP 200 for the v2.3.4 shared renderer, both test fixtures, and the v2.3.4 Service Worker.
- The user confirmed physical iPhone acceptance after deployment. The long-document fixture, selection/copy flow, zoom reachability, and PWA use had no reported failure; numerical device timings were not supplied.
- GitHub Release: `https://github.com/inata169/MP-LogManager-GAS/releases/tag/v2.3.4`
- OpenSpec archive: `openspec/changes/archive/2026-09-07-improve-web-editor-safety/`; live requirements are in `mobile-task-ux`, `web-security`, and `web-accessibility`.

## v2.3.3 Changes
- On iPhone/iPad, CodeMirror uses `viewportMargin: Infinity` only for the contenteditable Journal input so native long-press “Select All” covers the complete entry.
- Tasks add/edit uses accessible Edit/Preview tabs, a larger responsive details area, and reachable footer actions on small screens.
- Task Markdown source is preserved exactly for nonblank content; rendered HTML is never stored.
- The shared Tasks Markdown renderer sanitizes both list and preview HTML with vendored DOMPurify 3.4.14 and fails closed to escaped text when unsupported or unavailable.
- DOMPurify is loaded with SRI and included in the Service Worker precache.
- Asset query strings are `v2.3.3`; the Service Worker cache is `mp-logmanager-gas-v2-3-3`.
- The completed OpenSpec change is archived at `openspec/changes/archive/2026-09-07-add-task-markdown-preview/`; its requirements are merged into the live `mobile-task-ux` specification.
- The live `journal` specification records the verified iPhone full-document selection behavior.

## v2.3.3 Verification
- `node --check web/js/api.js`
- `node --check web/js/app.js`
- `node --check web/js/tasks.js`
- `node --check web/js/journal.js`
- `node --check web/sw.js`
- `openspec validate add-task-markdown-preview --strict --no-interactive`
- `openspec validate --specs --strict --no-interactive`
- Responsive browser, dark-mode, Markdown/XSS, exact-source, iOS selection-option, and offline Service Worker checks.
- Physical iPhone Safari/PWA long-press and copy verification completed successfully.

## v2.3.3 Known Follow-ups
- A future accessibility pass can add a complete modal focus trap and revisit the existing page zoom restriction.

## v2.3.2-r5 Follow-up
- Calendar manual sync diagnostics now use informational styling when GAS returns a readable result but Calendar visibility is not verified.
- Fallback, CORS-blocked, or unreadable Calendar sync responses remain warnings.
- Web asset query strings are `v2.3.2-r5`.
- Service Worker cache name is `mp-logmanager-gas-v2-3-2-r5`.
- Added `RELEASE_NOTES_v2.3.2-r5.md`.
- No app data format, GAS contract, or Calendar sync semantic changes were made.

## Post-release OpenSpec Maintenance
The following OpenSpec archive work happened after the `v2.3.2-r5` tag and GitHub Release, so it is repository maintenance rather than tagged release content.

- Archived completed OpenSpec changes:
  - `improve-save-load-mobile-task-sync`
  - `multi-entry-journal`
  - `automated-mobile-sync`
  - `add-journal-rich-editor`
  - `add-task-templates`
  - `add-compact-responsive-layout`
  - `add-google-sync`
- Created live OpenSpec specs for `data-performance`, `google-sync`, `journal`, `journal-layout`, and `mobile-task-ux`.
- Removed the archived-but-undeployed task-template requirement from current specs; `add-task-templates` remains archived documentation only until the Web App implements templates.
- Tightened `data-performance` large-data warnings to the implemented save-time byte-threshold behavior.
- Added the deployed multi-entry Journal behavior to the live Journal spec.
- Reconciled `add-google-sync` with the deployed manual-sync behavior and archived it.
- The live Google sync spec now covers settings, manual Calendar/Google Tasks sync requests, GAS setup/template endpoints, and that task save does not auto-sync.
- Follow-up: the live Google sync spec also preserves the deployed per-task Calendar opt-out behavior (`sync_calendar === false` excludes that task from manual Calendar sync).
- Documentation follow-up: `README.md`, `docs/GOOGLE_SYNC_SETUP.md`, and `docs/USER_MANUAL.md` now state that Google Calendar / Google Tasks sync is manual and task save does not auto-sync to Google services.

## What Changed In v2.3.2
- OpenSpec proposal adopted: `openspec/changes/improve-save-load-mobile-task-sync/`.
- OpenSpec documents were cleaned up in readable English UTF-8.
- Added diagnostic-only save/load metrics via `DataAPI.lastMetrics`.
- Added non-blocking JSON size warnings and clearer Tasks/Journal save feedback.
- Changed unconfirmed GAS save responses (`cors_blocked`, `requested (fallback)`) to warning feedback instead of confirmed success.
- Enlarged the iPhone Tasks detail textarea.
- Clarified that GAS connection test only verifies GAS ping, not Calendar sync.
- Added manual Calendar sync diagnostics for sent/skipped/completed task counts.
- Prevented duplicate manual sync requests while a sync is already running.
- Bumped web asset query strings and Service Worker cache name to `v2.3.2-r4`.
- Added `RELEASE_NOTES_v2.3.2.md`.

## Verification Completed
- `node --check web/js/api.js`
- `node --check web/js/app.js`
- `node --check web/js/tasks.js`
- `node --check web/js/journal.js`
- v2.3.2-r5: `node --check web/js/app.js`
- `openspec validate improve-save-load-mobile-task-sync --strict --no-interactive`
- `openspec validate add-google-sync --strict --no-interactive`
- `openspec validate --specs --strict --no-interactive`
- `openspec list`
- Google sync spec follow-up: `openspec validate --specs --strict --no-interactive`
- Manual browser verification:
  - Tasks save OK.
  - Journal save OK.
  - iPhone Tasks detail field expanded and usable.
  - GAS ping messaging is distinct from Calendar sync diagnostics.
  - Manual Calendar sync creates events.
  - Sync-button repeated taps do not create duplicate events.

## Important Constraints Preserved
- No JSON schema or top-level data structure changes.
- No GAS API contract changes.
- No Calendar sync semantic changes.
- No stable Calendar event matching, event ID persistence, upsert behavior, deduplication, JSON splitting, differential save, or archive migration.
- Save does not automatically sync Calendar events; manual sync is still required.

## Local Workspace Notes
- `.codex-tools/` exists locally and contains portable `node`, `npm`, `gh`, and OpenSpec CLI tooling.
- `.codex-tools/` is intentionally not committed because it is PC-specific and large.
- Added `docs/DEV_SETUP.md` for recommended per-PC setup, validation commands, local-only tooling, and Windows/PowerShell UTF-8 precautions.
- Removed merged cleanup branches `codex-fix-openspec-review-docs` and `codex-archive-add-google-sync` locally and from `origin`.

## Suggested Next Work
- Plan larger v2.3.4+ work separately:
  - stable Calendar matching
  - event ID persistence
  - dedup/upsert improvements
  - JSON splitting
  - differential save
  - archive migration
- Continue UI/PWA polish:
  - mobile Journal Markdown display tuning
  - offline notification/icon polish

## Recent History
- 2026-06-03: v2.3.1 Tasks density and README screenshot update completed.
- 2026-06-02: v2.3.0 Journal dense responsive layout completed.
- 2026-04-02: v2.2.5 Google sync setup reliability completed.
- 2026-03-30: v2.0.0 Google Drive + GAS migration completed.
