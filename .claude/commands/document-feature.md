# Document Feature: $ARGUMENTS

Generate comprehensive documentation for the feature: **$ARGUMENTS**

## Instructions

### Step 1: Analyze the Feature

Search the codebase to find all files related to "$ARGUMENTS":
- Look for components, pages, API routes, utilities, types, and tests
- Identify the feature's entry points and dependencies
- Determine the feature type based on what you find:
  - **Frontend-only**: Only UI components, no API routes or server actions
  - **Backend-only**: Only API routes, server actions, or data utilities with no UI
  - **Full-stack**: Both UI components AND API routes/server actions

### Step 2: Identify Related Documentation

Check for existing documentation that might be related:
- Search `docs/` directory for related topics
- Check README files in relevant directories
- Note any inline documentation or comments in the code

### Step 3: Generate Developer Documentation

Create `docs/dev/{feature-name}-implementation.md` with:

```markdown
# {Feature Name} - Technical Documentation

> **Feature Type**: {Frontend | Backend | Full-stack}
> **Last Updated**: {current date}
> **Related User Guide**: [How to {feature action}](../user/how-to-{feature-name}.md)

## Overview

{Brief technical summary of what this feature does}

## Architecture

### File Structure

{List all files involved with brief descriptions}

### Data Flow

{Describe how data moves through the system for this feature}

## API Reference

{If applicable - endpoints, request/response formats, error codes}

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| ... | ... | ... |

### Types

{TypeScript interfaces and types used}

## Implementation Details

### Key Components

{For each major component/module:}
- Purpose
- Props/Parameters
- Key logic explained

### State Management

{How state is managed - context, hooks, etc.}

### Dependencies

{External packages or internal modules this feature depends on}

## Configuration

{Any configuration options, environment variables, or feature flags}

## Error Handling

{How errors are caught, logged, and displayed to users}

## Testing

{Test coverage, key test cases, how to run tests for this feature}

## Performance Considerations

{Any caching, optimization, or performance notes}

## Future Improvements

{Known limitations or planned enhancements}
```

### Step 4: Generate User Documentation

Create `docs/user/how-to-{feature-name}.md` with:

```markdown
# How to {Feature Action}

> **Difficulty**: {Beginner | Intermediate | Advanced}
> **Time Required**: {estimated time}
> **Related Technical Docs**: [{Feature Name} Implementation](../dev/{feature-name}-implementation.md)

## Overview

{Simple explanation of what this feature allows users to do}

## Prerequisites

{What the user needs before using this feature}

- [ ] Prerequisite 1
- [ ] Prerequisite 2

## Step-by-Step Guide

### Step 1: {Action}

{Clear instruction}

<!-- Screenshot: {description of what to capture} -->
![{Alt text}](../assets/screenshots/{feature-name}-step-1.png)

### Step 2: {Action}

{Clear instruction}

<!-- Screenshot: {description of what to capture} -->
![{Alt text}](../assets/screenshots/{feature-name}-step-2.png)

{Continue for all steps...}

## Quick Reference

{Summary table or bullet points for experienced users}

| Action | How To |
|--------|--------|
| ... | ... |

## Tips & Best Practices

{Helpful tips for getting the most out of this feature}

## Common Issues

### Issue: {Problem}

**Solution**: {How to fix it}

### Issue: {Problem}

**Solution**: {How to fix it}

## FAQ

**Q: {Common question}**
A: {Answer}

## Related Features

{Links to related user guides}

- [Related Feature 1](./related-feature-1.md)
- [Related Feature 2](./related-feature-2.md)

## Need Help?

{Where to get support or report issues}
```

### Step 5: Create Screenshot Placeholders Directory

Ensure `docs/assets/screenshots/` directory exists for future screenshots.

### Step 6: Output Summary

After generating both files, provide:
1. Links to both created documentation files
2. Summary of feature type detected
3. List of screenshot placeholders that need to be captured
4. Any related documentation that should be cross-linked
5. Suggestions for additional documentation if needed

## Notes

- Use the actual code to populate technical details accurately
- Keep user documentation jargon-free and accessible
- Include real examples from the codebase where helpful
- Flag any areas where the code is unclear or undocumented
- **IMPORTANT: Always use relative paths** (e.g., `src/`, `docs/`) - never use absolute paths that reveal system information (e.g., `/Users/username/...`)
