'use client';

import React, { useState, useEffect } from 'react';
import { Area } from '../lib/types';
import { AREA_COLOR_PALETTE } from '../lib/utils';
import { X } from 'lucide-react';

interface AreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (areaData: Omit<Area, 'id'>, existingId?: string) => void;
  areaToEdit?: Area | null;
}

export const AreaModal: React.FC<AreaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  areaToEdit,
}) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState('#2f80ed');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (areaToEdit) {
      setName(areaToEdit.name || '');
      setDesc(areaToEdit.desc || '');
      setColor(areaToEdit.color || '#2f80ed');
    } else {
      setName('');
      setDesc('');
      setColor(AREA_COLOR_PALETTE[Math.floor(Math.random() * AREA_COLOR_PALETTE.length)]);
    }
    setErrorMsg('');
  }, [areaToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Podaj nazwę obszaru');
      return;
    }

    onSave(
      {
        name: name.trim(),
        desc: desc.trim(),
        color,
      },
      areaToEdit?.id
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

        <h2>{areaToEdit ? 'Edytuj obszar' : 'Nowy obszar'}</h2>

        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 text-xs p-2.5 rounded-lg mb-3">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nazwa obszaru *</label>
            <input
              id="areaName"
              type="text"
              placeholder="Np. Klienci, Finanse, Projekt X"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field">
            <label>Opis obszaru (opcjonalny)</label>
            <input
              id="areaDesc"
              type="text"
              placeholder="Krótki opis przestrzeni roboczej..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Kolor wyróżniający</label>
            <div className="flex items-center gap-2 mt-1">
              {AREA_COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-[var(--blue)]' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions mt-6">
            <button
              type="button"
              className="secondary"
              id="cancelArea"
              onClick={onClose}
            >
              Anuluj
            </button>
            <button type="submit" className="primary" id="saveArea">
              {areaToEdit ? 'Zapisz zmiany' : 'Utwórz obszar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
