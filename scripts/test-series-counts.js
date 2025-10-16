import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSeriesCounts() {
  console.log('=== TESTING SERIES COUNTS ===');
  
  try {
    // Test 1: Check series data
    console.log('\n1. Fetching series data...');
    const { data: series, error: seriesError } = await supabase
      .from('series')
      .select('id, title, total_episodes')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (seriesError) {
      console.error('Error fetching series:', seriesError);
      return;
    }
    
    console.log('Series found:', series.length);
    series.forEach(s => {
      console.log(`- ${s.title}: ${s.total_episodes} episodes (DB count)`);
    });
    
    // Test 2: Check actual video counts
    console.log('\n2. Checking actual video counts...');
    for (const s of series) {
      const { data: videos, error: videoError } = await supabase
        .from('videos')
        .select('id, title, episode_number')
        .eq('series_id', s.id)
        .eq('is_active', true)
        .order('episode_number', { ascending: true });
      
      if (videoError) {
        console.error(`Error fetching videos for ${s.title}:`, videoError);
        continue;
      }
      
      const actualCount = videos.length;
      const dbCount = s.total_episodes;
      
      console.log(`\n${s.title}:`);
      console.log(`  DB count: ${dbCount}`);
      console.log(`  Actual count: ${actualCount}`);
      console.log(`  Match: ${dbCount === actualCount ? '✅' : '❌'}`);
      
      if (actualCount > 0) {
        console.log(`  Episodes:`);
        videos.forEach(v => {
          console.log(`    Ep ${v.episode_number}: ${v.title}`);
        });
      }
    }
    
    // Test 3: Test API endpoints
    console.log('\n3. Testing API endpoints...');
    
    // Test series endpoint
    try {
      const response = await fetch('http://localhost:5000/api/series');
      if (response.ok) {
        const apiSeries = await response.json();
        console.log(`✅ Series API working: ${apiSeries.length} series returned`);
        
        // Test individual series videos endpoint
        for (const s of apiSeries.slice(0, 2)) { // Test first 2 series
          try {
            const videoResponse = await fetch(`http://localhost:5000/api/series/${s.id}/videos`);
            if (videoResponse.ok) {
              const videos = await videoResponse.json();
              console.log(`✅ Series ${s.id} videos API: ${videos.length} videos returned`);
            } else {
              console.log(`❌ Series ${s.id} videos API failed: ${videoResponse.status}`);
            }
          } catch (error) {
            console.log(`❌ Series ${s.id} videos API error:`, error.message);
          }
        }
      } else {
        console.log(`❌ Series API failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Series API error:`, error.message);
    }
    
    console.log('\n=== TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSeriesCounts().catch(console.error);
