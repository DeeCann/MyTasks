'use client';

import React from 'react';
import { Area, Task } from '../lib/types';
import { FolderPlus, Kanban, Edit3, Trash2 } from 'lucide-react';

interface AreasViewProps {
  areas: Area[];
  tasks: Task[];
  onOpenNewAreaModal: () => void;
  onEditArea: (area: Area) => void;
  onConfirmDeleteArea: (area: Area) => void;
  onSelectArea: (areaId: string) => void;
}

export const AreasView: React.FC<AreasViewProps> = ({
  areas,
  tasks,
  onOpenNewAreaModal,
  onEditArea,
  onConfirmDeleteArea,
  onSelectArea,
}) => {
  return (
    <section className="view active">
      <div className="page-title">
        <div>
          <h1>Obszary</h1>
          <div className="sub">Twoje tablice projektowe i przestrzenie robocze</div>
        </div>
        <button
          className="primary flex items-center gap-1.5"
          onClick={onOpenNewAreaModal}
        >
          <FolderPlus className="w-4 h-4" />
          <span>Nowy obszar</span>
        </button>
      </div>

      <div className="areas-grid">
        {areas.map((a) => {
          const areaTasks = tasks.filter((t) => t.area === a.id);
          const uncompleted = areaTasks.filter((t) => t.status !== 'done').length;

          return (
            <div
              key={a.id}
              className="panel p-5 flex flex-col justify-between hover:border-[var(--blue)] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <i
                      className="dot w-3.5 h-3.5"
                      style={{ backgroundColor: a.color || '#2f80ed' }}
                    />
                    <h3 className="text-base font-bold text-[var(--text)] m-0">
                      {a.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      className="p-1.5 text-[var(--muted)] hover:text-[var(--blue)] rounded hover:bg-[var(--panel2)] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditArea(a);
                      }}
                      title="Edytuj obszar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 text-[var(--muted)] hover:text-red-500 rounded hover:bg-[var(--panel2)] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfirmDeleteArea(a);
                      }}
                      title="Usuń obszar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[var(--muted)] line-clamp-2 my-2">
                  {a.desc || 'Brak opisu obszaru'}
                </p>

                <div className="text-xs font-semibold text-[var(--muted)] mt-4">
                  {uncompleted} do zrobienia · {areaTasks.length} łącznie
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[var(--line)] flex justify-end">
                <button
                  className="secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
                  onClick={() => onSelectArea(a.id)}
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span>Otwórz tablicę</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
