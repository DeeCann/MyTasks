'use client';

import React from 'react';
import { Area, Task } from '../lib/types';
import {
  formatPolishDate,
  STATUS_COLORS,
  STATUS_LABELS,
  getIsoToday,
  isOverdue,
} from '../lib/utils';
import { Check, Clock, AlertCircle } from 'lucide-react';

interface AllTasksViewProps {
  tasks: Task[];
  areas: Area[];
  searchQuery: string;
  onEditTask: (task: Task) => void;
}

export const AllTasksView: React.FC<AllTasksViewProps> = ({
  tasks,
  areas,
  searchQuery,
  onEditTask,
}) => {
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

  const q = searchQuery.trim().toLowerCase();

  const filteredTasks = tasks.filter((t) => {
    const areaName = getArea(t.area).name.toLowerCase();
    const titleMatch = t.title.toLowerCase().includes(q);
    const descMatch = (t.description || '').toLowerCase().includes(q);
    const areaMatch = areaName.includes(q);
    return titleMatch || descMatch || areaMatch;
  });

  const todayIso = getIsoToday();

  return (
    <section className="view active">
      <div className="page-title">
        <div>
          <h1>Wszystkie zadania</h1>
          <div className="sub">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'zadanie' : 'zadań'}{' '}
            {q ? `dla frazy "${searchQuery}"` : 'ze wszystkich obszarów'}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="task-list">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-[var(--muted)]">
              <p className="text-sm font-medium">Brak pasujących zadań.</p>
              {q && <p className="text-xs mt-1">Spróbuj zmienić słowa kluczowe w wyszukiwarce.</p>}
            </div>
          ) : (
            filteredTasks.map((t) => {
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
                      backgroundColor:
                        t.status === 'done' ? statusStyle.border : 'transparent',
                    }}
                  >
                    {t.status === 'done' && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>

                  <div>
                    <div className="task-name flex items-center gap-2">
                      <span
                        className={t.status === 'done' ? 'line-through opacity-70' : ''}
                      >
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
                    {t.date === todayIso ? 'Dzisiaj' : formatPolishDate(t.date) || 'Bez terminu'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
