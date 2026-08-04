---
type: Attested Computation
title: Test Pass Rate
description: Percentage of tests passing in the latest run
runtime: node
parameters:
  - { name: suite, type: string, required: false }
executor:
  resource: references/executors/run-test-metric.js
  receipt: [timestamp, passed, failed, total, passRate]
attester:
  resource: references/attesters/metric-check.py
generated: { by: forcemind/2.0, at: 2026-08-03T10:00:00Z }
stale_after: 2026-08-10
sources:
  - id: playwright-results
    resource: test-results/.last-run.json
    title: Playwright Last Run Results
---

# Computation

```javascript
const results = JSON.parse(readFileSync('test-results/.last-run.json'));
const passRate = (results.passed / results.total) * 100;
return { passRate, ...results };
```

# Thresholds

| Metric | Green | Yellow | Red |
|--------|-------|--------|-----|
| Pass Rate | >= 95% | >= 80% | < 80% |