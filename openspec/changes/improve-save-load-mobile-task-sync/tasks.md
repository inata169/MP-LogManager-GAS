## 0. Approval Gate
- [x] 0.1 Confirm v2.3.2 scope is diagnostics and UX only.
- [x] 0.2 Exclude schema changes, GAS API changes, Calendar matching changes, JSON splitting, differential save, and archive migration.

## 1. OpenSpec Cleanup
- [x] 1.1 Rewrite `proposal.md`, `design.md`, and `tasks.md` in clear English UTF-8.
- [x] 1.2 Keep spec deltas under `data-performance`, `mobile-task-ux`, and `google-sync`.
- [x] 1.3 Remove stable Calendar event matching requirements from the v2.3.2 spec delta.

## 2. v2.3.2 Implementation
- [ ] 2.1 Add diagnostic-only `DataAPI.lastMetrics` for save/load operation type, item count, approximate JSON size, timing, status, and timestamp.
- [ ] 2.2 Add non-blocking large JSON warnings using diagnostic size thresholds.
- [ ] 2.3 Improve Tasks and Journal save feedback without changing persistence semantics.
- [ ] 2.4 Enlarge the iPhone Tasks detail textarea and minimally improve modal vertical layout.
- [ ] 2.5 Improve GAS ping and manual Calendar sync diagnostics without changing Calendar sync semantics.
- [ ] 2.6 Bump web asset query strings and Service Worker cache name to v2.3.2 without changing offline caching behavior.

## 3. Verification
- [ ] 3.1 Run `node --check web/js/api.js web/js/app.js web/js/tasks.js web/js/journal.js`.
- [ ] 3.2 Run `openspec validate improve-save-load-mobile-task-sync --strict --no-interactive` if the OpenSpec CLI is available.
- [ ] 3.3 Manually verify save/load return values and persisted JSON format remain unchanged.
- [ ] 3.4 Manually verify iPhone-width task detail editing is more usable.
- [ ] 3.5 Manually verify GAS ping messaging and Calendar sync diagnostics are distinct.
- [ ] 3.6 Verify the Service Worker cache version bump keeps old-cache cleanup behavior unchanged.
