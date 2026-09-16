'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, UserPlus, Shield, Users } from 'lucide-react';

interface AddMemberModalProps {
  projectId: string;
  currentMembers: any[];
  onClose: () => void;
  onMemberAdded: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  projectId,
  currentMembers,
  onClose,
  onMemberAdded,
}) => {
  const { usersList } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter out users who are already members
  const memberUserIds = new Set((currentMembers || []).map((m: any) => m.user?.id || m.userId));
  const availableUsers = usersList.filter((u) => !memberUserIds.has(u.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add member');
      }

      onMemberAdded();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <span>Add Team Member to Project</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Existing Members List */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Current Members ({currentMembers?.length || 0})
          </label>
          <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            {currentMembers?.map((m: any) => (
              <div key={m.id || m.user?.id} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-slate-900">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-[10px]">
                    {m.user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="font-semibold text-slate-200">{m.user?.name}</span>
                  <span className="text-slate-500">({m.user?.email})</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-blue-400 uppercase">
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form to add new member */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Select Registered User *
            </label>
            {availableUsers.length > 0 ? (
              <select
                required
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose User --</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email}) - Role: {u.role}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-400">
                All registered system users are already members of this project.
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Project Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MEMBER">Member (Full task access)</option>
              <option value="ADMIN">Admin (Project management access)</option>
              <option value="VIEWER">Viewer (Read-only)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || availableUsers.length === 0 || !selectedUserId}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
