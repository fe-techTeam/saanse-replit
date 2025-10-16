import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testComprehensiveSync() {
  console.log('=== COMPREHENSIVE SYNC TEST ===');
  
  try {
    // Test 1: Check current state
    console.log('\n1. Checking current state...');
    const { data: series, error: seriesError } = await supabase
      .from('series')
      .select('id, title, total_episodes')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (seriesError) {
      console.error('Error fetching series:', seriesError);
      return;
    }
    
    console.log('Current series:');
    series.forEach(s => {
      console.log(`  ${s.title}: ${s.total_episodes} episodes (DB)`);
    });
    
    // Test 2: Check API endpoints
    console.log('\n2. Testing API endpoints...');
    
    // Test series API
    try {
      const response = await fetch('http://localhost:5000/api/series');
      if (response.ok) {
        const apiSeries = await response.json();
        console.log('API Series data:');
        apiSeries.forEach(s => {
          console.log(`  ${s.title}: ${s.total_episodes} episodes (API)`);
        });
      } else {
        console.log(`Series API failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`Series API error: ${error.message}`);
    }
    
    // Test 3: Check specific series videos
    console.log('\n3. Testing series videos API...');
    for (const s of series) {
      try {
        const response = await fetch(`http://localhost:5000/api/series/${s.id}/videos`);
        if (response.ok) {
          const videos = await response.json();
          console.log(`${s.title}:`);
          console.log(`  DB count: ${s.total_episodes}`);
          console.log(`  API count: ${videos.length}`);
          console.log(`  Match: ${s.total_episodes === videos.length ? '✅' : '❌'}`);
          
          if (videos.length > 0) {
            console.log(`  Videos:`);
            videos.forEach(v => {
              console.log(`    Ep ${v.episode_number}: ${v.title}`);
            });
          }
        } else {
          console.log(`${s.title}: API failed (${response.status})`);
        }
      } catch (error) {
        console.log(`${s.title}: API error - ${error.message}`);
      }
    }
    
    // Test 4: Test with useSeriesWithCounts logic
    console.log('\n4. Testing useSeriesWithCounts logic...');
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
        
        console.log('Series with actual counts:');
        seriesWithCounts.forEach(s => {
          console.log(`  ${s.title}: ${s.actual_episode_count} episodes (actual)`);
        });
      }
    } catch (error) {
      console.log(`useSeriesWithCounts test error: ${error.message}`);
    }
    
    console.log('\n=== TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testComprehensiveSync().catch(console.error);
