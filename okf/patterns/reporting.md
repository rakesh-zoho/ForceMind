---
type: Framework Pattern
title: Test Reporting
description: Allure and custom reporting conventions
tags: [pattern, reporting, allure]
status: stable
generated: { by: forcemind/2.0, at: 2026-08-03T10:00:00Z }
verified: { by: human:admin, at: 2026-08-03T12:00:00Z }
---

# Test Reporting

Allure reports with custom JIRA and Teams integration.

## Allure Integration

- Screenshots on failure
- Video recording
- Test steps with metadata

## Custom Reporters

- `jira-reporter.js` — Posts results to JIRA
- `teams-reporter.js` — Sends Teams notifications

## Output Locations

- `reports/allure-report/` — HTML reports
- `reports/allure-results/` — Raw results
- `reports/screenshots/` — Failure screenshots
- `reports/videos/` — Test recordings