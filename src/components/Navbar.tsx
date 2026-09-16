'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bot, Plus, FolderKanban, LogOut, User, Sparkles, ChevronDown } from 'lucide-react';
import { ProjectModal } from './ProjectModal';

interface NavbarProps {
  onToggleAi: () => void;
  isAiOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleAi, isAiOpen }) => {
  const { user, projects, activeProject, setActiveProject, logout } = useAuth();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
        {/* Brand & Project Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-xl text-white tracking-tight">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/20">
              <FolderKanban className="w-5 h-5" />
            </div>
            <span>TaskFlow <span className="text-blue-400">AI</span></span>
          </div>

          <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Project Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-sm font-medium text-slate-200 transition-colors"
            >
              <span className="max-w-[140px] md:max-w-[200px] truncate">
                {activeProject ? activeProject.name : 'Select Project'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50">
                <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Your Projects
                </div>
                <div className="max-h-56 overflow-y-auto my-1">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveProject(p);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-800/70 transition-colors ${
                        activeProject?.id === p.id ? 'bg-blue-600/15 text-blue-400 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      {activeProject?.id === p.id && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-800 pt-2 px-2">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsProjectModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Project
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {/* AI Assistant Button */}
          <button
            onClick={onToggleAi}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all shadow-lg ${
              isAiOpen
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/25 ring-2 ring-purple-400/30'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:opacity-90 shadow-blue-500/20'
            }`}
          >
            <Bot className="w-4 h-4 animate-pulse" />
            <span className="hidden sm:inline">Ask AI Insights</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          </button>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-800/50">
              <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-medium text-slate-200">{user?.name}</div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {isProjectModalOpen && <ProjectModal onClose={() => setIsProjectModalOpen(false)} />}
    </>
  );
};
