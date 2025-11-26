---
description: Set up development environment for new developers using mise
allowed-tools: Bash, Read, Write
---

# Developer Environment Setup

Help a new developer set up their environment for this project using mise.

## Prerequisites Check

First, verify mise is installed:

```bash
mise --version
```

If not installed, provide installation instructions:
- macOS: `brew install mise` or `curl https://mise.run | sh`
- Linux: `curl https://mise.run | sh`
- See: https://mise.jdx.dev/getting-started.html

## Setup Steps

### Step 1: Check/Create mise configuration

Check if `.mise.toml` exists in the project root. If not, create it with:

```toml
[tools]
node = "20"

[env]
NODE_ENV = "development"
```

### Step 2: Install tools via mise

```bash
mise install
mise trust  # Trust the project's mise config
```

### Step 3: Verify Node.js

```bash
node --version  # Should show v20.x
npm --version
```

### Step 4: Install dependencies

```bash
npm install
```

### Step 5: Verify the setup

Run these checks:
```bash
npm run lint          # Should pass with no errors
npx tsc --noEmit      # Should have no type errors
npm run build         # Should build successfully
```

### Step 6: Start development server

```bash
npm run dev
```

Confirm the app is running at http://localhost:3000

## Post-Setup Checklist

Provide the developer with this checklist:

- [ ] mise is installed and working
- [ ] Node.js 20.x is active via mise
- [ ] `npm install` completed without errors
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts the server
- [ ] App loads at http://localhost:3000
- [ ] Read `AGENTS.md` for project conventions
- [ ] Review `CONTRIBUTING.md` for workflow guidelines

## Troubleshooting

### mise not found after install
Add to shell profile:
```bash
echo 'eval "$(mise activate bash)"' >> ~/.bashrc  # or .zshrc
```

### Node version mismatch
```bash
mise use node@20
mise install
```

### npm install fails
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 in use
```bash
npm run dev -- -p 3001
```

## Environment Summary

After setup, display:
- Node version
- npm version
- Project name and version from package.json
- Available npm scripts
- Key documentation files to read
