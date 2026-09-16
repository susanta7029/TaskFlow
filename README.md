# 🚀 TaskFlow AI - AI-Powered Project Management Platform

TaskFlow AI is a modern full-stack web application designed to help teams manage projects, track tasks via drag-and-drop Kanban boards, visualize real-time project statistics, and generate actionable AI insights backed by live database context.

![TaskFlow AI Screenshot](./public/preview.png)

---

## 🌟 Key Features

### 1. Authentication & Role-Based Access
- User signup and login with secure JWT token authentication.
- Password hashing using `bcryptjs`.
- Role-based permissions (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`).

### 2. Project & Task Management
- Create, update, and delete projects.
- Full task CRUD with properties:
  - **Title & Description**
  - **Assignee** (Team members)
  - **Priority**: Low, Medium, High, Urgent 🚨
  - **Status**: To Do, In Progress, In Review, Done
  - **Due Date**: Overdue indicators & warnings

### 3. Interactive Drag-and-Drop Kanban Board
- Powered by `@hello-pangea/dnd`.
- Instantly update task status across 4 workflow columns with database persistence.

### 4. Project Analytics Dashboard
- Overall completion progress tracking.
- Interactive status & priority distribution charts powered by `recharts`.
- Overdue task warning banner.

### 5. AI LLM RAG & Real-Time Database Insights
- Integrated with Google Gemini API (`@google/generative-ai`) with full DB RAG snapshot prompt context.
- **Pre-set AI Question Shortcuts**:
  - *"What tasks are overdue?"*
  - *"Summarize the current status of this project."*
  - *"Which tasks should we prioritize this week?"*
  - *"Create a suggested plan for completing the remaining tasks."*
- **1-Click AI Task Acceptance**: Accept AI task recommendations and insert them directly into your project board!
- **Smart Fallback Engine**: Embedded heuristic analysis engine ensuring full functionality even without an API key configured.

### 6. Activity Audit Log
- Immutable activity feed tracking task creation, status changes, and AI task acceptances.

### 7. Automated Testing & Docker Deployment
- **Vitest Unit Test Suite**: Tests for auth JWT hashing & AI database heuristic engines.
- **Multi-stage Dockerfile** and `docker-compose.yml` ready for containerized deployment.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, React Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Glassmorphism design
- **Database & ORM**: SQLite & Prisma ORM
- **Authentication**: JWT & HTTP-only cookies
- **AI Integration**: Google Gemini API (`@google/generative-ai`)
- **Drag & Drop**: `@hello-pangea/dnd`
- **Charts**: Recharts
- **Testing**: Vitest

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### 2. Installation & Setup
```bash
# 1. Clone repository
git clone <repo-url>
cd ai-project-management

# 2. Install dependencies
npm install

# 3. Configure Environment
cp .env.example .env

# 4. Push Database Schema & Seed Demo Data
npx prisma db push
npm run db:seed

# 5. Start Development Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Login Credentials

You can use 1-click login on the login screen or enter:
- **Admin**: `admin@taskflow.ai` | Password: `password123`
- **Dev Lead**: `alex@taskflow.ai` | Password: `password123`
- **Designer**: `sarah@taskflow.ai` | Password: `password123`

---

## 🧪 Running Automated Tests

```bash
npm test
```

---

## 🐳 Docker Deployment

```bash
docker-compose up --build -d
```

The application will be running live on port `3000`.
