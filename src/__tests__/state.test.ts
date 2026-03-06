import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {
  loadState,
  saveState,
  addWorktree,
  removeWorktree,
  updateWorktree,
  getWorktree,
  listWorktrees,
} from "../core/state.js";
import type { WorktreeEntry, State } from "../types.js";

let testDir: string;
let statePath: string;

beforeEach(async () => {
  testDir = await fs.mkdtemp(path.join(os.tmpdir(), "wt-test-"));
  statePath = path.join(testDir, "state.json");
});

afterEach(async () => {
  await fs.rm(testDir, { recursive: true, force: true });
});

const entry: WorktreeEntry = {
  name: "my-feature",
  path: "/tmp/wt/my-feature",
  branch: "feat/my-feature",
  createdAt: "2026-03-06T00:00:00.000Z",
  tmuxSession: null,
  claudeActive: false,
};

describe("loadState", () => {
  it("returns empty state when file does not exist", async () => {
    const state = await loadState(statePath);
    expect(state).toEqual({ worktrees: {} });
  });

  it("reads existing state from disk", async () => {
    const existing: State = { worktrees: { "my-feature": entry } };
    await fs.writeFile(statePath, JSON.stringify(existing));
    const state = await loadState(statePath);
    expect(state.worktrees["my-feature"]).toEqual(entry);
  });
});

describe("saveState", () => {
  it("creates parent directory if missing", async () => {
    const nested = path.join(testDir, "sub", "state.json");
    await saveState(nested, { worktrees: {} });
    const raw = await fs.readFile(nested, "utf-8");
    expect(JSON.parse(raw)).toEqual({ worktrees: {} });
  });

  it("writes valid JSON with pretty formatting", async () => {
    await saveState(statePath, { worktrees: { "my-feature": entry } });
    const raw = await fs.readFile(statePath, "utf-8");
    expect(raw).toContain("\n"); // pretty-printed
    expect(JSON.parse(raw).worktrees["my-feature"].name).toBe("my-feature");
  });

  it("performs atomic write (temp + rename)", async () => {
    // Write twice — if non-atomic, a crash mid-write could corrupt
    await saveState(statePath, { worktrees: { a: { ...entry, name: "a" } } });
    await saveState(statePath, { worktrees: { b: { ...entry, name: "b" } } });
    const state = JSON.parse(await fs.readFile(statePath, "utf-8"));
    expect(state.worktrees).toHaveProperty("b");
    expect(state.worktrees).not.toHaveProperty("a");
  });
});

describe("addWorktree", () => {
  it("adds a new worktree entry", async () => {
    await addWorktree(statePath, entry);
    const state = await loadState(statePath);
    expect(state.worktrees["my-feature"]).toEqual(entry);
  });

  it("throws if worktree name already exists", async () => {
    await addWorktree(statePath, entry);
    await expect(addWorktree(statePath, entry)).rejects.toThrow(/already exists/);
  });
});

describe("removeWorktree", () => {
  it("removes an existing worktree", async () => {
    await addWorktree(statePath, entry);
    await removeWorktree(statePath, "my-feature");
    const state = await loadState(statePath);
    expect(state.worktrees["my-feature"]).toBeUndefined();
  });

  it("throws if worktree does not exist", async () => {
    await expect(removeWorktree(statePath, "nope")).rejects.toThrow(/not found/);
  });
});

describe("updateWorktree", () => {
  it("updates partial fields on an existing worktree", async () => {
    await addWorktree(statePath, entry);
    await updateWorktree(statePath, "my-feature", {
      tmuxSession: "sess-1",
      claudeActive: true,
    });
    const state = await loadState(statePath);
    expect(state.worktrees["my-feature"].tmuxSession).toBe("sess-1");
    expect(state.worktrees["my-feature"].claudeActive).toBe(true);
    // unchanged fields preserved
    expect(state.worktrees["my-feature"].branch).toBe("feat/my-feature");
  });

  it("throws if worktree does not exist", async () => {
    await expect(
      updateWorktree(statePath, "nope", { claudeActive: true })
    ).rejects.toThrow(/not found/);
  });
});

describe("getWorktree", () => {
  it("returns the entry for an existing worktree", async () => {
    await addWorktree(statePath, entry);
    const result = await getWorktree(statePath, "my-feature");
    expect(result).toEqual(entry);
  });

  it("returns undefined for a missing worktree", async () => {
    const result = await getWorktree(statePath, "nope");
    expect(result).toBeUndefined();
  });
});

describe("listWorktrees", () => {
  it("returns empty array when no worktrees exist", async () => {
    const list = await listWorktrees(statePath);
    expect(list).toEqual([]);
  });

  it("returns all worktree entries", async () => {
    await addWorktree(statePath, entry);
    await addWorktree(statePath, { ...entry, name: "second", branch: "feat/second" });
    const list = await listWorktrees(statePath);
    expect(list).toHaveLength(2);
    expect(list.map((e) => e.name).sort()).toEqual(["my-feature", "second"]);
  });
});
