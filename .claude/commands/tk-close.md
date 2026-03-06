---
description: "Close a ticket — UAT check, doc review, PR, merge, done."
argument-hint: "<task-id>"
---

## Step 1: UAT Check

1. Fetch ticket with `clickup_get_task` — confirm it's in `in progress` or `uat` status
2. Ask the user:
   - Did UAT pass? Any issues found?
   - If issues: fix on the same branch, commit, re-push, ask again
   - If pass: continue to Step 2

## Step 2: Doc Review

1. Check if any `docs/uat/*.md` files need updating for this ticket's changes
2. If UAT walkthroughs were added or modified:
   ```bash
   uv run scripts/compose-guide.py --all
   ```
3. Check if an ADR is warranted (significant architectural decisions)
4. Commit doc changes on the same branch:
   - Conventional Commit (e.g., `docs(uat): update walkthrough for [feature]`)
   - Body: `ClickUp: [task-id]`
   - Body: `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`
5. Push: `git push`

If no doc changes needed, skip to Step 3.

## Step 3: Create PR

```bash
gh pr create --title "[ticket-title]" --body "$(cat <<'EOF'
## Summary
[1-3 bullet points]

## Test plan
- [UAT results — what was tested and by whom]

ClickUp: [task-id]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## Step 4: Merge

Confirm with user before merging.

```bash
gh pr merge --squash --delete-branch
git checkout main && git pull
```

## Step 5: Update ClickUp

1. Update status to `complete`: `clickup_update_task`
2. Report:
   ```
   ## Done
   - PR: [url]
   - ClickUp: [task-id] → complete
   ```

## Build Commands (if needed for fixes)

```bash
# macOS
cd native/pab && xcodebuild -project pab.xcodeproj -scheme pab-macOS -configuration Debug build

# iOS
cd native/pab && xcodebuild -project pab.xcodeproj -scheme pab-iOS -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 17 Pro' build
```

## Rules

- **Never overwrite a ticket's description.** Use comments only.
- **Confirm merge with user** — don't auto-merge without approval.
