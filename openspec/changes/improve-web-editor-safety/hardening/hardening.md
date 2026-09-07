# Security Hardening Review: MP-LogManager Web Editor Safety

## Evidence Basis
I inspected the v2.3.3 Web App at revision `c510d498fff7f2fae832492ecc0556bb0ddda3cd`. The five-file source collection is identified in [`context.md`](context.md) with digest `f5ecc84a330e5a4a303ce61a0a87361cfd3832d111474a72435e1c34fb08254c`.

We already have a sound DOMPurify boundary for Task Markdown, but the same trust decision is repeated differently elsewhere. Journal print accepts parsed HTML directly, Task and Journal cards mix persisted values with HTML and inline handlers, and diagnostics/toasts concatenate runtime messages into HTML. These are source observations, not proof of exploitation; no dynamic exploit run was performed for this proposal.

## Constraints
We must preserve the JSON schema, GAS API, manual Google sync semantics, and the v2.3.3 iPhone full-document selection behavior. No latency or memory budget was supplied, so the analysis uses a balanced profile and treats performance estimates as unmeasured until implementation QA.

The same v2.3.4 release also proposes Task dirty-state protection, accessible modal focus management, zoom support, and measured iPhone long-document QA. Those UX items are specified by the parent OpenSpec change; this portfolio concentrates on the security architecture decision.

## Opportunity Portfolio
| Opportunity | Evidence | Options | Recommendation | Proposal |
| --- | --- | --- | --- | --- |
| Centralize untrusted DOM rendering | Journal print, Task/Journal record templates, diagnostics/toasts, and sanitizer ownership drift | 1. Sink-local guards; 2. Shared safe-rendering boundary | Option 2 under the current small-app, balanced constraints | [Full proposal](proposals/centralize-untrusted-dom-rendering.md) |

## Recommendation Summary
Option 1 is attractive if the only objective is the smallest immediate patch. We can protect every known sink with limited movement, and the rollout is easy to reverse. What gives me pause is that this preserves the exact structural condition that let Task Markdown become safer while Journal print and runtime messages did not: each feature still owns a subtly different rule.

I recommend Option 2. We would keep one DOMPurify-backed Markdown renderer, use text nodes for ordinary external values, and bind record actions through closures rather than inline source. The migration touches more list-rendering code, but no service, schema, or external dependency changes. Option 1 becomes preferable only if the release window cannot accommodate the required visual/event regression pass.

## Next Decisions
- Option 2 was approved for implementation on 2026-09-07.
- The physical benchmark reference is iPhone SE (3rd generation, 2022) on iOS 26.6.1. This is a measurement reference, not a device-specific implementation target.
- The implementation handoff records the refreshed source revision and drift check before runtime edits.
