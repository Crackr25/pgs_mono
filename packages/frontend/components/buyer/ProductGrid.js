import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  Filter, 
  Grid, 
  List, 
  MapPin, 
  MessageSquare, 
  ShoppingCart,
  Package,
  X,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Pagination from '../common/Pagination';
import { ProductCardSkeleton } from '../common/Skeleton';
import QuickMessageModal from '../common/QuickMessageModal';
import ToastNotification from '../common/ToastNotification';
import apiService from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function ProductGrid({ hideFilters = false }) {
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const { user } = useAuth();
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
    from: 0,
    to: 0
  });
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    location: '',
    search: '',
    sortBy: 'relevance'
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({});
  const isInitialMount = useRef(true);
  const [quoteQuantity, setQuoteQuantity] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [quoteDeadline, setQuoteDeadline] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [submittingQuote, setSubmittingQuote] = useState(false);

  const priceRanges = [
    { label: 'Under $100', value: '0-100' },
    { label: '$100 - $500', value: '100-500' },
    { label: '$500 - $1,000', value: '500-1000' },
    { label: '$1,000 - $5,000', value: '1000-5000' },
    { label: 'Over $5,000', value: '5000+' }
  ];

  const sortOptions = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Rating', value: 'rating' },
    { label: 'Newest', value: 'newest' }
  ];

  const showToastNotification = (type, title, message, duration = 5000) => {
    setToastConfig({ type, title, message, duration });
    setShowToast(true);
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      
      const response = await apiService.getMarketplaceProducts(params);
      
      if (response && response.data) {
        setProducts(response.data);
        setPagination(prev => ({
          ...prev,
          currentPage: response.current_page || 1,
          totalPages: response.last_page || 1,
          totalItems: response.total || 0,
          itemsPerPage: response.per_page || 12,
          from: response.from || 0,
          to: response.to || 0
        }));
      } else {
        setProducts([]);
        setPagination(prev => ({
          ...prev,
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          from: 0,
          to: 0
        }));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setPagination(prev => ({
        ...prev,
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        from: 0,
        to: 0
      }));
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, filters]);

  useEffect(() => {
    fetchCategories();
    fetchLocations();
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
    fetchProducts();
  }, [pagination.currentPage, filters, fetchProducts]);

  const handleQuoteRequest = async () => {
    if (submittingQuote) return;

    // Validation
    if (!quoteQuantity || quoteQuantity < 1) {
      showToastNotification('error', 'Invalid Quantity', 'Please enter a valid quantity');
      return;
    }
    // MOQ validation - like Alibaba
    const minQuantity = selectedProduct.moq || 1;
    if (parseInt(quoteQuantity) < minQuantity) {
      showToastNotification(
        'warning', 
        'Minimum Order Quantity', 
        `Quantity must be at least ${minQuantity} ${selectedProduct.unit} (Minimum Order Quantity). Please adjust your quantity.`
      );
      return;
    }
    
    if (!quoteDeadline) {
      showToastNotification('error', 'Missing Deadline', 'Please select a deadline');
      return;
    }

    if (!quoteMessage.trim()) {
      showToastNotification('error', 'Missing Message', 'Please enter a message');
      return;
    }

   

    try {
      setSubmittingQuote(true);

      const quoteData = {
        product_id: selectedProduct.id,
        company_id: selectedProduct.company.id,
        buyer_name: user?.name || user?.full_name || 'Anonymous Buyer',
        buyer_email: user?.email || '',
        buyer_company: user?.company_name || user?.company || '',
        quantity: parseInt(quoteQuantity),
        target_price: targetPrice ? parseFloat(targetPrice) : null,
        deadline: quoteDeadline,
        message: quoteMessage.trim()
      };

      console.log('User object:', user); // Debug log
      console.log('Sending quote data:', quoteData); // Debug log

      const response = await apiService.createQuote(quoteData);
      
      console.log('Quote response:', response); // Debug log
      
      if (response.success !== false) {
        showToastNotification(
          'quote',
          'Quote request submitted successfully!',
          'The supplier will respond soon. You can track your quote requests in your dashboard.',
          6000
        );
        setShowQuoteModal(false);
        // Reset form
        setQuoteQuantity('');
        setTargetPrice('');
        setQuoteDeadline('');
        setQuoteMessage('');
      } else {
        throw new Error(response.message || 'Failed to submit quote request');
      }

    } catch (error) {
      console.error('Error submitting quote request:', error);
      
      // More detailed error handling for Laravel validation
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.errors) {
          // Laravel validation errors
          const errorMessages = Object.values(errorData.errors).flat();
          showToastNotification(
            'error',
            'Validation Error',
            errorMessages.join(', ')
          );
        } else if (errorData.message) {
          showToastNotification('error', 'Error', errorData.message);
        } else {
          showToastNotification(
            'error',
            'Request Failed',
            'Failed to submit quote request. Please try again.'
          );
        }
      } else if (error.message) {
        showToastNotification('error', 'Error', error.message);
      } else {
        showToastNotification(
          'error',
          'Network Error',
          'Failed to submit quote request. Please check your connection and try again.'
        );
      }
    } finally {
      setSubmittingQuote(false);
    }
  };

  const openQuoteModal = (product) => {
    // Pre-populate form with product details

    
    setQuoteQuantity(product.moq || 1);
    setQuoteMessage(`Hi, I'm interested in getting a quote for your ${product.name}. Please provide your best pricing and terms.`);
    setSelectedProduct(product);
    // Set default deadline to tomorrow (Laravel requires after:today)
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 1); // Tomorrow, not today
    setQuoteDeadline(defaultDeadline.toISOString().split('T')[0]);
    
    setShowQuoteModal(true);
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.getMarketplaceCategories();
      if (response && response.data) {
        setCategories(response.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await apiService.getMarketplaceLocations();
      if (response && response.data) {
        setLocations(response.data);
      } else {
        setLocations([]);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    // Reset to page 1 when filters change
    if (pagination.currentPage !== 1) {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    if (pagination.currentPage !== 1) {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }
  };

  const clearFilters = () => {
    const newFilters = {
      category: '',
      priceRange: '',
      location: '',
      search: '',
      sortBy: 'relevance'
    };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleContactProduct = (product) => {
    setSelectedProduct(product);
    setShowMessageModal(true);
  };


  const handleModalSuccess = (toastData) => {
    setToastConfig(toastData);
    setShowToast(true);
  };

  const closeModals = () => {
    setShowMessageModal(false);
    setShowQuoteModal(false);
    setSelectedProduct(null);
  };


  const ProductCard = ({ product }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 group h-full flex flex-col">
      <Link href={`/buyer/products/${product.id}`}>
        <div className="cursor-pointer flex-1 flex flex-col">
          <div className="relative">
            {product.has_image ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}${product.image}`}
                alt={product.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors duration-200">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-500">No Image Available</p>
                </div>
              </div>
            )}
            {product.company.verified && (
              <span className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                Verified
              </span>
            )}
          </div>
          
          <div className="p-4 flex-1 flex flex-col">
            <h4 className="font-small text-secondary-900 h-12 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200 overflow-hidden">
              {product.name}
            </h4>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-primary-600">
                ${parseFloat(product.price).toFixed(2)}{product.unit ? `/${product.unit}` : ''}
              </span>
              <span className="text-sm text-secondary-500">MOQ: {product.moq}</span>
            </div>
            
            <div className="flex items-center space-x-1 mb-2">
              <MapPin className="w-4 h-4 text-secondary-400" />
              <span className="text-sm text-secondary-600 truncate">{product.company.location}</span>
            </div>
            
            <div className="mb-2">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {product.category}
              </span>
            </div>
            
            <div className="mb-3 mt-auto">
              <p className="text-sm font-medium text-secondary-900 truncate">{product.company.name}</p>
              <p className="text-xs text-secondary-500">Lead time: {product.lead_time}</p>
            </div>
          </div>
        </div>
      </Link>
      
      <div className="px-4 pb-4 mt-auto">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleContactProduct(product);
            }}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Message
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openQuoteModal(product);
            }}
          >
            <DollarSign className="w-4 h-4 mr-1" />
            Quote
          </Button>
        </div>
      </div>
    </Card>
  );

  if (loading && products.length === 0) {
    return (
      <div className="space-y-6">
        {/* Filter Bar Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-16 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Skeleton Product Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  

  return (
    <div className="space-y-6">
      {/* Filter Bar - Hidden on homepage */}
      {!hideFilters && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
            
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-secondary-600">
              {pagination.from}-{pagination.to} of {pagination.totalItems} products
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
      )}

      {/* Filters Panel - Hidden on homepage */}
      {!hideFilters && showFilters && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-secondary-900">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Category</label>
              {categories.length === 0 ? (
                <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              ) : (
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Price Range</label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any Price</option>
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Location</label>
              {locations.length === 0 ? (
                <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              ) : (
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search products..."
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Product Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {products.length === 0 && !loading ? (
          <div className="col-span-full text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          products.map(product => (
            <ProductCard key={`product-${product.id}`} product={product} />
          ))
        )}
        {loading && (
          Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={`loading-skeleton-${index}`} />
          ))
        )}
      </div>

      {/* Pagination - Always show if there are products */}
      
      {products.length > 0 && (
        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse ml-4"></div>
            </div>
          ) : (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={handlePageChange}
              paginationInfo={{
                from: pagination.from,
                to: pagination.to,
                total: pagination.totalItems
              }}
            />
          )}
        </div>
      )}

      {/* Quick Message Modal */}
      <QuickMessageModal
        isOpen={showMessageModal}
        onClose={closeModals}
        product={selectedProduct}
        onSuccess={handleModalSuccess}
      />


      {/* Toast Notification */}
      <ToastNotification
        show={showToast}
        onClose={() => setShowToast(false)}
        type={toastConfig.type}
        title={toastConfig.title}
        message={toastConfig.message}
        duration={toastConfig.duration}
      />

      {/* Quote Request Modal */}
      {showQuoteModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900">Request Quote</h3>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="text-secondary-400 hover:text-secondary-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Product Info Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-secondary-900">{selectedProduct?.name}</h4>
                  <p className="text-sm text-secondary-600">{selectedProduct?.company?.name}</p>
                  <p className="text-sm text-primary-600 font-medium">${selectedProduct?.price}/piece</p>
                </div>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleQuoteRequest(); }} className="space-y-4">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Quantity *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={quoteQuantity}
                    onChange={(e) => setQuoteQuantity(e.target.value)}
                    min={selectedProduct?.moq || 1}
                    placeholder={`Min: ${selectedProduct?.moq || 1} ${selectedProduct?.unit}`}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      quoteQuantity && parseInt(quoteQuantity) < (selectedProduct?.moq || 1)
                        ? 'border-red-300 bg-red-50'
                        : 'border-secondary-300'
                    }`}
                    required
                  />
                  <span className="absolute right-3 top-2 text-sm text-secondary-500">
                    {selectedProduct?.unit}
                  </span>
                </div>
                <div className="mt-1 space-y-1">
                  <p className="text-xs text-secondary-500">
                    Minimum order: {selectedProduct?.moq} {selectedProduct?.unit}
                  </p>
                  {quoteQuantity && parseInt(quoteQuantity) < (selectedProduct?.moq || 1) && (
                    <p className="text-xs text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Quantity must be at least {selectedProduct?.moq} {selectedProduct?.unit}
                    </p>
                  )}
                </div>
              </div>

              {/* Target Price (Optional) */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Target Price per {selectedProduct?.unit} (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-secondary-500">$</span>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    step="0.01"
                    placeholder="Enter your target price"
                    className="w-full pl-8 pr-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Response Deadline *
                </label>
                <input
                  type="date"
                  value={quoteDeadline}
                  onChange={(e) => setQuoteDeadline(e.target.value)}
                  min={(() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return tomorrow.toISOString().split('T')[0];
                  })()}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Message *
                </label>
                <textarea
                  value={quoteMessage}
                  onChange={(e) => setQuoteMessage(e.target.value)}
                  rows={4}
                  placeholder="Please provide details about your requirements..."
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  required
                />
              </div>

              {/* Helper message when form is invalid */}
              {(quoteQuantity && parseInt(quoteQuantity) < (selectedProduct?.moq || 1)) && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-orange-800">
                      <p className="font-medium">Cannot proceed with current quantity</p>
                      <p className="mt-1">
                        This supplier requires a minimum order of <strong>{selectedProduct?.moq} {selectedProduct?.unit}</strong>. 
                        Please adjust your quantity to meet the minimum requirement.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModals}
                  className="flex-1"
                  disabled={submittingQuote}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                  disabled={
                    submittingQuote || 
                    !quoteQuantity || 
                    parseInt(quoteQuantity) < (selectedProduct?.moq || 1) ||
                    !quoteDeadline ||
                    !quoteMessage.trim()
                  }
                >
                  {submittingQuote ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Send Quote Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
