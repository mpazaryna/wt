# PRD: `wt` — Claude Code Worktree Manager CLI

## Overview

`wt` is a TypeScript/Node CLI that manages git worktrees paired with Claude Code sessions. It provides the missing glue layer between git's worktree primitive and the emerging multi-agent Claude Code workflow — making it natural to run parallel experiments across branches without context-switching overhead.

---

## Problem

Git worktrees are powerful but underused because the workflow is manual and stateless. There is no standard way to:

- Track which worktrees are active and what they contain
- Associate a Claude Code session with a specific worktree
- Get a unified view across all in-flight work
- Cleanly spin up or tear down a worktree + session pair

The result is that developers default to stashing and branch-switching, losing the parallelism benefit entirely.

---

## Goals

- Make worktree-per-experiment the path of least resistance
- Enable multiple Claude Code sessions to run in parallel, each scoped to a worktree
- Provide lightweight state tracking without requiring a server or daemon
- Stay composable — work alongside existing git, tmux, and Claude Code workflows

---

## Non-Goals

- Not a replacement for git worktree commands — a wrapper and orchestration layer
- Not a full IDE or session manager
- No remote/cloud state — local only for v1
- No Windows support in v1

---

## Users

Primary user: **Paz** (and developers like him) — senior engineers running multiple Claude Code sessions across feature experiments who want a fast, keyboard-driven workflow.

---

## Core Commands

### `wt new <name> [branch]`
Creates a new worktree. Optionally creates the branch if it doesn't exist. Registers the worktree in local state. Optionally launches Claude Code in the new worktree directory.

**Flags:**
- `--launch` / `-l` — auto-launch Claude Code after creation
- `--tmux` / `-t` — open worktree in a new tmux window or pane
- `--from <branch>` — base branch (defaults to current HEAD)

---

### `wt list`
Lists all tracked worktrees with status: path, branch, last active, Claude Code session state (active / inactive / unknown).

---

### `wt open <name>`
Navigates to the worktree directory. Requires shell function integration (similar to `z` or `fnm`). Optionally re-attaches to tmux session if one exists.

---

### `wt kill <name>`
Removes the worktree via `git worktree remove`, cleans up state entry, optionally kills the associated tmux session.

**Flags:**
- `--force` — force removal even with uncommitted changes

---

### `wt status`
Full dashboard view: all worktrees, branches, last commit, dirty/clean state, Claude Code session status. Designed for a quick "what am I working on" snapshot.

---

### `wt init`
One-time setup: creates `~/.wt/` config directory, writes default config, installs shell function for `wt open`.

---

## State Model

Local JSON file at `~/.wt/state.json`. No daemon, no lock files — read/write on each command.

```json
{
  "worktrees": {
    "wt-storage": {
      "name": "wt-storage",
      "path": "/Users/paz/projects/wt-worktrees/wt-storage",
      "branch": "feat/storage",
      "createdAt": "2026-03-06T10:00:00Z",
      "tmuxSession": "wt-storage",
      "claudeActive": true
    }
  }
}
```

---

## Technical Architecture

### Stack
- **Runtime:** Node.js 20+
- **Language:** TypeScript (strict mode)
- **CLI framework:** `commander`
- **Terminal UI:** `ink` (React for terminals) for `wt status` dashboard
- **Process management:** `execa`
- **State:** JSON via `fs/promises` with atomic writes
- **Shell integration:** auto-generated shell function for `wt open`

### Project Structure
```
wt/
├── src/
│   ├── cli.ts              # entry point, command registration
│   ├── commands/
│   │   ├── new.ts
│   │   ├── list.ts
│   │   ├── open.ts
│   │   ├── kill.ts
│   │   ├── status.ts
│   │   └── init.ts
│   ├── core/
│   │   ├── git.ts          # git worktree primitives
│   │   ├── state.ts        # read/write ~/.wt/state.json
│   │   ├── tmux.ts         # tmux session management
│   │   └── claude.ts       # claude code process detection/launch
│   └── ui/
│       └── StatusDashboard.tsx   # ink component
├── CLAUDE.md               # project context for Claude Code sessions
├── package.json
└── tsconfig.json
```

---

## Worktree Experiment Structure (for this repo itself)

The project is built using its own workflow as a dogfooding exercise:

| Worktree | Branch | Scope |
|---|---|---|
| `main` | `main` | scaffold, types, CLI entry, CLAUDE.md |
| `wt-storage` | `feat/storage` | state file implementation |
| `wt-tmux` | `feat/tmux` | tmux integration |
| `wt-tui` | `feat/tui` | ink status dashboard |
| `wt-cc-launch` | `feat/cc-launch` | Claude Code auto-launch |

`wt-storage` and `wt-tmux` are the first two parallel worktrees — the point where the meta-experiment begins.

---

## CLAUDE.md Contract

Each worktree will contain a `CLAUDE.md` that orients the Claude Code session scoped to that branch. The root `CLAUDE.md` will document the overall architecture and which files are owned by which branch, so sessions don't collide.

---

## Success Criteria

- Running `wt new wt-storage feat/storage --launch` spins up a worktree and opens Claude Code in under 5 seconds
- `wt status` gives an accurate snapshot of all active worktrees and session states
- Two Claude Code sessions can run concurrently in separate worktrees without interference
- The workflow feels faster than manual `git worktree add` + `cd` + `claude`

---

## Open Questions

- Should `wt open` use shell integration or just print the path (simpler, more portable)?
- tmux vs. iTerm2 tabs vs. just new terminal windows — support one or make it configurable?
- Should Claude Code session detection be polling-based or pid-file-based?
- v2 consideration: should state live in the repo (`.git/wt-state.json`) instead of `~/.wt/`?
