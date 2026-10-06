import { TaskStatus, TaskPriority } from './types';

export const getIsoToday = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatPolishDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T12:00:00');
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'short',
  }).format(date);
};

export const formatFullPolishDate = (date: Date = new Date()): string => {
  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  added: 'Dodane',
  doing: 'W toku',
  blocked: 'Zablokowane',
  done: 'Gotowe',
};

export const STATUS_COLORS: Record<TaskStatus, { border: string; bg: string; text: string }> = {
  added: { border: '#2f80ed', bg: 'rgba(47, 128, 237, 0.1)', text: '#2f80ed' },
  doing: { border: '#f2992e', bg: 'rgba(242, 153, 46, 0.1)', text: '#f2992e' },
  blocked: { border: '#ef5b68', bg: 'rgba(239, 91, 104, 0.1)', text: '#ef5b68' },
  done: { border: '#18a66a', bg: 'rgba(24, 166, 106, 0.1)', text: '#18a66a' },
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  Normalny: 'var(--muted)',
  Wysoki: '#f2992e',
  Pilny: '#ef5b68',
};

export const AREA_COLOR_PALETTE = [
  '#2f80ed',
  '#18a66a',
  '#8757c7',
  '#f2992e',
  '#ef5b68',
  '#00b4d8',
  '#e63946',
];

export const isOverdue = (dateStr?: string, timeStr?: string, status?: TaskStatus): boolean => {
  if (!dateStr || status === 'done') return false;
  const todayIso = getIsoToday();
  if (dateStr < todayIso) return true;
  if (dateStr === todayIso && timeStr) {
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;
    return timeStr < currentTime;
  }
  return false;
};

export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
};
