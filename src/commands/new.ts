import type { Command } from "commander";
import { createSession } from "../core/tmux.js";
import { launchSession } from "../core/claude.js";
import { addWorktree, updateWorktree } from "../core/state.js";
import path from "node:path";
import os from "node:os";

const STATE_PATH = path.join(os.homedir(), ".wt", "state.json");

export function registerNew(program: Command): void {
  program
    .command("new <name> [branch]")
    .description("Create a new worktree")
    .option("-l, --launch", "Auto-launch Claude Code after creation")
    .option("-t, --tmux", "Open worktree in a new tmux window")
    .option("--from <branch>", "Base branch (defaults to current HEAD)")
    .action(async (name, branch, opts) => {
      const worktreePath = path.resolve(`.wt/${name}`);
      const branchName = branch ?? name;
      const tmuxSessionName = `wt-${name}`;

      await addWorktree(STATE_PATH, {
        name,
        path: worktreePath,
        branch: branchName,
        createdAt: new Date().toISOString(),
        tmuxSession: null,
        claudeActive: false,
      });

      if (opts.tmux || opts.launch) {
        await createSession(tmuxSessionName, worktreePath);
        await updateWorktree(STATE_PATH, name, {
          tmuxSession: tmuxSessionName,
        });
        console.log(`tmux session "${tmuxSessionName}" created`);
      }

      if (opts.launch) {
        await launchSession(worktreePath, tmuxSessionName);
        await updateWorktree(STATE_PATH, name, { claudeActive: true });
        console.log(`Claude Code launched in "${tmuxSessionName}"`);
      }

      console.log(`Worktree "${name}" created at ${worktreePath}`);
    });
}
