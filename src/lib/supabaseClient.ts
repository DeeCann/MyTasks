import { createClient } from '@supabase/supabase-js';
import { Area, Task } from './types';
import { INITIAL_AREAS, INITIAL_TASKS } from './initialData';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_URL ||
  '';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_DEFAULT_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL'
);

if (typeof window !== 'undefined') {
  console.log(
    '[MyTasks Storage Engine]',
    isSupabaseConfigured
      ? 'Connected to Supabase Cloud Database'
      : 'Using LocalStorage Persistence Engine'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// LocalStorage Persistence Keys
const STORAGE_KEY_AREAS = 'mytasks_areas_v1';
const STORAGE_KEY_TASKS = 'mytasks_tasks_v1';

export const loadLocalAreas = (): Area[] => {
  if (typeof window === 'undefined') return INITIAL_AREAS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AREAS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_AREAS, JSON.stringify(INITIAL_AREAS));
      return INITIAL_AREAS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading areas from localStorage', err);
    return INITIAL_AREAS;
  }
};

export const saveLocalAreas = (areas: Area[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_AREAS, JSON.stringify(areas));
  } catch (err) {
    console.error('Error saving areas to localStorage', err);
  }
};

export const loadLocalTasks = (): Task[] => {
  if (typeof window === 'undefined') return INITIAL_TASKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading tasks from localStorage', err);
    return INITIAL_TASKS;
  }
};

export const saveLocalTasks = (tasks: Task[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Error saving tasks to localStorage', err);
  }
};
