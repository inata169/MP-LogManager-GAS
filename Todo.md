# Todo List - Current Status (2026-09-07)

## Completed
- [x] **v2.3.4 Web security and accessibility** (released 2026-09-07)
  - [x] Centralized Task/Journal Markdown behind one DOMPurify-required, fail-closed renderer.
  - [x] Replaced data-derived list, diagnostics, toast, and inline-event HTML construction with DOM text APIs and listeners.
  - [x] Added Task dirty-close confirmation and kept the editor open after actual save failures.
  - [x] Added modal naming, initial focus, Tab wrapping, Escape, background inertness, body scroll lock, and opener focus restoration.
  - [x] Removed the page zoom prohibition without adding device-specific branches.
  - [x] Added browser security regression and 1,000/5,000-line Journal performance fixtures.
  - [x] Confirmed the deployed app on physical iPhone SE (3rd generation, iOS 26.6.1), including the long-document fixture and zoom/PWA acceptance; no numerical timings were supplied.
  - [x] Published v2.3.4 assets; tag/Release creation and the separate OpenSpec archive complete the release workflow.

- [x] **v2.3.3 iPhone Journal selection and Tasks Markdown preview** (2026-09-07)
  - [x] Fixed iPhone long-press “Select All” so it covers the complete Journal entry.
  - [x] Added a larger responsive Tasks detail editor with Edit/Preview tabs.
  - [x] Preserved the original Markdown source when previewing and saving.
  - [x] Added DOMPurify 3.4.14 and fail-closed sanitization for Tasks Markdown rendering.
  - [x] Updated versioned web assets and the Service Worker cache to v2.3.3.
  - [x] Archived and strictly validated the `add-task-markdown-preview` OpenSpec change after deployment.
  - [x] Confirmed iPhone Safari/PWA native “Select All” and copy on a physical device.

- [x] **Developer setup documentation** (2026-06-13)
  - [x] Added `docs/DEV_SETUP.md` for per-PC setup.
  - [x] Documented Git, Node.js LTS, GitHub CLI, and OpenSpec CLI checks.
  - [x] Documented common validation commands and local portable OpenSpec fallback.
  - [x] Documented `.codex-tools/` as local-only and confirmed it remains ignored.
  - [x] Documented Windows/PowerShell UTF-8 precautions.
  - [x] Removed merged cleanup branches locally and from `origin`.

- [x] **Google sync spec per-task opt-out follow-up** (2026-06-13)
  - [x] Updated the current Google sync spec to preserve per-task Calendar opt-out behavior.
  - [x] Verified `openspec validate --specs --strict --no-interactive`.

- [x] **Google sync manual-sync documentation follow-up** (2026-06-13)
  - [x] Clarified in `README.md`, `docs/GOOGLE_SYNC_SETUP.md`, and `docs/USER_MANUAL.md` that task save does not auto-sync to Google Calendar / Google Tasks.
  - [x] Documented that users must enable sync settings and press the sync button manually.
  - [x] Documented Calendar sync eligibility: incomplete, due date present, and per-task Calendar sync not OFF.

- [x] **v2.3.2-r5 Calendar diagnostic styling follow-up** (2026-06-13)
  - [x] Changed readable-but-unverified Calendar sync diagnostics to informational feedback instead of success feedback.
  - [x] Kept fallback/CORS/unreadable Calendar sync diagnostics as warnings.
  - [x] Confirmed web assets and Service Worker cache are bumped to `v2.3.2-r5`.
  - [x] Added `RELEASE_NOTES_v2.3.2-r5.md`.
  - [x] Preserved v2.3.2 constraints: no data schema, GAS contract, or Calendar sync semantic changes.
  - [x] Confirmed GitHub Release `v2.3.2-r5` was created manually.

- [x] **OpenSpec archive: completed changes** (2026-06-13)
  - [x] Archived `improve-save-load-mobile-task-sync`.
  - [x] Archived `multi-entry-journal`.
  - [x] Archived `automated-mobile-sync`.
  - [x] Archived `add-journal-rich-editor`.
  - [x] Archived `add-task-templates`.
  - [x] Archived `add-compact-responsive-layout`.
  - [x] Created live specs for `data-performance`, `google-sync`, `journal`, `journal-layout`, and `mobile-task-ux`.
  - [x] Removed undeployed task-template behavior from current specs.
  - [x] Aligned large-data warnings with implemented save-time byte thresholds.
  - [x] Added deployed multi-entry Journal behavior to the current Journal spec.
  - [x] Reconciled `add-google-sync` with deployed manual-sync behavior.
  - [x] Archived `add-google-sync`.
  - [x] Updated the current Google sync spec for settings, manual Calendar/Google Tasks sync, GAS setup/template endpoints, and no save-time auto-sync.
  - [x] Verified `openspec validate add-google-sync --strict --no-interactive`.
  - [x] Verified `openspec validate --specs --strict --no-interactive`.

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
- [ ] **v2.3.5+ planning**
  - [ ] Stable Calendar event matching.
  - [ ] Calendar event ID persistence.
  - [ ] Upsert/deduplication improvements.
  - [ ] JSON splitting, differential save, or archive migration, based on metrics.

- [ ] **UI/PWA follow-up**
  - [ ] Mobile Journal Markdown display tuning.
  - [ ] Offline notification/icon polish.
