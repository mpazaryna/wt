import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockExeca } = vi.hoisted(() => {
  const mockExeca = vi.fn();
  return { mockExeca };
});
vi.mock("execa", () => ({ execa: mockExeca }));

import {
  sessionExists,
  createSession,
  attachSession,
  killSession,
} from "../core/tmux.js";

beforeEach(() => {
  mockExeca.mockReset();
});

describe("sessionExists", () => {
  it("returns true when session exists", async () => {
    mockExeca.mockResolvedValue({ stdout: "" });
    expect(await sessionExists("foo")).toBe(true);
    expect(mockExeca).toHaveBeenCalledWith("tmux", ["has-session", "-t", "foo"]);
  });

  it("returns false when session does not exist", async () => {
    mockExeca.mockRejectedValue(new Error("session not found"));
    expect(await sessionExists("foo")).toBe(false);
  });
});

describe("createSession", () => {
  it("creates a detached session in the given directory", async () => {
    mockExeca.mockResolvedValue({ stdout: "" });
    await createSession("foo", "/tmp/worktree");
    expect(mockExeca).toHaveBeenCalledWith("tmux", [
      "new-session",
      "-d",
      "-s",
      "foo",
      "-c",
      "/tmp/worktree",
    ]);
  });

  it("throws when tmux errors", async () => {
    mockExeca.mockRejectedValue(new Error("duplicate session"));
    await expect(createSession("foo", "/tmp/worktree")).rejects.toThrow(
      "duplicate session"
    );
  });
});

describe("attachSession", () => {
  it("attaches to an existing session with inherited stdio", async () => {
    mockExeca.mockResolvedValue({ stdout: "" });
    await attachSession("foo");
    expect(mockExeca).toHaveBeenCalledWith(
      "tmux",
      ["attach-session", "-t", "foo"],
      { stdio: "inherit" }
    );
  });

  it("throws when session does not exist", async () => {
    mockExeca.mockRejectedValue(new Error("no session"));
    await expect(attachSession("foo")).rejects.toThrow("no session");
  });
});

describe("killSession", () => {
  it("kills the named session", async () => {
    mockExeca.mockResolvedValue({ stdout: "" });
    await killSession("foo");
    expect(mockExeca).toHaveBeenCalledWith("tmux", [
      "kill-session",
      "-t",
      "foo",
    ]);
  });

  it("throws when session does not exist", async () => {
    mockExeca.mockRejectedValue(new Error("no session"));
    await expect(killSession("foo")).rejects.toThrow("no session");
  });
});
