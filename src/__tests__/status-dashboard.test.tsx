import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "ink-testing-library";
import { StatusDashboard, type DashboardRow } from "../ui/StatusDashboard.js";

const rows: DashboardRow[] = [
  { name: "tui", branch: "feat/tui", dirty: false, claudeStatus: "unknown" },
  { name: "cc-launch", branch: "feat/cc-launch", dirty: true, claudeStatus: "unknown" },
];

describe("StatusDashboard", () => {
  it("renders header row", () => {
    const { lastFrame } = render(React.createElement(StatusDashboard, { rows }));
    const output = lastFrame()!;
    expect(output).toContain("Name");
    expect(output).toContain("Branch");
    expect(output).toContain("Status");
    expect(output).toContain("Claude");
  });

  it("renders worktree names and branches", () => {
    const { lastFrame } = render(React.createElement(StatusDashboard, { rows }));
    const output = lastFrame()!;
    expect(output).toContain("tui");
    expect(output).toContain("feat/tui");
    expect(output).toContain("cc-launch");
    expect(output).toContain("feat/cc-launch");
  });

  it("renders dirty/clean status", () => {
    const { lastFrame } = render(React.createElement(StatusDashboard, { rows }));
    const output = lastFrame()!;
    expect(output).toContain("clean");
    expect(output).toContain("dirty");
  });

  it("renders claude status as unknown", () => {
    const { lastFrame } = render(React.createElement(StatusDashboard, { rows }));
    const output = lastFrame()!;
    // two "unknown" entries
    const matches = output.match(/unknown/g);
    expect(matches).toHaveLength(2);
  });

  it("renders empty dashboard with no rows", () => {
    const { lastFrame } = render(React.createElement(StatusDashboard, { rows: [] }));
    const output = lastFrame()!;
    expect(output).toContain("Name");
    // no data rows
    expect(output).not.toContain("tui");
  });
});
