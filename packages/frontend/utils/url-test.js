// Test script to verify URL construction
const { getImageUrl } = require('../lib/imageUtils');

// Simulate different scenarios
console.log('Testing URL construction:');

// Test with local environment
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api';
console.log('Local env with image path:', getImageUrl('companies/12/factory-tour/3Z6YrfOfwDJeFlDkyM5p7K6zY9VP2QE1no7ORyYE.jpg'));

// Test with production environment
process.env.NEXT_PUBLIC_API_URL = 'https://api.pinoyglobalsupply.com/api';
console.log('Production env with image path:', getImageUrl('companies/12/factory-tour/3Z6YrfOfwDJeFlDkyM5p7K6zY9VP2QE1no7ORyYE.jpg'));

// Test with already full URL
console.log('Full URL test:', getImageUrl('https://api.pinoyglobalsupply.com/storage/companies/12/factory-tour/3Z6YrfOfwDJeFlDkyM5p7K6zY9VP2QE1no7ORyYE.jpg'));

// Test without environment variable
delete process.env.NEXT_PUBLIC_API_URL;
console.log('No env variable:', getImageUrl('companies/12/factory-tour/3Z6YrfOfwDJeFlDkyM5p7K6zY9VP2QE1no7ORyYE.jpg'));
