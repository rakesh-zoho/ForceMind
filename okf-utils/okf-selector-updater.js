import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const OKF_PATH = path.join(process.cwd(), 'okf');

/**
 * Update selectors for a Salesforce object
 * @param {string} objectName - Object name (e.g., "Thoren")
 * @param {Array} selectors - Array of {element, selector, notes}
 */
export function updateObjectSelectors(objectName, selectors) {
  const selectorPath = path.join(OKF_PATH, 'selectors', 'lightning-selectors.md');
  
  if (!fs.existsSync(selectorPath)) {
    throw new Error('Selector file not found');
  }
  
  const content = fs.readFileSync(selectorPath, 'utf8');
  const { data: frontmatter, content: body } = matter(content);
  
  // Check if object section exists
  const objectSection = `# ${objectName} Object`;
  const sectionRegex = new RegExp(`# ${objectName} Object[\\s\\S]*?(?=# \\w+ Object|$)`, 'i');
  
  const newSection = `${objectSection}

| Element | Selector |
|---------|----------|
${selectors.map(s => `| ${s.element} | \`${s.selector}\` |`).join('\n')}
${selectors.some(s => s.notes) ? '\n**Notes:**\n' + selectors.filter(s => s.notes).map(s => `- ${s.element}: ${s.notes}`).join('\n') : ''}
`;
  
  let updatedBody;
  if (sectionRegex.test(body)) {
    // Replace existing section
    updatedBody = body.replace(sectionRegex, newSection);
  } else {
    // Add new section before "# See Also"
    const seeAlsoIndex = body.indexOf('# See Also');
    if (seeAlsoIndex > -1) {
      updatedBody = body.slice(0, seeAlsoIndex) + newSection + '\n' + body.slice(seeAlsoIndex);
    } else {
      updatedBody = body + '\n\n' + newSection;
    }
  }
  
  const updated = matter.stringify(updatedBody, frontmatter);
  fs.writeFileSync(selectorPath, updated, 'utf8');
  
  return selectorPath;
}

/**
 * Parse selectors from test file
 */
export function parseSelectorsFromTestFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  
  const content = fs.readFileSync(filePath, 'utf8');
  const selectors = [];
  
  // Match common selector patterns
  const patterns = [
    /locator\(['"](.+?)['"]\)/g,
    /getByText\(['"](.+?)['"]\)/g,
    /getByRole\(['"](.+?)['"]\)/g,
    /getByPlaceholder\(['"](.+?)['"]\)/g,
    /getByLabel\(['"](.+?)['"]\)/g,
    /css:([^\s"']+)/g,
    /xpath:([^\s"']+)/g
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      selectors.push({
        selector: match[0],
        type: pattern.source.includes('locator') ? 'locator' : 
              pattern.source.includes('ByRole') ? 'role' :
              pattern.source.includes('ByText') ? 'text' :
              pattern.source.includes('ByPlaceholder') ? 'placeholder' :
              pattern.source.includes('ByLabel') ? 'label' : 'css'
      });
    }
  }
  
  return selectors;
}

/**
 * Extract selectors from Playwright test code
 */
export function extractSelectorsFromCode(code) {
  const selectors = [];
  
  // Pattern: input[placeholder="..."]
  const placeholderPattern = /input\[placeholder=["'](.+?)["']\]/g;
  let match;
  while ((match = placeholderPattern.exec(code)) !== null) {
    selectors.push({
      element: match[1],
      selector: match[0],
      type: 'placeholder'
    });
  }
  
  // Pattern: [title="..."]
  const titlePattern = /\[title=["'](.+?)["']\]/g;
  while ((match = titlePattern.exec(code)) !== null) {
    selectors.push({
      element: match[1],
      selector: match[0],
      type: 'title'
    });
  }
  
  // Pattern: .class-name
  const classPattern = /\.([a-zA-Z][\w-]*)/g;
  while ((match = classPattern.exec(code)) !== null) {
    if (!match[1].startsWith('test')) { // Skip test-specific classes
      selectors.push({
        element: match[1],
        selector: match[0],
        type: 'class'
      });
    }
  }
  
  // Pattern: button[name="..."]
  const buttonPattern = /button\[name=["'](.+?)["']\]/g;
  while ((match = buttonPattern.exec(code)) !== null) {
    selectors.push({
      element: match[1],
      selector: match[0],
      type: 'button'
    });
  }
  
  return selectors;
}

/**
 * Generate selector documentation from test files
 */
export function generateSelectorDocs(objectName, testFiles) {
  const allSelectors = [];
  
  for (const file of testFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const selectors = extractSelectorsFromCode(content);
      allSelectors.push(...selectors);
    }
  }
  
  // Deduplicate
  const unique = [...new Map(allSelectors.map(s => [s.selector, s])).values()];
  
  return {
    object: objectName,
    selectors: unique,
    generated: new Date().toISOString()
  };
}

/**
 * Batch update selectors from all test files
 */
export function batchUpdateSelectors() {
  const testsDir = path.join(process.cwd(), 'tests');
  if (!fs.existsSync(testsDir)) return [];
  
  const updates = [];
  const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.spec.js'));
  
  for (const file of testFiles) {
    const objectName = file.replace('.spec.js', '').replace('-creation', '').replace('-', ' ');
    const filePath = path.join(testsDir, file);
    const docs = generateSelectorDocs(objectName, [filePath]);
    
    if (docs.selectors.length > 0) {
      updateObjectSelectors(objectName, docs.selectors);
      updates.push({ object: objectName, count: docs.selectors.length });
    }
  }
  
  return updates;
}