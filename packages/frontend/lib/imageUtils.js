/**
 * Utility functions for handling image URLs in the application
 */

/**
 * Get the correct image URL for the application
 * @param {string} imagePath - The image path from the API
 * @param {string} folder - Optional folder prefix (e.g., 'storage')
 * @returns {string|null} - The complete image URL or null if no path provided
 */
export const getImageUrl = (imagePath, folder = '') => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  const apiUrl = 'https://api.pinoyglobalsupply.com/';
  
  // Remove /api from the end only, not from the middle
  const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
  
  // Ensure imagePath starts with /
  let cleanImagePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // Add folder prefix if provided
  if (folder) {
    const cleanFolder = folder.startsWith('/') ? folder : `/${folder}`;
    cleanImagePath = `${cleanFolder}${cleanImagePath}`;
  }
  
  return `${baseUrl}${cleanImagePath}`;
};

/**
 * Get the correct video URL for the application
 * @param {string|object} video - The video path or video object from the API
 * @param {string} folder - Optional folder prefix (e.g., 'storage')
 * @returns {string|null} - The complete video URL or null if no path provided
 */
export const getVideoUrl = (video, folder = 'storage') => {
  if (!video) return null;
  
  // Handle string paths
  if (typeof video === 'string') {
    if (video.startsWith('http://') || video.startsWith('https://')) {
      return video;
    }
    return getImageUrl(video, folder);
  }
  
  // Handle file preview (from VideoUpload component)
  if (video?.preview) return video.preview;
  
  // Handle different video object formats
  if (video?.video_url) return video.video_url;
  if (video?.video_path) return getImageUrl(video.video_path, folder);
  if (video?.path) return getImageUrl(video.path, folder);
  
  return null;
};

/**
 * Get the correct attachment URL for the application
 * @param {string|object} attachment - The attachment path or attachment object
 * @param {string} folder - Optional folder prefix (e.g., 'storage')
 * @returns {string|null} - The complete attachment URL or null if no path provided
 */
export const getAttachmentUrl = (attachment, folder = '') => {
  if (!attachment) return null;
  
  if (typeof attachment === 'string') {
    return getImageUrl(attachment, folder);
  }
  
  if (attachment?.url) {
    return getImageUrl(attachment.url, folder);
  }
  
  return null;
};
