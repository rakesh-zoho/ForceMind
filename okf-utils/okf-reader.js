import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BUNDLE_PATH = path.join(process.cwd(), 'okf');

export function readConcept(conceptPath) {
  const filePath = path.join(BUNDLE_PATH, `${conceptPath}.md`);
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data: frontmatter, content } = matter(raw);
  return { path: conceptPath, frontmatter, body: content };
}

export function findConceptsByType(type) {
  const concepts = [];
  walkBundle(BUNDLE_PATH, (concept) => {
    if (concept.frontmatter.type === type) concepts.push(concept);
  });
  return concepts;
}

export function findConceptsByTag(tag) {
  const concepts = [];
  walkBundle(BUNDLE_PATH, (concept) => {
    if (concept.frontmatter.tags?.includes(tag)) concepts.push(concept);
  });
  return concepts;
}

export function buildGraph() {
  const nodes = [];
  const edges = [];
  walkBundle(BUNDLE_PATH, (concept) => {
    nodes.push({ id: concept.path, type: concept.frontmatter.type, title: concept.frontmatter.title });
    const links = concept.body.match(/\[.*?\]\((.*?)\)/g) || [];
    links.forEach(link => {
      const target = link.match(/\((.*?)\)/)[1];
      if (target.startsWith('/')) edges.push({ source: concept.path, target: target.slice(1) });
    });
  });
  return { nodes, edges };
}

export function checkStaleness() {
  const stale = [];
  const today = new Date().toISOString().split('T')[0];
  walkBundle(BUNDLE_PATH, (concept) => {
    if (concept.frontmatter.stale_after && concept.frontmatter.stale_after <= today) {
      stale.push({ path: concept.path, stale_after: concept.frontmatter.stale_after });
    }
  });
  return stale;
}

function walkBundle(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkBundle(fullPath, callback);
    } else if (entry.name.endsWith('.md') && entry.name !== 'index.md' && entry.name !== 'log.md') {
      const relativePath = path.relative(BUNDLE_PATH, fullPath).replace('.md', '').replace(/\\/g, '/');
      const concept = readConcept(relativePath);
      callback(concept);
    }
  }
}