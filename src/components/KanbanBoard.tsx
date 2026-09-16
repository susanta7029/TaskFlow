'use client';

import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Calendar, User, Trash2, Edit3, AlertCircle, Clock } from 'lucide-react';
import { Task } from './TaskModal';

interface KanbanBoardProps {
  tasks: any[];
  onTaskStatusChange: (taskId: string, newStatus: string) => void;
  onEditTask: (task: any) => void;
  onDeleteTask: (taskId: string) => void;
  onAddNewTask: (status?: string) => void;
}

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'bg-slate-700/40 text-slate-300 border-slate-700' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-900/30 text-blue-300 border-blue-500/30' },
  { id: 'IN_REVIEW', title: 'In Review', color: 'bg-purple-900/30 text-purple-300 border-purple-500/30' },
  { id: 'DONE', title: 'Done', color: 'bg-emerald-900/30 text-emerald-300 border-emerald-500/30' },
];

const PRIORITY_BADGES: Record<string, { bg: string; text: string }> = {
  LOW: { bg: 'bg-slate-800 text-slate-400 border-slate-700', text: 'Low' },
  MEDIUM: { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', text: 'Medium' },
  HIGH: { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', text: 'High' },
  URGENT: { bg: 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse', text: 'Urgent 🚨' },
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskStatusChange,
  onEditTask,
  onDeleteTask,
  onAddNewTask,
}) => {
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    onTaskStatusChange(draggableId, destination.droppableId);
  };

  const getTasksByStatus = (statusId: string) => {
    return tasks.filter((t) => t.status === statusId);
  };

  const now = new Date();

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((column) => {
          const colTasks = getTasksByStatus(column.id);

          return (
            <div
              key={column.id}
              className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex flex-col max-h-[80vh]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${column.color}`}
                  >
                    {column.title}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{colTasks.length}</span>
                </div>
                <button
                  onClick={() => onAddNewTask(column.id)}
                  title="Add task to column"
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Droppable Task List */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[150px] overflow-y-auto pr-1 transition-colors rounded-xl p-1 ${
                      snapshot.isDraggingOver ? 'bg-blue-500/5 ring-2 ring-blue-500/20' : ''
                    }`}
                  >
                    {colTasks.map((task, index) => {
                      const priorityStyle =
                        PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.MEDIUM;
                      const isOverdue =
                        task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE';

                      return (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={`glass-card p-4 rounded-xl border relative group cursor-grab active:cursor-grabbing ${
                                dragSnapshot.isDragging
                                  ? 'shadow-2xl ring-2 ring-blue-500 bg-slate-900 border-blue-500'
                                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              {/* Action Buttons Header */}
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${priorityStyle.bg}`}
                                >
                                  {priorityStyle.text}
                                </span>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => onEditTask(task)}
                                    className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800"
                                    title="Edit"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => onDeleteTask(task.id)}
                                    className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Task Title */}
                              <h4 className="text-sm font-semibold text-white mb-1 tracking-tight line-clamp-2">
                                {task.title}
                              </h4>

                              {/* Description snippet */}
                              {task.description && (
                                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                                  {task.description}
                                </p>
                              )}

                              {/* Footer Meta: Assignee & Due Date */}
                              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80 mt-2">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                  <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-blue-300">
                                    {task.assignee?.name?.charAt(0) || 'U'}
                                  </div>
                                  <span className="truncate max-w-[90px] text-[11px]">
                                    {task.assignee?.name?.split(' ')[0] || 'Unassigned'}
                                  </span>
                                </div>

                                {task.dueDate && (
                                  <div
                                    className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                                      isOverdue
                                        ? 'bg-red-500/10 text-red-400 font-bold border border-red-500/30'
                                        : 'text-slate-400'
                                    }`}
                                  >
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                      {new Date(task.dueDate).toISOString().split('T')[0]}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}

                    {colTasks.length === 0 && (
                      <div className="h-28 border-2 border-dashed border-slate-800/80 rounded-xl flex items-center justify-center text-xs text-slate-500 font-medium">
                        No tasks in {column.title}
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
