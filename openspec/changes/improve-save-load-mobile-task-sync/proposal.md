# Change: v2.3.2 Save/Load Diagnostics, Mobile Task Detail UX, and Calendar Sync Diagnostics

## Why
v2.3.1 is stable, but real-world usage has exposed several low-risk improvement areas:
- Save operations can feel slow, and the current UI does not show where the delay occurs.
- Larger `tasks.json` and `journals.json` files may degrade save/load performance over time.
- The Tasks detail textarea is too small on iPhone-sized screens for comfortable multi-line entry.
- The GAS connection test can succeed even when Google Calendar synchronization is not actually working.

This change focuses on diagnostics and UX feedback only. It deliberately avoids data model changes and sync algorithm changes in v2.3.2.

## What Changes
- Add diagnostic-only save/load metrics for item count, approximate JSON size, timing, status, and operation type.
- Add lightweight user feedback for save start, save success, save failure, and large JSON payload warnings.
- Enlarge the Tasks detail textarea on iPhone-sized viewports while keeping the existing task edit flow.
- Clarify that GAS ping success is not Calendar sync success.
- Improve manual Calendar sync feedback by showing sent and skipped task counts.
- Bump web asset and Service Worker cache versions to v2.3.2 without changing offline caching behavior.

## Non-Goals
- No changes to the existing JSON schema or top-level data structures.
- No changes to the GAS API contract.
- No changes to Calendar sync semantics.
- No stable Calendar event matching, event ID persistence, upsert behavior, or deduplication.
- No JSON splitting, differential save, or archive migration.
- No automatic Calendar sync re-enable during task save.

## Impact
- Affected specs: `data-performance`, `mobile-task-ux`, `google-sync`
- Affected code candidates:
  - `web/js/api.js`: diagnostic metrics only
  - `web/js/tasks.js`: save feedback, large-data warnings, Calendar skip counts
  - `web/js/journal.js`: save feedback and large-data warnings
  - `web/js/app.js`: connection-test and manual-sync messaging
  - `web/css/style.css`: iPhone task detail textarea and modal height adjustments
  - `web/index.html`, `web/sw.js`: v2.3.2 asset/cache version bump

## Git Handling
- Commit OpenSpec cleanup separately from implementation changes.
- Do not modify or stage `99-daily-summary.md`, `99-handover_context.md`, or `Todo.md`.
