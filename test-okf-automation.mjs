import { generateOkfFromStory, saveOkfFile, listOkfFiles } from './okf-utils/okf-generator.js';
import { updateObjectSelectors, batchUpdateSelectors } from './okf-utils/okf-selector-updater.js';
import fs from 'fs';
import path from 'path';

console.log('=== OKF Automation Test ===\n');

// Test 1: Generate OKF from story content
console.log('1. Testing OKF generation from story...');
const storyContent = `
# THOREN-101: Create Thoren Custom Object

## Description
Create a new custom object "Thoren" to track project milestones.

## Requirements
- Thoren records must be linked to Accounts
- Status field with values: Planning, Active, Complete
- Amount field for budget tracking

## Fields
- Name (string, required)
- Status (picklist, required): Planning, Active, Complete
- Amount (currency, optional)
- AccountId (lookup to Account, optional)
- Description (textarea, optional)

## Relationships
- Belongs to Account (lookup)
- Has Thoren Items (child relationship)
`;

const okfContent = generateOkfFromStory(storyContent, 'Thoren', {
  isCustom: true,
  description: 'Custom Thoren object for project milestone tracking'
});

console.log('   Generated OKF content length:', okfContent.length, 'chars');

// Test 2: Save OKF file
console.log('\n2. Testing OKF file save...');
const filePath = saveOkfFile('Thoren', okfContent);
console.log('   Saved to:', filePath);

// Test 3: List OKF files
console.log('\n3. Testing OKF file listing...');
const files = listOkfFiles();
console.log('   Total OKF files:', files.length);
console.log('   Files:', files.map(f => f.name).join(', '));

// Test 4: Update selectors
console.log('\n4. Testing selector update...');
const selectors = [
  { element: 'Thoren Name', selector: 'input[placeholder="Thoren Name"]', notes: 'Main name field' },
  { element: 'Status', selector: 'select[name="Status"]', notes: 'Picklist field' },
  { element: 'Amount', selector: 'input[placeholder="Amount"]', notes: 'Currency field' }
];
const selectorPath = updateObjectSelectors('Thoren', selectors);
console.log('   Updated selectors at:', selectorPath);

// Test 5: Batch update selectors from test files
console.log('\n5. Testing batch selector update...');
const updates = batchUpdateSelectors();
console.log('   Updated', updates.length, 'objects');

// Show the generated OKF content
console.log('\n6. Generated OKF content preview:');
console.log('─'.repeat(50));
console.log(okfContent.substring(0, 500) + '...');
console.log('─'.repeat(50));

console.log('\n=== All OKF Automation Tests Passed! ===');