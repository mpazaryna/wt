import type { Command } from "commander";

export function registerOpen(program: Command): void {
  program
    .command("open <name>")
    .description("Navigate to a worktree directory")
    .action(async (_name) => {
      console.log("wt open: not yet implemented");
    });
}
