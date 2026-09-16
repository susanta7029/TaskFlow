import { describe, it, expect } from 'vitest';
import { generateLocalAiResponse } from '../src/lib/ai';

describe('AI Engine Test Suite', () => {
  const mockProjectData = {
    project: {
      id: 'proj-1',
      name: 'TaskFlow AI Engine Launch',
      members: [{ id: 'm1' }, { id: 'm2' }],
      tasks: [
        {
          id: 't1',
          title: 'Setup Database',
          status: 'DONE',
          priority: 'HIGH',
          dueDate: '2026-09-01T00:00:00.000Z',
          assignee: { name: 'Alex' },
        },
        {
          id: 't2',
          title: 'Implement Security Audit',
          status: 'TODO',
          priority: 'URGENT',
          dueDate: '2026-09-10T00:00:00.000Z', // Overdue
          assignee: { name: 'Alex' },
        },
        {
          id: 't3',
          title: 'Kanban Interactivity',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          dueDate: '2026-09-20T00:00:00.000Z',
          assignee: { name: 'Sarah' },
        },
      ],
    },
    tasksSummary: [],
  };

  it('should identify overdue tasks in database snapshot', () => {
    const res = generateLocalAiResponse('What tasks are overdue?', mockProjectData);
    expect(res.answer).toContain('Overdue Tasks Alert');
    expect(res.answer).toContain('Implement Security Audit');
    expect(res.isOverdueQuery).toBe(true);
  });

  it('should generate project status summary', () => {
    const res = generateLocalAiResponse('Summarize the current status of this project.', mockProjectData);
    expect(res.answer).toContain('Project Status Summary');
    expect(res.answer).toContain('Overall Completion');
  });

  it('should generate weekly priorities', () => {
    const res = generateLocalAiResponse('Which tasks should we prioritize this week?', mockProjectData);
    expect(res.answer).toContain('Top Recommended Priorities');
    expect(res.answer).toContain('Implement Security Audit');
  });

  it('should generate suggested plan with actionable AI task suggestions', () => {
    const res = generateLocalAiResponse('Create a suggested plan for completing the remaining tasks.', mockProjectData);
    expect(res.answer).toContain('Suggested Roadmap');
    expect(res.suggestedTasks).toBeDefined();
    expect(res.suggestedTasks?.length).toBeGreaterThan(0);
    expect(res.suggestedTasks?.[0].title).toBeDefined();
  });
});
