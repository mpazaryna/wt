import type { Command } from "commander";

export function registerKill(program: Command): void {
  program
    .command("kill <name>")
    .description("Remove worktree and clean up state")
    .option("--force", "Force removal even with uncommitted changes")
    .action(async (_name, _opts) => {
      console.log("wt kill: not yet implemented");
    });
}
