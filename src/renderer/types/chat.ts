export interface Workspace {
  id: string;
  name: string;
  branch: string;
  path: string;
  status: "active" | "idle" | "running";
}

export interface Message {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: Date;
  attachments?: string[];
  model?: string;
  provider?: 'codex' | 'claude';
}

export type CodexModel = 'gpt-5' | 'gpt-5-codex';
export type CodexReasoningEffort = 'low' | 'medium' | 'high';

export interface CodexSettings {
  model: CodexModel;
  reasoningEffort: CodexReasoningEffort;
}
