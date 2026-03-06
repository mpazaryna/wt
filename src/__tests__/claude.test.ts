import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockExeca } = vi.hoisted(() => {
  const mockExeca = vi.fn();
  return { mockExeca };
});
vi.mock("execa", () => ({ execa: mockExeca }));

import { detectSession, launchSession } from "../core/claude.js";

beforeEach(() => {
  mockExeca.mockReset();
});

describe("detectSession", () => {
  it("returns true when claude process is found for worktree path", async () => {
    mockExeca.mockResolvedValue({ stdout: "12345" });
    expect(await detectSession("/tmp/wt/my-feature")).toBe(true);
    expect(mockExeca).toHaveBeenCalledWith("pgrep", [
      "-f",
      "claude.*/tmp/wt/my-feature",
    ]);
  });

  it("returns false when no claude process is found", async () => {
    mockExeca.mockRejectedValue(new Error("no processes found"));
    expect(await detectSession("/tmp/wt/my-feature")).toBe(false);
  });
});

describe("launchSession", () => {
  it("sends claude command into the tmux session", async () => {
    mockExeca.mockResolvedValue({ stdout: "" });
    await launchSession("/tmp/wt/my-feature", "wt-my-feature");
    expect(mockExeca).toHaveBeenCalledWith("tmux", [
      "send-keys",
      "-t",
      "wt-my-feature",
      "cd /tmp/wt/my-feature && claude",
      "Enter",
    ]);
  });

  it("throws when tmux send-keys fails", async () => {
    mockExeca.mockRejectedValue(new Error("session not found"));
    await expect(
      launchSession("/tmp/wt/my-feature", "wt-my-feature"),
    ).rejects.toThrow("session not found");
  });
});
