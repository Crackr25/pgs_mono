import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Storefront API functions
export const storefrontAPI = {
  // Get user's storefront
  getMyStorefront: () => api.get('/storefronts'),
  
  // Create storefront
  createStorefront: (data) => api.post('/storefronts', data),

  // Update storefront
  updateStorefront: (id, data) => api.put(`/storefronts/${id}`, data),
  
  // Upload banner
  uploadBanner: (id, file) => {
    const formData = new FormData();
    formData.append('banner', file);
    return api.post(`/storefronts/${id}/upload-banner`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  // Delete storefront
  deleteStorefront: (id) => api.delete(`/storefronts/${id}`),
  
  // Sections
  createSection: (data, images = [], videos = []) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key !== 'images' && key !== 'videos') {
        // Convert boolean to integer for Laravel validation
        let value = data[key];
        if (key === 'is_visible') {
          value = data[key] ? 1 : 0;
        } else if (typeof data[key] === 'object') {
          value = JSON.stringify(data[key]);
        }
        formData.append(key, value);
      }
    });
    // Only append images if they exist (not null or empty)
    if (images && images.length > 0) {
      images.forEach(image => formData.append('images[]', image));
    }
    // Only append videos if they exist (not null or empty)
    if (videos && videos.length > 0) {
      videos.forEach(video => formData.append('videos[]', video));
    }
    return api.post('/storefront-sections', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  updateSection: (id, data, images = [], videos = []) => {
    const formData = new FormData();
    formData.append('_method', 'PUT'); // Laravel method spoofing for file uploads
    Object.keys(data).forEach(key => {
      if (key !== 'images' && key !== 'videos') {
        // Convert boolean to integer for Laravel validation
        let value = data[key];
        if (key === 'is_visible') {
          value = data[key] ? 1 : 0;
        } else if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
          value = JSON.stringify(data[key]);
        } else if (Array.isArray(data[key])) {
          // Handle arrays like delete_images, delete_videos
          data[key].forEach(item => {
            formData.append(`${key}[]`, item);
          });
          return; // Skip the formData.append below
        }
        formData.append(key, value);
      }
    });
    // Only append images if they exist (not null or empty)
    if (images && images.length > 0) {
      images.forEach(image => formData.append('images[]', image));
    }
    // Only append videos if they exist (not null or empty)
    if (videos && videos.length > 0) {
      videos.forEach(video => formData.append('videos[]', video));
    }
    // Use POST with _method=PUT for file uploads (Laravel requirement)
    return api.post(`/storefront-sections/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  deleteSection: (id) => api.delete(`/storefront-sections/${id}`),
  
  // Themes
  getThemes: () => api.get('/storefront-themes'),
  
  getTheme: (id) => api.get(`/storefront-themes/${id}`),
  
  // Public view (no auth)
  getPublicStorefront: (slug) => api.get(`/public/storefront/${slug}`),
  
  // Dynamic-Style Pages (auth required)
  getPages: () => api.get('/storefront/pages'),
  getPage: (slug) => api.get(`/storefront/pages/${slug}`),
  createPage: (data) => api.post('/storefront/pages', data),
  updatePage: (id, data) => api.put(`/storefront/pages/${id}`, data),
  deletePage: (id) => api.delete(`/storefront/pages/${id}`),
  
  // Dynamic-Style Menu Items (auth required)
  getMenuItems: () => api.get('/storefront/menu'),
  createMenuItem: (data) => api.post('/storefront/menu', data),
  updateMenuItem: (id, data) => api.put(`/storefront/menu/${id}`, data),
  deleteMenuItem: (id) => api.delete(`/storefront/menu/${id}`),
  reorderMenu: (items) => api.post('/storefront/menu/reorder', { items }),
  
  // Public page view (no auth)
  getPublicPage: (storefrontSlug, pageSlug) => 
    api.get(`/public/storefront/${storefrontSlug}/page/${pageSlug}`),
};

// Helper function to get full image URL
export const getImageUrl = (path) => {
  if (!path) return null;
  
  // Handle object with path property (for product images: {id, image_path, ...} or {id, path, ...})
  if (typeof path === 'object') {
    path = path.image_path || path.path || path;
  }
  
  // Convert to string if it's not already
  path = String(path);
  
  // If already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Clean up any malformed paths that might contain domain fragments
  // Remove any leading domain-like patterns (e.g., ".pinoyglobalsupply.com/api/")
  path = path.replace(/^\.?[^\/]*pinoyglobalsupply\.com\/?(api\/)?/, '');
  
  // Remove any leading "storage/" if it exists (we'll add it back)
  path = path.replace(/^storage\//, '');
  
  // Remove any leading slashes
  path = path.replace(/^\/+/, '');
  
  // Use NEXT_PUBLIC_STORAGE_URL if available, otherwise construct from API_URL
  const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || API_URL.replace('/api', '') + '/storage';
  
  // Ensure storage URL doesn't end with slash and path doesn't start with slash
  const cleanStorageUrl = storageUrl.replace(/\/$/, '');
  
  return `${cleanStorageUrl}/${path}`;
};