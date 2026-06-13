# Developer Setup

This guide describes the recommended per-PC setup for working on MP-LogManager-GAS.

## Prerequisites

Install these tools on each development PC:

- Git
- Node.js LTS
- GitHub CLI (`gh`)
- OpenSpec CLI

Recommended checks:

```powershell
git --version
node --version
npm --version
gh --version
openspec --version
```

If OpenSpec is not installed globally, a local portable copy can be used for workspace maintenance, but do not commit portable binaries or tool caches.

## Clone And Configure

```powershell
git clone https://github.com/inata169/MP-LogManager-GAS.git
cd MP-LogManager-GAS
gh auth login
```

Confirm repository state:

```powershell
git status --short --branch
git remote -v
```

## Local-Only Tooling

`.codex-tools/` is intentionally ignored by Git and should stay local to one PC.

Use it only as a fallback when a global tool is missing. For example, this repository has previously used a portable Node/OpenSpec toolchain under `.codex-tools/` for OpenSpec validation.

Do not commit:

- `.codex-tools/`
- downloaded portable CLI binaries
- machine-specific auth/config files

## Common Validation Commands

OpenSpec:

```powershell
openspec validate --specs --strict --no-interactive
openspec list
openspec list --specs
```

If only the local portable OpenSpec CLI is available:

```powershell
& .\.codex-tools\node-v24.16.0-win-x64\node.exe .\.codex-tools\node_modules\@fission-ai\openspec\bin\openspec.js validate --specs --strict --no-interactive
```

JavaScript syntax checks:

```powershell
node --check web/js/api.js
node --check web/js/app.js
node --check web/js/tasks.js
node --check web/js/journal.js
```

Git whitespace check:

```powershell
git diff --check
```

## Windows And Encoding Notes

This project contains Japanese documentation and user-facing text. Treat documentation and source files as UTF-8.

Avoid rewriting Japanese text with commands that may reinterpret encoding. Prefer targeted edits and review touched docs for common mojibake markers and replacement characters.

```powershell
rg -n "<known-mojibake-marker-pattern>" <touched-files>
```

PowerShell may display UTF-8 files incorrectly if read with the wrong encoding. Prefer:

```powershell
Get-Content -LiteralPath .\path\to\file.md -Encoding UTF8
```

## OpenSpec Workflow

Before OpenSpec work:

```powershell
Get-Content -LiteralPath .\openspec\AGENTS.md -Encoding UTF8
Get-Content -LiteralPath .\openspec\project.md -Encoding UTF8
openspec list
openspec list --specs
```

For active changes:

```powershell
openspec validate <change-id> --strict --no-interactive
```

After archiving or current-spec edits:

```powershell
openspec validate --specs --strict --no-interactive
```

## Release And Handover Notes

For substantial work, update:

- `99-daily-summary.md`
- `99-handover_context.md`
- `Todo.md`

For release work, also update release notes, run relevant syntax/OpenSpec checks, and confirm the GitHub Release manually when needed.
