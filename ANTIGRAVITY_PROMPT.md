# Prompt for Google Antigravity

You are building the MyTasks application described in PRODUCT_SPEC.md.

Start by inspecting index.html and PRODUCT_SPEC.md. Treat the HTML as the visual/interaction reference, not as production code.

Do not blindly convert the existing single-file HTML. Rebuild it as a clean, maintainable production web application.

Before coding, create a concise implementation plan covering:
- frontend architecture
- Supabase schema and security rules
- authentication
- task/area CRUD
- drag-and-drop ordering
- Today aggregation
- voice input and parsing
- PWA/mobile behavior
- testing

Then implement the application incrementally. After each major stage, run the app and verify it in the browser.

Keep the product intentionally small. Do not add Jira/ClickUp/Notion-style features that are not in the specification.

The most important UX requirements are:
1. Areas feel like Confluence sections/workspaces.
2. Each Area opens as a clean four-column Kanban board: Added, In progress, Blocked, Done.
3. Task status is a real field, not a checkbox.
4. Today is a cross-area summary.
5. Voice input is a first-class action.
6. Mobile experience is as important as desktop.

If a technical choice is ambiguous, prefer the simplest reliable solution and document the decision rather than expanding scope.
