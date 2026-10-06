'use client';

import React, { useState, useEffect } from 'react';
import { Area, Task, TaskPriority, TaskStatus } from '../lib/types';
import { getIsoToday } from '../lib/utils';
import { X, Trash2 } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id'>, existingId?: string) => void;
  onDelete?: (taskId: string) => void;
  taskToEdit?: Task | null;
  areas: Area[];
  currentAreaId: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  taskToEdit,
  areas,
  currentAreaId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [areaId, setAreaId] = useState(currentAreaId);
  const [status, setStatus] = useState<TaskStatus>('added');
  const [date, setDate] = useState(getIsoToday());
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Normalny');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setAreaId(taskToEdit.area || currentAreaId);
      setStatus(taskToEdit.status || 'added');
      setDate(taskToEdit.date || getIsoToday());
      setTime(taskToEdit.time || '');
      setPriority(taskToEdit.priority || 'Normalny');
    } else {
      setTitle('');
      setDescription('');
      setAreaId(currentAreaId);
      setStatus('added');
      setDate(getIsoToday());
      setTime('');
      setPriority('Normalny');
    }
    setErrorMsg('');
  }, [taskToEdit, currentAreaId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Podaj nazwę zadania');
      return;
    }

    onSave(
      {
        title: title.trim(),
        description: description.trim(),
        area: areaId,
        status,
        date,
        time,
        priority,
      },
      taskToEdit?.id
    );
    onClose();
  };

  return (
    <div className="modal-back open">
      <div className="modal relative animate-in fade-in zoom-in-95 duration-200">
        <button
          className="absolute right-4 top-4 text-[var(--muted)] hover:text-[var(--text)] p-1 rounded-lg"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 id="modalTitle">{taskToEdit ? 'Edytuj zadanie' : 'Nowe zadanie'}</h2>

        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 text-xs p-2.5 rounded-lg mb-3">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nazwa zadania *</label>
            <input
              id="taskTitle"
              type="text"
              placeholder="Np. Przygotować raport z analizy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field">
            <label>Opis zadania (opcjonalny)</label>
            <textarea
              id="taskDesc"
              placeholder="Szczegóły, notatki lub wymagania..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="field">
              <label>Obszar</label>
              <select
                id="taskArea"
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Status</label>
              <select
                id="taskStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <option value="added">Dodane</option>
                <option value="doing">W toku</option>
                <option value="blocked">Zablokowane</option>
                <option value="done">Gotowe</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="field">
              <label>Termin</label>
              <input
                id="taskDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Godzina</label>
              <input
                id="taskTime"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Priorytet</label>
              <select
                id="taskPriority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="Normalny">Normalny</option>
                <option value="Wysoki">Wysoki</option>
                <option value="Pilny">Pilny 🔴</option>
              </select>
            </div>
          </div>

          <div className="modal-actions justify-between items-center mt-6">
            <div>
              {taskToEdit && onDelete && (
                <button
                  type="button"
                  className="text-red-500 hover:text-red-600 text-xs font-semibold flex items-center gap-1 px-2 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  onClick={() => {
                    if (confirm('Czy na pewno chcesz usunąć to zadanie?')) {
                      onDelete(taskToEdit.id);
                      onClose();
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Usuń zadanie</span>
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="secondary"
                id="cancelModal"
                onClick={onClose}
              >
                Anuluj
              </button>
              <button type="submit" className="primary" id="saveTask">
                Zapisz zadanie
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
