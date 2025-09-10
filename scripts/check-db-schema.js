import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('🔍 Checking Database Schema...\n');
  
  try {
    // Check if users table exists and its structure
    console.log('👥 Users table structure:');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Error accessing users table:', usersError.message);
      
      // Try to get table structure from information_schema
      console.log('\n📊 Checking if users table exists...');
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_table_columns', { table_name: 'users' })
        .single();
        
      if (tableError) {
        console.log('❌ Users table might not exist yet');
        console.log('Creating users table...');
        
        // Try to create the table
        const { error: createError } = await supabase.rpc('sql', {
          query: `
            CREATE TABLE IF NOT EXISTS users (
              id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
              email TEXT NOT NULL UNIQUE,
              display_name TEXT,
              photo_url TEXT,
              supabase_uid TEXT NOT NULL UNIQUE,
              created_at TIMESTAMP DEFAULT NOW() NOT NULL
            );
          `
        });
        
        if (createError) {
          console.error('❌ Failed to create users table:', createError);
        } else {
          console.log('✅ Users table created successfully');
        }
      }
    } else {
      console.log('✅ Users table accessible');
      if (usersData && usersData.length > 0) {
        console.log('Sample user record:', usersData[0]);
      }
    }
    
    // Check videos table
    console.log('\n📹 Videos table:');
    const { data: videosData, error: videosError } = await supabase
      .from('videos')
      .select('id, title')
      .limit(1);
    
    if (videosError) {
      console.error('❌ Error accessing videos table:', videosError.message);
    } else {
      console.log(`✅ Videos table accessible (${videosData?.length || 0} records)`);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkSchema();