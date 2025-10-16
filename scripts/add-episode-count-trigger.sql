-- Create a function to update series episode count
CREATE OR REPLACE FUNCTION update_series_episode_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the series episode count based on active videos
  UPDATE series 
  SET total_episodes = (
    SELECT COUNT(*) 
    FROM videos 
    WHERE series_id = COALESCE(NEW.series_id, OLD.series_id)
    AND is_active = true
  )
  WHERE id = COALESCE(NEW.series_id, OLD.series_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for video operations
DROP TRIGGER IF EXISTS update_series_count_on_video_insert ON videos;
CREATE TRIGGER update_series_count_on_video_insert
  AFTER INSERT ON videos
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION update_series_episode_count();

DROP TRIGGER IF EXISTS update_series_count_on_video_update ON videos;
CREATE TRIGGER update_series_count_on_video_update
  AFTER UPDATE ON videos
  FOR EACH ROW
  WHEN (OLD.is_active != NEW.is_active OR OLD.series_id != NEW.series_id)
  EXECUTE FUNCTION update_series_episode_count();

DROP TRIGGER IF EXISTS update_series_count_on_video_delete ON videos;
CREATE TRIGGER update_series_count_on_video_delete
  AFTER DELETE ON videos
  FOR EACH ROW
  WHEN (OLD.is_active = true)
  EXECUTE FUNCTION update_series_episode_count();

-- Update all existing series episode counts
UPDATE series 
SET total_episodes = (
  SELECT COUNT(*) 
  FROM videos 
  WHERE series_id = series.id
  AND is_active = true
);
