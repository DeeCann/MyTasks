'use client';

import React from 'react';
import { Area, Task, ActiveView } from '../lib/types';
import {
  CheckSquare,
  Calendar,
  Layers,
  FolderPlus,
  Moon,
  Sun,
  ListTodo,
  Trash2,
} from 'lucide-react';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  areas: Area[];
  tasks: Task[];
  currentAreaId: string;
  onSelectArea: (areaId: string) => void;
  onOpenNewAreaModal: () => void;
  onConfirmDeleteArea: (area: Area) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  areas,
  tasks,
  onSelectArea,
  onOpenNewAreaModal,
  onConfirmDeleteArea,
  darkMode,
  setDarkMode,
}) => {
  const getUncompletedCount = (areaId: string) => {
    return tasks.filter((t) => t.area === areaId && t.status !== 'done')
      .length;
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brandmark">
          <CheckSquare className="w-5 h-5" />
        </div>
        <span>MyTasks</span>
      </div>

      <nav className="nav">
        <button
          className={activeView === 'today' ? 'active' : ''}
          onClick={() => setActiveView('today')}
        >
          <Calendar className="w-4 h-4" />
          <span>Dzisiaj</span>
        </button>

        <button
          className={activeView === 'all' ? 'active' : ''}
          onClick={() => setActiveView('all')}
        >
          <ListTodo className="w-4 h-4" />
          <span>Wszystkie zadania</span>
        </button>

        <button
          className={activeView === 'areas' ? 'active' : ''}
          onClick={() => setActiveView('areas')}
        >
          <Layers className="w-4 h-4" />
          <span>Obszary</span>
        </button>
      </nav>

      <div className="section-label">OBSZARY</div>

      <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
        {areas.map((a) => {
          const uncompleted = getUncompletedCount(a.id);
          return (
            <div
              key={a.id}
              className="group flex items-center justify-between rounded-lg hover:bg-[var(--panel2)] transition-colors pr-1"
            >
              <button
                className="area-link flex-1 text-left border-0 bg-transparent py-2.5 px-3"
                onClick={() => onSelectArea(a.id)}
              >
                <span className="area-left">
                  <i
                    className="dot"
                    style={{ backgroundColor: a.color || '#2f80ed' }}
                  />
                  <span className="font-medium text-sm text-[var(--text)] truncate max-w-[110px]">
                    {a.name}
                  </span>
                </span>
                <span className="count">{uncompleted}</span>
              </button>

              <button
                className="opacity-0 group-hover:opacity-100 p-1.5 text-[var(--muted)] hover:text-red-500 rounded transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirmDeleteArea(a);
                }}
                title={`Usuń obszar ${a.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <button className="add-area" onClick={onOpenNewAreaModal}>
        <FolderPlus className="w-4 h-4 inline mr-1" />
        <span>＋ Nowy obszar</span>
      </button>

      <div className="mt-auto pt-4 border-t border-[var(--line)]">
        <button
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel2)] rounded-lg transition-colors"
          onClick={() => setDarkMode(!darkMode)}
        >
          <span className="flex items-center gap-2">
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
            <span>{darkMode ? 'Tryb jasny' : 'Tryb ciemny'}</span>
          </span>
        </button>
      </div>
    </aside>
  );
};
