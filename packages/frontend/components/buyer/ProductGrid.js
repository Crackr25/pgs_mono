import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Filter, 
  Grid, 
  List, 
  Star, 
  MapPin, 
  MessageSquare, 
  ShoppingCart,
  ChevronDown,
  X
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Pagination from '../common/Pagination';
import { ProductCardSkeleton, FilterSkeleton } from '../common/Skeleton';
import apiService from '../../lib/api';

export default function ProductGrid() {
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
    search: '',
    sortBy: 'relevance'
  });
  const isInitialMount = useRef(true);


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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchLocations();
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchProducts();
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
      
      setProducts(response.data);
      setPagination({
        currentPage: response.current_page,
        totalPages: response.last_page,
        totalItems: response.total,
        itemsPerPage: response.per_page,
        from: response.from || 0,
        to: response.to || 0
      });
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
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await apiService.getMarketplaceLocations();
      setLocations(response.data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: '',
      location: '',
      search: '',
      sortBy: 'relevance'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const renderStars = (rating) => {
    const numRating = parseFloat(rating) || 0;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(numRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
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
              // TODO: Implement quick contact functionality
              console.log('Quick contact for product:', product.id);
            }}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Contact
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
      {/* Filter Bar */}
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

      {/* Filters Panel */}
      {showFilters && (
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
        {loading && products.length > 0 ? (
          // Show existing products with skeleton for new ones during pagination
          [...products.map(product => (
            <ProductCard key={product.id} product={product} />
          )), ...Array.from({ length: 6 }).map((_, index) => (
            <ProductCardSkeleton key={`skeleton-${index}`} />
          ))]
        ) : (
          products.map(product => (
            <ProductCard key={product.id} product={product} />
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
    </div>
  );
}
