import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file before uploading to save bandwidth and storage.
 * - Converts to WebP format
 * - Resizes max width/height to 1920px
 * - Keeps file size under 500KB
 * 
 * @param {File} file - The original image file
 * @returns {Promise<File>} - The compressed image file
 */
export async function compressImage(file) {
  const options = {
    maxSizeMB: 0.5,           // Target 500KB maximum
    maxWidthOrHeight: 1920,   // Max resolution
    useWebWorker: true,       // Use multi-threading
    fileType: 'image/webp',   // WebP is best for Next.js/Cloudinary optimization
  };
  
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
}
