---
description: "Fetch a ClickUp ticket, create a branch, and start working."
argument-hint: "<task-id or search query>"
---

## Load Ticket

1. If `$ARGUMENTS` looks like a task ID (e.g., `86e065njp`), fetch directly:
   - `clickup_get_task` with `subtasks: true`
   - `clickup_get_task_comments`
2. If it looks like a search query, search first:
   - `clickup_search` with `keywords`, filter `asset_types: ["task"]`
   - Present matches, ask user to pick one, then fetch
3. Update status to `in progress`: `clickup_update_task`

**Present as:**

```
# [Task Name]
> ID: [id] | Status: [status] | Priority: [priority] | Assignee: [assignee]
> URL: [url]

## Description
[full description]

## Subtasks
[list if any]

## Comments
[summarize key points]
```

## Evaluate

Check the ticket against:
- [ ] Clear objective — is "done" obvious?
- [ ] Scope — bounded or could sprawl?
- [ ] Acceptance criteria — explicit or inferred?
- [ ] Technical pointers — files, ADRs, components referenced?
- [ ] Dependencies — blocked by other tickets?

Ask clarifying questions with `AskUserQuestion` for any gaps. **Do not proceed until ambiguities are resolved.**

## Create Branch

```bash
git checkout main && git pull
git checkout -b ticket/{task-id}-{short-name}
```

If already on another branch:
```bash
git fetch origin && git checkout -b ticket/{task-id}-{short-name} origin/main
```

`{short-name}` = 2-3 kebab-case words from the ticket title. **Verify you're on the new branch before writing code.**

## Orient

- Read any ADRs or specs referenced in the ticket
- If UI work: read `ADR-000-platform-config`
- If SOAP/AI work: read `ADR-000-apple-intelligence` + `ADR-019`
- Glob `.orchestra/decisions/` and `.orchestra/specs/` for related context
- If multi-session: create spec at `.orchestra/specs/{task-number}-{short-name}.md`

## Plan & Implement

Enter plan mode to design the approach. Wait for user approval before coding.

After implementation, commit following Conventional Commits:
- Subject ≤ 72 chars, scope in kebab-case
- Body includes `ClickUp: [task-id]`
- Body includes `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`
- Stage files intentionally (no `git add .`)

Push when ready:
```bash
git push -u origin ticket/{task-id}-{short-name}
```

## Rules

- **Never overwrite a ticket's description.** Status, dates, priority, assignees only. All updates go in comments (`clickup_create_task_comment`).
- **Only work on this ticket's scope.** Unrelated issues → new ClickUp ticket.
- **Abandoning:** just `git checkout main`. The branch is the isolation. Post a comment explaining why, move ticket back to `to do`.
