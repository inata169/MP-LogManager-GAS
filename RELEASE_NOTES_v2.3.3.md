# Release Notes v2.3.3

Release date: 2026-09-07

## Summary
v2.3.3 improves long-form editing on iPhone. Journal now allows native “Select All” across a complete long entry, while Tasks gains a larger details field and a safe Markdown Edit/Preview flow.

## Changes
- Fixed iPhone/iPad Journal full-text selection by rendering the complete CodeMirror document for the platform's contenteditable input mode.
- Added accessible Edit/Preview tabs to the Task add/edit modal.
- Enlarged the Task details area on iPhone while keeping Save and Cancel reachable.
- Preserved the original Markdown source through preview and save.
- Sanitized Task Markdown in both list and preview views with vendored DOMPurify 3.4.14.
- Added escaped-text fallback behavior when the Markdown parser or sanitizer is unavailable or unsupported.
- Bumped local web assets to `v2.3.3` and the Service Worker cache to `mp-logmanager-gas-v2-3-3`.

## Preserved Constraints
- No JSON schema or top-level data structure changes.
- No GAS API contract changes.
- No Calendar or Google Tasks sync semantic changes.
- Task save continues to persist through GAS/Google Drive without automatically running Google sync.
- Desktop and non-iOS Journal editors retain CodeMirror virtualization.

## Security and Dependency Notes
- DOMPurify 3.4.14 is vendored for deterministic PWA/offline operation.
- The vendored browser bundle is loaded with Subresource Integrity metadata and its upstream Apache-2.0/MPL-2.0 license files are included.
- Task Markdown rendering removes active markup, event-handler attributes, unsafe URL schemes, and other disallowed HTML before insertion into the DOM.

## Verification
- JavaScript syntax checks for `api.js`, `app.js`, `tasks.js`, `journal.js`, and `sw.js`.
- Strict validation of `add-task-markdown-preview` and all live OpenSpec specs.
- Responsive browser checks at 320×568, 390×844, and desktop widths, including dark mode.
- Markdown rendering, hostile-markup sanitization, exact-source preservation, sanitizer fail-closed, iOS selection-option, and offline Service Worker regression checks.
- Physical iPhone Safari/PWA long-press and copy verification remains recommended after deployment.
