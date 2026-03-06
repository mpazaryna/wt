# wt User Guide

`wt` is a CLI that manages git worktrees paired with Claude Code sessions. It lets you run parallel experiments across branches, each in its own directory with optional tmux and Claude Code integration.

## Prerequisites

- Node.js 20+
- git
- tmux (optional, for session management)
- Claude Code CLI (optional, for auto-launch)

## Installation

```bash
git clone https://github.com/mpazaryna/wt.git
cd wt
npm install
```

Run commands with `npx tsx src/cli.ts <command>` during development, or build first:

```bash
npm run build
node dist/cli.js <command>
```

## State File

`wt` tracks worktrees in `~/.wt/state.json`. This file is created automatically when you add your first worktree. No daemon or lock files are needed.

## Commands

### `wt new <name> [branch]`

Create a new worktree and register it in state.

```bash
# Create worktree "my-feature" on branch "my-feature"
wt new my-feature

# Create worktree "experiment" on branch "feat/experiment"
wt new experiment feat/experiment

# Create with a tmux session
wt new my-feature --tmux

# Create with tmux + auto-launch Claude Code
wt new my-feature --launch

# Branch from a specific base
wt new my-feature --from develop
```

**Options:**
- `-t, --tmux` — Open the worktree in a new tmux session
- `-l, --launch` — Auto-launch Claude Code in the tmux session
- `--from <branch>` — Base branch (defaults to current HEAD)

### `wt status`

Display a dashboard of all tracked worktrees.

```bash
wt status
```

Output:

```
Name            Branch                  Status    Claude
tui             feat/tui                clean     unknown
cc-launch       feat/cc-launch          dirty     unknown
```

Each row shows:
- **Name** — worktree identifier
- **Branch** — git branch
- **Status** — `clean` (green) or `dirty` (yellow) based on live `git status`
- **Claude** — Claude Code session status (`active`, `inactive`, or `unknown`)

### `wt kill <name>`

Remove a worktree and clean up its state entry.

```bash
wt kill my-feature

# Force removal even with uncommitted changes
wt kill my-feature --force
```

### `wt list`

List all tracked worktrees with their status.

```bash
wt list
```

### `wt open <name>`

Navigate to a worktree directory.

```bash
wt open my-feature
```

### `wt init`

One-time setup for `~/.wt/` config and shell integration.

```bash
wt init
```

## Typical Workflow

1. **Start a new feature:**
   ```bash
   wt new auth-refactor feat/auth-refactor --launch
   ```
   This creates the worktree, opens a tmux session, and launches Claude Code.

2. **Check on all your work:**
   ```bash
   wt status
   ```
   See which branches are dirty, which have Claude running.

3. **Clean up when done:**
   ```bash
   wt kill auth-refactor
   ```

## Project Structure

```
~/.wt/
  state.json          # tracks all worktrees

your-repo/
  .wt/
    my-feature/       # worktree directory
    another-feature/  # another worktree
```

Each worktree is a full working copy of the repo on its own branch. Changes in one worktree don't affect others, so you can run parallel experiments safely.
