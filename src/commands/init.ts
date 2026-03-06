import type { Command } from "commander";

export function registerInit(program: Command): void {
  program
    .command("init")
    .description("One-time setup (~/.wt/ config, shell integration)")
    .action(async () => {
      console.log("wt init: not yet implemented");
    });
}
