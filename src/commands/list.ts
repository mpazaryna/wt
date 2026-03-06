import type { Command } from "commander";

export function registerList(program: Command): void {
  program
    .command("list")
    .description("List all tracked worktrees with status")
    .action(async () => {
      console.log("wt list: not yet implemented");
    });
}
