#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(path.dirname(__dirname), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim().replace(/"/g, '');
  }
});

const supabaseUrl = envVars.SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample content data
const seriesData = [
  {
    title: "श्रीराम जीवन कथा - The Life of Lord Rama",
    description: "Complete life story of Lord Rama from birth to his return to Ayodhya.",
    category: "Ramayana",
    thumbnail_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
    banner_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400",
    is_active: true
  },
  {
    title: "कृष्ण लीला - Divine Play of Lord Krishna",
    description: "Complete stories of Lord Krishna's divine pastimes and teachings.",
    category: "Krishna",
    thumbnail_url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    banner_url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=400",
    is_active: true
  },
  {
    title: "महाभारत महाकाव्य - The Great Epic",
    description: "Complete Mahabharata story from the beginning to the end.",
    category: "Mahabharata",
    thumbnail_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
    banner_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400",
    is_active: true
  }
];

const videoData = [
  {
    title: "राम जन्म - Birth of Rama",
    description: "The divine birth of Lord Rama and his early life in Ayodhya.",
    category: "Ramayana",
    duration: 180,
    thumbnail_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
    video_url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["rama", "birth", "ayodhya", "राम", "जन्म"],
    content_type: "series",
    episode_number: 1
  },
  {
    title: "सीता स्वयंवर - Sita's Choice",
    description: "The legendary swayamvara where Rama breaks Lord Shiva's bow.",
    category: "Ramayana",
    duration: 165,
    thumbnail_url: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
    video_url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["sita", "swayamvara", "bow", "सीता", "स्वयंवर"],
    content_type: "series",
    episode_number: 2
  },
  {
    title: "कृष्ण जन्म - Birth of Krishna",
    description: "The divine birth of Lord Krishna in Mathura and his escape to Gokul.",
    category: "Krishna",
    duration: 195,
    thumbnail_url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    video_url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["krishna", "birth", "mathura", "कृष्ण", "जन्म"],
    content_type: "series",
    episode_number: 1
  },
  {
    title: "दीपावली - Festival of Lights",
    description: "The celebration of Diwali marking Rama's return to Ayodhya.",
    category: "Festivals",
    duration: 150,
    thumbnail_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
    video_url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["diwali", "festival", "lights", "दीपावली"],
    content_type: "standalone"
  },
  {
    title: "हरे कृष्ण महामंत्र - Hare Krishna Mahamantra",
    description: "The sacred Hare Krishna mantra with beautiful visuals.",
    category: "Bhajans",
    duration: 180,
    thumbnail_url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    video_url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["hare", "krishna", "mantra", "हरे", "कृष्ण"],
    content_type: "standalone"
  }
];

async function seedDatabase() {
  console.log('🌱 Starting direct database seeding...\n');

  try {
    // Create series first
    console.log('📺 Creating series...');
    const createdSeries = {};
    
    for (const series of seriesData) {
      const { data, error } = await supabase
        .from('series')
        .insert(series)
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Error creating series "${series.title}":`, error);
        continue;
      }
      
      createdSeries[series.title] = data.id;
      console.log(`✅ Created series: ${series.title} (ID: ${data.id})`);
    }

    // Create videos
    console.log('\n🎬 Creating videos...');
    let standaloneCount = 0;
    let seriesCount = 0;

    for (const video of videoData) {
      if (video.content_type === "series") {
        // Find the corresponding series ID
        const seriesTitle = getSeriesTitleFromId(video.category);
        const seriesId = createdSeries[seriesTitle];
        
        if (seriesId) {
          const videoWithSeriesId = {
            ...video,
            series_id: seriesId
          };
          
          const { data, error } = await supabase
            .from('videos')
            .insert(videoWithSeriesId)
            .select()
            .single();
          
          if (error) {
            console.error(`❌ Error creating video "${video.title}":`, error);
            continue;
          }
          
          seriesCount++;
          console.log(`✅ Created series video: ${video.title} (Episode ${video.episode_number})`);
        } else {
          console.warn(`⚠️ Could not find series for video: ${video.title}`);
        }
      } else {
        // Standalone video
        const { data, error } = await supabase
          .from('videos')
          .insert(video)
          .select()
          .single();
        
        if (error) {
          console.error(`❌ Error creating video "${video.title}":`, error);
          continue;
        }
        
        standaloneCount++;
        console.log(`✅ Created standalone video: ${video.title}`);
      }
    }

    console.log(`\n🎉 Database seeding completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Series created: ${Object.keys(createdSeries).length}`);
    console.log(`   - Series videos created: ${seriesCount}`);
    console.log(`   - Standalone videos created: ${standaloneCount}`);
    console.log(`   - Total videos created: ${seriesCount + standaloneCount}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

function getSeriesTitleFromId(category) {
  const seriesMap = {
    "Ramayana": "श्रीराम जीवन कथा - The Life of Lord Rama",
    "Krishna": "कृष्ण लीला - Divine Play of Lord Krishna",
    "Mahabharata": "महाभारत महाकाव्य - The Great Epic"
  };
  
  return seriesMap[category] || category;
}

seedDatabase();
