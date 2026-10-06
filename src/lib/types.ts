export type TaskStatus = 'added' | 'doing' | 'blocked' | 'done';

export type TaskPriority = 'Normalny' | 'Wysoki' | 'Pilny';

export interface Area {
  id: string;
  name: string;
  desc: string;
  color: string;
  position?: number;
  created_at?: string;
  user_id?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  area: string; // area_id
  status: TaskStatus;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:MM
  priority: TaskPriority;
  position?: number;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface ParsedVoiceTask {
  rawTranscript: string;
  title: string;
  area: string;
  status: TaskStatus;
  date: string;
  time: string;
  priority: TaskPriority;
}

export type ActiveView = 'today' | 'all' | 'areas' | 'board';
