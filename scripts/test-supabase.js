#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(path.dirname(__dirname), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim().replace(/"/g, '');
  }
});

const supabaseUrl = envVars.SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? '✅ Present' : '❌ Missing');
console.log('');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('📡 Testing basic connection...');
    
    // Test 1: Basic connection
    const { data: testData, error: testError } = await supabase
      .from('videos')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection failed:', testError);
      return;
    }
    
    console.log('✅ Basic connection successful');
    
    // Test 2: Get videos
    console.log('\n📹 Testing videos table...');
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('*')
      .eq('is_active', true)
      .limit(5);
    
    if (videosError) {
      console.error('❌ Videos query failed:', videosError);
      return;
    }
    
    console.log(`✅ Found ${videos.length} videos`);
    videos.forEach(video => {
      console.log(`  - ${video.title} (${video.category})`);
    });
    
    // Test 3: Get series
    console.log('\n📺 Testing series table...');
    const { data: series, error: seriesError } = await supabase
      .from('series')
      .select('*')
      .eq('is_active', true)
      .limit(5);
    
    if (seriesError) {
      console.error('❌ Series query failed:', seriesError);
      return;
    }
    
    console.log(`✅ Found ${series.length} series`);
    series.forEach(s => {
      console.log(`  - ${s.title} (${s.category})`);
    });
    
    console.log('\n🎉 All tests passed! Supabase connection is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConnection();
