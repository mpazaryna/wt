import type { Command } from "commander";
import React from "react";
import { render } from "ink";
import { loadState } from "../core/state.js";
import { isWorktreeDirty } from "../core/git.js";
import { StatusDashboard, type DashboardRow } from "../ui/StatusDashboard.js";

const STATE_PATH = new URL("../../.wt/state.json", `file://${process.env.HOME}/`).pathname;

export function registerStatus(program: Command): void {
  program
    .command("status")
    .description("Dashboard view of all worktrees")
    .action(async () => {
      const state = await loadState(STATE_PATH);
      const entries = Object.values(state.worktrees);

      if (entries.length === 0) {
        console.log("No worktrees tracked.");
        return;
      }

      const rows: DashboardRow[] = await Promise.all(
        entries.map(async (entry) => {
          let dirty = false;
          try {
            dirty = await isWorktreeDirty(entry.path);
          } catch {
            // path may not exist; treat as clean
          }
          return {
            name: entry.name,
            branch: entry.branch,
            dirty,
            claudeStatus: "unknown" as const,
          };
        }),
      );

      const { unmount } = render(React.createElement(StatusDashboard, { rows }));
      unmount();
    });
}
