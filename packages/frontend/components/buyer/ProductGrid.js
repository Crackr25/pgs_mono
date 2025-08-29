import { useState, useEffect } from 'react';
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

export default function ProductGrid() {
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    rating: '',
    location: '',
    sortBy: 'relevance'
  });

  const categories = [
    'Electronics & Electrical',
    'Machinery & Industrial Equipment',
    'Construction & Building Materials',
    'Textiles & Apparel',
    'Food & Agriculture',
    'Automotive & Transportation',
    'Home & Garden',
    'Health & Medical'
  ];

  const priceRanges = [
    { label: 'Under $100', value: '0-100' },
    { label: '$100 - $500', value: '100-500' },
    { label: '$500 - $1,000', value: '500-1000' },
    { label: '$1,000 - $5,000', value: '1000-5000' },
    { label: 'Over $5,000', value: '5000+' }
  ];

  const locations = [
    'Metro Manila',
    'Cebu',
    'Davao',
    'Laguna',
    'Cavite',
    'Bulacan',
    'Pampanga',
    'Batangas'
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
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Mock product data - replace with actual API call
      const mockProducts = [
        {
          id: 1,
          title: 'LED Light Fixtures - Industrial Grade',
          price: '$25.00',
          minOrder: '100 pieces',
          supplier: 'Manila Manufacturing Corp',
          location: 'Metro Manila',
          rating: 4.8,
          reviews: 156,
          image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop',
          verified: true,
          responseTime: '< 2 hours'
        },
        {
          id: 2,
          title: 'Industrial Water Pumps - Heavy Duty',
          price: '$850.00',
          minOrder: '10 units',
          supplier: 'Cebu Industrial Solutions',
          location: 'Cebu',
          rating: 4.9,
          reviews: 89,
          image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop',
          verified: true,
          responseTime: '< 4 hours'
        },
        {
          id: 3,
          title: 'Steel Pipes - Galvanized',
          price: '$45.00/meter',
          minOrder: '50 meters',
          supplier: 'Davao Steel Works',
          location: 'Davao',
          rating: 4.7,
          reviews: 234,
          image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=300&h=200&fit=crop',
          verified: true,
          responseTime: '< 1 hour'
        },
        {
          id: 4,
          title: 'Construction Safety Equipment',
          price: '$15.00',
          minOrder: '200 pieces',
          supplier: 'Safety First Philippines',
          location: 'Laguna',
          rating: 4.6,
          reviews: 67,
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
          verified: false,
          responseTime: '< 6 hours'
        },
        {
          id: 5,
          title: 'Electronic Components - Resistors',
          price: '$0.50',
          minOrder: '1000 pieces',
          supplier: 'Tech Components Inc',
          location: 'Metro Manila',
          rating: 4.5,
          reviews: 445,
          image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop',
          verified: true,
          responseTime: '< 3 hours'
        },
        {
          id: 6,
          title: 'Textile Fabric - Cotton Blend',
          price: '$8.00/yard',
          minOrder: '100 yards',
          supplier: 'Philippine Textiles Co',
          location: 'Pampanga',
          rating: 4.8,
          reviews: 178,
          image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=300&h=200&fit=crop',
          verified: true,
          responseTime: '< 2 hours'
        }
      ];

      setProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: '',
      rating: '',
      location: '',
      sortBy: 'relevance'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const ProductCard = ({ product }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-48 object-cover"
        />
        {product.verified && (
          <span className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
            Verified
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-secondary-900 mb-2 line-clamp-2">
          {product.title}
        </h3>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-primary-600">{product.price}</span>
          <span className="text-sm text-secondary-500">Min: {product.minOrder}</span>
        </div>
        
        <div className="flex items-center space-x-1 mb-2">
          {renderStars(product.rating)}
          <span className="text-sm text-secondary-600">({product.reviews})</span>
        </div>
        
        <div className="flex items-center space-x-1 mb-2">
          <MapPin className="w-4 h-4 text-secondary-400" />
          <span className="text-sm text-secondary-600">{product.location}</span>
        </div>
        
        <div className="mb-3">
          <p className="text-sm font-medium text-secondary-900">{product.supplier}</p>
          <p className="text-xs text-secondary-500">Response: {product.responseTime}</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1">
            <MessageSquare className="w-4 h-4 mr-1" />
            Contact
          </Button>
          <Button size="sm" className="flex-1">
            <ShoppingCart className="w-4 h-4 mr-1" />
            Order
          </Button>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
          <span className="text-sm text-secondary-600">{products.length} products</span>
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
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Min Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
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
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
