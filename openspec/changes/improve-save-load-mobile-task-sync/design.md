# Design: v2.3.2 Low-Risk Diagnostics and UX Improvements

## Current Findings

### Save/Load Path
- `DataAPI.getTasks()` and `DataAPI.getJournals()` load the full JSON payload from GAS, then cache the full data in `localStorage`.
- `DataAPI.updateTasks()` and `DataAPI.updateJournals()` POST the full JSON payload to GAS, then cache the full data in `localStorage`.
- The GAS template writes full files with `file.setContent(JSON.stringify(data, null, 2))`.
- As data grows, delays can come from browser JSON stringify/parse, network transfer, GAS execution, Drive writes, or client rendering.
- v2.3.2 will measure these stages where possible, but will not change the storage architecture.

### Mobile Tasks Detail UX
- The task details field uses the shared `.textarea` rule with a `100px` minimum height.
- On iPhone-sized screens, the title, category, priority, due date, details, sync checkbox, and footer share a constrained modal height.
- v2.3.2 will enlarge only the task details field and improve modal vertical use without redesigning the form.

### Google Calendar Sync
- The current connection test verifies `type=ping`, which checks basic GAS reachability only.
- Calendar synchronization still depends on task eligibility, Calendar authorization, GAS execution, CORS/readback behavior, and existing sync settings.
- Manual sync currently calls the same `DataAPI.syncCalendar(tasksData)` path. v2.3.2 will improve preflight counts and user-facing messaging without changing which tasks are sent or how GAS syncs them.

## Decisions
- Add `DataAPI.lastMetrics` as diagnostic state only. It must not affect save/load return values, control flow, persistence format, or error semantics.
- Estimate JSON size in the browser from the payload already being handled. This may add small overhead, but it is acceptable for diagnostics and warning thresholds.
- Keep large-data warnings non-blocking. They inform the user but never prevent save/load.
- Keep Calendar sync semantics unchanged. v2.3.2 reports eligible and skipped tasks before/after the existing sync call, but does not alter matching, creation, update, or cleanup behavior.
- Only bump the Service Worker cache name. Keep install, activate, fetch, and old-cache cleanup behavior unchanged.

## Risks and Mitigations
- Metrics can add overhead: keep calculations simple, diagnostic-only, and limited to existing payloads.
- CORS fallback may prevent response verification: show "request attempted, result not verified" instead of success.
- Large `localStorage` cache writes can still fail near browser limits: warn by payload size, but preserve existing behavior and errors.
- Calendar ping may be mistaken for Calendar success: label it explicitly as GAS connectivity only.

## Follow-Up Work Outside v2.3.2
- Stable Calendar event matching or event ID persistence.
- Calendar upsert/deduplication improvements.
- GAS-side detailed Calendar test endpoint.
- JSON file splitting, archive migration, or differential save.
