'use client';

import React from 'react';
import { Area, Task } from '../lib/types';
import {
  formatFullPolishDate,
  getIsoToday,
  STATUS_COLORS,
  STATUS_LABELS,
  isOverdue,
  formatPolishDate,
} from '../lib/utils';
import { Mic, Check, Clock, AlertCircle } from 'lucide-react';

interface TodayViewProps {
  tasks: Task[];
  areas: Area[];
  onEditTask: (task: Task) => void;
  onSelectArea: (areaId: string) => void;
  onOpenVoiceModal: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  tasks,
  areas,
  onEditTask,
  onSelectArea,
  onOpenVoiceModal,
}) => {
  const todayIso = getIsoToday();

  // Tasks due today or overdue uncompleted tasks
  const todayTasks = tasks
    .filter((t) => t.date === todayIso || isOverdue(t.date, t.time, t.status))
    .sort((a, b) => {
      // Sort overdue first, then by time
      const aOverdue = isOverdue(a.date, a.time, a.status);
      const bOverdue = isOverdue(b.date, b.time, b.status);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return (a.time || '99:99').localeCompare(b.time || '99:99');
    });

  // Summary Metrics
  const urgentCount = tasks.filter(
    (t) => t.priority === 'Pilny' && t.status !== 'done'
  ).length;
  const doingCount = tasks.filter((t) => t.status === 'doing').length;
  const addedCount = tasks.filter((t) => t.status === 'added').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  // Upcoming breakdown
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowIso = tomorrowDate.toISOString().slice(0, 10);

  const tomorrowCount = tasks.filter((t) => t.date === tomorrowIso).length;

  const thisWeekCount = tasks.filter((t) => {
    if (!t.date) return false;
    const taskD = new Date(t.date);
    const now = new Date();
    const diffTime = taskD.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  const thisMonthCount = tasks.filter((t) => {
    if (!t.date) return false;
    const taskD = new Date(t.date);
    const now = new Date();
    return (
      taskD.getFullYear() === now.getFullYear() &&
      taskD.getMonth() === now.getMonth()
    );
  }).length;

  const getArea = (areaId: string): Area => {
    return (
      areas.find((a) => a.id === areaId) || {
        id: areaId,
        name: areaId,
        desc: '',
        color: '#2f80ed',
      }
    );
  };

  return (
    <section className="view active">
      <div className="page-title">
        <div>
          <h1>Dzisiaj</h1>
          <div className="sub" id="todayDate">
            {formatFullPolishDate()}
          </div>
        </div>
        <button className="secondary flex items-center gap-1.5" onClick={onOpenVoiceModal}>
          <Mic className="w-4 h-4 text-[var(--blue)]" />
          <span>Dodaj głosem</span>
        </button>
      </div>

      <div className="today-grid">
        <div className="panel">
          <div className="task-list">
            {todayTasks.length === 0 ? (
              <div className="py-12 text-center text-[var(--muted)]">
                <p className="text-sm font-medium">Brak zadań na dzisiaj!</p>
                <p className="text-xs mt-1">Ciesz się wolnym czasem lub dodaj nowe zadanie.</p>
              </div>
            ) : (
              todayTasks.map((t) => {
                const area = getArea(t.area);
                const overdue = isOverdue(t.date, t.time, t.status);
                const statusStyle = STATUS_COLORS[t.status] || STATUS_COLORS.added;

                return (
                  <div
                    key={t.id}
                    className="task-row hover:bg-[var(--panel2)] transition-colors rounded-lg px-2 cursor-pointer"
                    onClick={() => onEditTask(t)}
                  >
                    <span
                      className="status-ring flex items-center justify-center text-white text-xs"
                      style={{
                        borderColor: statusStyle.border,
                        backgroundColor: t.status === 'done' ? statusStyle.border : 'transparent',
                      }}
                    >
                      {t.status === 'done' && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>

                    <div>
                      <div className="task-name flex items-center gap-2">
                        <span className={t.status === 'done' ? 'line-through opacity-70' : ''}>
                          {t.title}
                        </span>
                        {overdue && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded">
                            <AlertCircle className="w-3 h-3" /> Zaległe
                          </span>
                        )}
                      </div>
                      <div className="task-meta flex items-center gap-2 mt-1 text-xs text-[var(--muted)]">
                        <span style={{ color: area.color }} className="font-semibold">
                          ● {area.name}
                        </span>
                        <span>· {STATUS_LABELS[t.status]}</span>
                        {t.priority === 'Pilny' && (
                          <span className="text-red-500 font-semibold">· 🔴 Pilny</span>
                        )}
                        {t.priority === 'Wysoki' && (
                          <span className="text-amber-500 font-semibold">· 🟠 Wysoki</span>
                        )}
                      </div>
                    </div>

                    <span className="time font-medium text-xs flex items-center gap-1 text-[var(--muted)]">
                      {t.time && <Clock className="w-3.5 h-3.5 inline" />}
                      {t.time || ''}
                    </span>

                    <span className="tag">
                      {t.date === todayIso ? 'Dzisiaj' : formatPolishDate(t.date)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="side-stack">
          <div className="panel side-card">
            <h3>Podsumowanie</h3>
            <div className="summary-row">
              <span>🔴 Pilne niegotowe</span>
              <strong className="text-red-500">{urgentCount}</strong>
            </div>
            <div className="summary-row">
              <span>🟠 W toku</span>
              <strong>{doingCount}</strong>
            </div>
            <div className="summary-row">
              <span>🔵 Dodane</span>
              <strong>{addedCount}</strong>
            </div>
            <div className="summary-row">
              <span>🟢 Gotowe</span>
              <strong className="text-emerald-600">{doneCount}</strong>
            </div>
          </div>

          <div className="panel side-card">
            <h3>Nadchodzące</h3>
            <div className="summary-row">
              <span>Jutro</span>
              <strong>{tomorrowCount}</strong>
            </div>
            <div className="summary-row">
              <span>Ten tydzień</span>
              <strong>{thisWeekCount}</strong>
            </div>
            <div className="summary-row">
              <span>Ten miesiąc</span>
              <strong>{thisMonthCount}</strong>
            </div>
          </div>

          <div className="voice-card">
            <h3 style={{ margin: '0 0 8px' }}>Szybkie dodawanie</h3>
            <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
              Mów naturalnie: &quot;Dodaj do MedAI: raport na jutro o 9:00&quot;
            </p>
            <button className="voice-btn flex items-center justify-center gap-2" onClick={onOpenVoiceModal}>
              <Mic className="w-5 h-5" />
              <span>Kliknij i mów</span>
            </button>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '19px', margin: '25px 0 12px' }}>Obszary</h2>
      <div className="areas-grid">
        {areas.map((a) => {
          const areaTasks = tasks.filter((t) => t.area === a.id);
          const uncompleted = areaTasks.filter((t) => t.status !== 'done').length;

          return (
            <div
              key={a.id}
              className="area-card cursor-pointer hover:border-[var(--blue)] transition-all"
              onClick={() => onSelectArea(a.id)}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="dot" style={{ backgroundColor: a.color || '#2f80ed' }} />
                  <h3>{a.name}</h3>
                </div>
                <p>{a.desc}</p>
                <div className="mt-2 text-xs text-[var(--muted)] font-medium">
                  {uncompleted} aktywnych z {areaTasks.length} zadań
                </div>
              </div>
              <strong className="text-xl text-[var(--muted)] hover:text-[var(--blue)]">›</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
};
