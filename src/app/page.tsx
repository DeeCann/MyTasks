'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Area, Task, TaskStatus, ActiveView, ParsedVoiceTask } from '../lib/types';
import { supabase } from '../lib/supabaseClient';
import { STATUS_LABELS, generateId } from '../lib/utils';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { BottomNav } from '../components/BottomNav';
import { TodayView } from '../components/TodayView';
import { AllTasksView } from '../components/AllTasksView';
import { AreasView } from '../components/AreasView';
import { BoardView } from '../components/BoardView';
import { TaskModal } from '../components/TaskModal';
import { AreaModal } from '../components/AreaModal';
import { VoiceOverlayModal } from '../components/VoiceOverlayModal';
import { DeleteAreaModal } from '../components/DeleteAreaModal';
import { Toast } from '../components/Toast';

export default function Home() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('today');
  const [currentAreaId, setCurrentAreaId] = useState<string>('medai');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  // Modals State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [isAreaModalOpen, setIsAreaModalOpen] = useState<boolean>(false);
  const [areaToEdit, setAreaToEdit] = useState<Area | null>(null);

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);

  const [isDeleteAreaModalOpen, setIsDeleteAreaModalOpen] = useState<boolean>(false);
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 2500);
  }, []);

  // Fetch all data directly from Supabase database
  const fetchInitialData = useCallback(async () => {
    try {
      const { data: remoteAreas, error: aErr } = await supabase
        .from('areas')
        .select('*')
        .order('position');
      const { data: remoteTasks, error: tErr } = await supabase
        .from('tasks')
        .select('*')
        .order('position');

      if (aErr) console.error('Supabase areas select error:', aErr);
      if (tErr) console.error('Supabase tasks select error:', tErr);

      if (remoteAreas) {
        setAreas(remoteAreas);
      }

      if (remoteTasks) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = remoteTasks.map((t: any) => ({
          id: String(t.id),
          title: t.title,
          description: t.description || '',
          area: t.area_id || t.area || '',
          status: t.status,
          date: t.date || '',
          time: t.time || '',
          priority: t.priority,
          position: t.position || 0,
          created_at: t.created_at,
          updated_at: t.updated_at,
        }));
        setTasks(mapped);
      }
    } catch (e) {
      console.error('Supabase fetch error:', e);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();

    // Supabase Realtime live sync across devices/tabs
    const channel = supabase
      .channel('db-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => fetchInitialData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'areas' },
        () => fetchInitialData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchInitialData]);

  // Dark Mode Toggle Class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // View Navigation Helpers
  const handleSelectArea = (areaId: string) => {
    setCurrentAreaId(areaId);
    setActiveView('board');
  };

  // Task Operations (Direct Supabase)
  const handleSaveTask = async (
    taskData: Omit<Task, 'id'>,
    existingId?: string
  ) => {
    const taskId = existingId || generateId();
    const newTask: Task = {
      id: taskId,
      ...taskData,
      position: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === existingId ? newTask : t))
      );
    } else {
      setTasks((prev) => [newTask, ...prev]);
    }

    const dbPayload = {
      id: taskId,
      title: taskData.title,
      description: taskData.description || '',
      area_id: taskData.area,
      status: taskData.status,
      date: taskData.date || null,
      time: taskData.time || null,
      priority: taskData.priority,
      position: Date.now(),
      updated_at: new Date().toISOString(),
    };

    if (existingId) {
      const { error } = await supabase.from('tasks').update(dbPayload).eq('id', existingId);
      if (error) console.error('Supabase task update error:', error);
    } else {
      const { error } = await supabase.from('tasks').insert([dbPayload]);
      if (error) console.error('Supabase task insert error:', error);
    }

    showToast(existingId ? 'Zadanie zapisane' : 'Dodano zadanie');
    fetchInitialData();
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) console.error('Supabase task delete error:', error);
    showToast('Zadanie usunięte');
    fetchInitialData();
  };

  const handleUpdateTaskStatus = async (
    taskId: string,
    newStatus: TaskStatus
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus, updated_at: new Date().toISOString() }
          : t
      )
    );

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', taskId);

    if (error) console.error('Supabase task status update error:', error);
    showToast(`Status zmieniony na: ${STATUS_LABELS[newStatus]}`);
  };

  // Area Operations (Direct Supabase)
  const handleSaveArea = async (
    areaData: Omit<Area, 'id'>,
    existingId?: string
  ) => {
    const areaId =
      existingId ||
      areaData.name
        .toLowerCase()
        .replace(/[^a-z0-9ąćęłńóśźż]+/g, '-') +
      '-' +
      Date.now().toString().slice(-4);

    const dbPayload = {
      id: areaId,
      name: areaData.name,
      desc: areaData.desc || '',
      color: areaData.color || '#2f80ed',
      position: Date.now(),
      created_at: new Date().toISOString(),
    };

    if (existingId) {
      setAreas((prev) =>
        prev.map((a) => (a.id === existingId ? { ...a, ...areaData } : a))
      );
      const { error } = await supabase.from('areas').update(dbPayload).eq('id', existingId);
      if (error) console.error('Supabase area update error:', error);
    } else {
      setAreas((prev) => [...prev, { id: areaId, ...areaData }]);
      const { error } = await supabase.from('areas').insert([dbPayload]);
      if (error) console.error('Supabase area insert error:', error);
    }

    showToast(existingId ? 'Obszar zaktualizowany' : 'Utworzono obszar');
    if (!existingId) {
      setCurrentAreaId(areaId);
      setActiveView('board');
    }
    fetchInitialData();
  };

  const handleConfirmDeleteArea = async (
    areaId: string,
    action: 'reassign' | 'deleteAll',
    targetAreaId?: string
  ) => {
    if (action === 'reassign' && targetAreaId) {
      setTasks((prev) =>
        prev.map((t) => (t.area === areaId ? { ...t, area: targetAreaId } : t))
      );
      await supabase
        .from('tasks')
        .update({ area_id: targetAreaId })
        .eq('area_id', areaId);
    } else if (action === 'deleteAll') {
      setTasks((prev) => prev.filter((t) => t.area !== areaId));
      await supabase.from('tasks').delete().eq('area_id', areaId);
    }

    setAreas((prev) => prev.filter((a) => a.id !== areaId));
    await supabase.from('areas').delete().eq('id', areaId);

    showToast('Obszar został usunięty');

    if (currentAreaId === areaId) {
      const remaining = areas.filter((a) => a.id !== areaId);
      if (remaining.length > 0) {
        setCurrentAreaId(remaining[0].id);
      } else {
        setActiveView('today');
      }
    }
    fetchInitialData();
  };

  // Voice Task Confirmation
  const handleVoiceConfirmTask = (parsed: ParsedVoiceTask) => {
    handleSaveTask({
      title: parsed.title,
      area: parsed.area,
      status: parsed.status,
      date: parsed.date,
      time: parsed.time,
      priority: parsed.priority,
    });
    showToast('Rozpoznano i dodano zadanie głosowo!');
  };

  // Find active Area object for Board View
  const currentArea =
    areas.find((a) => a.id === currentAreaId) ||
    areas[0] || {
      id: 'medai',
      name: 'MedAI',
      desc: 'Rozwój produktu i projekty AI',
      color: '#2f80ed',
    };

  return (
    <div className="app">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        areas={areas}
        tasks={tasks}
        currentAreaId={currentAreaId}
        onSelectArea={handleSelectArea}
        onOpenNewAreaModal={() => {
          setAreaToEdit(null);
          setIsAreaModalOpen(true);
        }}
        onConfirmDeleteArea={(area) => {
          setAreaToDelete(area);
          setIsDeleteAreaModalOpen(true);
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className="main">
        <Topbar
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            if (q.trim() && activeView !== 'all') {
              setActiveView('all');
            }
          }}
        />

        {activeView === 'today' && (
          <TodayView
            tasks={tasks}
            areas={areas}
            onEditTask={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
            onSelectArea={handleSelectArea}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          />
        )}

        {activeView === 'all' && (
          <AllTasksView
            tasks={tasks}
            areas={areas}
            searchQuery={searchQuery}
            onEditTask={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
          />
        )}

        {activeView === 'areas' && (
          <AreasView
            areas={areas}
            tasks={tasks}
            onOpenNewAreaModal={() => {
              setAreaToEdit(null);
              setIsAreaModalOpen(true);
            }}
            onEditArea={(area) => {
              setAreaToEdit(area);
              setIsAreaModalOpen(true);
            }}
            onConfirmDeleteArea={(area) => {
              setAreaToDelete(area);
              setIsDeleteAreaModalOpen(true);
            }}
            onSelectArea={handleSelectArea}
          />
        )}

        {activeView === 'board' && (
          <BoardView
            area={currentArea}
            tasks={tasks}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onEditTask={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
            onOpenNewTaskModal={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onConfirmDeleteArea={(area) => {
              setAreaToDelete(area);
              setIsDeleteAreaModalOpen(true);
            }}
          />
        )}
      </main>

      <BottomNav
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenNewTaskModal={() => {
          setTaskToEdit(null);
          setIsTaskModalOpen(true);
        }}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
      />

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        taskToEdit={taskToEdit}
        areas={areas}
        currentAreaId={currentAreaId}
      />

      <AreaModal
        isOpen={isAreaModalOpen}
        onClose={() => {
          setIsAreaModalOpen(false);
          setAreaToEdit(null);
        }}
        onSave={handleSaveArea}
        areaToEdit={areaToEdit}
      />

      <VoiceOverlayModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onConfirmTask={handleVoiceConfirmTask}
        areas={areas}
        currentAreaId={currentAreaId}
      />

      <DeleteAreaModal
        isOpen={isDeleteAreaModalOpen}
        onClose={() => {
          setIsDeleteAreaModalOpen(false);
          setAreaToDelete(null);
        }}
        areaToDelete={areaToDelete}
        areas={areas}
        tasks={tasks}
        onConfirmDelete={handleConfirmDeleteArea}
      />

      <Toast message={toastMessage} isVisible={toastVisible} />
    </div>
  );
}
