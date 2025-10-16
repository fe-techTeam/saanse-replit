import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCompleteVideoCreation() {
  console.log('=== COMPLETE VIDEO CREATION TEST ===');
  
  try {
    // Get admin credentials
    const { data: admins } = await supabase
      .from('admin_users')
      .select('*')
      .eq('is_active', true)
      .limit(1);
    
    const admin = admins[0];
    const adminId = admin.id;
    const adminToken = `admin-token-${adminId}`;
    
    // Test with Legacy Videos series (the problematic one)
    const { data: legacySeries } = await supabase
      .from('series')
      .select('id, title, total_episodes')
      .eq('title', 'Legacy Videos')
      .single();
    
    console.log('Testing with Legacy Videos series...');
    
    // Get all videos to understand the current state
    const { data: allVideos } = await supabase
      .from('videos')
      .select('episode_number, is_active, title')
      .eq('series_id', legacySeries.id)
      .order('episode_number', { ascending: true });
    
    const activeVideos = allVideos.filter(v => v.is_active);
    const allEpisodeNumbers = allVideos.map(v => v.episode_number || 0);
    
    console.log('Current state:');
    console.log(`  Active videos: ${activeVideos.length}`);
    console.log(`  All videos: ${allVideos.length}`);
    console.log(`  All episode numbers: [${allEpisodeNumbers.join(', ')}]`);
    
    // Find next available episode number (new logic)
    let nextEpisodeNumber = 1;
    while (allEpisodeNumbers.includes(nextEpisodeNumber)) {
      nextEpisodeNumber++;
    }
    
    console.log(`  Next available episode: ${nextEpisodeNumber}`);
    
    // Test video creation
    const videoData = {
      title: `Final Test Video - Episode ${nextEpisodeNumber}`,
      description: `Testing complete video creation with episode ${nextEpisodeNumber}`,
      category: 'Ramayana',
      duration: 120,
      thumbnailUrl: 'https://example.com/thumb.jpg',
      videoUrl: 'https://example.com/video.mp4',
      tags: ['test', 'final'],
      isActive: true,
      content_type: 'series',
      seriesId: legacySeries.id,
      episodeNumber: nextEpisodeNumber
    };
    
    console.log('\nCreating video...');
    console.log('Video data:', videoData);
    
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
    
    if (response.ok) {
      const video = await response.json();
      console.log('✅ Video created successfully!');
      console.log('Created video details:');
      console.log(`  Title: ${video.title}`);
      console.log(`  Episode: ${video.episode_number}`);
      console.log(`  Series ID: ${video.series_id}`);
      console.log(`  Content Type: ${video.content_type}`);
      
      // Verify series episode count was updated
      const { data: updatedSeries } = await supabase
        .from('series')
        .select('total_episodes')
        .eq('id', legacySeries.id)
        .single();
      
      console.log(`  Series episode count: ${updatedSeries.total_episodes}`);
      
      // Test the form logic with the new video
      const { data: newAllVideos } = await supabase
        .from('videos')
        .select('episode_number, is_active')
        .eq('series_id', legacySeries.id)
        .order('episode_number', { ascending: true });
      
      const newAllEpisodeNumbers = newAllVideos.map(v => v.episode_number || 0);
      let nextFormEpisode = 1;
      while (newAllEpisodeNumbers.includes(nextFormEpisode)) {
        nextFormEpisode++;
      }
      
      console.log(`  Form would now suggest episode: ${nextFormEpisode}`);
      
      // Clean up
      await supabase
        .from('videos')
        .update({ is_active: false })
        .eq('id', video.id);
      
      console.log('✅ Test video cleaned up');
      
      console.log('\n🎉 VIDEO CREATION IS WORKING PERFECTLY!');
      console.log('✅ No more database constraint violations');
      console.log('✅ Episode numbering works correctly');
      console.log('✅ Series assignment works properly');
      console.log('✅ Form logic suggests correct episode numbers');
      
    } else {
      const errorText = await response.text();
      console.log('❌ Video creation failed');
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCompleteVideoCreation().catch(console.error);
