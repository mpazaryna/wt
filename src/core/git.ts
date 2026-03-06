import { execa } from "execa";

export async function isWorktreeDirty(worktreePath: string): Promise<boolean> {
  const { stdout } = await execa("git", ["-C", worktreePath, "status", "--porcelain"]);
  return stdout.trim().length > 0;
}
