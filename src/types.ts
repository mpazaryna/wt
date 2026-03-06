export interface WorktreeEntry {
  name: string;
  path: string;
  branch: string;
  createdAt: string;
  tmuxSession: string | null;
  claudeActive: boolean;
}

export interface State {
  worktrees: Record<string, WorktreeEntry>;
}
