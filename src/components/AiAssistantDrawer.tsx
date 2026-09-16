'use client';

import React, { useState } from 'react';
import { Bot, X, Sparkles, Send, CheckCircle2, AlertTriangle, ListTodo, Plus, ArrowRight } from 'lucide-react';
import { Project } from '@/context/AuthContext';
import { AiTaskSuggestion } from '@/lib/ai';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  suggestedTasks?: AiTaskSuggestion[];
  timestamp: Date;
}

interface AiAssistantDrawerProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: () => void;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  project,
  isOpen,
  onClose,
  onTaskAdded,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am your AI Project Manager for **${project.name}**.\n\nI have full real-time access to your database tasks, team members, priorities, and deadlines. Ask me anything or select a prompt below!`,
      timestamp: new Date(),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptingTaskId, setAcceptingTaskId] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    { label: '🚨 What tasks are overdue?', prompt: 'What tasks are overdue?' },
    { label: '📊 Summarize project status', prompt: 'Summarize the current status of this project.' },
    { label: '🎯 Prioritize this week', prompt: 'Which tasks should we prioritize this week?' },
    { label: '📋 Create suggested plan', prompt: 'Create a suggested plan for completing the remaining tasks.' },
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputPrompt;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, prompt: textToSend }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI query failed');

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.answer,
        suggestedTasks: data.suggestedTasks,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `⚠️ Sorry, I encountered an error retrieving data: ${err.message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTask = async (taskSuggestion: AiTaskSuggestion, taskIndexKey: string) => {
    setAcceptingTaskId(taskIndexKey);
    try {
      const res = await fetch('/api/ai/accept-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          title: taskSuggestion.title,
          description: taskSuggestion.description,
          priority: taskSuggestion.priority,
          status: taskSuggestion.status,
          dueDateDaysFromNow: taskSuggestion.dueDateDaysFromNow,
        }),
      });

      if (res.ok) {
        onTaskAdded();
        // Add confirm text to chat
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'ai',
            text: `✅ **Task Accepted & Added to Project!**\nAdded: **${taskSuggestion.title}** to your project Kanban board.`,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAcceptingTaskId(null);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col animate-slide-left">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white shadow-lg shadow-purple-500/20">
            <Bot className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              TaskFlow AI Insights
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </h3>
            <p className="text-xs text-slate-400">Database-backed LLM Assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/50 space-y-1.5">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
          Instant Question Shortcuts
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((item, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSend(item.prompt)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors text-left truncate max-w-full"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat History List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-600/20'
                  : 'glass-panel text-slate-200 border-slate-800 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

              {/* Render AI Suggested Tasks Action Cards */}
              {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-3">
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ListTodo className="w-4 h-4" />
                    <span>AI Suggested Tasks to Accept:</span>
                  </div>

                  {msg.suggestedTasks.map((t, idx) => {
                    const taskKey = `${msg.id}-${idx}`;
                    const isAccepting = acceptingTaskId === taskKey;

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-white text-xs">{t.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {t.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">{t.description}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-slate-500">
                            Due in ~{t.dueDateDaysFromNow} days
                          </span>
                          <button
                            onClick={() => handleAcceptTask(t, taskKey)}
                            disabled={isAccepting}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors disabled:opacity-50 shadow-md shadow-emerald-600/20"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            {isAccepting ? 'Adding...' : 'Accept & Add Task'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl glass-panel text-slate-400 text-xs w-fit">
            <Bot className="w-4 h-4 animate-spin text-purple-400" />
            <span>Analyzing database snapshot & generating response...</span>
          </div>
        )}
      </div>

      {/* Input Prompt Box */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask AI about tasks, status, priorities..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg shadow-purple-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
