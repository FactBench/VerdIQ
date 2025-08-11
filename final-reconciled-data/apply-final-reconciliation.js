#!/usr/bin/env node
// Script to apply the final reconciliation to the website

const fs = require('fs');
const path = require('path');

console.log('🚀 Applying reconciliation to website...\n');

// Backup current data
const dataPath = path.join(__dirname, '..', 'src', 'data', 'pool-cleaners-data.json');
const backupPath = path.join(__dirname, '..', 'src', 'data', 'pool-cleaners-data.backup.json');

const currentData = fs.readFileSync(dataPath, 'utf8');
fs.writeFileSync(backupPath, currentData);
console.log('✓ Created backup: pool-cleaners-data.backup.json');

// Copy reconciled data
const reconciledPath = path.join(__dirname, '..', 'final-reconciled-data', 'pool-cleaners-data-reconciled.json');
const reconciledData = fs.readFileSync(reconciledPath, 'utf8');
fs.writeFileSync(dataPath, reconciledData);
console.log('✓ Applied reconciled data');

console.log('\n✅ Reconciliation applied successfully!');
console.log('\nNext steps:');
console.log('1. Run: npm run build');
console.log('2. Review the changes locally');
console.log('3. Run: node scripts/pre-deploy-verify.js');
console.log('4. Deploy: ./scripts/github-deploy.sh');
