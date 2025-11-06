import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Users, 
  Package, 
  MessageSquare,
  Eye,
  Heart,
  Award,
  TrendingUp,
  Clock
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import { useAuth } from '../../../contexts/AuthContext';
import apiService from '../../../lib/api';

export default function Suppliers() {
  const { user, isAuthenticated } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    rating: '',
    certification: '',
    sortBy: 'rating'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState({
    from: 0,
    to: 0,
    total: 0
  });

  const categories = [
    'Electronics & Electrical',
    'Industrial Equipment',
    'Construction Materials',
    'Textiles & Apparel',
    'Food & Beverages',
    'Automotive Parts',
    'Chemicals & Materials',
    'Furniture & Home Decor',
    'Medical & Healthcare',
    'Agriculture & Farming'
  ];

  const locations = [
    'Metro Manila',
    'Cebu',
    'Davao',
    'Iloilo',
    'Cagayan de Oro',
    'Bacolod',
    'General Santos',
    'Zamboanga',
    'Baguio',
    'Batangas'
  ];

  const certifications = [
    'ISO 9001',
    'ISO 14001',
    'OHSAS 18001',
    'FDA Approved',
    'CE Certified',
    'PEZA Registered',
    'DTI Registered',
    'BIR Registered'
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchSuppliers();
    }
  }, [isAuthenticated, currentPage, searchTerm, filters]);

  const fetchSuppliers = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for now - replace with actual API calls
      const mockSuppliers = [
        {
          id: 1,
          company_name: 'Manila Manufacturing Corp',
          description: 'Leading manufacturer of electronic components and LED lighting solutions',
          logo: null,
          location: 'Metro Manila',
          rating: 4.8,
          reviews_count: 156,
          categories: ['Electronics & Electrical', 'Industrial Equipment'],
          certifications: ['ISO 9001', 'CE Certified', 'PEZA Registered'],
          products_count: 245,
          years_in_business: 15,
          response_time: '2 hours',
          verified: true,
          featured: true,
          contact_person: 'Juan Dela Cruz',
          phone: '+63 2 8123 4567',
          email: 'sales@manilamfg.com',
          website: 'www.manilamfg.com',
          established_year: 2009,
          employees: '100-500',
          export_countries: ['USA', 'Japan', 'Singapore', 'Australia']
        },
        {
          id: 2,
          company_name: 'Cebu Industrial Solutions',
          description: 'Specialized in heavy machinery and industrial equipment manufacturing',
          logo: null,
          location: 'Cebu',
          rating: 4.9,
          reviews_count: 203,
          categories: ['Industrial Equipment', 'Construction Materials'],
          certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
          products_count: 189,
          years_in_business: 22,
          response_time: '1 hour',
          verified: true,
          featured: false,
          contact_person: 'Maria Santos',
          phone: '+63 32 234 5678',
          email: 'info@cebuindustrial.com',
          website: 'www.cebuindustrial.com',
          established_year: 2002,
          employees: '500-1000',
          export_countries: ['Thailand', 'Vietnam', 'Malaysia', 'Indonesia']
        },
        {
          id: 3,
          company_name: 'Davao Steel Works',
          description: 'Premium steel fabrication and construction materials supplier',
          logo: null,
          location: 'Davao',
          rating: 4.7,
          reviews_count: 98,
          categories: ['Construction Materials', 'Industrial Equipment'],
          certifications: ['ISO 9001', 'DTI Registered', 'BIR Registered'],
          products_count: 156,
          years_in_business: 18,
          response_time: '3 hours',
          verified: true,
          featured: false,
          contact_person: 'Roberto Garcia',
          phone: '+63 82 345 6789',
          email: 'sales@davaosteel.com',
          website: 'www.davaosteel.com',
          established_year: 2006,
          employees: '50-100',
          export_countries: ['Brunei', 'Papua New Guinea']
        },
        {
          id: 4,
          company_name: 'Iloilo Textile Mills',
          description: 'High-quality textile and apparel manufacturing since 1995',
          logo: null,
          location: 'Iloilo',
          rating: 4.6,
          reviews_count: 134,
          categories: ['Textiles & Apparel'],
          certifications: ['ISO 9001', 'PEZA Registered', 'FDA Approved'],
          products_count: 312,
          years_in_business: 29,
          response_time: '4 hours',
          verified: true,
          featured: true,
          contact_person: 'Ana Reyes',
          phone: '+63 33 456 7890',
          email: 'orders@iloilotextile.com',
          website: 'www.iloilotextile.com',
          established_year: 1995,
          employees: '200-500',
          export_countries: ['USA', 'Canada', 'Europe', 'Australia']
        }
      ];

      // Apply filters
      let filteredSuppliers = mockSuppliers;
      
      if (searchTerm) {
        filteredSuppliers = filteredSuppliers.filter(supplier =>
          supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      if (filters.category) {
        filteredSuppliers = filteredSuppliers.filter(supplier =>
          supplier.categories.includes(filters.category)
        );
      }

      if (filters.location) {
        filteredSuppliers = filteredSuppliers.filter(supplier =>
          supplier.location === filters.location
        );
      }

      if (filters.rating) {
        const minRating = parseFloat(filters.rating);
        filteredSuppliers = filteredSuppliers.filter(supplier =>
          supplier.rating >= minRating
        );
      }

      if (filters.certification) {
        filteredSuppliers = filteredSuppliers.filter(supplier =>
          supplier.certifications.includes(filters.certification)
        );
      }

      // Sort suppliers
      switch (filters.sortBy) {
        case 'rating':
          filteredSuppliers.sort((a, b) => b.rating - a.rating);
          break;
        case 'reviews':
          filteredSuppliers.sort((a, b) => b.reviews_count - a.reviews_count);
          break;
        case 'name':
          filteredSuppliers.sort((a, b) => a.company_name.localeCompare(b.company_name));
          break;
        case 'response_time':
          filteredSuppliers.sort((a, b) => {
            const timeA = parseInt(a.response_time);
            const timeB = parseInt(b.response_time);
            return timeA - timeB;
          });
          break;
        default:
          break;
      }

      // Move featured suppliers to top
      filteredSuppliers.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });

      setSuppliers(filteredSuppliers);
      setTotalPages(1);
      setPaginationInfo({
        from: filteredSuppliers.length > 0 ? 1 : 0,
        to: filteredSuppliers.length,
        total: filteredSuppliers.length
      });
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setError('Failed to load suppliers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      rating: '',
      certification: '',
      sortBy: 'rating'
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (newPerPage) => {
    setItemsPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-200 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <>
      <Head>
        <title>Find Suppliers - Buyer Portal</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Find Suppliers</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Discover verified suppliers for your business needs
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search suppliers, products, or categories..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-900"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              {(filters.category || filters.location || filters.rating || filters.certification || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-secondary-200">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Category
                  </label>
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
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Location
                  </label>
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
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Min Rating
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Any Rating</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4.0">4.0+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                    <option value="3.0">3.0+ Stars</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Certification
                  </label>
                  <select
                    value={filters.certification}
                    onChange={(e) => handleFilterChange('certification', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Any Certification</option>
                    {certifications.map(cert => (
                      <option key={cert} value={cert}>{cert}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="rating">Highest Rating</option>
                    <option value="reviews">Most Reviews</option>
                    <option value="name">Company Name</option>
                    <option value="response_time">Response Time</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-secondary-600">Loading suppliers...</p>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="text-red-800">
              <p className="font-medium">Error loading suppliers</p>
              <p className="text-sm mt-1">{error}</p>
              <button 
                onClick={() => fetchSuppliers()}
                className="mt-3 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && suppliers.length === 0 && (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-600">
              No suppliers found matching your criteria.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              Clear filters to see all suppliers
            </button>
          </Card>
        )}

        {/* Suppliers Grid */}
        {!loading && !error && suppliers.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {suppliers.map((supplier) => (
                <Card key={supplier.id} className="p-6 hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl font-bold text-primary-600">
                          {supplier.company_name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-medium text-secondary-900">
                            {supplier.company_name}
                          </h3>
                          {supplier.verified && (
                            <Award className="w-4 h-4 text-blue-500" title="Verified Supplier" />
                          )}
                          {supplier.featured && (
                            <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 mb-2">
                          {renderStars(supplier.rating)}
                          <span className="text-sm text-secondary-600 ml-2">
                            {supplier.rating} ({supplier.reviews_count} reviews)
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-secondary-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          {supplier.location}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-secondary-600 mb-4">
                    {supplier.description}
                  </p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {supplier.categories.map((category, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-secondary-100 text-secondary-700 rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Package className="w-4 h-4 text-secondary-500" />
                        <span className="text-sm font-medium text-secondary-900">
                          {supplier.products_count}
                        </span>
                      </div>
                      <p className="text-xs text-secondary-600">Products</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-secondary-500" />
                        <span className="text-sm font-medium text-secondary-900">
                          {supplier.years_in_business}
                        </span>
                      </div>
                      <p className="text-xs text-secondary-600">Years</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Clock className="w-4 h-4 text-secondary-500" />
                        <span className="text-sm font-medium text-secondary-900">
                          {supplier.response_time}
                        </span>
                      </div>
                      <p className="text-xs text-secondary-600">Response</p>
                    </div>
                  </div>

                  {/* Certifications */}
                  {supplier.certifications.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-secondary-500 mb-2">Certifications:</p>
                      <div className="flex flex-wrap gap-1">
                        {supplier.certifications.slice(0, 3).map((cert, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full"
                          >
                            {cert}
                          </span>
                        ))}
                        {supplier.certifications.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                            +{supplier.certifications.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link href={`/buyer/suppliers/${supplier.id}`}>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View Profile
                      </Button>
                    </Link>
                    <Link href={`/chat?supplier=${supplier.id}`}>
                      <Button size="sm" className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Contact
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card>
                <Pagination
                  currentPage={currentPage}
                  lastPage={totalPages}
                  total={paginationInfo.total}
                  perPage={itemsPerPage}
                  from={paginationInfo.from}
                  to={paginationInfo.to}
                  onPageChange={handlePageChange}
                  onPerPageChange={handlePerPageChange}
                  showPerPageSelector={true}
                  showInfo={true}
                />
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}
