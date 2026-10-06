'use client';

import React, { useState } from 'react';
import { Area, Task, TaskStatus } from '../lib/types';
import {
  STATUS_LABELS,
  formatPolishDate,
  isOverdue,
  getIsoToday,
} from '../lib/utils';
import { Mic, Plus, Calendar, Clock, AlertCircle, Trash2 } from 'lucide-react';

interface BoardViewProps {
  area: Area;
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onOpenNewTaskModal: () => void;
  onOpenVoiceModal: () => void;
  onConfirmDeleteArea: (area: Area) => void;
}

const COLUMNS: { key: TaskStatus; label: string; cl: string }[] = [
  { key: 'added', label: STATUS_LABELS.added, cl: 'added' },
  { key: 'doing', label: STATUS_LABELS.doing, cl: 'doing' },
  { key: 'blocked', label: STATUS_LABELS.blocked, cl: 'cl' },
  { key: 'done', label: STATUS_LABELS.done, cl: 'done' },
];

export const BoardView: React.FC<BoardViewProps> = ({
  area,
  tasks,
  onUpdateTaskStatus,
  onEditTask,
  onOpenNewTaskModal,
  onOpenVoiceModal,
  onConfirmDeleteArea,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const areaTasks = tasks.filter((t) => t.area === area.id);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, statusKey: TaskStatus) => {
    e.preventDefault();
    if (dragOverColumn !== statusKey) {
      setDragOverColumn(statusKey);
    }
  };

  const handleDragLeave = (e: React.DragEvent, statusKey: TaskStatus) => {
    e.preventDefault();
    if (dragOverColumn === statusKey) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);

    if (!taskId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.status !== targetStatus) {
      onUpdateTaskStatus(taskId, targetStatus);
    }
  };

  const todayIso = getIsoToday();

  return (
    <section className="view active">
      <div className="board-head">
        <div>
          <div className="flex items-center gap-2">
            <i
              className="dot w-4 h-4 inline-block"
              style={{ backgroundColor: area.color || '#2f80ed' }}
            />
            <h1 id="boardTitle">{area.name}</h1>
          </div>
          <div className="sub" id="boardSub">
            {area.desc || 'Rozwój i organizacja zadań'}
          </div>
        </div>

        <div className="board-actions">
          <button
            className="secondary text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900 flex items-center gap-1.5"
            onClick={() => onConfirmDeleteArea(area)}
            title="Usuń ten obszar"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Usuń obszar</span>
          </button>
          <button className="secondary flex items-center gap-1.5" onClick={onOpenVoiceModal}>
            <Mic className="w-4 h-4 text-[var(--blue)]" />
            <span>Głos</span>
          </button>
          <button className="primary flex items-center gap-1.5" onClick={onOpenNewTaskModal}>
            <Plus className="w-4 h-4" />
            <span>Nowe zadanie</span>
          </button>
        </div>
      </div>

      <div className="board" id="board">
        {COLUMNS.map((col) => {
          const columnTasks = areaTasks
            .filter((t) => t.status === col.key)
            .sort((a, b) => (a.position || 0) - (b.position || 0));

          const isOver = dragOverColumn === col.key;

          return (
            <div
              key={col.key}
              className={`column ${col.cl} ${isOver ? 'drag-over' : ''}`}
              data-status={col.key}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={(e) => handleDragLeave(e, col.key)}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              <div className="column-head">
                <span>{col.label}</span>
                <span className="num">{columnTasks.length}</span>
              </div>

              <div className="cards min-h-[440px]" data-drop={col.key}>
                {columnTasks.length === 0 ? (
                  <div className="h-28 flex items-center justify-center border-2 border-dashed border-[var(--line)] rounded-lg text-xs text-[var(--muted)]">
                    Upuść tutaj zadanie
                  </div>
                ) : (
                  columnTasks.map((t) => {
                    const overdue = isOverdue(t.date, t.time, t.status);

                    return (
                      <div
                        key={t.id}
                        className={`card ${
                          t.status === 'done' ? 'opacity-75' : ''
                        }`}
                        draggable
                        data-id={t.id}
                        onDragStart={(e) => handleDragStart(e, t.id)}
                        onClick={() => onEditTask(t)}
                      >
                        <div className="card-title flex flex-col gap-1">
                          <span className={t.status === 'done' ? 'line-through' : ''}>
                            {t.title}
                          </span>

                          {overdue && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded w-max">
                              <AlertCircle className="w-3 h-3" /> Zaległe
                            </span>
                          )}
                        </div>

                        {t.description && (
                          <p className="text-xs text-[var(--muted)] line-clamp-2 mt-1 mb-2">
                            {t.description}
                          </p>
                        )}

                        <div className="card-bottom">
                          <span className="date flex items-center gap-1">
                            {t.date && (
                              <>
                                <Calendar className="w-3 h-3 inline text-[var(--muted)]" />
                                {t.date === todayIso ? 'Dzisiaj' : formatPolishDate(t.date)}
                              </>
                            )}
                            {t.time && (
                              <span className="ml-1 text-[var(--muted)] flex items-center gap-0.5">
                                <Clock className="w-3 h-3 inline" />
                                {t.time}
                              </span>
                            )}
                          </span>

                          <span className="area-chip">
                            {t.priority === 'Pilny' && '🔴 '}
                            {t.priority === 'Wysoki' && '🟠 '}
                            {t.priority}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
