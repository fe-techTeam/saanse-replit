import type { InsertVideo, InsertSeries } from "@shared/schema";

// Series data for SAANSE platform
export const seriesData: InsertSeries[] = [
  {
    title: "श्रीराम जीवन कथा - The Life of Lord Rama",
    description: "Complete life story of Lord Rama from birth to coronation, covering all major events and teachings.",
    category: "Ramayana",
    thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
    bannerUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400",
    isActive: true
  },
  {
    title: "कृष्ण लीला - Divine Play of Lord Krishna",
    description: "Complete Krishna Leela from birth to departure, including all divine pastimes and teachings.",
    category: "Krishna",
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    bannerUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=400",
    isActive: true
  },
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

// Video data for SAANSE platform
export const videoData: InsertVideo[] = [
  // === RAMAYANA SERIES EPISODES ===
  {
    title: "श्रीराम जन्म - The Divine Avatar",
    description: "Experience the divine birth of Lord Rama through stunning visuals and devotional music. A cinematic masterpiece that brings ancient scriptures to life.",
    category: "Ramayana",
    duration: 180,
    thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["rama", "birth", "ayodhya", "divine", "राम", "जन्म"],
    contentType: "series",
    seriesId: "ramayana-series", // This will be replaced with actual series ID
    episodeNumber: 1
  },
  {
    title: "सीता स्वयंवर - The Divine Union",
    description: "Witness the legendary bow-breaking ceremony and the destined union of Rama and Sita in this breathtaking episode.",
    category: "Ramayana", 
    duration: 165,
    thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["sita", "swayamvar", "bow", "marriage", "सीता", "स्वयंवर"],
    contentType: "series",
    seriesId: "ramayana-series",
    episodeNumber: 2
  },
  {
    title: "वन गमन - Forest Exile Begins",
    description: "The noble sacrifice as Rama accepts 14 years of exile with unwavering grace and dharma.",
    category: "Ramayana",
    duration: 142,
    thumbnailUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", 
    tags: ["exile", "forest", "sacrifice", "वन", "गमन"],
    contentType: "series",
    seriesId: "ramayana-series",
    episodeNumber: 3
  },
  {
    title: "सीता हरण - The Abduction",
    description: "The pivotal moment that changes everything - witness Ravana's treacherous act in this intense episode.",
    category: "Ramayana",
    duration: 198,
    thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["sita", "ravana", "abduction", "सीता", "हरण", "रावण"],
    contentType: "series",
    seriesId: "ramayana-series",
    episodeNumber: 4
  },
  {
    title: "हनुमान मिलन - Meeting Hanuman", 
    description: "The divine encounter between Rama and his greatest devotee, Hanuman, in the Kishkinda forest.",
    category: "Ramayana",
    duration: 156,
    thumbnailUrl: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["hanuman", "meeting", "devotion", "हनुमान", "मिलन"],
    contentType: "series",
    seriesId: "ramayana-series",
    episodeNumber: 5
  },
  {
    title: "सुंदरकांड - Hanuman's Lanka Mission",
    description: "Follow Hanuman's epic journey across the ocean to Lanka in search of Sita Mata.",
    category: "Ramayana",
    duration: 189,
    thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["sundarkand", "hanuman", "ocean", "सुंदरकांड", "लंका"],
    contentType: "series",
    seriesId: "ramayana-series",
    episodeNumber: 6
  },
  {
    title: "लंका दहन - Burning of Lanka",
    description: "Hanuman's heroic mission culminates in the spectacular burning of the golden city of Lanka.",
    category: "Ramayana",
    duration: 173,
    thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["lanka", "fire", "hanuman", "लंका", "दहन"],
    contentType: "series",
    seriesId: "ramayana-series",
    episodeNumber: 7
  },
  {
    title: "सेतु निर्माण - Building the Bridge",
    description: "Witness the miraculous construction of the bridge to Lanka with divine intervention.",
    category: "Ramayana",
    duration: 167,
    thumbnailUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["bridge", "lanka", "miracle", "सेतु", "निर्माण"],
    contentType: "series",
    seriesId: "ramayana-series",
    episodeNumber: 8
  },
  {
    title: "राम रावण युद्ध - The Epic Battle",
    description: "The ultimate confrontation between good and evil in this spectacular battle sequence.",
    category: "Ramayana",
    duration: 225,
    thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["battle", "rama", "ravana", "युद्ध", "रावण"],
    contentType: "series",
    seriesId: "ramayana-series",
    episodeNumber: 9
  },
  {
    title: "राज्याभिषेक - The Coronation",
    description: "The glorious return and coronation of Lord Rama as the rightful king of Ayodhya.",
    category: "Ramayana",
    duration: 187,
    thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["coronation", "ayodhya", "king", "राज्याभिषेक", "विजय"],
    contentType: "series",
    seriesId: "ramayana-series",
    episodeNumber: 10
  },

  // === KRISHNA LEELA SERIES EPISODES ===
  {
    title: "कृष्ण जन्म - Divine Birth in Prison",
    description: "The miraculous birth of Lord Krishna in Kamsa's prison, illuminating the darkness with divine light.",
    category: "Krishna",
    duration: 172,
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["krishna", "birth", "mathura", "कृष्ण", "जन्म"],
    contentType: "series",
    seriesId: "krishna-series",
    episodeNumber: 1
  },
  {
    title: "गोकुल गमन - Journey to Gokul",
    description: "Witness Vasudeva's divine journey through the stormy night to save baby Krishna.",
    category: "Krishna",
    duration: 158,
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["gokul", "vasudeva", "journey", "गोकुल", "गमन"],
    contentType: "series",
    seriesId: "krishna-series",
    episodeNumber: 2
  },
  {
    title: "माखन चोर - The Butter Thief",
    description: "Adorable tales of young Krishna's mischievous butter-stealing adventures in Gokul.",
    category: "Krishna",
    duration: 145,
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["butter", "mischief", "childhood", "माखन", "चोर"],
    contentType: "series",
    seriesId: "krishna-series",
    episodeNumber: 3
  },
  {
    title: "कालिया दमन - Subduing Kaliya",
    description: "Young Krishna's heroic dance on the venomous serpent Kaliya to save Yamuna river.",
    category: "Krishna",
    duration: 193,
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["kaliya", "yamuna", "dance", "कालिया", "दमन"],
    contentType: "series",
    seriesId: "krishna-series",
    episodeNumber: 4
  },
  {
    title: "गोवर्धन उठाना - Lifting Govardhan",
    description: "Krishna lifts the entire Govardhan mountain to protect villagers from Indra's wrath.",
    category: "Krishna",
    duration: 201,
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["govardhan", "mountain", "indra", "गोवर्धन", "उठाना"],
    contentType: "series",
    seriesId: "krishna-series",
    episodeNumber: 5
  },
  {
    title: "राधा कृष्ण प्रेम - Divine Love",
    description: "The eternal love story of Radha and Krishna, symbolizing devotion and divine union.",
    category: "Krishna",
    duration: 167,
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["radha", "love", "devotion", "राधा", "प्रेम"],
    contentType: "series",
    seriesId: "krishna-series",
    episodeNumber: 6
  },
  {
    title: "रास लीला - The Divine Dance",
    description: "The mystical Raas Leela where Krishna dances with the gopis under the full moon.",
    category: "Krishna",
    duration: 189,
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["raas", "dance", "gopis", "रास", "लीला"],
    contentType: "series",
    seriesId: "krishna-series",
    episodeNumber: 7
  },
  {
    title: "द्वारका गमन - Journey to Dwarka",
    description: "Krishna establishes his golden kingdom of Dwarka, the city that rose from the ocean.",
    category: "Krishna",
    duration: 198,
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["dwarka", "kingdom", "ocean", "द्वारका", "गमन"],
    contentType: "series",
    seriesId: "krishna-series",
    episodeNumber: 8
  },
  {
    title: "गीता उपदेश - The Divine Sermon",
    description: "Krishna's timeless wisdom delivered to Arjuna on the battlefield of Kurukshetra.",
    category: "Krishna",
    duration: 267,
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["gita", "arjuna", "philosophy", "गीता", "उपदेश"],
    contentType: "series",
    seriesId: "krishna-series",
    episodeNumber: 9
  },
  {
    title: "निर्याण लीला - The Final Journey",
    description: "Krishna's divine departure from earthly realm, marking the end of Dwapara Yuga.",
    category: "Krishna",
    duration: 198,
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["departure", "niryan", "leela", "निर्याण", "लीला"],
    contentType: "series",
    seriesId: "krishna-series",
    episodeNumber: 10
  },

  // === STANDALONE FESTIVAL VIDEOS ===
  {
    title: "दिवाली - Festival of Lights",
    description: "The grand celebration of Diwali, commemorating Rama's return to Ayodhya.",
    category: "Festivals",
    duration: 167,
    thumbnailUrl: "https://images.unsplash.com/photo-1570197526038-2086a2750ae3?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["diwali", "lights", "celebration", "दिवाली", "प्रकाश"],
    contentType: "standalone"
  },
  {
    title: "होली रंग - Festival of Colors",
    description: "The joyous celebration of Holi and the divine play of Krishna with colors.",
    category: "Festivals",
    duration: 156,
    thumbnailUrl: "https://images.unsplash.com/photo-1583307713403-8e19fe3c9772?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["holi", "colors", "krishna", "होली", "रंग"],
    contentType: "standalone"
  },
  {
    title: "जन्माष्टमी - Krishna's Birthday",
    description: "The grand celebration of Lord Krishna's birth with dahi-handi and devotion.",
    category: "Festivals",
    duration: 178,
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["janmashtami", "krishna", "birthday", "जन्माष्टमी", "कृष्ण"],
    contentType: "standalone"
  },

  // === STANDALONE BHAJAN VIDEOS ===
  {
    title: "हरे कृष्ण महामंत्र - The Great Mantra",
    description: "The divine Hare Krishna Maha Mantra with beautiful musical arrangement.",
    category: "Bhajans",
    duration: 189,
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["hare", "krishna", "mantra", "हरे", "कृष्ण"],
    contentType: "standalone"
  },
  {
    title: "राम धुन - Rama's Name",
    description: "Soothing chants of 'राम राम' with traditional musical instruments.",
    category: "Bhajans",
    duration: 167,
    thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["rama", "chant", "devotional", "राम", "धुन"],
    contentType: "standalone"
  },
  {
    title: "हनुमान चालीसा - Hanuman's Forty Verses",
    description: "The complete Hanuman Chalisa with melodious tune and meaning.",
    category: "Bhajans",
    duration: 234,
    thumbnailUrl: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["hanuman", "chalisa", "verses", "हनुमान", "चालीसा"],
    contentType: "standalone"
  },

  // === STANDALONE EXPLAINED VIDEOS ===
  {
    title: "कर्म का सिद्धांत - Law of Karma Explained",
    description: "Understanding the fundamental law of karma and its impact on our lives.",
    category: "Explained",
    duration: 189,
    thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["karma", "law", "philosophy", "कर्म", "सिद्धांत"],
    contentType: "standalone"
  },
  {
    title: "धर्म और अधर्म - Righteousness vs Unrighteousness",
    description: "The eternal conflict between dharma and adharma explained through stories.",
    category: "Explained",
    duration: 167,
    thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["dharma", "righteousness", "morals", "धर्म", "अधर्म"],
    contentType: "standalone"
  },
  {
    title: "मोक्ष का मार्ग - Path to Liberation",
    description: "The four paths to moksha: karma, bhakti, raja, and gyana yoga explained.",
    category: "Explained",
    duration: 198,
    thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tags: ["moksha", "liberation", "yoga", "मोक्ष", "मार्ग"],
    contentType: "standalone"
  }
];
