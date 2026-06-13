# Release Notes v2.3.2-r5

Release date: 2026-06-13

## Summary
v2.3.2-r5 is a small follow-up release for the v2.3.2 diagnostic line. It keeps the app behavior and data format unchanged while improving Calendar sync diagnostic feedback.

## Changes
- Calendar manual sync diagnostics now use informational styling when GAS returns a readable result but Calendar visibility is not verified.
- Fallback, CORS-blocked, or unreadable Calendar sync responses remain warning diagnostics.
- Web asset query strings were bumped to `v2.3.2-r5`.
- Service Worker cache name was bumped to `mp-logmanager-gas-v2-3-2-r5`.

## Preserved Constraints
- No JSON schema or top-level data structure changes.
- No GAS API contract changes.
- No Calendar sync semantic changes.
- No stable Calendar event matching, event ID persistence, upsert behavior, deduplication, JSON splitting, differential save, or archive migration.
- Save does not automatically sync Calendar events; manual sync remains required.

## Verification
- `node --check web/js/app.js`
- OpenSpec validation was already passing for `improve-save-load-mobile-task-sync` in the v2.3.2 release line.
- Manual v2.3.2 checks confirmed Tasks save, Journal save, iPhone Tasks detail textarea sizing, GAS ping messaging, and manual Calendar sync behavior.

