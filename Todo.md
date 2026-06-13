# Todo List - Current Status (2026-06-13)

## Completed
- [x] **v2.3.2-r5 Calendar diagnostic styling follow-up** (2026-06-13)
  - [x] Changed readable-but-unverified Calendar sync diagnostics to informational feedback instead of success feedback.
  - [x] Kept fallback/CORS/unreadable Calendar sync diagnostics as warnings.
  - [x] Confirmed web assets and Service Worker cache are bumped to `v2.3.2-r5`.
  - [x] Added `RELEASE_NOTES_v2.3.2-r5.md`.
  - [x] Preserved v2.3.2 constraints: no data schema, GAS contract, or Calendar sync semantic changes.

- [x] **v2.3.2 Release: Save/Load diagnostics, iPhone Tasks detail UX, and Calendar sync diagnostics** (released 2026-06-13)
  - [x] Adopted OpenSpec proposal: `improve-save-load-mobile-task-sync`.
  - [x] Cleaned OpenSpec files in readable English UTF-8.
  - [x] Added diagnostic-only `DataAPI.lastMetrics`.
  - [x] Added save/load feedback and non-blocking JSON size warnings.
  - [x] Enlarged iPhone Tasks detail input.
  - [x] Clarified GAS ping vs Calendar sync diagnostics.
  - [x] Verified manual Calendar sync works.
  - [x] Prevented duplicate manual sync requests from repeated taps.
  - [x] Bumped web assets and Service Worker cache through `v2.3.2-r4`.
  - [x] Added `RELEASE_NOTES_v2.3.2.md`.
  - [x] Pushed `v2.3.2` tag and completed GitHub Release manually.
  - [x] Verified `openspec validate improve-save-load-mobile-task-sync --strict --no-interactive`.

- [x] **v2.3.1 Tasks dense responsive layout** (2026-06-03)
  - [x] Improved desktop Tasks card density.
  - [x] Improved iPhone Tasks display density.
  - [x] Updated README screenshots.

- [x] **v2.3.0 Journal dense responsive layout** (2026-06-02)
  - [x] Improved desktop Journal width usage.
  - [x] Improved iPhone Journal layout density.
  - [x] Added mobile List/Edit switching.

- [x] **v2.2.5 Google sync setup reliability** (2026-04-02)
  - [x] Improved CORS error visibility.
  - [x] Documented GAS manual authorization.
  - [x] Added sync feedback and `testAuth` guidance.

- [x] **v2.0.0 Google Drive + GAS migration** (2026-03-30)
  - [x] Moved persistence from GitHub data files to Google Drive through GAS.

## High Priority (Next)
- [ ] **v2.3.2-r5 release finalization**
  - [x] Push `v2.3.2-r5` tag.
  - [ ] Create or confirm GitHub Release `v2.3.2-r5`.

- [ ] **Developer setup documentation**
  - [ ] Document recommended per-PC setup for Node.js LTS, npm, GitHub CLI, and OpenSpec CLI.
  - [ ] Decide whether to add `docs/DEV_SETUP.md` and/or `scripts/setup-dev.ps1`.
  - [ ] Keep `.codex-tools/` local-only; do not commit portable binaries.

- [ ] **OpenSpec archive decision**
  - [ ] Decide whether to archive `openspec/changes/improve-save-load-mobile-task-sync/`.
  - [ ] If archiving, update live specs or use the appropriate `openspec archive` mode.
  - [ ] Run validation after archive.

- [ ] **v2.3.3+ planning**
  - [ ] Stable Calendar event matching.
  - [ ] Calendar event ID persistence.
  - [ ] Upsert/deduplication improvements.
  - [ ] JSON splitting, differential save, or archive migration, based on metrics.

- [ ] **UI/PWA follow-up**
  - [ ] Mobile Journal Markdown display tuning.
  - [ ] Offline notification/icon polish.
