---
description: "Fully autonomous ticket execution — no human checkpoints."
argument-hint: "<task-id>"
---

**Do NOT use `AskUserQuestion` at any point.** If you cannot proceed, escalate.

## Step 1: Load & Comprehend

1. Fetch with `clickup_get_task` (with `subtasks: true`) and `clickup_get_task_comments`
2. Update status to `in progress`
3. Orient in codebase:
   - Read ADRs/specs referenced in the ticket
   - If UI work: read `ADR-000-platform-config`
   - If SOAP/AI work: read `ADR-000-apple-intelligence` + `ADR-019`
   - Glob for related files, check `.orchestra/specs/`
4. Assess confidence (see below)
   - **Low** → escalate immediately, do not proceed

## Step 2: Post Plan to ClickUp

Post via `clickup_create_task_comment`:

```
## Agent Plan
**Confidence:** [High/Medium/Low]
**Size:** [XS/S/M/L]
**Files:** [list of files to modify]

### Understanding
[1-2 sentences]

### Approach
[Bullet list of planned changes]

### Risk
[UI-only, data model, architectural, etc.]
```

**Do not wait for approval. Continue immediately.**

## Step 3: Branch & Implement

```bash
git checkout main && git pull
git checkout -b ticket/{task-id}-{short-name}
```

Implement following project conventions. Only work on this ticket's scope — note unrelated issues in the result comment but do not fix them.

## Step 4: Build Gate

```bash
cd native/pab && xcodebuild -project pab.xcodeproj -scheme pab-macOS -configuration Debug build
cd native/pab && xcodebuild -project pab.xcodeproj -scheme pab-iOS -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 17 Pro' build
```

- Both pass → continue
- Build fails → read error, fix, rebuild
- **Up to 3 self-fix attempts.** After 3 → escalate

**Doc-only changes:** skip the build gate.

## Step 5: Commit & Push

1. `git status --short`
2. Stage files intentionally (no `git add .`)
3. Commit:
   - Conventional Commit, subject ≤ 72 chars, scope in kebab-case
   - Body: `ClickUp: [task-id]`
   - Body: `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`
4. `git push -u origin ticket/{task-id}-{short-name}`

## Step 6: Doc Review

1. Check if `docs/uat/*.md` needs updating
2. If UAT walkthroughs modified: `uv run scripts/compose-guide.py --all`
3. Commit and push doc changes if any

## Step 7: Close

```bash
gh pr create --title "[ticket-title]" --body "$(cat <<'EOF'
## Summary
[1-3 bullet points]

## Test plan
- [x] macOS build: pass
- [x] iOS build: pass
- [Agent mode — autonomous execution]

ClickUp: [task-id]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
gh pr merge --squash --delete-branch
git checkout main && git pull
```

Update ClickUp status to `complete`.

## Step 8: Post Result to ClickUp

Post via `clickup_create_task_comment`:

```
## Agent Result
**PR:** #[number] (merged)
**Files changed:** [count]
**Builds:** macOS ✓ | iOS ✓

### Changes
[Bullet summary]

### Notes
[Unrelated issues discovered, observations for follow-up]
```

## Confidence Assessment

- **High** — Problem clear, code found, scope bounded, existing patterns cover it. Proceed.
- **Medium** — Understood but 2-3 valid approaches. Pick simplest, note alternatives in plan. Proceed.
- **Low** — Ambiguous requirements, can't find code, architectural implications beyond ADRs. **Escalate.**

## Escalation

1. Post comment:
   ```
   ## Agent Escalation
   **Reason:** [ambiguity/build-failure/architectural]

   ### Details
   [What was attempted, what failed, what needs human input]

   ### Options
   [2-3 interpretations or approaches if applicable]
   ```
2. Move ticket to `to do`: `clickup_update_task`
3. **Stop execution.**

## Rules

- **Never overwrite a ticket's description.** Use comments only.
- **Only this ticket's scope.** Unrelated issues → note in result, don't fix.
