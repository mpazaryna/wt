import fs from "node:fs/promises";
import path from "node:path";
import type { State, WorktreeEntry } from "../types.js";

const EMPTY_STATE: State = { worktrees: {} };

export async function loadState(statePath: string): Promise<State> {
  try {
    const raw = await fs.readFile(statePath, "utf-8");
    return JSON.parse(raw) as State;
  } catch {
    return { ...EMPTY_STATE, worktrees: {} };
  }
}

export async function saveState(statePath: string, state: State): Promise<void> {
  const dir = path.dirname(statePath);
  await fs.mkdir(dir, { recursive: true });
  const tmp = statePath + ".tmp." + process.pid;
  await fs.writeFile(tmp, JSON.stringify(state, null, 2) + "\n");
  await fs.rename(tmp, statePath);
}

export async function addWorktree(statePath: string, entry: WorktreeEntry): Promise<void> {
  const state = await loadState(statePath);
  if (state.worktrees[entry.name]) {
    throw new Error(`Worktree "${entry.name}" already exists`);
  }
  state.worktrees[entry.name] = entry;
  await saveState(statePath, state);
}

export async function removeWorktree(statePath: string, name: string): Promise<void> {
  const state = await loadState(statePath);
  if (!state.worktrees[name]) {
    throw new Error(`Worktree "${name}" not found`);
  }
  delete state.worktrees[name];
  await saveState(statePath, state);
}

export async function updateWorktree(
  statePath: string,
  name: string,
  updates: Partial<WorktreeEntry>,
): Promise<void> {
  const state = await loadState(statePath);
  if (!state.worktrees[name]) {
    throw new Error(`Worktree "${name}" not found`);
  }
  state.worktrees[name] = { ...state.worktrees[name], ...updates };
  await saveState(statePath, state);
}

export async function getWorktree(
  statePath: string,
  name: string,
): Promise<WorktreeEntry | undefined> {
  const state = await loadState(statePath);
  return state.worktrees[name];
}

export async function listWorktrees(statePath: string): Promise<WorktreeEntry[]> {
  const state = await loadState(statePath);
  return Object.values(state.worktrees);
}
