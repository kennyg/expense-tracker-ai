---
description: Review UI screenshots and diagram architecture for refinement
allowed-tools: Read, Glob, Grep, Edit, Write, Bash
---

# Design Review & Architecture Refinement

You are helping the user iterate on their UI/UX design based on screenshots they provide.

## Your Task

$ARGUMENTS

## Process

### 1. Analyze the Screenshot
When the user provides a screenshot path or pastes an image:
- Read and analyze the visual design
- Identify all UI components and their relationships
- Note the layout structure, spacing, and visual hierarchy

### 2. Create an Architecture Diagram
Generate an ASCII diagram showing:
```
┌─────────────────────────────────────────┐
│ Component Name                          │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────────────────┐ │
│  │ Child A  │  │ Child B              │ │
│  └──────────┘  └──────────────────────┘ │
└─────────────────────────────────────────┘
```

Include:
- Component hierarchy and nesting
- Data flow between components
- Props and state relationships
- Any context providers or shared state

### 3. Map to Codebase
- Identify which existing components are being used
- Suggest which files need modification
- Note any new components that need to be created

### 4. Gather Refinement Requests
Ask the user what they'd like to change:
- Layout adjustments
- Styling changes
- New features to add
- Components to modify or replace

### 5. Implement Changes
Once the user specifies refinements:
- Make targeted edits to the relevant components
- Preserve existing functionality
- Follow the project's styling patterns (Tailwind CSS)

## Tips
- Always read the current component code before suggesting changes
- Keep changes minimal and focused
- Suggest one refinement at a time for complex changes
- Show before/after comparisons when helpful
