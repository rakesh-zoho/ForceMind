import { buildGraph, readConcept, checkStaleness } from './okf-utils/okf-reader.js';

console.log('=== OKF API Test ===\n');

// Test buildGraph
console.log('1. Testing buildGraph()...');
const graph = buildGraph();
console.log(`   Nodes: ${graph.nodes.length}`);
console.log(`   Edges: ${graph.edges.length}`);
console.log('   Sample nodes:');
graph.nodes.slice(0, 5).forEach(n => console.log(`     - ${n.title} (${n.type})`));

// Test readConcept
console.log('\n2. Testing readConcept(salesforce/lead)...');
const lead = readConcept('salesforce/lead');
console.log(`   Title: ${lead.frontmatter.title}`);
console.log(`   Type: ${lead.frontmatter.type}`);
console.log(`   Status: ${lead.frontmatter.status}`);

// Test checkStaleness
console.log('\n3. Testing checkStaleness()...');
const stale = checkStaleness();
console.log(`   Stale concepts: ${stale.length}`);

console.log('\n=== All OKF APIs working! ===');