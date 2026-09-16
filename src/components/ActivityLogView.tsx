'use client';

import React, { useEffect, useState } from 'react';
import { History, User, CheckCircle, Clock, AlertCircle, PlusCircle } from 'lucide-react';

interface ActivityLogViewProps {
  projectId: string;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ projectId }) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/activity?projectId=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [projectId]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'TASK_CREATED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">Task Created</span>;
      case 'STATUS_CHANGED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">Status Update</span>;
      case 'AI_SUGGESTION_ACCEPTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">AI Action</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">{action}</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        Loading audit activity log...
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            Project Activity & Audit Trail
          </h3>
          <p className="text-xs text-slate-400">Immutable record of project changes, task moves, and AI actions</p>
        </div>
        <button
          onClick={fetchActivities}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
        >
          Refresh Log
        </button>
      </div>

      <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
        {activities.map((item) => (
          <div key={item.id} className="relative group">
            <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-slate-900" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{item.user?.name || 'System User'}</span>
                  {getActionBadge(item.action)}
                </div>
                <p className="text-sm text-slate-300">{item.details}</p>
              </div>

              <span className="text-xs text-slate-500 shrink-0 font-mono">
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-xs text-slate-500 py-4">No activity logged for this project yet.</div>
        )}
      </div>
    </div>
  );
};
