import { config } from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables
config();

async function testCloudinaryConnection() {
  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // Log the configuration (without the secret)
    console.log('Cloudinary Configuration:');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY);

    // Test the connection by requesting account details
    const result = await cloudinary.api.ping();
    console.log('\nCloudinary Connection Test:');
    console.log('✅ Connection successful!');
    console.log('Response:', result);
  } catch (error) {
    console.error('\n❌ Cloudinary Connection Error:');
    console.error(error);
  }
}

testCloudinaryConnection(); 