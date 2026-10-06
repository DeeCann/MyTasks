'use client';

import React, { useState, useEffect } from 'react';
import { Area, ParsedVoiceTask, TaskPriority, TaskStatus } from '../lib/types';
import { VoiceSpeechRecognizer } from '../lib/speechRecognition';
import { parseVoiceTranscript } from '../lib/nlpParser';
import { Mic, MicOff, Check, X, Sparkles } from 'lucide-react';

interface VoiceOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmTask: (parsedTask: ParsedVoiceTask) => void;
  areas: Area[];
  currentAreaId: string;
}

export const VoiceOverlayModal: React.FC<VoiceOverlayModalProps> = ({
  isOpen,
  onClose,
  onConfirmTask,
  areas,
  currentAreaId,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Editable fields after parsing
  const [title, setTitle] = useState('');
  const [areaId, setAreaId] = useState(currentAreaId);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Normalny');

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript('');
      setErrorMessage('');
      return;
    }

    // Auto start speech recognition when opened
    const recognizer = new VoiceSpeechRecognizer();
    if (!recognizer.isSupported()) {
      setErrorMessage(
        'Twoja przeglądarka nie obsługuje Web Speech API. Wpisz zadanie ręcznie lub użyj wpisywania głosowego w systemie.'
      );
      // Demo fallback transcript if web speech not supported
      const demoTranscript =
        'Dodaj do MedAI: poprawić segmentację naczyń na jutro o 09:00, wysoki priorytet';
      setTranscript(demoTranscript);
      const parsedRes = parseVoiceTranscript(demoTranscript, areas, currentAreaId);
      setTitle(parsedRes.title);
      setAreaId(parsedRes.area);
      setDate(parsedRes.date);
      setTime(parsedRes.time);
      setPriority(parsedRes.priority);
      return;
    }

    setIsListening(true);
    setErrorMessage('');
    setTranscript('Słucham... Mów teraz...');

    recognizer.start({
      onResult: (text) => {
        setTranscript(text);
        const parsedRes = parseVoiceTranscript(text, areas, currentAreaId);
        setTitle(parsedRes.title);
        setAreaId(parsedRes.area);
        setDate(parsedRes.date);
        setTime(parsedRes.time);
        setPriority(parsedRes.priority);
      },
      onError: (err) => {
        setIsListening(false);
        setErrorMessage(`Błąd: ${err}`);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    return () => {
      recognizer.stop();
    };
  }, [isOpen, currentAreaId, areas]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onConfirmTask({
      rawTranscript: transcript,
      title: title.trim(),
      area: areaId,
      status: 'added' as TaskStatus,
      date,
      time,
      priority,
    });
    onClose();
  };

  return (
    <div className="modal-back open">
      <div className="modal relative animate-in fade-in zoom-in-95 duration-200 max-w-lg">
        <button
          className="absolute right-4 top-4 text-[var(--muted)] hover:text-[var(--text)] p-1 rounded-lg"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div
            className={`mic mx-auto flex items-center justify-center ${
              isListening ? 'animate-pulse bg-blue-100 text-[var(--blue)]' : ''
            }`}
          >
            {isListening ? (
              <Mic className="w-8 h-8 text-[var(--blue)] animate-bounce" />
            ) : (
              <MicOff className="w-8 h-8 text-[var(--muted)]" />
            )}
          </div>

          <h3 className="text-lg font-bold text-[var(--text)] mt-2">
            {isListening ? 'Mów teraz...' : 'Wypowiedź zarejestrowana'}
          </h3>

          <p className="text-xs text-[var(--muted)] mt-1 px-4 italic">
            &quot;{transcript || 'Brak tekstu...'}&quot;
          </p>

          {isListening && <div className="pulse"></div>}

          {errorMessage && (
            <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 p-2 rounded mt-2">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Parsed Output Edit Form */}
        <div className="border-t border-[var(--line)] pt-4 mt-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--blue)] mb-3">
            <Sparkles className="w-4 h-4" />
            <span>Rozpoznane parametry zadania (sprawdź przed zapisem):</span>
          </div>

          <div className="field">
            <label>Tytuł zadania</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tytuł zadania..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="field">
              <label>Obszar</label>
              <select
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
              <label>Priorytet</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="Normalny">Normalny</option>
                <option value="Wysoki">Wysoki</option>
                <option value="Pilny">Pilny 🔴</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="field">
              <label>Termin</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Godzina</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="modal-actions mt-5">
          <button className="secondary" onClick={onClose}>
            Anuluj
          </button>
          <button
            className="primary flex items-center gap-1.5"
            onClick={handleSave}
            disabled={!title.trim()}
          >
            <Check className="w-4 h-4" />
            <span>Zapisz zadanie</span>
          </button>
        </div>
      </div>
    </div>
  );
};
