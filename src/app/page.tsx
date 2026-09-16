'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthScreen } from '@/components/AuthScreen';
import { Navbar } from '@/components/Navbar';
import { Sidebar, TabType } from '@/components/Sidebar';
import { ProjectDashboard } from '@/components/ProjectDashboard';
import { KanbanBoard } from '@/components/KanbanBoard';
import { TaskListView } from '@/components/TaskListView';
import { ActivityLogView } from '@/components/ActivityLogView';
import { TaskModal, Task } from '@/components/TaskModal';
import { AiAssistantDrawer } from '@/components/AiAssistantDrawer';
import { FolderPlus, Plus, UserPlus, Loader2 } from 'lucide-react';
import { ProjectModal } from '@/components/ProjectModal';
import { AddMemberModal } from '@/components/AddMemberModal';

export default function Home() {
  const { user, loading, activeProject, fetchProjects } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectData, setProjectData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveProjectData = async () => {
    if (!activeProject) return;
    setRefreshing(true);
    try {
      const res = await fetch(`/api/projects/${activeProject.id}`);
      if (res.ok) {
        const data = await res.json();
        setProjectData(data.project);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeProject) {
      fetchActiveProjectData();
    }
  }, [activeProject]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] text-white">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-sm font-semibold text-slate-300">Loading TaskFlow AI...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const tasks = projectData?.tasks || [];

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    // Optimistic UI update
    setProjectData((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map((t: any) => (t.id === taskId ? { ...t, status: newStatus } : t)),
      };
    });

    try {
      await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchActiveProjectData();
    } catch (e) {
      console.error(e);
      fetchActiveProjectData();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      fetchActiveProjectData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNewTask = (initialStatus?: string) => {
    setSelectedTask(initialStatus ? ({ status: initialStatus as any } as any) : null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19]">
      {/* Top Header */}
      <Navbar onToggleAi={() => setIsAiOpen(!isAiOpen)} isAiOpen={isAiOpen} />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          taskCount={tasks.length}
          memberCount={projectData?.members?.length}
        />

        {/* Content Container */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {!activeProject ? (
            <div className="text-center py-20 glass-panel rounded-3xl p-8 space-y-4 max-w-md mx-auto my-12">
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 w-fit mx-auto">
                <FolderPlus className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">No Active Project Selected</h2>
              <p className="text-xs text-slate-400">
                Create your first project to start managing tasks and getting AI insights.
              </p>
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
              >
                Create First Project
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Project Title Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    {activeProject.name}
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    {activeProject.description || 'No project description provided'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAddMemberModalOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700/60"
                  >
                    <UserPlus className="w-4 h-4 text-blue-400" />
                    Add Member
                  </button>
                  <button
                    onClick={() => handleAddNewTask()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-blue-600/25"
                  >
                    <Plus className="w-4 h-4" />
                    New Task
                  </button>
                </div>
              </div>

              {/* View Switcher Tabs (Mobile view fallback) */}
              <div className="flex md:hidden gap-2 overflow-x-auto pb-2 border-b border-slate-800">
                {(['dashboard', 'kanban', 'list', 'activity'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize shrink-0 ${
                      activeTab === tab ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Views */}
              {activeTab === 'dashboard' && (
                <ProjectDashboard
                  project={projectData || activeProject}
                  onOpenTaskModal={() => handleAddNewTask()}
                  onSelectTab={setActiveTab}
                />
              )}

              {activeTab === 'kanban' && (
                <KanbanBoard
                  tasks={tasks}
                  onTaskStatusChange={handleTaskStatusChange}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onAddNewTask={handleAddNewTask}
                />
              )}

              {activeTab === 'list' && (
                <TaskListView
                  tasks={tasks}
                  onAddNewTask={() => handleAddNewTask()}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
              )}

              {activeTab === 'activity' && (
                <ActivityLogView projectId={activeProject.id} />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals & AI Drawer */}
      {isTaskModalOpen && activeProject && (
        <TaskModal
          task={selectedTask}
          projectId={activeProject.id}
          projectMembers={projectData?.members || activeProject.members}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          onSaved={fetchActiveProjectData}
        />
      )}

      {isProjectModalOpen && (
        <ProjectModal onClose={() => setIsProjectModalOpen(false)} />
      )}

      {isAddMemberModalOpen && activeProject && (
        <AddMemberModal
          projectId={activeProject.id}
          currentMembers={projectData?.members || activeProject.members}
          onClose={() => setIsAddMemberModalOpen(false)}
          onMemberAdded={fetchActiveProjectData}
        />
      )}

      {activeProject && (
        <AiAssistantDrawer
          project={projectData || activeProject}
          isOpen={isAiOpen}
          onClose={() => setIsAiOpen(false)}
          onTaskAdded={fetchActiveProjectData}
        />
      )}
    </div>
  );
}
