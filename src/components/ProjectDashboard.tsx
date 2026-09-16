'use client';

import React from 'react';
import { Project } from '@/context/AuthContext';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  ListTodo,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ProjectDashboardProps {
  project: Project;
  onOpenTaskModal: () => void;
  onSelectTab: (tab: any) => void;
}

const STATUS_COLORS: Record<string, string> = {
  TODO: '#94a3b8',
  IN_PROGRESS: '#3b82f6',
  IN_REVIEW: '#a855f7',
  DONE: '#22c55e',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#64748b',
  MEDIUM: '#3b82f6',
  HIGH: '#f59e0b',
  URGENT: '#ef4444',
};

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  project,
  onOpenTaskModal,
  onSelectTab,
}) => {
  const tasks = project.tasks || [];
  const totalTasks = tasks.length;
  const now = new Date();

  const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const inReviewTasks = tasks.filter((t) => t.status === 'IN_REVIEW').length;
  const todoTasks = tasks.filter((t) => t.status === 'TODO').length;

  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE'
  );

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Status Chart Data
  const statusData = [
    { name: 'To Do', value: todoTasks, key: 'TODO', color: STATUS_COLORS.TODO },
    { name: 'In Progress', value: inProgressTasks, key: 'IN_PROGRESS', color: STATUS_COLORS.IN_PROGRESS },
    { name: 'In Review', value: inReviewTasks, key: 'IN_REVIEW', color: STATUS_COLORS.IN_REVIEW },
    { name: 'Done', value: completedTasks, key: 'DONE', color: STATUS_COLORS.DONE },
  ].filter((d) => d.value > 0);

  // Priority Chart Data
  const priorityCounts = {
    LOW: tasks.filter((t) => t.priority === 'LOW').length,
    MEDIUM: tasks.filter((t) => t.priority === 'MEDIUM').length,
    HIGH: tasks.filter((t) => t.priority === 'HIGH').length,
    URGENT: tasks.filter((t) => t.priority === 'URGENT').length,
  };

  const priorityData = [
    { name: 'Low', value: priorityCounts.LOW, color: PRIORITY_COLORS.LOW },
    { name: 'Medium', value: priorityCounts.MEDIUM, color: PRIORITY_COLORS.MEDIUM },
    { name: 'High', value: priorityCounts.HIGH, color: PRIORITY_COLORS.HIGH },
    { name: 'Urgent 🚨', value: priorityCounts.URGENT, color: PRIORITY_COLORS.URGENT },
  ];

  return (
    <div className="space-y-6">
      {/* Overdue Alert Banner */}
      {overdueTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-red-300 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                {overdueTasks.length} Overdue Task(s) Requiring Attention
              </div>
              <div className="text-xs text-red-300/80">
                Tasks past their due date need immediate action or re-prioritization.
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('kanban')}
            className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-white text-xs font-semibold transition-colors border border-red-500/40"
          >
            View in Kanban
          </button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Tasks */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tasks</span>
            <ListTodo className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totalTasks}</div>
          <div className="text-xs text-slate-400">Project backlog size</div>
        </div>

        {/* Card 2: Completion Rate */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-white">{completionRate}%</div>
            <div className="text-xs text-emerald-400 font-semibold">({completedTasks} done)</div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{inProgressTasks}</div>
          <div className="text-xs text-blue-400 font-medium">Currently active</div>
        </div>

        {/* Card 4: Urgent & Overdue */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Urgent & Overdue</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">
            {priorityCounts.URGENT + overdueTasks.length}
          </div>
          <div className="text-xs text-amber-300">High attention items</div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Task Status Breakdown</h3>
              <p className="text-xs text-slate-400">Distribution of tasks across workflow states</p>
            </div>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>

          <div className="h-64 flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">No tasks to visualize yet</div>
            )}
          </div>
        </div>

        {/* Priority Distribution Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Tasks by Priority Level</h3>
              <p className="text-xs text-slate-400">Impact & urgency spread across the team</p>
            </div>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
