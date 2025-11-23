import { useState, useEffect } from 'react';
import apiService from '../../lib/api';
import { getImageUrl } from '../../lib/imageUtils';
import Card from '../common/Card';
import Button from '../common/Button';
import DocumentDisplay from '../common/DocumentDisplay';
import SimpleFloatingChat from '../common/SimpleFloatingChat';
import LoginPromptModal from '../common/LoginPromptModal';
import { useAuth } from '../../contexts/AuthContext';
import { useLoginPrompt } from '../../hooks/useLoginPrompt';
import { 
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
  Building,
  Users,
  Calendar,
  CheckCircle,
  Search,
  ChevronDown,
  X
} from 'lucide-react';

export default function EmbeddedSupplierProfile({ companyId }) {
  const { user } = useAuth();
  const { requireAuth, showLoginPrompt, hideLoginPrompt, promptConfig } = useLoginPrompt();
  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showFloatingChat, setShowFloatingChat] = useState(false);

  useEffect(() => {
    if (companyId) {
      fetchSupplierData();
    }
  }, [companyId]);

  const fetchSupplierData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supplierData = await apiService.getSupplierDetails(companyId);
      setSupplier(supplierData);
      
      try {
        const productsData = await apiService.getSupplierProducts(companyId, { page: 1, per_page: 8 });
        setProducts(productsData.data || []);
      } catch (productsError) {
        console.error('Error fetching products:', productsError);
        setProducts([]);
      }
      
      try {
        const reviewsData = await apiService.getSupplierReviews(companyId, { page: 1, per_page: 10 });
        setReviews(reviewsData.data || []);
      } catch (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching supplier details:', error);
      setError('Failed to load company profile');
    } finally {
      setLoading(false);
    }
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

  const filteredProducts = searchQuery.trim() 
    ? products.filter(product => 
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Company profile not found'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Banner Section */}
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
                <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2">Welcome to {supplier.name}</h2>
                <p className="text-sm sm:text-base lg:text-lg">Your trusted manufacturing partner</p>
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
                    onClick={() => requireAuth(
                      () => setShowFloatingChat(true),
                      {
                        title: "Login Required",
                        message: "You need to log in to chat with suppliers.",
                        actionText: `Chat with ${supplier?.name || 'supplier'}`
                      }
                    )}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat now
                  </Button>
                  <Button 
                    className="w-full !bg-green-600 hover:!bg-green-700 text-white"
                    onClick={() => requireAuth(
                      () => {
                        // Scroll to contact section on the page
                        const contactSection = document.getElementById('contact');
                        if (contactSection) {
                          contactSection.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          // Navigate to contact anchor
                          window.location.href = '#contact';
                        }
                      },
                      {
                        title: "Login Required",
                        message: "You need to log in to send inquiries to suppliers.",
                        actionText: `Send inquiry to ${supplier?.name || 'supplier'}`
                      }
                    )}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Inquiry
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
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Tab Content */}
            <div className="transition-all duration-300 ease-in-out">
              {activeTab === 'home' && (
                <div className="space-y-6">
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
                  </Card>

                  {/* Featured Products */}
                  {products.length > 0 && (
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-secondary-900 mb-4">Featured Products</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.slice(0, 6).map((product) => (
                          <div key={product.id} className="border border-secondary-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                            <div className="aspect-w-16 aspect-h-9">
                              {(product.has_image || product.image || (product.images && product.images.length > 0)) ? (
                                <img
                                  src={getImageUrl(product.image || (product.images && product.images[0]))}
                                  alt={product.name}
                                  className="w-full h-32 object-cover"
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
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Modal */}
      {showFloatingChat && supplier && (
        <SimpleFloatingChat
          isOpen={showFloatingChat}
          onClose={() => setShowFloatingChat(false)}
          product={{
            company: {
              id: supplier.id,
              name: supplier.name,
              user_id: supplier.user_id
            }
          }}
        />
      )}

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={hideLoginPrompt}
        title={promptConfig.title}
        message={promptConfig.message}
        actionText={promptConfig.actionText}
      />
    </div>
  );
}
