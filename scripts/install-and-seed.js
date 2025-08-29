#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 SAANSE Platform - Complete Setup Script');
console.log('==========================================\n');

// Step 1: Install dependencies
console.log('📦 Step 1: Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Step 2: Check environment variables
console.log('🔧 Step 2: Checking environment variables...');
const envPath = path.join(process.cwd(), '.env');
const envExample = `# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key

# Server-side Supabase (for database operations)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Configuration (if using separate database)
DATABASE_URL=postgresql://username:password@host:port/database

# Server Configuration
PORT=3000
NODE_ENV=development
`;

if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found. Creating template...');
  fs.writeFileSync(envPath, envExample);
  console.log('📝 Created .env template. Please update with your Supabase credentials.\n');
  console.log('🔑 You need to:');
  console.log('   1. Go to https://supabase.com');
  console.log('   2. Create a new project');
  console.log('   3. Get your project URL and API keys');
  console.log('   4. Update the .env file with your credentials\n');
  console.log('⏸️  Please update your .env file and run this script again.');
  process.exit(0);
}

// Step 3: Check if Supabase credentials are configured
console.log('🔍 Step 3: Validating Supabase configuration...');
const envContent = fs.readFileSync(envPath, 'utf8');
const hasValidConfig = envContent.includes('your-project.supabase.co') === false;

if (!hasValidConfig) {
  console.log('❌ Supabase credentials not configured properly.');
  console.log('Please update your .env file with actual Supabase credentials.\n');
  process.exit(1);
}

console.log('✅ Supabase configuration looks good\n');

// Step 4: Push database schema
console.log('🗄️  Step 4: Setting up database schema...');
try {
  execSync('npm run db:push', { stdio: 'inherit' });
  console.log('✅ Database schema pushed successfully\n');
} catch (error) {
  console.error('❌ Failed to push database schema:', error.message);
  console.log('💡 Make sure your Supabase project is created and credentials are correct.\n');
  process.exit(1);
}

// Step 5: Seed database with content
console.log('🌱 Step 5: Seeding database with content...');
try {
  execSync('npm run db:seed', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully\n');
} catch (error) {
  console.error('❌ Failed to seed database:', error.message);
  process.exit(1);
}

// Step 6: Create database functions
console.log('⚙️  Step 6: Setting up database functions...');
console.log('📋 Please run these SQL commands in your Supabase SQL editor:\n');

const sqlCommands = `-- Function to increment video views
CREATE OR REPLACE FUNCTION increment_video_views(video_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE videos 
  SET views = views + 1 
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment video likes
CREATE OR REPLACE FUNCTION increment_video_likes(video_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE videos 
  SET likes = likes + 1 
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE view_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for videos" ON videos
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access for series" ON series
  FOR SELECT USING (is_active = true);

-- Create policies for authenticated users
CREATE POLICY "Users can manage their own playlists" ON playlists
  FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage their own view history" ON view_history
  FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage their own profile" ON users
  FOR ALL USING (auth.uid()::text = supabase_uid);
`;

console.log(sqlCommands);
console.log('📝 Copy and paste the above SQL commands into your Supabase SQL editor.\n');

// Step 7: Final setup instructions
console.log('🎉 Setup completed successfully!\n');
console.log('🚀 Next steps:');
console.log('   1. Run the SQL commands above in your Supabase dashboard');
console.log('   2. Configure Google OAuth in Supabase Authentication settings');
console.log('   3. Set redirect URL to: https://your-domain.com/auth/callback');
console.log('   4. Start the development server: npm run dev\n');

console.log('📚 Useful commands:');
console.log('   npm run dev          # Start development server');
console.log('   npm run build        # Build for production');
console.log('   npm run db:seed      # Re-seed database');
console.log('   npm run check        # Type checking\n');

console.log('🔗 Resources:');
console.log('   - Supabase Dashboard: https://app.supabase.com');
console.log('   - Documentation: https://supabase.com/docs');
console.log('   - Migration Guide: README-SUPABASE-SETUP.md\n');

console.log('✨ Your SAANSE platform is ready to use!');
