import { execa } from "execa";

export async function sessionExists(name: string): Promise<boolean> {
  try {
    await execa("tmux", ["has-session", "-t", name]);
    return true;
  } catch {
    return false;
  }
}

export async function createSession(name: string, cwd: string): Promise<void> {
  await execa("tmux", ["new-session", "-d", "-s", name, "-c", cwd]);
}

export async function attachSession(name: string): Promise<void> {
  await execa("tmux", ["attach-session", "-t", name], { stdio: "inherit" });
}

export async function killSession(name: string): Promise<void> {
  await execa("tmux", ["kill-session", "-t", name]);
}
