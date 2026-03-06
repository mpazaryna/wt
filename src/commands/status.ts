import type { Command } from "commander";

export function registerStatus(program: Command): void {
  program
    .command("status")
    .description("Dashboard view of all worktrees")
    .action(async () => {
      console.log("wt status: not yet implemented");
    });
}
