# Handover Context - 2026-06-13

## Current Status
v2.3.2 is complete and released. `main` includes the v2.3.2-r5 follow-up patch for Calendar diagnostic toast styling. The `v2.3.2` and `v2.3.2-r5` tags have been pushed. The `v2.3.2` and `v2.3.2-r5` GitHub Releases were created manually on GitHub.

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
- Plan larger v2.3.3+ work separately:
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
