import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Bookmark, 
  Search, 
  Plus, 
  Heart,
  Star,
  Trash2,
  Eye,
  Filter,
  Grid,
  List,
  Package,
  MapPin,
  DollarSign,
  AlertCircle,
  Building,
  Shield,
  Clock
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Skeleton from '../../../components/common/Skeleton';
import { useAuth } from '../../../contexts/AuthContext';
import apiService from '../../../lib/api';

export default function BuyerLists() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [savedProducts, setSavedProducts] = useState([]);
  const [starredSuppliers, setStarredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchSavedProducts();
    } else {
      fetchStarredSuppliers();
    }
  }, [activeTab, currentPage, searchQuery]);

  const fetchSavedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        per_page: 12,
        search: searchQuery
      };

      const response = await apiService.getSavedProducts(params);
      
      setSavedProducts(response.data?.data || []);
      setCurrentPage(response.data?.current_page || 1);
      setTotalPages(response.data?.last_page || 1);
      setTotalItems(response.data?.total || 0);
    } catch (error) {
      console.error('Error fetching saved products:', error);
      setError('Failed to load saved products');
      setSavedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStarredSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        per_page: 12,
        search: searchQuery
      };

      const response = await apiService.getStarredSuppliers(params);
      
      console.log('Starred suppliers response:', response);
      
      // StarredSupplierController returns direct pagination response
      setStarredSuppliers(response.data || []);
      setCurrentPage(response.current_page || 1);
      setTotalPages(response.last_page || 1);
      setTotalItems(response.total || 0);
    } catch (error) {
      console.error('Error fetching starred suppliers:', error);
      setError('Failed to load starred suppliers');
      setStarredSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProduct = async (productId) => {
    try {
      await apiService.unsaveProduct(productId);
      // Refresh the list
      fetchSavedProducts();
    } catch (error) {
      console.error('Error removing saved product:', error);
      alert('Failed to remove product from saved list');
    }
  };

  const handleRemoveSupplier = async (supplierId) => {
    try {
      await apiService.unstarSupplier(supplierId);
      // Refresh the list
      fetchStarredSuppliers();
    } catch (error) {
      console.error('Error removing starred supplier:', error);
      alert('Failed to remove supplier from starred list');
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery('');
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-secondary-300'
        }`}
      />
    ));
  };

  const ProductCard = ({ savedProduct }) => {
    const product = savedProduct.product;
    
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* Product Image */}
        <div className="relative aspect-square bg-secondary-100">
          {product.images && product.images.length > 0 ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}${product.images[0]}`}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="w-12 h-12 text-secondary-400" />
            </div>
          )}
          
          {/* Remove button */}
          <button
            onClick={() => handleRemoveProduct(product.id)}
            className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="mb-2">
            <Link href={`/buyer/products/${product.id}`}>
              <h3 className="font-medium text-secondary-900 hover:text-primary-600 cursor-pointer line-clamp-2">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-secondary-600 mt-1 line-clamp-2">
              {product.description}
            </p>
          </div>

          {/* Price */}
          <div className="mb-3">
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-bold text-primary-600">
                ${product.price}
              </span>
              <span className="text-sm text-secondary-600">per {product.unit}</span>
            </div>
            <div className="text-xs text-secondary-500">
              MOQ: {product.moq} {product.unit}
            </div>
          </div>

          {/* Company Info */}
          <div className="mb-3 pb-3 border-b border-secondary-100">
            <div className="flex items-center space-x-2">
              <MapPin className="w-3 h-3 text-secondary-400" />
              <span className="text-xs text-secondary-600">{product.company?.name}</span>
            </div>
            <div className="flex items-center space-x-1 mt-1">
              {renderStars(product.company?.rating || 0)}
              <span className="text-xs text-secondary-500 ml-1">
                ({product.company?.total_reviews || 0})
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Link href={`/buyer/products/${product.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleRemoveProduct(product.id)}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <Heart className="w-4 h-4 fill-current" />
            </Button>
          </div>

          {/* Saved Date */}
          <div className="mt-2 text-xs text-secondary-500 text-center">
            Saved {new Date(savedProduct.created_at).toLocaleDateString()}
          </div>
        </div>
      </Card>
    );
  };

  const SupplierCard = ({ starredSupplier }) => {
    const supplier = starredSupplier.supplier;
    
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* Supplier Header */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Building className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Link href={`/buyer/suppliers/${supplier.id}`}>
                    <h3 className="font-medium text-secondary-900 hover:text-primary-600 cursor-pointer">
                      {supplier.name}
                    </h3>
                  </Link>
                  {supplier.verified && (
                    <Shield className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="flex items-center space-x-1 text-sm text-secondary-600 mb-2">
                  <MapPin className="w-3 h-3" />
                  <span>{supplier.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {renderStars(supplier.rating || 0)}
                  <span className="text-xs text-secondary-500 ml-1">
                    ({supplier.total_reviews || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
            
            {/* Remove button */}
            <button
              onClick={() => handleRemoveSupplier(supplier.id)}
              className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <p className="text-secondary-700 text-sm mb-4 line-clamp-2">
            {supplier.about || 'No description available'}
          </p>

          {/* Supplier Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3 text-secondary-400" />
              <span className="text-secondary-600">Est. {supplier.established || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Package className="w-3 h-3 text-secondary-400" />
              <span className="text-secondary-600">{supplier.total_products || 0} products</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Link href={`/buyer/suppliers/${supplier.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-1" />
                View Profile
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleRemoveSupplier(supplier.id)}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            </Button>
          </div>

          {/* Starred Date */}
          <div className="mt-3 text-xs text-secondary-500 text-center">
            Starred {new Date(starredSupplier.created_at).toLocaleDateString()}
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Saved Products</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchSavedProducts}>Try Again</Button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{activeTab === 'products' ? 'Saved Products' : 'Starred Suppliers'} - Pinoy Global Supply</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">My Lists</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Your saved products and starred suppliers
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Link href="/buyer">
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-secondary-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => handleTabChange('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'products'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              <Heart className="w-4 h-4 inline mr-2" />
              Saved Products
            </button>
            <button
              onClick={() => handleTabChange('suppliers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'suppliers'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              <Star className="w-4 h-4 inline mr-2" />
              Starred Suppliers
            </button>
          </nav>
        </div>

        {/* Search and View Controls */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'products' ? 'saved products' : 'starred suppliers'}...`}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-secondary-600">
                {totalItems} {activeTab === 'products' ? 'products' : 'suppliers'}
              </span>
              <div className="flex border border-secondary-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-secondary-600 hover:bg-secondary-100'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-secondary-600 hover:bg-secondary-100'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Content Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? activeTab === 'products'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
        }`}>
          {activeTab === 'products' 
            ? savedProducts.map(savedProduct => (
                <ProductCard key={savedProduct.id} savedProduct={savedProduct} />
              ))
            : starredSuppliers.map(starredSupplier => (
                <SupplierCard key={starredSupplier.id} starredSupplier={starredSupplier} />
              ))
          }
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'products' && savedProducts.length === 0) || 
          (activeTab === 'suppliers' && starredSuppliers.length === 0)) && (
          <Card className="p-12 text-center">
            {activeTab === 'products' ? (
              <>
                <Heart className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">No saved products</h3>
                <p className="text-secondary-600 mb-4">
                  {searchQuery ? 'No products match your search criteria.' : 'Start saving products to see them here.'}
                </p>
                {!searchQuery && (
                  <Link href="/buyer">
                    <Button>
                      <Search className="w-4 h-4 mr-2" />
                      Browse Products
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Star className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">No starred suppliers</h3>
                <p className="text-secondary-600 mb-4">
                  {searchQuery ? 'No suppliers match your search criteria.' : 'Start starring suppliers to see them here.'}
                </p>
                {!searchQuery && (
                  <Link href="/buyer/suppliers">
                    <Button>
                      <Search className="w-4 h-4 mr-2" />
                      Browse Suppliers
                    </Button>
                  </Link>
                )}
              </>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
