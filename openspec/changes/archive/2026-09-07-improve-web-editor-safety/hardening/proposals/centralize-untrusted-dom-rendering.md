# Security Hardening Proposal: Centralize Untrusted DOM Rendering

## Decision
We need to decide whether v2.3.4 should patch each current HTML sink independently or establish one shared Markdown boundary and a text-by-default DOM construction rule. This document recommends the shared boundary, but it does not claim that the source is fixed; runtime implementation begins only after the option is approved.

## Executive Recommendation
The complete option set is:

- **Option 1: Add guards at each current sink.** Keep existing feature-owned templates, add DOMPurify to Journal print, and escape or validate every currently observed interpolation.
- **Option 2: Adopt one shared safe-rendering boundary.** Move sanitized Markdown to one fail-closed module, use DOM APIs for other external values, and replace data-derived inline handlers with programmatic listeners.

I recommend Option 2 under the current constraints. I inspected the Task, Journal, diagnostics, toast, modal, and document entry points at revision `c510d498fff7f2fae832492ecc0556bb0ddda3cd`. The repeated issue is not a single parser mistake; it is that each feature decides independently whether a value is text, trusted structure, or sanitized Markdown. A small shared boundary gives us a proportionate way to make that decision reviewable without introducing a framework, service, schema, or new dependency.

Option 1 remains reasonable if delivery time cannot support the list-rendering regression work. It directly protects the known sinks and is easier to roll back, but future reviewers would still need to rediscover every local rule.

## Evidence
The evidence is a targeted source collection, not a completed security scan. No dynamic exploit was run for the newly identified sinks during this proposal, so we distinguish the direct source observations from the recurrence inference.

| Evidence | Finding or document | What it establishes |
| --- | --- | --- |
| `SRC-04-JOURNAL-PRINT` | Journal print Markdown sink | `web/js/journal.js:306-331` passes `marked.parse(content)` directly to `innerHTML` without DOMPurify. |
| `SRC-03-TASK-CARDS` | Task card template and inline actions | `web/js/tasks.js:91-105` interpolates persisted ID, category, priority, and due date values into HTML and inline handlers. |
| `SRC-04-JOURNAL-LIST` | Journal list template and inline actions | `web/js/journal.js:102-113` interpolates persisted IDs and dates into HTML and inline handlers. |
| `SRC-02-RUNTIME-MESSAGES` | Diagnostics and toast HTML | `web/js/app.js:163-206,257` concatenates diagnostic, error, and notification values into `innerHTML`. |
| `SRC-INFERRED-CONTROL-DRIFT` | Feature-owned rendering policy | The Task Markdown sanitizer in `web/js/tasks.js:467-494` is safe for that feature, but the other paths do not share its policy. This supports an inference that ownership is dispersed. |

The first four items are observed source flows. The fifth is an inference from their inconsistent control ownership. Persisted data normally originates from the user's own Drive, which lowers exposure compared with a public multi-tenant feed, but Drive files can be imported or manually edited, and network-derived diagnostics are outside the renderer's direct control. We should therefore keep the claim narrow: the source permits external strings to influence HTML structure; implementation testing must determine the exact browser behavior for each payload.

## Current Design And Failure Mode
Task details have a clear sanitizer boundary: Markdown is parsed, DOMPurify is checked for browser support, and failure returns escaped text. The attractive part of that implementation is its fail-closed behavior. Its limitation is ownership—`renderMarkdown()` lives in `tasks.js`, so Journal print does not naturally reuse it.

Record lists and runtime feedback use a different model. They assemble whole fragments as template strings, mixing constant structure with persisted or runtime values. Some values, such as Task titles and Journal previews, are escaped; other values, IDs, and messages are not. Inline handlers make identifiers part of executable source rather than data. Each local template can be made safe, but safety depends on remembering the correct treatment for every interpolation.

This structure also weakens failure containment. If DOMPurify is unavailable in Task rendering, Task details become inert text. If Journal print parsing encounters hostile HTML, there is no equivalent sanitizer or fallback before the print DOM is created. Diagnostics and toasts similarly have no single policy that says messages are text.

## Desired Invariants
- Every intentional Markdown-to-HTML conversion uses one DOMPurify-backed renderer.
- If the parser or sanitizer is absent, unsupported, or throws, output is inert escaped text.
- Every non-Markdown value from users, Drive, GAS, or the network enters the DOM as text.
- Persisted identifiers are never interpolated into inline executable code.
- Intentional `innerHTML` assignments are limited to sanitizer output or compile-time constant structure and are easy to enumerate.
- The security migration preserves current visual behavior, Task interactions, Journal printing, PWA offline operation, data formats, and API contracts.

## Constraints And Non-Goals
We must preserve the v2.3.3 JSON schema, top-level data layout, GAS request/response behavior, and manual Google sync semantics. Vendored DOMPurify 3.4.14 is already approved and cached for offline use; adding another sanitizer is unnecessary.

We are not proposing CSP or Trusted Types in this release. GitHub Pages, current CDN-loaded libraries, inline styles, and Safari compatibility make that a broader migration. We also are not claiming that every security concern in the repository has been audited: this review is scoped to the five inventoried Web App files and their rendering/modal paths.

No measured performance budget was supplied. We will measure list rendering and Journal long-document behavior during implementation rather than treating intuition as benchmark data.

## Before Architecture
The before view shows the important split: Task Markdown has a dedicated sanitizer, while other feature renderers can reach HTML sinks through templates or direct Markdown parsing.

[Before architecture diagram](../diagrams/centralize-untrusted-dom-rendering-before.mmd)

The security-relevant edge is the direct path from external values through feature-owned HTML strings to the live or print DOM. The same data type is treated differently depending on which file renders it, so review coverage—not a shared invariant—currently prevents drift.

## Options
### Option 1: Add guards at each current sink
Option 1 preserves the current architecture. We would add DOMPurify to `printJournal()`, escape Task/Journal metadata and identifiers before interpolation, validate IDs before use, and replace or constrain dynamic diagnostic/toast fragments. Each feature would continue to own its templates and sanitizer calls.

The strongest case for this option is delivery control. Each patch can be reviewed and rolled back independently, current HTML output changes little, and there is no new module load order or shared API. The performance effect should be small because most work is bounded string escaping, plus one sanitizer call when printing.

Security improves for every sink we enumerate, but residual recurrence risk remains. A later template can omit an escape, a second sanitizer configuration can diverge, and inline handlers remain tempting if we do not fully remove them. In practice, this option asks future reviewers to keep a complete sink inventory current.

[Option 1 after diagram](../diagrams/centralize-untrusted-dom-rendering-sink-local-guards-after.mmd)

| Change | Before | After | Security consequence | Cost |
| --- | --- | --- | --- | --- |
| Journal Markdown | Direct `marked.parse()` to DOM | Local DOMPurify call | Protects the observed print sink | One more local sanitizer policy |
| Task/Journal metadata | Mixed escaped/raw template values | Every current value escaped/validated | Protects enumerated fields | Review burden remains per interpolation |
| Record actions | Data IDs in inline source | Locally validated or selectively refactored actions | Narrows executable injection | Can preserve inconsistent action patterns |
| Diagnostics/toasts | Dynamic HTML strings | Local text treatment at each fragment | Protects current message paths | Several independent conversions |

Rollback is straightforward: revert an individual patch while retaining the v2.3.3 Task Markdown sanitizer. Migration can be incremental, but tactical protections are the final architecture, so there is no later control consolidation.

### Option 2: Adopt one shared safe-rendering boundary
Option 2 keeps the application framework-free but changes ownership. A new `safe-render.js` module would own Markdown parsing, DOMPurify policy, browser-support checks, exception handling, and escaped-text fallback. Task-specific table preprocessing stays in `tasks.js`, then passes its prepared Markdown to the shared boundary. Journal print calls the same boundary without Task preprocessing.

For ordinary values, we would stop generating executable HTML strings. Task and Journal cards would be built with `createElement`/`textContent`, and their actions would capture validated record values in `addEventListener` closures. Diagnostics and toasts would use fixed DOM structure with external messages assigned as text. This makes the type decision visible: Markdown takes the sanitizer path; everything else takes the text path.

The strongest case is recurrence reduction. Reviewers can inspect one Markdown policy and search a small set of intentional HTML sinks. Malformed IDs cease to be executable source, and sanitizer failure has one behavior across Task and Journal surfaces. The boundary is structural but modest: it adds no service, protocol, framework, or external dependency.

What gives me pause is migration risk. DOM construction is more verbose than a card template, listener closures change event wiring, and an incomplete conversion could cause visual or interaction regressions even when the security direction is right. Performance could move in either direction: we avoid parsing one large HTML string but create nodes and listeners individually. The app's normal dataset is expected to be small, yet we should benchmark 0, 100, and 1,000 records rather than assume the cost is irrelevant.

[Option 2 after diagram](../diagrams/centralize-untrusted-dom-rendering-shared-safe-render-boundary-after.mmd)

| Change | Before | After | Security consequence | Cost |
| --- | --- | --- | --- | --- |
| Markdown policy | Task-owned sanitizer; Journal direct parse | One fail-closed shared renderer | Consistent policy and failure containment | Shared module load/order must be tested |
| Ordinary external strings | Mixed template interpolation | `textContent`/text nodes | Values cannot create markup | More explicit DOM construction code |
| Record actions | Inline executable source | Closure-bound event listeners | IDs remain data | Event parity tests required |
| Intentional HTML sinks | Distributed and hard to classify | Enumerated sanitizer/constant sinks | Easier audit and drift detection | Requires repository convention/documentation |

We can roll this option out surface by surface. The existing Task sanitizer remains in place until Task parity tests pass against the shared module. If one list migration fails, we can revert that surface without changing stored data. Full rollback returns the Web assets and Service Worker cache to v2.3.3.

## Comparison
The table summarizes direction, confidence, and why the cost arises. None of these performance or memory effects is measured yet.

| Dimension | Option 1: Sink-local guards | Option 2: Shared boundary |
| --- | --- | --- |
| Security | Improves known sinks; high source-derived confidence; recurrence risk remains | Improves known sinks and control ownership; high source-derived confidence; convention can still be bypassed without CSP |
| Performance | Likely neutral; medium confidence; bounded escaping and print sanitization | Unknown; medium confidence; trades template parsing for per-node/listener work; benchmark required |
| Memory | Likely neutral; medium confidence; temporary strings only | Unknown; low confidence; fewer template strings but more node/listener allocations |
| Reliability | Better handling of malformed current values; medium confidence | One fail-closed path and typed DOM values improve containment; medium confidence; broader regression surface |
| Operability | No new module, but audit remains dispersed | One policy and enumerable sinks reduce review burden; no new deployed service |
| Migration | Small and easily reversible | Moderate refactor with visual/event parity work; still data/API compatible and reversible |

Option 1 minimizes immediate change size. Option 2 provides the better steady-state invariant. The decision turns less on runtime scale than on whether the release can fund careful interaction regression testing.

## Recommendation
I recommend Option 2 for v2.3.4. The application is small enough that we can centralize Markdown safety without introducing a heavy abstraction, and the reviewed evidence already shows control drift across four surfaces. We should preserve the v2.3.3 Task sanitizer tactically until the shared path proves parity, then migrate Journal print, lists, diagnostics, and toasts in reviewable steps.

I would switch to Option 1 if the user needs an emergency security-only patch before the mobile interaction test window is available. I would consider CSP/Trusted Types in a later proposal only if CDN/inline compatibility work is accepted and Safari support is reassessed.

## Evidence Coverage And Residual Risk
| Evidence | Option 1 | Option 2 | Tactical protection during migration |
| --- | --- | --- | --- |
| `SRC-04-JOURNAL-PRINT` — Journal print Markdown sink | Addresses with local sanitization | Addresses through shared Markdown boundary | Add/retain print sanitization before broader list work |
| `SRC-03-TASK-CARDS` — Task card template and actions | Addresses enumerated fields | Addresses through DOM text construction/listeners | Retain v2.3.3 Task-detail sanitizer throughout |
| `SRC-04-JOURNAL-LIST` — Journal list template and actions | Addresses enumerated fields | Addresses through DOM text construction/listeners | Escape/validate until DOM migration is complete |
| `SRC-02-RUNTIME-MESSAGES` — Diagnostics and toast HTML | Addresses each current fragment | Addresses through fixed DOM structure and text nodes | Treat caught/remote messages as text immediately |
| `SRC-INFERRED-CONTROL-DRIFT` — Feature-owned policy | Unaffected | Mitigated by one Markdown owner and text default | Repository search remains necessary until all surfaces migrate |

Residual risk remains after either option. DOMPurify and the Markdown parser stay in the trusted computing base. A future caller can bypass a JavaScript convention because browser-enforced Trusted Types are out of scope. CDN version pinning for Marked and EasyMDE is a separate supply-chain concern. The proposal also does not establish that other repository areas are free of HTML injection because the evidence set is deliberately scoped.

## Migration And Rollout
We would first add the shared module and test it without changing callers. Task details migrate next because their current v2.3.3 behavior provides a known-safe parity baseline. Journal print follows, closing the direct Markdown sink. Task and Journal lists then move independently to DOM construction; diagnostics and toasts move after their text/structure distinctions are enumerated.

Each step keeps the current data and GAS contracts. Asset query strings and the Service Worker cache move together only after all callers pass. Rollout uses the existing GitHub Pages path; rollback reverts Web assets/cache to v2.3.3. We do not remove the tactical Task sanitizer until the shared renderer passes positive Markdown, attack corpus, and fail-closed tests.

## Validation Plan
- Run positive Markdown cases for headings, emphasis, lists, checklists, tables, code, and safe links on Task list, Task preview, and Journal print.
- Run script, event attribute, JavaScript/data URL, entity-obfuscated URL, SVG/MathML, iframe/object/embed, style, form, image-event, and named-property clobbering payloads on every intentional Markdown surface.
- Run hostile strings through Task category/priority/due date/ID, Journal date/ID, diagnostic step/error/hint, caught error, and toast message paths; assert no executable nodes/attributes and no action misbinding.
- Disable or mock unsupported DOMPurify and parser failures; assert escaped text and no live active content.
- Verify Task/Journal card visuals, click, checkbox, delete, sorting, searching, and active-selection behavior at 0, 100, and 1,000 records.
- Record render time and heap behavior for those fixtures; investigate a candidate regression above 20 percent rather than treating it as an automatic release failure.
- Verify Service Worker cold/upgrade/offline behavior with exact versioned assets.

The parent OpenSpec design separately validates Task dirty-state, modal keyboard/focus behavior, zoom, and iPhone Journal performance because those are user-safety and accessibility concerns rather than evidence for this security architecture choice.

## Implementation Work Packages
- Create the shared fail-closed Markdown renderer and a reusable attack/positive corpus.
- Migrate Task Markdown and prove parity with v2.3.3.
- Migrate Journal print and verify print layout plus active-content rejection.
- Replace Task and Journal list templates/inline handlers with DOM text construction and listeners.
- Replace diagnostic and toast dynamic HTML with fixed structure and text nodes.
- Audit remaining `innerHTML` assignments, document why each is constant or sanitized, and run security/visual/performance/offline validation.

The user approved Option 2 on 2026-09-07. The implementation handoff binds it to the refreshed source revision and explicit acceptance/rollback criteria.

## Open Questions
- Resolved: implement Option 2, the shared safe-rendering boundary.
- Resolved: record iPhone SE (3rd generation, 2022) on iOS 26.6.1 as the physical benchmark reference without adding device-specific code.
- Treat a greater-than-20-percent 1,000-record list-render regression as an investigation threshold. It blocks release when the absolute regression is also user-visible or exceeds 100 ms in the controlled browser benchmark.
