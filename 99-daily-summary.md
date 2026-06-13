# Daily Summary - 2026-06-13

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
- Archived completed OpenSpec changes and created live specs for `data-performance`, `google-sync`, `journal`, `journal-layout`, `mobile-task-ux`, and `task-management`.
- Left `add-google-sync` active because it is still `11/15 tasks`; the remaining 4 tasks must be reviewed before archive.

### OpenSpec Maintenance Verification
- `openspec validate --specs --strict --no-interactive`
- `openspec list` now leaves only `add-google-sync` active because it is still `11/15 tasks`; the remaining 4 tasks must be reviewed before archive.

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
