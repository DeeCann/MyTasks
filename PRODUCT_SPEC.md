# MyTasks — product specification

## Goal
Build a very simple web/PWA task management app for one user, optimized for desktop and mobile.
The product must feel like a lightweight combination of Confluence sections and Trello boards, not a project-management suite.

## Core concept
- An **Area** is a project/workspace, similar to a Confluence section.
- Each Area has a Kanban board with exactly four statuses:
  1. Added
  2. In progress
  3. Blocked
  4. Done
- Tasks can be dragged between columns.
- A task can also have its status changed from its edit form.

## Main views
1. Today — aggregated view of tasks due today across all Areas.
2. All tasks — searchable list of all tasks.
3. Areas — list/grid of Areas.
4. Area board — Kanban board for one Area.

## Task fields
- title (required)
- description (optional)
- area (required)
- status (required)
- due date (optional)
- due time (optional)
- priority: Normal / High / Urgent
- created_at
- updated_at

## Voice input
Voice input is a first-class feature.
User should be able to tap a microphone and say something natural such as:
"Dodaj do MedAI: poprawić segmentację naczyń na jutro o 9:00, wysoki priorytet."
The system should transcribe speech and extract title, area, date, time and priority. Before saving, show a confirmation/edit screen.

For the first production version, use browser speech recognition where reliable, with a fallback to a speech-to-text API. Do not make the whole app dependent on AI parsing; normal manual task creation must always work.

## UX principles
- Extremely simple.
- No Jira-like complexity.
- No Gantt charts, chat, comments, workflows, automations or enterprise permissions in MVP.
- One obvious primary action: Add task.
- Microphone action should be immediately accessible on mobile and desktop.
- Responsive/PWA behavior.
- Fast startup.
- Light and dark mode.

## Suggested production architecture
- Frontend: Next.js + TypeScript + Tailwind CSS (or another similarly simple modern React stack).
- Backend/database/auth: Supabase.
- Database: PostgreSQL through Supabase.
- PWA: installable on iOS/Android/desktop.
- Realtime synchronization through Supabase.
- Voice: Web Speech API where supported, with a configurable STT provider fallback.
- Deployment: Vercel or Cloudflare Pages/Workers, with Supabase for backend.

## Data model
Areas:
- id
- name
- description
- color
- position
- created_at

Tasks:
- id
- area_id
- title
- description
- status
- due_date
- due_time
- priority
- position
- created_at
- updated_at

## Important behavior
- Dragging a card to another column changes its status.
- Dragging cards within a column changes position.
- Today view includes tasks whose due_date is today and shows their Area and status.
- Overdue tasks should be visibly marked.
- Search should search task title, description and Area name.
- Creating an Area should immediately make it available in task creation.
- Deleting an Area should require confirmation and should not silently delete its tasks.

## Current prototype
`index.html` is a clickable visual/functional prototype. Preserve its visual language and interaction model, but do NOT treat its in-memory JavaScript data model as production architecture.

## Build sequence
1. Scaffold production app.
2. Recreate current UI accurately.
3. Add Supabase auth and database.
4. Persist Areas and Tasks.
5. Implement drag/drop status and ordering.
6. Implement Today and search views.
7. Implement voice capture + confirmation flow.
8. Add PWA support.
9. Add validation, error states and loading states.
10. Test desktop and mobile layouts.

## Acceptance criteria
- User can create an account/sign in.
- User can create Areas.
- User can create/edit/delete Tasks.
- User can set all four statuses.
- User can drag tasks between statuses.
- User can set date/time/priority.
- Today view works across all Areas.
- Data persists after browser refresh and is synchronized across devices.
- Voice input creates a proposed task from natural speech and requires confirmation before save.
- App is usable on a phone without horizontal page scrolling except the intentional horizontal Kanban board.
