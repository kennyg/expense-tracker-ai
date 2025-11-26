---
description: Brainstorm new features with context-aware suggestions
allowed-tools: Read, Glob, Grep
---

# Feature Brainstorming Session

Help the user brainstorm and develop new feature ideas for their expense tracker app.

## Focus Area (optional)
$ARGUMENTS

## Process

### 1. Understand Current State
First, quickly scan the codebase to understand:
- What features already exist
- The tech stack and patterns in use
- Any TODOs or planned features in the code

### 2. Generate Ideas
Based on the focus area (or general if none provided), suggest 5 feature ideas across these categories:

**Analytics & Insights**
- Spending predictions, trends, anomaly detection
- Budget recommendations, savings goals

**Data & Import**
- Receipt scanning, bank sync, CSV import
- Recurring expense detection

**User Experience**
- Quick-add shortcuts, widgets, notifications
- Dark mode, customization, accessibility

**Social & Sharing**
- Expense splitting, shared budgets
- Export reports, shareable summaries

**Gamification**
- Challenges, streaks, achievements
- Spending competitions, rewards

### 3. Present Ideas
For each suggestion, provide:
```
💡 [Feature Name]
   What: One-line description
   Why: User benefit
   Scope: Small / Medium / Large
```

### 4. Deep Dive
Ask which idea interests them, then expand with:
- User stories (As a user, I want... so that...)
- Key components needed
- Data model changes (if any)
- A rough implementation approach
- Potential challenges

### 5. Next Steps
Offer to:
- Create a technical spec
- Start implementing a prototype
- Sketch the UI approach
- Break it into smaller tasks

## Guidelines
- Keep suggestions practical for a solo/small team
- Prioritize ideas that leverage existing code
- Consider mobile-friendliness
- Think about localStorage limitations
