'use client';

import React, { useState } from 'react';
import { Area, Task } from '../lib/types';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  areaToDelete: Area | null;
  areas: Area[];
  tasks: Task[];
  onConfirmDelete: (
    areaId: string,
    action: 'reassign' | 'deleteAll',
    targetAreaId?: string
  ) => void;
}

export const DeleteAreaModal: React.FC<DeleteAreaModalProps> = ({
  isOpen,
  onClose,
  areaToDelete,
  areas,
  tasks,
  onConfirmDelete,
}) => {
  const [action, setAction] = useState<'reassign' | 'deleteAll'>('reassign');
  const [targetAreaId, setTargetAreaId] = useState<string>('');

  if (!isOpen || !areaToDelete) return null;

  const affectedTasks = tasks.filter((t) => t.area === areaToDelete.id);
  const otherAreas = areas.filter((a) => a.id !== areaToDelete.id);

  const handleExecute = () => {
    onConfirmDelete(
      areaToDelete.id,
      affectedTasks.length === 0 ? 'deleteAll' : action,
      targetAreaId || otherAreas[0]?.id
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

        <div className="flex items-center gap-2 text-amber-600 mb-2">
          <AlertTriangle className="w-6 h-6" />
          <h2 className="m-0 text-lg font-bold">Usuwanie obszaru &quot;{areaToDelete.name}&quot;</h2>
        </div>

        {affectedTasks.length > 0 ? (
          <div className="space-y-4 my-3 text-sm">
            <p className="text-[var(--muted)]">
              Ten obszar zawiera <strong className="text-[var(--text)]">{affectedTasks.length}</strong> {affectedTasks.length === 1 ? 'zadanie' : 'zadań'}. Co chcesz z nimi zrobić?
            </p>

            <div className="space-y-2">
              {otherAreas.length > 0 && (
                <label className="flex items-start gap-2.5 p-3 border border-[var(--line)] rounded-lg cursor-pointer hover:bg-[var(--panel2)]">
                  <input
                    type="radio"
                    name="deleteAction"
                    checked={action === 'reassign'}
                    onChange={() => setAction('reassign')}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-semibold">Przenieś zadania do innego obszaru</div>
                    <div className="text-xs text-[var(--muted)] mt-1">
                      Zadania zostaną zachowane i przypisane do wybranego obszaru.
                    </div>
                    {action === 'reassign' && (
                      <select
                        className="mt-2 text-xs w-full"
                        value={targetAreaId || otherAreas[0]?.id}
                        onChange={(e) => setTargetAreaId(e.target.value)}
                      >
                        {otherAreas.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </label>
              )}

              <label className="flex items-start gap-2.5 p-3 border border-[var(--line)] rounded-lg cursor-pointer hover:bg-[var(--panel2)]">
                <input
                  type="radio"
                  name="deleteAction"
                  checked={action === 'deleteAll'}
                  onChange={() => setAction('deleteAll')}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold text-red-600">Usuń obszar i wszystkie jego zadania</div>
                  <div className="text-xs text-[var(--muted)] mt-1">
                    Trwale usunie ten obszar wraz ze wszystkimi {affectedTasks.length} zadaniami.
                  </div>
                </div>
              </label>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)] my-4">
            Ten obszar nie zawiera obecnie żadnych zadań. Czy na pewno chcesz go usunąć?
          </p>
        )}

        <div className="modal-actions mt-6">
          <button className="secondary" onClick={onClose}>
            Anuluj
          </button>
          <button
            className="primary bg-red-600 hover:bg-red-700 text-white"
            onClick={handleExecute}
          >
            Potwierdź usunięcie
          </button>
        </div>
      </div>
    </div>
  );
};
