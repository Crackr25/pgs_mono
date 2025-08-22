import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import ProductForm from '../../components/products/ProductForm';
import apiService from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AddProduct() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userCompany, setUserCompany] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchUserCompany();
  }, []);

  const fetchUserCompany = async () => {
    try {
      // Get user's company - assuming user has a company
      const companies = await apiService.getCompanies({ user_id: user?.id });
      if (companies.data && companies.data.length > 0) {
        setUserCompany(companies.data[0]);
      }
    } catch (error) {
      console.error('Error fetching user company:', error);
      setError('Please complete your company profile first');
    }
  };

  const handleSubmit = async (formData) => {
    if (!userCompany) {
      setError('Please complete your company profile first');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Separate images from other form data
      const { images, ...productData } = formData;
      
      console.log('Form data received:', formData);
      console.log('Images:', images);
      console.log('Product data (without images):', productData);
      
      const productPayload = {
        ...productData,
        company_id: userCompany.id
      };

      // Create product first (without images)
      const response = await apiService.createProduct(productPayload);
      console.log('Product created:', response);
      
      // Upload images if any were selected
      if (images && images.length > 0) {
        const imageFiles = images.filter(img => img.file instanceof File).map(img => img.file);
        if (imageFiles.length > 0) {
          console.log('Uploading images for product ID:', response.id);
          try {
            await apiService.uploadProductImages(response.id, imageFiles);
            console.log('Images uploaded successfully');
          } catch (imageError) {
            console.error('Error uploading images:', imageError);
            // Don't fail the whole process if image upload fails
            setError('Product created but some images failed to upload. You can add them later.');
          }
        }
      } else {
        console.log('No images to upload');
      }
      
      // Redirect to products list
      router.push('/products');
    } catch (error) {
      console.error('Error creating product:', error);
      setError(error.message || 'Failed to create product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/products');
  };

  return (
    <>
      <Head>
        <title>Add Product - SupplierHub</title>
      </Head>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Add New Product</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Create a new product listing to showcase to potential buyers
            </p>
          </div>
        </div>

        {/* Form */}
        <ProductForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Tips for Better Product Listings
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use clear, descriptive product names</li>
            <li>• Include detailed specifications and features</li>
            <li>• Upload high-quality images from multiple angles</li>
            <li>• Set competitive pricing based on market research</li>
            <li>• Use accurate HS codes for international shipping</li>
            <li>• Specify realistic lead times and MOQ requirements</li>
          </ul>
        </div>
      </div>
    </>
  );
}
