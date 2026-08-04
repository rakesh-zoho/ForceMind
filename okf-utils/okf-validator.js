import { findConceptsByType, checkStaleness, buildGraph } from './okf-reader.js';

export function validateBundle() {
  const issues = [];

  // Check staleness
  const stale = checkStaleness();
  stale.forEach(c => issues.push({ type: 'stale', path: c.path, message: `Stale after ${c.stale_after}` }));

  // Check for missing required fields
  const allConcepts = [];
  const walk = (dir) => {
    const fs = await import('fs');
    const path = await import('path');
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.md') && entry.name !== 'index.md' && entry.name !== 'log.md') {
        allConcepts.push(fullPath);
      }
    }
  };

  // Check broken links
  const graph = buildGraph();
  graph.edges.forEach(edge => {
    if (!graph.nodes.find(n => n.id === edge.target)) {
      issues.push({ type: 'broken-link', path: edge.source, message: `Link to non-existent ${edge.target}` });
    }
  });

  return issues;
}