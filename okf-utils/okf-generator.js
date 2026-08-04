import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const OKF_PATH = path.join(process.cwd(), 'okf');
const TASKS_PATH = path.join(process.cwd(), 'tasks');

/**
 * Generate OKF knowledge file from JIRA story/task
 * @param {string} storyContent - JIRA story content or task file content
 * @param {string} objectName - Salesforce object name (e.g., "Thoren")
 * @param {object} options - Additional options
 */
export function generateOkfFromStory(storyContent, objectName, options = {}) {
  const {
    description = '',
    fields = [],
    relationships = [],
    isCustom = false,
    namespace = ''
  } = options;

  // Parse fields from story content if not provided
  const parsedFields = fields.length > 0 ? fields : parseFieldsFromStory(storyContent);
  
  // Parse relationships from story content
  const parsedRelationships = relationships.length > 0 ? relationships : parseRelationshipsFromStory(storyContent);

  const frontmatter = {
    type: 'Salesforce Object',
    title: objectName,
    description: description || `Custom ${objectName} object`,
    tags: ['salesforce', isCustom ? 'custom-object' : 'standard-object', objectName.toLowerCase()],
    status: 'draft',
    generated: { 
      by: 'forcemind/2.0', 
      at: new Date().toISOString() 
    },
    sources: [{
      id: 'jira-story',
      title: 'JIRA Story',
      generated_from: 'jira'
    }]
  };

  const body = `# Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
${parsedFields.map(f => `| ${f.name} | ${f.type} | ${f.required ? 'Yes' : 'No'} | ${f.description} |`).join('\n')}

# Relationships

${parsedRelationships.map(r => `- ${r.description}`).join('\n') || '- No relationships defined'}

# Selectors

See [Lightning Selectors](/selectors/lightning-selectors.md#${objectName.toLowerCase()})

# Test Coverage

- [${objectName} Creation](/tests/${objectName.toLowerCase()}-creation.md) — TBD

# Known Issues

- Review picklist values after implementation
- Verify field labels match UI`;

  return matter.stringify(body, frontmatter);
}

/**
 * Parse fields from JIRA story content
 */
function parseFieldsFromStory(content) {
  const fields = [];
  const lines = content.split('\n');
  
  let inFieldsSection = false;
  for (const line of lines) {
    if (line.toLowerCase().includes('fields:') || line.toLowerCase().includes('required fields:')) {
      inFieldsSection = true;
      continue;
    }
    
    if (inFieldsSection) {
      // Match patterns like "Field Name (Type)" or "- Field Name"
      const fieldMatch = line.match(/[-*]?\s*(\w+)\s*\((\w+)\)/);
      if (fieldMatch) {
        fields.push({
          name: fieldMatch[1],
          type: fieldMatch[2],
          required: line.toLowerCase().includes('required'),
          description: ''
        });
      } else if (line.trim() === '' || line.startsWith('#')) {
        inFieldsSection = false;
      }
    }
  }
  
  // Add default fields if none found
  if (fields.length === 0) {
    fields.push(
      { name: 'Name', type: 'string', required: true, description: 'Record name' },
      { name: 'Status', type: 'picklist', required: true, description: 'Record status' }
    );
  }
  
  return fields;
}

/**
 * Parse relationships from JIRA story content
 */
function parseRelationshipsFromStory(content) {
  const relationships = [];
  const lines = content.split('\n');
  
  let inRelSection = false;
  for (const line of lines) {
    if (line.toLowerCase().includes('relationships:') || line.toLowerCase().includes('related objects:')) {
      inRelSection = true;
      continue;
    }
    
    if (inRelSection) {
      const relMatch = line.match(/[-*]\s*(.+)/);
      if (relMatch && !line.startsWith('#')) {
        relationships.push({ description: relMatch[1] });
      } else if (line.trim() === '' || line.startsWith('#')) {
        inRelSection = false;
      }
    }
  }
  
  return relationships;
}

/**
 * Generate OKF from JIRA issue data
 */
export function generateOkfFromJiraIssue(issue, objectName) {
  const description = issue.description || issue.summary || '';
  const content = `
# ${issue.key}: ${issue.summary}

## Description
${description}

## Requirements
${issue.requirements || 'See description above'}

## Fields
${issue.fields || 'To be determined during implementation'}
`;
  
  return generateOkfFromStory(content, objectName, {
    description: issue.summary,
    isCustom: true
  });
}

/**
 * Save OKF file
 */
export function saveOkfFile(objectName, content) {
  const fileName = objectName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.md';
  const filePath = path.join(OKF_PATH, 'salesforce', fileName);
  
  // Ensure directory exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

/**
 * Update existing OKF file
 */
export function updateOkfFile(objectName, updates) {
  const fileName = objectName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.md';
  const filePath = path.join(OKF_PATH, 'salesforce', fileName);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`OKF file not found: ${fileName}`);
  }
  
  const existing = fs.readFileSync(filePath, 'utf8');
  const { data: frontmatter, content } = matter(existing);
  
  // Merge updates
  const updatedFrontmatter = { ...frontmatter, ...updates.frontmatter };
  const updatedContent = updates.body || content;
  
  const updated = matter.stringify(updatedContent, updatedFrontmatter);
  fs.writeFileSync(filePath, updated, 'utf8');
  
  return filePath;
}

/**
 * List all OKF files
 */
export function listOkfFiles() {
  const salesforceDir = path.join(OKF_PATH, 'salesforce');
  if (!fs.existsSync(salesforceDir)) return [];
  
  return fs.readdirSync(salesforceDir)
    .filter(f => f.endsWith('.md') && f !== 'index.md')
    .map(f => ({
      name: f.replace('.md', ''),
      path: `salesforce/${f.replace('.md', '')}`
    }));
}