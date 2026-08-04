import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const MEMORY_PATH = path.join(process.cwd(), 'memory');
const OKF_PATH = path.join(process.cwd(), 'okf');

export function enrichFromMemory() {
  const conversions = {
    'framework-memory.md': 'patterns/framework-rules.md',
    'sf-selectors.md': 'selectors/lightning-selectors.md',
    'pom-patterns.md': 'patterns/page-objects.md',
    'agent-context.md': 'agents/context.md',
  };

  for (const [source, target] of Object.entries(conversions)) {
    const sourcePath = path.join(MEMORY_PATH, source);
    const targetPath = path.join(OKF_PATH, target);

    if (fs.existsSync(sourcePath)) {
      const content = fs.readFileSync(sourcePath, 'utf8');
      const frontmatter = {
        type: 'Framework Pattern',
        title: path.basename(target, '.md').replace(/-/g, ' '),
        tags: ['memory', 'enriched'],
        status: 'stable',
        generated: { by: 'forcemind-enricher', at: new Date().toISOString() },
      };

      const enriched = matter.stringify(content, frontmatter);
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.writeFileSync(targetPath, enriched);
      console.log(`Enriched: ${source} → ${target}`);
    }
  }
}

export function enrichFromSpecs() {
  const specsDir = path.join(process.cwd(), 'specs');
  const testsDir = path.join(OKF_PATH, 'tests');

  if (fs.existsSync(specsDir)) {
    for (const file of fs.readdirSync(specsDir)) {
      if (file.endsWith('.md')) {
        const content = fs.readFileSync(path.join(specsDir, file), 'utf8');
        const frontmatter = {
          type: 'Test Plan',
          title: file.replace('.md', '').replace(/-/g, ' '),
          tags: ['spec', 'enriched'],
          status: 'stable',
          generated: { by: 'forcemind-enricher', at: new Date().toISOString() },
        };

        const enriched = matter.stringify(content, frontmatter);
        fs.writeFileSync(path.join(testsDir, file), enriched);
        console.log(`Enriched: specs/${file} → tests/${file}`);
      }
    }
  }
}