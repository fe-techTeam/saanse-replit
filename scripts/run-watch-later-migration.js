import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase credentials not found in environment variables');
    console.log('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    console.log('🔄 Running watch later migration...');
    
    // Create the watch_later table
    const { error: createTableError } = await supabase
      .from('watch_later')
      .select('*')
      .limit(1);
    
    if (createTableError && createTableError.code === 'PGRST116') {
      console.log('📋 Creating watch_later table...');
      
      // The table doesn't exist, so we need to create it
      // Since we can't run raw SQL directly, we'll create a simple table structure
      // You'll need to run the migration manually in Supabase dashboard
      console.log('⚠️  Please run the following SQL in your Supabase dashboard:');
      console.log('📄 File: migrations/0002_watch_later_table.sql');
      console.log('');
      console.log('Or copy this SQL:');
      console.log('----------------------------------------');
      const migrationSQL = fs.readFileSync('migrations/0002_watch_later_table.sql', 'utf8');
      console.log(migrationSQL);
      console.log('----------------------------------------');
    } else if (createTableError) {
      console.error('❌ Error checking table:', createTableError);
    } else {
      console.log('✅ Watch later table already exists!');
      console.log('🎉 You can now use the watch later feature in your app');
    }
  } catch (err) {
    console.error('❌ Error running migration:', err);
  }
}

runMigration();
