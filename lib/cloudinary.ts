import { v2 as cloudinary } from 'cloudinary';

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'bc6rkmuf', 
    api_key: process.env.CLOUDINARY_API_KEY || '486554795133941', 
    api_secret: process.env.CLOUDINARY_API_SECRET // Use environment variable for the secret
});

export default cloudinary;
