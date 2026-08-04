---
type: Agent Context
title: Agent Context
description: Shared conventions and context for all agents
tags: [agent, context, conventions]
status: stable
generated: { by: forcemind/2.0, at: 2026-08-03T10:00:00Z }
verified: { by: human:admin, at: 2026-08-03T12:00:00Z }
---

# Agent Context

Shared conventions and context for all AI agents.

## File Conventions

| File | Location | Format |
|------|----------|--------|
| Task files | `tasks/*.md` | Markdown with requirements |
| Test plans | `specs/*.md` | Scenarios, steps, assertions |
| Page objects | `models/*.js` | JavaScript classes |
| Test data | `data/*.json` | JSON fixtures |
| Tests | `tests/*.spec.js` | Playwright test files |
| Agent prompts | `.github/agents/*.agent.md` | Agent instructions |

## Workflow

1. **Planner** reads task → creates test plan
2. **Generator** reads plan → creates test code
3. **Healer** reads failures → fixes tests

## Quality Gates

- All tests must pass before merge
- Code review required for new patterns
- Update OKF when patterns change