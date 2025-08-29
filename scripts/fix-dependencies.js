#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Fixing Supabase Dependencies...\n');

// Check if package.json exists
const packageJsonPath = path.join(path.dirname(__dirname), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Check if @supabase/supabase-js is already installed
const hasSupabase = packageJson.dependencies && packageJson.dependencies['@supabase/supabase-js'];

if (hasSupabase) {
  console.log('✅ @supabase/supabase-js is already installed.');
} else {
  console.log('📦 Installing @supabase/supabase-js...');
  try {
    execSync('npm install @supabase/supabase-js', { stdio: 'inherit' });
    console.log('✅ @supabase/supabase-js installed successfully.\n');
  } catch (error) {
    console.error('❌ Failed to install @supabase/supabase-js:', error.message);
    process.exit(1);
  }
}

// Check if zod is installed (needed for schema validation)
const hasZod = packageJson.dependencies && packageJson.dependencies['zod'];

if (hasZod) {
  console.log('✅ zod is already installed.');
} else {
  console.log('📦 Installing zod...');
  try {
    execSync('npm install zod', { stdio: 'inherit' });
    console.log('✅ zod installed successfully.\n');
  } catch (error) {
    console.error('❌ Failed to install zod:', error.message);
    process.exit(1);
  }
}

// Check if tsx is installed (needed for running TypeScript files)
const hasTsx = packageJson.dependencies && packageJson.dependencies['tsx'];

if (hasTsx) {
  console.log('✅ tsx is already installed.');
} else {
  console.log('📦 Installing tsx...');
  try {
    execSync('npm install tsx', { stdio: 'inherit' });
    console.log('✅ tsx installed successfully.\n');
  } catch (error) {
    console.error('❌ Failed to install tsx:', error.message);
    process.exit(1);
  }
}

console.log('🎉 All dependencies are now installed!');
console.log('\n📝 Next steps:');
console.log('   1. Create your .env file with Supabase credentials');
console.log('   2. Run: npm run db:push');
console.log('   3. Run: npm run db:seed:enhanced');
console.log('   4. Run: npm run dev');
console.log('\n✨ Your SAANSE platform should now work without linter errors!');
