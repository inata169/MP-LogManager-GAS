# Antigravity Development Protocol

This document contains project-specific workflow rules for AI assistants working on MP-LogManager-GAS.

## 1. Read Order
Before starting work, read these files when they exist:

1. `AGENTS.md`
2. `Antigravity_Rules.md`
3. `99-handover_context.md`
4. `Todo.md`
5. Relevant OpenSpec files when the task mentions a proposal, plan, spec, architecture, performance, or larger behavior change

## 2. Encoding Rules
This repository is developed on Windows/PowerShell, so encoding problems are easy to create.

- Treat all project documentation as UTF-8.
- Do not rewrite Japanese text through tools or shell commands that may reinterpret encoding.
- Prefer `apply_patch` for manual edits.
- After touching docs, check for common Japanese mojibake marker strings and replacement characters.
- If mojibake is found in recently edited docs, clean it before committing.

## 3. Git Safety
- Do not include local-only tooling such as `.codex-tools/` in commits.
- Do not revert user changes unless explicitly asked.
- Before committing, verify the staged files are exactly the intended files.
- Keep proposal/docs cleanup and implementation changes in separate commits when practical.

## 4. OpenSpec Rules
- Read `openspec/AGENTS.md` for proposal/spec work.
- Validate active changes with:

```powershell
openspec validate <change-id> --strict --no-interactive
```

- If OpenSpec CLI is not installed globally, use the local or portable toolchain only as a workspace aid; do not commit portable binaries.

## 5. Release Checklist
For release work:

- Update release notes.
- Run relevant syntax checks and OpenSpec validation.
- Confirm manual browser checks when user-facing behavior changed.
- Tag the release.
- Create or confirm the GitHub Release.
- Update `99-daily-summary.md`, `99-handover_context.md`, and `Todo.md`.

## 6. Handover Checklist
At the end of substantial work, update:

- `99-daily-summary.md`
- `99-handover_context.md`
- `Todo.md`

The handover should include:

- what changed
- what was verified
- what constraints were preserved
- what remains next
- any local-only tooling or environment notes

## 7. v2.3.2 Constraints To Remember
For the v2.3.2 line:

- Do not change the JSON schema or top-level data structure.
- Do not change the GAS API contract.
- Do not change Calendar sync semantics.
- Do not implement stable Calendar event matching, Calendar event ID persistence, upsert behavior, deduplication, JSON splitting, differential save, or archive migration.
- Save does not automatically sync Calendar events; manual sync remains required.
