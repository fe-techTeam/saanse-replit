import { storage } from "./storage";
import { seriesData, videoData } from "./content-data";

// Additional content from the removed files
const additionalSeriesData = [
  {
    title: "महाभारत महाकाव्य - The Great Epic",
    description: "Complete Mahabharata story from the beginning to the end, covering all characters and events.",
    category: "Mahabharata",
    thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
    bannerUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400",
    isActive: true
  },
  {
    title: "शिव महिमा - Glory of Lord Shiva",
    description: "Complete stories and teachings of Lord Shiva, covering all aspects of his divine nature.",
    category: "Shiva",
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    bannerUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=400",
    isActive: true
  },
  {
    title: "हनुमान जी की कथाएं - Stories of Hanuman",
    description: "Complete life and stories of Lord Hanuman, the greatest devotee of Lord Rama.",
    category: "Hanuman",
    thumbnailUrl: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=600&h=400",
    bannerUrl: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=1200&h=400",
    isActive: true
  },
  {
    title: "गणेश जी की कथाएं - Stories of Lord Ganesha",
    description: "Complete stories and significance of Lord Ganesha, the remover of obstacles.",
    category: "Ganesha",
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    bannerUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=400",
    isActive: true
  },
  {
    title: "देवी महिमा - Glory of Divine Mother",
    description: "Complete stories and forms of Divine Mother, covering all goddesses and their significance.",
    category: "Devi",
    thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
    bannerUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=1200&h=400",
    isActive: true
  }
];

const additionalVideoData = [
  // Mahabharata Series Episodes
  {
    title: "कुरु वंश - The Kuru Dynasty",
    description: "The foundation of the great Kuru dynasty and the birth of legendary princes.",
    category: "Mahabharata",
    duration: 198,
    thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["kuru", "dynasty", "princes", "कुरु", "वंश"],
    contentType: "series",
    seriesId: "mahabharata-series",
    episodeNumber: 1
  },
  {
    title: "पांडव जन्म - Birth of Pandavas",
    description: "The divine birth of the five Pandava brothers and their extraordinary powers.",
    category: "Mahabharata",
    duration: 167,
    thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["pandava", "birth", "divine", "पांडव", "जन्म"],
    contentType: "series",
    seriesId: "mahabharata-series",
    episodeNumber: 2
  },
  {
    title: "द्रौपदी स्वयंवर - Draupadi's Choice",
    description: "The legendary swayamvara where Arjuna wins Draupadi through his archery skills.",
    category: "Mahabharata",
    duration: 189,
    thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["draupadi", "swayamvara", "arjuna", "द्रौपदी", "स्वयंवर"],
    contentType: "series",
    seriesId: "mahabharata-series",
    episodeNumber: 3
  },
  {
    title: "चौसर खेल - The Dice Game",
    description: "The fateful dice game that changes everything, leading to the Pandavas' exile.",
    category: "Mahabharata",
    duration: 212,
    thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["dice", "game", "exile", "चौसर", "खेल"],
    contentType: "series",
    seriesId: "mahabharata-series",
    episodeNumber: 4
  },
  {
    title: "महाभारत युद्ध - The Great War",
    description: "The 18-day war that destroyed a civilization and established dharma.",
    category: "Mahabharata",
    duration: 298,
    thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["war", "battle", "dharma", "महाभारत", "युद्ध"],
    contentType: "series",
    seriesId: "mahabharata-series",
    episodeNumber: 5
  },

  // Shiva Series Episodes
  {
    title: "शिव तांडव - The Cosmic Dance",
    description: "Witness Lord Shiva's powerful Tandava, the dance that creates and destroys universes.",
    category: "Shiva",
    duration: 189,
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["tandava", "dance", "cosmic", "शिव", "तांडव"],
    contentType: "series",
    seriesId: "shiva-series",
    episodeNumber: 1
  },
  {
    title: "पार्वती तपस्या - Parvati's Penance",
    description: "Parvati's intense penance to win Lord Shiva's heart and become his consort.",
    category: "Shiva",
    duration: 178,
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["parvati", "penance", "love", "पार्वती", "तपस्या"],
    contentType: "series",
    seriesId: "shiva-series",
    episodeNumber: 2
  },
  {
    title: "गंगा अवतरण - Descent of Ganga",
    description: "How Shiva caught the mighty Ganga in his hair to save the earth.",
    category: "Shiva",
    duration: 156,
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["ganga", "descent", "earth", "गंगा", "अवतरण"],
    contentType: "series",
    seriesId: "shiva-series",
    episodeNumber: 3
  },

  // Hanuman Series Episodes
  {
    title: "हनुमान जन्म - Birth of Hanuman",
    description: "The divine birth of Hanuman and his childhood adventures with the sun.",
    category: "Hanuman",
    duration: 156,
    thumbnailUrl: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["hanuman", "birth", "childhood", "हनुमान", "जन्म"],
    contentType: "series",
    seriesId: "hanuman-series",
    episodeNumber: 1
  },
  {
    title: "राम मिलन - Meeting Lord Rama",
    description: "The destined meeting between Hanuman and Lord Rama that changed everything.",
    category: "Hanuman",
    duration: 178,
    thumbnailUrl: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["rama", "meeting", "devotion", "राम", "मिलन"],
    contentType: "series",
    seriesId: "hanuman-series",
    episodeNumber: 2
  },
  {
    title: "समुद्र पार - Crossing the Ocean",
    description: "Hanuman's magnificent leap across the vast ocean to reach Lanka.",
    category: "Hanuman",
    duration: 189,
    thumbnailUrl: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["ocean", "leap", "lanka", "समुद्र", "पार"],
    contentType: "series",
    seriesId: "hanuman-series",
    episodeNumber: 3
  },

  // Ganesha Series Episodes
  {
    title: "गणेश जन्म कथा - Birth Story",
    description: "The unique creation of Ganesha by Goddess Parvati from turmeric paste.",
    category: "Ganesha",
    duration: 145,
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["ganesha", "birth", "parvati", "गणेश", "जन्म"],
    contentType: "series",
    seriesId: "ganesha-series",
    episodeNumber: 1
  },
  {
    title: "गज मुख कैसे मिला - How He Got Elephant Head",
    description: "The story of how Ganesha received his elephant head after Shiva's intervention.",
    category: "Ganesha",
    duration: 167,
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["elephant", "head", "shiva", "गज", "मुख"],
    contentType: "series",
    seriesId: "ganesha-series",
    episodeNumber: 2
  },

  // Devi Series Episodes
  {
    title: "दुर्गा अवतार - Durga Avatar",
    description: "The emergence of Goddess Durga to defeat the buffalo demon Mahishasura.",
    category: "Devi",
    duration: 198,
    thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["durga", "mahishasura", "demon", "दुर्गा", "अवतार"],
    contentType: "series",
    seriesId: "devi-series",
    episodeNumber: 1
  },
  {
    title: "काली माँ - The Fierce Mother",
    description: "The fierce form of Goddess Kali emerging from Durga's forehead in battle.",
    category: "Devi",
    duration: 167,
    thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["kali", "fierce", "battle", "काली", "माँ"],
    contentType: "series",
    seriesId: "devi-series",
    episodeNumber: 2
  },

  // Additional Standalone Content
  {
    title: "गणेश चतुर्थी - Ganesha Festival",
    description: "The elaborate celebration of Ganesha Chaturthi with processions and devotion.",
    category: "Festivals",
    duration: 189,
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["ganesha", "chaturthi", "festival", "गणेश", "चतुर्थी"],
    contentType: "standalone"
  },
  {
    title: "दशहरा विजय - Victory of Good",
    description: "Dussehra celebration marking Rama's victory over Ravana and good over evil.",
    category: "Festivals",
    duration: 167,
    thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["dussehra", "victory", "rama", "दशहरा", "विजय"],
    contentType: "standalone"
  },
  {
    title: "शिव तांडव स्तोत्र - Shiva's Praise",
    description: "The powerful Shiva Tandava Stotram with mesmerizing visuals.",
    category: "Bhajans",
    duration: 198,
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["shiva", "tandava", "stotram", "शिव", "तांडव"],
    contentType: "standalone"
  },
  {
    title: "गायत्री मंत्र - Universal Prayer",
    description: "The sacred Gayatri Mantra with proper pronunciation and meaning.",
    category: "Bhajans",
    duration: 145,
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["gayatri", "mantra", "prayer", "गायत्री", "मंत्र"],
    contentType: "standalone"
  },
  {
    title: "चार युग - The Four Ages",
    description: "Understanding the cycle of Satya, Treta, Dwapara, and Kali Yuga.",
    category: "Explained",
    duration: 178,
    thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["yuga", "ages", "time", "चार", "युग"],
    contentType: "standalone"
  },
  {
    title: "आत्मा और परमात्मा - Soul and Supreme Soul",
    description: "The relationship between individual soul (Atma) and universal soul (Paramatma).",
    category: "Explained",
    duration: 189,
    thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["atma", "soul", "spiritual", "आत्मा", "परमात्मा"],
    contentType: "standalone"
  }
];

async function enhancedSeedDatabase() {
  console.log("🌱 Starting enhanced database seeding...");

  try {
    // Create all series first
    console.log("📺 Creating series...");
    const createdSeries: { [key: string]: string } = {};
    
    const allSeriesData = [...seriesData, ...additionalSeriesData];
    
    for (const series of allSeriesData) {
      const createdSeriesItem = await storage.createSeries(series);
      createdSeries[series.title] = createdSeriesItem.id;
      console.log(`✅ Created series: ${series.title} (ID: ${createdSeriesItem.id})`);
    }

    // Create videos with proper series IDs
    console.log("🎬 Creating videos...");
    let standaloneCount = 0;
    let seriesCount = 0;

    const allVideoData = [...videoData, ...additionalVideoData];

    for (const video of allVideoData) {
      if (video.seriesId) {
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

    console.log(`\n🎉 Enhanced database seeding completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Series created: ${allSeriesData.length}`);
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
  enhancedSeedDatabase();
}

export { enhancedSeedDatabase };
