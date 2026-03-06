import type { Command } from "commander";

export function registerNew(program: Command): void {
  program
    .command("new <name> [branch]")
    .description("Create a new worktree")
    .option("-l, --launch", "Auto-launch Claude Code after creation")
    .option("-t, --tmux", "Open worktree in a new tmux window")
    .option("--from <branch>", "Base branch (defaults to current HEAD)")
    .action(async (_name, _branch, _opts) => {
      console.log("wt new: not yet implemented");
    });
}
