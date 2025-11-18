import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Skeleton from '../../../components/common/Skeleton';
import DocumentDisplay from '../../../components/common/DocumentDisplay';
import Modal from '../../../components/common/Modal';
import apiService from '../../../lib/api';
import { getImageUrl } from '../../../lib/imageUtils';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  ArrowLeft,
  Star,
  MapPin,
  Package,
  Clock,
  ShoppingCart,
  Shield,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Award,
  Truck,
  DollarSign,
  Info,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Send,
  AlertCircle,
  Building,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  Search,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

export default function SupplierDetail() {
  const router = useRouter();
  const { id, embedded } = router.query;
  const { user } = useAuth();
  
  // Check if page is being embedded (via query param or iframe detection)
  const isEmbedded = embedded === 'true' || (typeof window !== 'undefined' && window.self !== window.top);
  
  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [productsPage, setProductsPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [isStarred, setIsStarred] = useState(false);
  const [starringSupplier, setStarringSupplier] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginAction, setLoginAction] = useState('');

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }
    
    return products.filter(product => 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Auto-redirect to products tab when user starts searching
  useEffect(() => {
    if (searchQuery.trim() && activeTab !== 'products') {
      setActiveTab('products');
    }
  }, [searchQuery, activeTab]);

  useEffect(() => {
    if (id) {
      fetchSupplierDetails();
    }
  }, [id]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowProductsDropdown(false);
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSupplierDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching supplier details for ID:', id);
      const supplierData = await apiService.getSupplierDetails(id);
      console.log('Supplier data received:', supplierData);
      console.log('Supplier data keys:', Object.keys(supplierData));
      console.log('Supplier documents debug:', supplierData.documents);
      if (supplierData.documents) {
        console.log('Business documents:', supplierData.documents.business);
        console.log('Certification documents:', supplierData.documents.certifications);
        console.log('KYC documents:', supplierData.documents.kyc);
        console.log('Factory documents:', supplierData.documents.factory);
      }
      console.log('Supplier data structure:', JSON.stringify(supplierData, null, 2));
      setSupplier(supplierData);
      
      // Fetch company products
      try {
        const productsData = await apiService.getSupplierProducts(id, { page: 1, per_page: 8 });
        console.log('Products data received:', productsData);
        setProducts(productsData.data || []);
      } catch (productsError) {
        console.error('Error fetching products:', productsError);
        setProducts([]);
      }
      
      // Fetch company reviews
      try {
        const reviewsData = await apiService.getSupplierReviews(id, { page: 1, per_page: 10 });
        console.log('Reviews data received:', reviewsData);
        setReviews(reviewsData.data || []);
      } catch (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
        setReviews([]);
      }

      // Check if supplier is starred
      await checkIfSupplierStarred();
    } catch (error) {
      console.error('Error fetching supplier details:', error);
      console.error('Error response:', error.response);
      setError(`Failed to load supplier details: ${error.response?.status || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkIfSupplierStarred = async () => {
    try {
      const response = await apiService.checkStarredSupplier(id);
      setIsStarred(response.is_starred);
    } catch (error) {
      // Don't log error for unauthenticated users - this is expected behavior
      if (error.response?.status !== 401) {
        console.error('Error checking starred status:', error);
      }
      setIsStarred(false); // Default to not starred if check fails
    }
  };

  const handleStarSupplier = async () => {
    try {
      setStarringSupplier(true);
      
      if (isStarred) {
        await apiService.unstarSupplier(id);
        setIsStarred(false);
      } else {
        await apiService.starSupplier(id);
        setIsStarred(true);
      }
    } catch (error) {
      console.error('Error starring/unstarring supplier:', error);
      // Revert state on error
      setIsStarred(!isStarred);
    } finally {
      setStarringSupplier(false);
    }
  };

  // Contact handlers
  const handleChatNow = () => {
    if (!user) {
      setLoginAction(`Chat with ${supplier?.name || 'CK'}`);
      setShowLoginModal(true);
      return;
    }
    // TODO: Implement chat functionality
    console.log('Opening chat with supplier:', supplier.name);
    // This would typically open a chat window or redirect to chat page
    alert(`Chat feature will be implemented. Opening chat with ${supplier.name}`);
  };

  const handleSendInquiry = () => {
    if (!user) {
      setLoginAction(`Send Inquiry to ${supplier?.name || 'CK'}`);
      setShowLoginModal(true);
      return;
    }
    // TODO: Implement inquiry form
    console.log('Opening inquiry form for supplier:', supplier.name);
    // This would typically open an inquiry modal or form
    alert(`Inquiry feature will be implemented. Sending inquiry to ${supplier.name}`);
  };

  const handleSendMessage = () => {
    if (!user) {
      setLoginAction(`Send Message to ${supplier?.name || 'CK'}`);
      setShowLoginModal(true);
      return;
    }
    // TODO: Implement message functionality
    console.log('Opening message form for supplier:', supplier.name);
    // This would typically open a message compose modal
    alert(`Message feature will be implemented. Sending message to ${supplier.name}`);
  };

  const handleLogin = () => {
    // Redirect to login page
    router.push('/login');
    setShowLoginModal(false);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-secondary-300'
        }`}
      />
    ));
  };

  const getDeliveryRateColor = (rate) => {
    if (rate >= 95) return 'text-green-600 bg-green-100';
    if (rate >= 85) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-20" />
          <span>/</span>
          <Skeleton className="h-4 w-24" />
          <span>/</span>
          <Skeleton className="h-4 w-32" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Supplier Not Found</h2>
        <p className="text-gray-600 mb-4">
          {error || 'The supplier you are looking for does not exist.'}
          {id && <span className="block text-sm mt-2">Supplier ID: {id}</span>}
        </p>
        {/* Debug information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left text-xs text-gray-600 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <div className="space-y-1">
              <div><strong>Supplier ID:</strong> {id || 'undefined'}</div>
              <div><strong>Error:</strong> {error || 'No error message'}</div>
              <div><strong>Supplier Data:</strong> {supplier ? 'Loaded' : 'Not loaded'}</div>
              {supplier && (
                <div><strong>Supplier Keys:</strong> {Object.keys(supplier).join(', ')}</div>
              )}
            </div>
          </div>
        )}
        <Link href="/buyer">
          <Button>Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{supplier.name} - Supplier Profile - Pinoy Global Supply</title>
        <meta name="description" content={supplier.about} />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header Section - Hide when embedded */}
        {!isEmbedded && (
          <div className="bg-white border-b border-secondary-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Left: Breadcrumb */}
                <div className="flex items-center space-x-2 text-sm">
                  <Link href="/buyer" className="text-primary-600 hover:text-primary-700">
                    Marketplace
                  </Link>
                  <span className="text-secondary-400">/</span>
                  <Link href="/buyer/suppliers" className="text-primary-600 hover:text-primary-700">
                    Suppliers
                  </Link>
                  <span className="text-secondary-400">/</span>
                  <span className="text-secondary-900 font-medium">{supplier.name}</span>
                </div>

                {/* Right: Rating and Verification */}
                <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold text-secondary-900">
                      {supplier.rating || supplier.average_rating || '0.0'}
                    </span>
                    <span className="text-sm text-secondary-600">
                      ({supplier.review_count || 0} reviews)
                    </span>
                  </div>
                  {supplier.verified && (
                    <div className="flex items-center space-x-1 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Verified Supplier</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Navigation Bar - Hide when embedded */}
        {!isEmbedded && (
        <div className="bg-secondary-50 border-b border-secondary-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              {/* Left: Navigation Tabs */}
              <div className="flex items-center space-x-8">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'home' ? 'text-primary-600 border-b-2 border-primary-600 pb-3' : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  Home
                </button>
                
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setShowProductsDropdown(!showProductsDropdown)}
                    className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                      activeTab === 'products' ? 'text-primary-600 border-b-2 border-primary-600 pb-3' : 'text-secondary-600 hover:text-secondary-900'
                    }`}
                  >
                    <span>Products</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showProductsDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Products Dropdown */}
                  {showProductsDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-secondary-200 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setActiveTab('products');
                            setShowProductsDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors duration-150"
                        >
                          All Products
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('products');
                            setShowProductsDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors duration-150"
                        >
                          Featured Products
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('products');
                            setShowProductsDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors duration-150"
                        >
                          New Arrivals
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative dropdown-container">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                      ['company-profile', 'certifications', 'factory-tour'].includes(activeTab) ? 'text-primary-600 border-b-2 border-primary-600 pb-3' : 'text-secondary-600 hover:text-secondary-900'
                    }`}
                  >
                    <span>Company Profile</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Company Profile Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-secondary-200 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setActiveTab('company-profile');
                            setShowProfileDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors duration-150"
                        >
                          About Us
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('certifications');
                            setShowProfileDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors duration-150"
                        >
                          Certificates
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('factory-tour');
                            setShowProfileDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors duration-150"
                        >
                          Factory Info
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setActiveTab('contacts')}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'contacts' ? 'text-primary-600 border-b-2 border-primary-600 pb-3' : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  Contacts
                </button>
                
                <button 
                  onClick={() => setActiveTab('promotion')}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'promotion' ? 'text-primary-600 border-b-2 border-primary-600 pb-3' : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  Promotion
                </button>
              </div>

              {/* Right: Search Box */}
              <div className="relative">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-4 pr-10 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 w-4 h-4 text-secondary-400 hover:text-secondary-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <Search className="absolute right-3 w-4 h-4 text-secondary-400" />
                  )}
                </div>
                {searchQuery && (
                  <div className="absolute top-full left-0 mt-1 text-xs text-secondary-600">
                    {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Banner Section - Show only for home tab */}
        {activeTab === 'home' && (
          <div className="relative">
            {supplier.company_banner ? (
              <div className="w-full bg-secondary-200">
                <img
                  src={getImageUrl(supplier.company_banner)}
                  alt={`${supplier.name} Banner`}
                  className="w-full h-48 sm:h-60 lg:h-72 xl:h-80 object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-48 sm:h-60 lg:h-72 xl:h-80 bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 text-primary-100">Welcome to {supplier.name}</h2>
                  <p className="text-sm sm:text-base lg:text-lg text-primary-100">Your trusted manufacturing partner</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6">
            {/* Sidebar - Left */}
            <div className="w-80 flex-shrink-0 space-y-4">
              {/* Company Profile Card */}
              <Card className="p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-primary-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {supplier.company_banner ? (
                      <img src={getImageUrl(supplier.company_banner)} alt={supplier.name} className="w-full h-full rounded-lg object-cover" />
                    ) : supplier.logo ? (
                      <img src={supplier.logo} alt={supplier.name} className="w-18 h-18 rounded-lg object-cover" />
                    ) : (
                      <Building className="w-10 h-10 text-primary-600" />
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-secondary-900 mb-1">{supplier.name || 'No name provided'}</h2>
                  <p className="text-sm text-secondary-600 mb-3">{supplier.location || 'No location provided'}</p>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary-600">
                        {supplier.products_count || supplier.total_products || products.length || 0}
                      </div>
                      <div className="text-xs text-secondary-600">Products</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {supplier.orders_count || supplier.total_orders || supplier.orders || 0}
                      </div>
                      <div className="text-xs text-secondary-600">Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-lg font-bold text-secondary-900">
                          {supplier.rating || supplier.average_rating || supplier.customer_rating || '0.0'}
                        </span>
                      </div>
                      <div className="text-xs text-secondary-600">Rating</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleChatNow}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat now
                    </Button>
                    <Button 
                      className="w-full !bg-green-600 hover:!bg-green-700 text-white"
                      onClick={handleSendInquiry}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Inquiry
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
                      onClick={handleSendMessage}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Contact Info */}
              <Card className="p-4">
                <h3 className="font-semibold text-secondary-900 mb-3">Contact Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-secondary-400" />
                    <span className="text-secondary-600">
                      {supplier.peza_id || 'Not provided'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-secondary-400" />
                    <span className="text-secondary-600">
                      {supplier.phone || supplier.contact_phone || supplier.contact?.phone || 'Not provided'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-secondary-400" />
                    <span className="text-secondary-600 truncate">
                      {supplier.email || supplier.contact_email || supplier.contact?.email || 'Not provided'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Globe className="w-4 h-4 text-secondary-400" />
                    <span className="text-secondary-600 truncate">
                      {supplier.website || supplier.contact_website || supplier.contact?.website || 'Not provided'}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Business Info */}
              <Card className="p-4">
                <h3 className="font-semibold text-secondary-900 mb-3">Business Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Business Type:</span>
                    <span className="font-medium text-right">
                      {supplier.business_type || supplier.type || 'Manufacturer'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Employees:</span>
                    <span className="font-medium">
                      {supplier.employee_count || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Established:</span>
                    <span className="font-medium">
                      {supplier.established || 'N/A'}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Certifications */}
              <Card className="p-4">
                <h3 className="font-semibold text-secondary-900 mb-3">Certifications</h3>
                <div className="space-y-2">
                  {supplier.verified && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-secondary-700">Verified Supplier</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-secondary-700">ISO 9001 Certified</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-secondary-700">Trade Assurance</span>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-4">
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStarSupplier}
                    disabled={starringSupplier}
                    className={`w-full ${isStarred ? 'bg-red-50 border-red-200 text-red-600' : ''}`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isStarred ? 'fill-current' : ''}`} />
                    {isStarred ? 'Starred' : 'Star Supplier'}
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Profile
                  </Button>
                </div>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">

              {/* Tab Content with Smooth Transitions */}
              <div className="transition-all duration-300 ease-in-out">
                {activeTab === 'home' && (
                  <div className="space-y-6 animate-in fade-in-50 duration-300">
                    <Card className="p-6">
                      <h3 className="text-xl font-bold text-secondary-900 mb-4">About {supplier.name}</h3>
                      <p className="text-secondary-700 leading-relaxed mb-6">
                        {supplier.description || supplier.about || 'We are a leading manufacturer committed to providing high-quality products and exceptional service to our global customers.'}
                      </p>
                      
                      {/* Key Highlights */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-primary-50 rounded-lg border border-primary-100">
                          <Package className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                          <div className="text-xl font-bold text-primary-600">
                            {supplier.products_count || products.length || 0}
                          </div>
                          <div className="text-sm text-secondary-600">Total Products</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                          <ShoppingCart className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <div className="text-xl font-bold text-green-600">
                            {supplier.orders_count || supplier.total_orders || 0}
                          </div>
                          <div className="text-sm text-secondary-600">Total Orders</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                          <div className="text-xl font-bold text-secondary-900">
                            {supplier.rating || supplier.average_rating || '0.0'}
                          </div>
                          <div className="text-sm text-secondary-600">Customer Rating</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <div className="text-xl font-bold text-blue-600">
                            {supplier.established || 'N/A'}
                          </div>
                          <div className="text-sm text-secondary-600">Year Established</div>
                        </div>
                      </div>

                      {/* Main Products Section */}
                      <div className="border-t pt-6">
                        <h4 className="text-lg font-semibold text-secondary-900 mb-3">Main Products</h4>
                        <p className="text-secondary-600">{supplier.main_products || 'Various manufacturing products and solutions'}</p>
                      </div>
                    </Card>

                    {/* Company Documents & Media Section */}
                    {supplier.documents && (
                      (supplier.documents.business?.length > 0 || 
                       supplier.documents.certifications?.length > 0 || 
                       supplier.documents.kyc?.length > 0) && (
                      <Card className="p-6">
                        <h3 className="text-xl font-bold text-secondary-900 mb-4">Company Documents & Media</h3>
                        
                        <div className="space-y-8">
                          {/* Business Documents Section */}
                          {supplier.documents.business?.length > 0 && (
                            <div>
                              <div className="flex items-center mb-4">
                                <Shield className="h-5 w-5 text-blue-600 mr-2" />
                                <h4 className="text-md font-medium text-secondary-900">Business Documents</h4>
                              </div>
                              <DocumentDisplay
                                documents={supplier.documents.business}
                                title="Registration & Permits"
                                isEditing={false}
                              />
                            </div>
                          )}

                          {/* Product Certifications Section */}
                          {supplier.documents.certifications?.length > 0 && (
                            <div>
                              <div className="flex items-center mb-4">
                                <Award className="h-5 w-5 text-green-600 mr-2" />
                                <h4 className="text-md font-medium text-secondary-900">Product Certifications</h4>
                              </div>
                              <DocumentDisplay
                                documents={supplier.documents.certifications}
                                title="Quality & Safety Certifications"
                                isEditing={false}
                              />
                            </div>
                          )}

                          {/* KYC Documents Section */}
                          {supplier.documents.kyc?.length > 0 && (
                            <div>
                              <div className="flex items-center mb-4">
                                <Shield className="h-5 w-5 text-purple-600 mr-2" />
                                <h4 className="text-md font-medium text-secondary-900">KYC Verification</h4>
                              </div>
                              <DocumentDisplay
                                documents={supplier.documents.kyc}
                                title="Identity & Address Verification"
                                isEditing={false}
                              />
                            </div>
                          )}
                        </div>
                      </Card>
                      )
                    )}

                    {/* Manufacturing Facilities & Capabilities */}
                    {supplier.documents?.factory?.length > 0 && (
                      <Card className="p-6">
                        <h3 className="text-xl font-bold text-secondary-900 mb-4">Manufacturing Facilities & Capabilities</h3>
                        
                        <div className="space-y-8">
                          {/* Factory Tour Section */}
                          <div>
                            <div className="flex items-center mb-4">
                              <Building className="h-5 w-5 text-orange-600 mr-2" />
                              <h4 className="text-md font-medium text-secondary-900">Factory Tour</h4>
                            </div>
                            <DocumentDisplay
                              documents={supplier.documents.factory}
                              title="Manufacturing Facilities & Capabilities"
                              isEditing={false}
                            />
                          </div>

                          {/* Production Capabilities Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium text-secondary-900 mb-3">Production Capacity</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-secondary-600">Daily Output:</span>
                                  <span className="font-medium">{supplier.daily_output || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-secondary-600">Monthly Capacity:</span>
                                  <span className="font-medium">{supplier.monthly_capacity || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-secondary-600">Production Lines:</span>
                                  <span className="font-medium">{supplier.production_lines || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-secondary-600">Factory Size:</span>
                                  <span className="font-medium">{supplier.factory_size || 'Not specified'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-secondary-900 mb-3">Quality Control</h4>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-secondary-700">24/7 Quality Monitoring</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-secondary-700">Advanced Testing Equipment</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-secondary-700">QC Team: 15 members</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-secondary-700">Defect Rate: &lt; 0.1%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Featured Products Preview */}
                    {products.length > 0 && (
                      <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-secondary-900">
                              {searchQuery ? 'Search Results' : 'Featured Products'}
                            </h3>
                            {searchQuery && (
                              <p className="text-sm text-secondary-600 mt-1">
                                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found for "{searchQuery}"
                              </p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab('products')}
                          >
                            View All Products
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredProducts.slice(0, 6).map((product) => {
                            // Debug: Log product structure
                            
                            return (
                              <div key={product.id} className="border border-secondary-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                                <div className="aspect-w-16 aspect-h-9">
                                  {(product.has_image || product.image || (product.images && product.images.length > 0)) ? (
                                    <img
                                      src={getImageUrl(product.image || (product.images && product.images[0]))}
                                      alt={product.name}
                                      className="w-full h-32 object-cover"
                                      onError={(e) => {
                                        console.log('Image load error for product:', product.name, 'URL:', e.target.src);
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                                      <div className="text-center">
                                        <ShoppingCart className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                        <p className="text-xs text-gray-500">No Image</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="p-3">
                                  <h4 className="font-medium text-secondary-900 mb-1 text-sm line-clamp-2">{product.name}</h4>
                                  <div className="flex items-center justify-between">
                                    <span className="text-primary-600 font-bold">
                                      ${product.price}
                                    </span>
                                    <span className="text-xs text-secondary-500">
                                      MOQ: {product.moq || 1}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* No results message for search */}
                        {searchQuery && filteredProducts.length === 0 && (
                          <div className="text-center py-8">
                            <Package className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-secondary-900 mb-2">No products found</h4>
                            <p className="text-secondary-600">No products match your search for "{searchQuery}"</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSearchQuery('')}
                              className="mt-3"
                            >
                              Clear search
                            </Button>
                          </div>
                        )}
                      </Card>
                    )}
                  </div>
                )}

                {activeTab === 'overview' && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">About Company</h3>
                    <p className="text-secondary-700 leading-relaxed">
                      {supplier.description || supplier.about || 'No company description available.'}
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-secondary-400" />
                        <div>
                          <div className="text-sm text-secondary-600">Business Type</div>
                          <div className="font-medium">{supplier.business_type || 'Manufacturer'}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-secondary-400" />
                        <div>
                          <div className="text-sm text-secondary-600">Employees</div>
                          <div className="font-medium">{supplier.employees || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-secondary-400" />
                        <div>
                          <div className="text-sm text-secondary-600">Established</div>
                          <div className="font-medium">{supplier.year_established || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Package className="w-5 h-5 text-secondary-400" />
                        <div>
                          <div className="text-sm text-secondary-600">Main Products</div>
                          <div className="font-medium">{supplier.main_products || 'Various'}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

                {activeTab === 'products' && (
                  <div className="space-y-6 animate-in fade-in-50 duration-300">
                    {/* Products Header */}
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-secondary-900">All Products</h2>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-secondary-600">
                          {filteredProducts.length} products found
                        </span>
                        <select className="px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                          <option>Sort by: Default</option>
                          <option>Price: Low to High</option>
                          <option>Price: High to Low</option>
                          <option>Newest First</option>
                        </select>
                      </div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredProducts.map((product) => (
                        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group">
                          <div className="relative">
                            {(product.has_image || product.image || (product.images && product.images.length > 0)) ? (
                              <img
                                src={getImageUrl(product.image || (product.images && product.images[0]))}
                                alt={product.name}
                                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200"
                                onError={(e) => {
                                  console.log('Image load error for product:', product.name, 'URL:', e.target.src);
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : (
                              <div className="w-full h-40 bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors duration-200">
                                <div className="text-center">
                                  <ShoppingCart className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                  <p className="text-xs text-gray-500">No Image</p>
                                </div>
                              </div>
                            )}
                            {/* Quick action on hover */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                              <Button
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200"
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="font-medium text-secondary-900 mb-2 line-clamp-2 text-sm">
                              {product.name}
                            </h4>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-lg font-bold text-primary-600">
                                ${product.price}
                              </span>
                              {product.discount && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                  -{product.discount}%
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-xs text-secondary-600">
                              <span>MOQ: {product.moq || 1}</span>
                              <span>⭐ {product.rating || '4.5'}</span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                    
                    {filteredProducts.length === 0 && (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-secondary-900 mb-2">No Products Found</h3>
                        <p className="text-secondary-600">
                          {searchQuery.trim() ? `No products found matching "${searchQuery}"` : "This supplier hasn't added any products yet."}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4 animate-in fade-in-50 duration-300">
                    {reviews.map((review) => (
                      <Card key={review.id} className="p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-medium">
                              {review.buyer_name?.charAt(0) || 'B'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-secondary-900">{review.buyer_name || 'Anonymous'}</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < (review.rating || 5) ? 'text-yellow-400 fill-current' : 'text-secondary-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-secondary-600">{review.created_at}</span>
                            </div>
                            <p className="text-secondary-700">{review.comment}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    {reviews.length === 0 && (
                      <div className="text-center py-8">
                        <Star className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                        <p className="text-secondary-600">No reviews available</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'company-profile' && (
                  <div className="space-y-6 animate-in fade-in-50 duration-300">
                    {/* Company Description */}
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-secondary-900 mb-4">Company Description</h3>
                      <p className="text-secondary-700 leading-relaxed">
                        {supplier.description || supplier.about || 'No company description available.'}
                      </p>
                    </Card>

                    {/* Company Information */}
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-secondary-900 mb-4">Company Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center space-x-3">
                          <Building className="w-5 h-5 text-secondary-400" />
                          <div>
                            <div className="text-sm text-secondary-600">Business Type</div>
                            <div className="font-medium">{supplier.business_type || supplier.trade_type || 'Manufacturer'}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-secondary-400" />
                          <div>
                            <div className="text-sm text-secondary-600">Employees</div>
                            <div className="font-medium">{supplier.employee_count || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-secondary-400" />
                          <div>
                            <div className="text-sm text-secondary-600">Established</div>
                            <div className="font-medium">{supplier.established || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Package className="w-5 h-5 text-secondary-400" />
                          <div>
                            <div className="text-sm text-secondary-600">Main Products</div>
                            <div className="font-medium">{supplier.main_products || 'Various'}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <DollarSign className="w-5 h-5 text-secondary-400" />
                          <div>
                            <div className="text-sm text-secondary-600">Payment Terms</div>
                            <div className="font-medium">{supplier.payment_terms || 'T/T, L/C'}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Truck className="w-5 h-5 text-secondary-400" />
                          <div>
                            <div className="text-sm text-secondary-600">Delivery Terms</div>
                            <div className="font-medium">{supplier.delivery_terms || 'FOB, CIF'}</div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Company Documents & Media */}
                    {supplier.documents && (
                      (supplier.documents.business?.length > 0 || 
                       supplier.documents.certifications?.length > 0 || 
                       supplier.documents.kyc?.length > 0) && (
                      <Card className="p-6">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Company Documents & Media</h3>
                        
                        <div className="space-y-8">
                          {/* Business Documents Section */}
                          {supplier.documents.business?.length > 0 && (
                            <div>
                              <div className="flex items-center mb-4">
                                <Shield className="h-5 w-5 text-blue-600 mr-2" />
                                <h4 className="text-md font-medium text-secondary-900">Business Documents</h4>
                              </div>
                              <DocumentDisplay
                                documents={supplier.documents.business}
                                title="Registration & Permits"
                                isEditing={false}
                              />
                            </div>
                          )}

                          {/* Product Certifications Section */}
                          {supplier.documents.certifications?.length > 0 && (
                            <div>
                              <div className="flex items-center mb-4">
                                <Award className="h-5 w-5 text-green-600 mr-2" />
                                <h4 className="text-md font-medium text-secondary-900">Product Certifications</h4>
                              </div>
                              <DocumentDisplay
                                documents={supplier.documents.certifications}
                                title="Quality & Safety Certifications"
                                isEditing={false}
                              />
                            </div>
                          )}

                          {/* KYC Documents Section */}
                          {supplier.documents.kyc?.length > 0 && (
                            <div>
                              <div className="flex items-center mb-4">
                                <Shield className="h-5 w-5 text-purple-600 mr-2" />
                                <h4 className="text-md font-medium text-secondary-900">KYC Verification</h4>
                              </div>
                              <DocumentDisplay
                                documents={supplier.documents.kyc}
                                title="Identity & Address Verification"
                                isEditing={false}
                              />
                            </div>
                          )}
                        </div>
                      </Card>
                      )
                    )}

                    {/* Manufacturing Facilities & Capabilities */}
                    {supplier.documents?.factory?.length > 0 && (
                      <Card className="p-6">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Manufacturing Facilities & Capabilities</h3>
                        
                        <div className="space-y-8">
                          {/* Factory Tour Section */}
                          <div>
                            <div className="flex items-center mb-4">
                              <Building className="h-5 w-5 text-orange-600 mr-2" />
                              <h4 className="text-md font-medium text-secondary-900">Factory Tour</h4>
                            </div>
                            <DocumentDisplay
                              documents={supplier.documents.factory}
                              title="Manufacturing Facilities & Capabilities"
                              isEditing={false}
                            />
                          </div>

                          {/* Production Capabilities Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium text-secondary-900 mb-3">Production Capacity</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-secondary-600">Daily Output:</span>
                                  <span className="font-medium">50,000 units</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-secondary-600">Monthly Capacity:</span>
                                  <span className="font-medium">1.5M units</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-secondary-600">Production Lines:</span>
                                  <span className="font-medium">5 lines</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-secondary-600">Factory Size:</span>
                                  <span className="font-medium">{supplier.factory_size || '10,000 sqm'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-secondary-900 mb-3">Quality Control</h4>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-secondary-700">24/7 Quality Monitoring</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-secondary-700">Advanced Testing Equipment</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-secondary-700">QC Team: 15 members</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-secondary-700">Defect Rate: &lt; 0.1%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                )}

                {activeTab === 'certifications' && (
                  <div className="space-y-6 animate-in fade-in-50 duration-300">
                    {supplier.documents?.certifications?.length > 0 ? (
                      <Card className="p-6">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Product Certifications</h3>
                        <DocumentDisplay
                          documents={supplier.documents.certifications}
                          title="Quality & Safety Certifications"
                          isEditing={false}
                        />
                      </Card>
                    ) : (
                      <Card className="p-6">
                        <div className="text-center py-12">
                          <Award className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-secondary-900 mb-2">No Certifications Available</h3>
                          <p className="text-secondary-600">This supplier hasn't uploaded any certification documents yet.</p>
                        </div>
                      </Card>
                    )}
                  </div>
                )}

                {activeTab === 'factory-tour' && (
                  <div className="space-y-6 animate-in fade-in-50 duration-300">
                    {supplier.documents?.factory?.length > 0 ? (
                      <Card className="p-6">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Manufacturing Facilities & Capabilities</h3>
                        <div className="space-y-8">
                          <div>
                            <div className="flex items-center mb-4">
                              <Building className="h-5 w-5 text-orange-600 mr-2" />
                              <h4 className="text-md font-medium text-secondary-900">Factory Tour</h4>
                            </div>
                            <DocumentDisplay
                              documents={supplier.documents.factory}
                              title="Manufacturing Facilities & Capabilities"
                              isEditing={false}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium text-secondary-900 mb-3">Production Capacity</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-secondary-600">Daily Output:</span>
                                  <span className="font-medium">{supplier.daily_output || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-secondary-600">Monthly Capacity:</span>
                                  <span className="font-medium">{supplier.monthly_capacity || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-secondary-600">Production Lines:</span>
                                  <span className="font-medium">{supplier.production_lines || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-secondary-600">Factory Size:</span>
                                  <span className="font-medium">{supplier.factory_size || 'Not specified'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-secondary-900 mb-3">Quality Control</h4>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-secondary-700">24/7 Quality Monitoring</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-secondary-700">Advanced Testing Equipment</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-secondary-700">QC Team: {supplier.qc_team_size || '15 members'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-secondary-700">Defect Rate: {supplier.defect_rate || '< 0.1%'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <Card className="p-6">
                        <div className="text-center py-12">
                          <Building className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-secondary-900 mb-2">No Factory Information Available</h3>
                          <p className="text-secondary-600">This supplier hasn't uploaded factory photos or videos yet.</p>
                        </div>
                      </Card>
                    )}
                  </div>
                )}

                {activeTab === 'contacts' && (
                  <div className="space-y-6 animate-in fade-in-50 duration-300">
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-secondary-900 mb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <Building className="w-5 h-5 text-secondary-400 mt-1" />
                            <div>
                              <h4 className="font-medium text-secondary-900">Company Address</h4>
                              <p className="text-secondary-600">{supplier.address || supplier.location || 'Address not provided'}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Phone className="w-5 h-5 text-secondary-400 mt-1" />
                            <div>
                              <h4 className="font-medium text-secondary-900">Phone Number</h4>
                              <p className="text-secondary-600">{supplier.phone || supplier.contact_phone || supplier.contact?.phone || 'Not provided'}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Mail className="w-5 h-5 text-secondary-400 mt-1" />
                            <div>
                              <h4 className="font-medium text-secondary-900">Email Address</h4>
                              <p className="text-secondary-600">{supplier.email || supplier.contact_email || supplier.contact?.email || 'Not provided'}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Globe className="w-5 h-5 text-secondary-400 mt-1" />
                            <div>
                              <h4 className="font-medium text-secondary-900">Website</h4>
                              <p className="text-secondary-600">{supplier.website || supplier.contact_website || supplier.contact?.website || 'Not provided'}</p>
                            </div>
                          </div>
                          {supplier.peza_id && (
                            <div className="flex items-start space-x-3">
                              <Building className="w-5 h-5 text-secondary-400 mt-1" />
                              <div>
                                <h4 className="font-medium text-secondary-900">PEZA ID</h4>
                                <p className="text-secondary-600">{supplier.peza_id}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-medium text-secondary-900">Business Information</h4>
                          <div className="space-y-3">
                            <div className="p-3 bg-secondary-50 rounded-lg">
                              <div className="font-medium text-secondary-900">Business Type</div>
                              <div className="text-sm text-secondary-600">{supplier.business_type || supplier.type || 'Manufacturer'}</div>
                            </div>
                            <div className="p-3 bg-secondary-50 rounded-lg">
                              <div className="font-medium text-secondary-900">Employees</div>
                              <div className="text-sm text-secondary-600">{supplier.employee_count || 'Not specified'}</div>
                            </div>
                            <div className="p-3 bg-secondary-50 rounded-lg">
                              <div className="font-medium text-secondary-900">Established</div>
                              <div className="text-sm text-secondary-600">{supplier.established || 'Not specified'}</div>
                            </div>
                            {supplier.main_products && (
                              <div className="p-3 bg-secondary-50 rounded-lg">
                                <div className="font-medium text-secondary-900">Main Products</div>
                                <div className="text-sm text-secondary-600">{supplier.main_products}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {activeTab === 'promotion' && (
                  <div className="space-y-6 animate-in fade-in-50 duration-300">
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-secondary-900 mb-4">Current Promotions</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200 hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-primary-900">New Customer Discount</h4>
                              <p className="text-primary-700 mt-1">Get 15% off your first order above $1,000</p>
                              <p className="text-sm text-primary-600 mt-2">Valid until: Dec 31, 2024</p>
                            </div>
                            <div className="text-2xl font-bold text-primary-600">15%</div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-green-900">Bulk Order Special</h4>
                              <p className="text-green-700 mt-1">Orders above 10,000 units get special pricing</p>
                              <p className="text-sm text-green-600 mt-2">Contact us for custom quotes</p>
                            </div>
                            <div className="text-lg font-bold text-green-600">BULK</div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-orange-900">Free Shipping</h4>
                              <p className="text-orange-700 mt-1">Free worldwide shipping on orders above $500</p>
                              <p className="text-sm text-orange-600 mt-2">Applicable to all products</p>
                            </div>
                            <div className="text-lg font-bold text-orange-600">FREE</div>
                          </div>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-secondary-900 mb-4">Trade Shows & Events</h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
                          <Calendar className="w-5 h-5 text-secondary-400 mt-1" />
                          <div>
                            <h4 className="font-medium text-secondary-900">Canton Fair 2024</h4>
                            <p className="text-secondary-600">Visit us at Booth A123, Hall 1.1</p>
                            <p className="text-sm text-secondary-500">April 15-19, 2024 • Guangzhou, China</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
                          <Calendar className="w-5 h-5 text-secondary-400 mt-1" />
                          <div>
                            <h4 className="font-medium text-secondary-900">Global Sources Summit</h4>
                            <p className="text-secondary-600">Manufacturing & Technology Exhibition</p>
                            <p className="text-sm text-secondary-500">October 11-14, 2024 • Hong Kong</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Required Modal */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        size="sm"
      >
        <div className="text-center py-6">
          {/* Lock Icon */}
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2zm10-12V9a4 4 0 00-8 0v2m8 0V9a4 4 0 00-4-4 4 4 0 00-4 4v2" />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            Login Required
          </h3>

          {/* Message */}
          <p className="text-secondary-600 mb-6">
            You need to log in to chat with suppliers.
          </p>
          <p className="text-sm text-secondary-500 mb-6">
            Action: {loginAction}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleLogin}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Log In
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowLoginModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          {/* Register Link */}
          <div className="mt-4 pt-4 border-t border-secondary-200">
            <p className="text-sm text-secondary-600">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  router.push('/register');
                  setShowLoginModal(false);
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                You can register after clicking here
              </button>
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
