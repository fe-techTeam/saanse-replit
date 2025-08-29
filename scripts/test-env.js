#!/usr/bin/env node

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Testing Environment Variables...\n');

// Test 1: Direct process.env
console.log('📋 Process.env variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Present' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Present' : '❌ Missing');
console.log('');

// Test 2: Load from .env file
const envPath = path.join(path.dirname(__dirname), '.env');
console.log('📁 .env file path:', envPath);
console.log('📁 .env file exists:', fs.existsSync(envPath) ? '✅ Yes' : '❌ No');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim().replace(/"/g, '');
    }
  });
  
  console.log('\n📋 .env file variables:');
  console.log('SUPABASE_URL:', envVars.SUPABASE_URL ? '✅ Present' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', envVars.SUPABASE_SERVICE_ROLE_KEY ? '✅ Present' : '❌ Missing');
  console.log('');
  
  // Test 3: Create Supabase client with .env variables
  if (envVars.SUPABASE_URL && envVars.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('🔧 Testing Supabase client with .env variables...');
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(envVars.SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);
    
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('❌ Supabase test failed:', error);
      } else {
        console.log('✅ Supabase client with .env variables works!');
      }
    } catch (err) {
      console.error('❌ Supabase test failed:', err);
    }
  }
}
