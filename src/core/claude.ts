import { execa } from "execa";

export async function detectSession(worktreePath: string): Promise<boolean> {
  try {
    await execa("pgrep", ["-f", `claude.*${worktreePath}`]);
    return true;
  } catch {
    return false;
  }
}

export async function launchSession(
  worktreePath: string,
  tmuxSession: string,
): Promise<void> {
  await execa("tmux", [
    "send-keys",
    "-t",
    tmuxSession,
    `cd ${worktreePath} && claude`,
    "Enter",
  ]);
}
