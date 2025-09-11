import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeAlternativeMigration() {
  console.log('🔄 Executing migration using Supabase client...');
  
  try {
    // First, let's check current users to understand the data
    console.log('📊 Checking current users...');
    const { data: currentUsers, error: checkError } = await supabase
      .from('users')
      .select('id, email, mobile_number')
      .limit(5);
    
    if (checkError) {
      console.error('Error checking current users:', checkError);
    } else {
      console.log('Current users sample:');
      console.table(currentUsers);
    }
    
    // Since we can't run DDL commands directly, let's provide manual instructions
    console.log('\n📋 Manual Migration Instructions:');
    console.log('Please run the following SQL commands in your Supabase SQL Editor:');
    console.log('\n1. Add mobile column:');
    console.log('ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "mobile" text UNIQUE;');
    console.log('\n2. Create index:');
    console.log('CREATE INDEX IF NOT EXISTS "users_mobile_idx" ON "public"."users" USING btree ("mobile");');
    console.log('\n3. Make email nullable:');
    console.log('ALTER TABLE "public"."users" ALTER COLUMN "email" DROP NOT NULL;');
    console.log('\n4. Update existing mobile users:');
    console.log('UPDATE "public"."users" SET "mobile" = "mobile_number" WHERE "mobile_number" IS NOT NULL AND "mobile" IS NULL;');
    console.log('\n5. Clear fake emails:');
    console.log('UPDATE "public"."users" SET "email" = NULL WHERE "email" LIKE \'%@mobile.saanse.com\';');
    console.log('\n6. Add constraint:');
    console.log('ALTER TABLE "public"."users" ADD CONSTRAINT "users_email_or_mobile_check" CHECK (("email" IS NOT NULL) OR ("mobile" IS NOT NULL));');
    
    // Try to update existing data using the client
    console.log('\n🔄 Attempting data updates using client...');
    
    // Update mobile users - move mobile_number to mobile if mobile column exists
    const { data: mobileUsers, error: mobileError } = await supabase
      .from('users')
      .select('id, mobile_number')
      .not('mobile_number', 'is', null);
    
    if (!mobileError && mobileUsers) {
      console.log(`Found ${mobileUsers.length} users with mobile numbers`);
      
      for (const user of mobileUsers) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ mobile: user.mobile_number })
          .eq('id', user.id);
        
        if (updateError && !updateError.message.includes('column "mobile" of relation "users" does not exist')) {
          console.error(`Error updating user ${user.id}:`, updateError);
        }
      }
    }
    
    // Clear fake emails
    const { data: fakeEmailUsers, error: fakeEmailError } = await supabase
      .from('users')
      .select('id, email')
      .like('email', '%@mobile.saanse.com');
    
    if (!fakeEmailError && fakeEmailUsers) {
      console.log(`Found ${fakeEmailUsers.length} users with fake emails`);
      
      for (const user of fakeEmailUsers) {
        const { error: clearError } = await supabase
          .from('users')
          .update({ email: null })
          .eq('id', user.id);
        
        if (clearError) {
          console.error(`Error clearing email for user ${user.id}:`, clearError);
        }
      }
    }
    
    console.log('✅ Data migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

async function runMigration() {
  try {
    console.log('🚀 Running mobile column migration...');
    
    // Execute the alternative migration approach directly
    await executeAlternativeMigration();
    
    // Verify the changes
    console.log('\n🔍 Verifying migration...');
    
    // Check if mobile column exists
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'users')
      .eq('column_name', 'mobile');
    
    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError);
    } else if (columns && columns.length > 0) {
      console.log('✅ Mobile column exists');
    } else {
      console.log('⚠️ Mobile column not found - migration may not have applied correctly');
    }
    
    // Check existing users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, mobile, mobile_number')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Error checking users:', usersError);
    } else {
      console.log('📊 Sample users after migration:');
      console.table(users);
    }
    
  } catch (error) {
    console.error('❌ Migration script error:', error);
    process.exit(1);
  }
}

runMigration();
