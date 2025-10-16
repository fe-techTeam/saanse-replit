import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testVideoCreation() {
  console.log('=== TESTING VIDEO CREATION ===');
  
  try {
    // Step 1: Get admin credentials
    console.log('\n1. Getting admin credentials...');
    
    // First, let's check if there are any admin users
    const { data: admins, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('is_active', true);
    
    if (adminError) {
      console.error('Error fetching admins:', adminError);
      return;
    }
    
    if (admins.length === 0) {
      console.log('No admin users found. Creating one...');
      
      // Create a test admin user
      const { data: newAdmin, error: createError } = await supabase
        .from('admin_users')
        .insert({
          email: 'admin@test.com',
          display_name: 'Test Admin',
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating admin:', createError);
        return;
      }
      
      console.log('Created admin user:', newAdmin);
      admins.push(newAdmin);
    }
    
    const admin = admins[0];
    console.log('Using admin:', admin.email);
    
    // Step 2: Get series for testing
    console.log('\n2. Getting series for testing...');
    const { data: series, error: seriesError } = await supabase
      .from('series')
      .select('id, title, total_episodes')
      .eq('is_active', true)
      .limit(1);
    
    if (seriesError) {
      console.error('Error fetching series:', seriesError);
      return;
    }
    
    if (series.length === 0) {
      console.log('No series found. Creating one...');
      
      const { data: newSeries, error: createSeriesError } = await supabase
        .from('series')
        .insert({
          title: 'Test Series',
          slug: 'test-series',
          description: 'Test series for video creation',
          thumbnail_url: 'https://example.com/thumb.jpg',
          status: 'published',
          total_episodes: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createSeriesError) {
        console.error('Error creating series:', createSeriesError);
        return;
      }
      
      console.log('Created series:', newSeries);
      series.push(newSeries);
    }
    
    const testSeries = series[0];
    console.log('Using series:', testSeries.title);
    
    // Step 3: Test video creation via API
    console.log('\n3. Testing video creation via API...');
    
    const adminId = admin.id;
    const adminToken = `admin-token-${adminId}`;
    
    const videoData = {
      title: "Test Video Creation",
      description: "Testing video creation with series assignment",
      category: "Ramayana",
      duration: 120,
      thumbnailUrl: "https://example.com/thumb.jpg",
      videoUrl: "https://example.com/video.mp4",
      tags: ["test", "creation"],
      isActive: true,
      content_type: "series",
      seriesId: testSeries.id,
      episodeNumber: 1
    };
    
    console.log('Sending video data:', videoData);
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': adminId,
          'x-admin-token': adminToken
        },
        body: JSON.stringify(videoData)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Response body:', responseText);
      
      if (response.ok) {
        const video = JSON.parse(responseText);
        console.log('✅ Video created successfully:', video);
        
        // Step 4: Verify the video was created in database
        console.log('\n4. Verifying video in database...');
        const { data: createdVideo, error: fetchError } = await supabase
          .from('videos')
          .select('*')
          .eq('id', video.id)
          .single();
        
        if (fetchError) {
          console.error('Error fetching created video:', fetchError);
        } else {
          console.log('✅ Video found in database:', createdVideo);
          
          // Check if series episode count was updated
          const { data: updatedSeries, error: seriesUpdateError } = await supabase
            .from('series')
            .select('total_episodes')
            .eq('id', testSeries.id)
            .single();
          
          if (seriesUpdateError) {
            console.error('Error fetching updated series:', seriesUpdateError);
          } else {
            console.log('✅ Series episode count updated:', updatedSeries.total_episodes);
          }
        }
        
        // Clean up - delete the test video
        console.log('\n5. Cleaning up test video...');
        const { error: deleteError } = await supabase
          .from('videos')
          .update({ is_active: false })
          .eq('id', video.id);
        
        if (deleteError) {
          console.error('Error deleting test video:', deleteError);
        } else {
          console.log('✅ Test video cleaned up');
        }
        
      } else {
        console.log('❌ Video creation failed');
        console.log('Error response:', responseText);
      }
      
    } catch (fetchError) {
      console.error('❌ API request failed:', fetchError);
    }
    
    console.log('\n=== TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testVideoCreation().catch(console.error);
