# Release Notes v2.3.4

**Status:** Released 2026-09-07.

## Summary
v2.3.4 gives Task and Journal one shared safe Markdown boundary and improves Task/modal accessibility without changing stored data or Google synchronization. The responsive code is shared across phones, tablets, and desktops; iPhone SE is a physical QA reference, not a dedicated target.

## Changes
- Centralized Markdown parsing and DOMPurify 3.4.14 sanitization in `web/js/safe-render.js`, with literal-text fail-closed behavior.
- Applied the shared renderer to Task list/preview and Journal print output.
- Rebuilt Task/Journal cards, connection diagnostics, and toast messages with DOM text APIs; removed data-derived inline event handlers.
- Blocked active/remote media in rendered Markdown to prevent script execution and unintended tracking requests.
- Added Task dirty-state confirmation for close, Cancel, backdrop, and Escape.
- Kept Task input open after actual save failures and made new/edit save updates retry-safe in memory.
- Added dialog naming, initial focus, Tab/Shift+Tab wrapping, Escape, background inertness, body scroll lock, and focus restoration.
- Removed `user-scalable=no` / `maximum-scale=1.0` so browser pinch zoom is available.
- Added browser regression pages for security payloads and Journal 1,000/5,000-line performance checks.
- Updated local asset versions and the Service Worker cache to v2.3.4.

## Preserved Constraints
- No JSON schema or top-level data structure changes.
- No GAS API contract changes.
- No Calendar or Google Tasks synchronization semantic changes.
- Task save still does not automatically run Google synchronization.
- iOS Journal native full-document selection remains enabled only for iOS contenteditable mode; non-iOS retains finite CodeMirror virtualization.

## Verification
- JavaScript syntax checks for all changed production scripts and the Service Worker.
- Safe-render browser regression: 13/13 positive, attack, no-execution, and fail-closed checks passed.
- Task preview removed active markup, handler attributes, unsafe URLs, and remote media.
- Task Cancel/Escape/close-icon checks preserved dirty values when returning to edit; actual save failure kept the modal/input and a retryable dirty state.
- Initial focus, forward/backward Tab wrapping, body lock, background inertness, and opener focus restoration passed.
- Browser checks passed at 320×568, 375×667, 390×844, 430×932, 667×375 landscape, 768×1024, and 1280×800; no horizontal overflow and footer actions remained reachable.
- Non-iOS 1,000/5,000-line fixture retained `viewportMargin: 10` virtualization and completed without a crash.
- GitHub Pages served the v2.3.4 app, shared renderer, test fixtures, and Service Worker successfully.
- Physical iPhone SE (3rd generation, 2022), iOS 26.6.1 acceptance was confirmed by the user after deployment. The 1,000/5,000-line fixture, selection/copy flow, zoom reachability, and PWA use completed without a reported failure; numerical device timings were not supplied.
