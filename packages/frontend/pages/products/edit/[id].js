import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../components/common/Button';
import ProductForm from '../../../components/products/ProductForm';
import apiService from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setFetchLoading(true);
      setError(null);
      const response = await apiService.getProduct(id);
      setProduct(response);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product. Please try again.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Separate images from other form data
      const { images, ...productData } = formData;
      
      console.log('Form data received:', formData);
      console.log('Images:', images);
      console.log('Product data (without images):', productData);
      
      // Update product data first
      const response = await apiService.updateProduct(id, productData);
      console.log('Product updated:', response);
      
      // Handle new images if any were added
      if (images && images.length > 0) {
        const newImageFiles = images
          .filter(img => img.file instanceof File)
          .map(img => img.file);
        
        if (newImageFiles.length > 0) {
          console.log('Uploading new images for product ID:', id);
          try {
            await apiService.uploadProductImages(id, newImageFiles);
            console.log('New images uploaded successfully');
          } catch (imageError) {
            console.error('Error uploading new images:', imageError);
            setError('Product updated but some new images failed to upload. You can add them later.');
          }
        }
      }
      
      // Redirect to products list
      router.push('/products');
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error.message || 'Failed to update product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/products');
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm text-secondary-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchProduct}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Product - {product.name} - SupplierHub</title>
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
            <h1 className="text-2xl font-bold text-secondary-900">Edit Product</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Update your product information and specifications
            </p>
          </div>
        </div>

        {/* Form */}
        <ProductForm
          product={product}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />

        {/* Product Performance */}
        <div className="bg-white p-6 rounded-lg border border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">
            Product Performance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary-50 rounded-lg">
              <div className="text-2xl font-bold text-secondary-900">245</div>
              <div className="text-sm text-secondary-600">Total Views</div>
            </div>
            <div className="text-center p-4 bg-secondary-50 rounded-lg">
              <div className="text-2xl font-bold text-secondary-900">18</div>
              <div className="text-sm text-secondary-600">Inquiries</div>
            </div>
            <div className="text-center p-4 bg-secondary-50 rounded-lg">
              <div className="text-2xl font-bold text-secondary-900">5</div>
              <div className="text-sm text-secondary-600">Orders</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg border border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">
            Recent Activity
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-secondary-100">
              <div>
                <p className="text-sm font-medium text-secondary-900">New inquiry from ABC Trading</p>
                <p className="text-xs text-secondary-500">2 hours ago</p>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-secondary-100">
              <div>
                <p className="text-sm font-medium text-secondary-900">Product viewed by XYZ Corp</p>
                <p className="text-xs text-secondary-500">5 hours ago</p>
              </div>
              <Button variant="outline" size="sm">Contact</Button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-secondary-900">Order placed for 100 units</p>
                <p className="text-xs text-secondary-500">1 day ago</p>
              </div>
              <Button variant="outline" size="sm">View Order</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
