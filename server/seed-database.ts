import { storage } from "./storage";
import { seriesData, videoData } from "./content-data";

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Create series first
    console.log("📺 Creating series...");
    const createdSeries: { [key: string]: string } = {};
    
    for (const series of seriesData) {
      const createdSeriesItem = await storage.createSeries(series);
      createdSeries[series.title] = createdSeriesItem.id;
      console.log(`✅ Created series: ${series.title} (ID: ${createdSeriesItem.id})`);
    }

    // Create videos with proper series IDs
    console.log("🎬 Creating videos...");
    let standaloneCount = 0;
    let seriesCount = 0;

    for (const video of videoData) {
      if (video.contentType === "series" && video.seriesId) {
        // Find the corresponding series ID
        const seriesTitle = getSeriesTitleFromId(video.seriesId);
        const actualSeriesId = createdSeries[seriesTitle];
        
        if (actualSeriesId) {
          const videoWithSeriesId = {
            ...video,
            seriesId: actualSeriesId
          };
          await storage.createVideo(videoWithSeriesId);
          seriesCount++;
          console.log(`✅ Created series video: ${video.title} (Episode ${video.episodeNumber})`);
        } else {
          console.warn(`⚠️ Could not find series for video: ${video.title}`);
        }
      } else {
        // Standalone video
        await storage.createVideo(video);
        standaloneCount++;
        console.log(`✅ Created standalone video: ${video.title}`);
      }
    }

    console.log(`\n🎉 Database seeding completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Series created: ${seriesData.length}`);
    console.log(`   - Series videos created: ${seriesCount}`);
    console.log(`   - Standalone videos created: ${standaloneCount}`);
    console.log(`   - Total videos created: ${seriesCount + standaloneCount}`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

function getSeriesTitleFromId(seriesId: string): string {
  const seriesMap: { [key: string]: string } = {
    "ramayana-series": "श्रीराम जीवन कथा - The Life of Lord Rama",
    "krishna-series": "कृष्ण लीला - Divine Play of Lord Krishna",
    "mahabharata-series": "महाभारत महाकाव्य - The Great Epic",
    "shiva-series": "शिव महिमा - Glory of Lord Shiva",
    "hanuman-series": "हनुमान जी की कथाएं - Stories of Hanuman",
    "ganesha-series": "गणेश जी की कथाएं - Stories of Lord Ganesha",
    "devi-series": "देवी महिमा - Glory of Divine Mother"
  };
  
  return seriesMap[seriesId] || seriesId;
}

// Run the seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };
