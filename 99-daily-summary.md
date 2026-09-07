# Daily Summary - 2026-09-07

## v2.3.3 iPhone Journal and Tasks UX
v2.3.3 fixes complete-text selection in long Journal entries on iPhone and adds a spacious, safe Markdown editing flow to Tasks without changing stored data formats or GAS contracts.

### Completed Work
- Configured CodeMirror to render the full Journal document on iPhone/iPad contenteditable input so native long-press “Select All” reaches every line.
- Kept CodeMirror virtualization unchanged on desktop and non-iOS devices.
- Added accessible Edit/Preview tabs to the Task add/edit modal and enlarged the responsive details area.
- Preserved the original Markdown source through preview and save.
- Added vendored DOMPurify 3.4.14 with integrity metadata and offline precaching.
- Sanitized the shared Tasks Markdown renderer for both the task list and editor preview, with an escaped-text fallback when sanitization is unavailable.
- Bumped local web assets and the Service Worker cache to v2.3.3.
- Added the active OpenSpec change `add-task-markdown-preview` under the live `mobile-task-ux` capability.
- Updated README, user manual, release notes, Todo, and handover documentation.

### Verification
- JavaScript syntax checks for `api.js`, `app.js`, `tasks.js`, `journal.js`, and `sw.js`.
- Strict validation of the active change and all live OpenSpec specs.
- Responsive browser checks at 320×568, 390×844, and desktop widths, including dark mode.
- Markdown positive cases, hostile HTML/URL sanitization cases, exact-source preservation, and sanitizer fail-closed behavior.
- iOS/non-iOS CodeMirror option regression checks and offline Service Worker reload.

### Preserved Constraints
- No JSON schema or top-level data structure changes.
- No GAS API contract changes.
- No Calendar sync semantic changes; task save still does not automatically sync Google services.
- The OpenSpec change remains active until the deployed behavior is verified, then should be archived separately.

## v2.3.2-r5 Release Completed
v2.3.2-r5 was prepared as a small follow-up release for Calendar sync diagnostic feedback. The app behavior remains unchanged: readable GAS sync results that do not verify Calendar visibility are informational diagnostics, while fallback/CORS/unreadable responses remain warnings.

### r5 Completed Work
- Confirmed `main` includes PR #12: Calendar diagnostics use info styling instead of success styling for unverified visibility.
- Confirmed web asset query strings are `v2.3.2-r5`.
- Confirmed Service Worker cache name is `mp-logmanager-gas-v2-3-2-r5`.
- Added `RELEASE_NOTES_v2.3.2-r5.md`.
- Confirmed the `v2.3.2-r5` GitHub Release was created manually.

### r5 Constraints
- No JSON schema or top-level data structure changes.
- No GAS API contract changes.
- No Calendar sync semantic changes.
- No stable Calendar event matching, event ID persistence, upsert behavior, deduplication, JSON splitting, differential save, or archive migration.
- Save still does not automatically sync Calendar events.

### r5 Verification
- `node --check web/js/app.js`

## Post-release OpenSpec Maintenance
After the `v2.3.2-r5` tag and GitHub Release, completed OpenSpec changes were archived as repository maintenance. This happened after the release tag, so these archive commits are not part of the `v2.3.2-r5` tagged release contents.

### OpenSpec Maintenance Completed
- Archived completed OpenSpec changes and created live specs for `data-performance`, `google-sync`, `journal`, `journal-layout`, and `mobile-task-ux`.
- Removed undeployed task-template behavior from current specs; `add-task-templates` remains archived documentation only until the Web App implements templates.
- Aligned the large-data warning spec with implemented save-time byte-threshold warnings.
- Added deployed multi-entry Journal behavior to the current Journal spec.
- Reconciled and archived `add-google-sync` after aligning it with the deployed manual-sync behavior.
- Updated the live Google sync spec to cover settings, manual Calendar/Google Tasks sync requests, GAS setup/template endpoints, and the fact that task save does not auto-sync.

### OpenSpec Maintenance Verification
- `openspec validate --specs --strict --no-interactive`
- Current spec validation passes with 5 live specs.
- `openspec validate add-google-sync --strict --no-interactive`
- `openspec list` now reports no active changes.

## Developer Setup Documentation
Added `docs/DEV_SETUP.md` to document per-PC setup for Git, Node.js LTS, GitHub CLI, OpenSpec CLI, validation commands, local-only `.codex-tools/`, and Windows/PowerShell UTF-8 precautions.

### Developer Setup Verification
- Confirmed `.codex-tools/` remains ignored in `.gitignore`.
- Checked merged cleanup branches were removed locally and from `origin`.

## Google Sync Spec Follow-up
Updated the live Google sync spec to preserve the deployed per-task Calendar opt-out behavior: tasks with `sync_calendar === false` remain excluded from manual Calendar sync even when the global Calendar sync setting is ON.

### Google Sync Spec Verification
- `openspec validate --specs --strict --no-interactive`

## Google Sync Documentation Follow-up
Clarified in `README.md`, `docs/GOOGLE_SYNC_SETUP.md`, and `docs/USER_MANUAL.md` that Google Calendar / Google Tasks sync is manual: task save persists data to GAS / Google Drive but does not auto-sync to Google services.

## v2.3.2 Release Completed
v2.3.2 was completed, validated, tagged, and released. This release stayed intentionally low risk: diagnostics and UX only, with no JSON schema changes, no top-level data structure changes, no GAS API contract changes, and no Calendar sync semantic changes.

### Completed Work
- Adopted `openspec/changes/improve-save-load-mobile-task-sync/` as the official v2.3.2 OpenSpec proposal.
- Rewrote the OpenSpec proposal, design, tasks, and spec deltas in readable English UTF-8.
- Added diagnostic-only `DataAPI.lastMetrics` for save/load type, item count, approximate JSON size, timing, status, and timestamp.
- Added Tasks/Journal save start, confirmed success, failure, and large JSON warning feedback.
- Changed unconfirmed GAS save responses (`cors_blocked`, `requested (fallback)`) to warning feedback instead of confirmed success.
- Enlarged the iPhone Tasks details textarea and verified it is usable.
- Clarified that GAS connection test only verifies GAS ping, not Calendar sync.
- Added manual Calendar sync diagnostics for sent/skipped/completed task counts.
- Prevented duplicate manual sync requests while a sync is already running.
- Updated web asset query strings and Service Worker cache name through `v2.3.2-r4`.
- Added `RELEASE_NOTES_v2.3.2.md`.
- Created and pushed the `v2.3.2` tag.
- GitHub Release `v2.3.2` was created manually on GitHub.

### Verification
- `node --check web/js/api.js`
- `node --check web/js/app.js`
- `node --check web/js/tasks.js`
- `node --check web/js/journal.js`
- `openspec validate improve-save-load-mobile-task-sync --strict --no-interactive`
- Manual browser checks:
  - Tasks save OK.
  - Journal save OK.
  - iPhone Tasks detail field OK.
  - GAS ping and Calendar sync messaging are distinct.
  - Manual Calendar sync OK.
  - Repeated sync-button taps produce only one Calendar event.

### Notes
- Save still does not automatically sync Calendar events. Manual sync remains required by design in v2.3.2.
- Stable Calendar event matching, event ID persistence, upsert behavior, deduplication, JSON splitting, differential save, and archive migration remain future work.
- `.codex-tools/` was created locally for portable `node`, `npm`, `gh`, and OpenSpec CLI usage, but is not committed.

## Recent History
- 2026-06-03: v2.3.1 improved Tasks density, desktop width usage, README screenshots, and PWA cache versioning.
- 2026-06-02: v2.3.0 improved Journal density and responsive layout.
- 2026-04-02: v2.2.5 completed Google sync setup reliability and GAS authorization guidance.
- 2026-03-30: v2.0.0 moved persistence to Google Drive + GAS.
