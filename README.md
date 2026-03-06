# wt

A CLI for managing git worktrees paired with Claude Code sessions. Run parallel experiments across branches without context-switching overhead.

## Why

Git worktrees are powerful but underused because the workflow is manual and stateless. `wt` provides the missing glue — tracking which worktrees are active, associating Claude Code sessions with them, and making spin-up/teardown fast.

## Commands

```
wt new <name> [branch]   # Create a worktree (optionally launch Claude Code)
wt list                   # List all tracked worktrees with status
wt open <name>            # Navigate to a worktree directory
wt kill <name>            # Remove worktree and clean up state
wt status                 # Dashboard view of all worktrees
wt init                   # One-time setup (~/.wt/ config, shell integration)
```

### `wt new` flags

- `--launch` / `-l` — auto-launch Claude Code after creation
- `--tmux` / `-t` — open in a new tmux window/pane
- `--from <branch>` — base branch (defaults to current HEAD)

### `wt kill` flags

- `--force` — force removal even with uncommitted changes

## Install

```bash
npm install -g wt
```

## Requirements

- Node.js 20+
- Git
- macOS/Linux (no Windows support in v1)
- Optional: tmux, Claude Code CLI
