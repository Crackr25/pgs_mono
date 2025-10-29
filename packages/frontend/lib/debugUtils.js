/**
 * Debug utility to help identify environment variable issues
 * Add this to your company-profile.js page temporarily to debug URL issues
 */

export const debugImageUrl = (imagePath) => {
  console.group('🔍 Image URL Debug');
  console.log('Original path:', imagePath);
  console.log('Environment variables:');
  console.log('  NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('  NEXT_PUBLIC_STORAGE_URL:', process.env.NEXT_PUBLIC_STORAGE_URL);
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  
  // Test the current logic
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
  let fullPath = imagePath;
  if (!fullPath.startsWith('storage/') && !fullPath.startsWith('/storage/')) {
    fullPath = `storage/${fullPath}`;
  }
  if (fullPath.startsWith('/')) {
    fullPath = fullPath.substring(1);
  }
  const finalUrl = `${baseUrl}/${fullPath}`;
  
  console.log('Processed URL:', finalUrl);
  console.log('Expected URL: https://api.pinoyglobalsupply.com/storage/' + imagePath);
  console.groupEnd();
  
  return finalUrl;
};

export const checkEnvironmentSetup = () => {
  console.group('🏗️ Environment Setup Check');
  
  const requiredVars = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_STORAGE_URL'
  ];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`${varName}:`, value || '❌ NOT SET');
  });
  
  // Check if running in production
  console.log('Production mode:', process.env.NODE_ENV === 'production');
  
  console.groupEnd();
};
