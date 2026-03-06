import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execa } from "execa";
import { isWorktreeDirty } from "../core/git.js";

let testDir: string;

beforeEach(async () => {
  testDir = await fs.mkdtemp(path.join(os.tmpdir(), "wt-git-test-"));
  await execa("git", ["init", testDir]);
  await execa("git", ["-C", testDir, "config", "user.email", "test@test.com"]);
  await execa("git", ["-C", testDir, "config", "user.name", "Test"]);
  // need at least one commit for status to work reliably
  await fs.writeFile(path.join(testDir, "README.md"), "init");
  await execa("git", ["-C", testDir, "add", "."]);
  await execa("git", ["-C", testDir, "commit", "-m", "init"]);
});

afterEach(async () => {
  await fs.rm(testDir, { recursive: true, force: true });
});

describe("isWorktreeDirty", () => {
  it("returns false for a clean repo", async () => {
    expect(await isWorktreeDirty(testDir)).toBe(false);
  });

  it("returns true when there are unstaged changes", async () => {
    await fs.writeFile(path.join(testDir, "new-file.txt"), "hello");
    expect(await isWorktreeDirty(testDir)).toBe(true);
  });

  it("returns true when there are staged changes", async () => {
    await fs.writeFile(path.join(testDir, "staged.txt"), "hello");
    await execa("git", ["-C", testDir, "add", "staged.txt"]);
    expect(await isWorktreeDirty(testDir)).toBe(true);
  });
});
