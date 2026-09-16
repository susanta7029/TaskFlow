'use client';

import React from 'react';
import { LayoutDashboard, Trello, ListTodo, History, Info, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export type TabType = 'dashboard' | 'kanban' | 'list' | 'activity';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  taskCount?: number;
  memberCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, taskCount = 0, memberCount }) => {
  const { activeProject } = useAuth();
  const displayMemberCount = memberCount !== undefined ? memberCount : (activeProject?.members?.length || 1);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Stats', icon: LayoutDashboard },
    { id: 'kanban', label: 'Kanban Board', icon: Trello },
    { id: 'list', label: 'Task Backlog', icon: ListTodo, badge: taskCount },
    { id: 'activity', label: 'Activity Audit Log', icon: History },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col justify-between hidden md:flex shrink-0">
      <div className="p-4 space-y-6">
        {/* Project Badge */}
        {activeProject && (
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Current Workspace</div>
            <div className="text-sm font-semibold text-white truncate mt-0.5">{activeProject.name}</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
              <Users className="w-3.5 h-3.5" />
              <span>{displayMemberCount} team members</span>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
        <span>TaskFlow AI v1.0</span>
        <span className="flex items-center gap-1 text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Online
        </span>
      </div>
    </aside>
  );
};
