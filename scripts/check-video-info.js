import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function checkVideoInfo() {
  try {
    const publicId = 'mythosstream-videos/lcl2mk5vtird1lzyafwk'; // Your TEST HLS video
    
    console.log('🔍 Checking video info for:', publicId);
    
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'video',
    });

    console.log('📹 Video Information:');
    console.log(`   Public ID: ${result.public_id}`);
    console.log(`   Format: ${result.format}`);
    console.log(`   Duration: ${result.duration}s`);
    console.log(`   Size: ${(result.bytes / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Dimensions: ${result.width}x${result.height}`);
    console.log(`   Created: ${result.created_at}`);
    
    // Check for derived resources (transformations)
    if (result.derived && result.derived.length > 0) {
      console.log(`\n🔄 Found ${result.derived.length} derived transformations:`);
      result.derived.forEach((derived, index) => {
        console.log(`   ${index + 1}. ${derived.format?.toUpperCase() || 'Unknown'}`);
        console.log(`      URL: ${derived.secure_url}`);
        console.log(`      Transformation: ${derived.transformation || 'None'}`);
      });
    } else {
      console.log('\n⚠️  No derived transformations found');
      console.log('   This means eager transformations are not pre-generated');
      console.log('   URLs will be generated on-the-fly when accessed');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the check
checkVideoInfo().then(() => {
  console.log('\n🎉 Check completed!');
  process.exit(0);
});