import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'raw',
            folder: 'books'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return (result as any).secure_url;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function deleteFile(url: string): Promise<void> {
  try {
    const publicId = url.split('/').slice(-1)[0].split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
} 