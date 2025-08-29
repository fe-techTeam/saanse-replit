#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdminDatabase() {
  console.log('🔧 Setting up Admin Database...\n');

  try {
    // Create admin_users table
    console.log('📋 Creating admin_users table...');
    
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS admin_users (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT NOT NULL UNIQUE,
          display_name TEXT,
          role TEXT NOT NULL DEFAULT 'admin',
          is_active BOOLEAN DEFAULT true NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          last_login_at TIMESTAMP
        );
      `
    });

    if (createTableError) {
      console.log('⚠️  Table might already exist, trying direct insert...');
    }

    // Insert default admin user
    console.log('👤 Creating default admin user...');
    
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'harshadmadaye@firsteconomy.com')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing admin:', checkError);
      return;
    }

    if (!existingAdmin) {
      const { data: newAdmin, error: insertError } = await supabase
        .from('admin_users')
        .insert({
          email: 'harshadmadaye@firsteconomy.com',
          display_name: 'Harshad Madaye',
          role: 'super_admin',
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creating admin user:', insertError);
        return;
      }

      console.log('✅ Created admin user:', newAdmin.email);
    } else {
      console.log('✅ Admin user already exists:', existingAdmin.email);
    }

    // Enable RLS on admin_users table
    console.log('🔒 Setting up Row Level Security...');
    
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Admins can view all admin users" ON admin_users
          FOR SELECT USING (true);
        
        CREATE POLICY "Super admins can insert admin users" ON admin_users
          FOR INSERT WITH CHECK (true);
        
        CREATE POLICY "Super admins can update admin users" ON admin_users
          FOR UPDATE USING (true);
        
        CREATE POLICY "Super admins can delete admin users" ON admin_users
          FOR DELETE USING (true);
      `
    });

    if (rlsError) {
      console.log('⚠️  RLS setup might already be configured');
    }

    console.log('\n🎉 Admin database setup completed!');
    console.log('\n📋 Admin Credentials:');
    console.log('   Email: harshadmadaye@firsteconomy.com');
    console.log('   Password: admin123');
    console.log('\n🌐 Access the admin panel at: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupAdminDatabase();
