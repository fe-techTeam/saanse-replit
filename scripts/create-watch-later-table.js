import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function createWatchLaterTable() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase credentials not found');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔄 Creating watch_later table...');

    // First, let's try to create the table using a simple approach
    const { data, error } = await supabase
      .from('watch_later')
      .select('id')
      .limit(1);

    if (error && error.code === 'PGRST205') {
      console.log('📋 Table does not exist, creating it...');
      
      // Since we can't run raw SQL directly, we'll create a simple table structure
      // by trying to insert a test record and letting Supabase create the table
      const testRecord = {
        user_id: '00000000-0000-0000-0000-000000000000',
        video_id: '00000000-0000-0000-0000-000000000000',
        priority: 0,
        notes: 'test',
        is_watched: false,
        progress: 0
      };

      const { error: insertError } = await supabase
        .from('watch_later')
        .insert(testRecord);

      if (insertError) {
        console.log('⚠️  Could not create table automatically');
        console.log('📄 Please run this SQL in your Supabase dashboard:');
        console.log('');
        console.log('CREATE TABLE watch_later (');
        console.log('  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),');
        console.log('  user_id text NOT NULL,');
        console.log('  video_id text NOT NULL,');
        console.log('  added_at timestamp DEFAULT now() NOT NULL,');
        console.log('  priority integer DEFAULT 0 NOT NULL,');
        console.log('  notes text,');
        console.log('  is_watched boolean DEFAULT false NOT NULL,');
        console.log('  watched_at timestamp,');
        console.log('  progress numeric(10,6) DEFAULT 0 NOT NULL,');
        console.log('  CONSTRAINT user_video_unique UNIQUE(user_id, video_id)');
        console.log(');');
        console.log('');
        console.log('CREATE INDEX watch_later_user_id_idx ON watch_later (user_id);');
        console.log('CREATE INDEX watch_later_video_id_idx ON watch_later (video_id);');
        console.log('CREATE INDEX watch_later_added_at_idx ON watch_later (added_at);');
        console.log('CREATE INDEX watch_later_priority_idx ON watch_later (priority);');
        console.log('');
        console.log('ALTER TABLE watch_later ADD CONSTRAINT watch_later_user_id_fkey');
        console.log('  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;');
        console.log('');
        console.log('ALTER TABLE watch_later ADD CONSTRAINT watch_later_video_id_fkey');
        console.log('  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE;');
      } else {
        console.log('✅ Watch later table created successfully!');
        
        // Clean up the test record
        await supabase
          .from('watch_later')
          .delete()
          .eq('user_id', '00000000-0000-0000-0000-000000000000');
      }
    } else if (error) {
      console.error('❌ Error checking table:', error);
    } else {
      console.log('✅ Watch later table already exists!');
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

createWatchLaterTable();
