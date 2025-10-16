import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixSeriesData() {
  console.log('=== FIXING SERIES DATA ===');
  
  // First, update all series episode counts
  console.log('Updating episode counts for all series...');
  const { data: series, error: seriesError } = await supabase
    .from('series')
    .select('id, title')
    .eq('is_active', true);
  
  if (seriesError) {
    console.error('Error fetching series:', seriesError);
    return;
  }
  
  for (const s of series) {
    // Count actual videos for this series
    const { count, error: countError } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('series_id', s.id)
      .eq('is_active', true);
    
    if (countError) {
      console.error(`Error counting videos for ${s.title}:`, countError);
      continue;
    }
    
    // Update the series with correct count
    const { error: updateError } = await supabase
      .from('series')
      .update({ total_episodes: count || 0 })
      .eq('id', s.id);
    
    if (updateError) {
      console.error(`Error updating ${s.title}:`, updateError);
    } else {
      console.log(`Updated ${s.title}: ${count || 0} episodes`);
    }
  }
  
  console.log('\n=== CLEANING UP DUPLICATE SERIES ===');
  
  // Find and remove duplicate series (keep the one with most videos)
  const { data: allSeries, error: allSeriesError } = await supabase
    .from('series')
    .select('id, title, total_episodes')
    .eq('is_active', true)
    .order('title');
  
  if (allSeriesError) {
    console.error('Error fetching all series:', allSeriesError);
    return;
  }
  
  // Group by title
  const seriesByTitle = {};
  allSeries.forEach(s => {
    if (!seriesByTitle[s.title]) {
      seriesByTitle[s.title] = [];
    }
    seriesByTitle[s.title].push(s);
  });
  
  // For each group with duplicates, keep the one with most episodes
  for (const [title, seriesList] of Object.entries(seriesByTitle)) {
    if (seriesList.length > 1) {
      console.log(`\nFound ${seriesList.length} duplicates for: ${title}`);
      
      // Sort by episode count (descending) and keep the first one
      seriesList.sort((a, b) => b.total_episodes - a.total_episodes);
      const keepSeries = seriesList[0];
      const removeSeries = seriesList.slice(1);
      
      console.log(`Keeping: ${keepSeries.id} (${keepSeries.total_episodes} episodes)`);
      
      for (const removeS of removeSeries) {
        console.log(`Removing: ${removeS.id} (${removeS.total_episodes} episodes)`);
        
        // Move any videos from removed series to the kept series
        const { data: videosToMove, error: moveError } = await supabase
          .from('videos')
          .select('*')
          .eq('series_id', removeS.id)
          .eq('is_active', true);
        
        if (moveError) {
          console.error(`Error fetching videos to move from ${removeS.id}:`, moveError);
        } else if (videosToMove && videosToMove.length > 0) {
          console.log(`Moving ${videosToMove.length} videos from ${removeS.id} to ${keepSeries.id}`);
          
          // Get the next episode number for the target series
          const { data: targetVideos, error: targetError } = await supabase
            .from('videos')
            .select('episode_number')
            .eq('series_id', keepSeries.id)
            .eq('is_active', true)
            .order('episode_number', { ascending: false })
            .limit(1);
          
          let nextEpisodeNumber = 1;
          if (targetVideos && targetVideos.length > 0) {
            nextEpisodeNumber = targetVideos[0].episode_number + 1;
          }
          
          // Move each video
          for (const video of videosToMove) {
            const { error: updateVideoError } = await supabase
              .from('videos')
              .update({ 
                series_id: keepSeries.id,
                episode_number: nextEpisodeNumber++
              })
              .eq('id', video.id);
            
            if (updateVideoError) {
              console.error(`Error moving video ${video.id}:`, updateVideoError);
            }
          }
        }
        
        // Deactivate the duplicate series
        const { error: deactivateError } = await supabase
          .from('series')
          .update({ is_active: false })
          .eq('id', removeS.id);
        
        if (deactivateError) {
          console.error(`Error deactivating series ${removeS.id}:`, deactivateError);
        }
      }
    }
  }
  
  console.log('\n=== FINAL UPDATE ===');
  // Update episode counts again after cleanup
  const { data: finalSeries, error: finalSeriesError } = await supabase
    .from('series')
    .select('id, title')
    .eq('is_active', true);
  
  if (finalSeriesError) {
    console.error('Error fetching final series:', finalSeriesError);
    return;
  }
  
  for (const s of finalSeries) {
    const { count, error: countError } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('series_id', s.id)
      .eq('is_active', true);
    
    if (countError) {
      console.error(`Error counting videos for ${s.title}:`, countError);
      continue;
    }
    
    const { error: updateError } = await supabase
      .from('series')
      .update({ total_episodes: count || 0 })
      .eq('id', s.id);
    
    if (updateError) {
      console.error(`Error updating ${s.title}:`, updateError);
    } else {
      console.log(`Final: ${s.title}: ${count || 0} episodes`);
    }
  }
  
  console.log('\n=== CLEANUP COMPLETE ===');
}

fixSeriesData().catch(console.error);
