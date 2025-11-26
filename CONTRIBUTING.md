# Contributing to expense-tracker-ai

Thank you for your interest in contributing to expense-tracker-ai! This document provides guidelines and information about contributing to this project.

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/expense-tracker-ai.git
   cd expense-tracker-ai
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) to see the application

## How to Contribute

### Reporting Bugs

Before submitting a bug report:

1. Check existing issues to avoid duplicates
2. Collect information about the bug:
   - Stack trace (if applicable)
   - OS and browser version
   - Steps to reproduce
   - Expected vs actual behavior

When submitting a bug report, please include:
- A clear, descriptive title
- Detailed steps to reproduce the issue
- Expected and actual behavior
- Screenshots if applicable
- Your environment details

### Suggesting Features

Feature requests are welcome! When suggesting a feature:

1. Check if it's already been suggested
2. Provide a clear description of the feature
3. Explain why this feature would be useful
4. Consider how it might be implemented

### Code Contributions

1. **Fork and clone** the repository
2. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```
3. **Make your changes** following our coding standards
4. **Test your changes** thoroughly
5. **Commit your changes** with clear, descriptive messages
6. **Push to your fork** and submit a pull request

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications

### Commit Messages

Write clear, concise commit messages that explain what and why:

```
feat: add expense category filtering

- Add filter dropdown component
- Implement category-based filtering logic
- Update expense list to use filters
```

Use conventional commit prefixes:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting, no code change
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Code Style

- Run `npm run lint` before committing
- Follow existing code patterns and conventions
- Use TypeScript types appropriately
- Keep components focused and modular

### Testing

- Test your changes locally before submitting
- Ensure the build passes: `npm run build`
- Ensure linting passes: `npm run lint`

## Pull Request Process

1. Update documentation if needed
2. Ensure all tests and linting pass
3. Fill out the pull request template completely
4. Request review from maintainers
5. Address any feedback from reviewers

### What to Expect

- PRs are typically reviewed within a few days
- You may receive feedback requesting changes
- Once approved, a maintainer will merge your PR

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Questions?

If you have questions about contributing, feel free to open an issue for discussion.

Thank you for contributing!
