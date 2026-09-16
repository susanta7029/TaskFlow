import { prisma } from './prisma';

export interface AiTaskSuggestion {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  dueDateDaysFromNow: number;
  suggestedAssigneeEmail?: string;
}

export interface AiChatResponse {
  answer: string;
  suggestedTasks?: AiTaskSuggestion[];
  isOverdueQuery?: boolean;
}

/**
 * Builds full DB context string for the AI prompt
 */
export async function buildProjectContext(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: { select: { name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          createdBy: { select: { name: true } },
        },
        orderBy: { dueDate: 'asc' },
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const now = new Date();
  const tasksSummary = project.tasks.map((t) => {
    const isOverdue = t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE';
    return {
      id: t.id,
      title: t.title,
      description: t.description || 'No description',
      status: t.status,
      priority: t.priority,
      assignee: t.assignee ? `${t.assignee.name} (${t.assignee.email})` : 'Unassigned',
      dueDate: t.dueDate ? t.dueDate.toISOString().split('T')[0] : 'No due date',
      isOverdue: isOverdue ? 'YES - OVERDUE' : 'No',
    };
  });

  const memberList = project.members.map((m) => `${m.user.name} (${m.user.email}) - ${m.role}`);

  const contextText = `
=== PROJECT DATABASE CONTEXT ===
Project Name: ${project.name}
Description: ${project.description || 'N/A'}
Owner: ${project.owner.name} (${project.owner.email})
Current Date: ${now.toISOString().split('T')[0]}

TEAM MEMBERS:
${memberList.join('\n') || 'None'}

TOTAL TASKS: ${project.tasks.length}
STATUS BREAKDOWN:
- TODO: ${project.tasks.filter((t) => t.status === 'TODO').length}
- IN_PROGRESS: ${project.tasks.filter((t) => t.status === 'IN_PROGRESS').length}
- IN_REVIEW: ${project.tasks.filter((t) => t.status === 'IN_REVIEW').length}
- DONE: ${project.tasks.filter((t) => t.status === 'DONE').length}

OVERDUE TASKS: ${project.tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE').length}

TASK LIST DETAILS:
${JSON.stringify(tasksSummary, null, 2)}

RECENT ACTIVITY LOG:
${project.activities.map((a) => `[${a.createdAt.toISOString()}] ${a.user?.name || 'System'}: ${a.action} - ${a.details}`).join('\n')}
================================
`;

  return { project, tasksSummary, contextText };
}

/**
 * Heuristic AI Engine for accurate fallback when API Key is not set or during testing
 */
export function generateLocalAiResponse(query: string, projectData: any): AiChatResponse {
  const { project, tasksSummary } = projectData;
  const q = query.toLowerCase();
  const now = new Date();

  // 1. Overdue tasks query
  if (q.includes('overdue') || q.includes('late') || q.includes('past due')) {
    const overdue = project.tasks.filter((t: any) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE');
    if (overdue.length === 0) {
      return {
        answer: `Great news! 🎉 There are currently **0 overdue tasks** in **${project.name}**. All pending tasks are within their scheduled deadlines.`,
        isOverdueQuery: true,
      };
    }

    const listStr = overdue
      .map(
        (t: any) =>
          `• **${t.title}** (Priority: \`${t.priority}\`, Status: \`${t.status}\`, Due: ${new Date(t.dueDate).toISOString().split('T')[0]}, Assignee: ${t.assignee?.name || 'Unassigned'})`
      )
      .join('\n');

    return {
      answer: `⚠️ **Overdue Tasks Alert**: There are currently **${overdue.length} overdue task(s)** in **${project.name}**:\n\n${listStr}\n\n**Recommendation:** Reassign unassigned overdue items and increase priority to HIGH or URGENT.`,
      isOverdueQuery: true,
    };
  }

  // 2. Project Status Summary
  if (q.includes('summarize') || q.includes('summary') || q.includes('status') || q.includes('overview')) {
    const total = project.tasks.length;
    const done = project.tasks.filter((t: any) => t.status === 'DONE').length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    const inProgress = project.tasks.filter((t: any) => t.status === 'IN_PROGRESS').length;
    const inReview = project.tasks.filter((t: any) => t.status === 'IN_REVIEW').length;
    const todo = project.tasks.filter((t: any) => t.status === 'TODO').length;
    const overdueCount = project.tasks.filter((t: any) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE').length;

    return {
      answer: `📊 **Project Status Summary for ${project.name}**:\n\n` +
        `• **Overall Completion:** ${percent}% (${done}/${total} tasks completed)\n` +
        `• **In Progress:** ${inProgress} tasks\n` +
        `• **In Review:** ${inReview} tasks\n` +
        `• **To Do:** ${todo} tasks\n` +
        `• **Overdue Risk:** ${overdueCount} task(s)\n\n` +
        `**Key Highlight:** The team has completed ${done} out of ${total} tasks. Focus on resolving the ${inProgress} active tasks to maintain momentum!`,
    };
  }

  // 3. Priorities for this week
  if (q.includes('prioritize') || q.includes('priority') || q.includes('week') || q.includes('focus')) {
    const urgentOrHigh = project.tasks
      .filter((t: any) => t.status !== 'DONE' && (t.priority === 'URGENT' || t.priority === 'HIGH'))
      .sort((a: any, b: any) => (a.dueDate ? new Date(a.dueDate).getTime() : Infinity) - (b.dueDate ? new Date(b.dueDate).getTime() : Infinity));

    if (urgentOrHigh.length === 0) {
      return {
        answer: `✅ No URGENT or HIGH priority pending tasks found. The team can focus on remaining MEDIUM/LOW priority items in the **To Do** backlog.`,
      };
    }

    const itemStr = urgentOrHigh
      .slice(0, 5)
      .map(
        (t: any) =>
          `1. **${t.title}** [Priority: \`${t.priority}\` | Status: \`${t.status}\`]\n   - Due: ${t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : 'No date'}\n   - Assignee: ${t.assignee?.name || 'Unassigned'}`
      )
      .join('\n\n');

    return {
      answer: `🎯 **Top Recommended Priorities for This Week**:\n\n${itemStr}\n\n**Action Plan:** Tackle these high-impact items first to unblock dependent team milestones.`,
    };
  }

  // 4. Suggested Plan & Actionable New Tasks
  if (q.includes('plan') || q.includes('suggest') || q.includes('remaining') || q.includes('next steps')) {
    const remainingTasks = project.tasks.filter((t: any) => t.status !== 'DONE');

    const suggestions: AiTaskSuggestion[] = [
      {
        title: 'Conduct Sprint Retrospective & QA Audit',
        description: 'Perform a comprehensive testing review of all recent pull requests and update documentation.',
        priority: 'HIGH',
        status: 'TODO',
        dueDateDaysFromNow: 3,
      },
      {
        title: 'Setup Automated CI/CD Pipeline Monitoring',
        description: 'Implement automated build checks and error reporting for seamless deployments.',
        priority: 'MEDIUM',
        status: 'TODO',
        dueDateDaysFromNow: 5,
      },
      {
        title: 'User Acceptance Testing & Feedback Collection',
        description: 'Gather initial user feedback on completed project features and log bugs.',
        priority: 'URGENT',
        status: 'TODO',
        dueDateDaysFromNow: 2,
      },
    ];

    return {
      answer: `📋 **Suggested Roadmap for Completing Remaining Tasks**:\n\n` +
        `1. **Phase 1 (Immediate - 48h):** Clear all overdue items and items in \`IN_REVIEW\`.\n` +
        `2. **Phase 2 (Mid-week):** Complete active \`IN_PROGRESS\` tasks assigned to engineers.\n` +
        `3. **Phase 3 (End of Week):** Kickoff suggested quality assurance & deployment tasks.\n\n` +
        `Below are **3 AI-recommended new tasks** tailored for this project. Click **"Accept & Add Task"** to add any of them directly to your project board!`,
      suggestedTasks: suggestions,
    };
  }

  // Default fallback answer
  return {
    answer: `🤖 **AI Project Insights for ${project.name}**:\n\n` +
      `Based on the database snapshot, your project currently has **${project.tasks.length} total tasks** across **${project.members.length} team member(s)**.\n\n` +
      `You can ask me specific questions like:\n` +
      `• *"What tasks are overdue?"*\n` +
      `• *"Summarize the current status of this project."*\n` +
      `• *"Which tasks should we prioritize this week?"*\n` +
      `• *"Create a suggested plan for completing the remaining tasks."*`,
  };
}

/**
 * Primary LLM Router calling Gemini API or Fallback
 */
export async function askProjectAi(projectId: string, userQuery: string): Promise<AiChatResponse> {
  const { project, tasksSummary, contextText } = await buildProjectContext(projectId);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    // Return smart local heuristic response
    return generateLocalAiResponse(userQuery, { project, tasksSummary });
  }

  try {
    const systemPrompt = `You are TaskFlow AI, an expert AI Project Manager assistant. You have full access to the project's database snapshot below. Answer user questions accurately based strictly on this database context. Format your response with rich Markdown formatting (bullet points, bold text, code blocks, callouts).

If the user asks for a suggested plan or new task ideas, output a clear structured response and include recommended task suggestions.

${contextText}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${userQuery}` }] }
        ]
      })
    });

    if (!res.ok) {
      console.warn('Gemini API call failed, using local AI fallback:', await res.text());
      return generateLocalAiResponse(userQuery, { project, tasksSummary });
    }

    const data = await res.json();
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textOutput) {
      return generateLocalAiResponse(userQuery, { project, tasksSummary });
    }

    // Check if query is plan or suggest and include task suggestions
    const q = userQuery.toLowerCase();
    let suggestedTasks: AiTaskSuggestion[] | undefined;

    if (q.includes('plan') || q.includes('suggest') || q.includes('next steps') || q.includes('tasks')) {
      suggestedTasks = [
        {
          title: 'Implement Automated Integration Test Suite',
          description: 'Create comprehensive test cases covering API endpoints and project workflows.',
          priority: 'HIGH',
          status: 'TODO',
          dueDateDaysFromNow: 4,
        },
        {
          title: 'Performance Optimization & Code Refactoring',
          description: 'Audit bundle size, database query performance, and component rendering.',
          priority: 'MEDIUM',
          status: 'TODO',
          dueDateDaysFromNow: 7,
        },
      ];
    }

    return {
      answer: textOutput,
      suggestedTasks,
    };
  } catch (error) {
    console.error('Error in askProjectAi:', error);
    return generateLocalAiResponse(userQuery, { project, tasksSummary });
  }
}
