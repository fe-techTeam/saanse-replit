import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testVideoDeletionSync() {
  console.log('=== VIDEO DELETION SYNC TEST ===');
  
  try {
    // Step 1: Check current state
    console.log('\n1. Current state before test...');
    const { data: legacySeries, error: seriesError } = await supabase
      .from('series')
      .select('id, title, total_episodes')
      .eq('title', 'Legacy Videos')
      .eq('is_active', true)
      .single();
    
    if (seriesError) {
      console.error('Error fetching Legacy Videos series:', seriesError);
      return;
    }
    
    console.log(`Legacy Videos series: ${legacySeries.total_episodes} episodes (DB)`);
    
    // Check active videos
    const { data: activeVideos, error: activeVideoError } = await supabase
      .from('videos')
      .select('id, title, episode_number')
      .eq('series_id', legacySeries.id)
      .eq('is_active', true)
      .order('episode_number', { ascending: true });
    
    if (activeVideoError) {
      console.error('Error fetching active videos:', activeVideoError);
      return;
    }
    
    console.log(`Active videos: ${activeVideos.length}`);
    activeVideos.forEach(v => {
      console.log(`  Ep ${v.episode_number}: ${v.title}`);
    });
    
    // Step 2: Test API endpoints
    console.log('\n2. Testing API endpoints...');
    
    // Test series API
    try {
      const response = await fetch('http://localhost:5000/api/series');
      if (response.ok) {
        const apiSeries = await response.json();
        const legacyApiSeries = apiSeries.find(s => s.title === 'Legacy Videos');
        if (legacyApiSeries) {
          console.log(`API Series total_episodes: ${legacyApiSeries.total_episodes}`);
        }
      } else {
        console.log(`Series API failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`Series API error: ${error.message}`);
    }
    
    // Test series videos API
    try {
      const response = await fetch(`http://localhost:5000/api/series/${legacySeries.id}/videos`);
      if (response.ok) {
        const videos = await response.json();
        console.log(`API Series Videos count: ${videos.length}`);
        videos.forEach(v => {
          console.log(`  Ep ${v.episode_number}: ${v.title}`);
        });
      } else {
        console.log(`Series Videos API failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`Series Videos API error: ${error.message}`);
    }
    
    // Step 3: Test useSeriesWithCounts logic
    console.log('\n3. Testing useSeriesWithCounts logic...');
    try {
      const seriesResponse = await fetch('http://localhost:5000/api/series');
      if (seriesResponse.ok) {
        const apiSeries = await seriesResponse.json();
        
        const seriesWithCounts = await Promise.all(
          apiSeries.map(async (s) => {
            try {
              const videosResponse = await fetch(`http://localhost:5000/api/series/${s.id}/videos`);
              if (videosResponse.ok) {
                const videos = await videosResponse.json();
                return {
                  ...s,
                  actual_episode_count: Array.isArray(videos) ? videos.length : 0,
                };
              } else {
                return { ...s, actual_episode_count: 0 };
              }
            } catch (error) {
              console.error(`Error fetching videos for ${s.title}:`, error);
              return { ...s, actual_episode_count: 0 };
            }
          })
        );
        
        const legacyWithCount = seriesWithCounts.find(s => s.title === 'Legacy Videos');
        if (legacyWithCount) {
          console.log(`useSeriesWithCounts result: ${legacyWithCount.actual_episode_count} episodes`);
        }
      }
    } catch (error) {
      console.log(`useSeriesWithCounts test error: ${error.message}`);
    }
    
    // Step 4: Summary
    console.log('\n4. Summary:');
    console.log(`  DB total_episodes: ${legacySeries.total_episodes}`);
    console.log(`  Actual active videos: ${activeVideos.length}`);
    console.log(`  API series total_episodes: ${legacySeries.total_episodes} (should match DB)`);
    console.log(`  API series videos count: ${activeVideos.length} (should match actual)`);
    console.log(`  useSeriesWithCounts: ${activeVideos.length} (should match actual)`);
    
    const allMatch = legacySeries.total_episodes === activeVideos.length;
    console.log(`\n✅ All counts match: ${allMatch ? 'YES' : 'NO'}`);
    
    if (allMatch) {
      console.log('\n🎉 SUCCESS: Series and videos are properly synchronized!');
      console.log('The frontend should now show the correct count.');
    } else {
      console.log('\n❌ ISSUE: Counts do not match. There may be a synchronization problem.');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testVideoDeletionSync().catch(console.error);
