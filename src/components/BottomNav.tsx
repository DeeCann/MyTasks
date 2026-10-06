'use client';

import React from 'react';
import { ActiveView } from '../lib/types';
import { Calendar, ListTodo, Layers, Plus, Mic } from 'lucide-react';

interface BottomNavProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onOpenNewTaskModal: () => void;
  onOpenVoiceModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeView,
  setActiveView,
  onOpenNewTaskModal,
  onOpenVoiceModal,
}) => {
  return (
    <div className="mobile-only bottomnav">
      <button
        className={`flex flex-col items-center justify-center py-1 ${
          activeView === 'today' ? 'active font-semibold text-[var(--blue)]' : ''
        }`}
        onClick={() => setActiveView('today')}
      >
        <Calendar className="w-5 h-5 mb-0.5" />
        <span>Dzisiaj</span>
      </button>

      <button
        className={`flex flex-col items-center justify-center py-1 ${
          activeView === 'all' ? 'active font-semibold text-[var(--blue)]' : ''
        }`}
        onClick={() => setActiveView('all')}
      >
        <ListTodo className="w-5 h-5 mb-0.5" />
        <span>Zadania</span>
      </button>

      <button
        className={`flex flex-col items-center justify-center py-1 ${
          activeView === 'areas' ? 'active font-semibold text-[var(--blue)]' : ''
        }`}
        onClick={() => setActiveView('areas')}
      >
        <Layers className="w-5 h-5 mb-0.5" />
        <span>Obszary</span>
      </button>

      <button
        className="flex flex-col items-center justify-center py-1 text-emerald-600 font-semibold"
        onClick={onOpenVoiceModal}
      >
        <Mic className="w-5 h-5 mb-0.5" />
        <span>Mów</span>
      </button>

      <button
        className="flex flex-col items-center justify-center py-1 text-[var(--blue)] font-semibold"
        onClick={onOpenNewTaskModal}
      >
        <Plus className="w-5 h-5 mb-0.5" />
        <span>Dodaj</span>
      </button>
    </div>
  );
};
