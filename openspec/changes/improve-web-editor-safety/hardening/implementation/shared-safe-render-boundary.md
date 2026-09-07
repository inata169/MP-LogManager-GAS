# Implementation Plan: Shared safe-rendering boundary

## Selected Design And Constraints
We will implement the approved shared safe-rendering boundary described by Option 2. Markdown is the only supported path from untrusted text to HTML, and it must pass through the vendored DOMPurify 3.4.14 policy. All other user-, Drive-, GAS-, or network-derived values are inserted with DOM text APIs. Persisted identifiers are captured by event-listener closures rather than interpolated into executable attributes.

The implementation must preserve the JSON schema, GAS request/response contract, manual Calendar and Google Tasks synchronization semantics, Task Markdown source, and the v2.3.3 iOS Journal full-document selection behavior. It must not branch on iPhone model names. Responsive behavior is shared from a 320-pixel viewport through tablets and desktops.

## Source Revision And Drift Check
- Evidence collection digest: `f5ecc84a330e5a4a303ce61a0a87361cfd3832d111474a72435e1c34fb08254c`
- Refreshed implementation revision: `c510d498fff7f2fae832492ecc0556bb0ddda3cd`
- Drift result before runtime editing: none. The five inventoried runtime files still match the SHA-256 values in `../context.md`; only this approved OpenSpec change is untracked.
- Physical benchmark reference supplied by the user: iPhone SE (3rd generation, 2022), iOS 26.6.1.

## Affected Components
- `web/js/safe-render.js`: shared Markdown parsing, sanitization, browser-support check, and plain-text fallback.
- `web/js/tasks.js`: DOM-built list, safe Markdown callers, dirty snapshot, and transactional editor save behavior.
- `web/js/journal.js`: DOM-built list and shared-safe Journal print rendering.
- `web/js/app.js`: DOM-built diagnostics/toasts and generic accessible modal lifecycle.
- `web/index.html`: accessible Settings dialog semantics, zoom-permitting viewport, module load order, and asset versions.
- `web/css/style.css`: modal scroll lock/focus treatment and responsive behavior.
- `web/sw.js`: v2.3.4 cache identity and exact local asset precache.

## Ordered Work Packages
1. Add the shared renderer and its fail-closed test surface while retaining the existing Task sanitizer until parity is established.
2. Move Task preview/list Markdown to the shared renderer, then remove duplicate sanitizer ownership.
3. Migrate Journal print, Task/Journal list construction, diagnostics, and toasts to the approved safe DOM patterns.
4. Add Task editor snapshots, a single cancelable close request, and rollback-on-save-failure behavior.
5. Add dialog naming, initial focus, focus containment, Escape, body scroll lock, background inertness, and opener restoration.
6. Remove zoom prohibition, update assets/cache, and execute security, responsive, offline, and performance checks.

## Compatibility And Migration
No stored data or API migration is needed. Existing Markdown remains source text and is rendered with the same `marked` line-break behavior and Task table preprocessing. Confirmed and accepted-but-unconfirmed GAS save responses retain their current UI semantics; only actual rejected/failed saves keep the Task editor open. Older PWA installations receive the v2.3.4 cache and may roll back by restoring the v2.3.3 frontend/cache commit.

## Tactical Protections During Migration
- Keep the v2.3.3 Task DOMPurify configuration in service until shared-render parity tests pass.
- Fail to literal text whenever Marked or DOMPurify is missing, unsupported, or throws; never fall back to unsanitized HTML.
- Keep dynamic values out of inline handlers during each list migration.
- Restore the previous in-memory Task array when an editor save request fails so retry cannot duplicate a new Task.

## Tests And Security Validation
- Run `node --check` on every changed JavaScript file and strict OpenSpec validation.
- Exercise scripts, event attributes, entity-obfuscated JavaScript URLs, data URLs, SVG/MathML, frames/objects, CSS injection, forms, and named-property clobbering in Task list/preview and Journal print.
- Verify fail-closed text behavior with DOMPurify missing and with `isSupported === false`.
- Verify hostile titles, categories, priorities, dates, identifiers, diagnostic messages, errors, and toast messages remain text and cannot create elements or handlers.
- Verify dirty close behavior for the close icon, Cancel, overlay, and Escape; verify “return to editing” preserves values, scroll position, and selected Edit/Preview tab.
- Verify save failure retains the editor and retry creates or updates exactly one Task; verify confirmed and accepted-but-unconfirmed responses close according to existing policy.
- Verify initial focus, Tab/Shift+Tab wrap, Escape, body scroll lock, background inertness, and opener focus restoration for Task and Settings dialogs.

## Performance And Resource Benchmarks
- Use fixed 1,000-line and 5,000-line Journal fixtures to record editor initialization, representative input latency, full selection/copy equality, and crash/reload behavior.
- Record the physical reference result on iPhone SE (3rd generation, 2022), iOS 26.6.1 after deployment. This reference does not change shared CSS or JavaScript behavior.
- Confirm non-iOS CodeMirror keeps its finite viewport margin.
- Compare a 1,000-record list render before/after in one controlled desktop browser. Investigate regressions over 20%; block release when the absolute regression is also user-visible or exceeds 100 ms.

## Rollout And Rollback
Publish v2.3.4 assets and the matching Service Worker cache together, then verify the old-to-new PWA update, offline relaunch, and the physical iPhone reference flow. Roll back by reverting the v2.3.4 frontend/cache commit; no stored data conversion or backend rollback is required. Archive the OpenSpec change only after deployment and physical-device confirmation.

## Acceptance Criteria
- Every reviewed untrusted value reaches the DOM as text or common-sanitizer output.
- Task and Journal Markdown share one DOMPurify-required, fail-closed boundary.
- No persisted identifier is present in inline executable source.
- All Task close paths protect dirty input, while successful or policy-accepted saves complete normally.
- Task and Settings modal keyboard/focus behavior is consistent from 320-pixel mobile layouts through desktop.
- Pinch zoom is allowed and primary controls remain reachable at 200% equivalent zoom.
- iOS full-document Journal selection remains correct; non-iOS virtualization remains enabled.
- v2.3.4 online and offline assets resolve without runtime errors.

## Open Decisions
- Physical iPhone timings require the user’s deployed-device run; implementation QA supplies the fixed fixture and recording method.
- A future CSP/Trusted Types rollout remains separate because it changes deployment policy beyond this incremental boundary.
