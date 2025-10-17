import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ArrowLeft,
  Search,
  Filter,
  X
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import QuickMessageModal from '../../components/common/QuickMessageModal';
import QuickQuoteModal from '../../components/common/QuickQuoteModal';
import ToastNotification from '../../components/common/ToastNotification';
import FilterSidebar from '../../components/common/FilterSidebar';
import ProductCard from '../../components/common/ProductCard';
import SortDropdown from '../../components/common/SortDropdown';
import ViewModeToggle from '../../components/common/ViewModeToggle';
import SearchResultsHeader from '../../components/common/SearchResultsHeader';
import apiService from '../../lib/api';

export default function SearchResults() {
  const router = useRouter();
  const { q: searchQuery } = router.query;
  
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
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
    search: searchQuery || '',
    sortBy: 'relevance'
    // Commented out until backend implementation:
    // supplierFeatures: [],
    // deliveryTime: '',
    // rating: ''
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const sortOptions = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Rating: High to Low', value: 'rating_desc' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Most Popular', value: 'popular' }
  ];

  useEffect(() => {
    if (searchQuery) {
      setFilters(prev => ({ ...prev, search: searchQuery }));
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchLocations();
  }, []);

  useEffect(() => {
    if (filters.search || filters.category || filters.priceRange || filters.location || filters.sortBy) {
      fetchProducts();
    }
  }, [filters.category, filters.priceRange, filters.location, filters.search, filters.sortBy, pagination.currentPage]);

  const fetchProducts = async () => {
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
        setPagination({
          currentPage: response.current_page || 1,
          totalPages: response.last_page || 1,
          totalItems: response.total || 0,
          itemsPerPage: response.per_page || 12,
          from: response.from || 0,
          to: response.to || 0
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.getMarketplaceCategories();
      setCategories(response?.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await apiService.getMarketplaceLocations();
      setLocations(response?.data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: '',
      location: '',
      search: searchQuery || '',
      sortBy: 'relevance'
      // Commented out until backend implementation:
      // supplierFeatures: [],
      // deliveryTime: '',
      // rating: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleContactProduct = (product) => {
    setSelectedProduct(product);
    setShowMessageModal(true);
  };

  const handleQuoteProduct = (product) => {
    setSelectedProduct(product);
    setShowQuoteModal(true);
  };

  const showToastNotification = (config) => {
    setToastConfig(config);
    setShowToast(true);
  };

  const handleSortChange = (sortValue) => {
    handleFilterChange('sortBy', sortValue);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  return (
    <>
      <Head>
        <title>Search Results - Pinoy Global Supply</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <Link href="/buyer">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
            
            <SearchResultsHeader
              searchQuery={searchQuery}
              totalResults={pagination.totalItems}
              from={pagination.from}
              to={pagination.to}
            />
          </div>

          {/* Controls Bar */}
          <div className="bg-white rounded-lg border border-secondary-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </Button>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-secondary-600">Sort by:</span>
                  <SortDropdown
                    value={filters.sortBy}
                    onChange={handleSortChange}
                    options={sortOptions}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {!loading && products.length > 0 && (
                  <div className="hidden sm:block text-sm text-secondary-600">
                    {pagination.from}-{pagination.to} of {pagination.totalItems} products
                  </div>
                )}
                
                <ViewModeToggle
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex space-x-6">
            {/* Filter Sidebar */}
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              categories={categories}
              locations={locations}
              isLoading={loading}
              isOpen={showMobileFilters}
              onClose={() => setShowMobileFilters(false)}
            />

            {/* Products Section */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {Array.from({ length: 12 }).map((_, index) => (
                    <ProductCardSkeleton key={index} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <Card className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">No products found</h3>
                  <p className="text-secondary-600 mb-4">
                    {searchQuery 
                      ? `No products match your search for "${searchQuery}"`
                      : "No products match your current filters"
                    }
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                </Card>
              ) : (
                <>
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {products.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        viewMode={viewMode}
                        onContact={handleContactProduct}
                        onQuote={handleQuoteProduct}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="mt-8">
                    <Pagination
                      currentPage={pagination.currentPage}
                      lastPage={pagination.totalPages}
                      total={pagination.totalItems}
                      perPage={pagination.itemsPerPage}
                      onPageChange={handlePageChange}
                      from={pagination.from}
                      to={pagination.to}
                      showPerPageSelector={false}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <QuickMessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        product={selectedProduct}
        onSuccess={(message) => {
          showToastNotification({
            type: 'success',
            title: 'Message Sent!',
            message: 'Your inquiry has been sent to the supplier.'
          });
        }}
      />

      <QuickQuoteModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        product={selectedProduct}
        onSuccess={(quote) => {
          showToastNotification({
            type: 'success',
            title: 'Quote Request Sent!',
            message: 'Your quote request has been sent to the supplier.'
          });
        }}
      />

      <ToastNotification
        show={showToast}
        onClose={() => setShowToast(false)}
        type={toastConfig.type}
        title={toastConfig.title}
        message={toastConfig.message}
      />
    </>
  );
}
