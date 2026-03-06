# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`wt` is a TypeScript/Node CLI that manages git worktrees paired with Claude Code sessions. It wraps git's worktree primitive with state tracking, tmux integration, and Claude Code session management to enable parallel experiments across branches.

## Project Tracking

ClickUp project: https://app.clickup.com/9017822495/v/li/901711714612

## Tech Stack

- **Runtime:** Node.js 20+
- **Language:** TypeScript (strict mode)
- **CLI framework:** commander
- **Terminal UI:** ink (React for terminals) for the status dashboard
- **Process management:** execa
- **State:** JSON file at `~/.wt/state.json`, atomic writes via `fs/promises`

## Architecture

- `src/cli.ts` — entry point, command registration via commander
- `src/commands/` — one file per command (new, list, open, kill, status, init)
- `src/core/` — shared modules: `git.ts` (worktree primitives), `state.ts` (JSON state read/write), `tmux.ts` (session management), `claude.ts` (process detection/launch)
- `src/ui/StatusDashboard.tsx` — ink component for `wt status` dashboard

Commands orchestrate core modules. Core modules do not depend on each other except `state.ts` which is used by most commands.

## State Model

Local JSON at `~/.wt/state.json` — no daemon, no lock files. Each worktree entry tracks: name, path, branch, createdAt, tmuxSession, claudeActive.

## Worktree Development Strategy

The project dogfoods itself. Feature branches are developed in parallel worktrees:
- `main` — scaffold, types, CLI entry
- `feat/storage` — state file implementation
- `feat/tmux` — tmux integration
- `feat/tui` — ink status dashboard
- `feat/cc-launch` — Claude Code auto-launch

Each worktree has its own CLAUDE.md scoping the session to that branch's files to avoid collisions.

## Key Commands (once built)

```bash
# Build
npx tsc

# Run CLI locally
node dist/cli.js <command>

# Or via ts-node during development
npx ts-node src/cli.ts <command>
```
