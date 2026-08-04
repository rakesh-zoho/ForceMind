import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

console.log('SF Agentic POM Framework - Setup');
console.log('================================\n');

// Check Node.js version
const nodeVersion = process.version;
const major = parseInt(nodeVersion.slice(1));
if (major < 20) {
  console.error(`Node.js 20+ required. Found: ${nodeVersion}`);
  process.exit(1);
}
console.log(`Node.js: ${nodeVersion}`);

// Check .env file
const envPath = path.join(root, '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n.env file not found. Copying from .env.example...');
  const envExample = path.join(root, '.env.example');
  if (fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envPath);
    console.log('Created .env from .env.example');
    console.log('IMPORTANT: Edit .env with your Salesforce credentials before running tests');
  } else {
    console.error('.env.example not found');
  }
} else {
  console.log('.env: found');
}

// Check reports directory
const reportsDir = path.join(root, 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
  console.log('Created reports/ directory');
}

// Check auth state
const authPath = path.join(root, 'reports', '.auth-state.json');
if (fs.existsSync(authPath)) {
  console.log('Auth state: found');
} else {
  console.log('Auth state: not found (will be created on first test run)');
}

console.log('\nSetup complete!');
console.log('\nNext steps:');
console.log('  1. Edit .env with your Salesforce credentials');
console.log('  2. Run: npm run agents:init');
console.log('  3. Run: npm test');
