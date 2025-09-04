import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Skeleton from '../../../components/common/Skeleton';
import apiService from '../../../lib/api';
import { 
  ArrowLeft,
  Star,
  MapPin,
  Package,
  Clock,
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
  AlertCircle,
  Building,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

export default function SupplierDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [productsPage, setProductsPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [isStarred, setIsStarred] = useState(false);
  const [starringSupplier, setStarringSupplier] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSupplierDetails();
    }
  }, [id]);

  const fetchSupplierDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const supplierData = await apiService.getSupplierDetails(id);
      setSupplier(supplierData);
      
      // Fetch company products
      const productsData = await apiService.getSupplierProducts(id, { page: 1, per_page: 8 });
      setProducts(productsData.data || []);
      
      // Fetch company reviews
      const reviewsData = await apiService.getSupplierReviews(id, { page: 1, per_page: 10 });
      setReviews(reviewsData.data || []);

      // Check if supplier is starred
      await checkIfSupplierStarred();
    } catch (error) {
      console.error('Error fetching supplier details:', error);
      setError('Failed to load supplier details');
    } finally {
      setLoading(false);
    }
  };

  const checkIfSupplierStarred = async () => {
    try {
      const response = await apiService.checkStarredSupplier(id);
      setIsStarred(response.is_starred);
    } catch (error) {
      console.error('Error checking starred status:', error);
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
        <p className="text-gray-600 mb-4">{error || 'The supplier you are looking for does not exist.'}</p>
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

      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-secondary-600">
          <Link href="/buyer" className="hover:text-primary-600">
            Marketplace
          </Link>
          <span>/</span>
          <Link href="/buyer/suppliers" className="hover:text-primary-600">
            Suppliers
          </Link>
          <span>/</span>
          <span className="text-secondary-900">{supplier.name}</span>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Supplier Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Company Header */}
            <Card className="p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <Building className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h1 className="text-2xl font-bold text-secondary-900">{supplier.name}</h1>
                      {supplier.verified && (
                        <Shield className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-secondary-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{supplier.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(supplier.rating)}
                      <span className="text-sm text-secondary-600 ml-2">
                        {supplier.rating}/5 ({supplier.total_reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-secondary-600">
                  <div className="mb-1">Est. {supplier.established}</div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Response: {supplier.response_time}</span>
                  </div>
                </div>
              </div>

              <p className="text-secondary-700 mb-4">{supplier.about}</p>

              <div className="flex space-x-3">
                <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleStarSupplier}
                  disabled={starringSupplier}
                  className={`${isStarred ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' : 'hover:bg-gray-50'}`}
                >
                  <Star className={`w-4 h-4 mr-2 ${isStarred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  {starringSupplier ? 'Starring...' : isStarred ? 'Starred' : 'Star'}
                </Button>
                <Button variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact
                </Button>
                <Button variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-secondary-900">{supplier.total_products}</div>
                <div className="text-sm text-secondary-600">Products</div>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-secondary-900">{supplier.total_orders}</div>
                <div className="text-sm text-secondary-600">Orders</div>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-secondary-900">{supplier.total_customers}</div>
                <div className="text-sm text-secondary-600">Customers</div>
              </Card>
              
              <Card className="p-4 text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${getDeliveryRateColor(supplier.delivery_rate).replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                  <Truck className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-secondary-900">{supplier.delivery_rate}%</div>
                <div className="text-sm text-secondary-600">On-time Delivery</div>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="p-6">
              <h3 className="font-semibold text-secondary-900 mb-4">Contact Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-secondary-400" />
                  <span>{supplier.contact?.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-secondary-400" />
                  <span>{supplier.contact?.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-secondary-400" />
                  <span>{supplier.contact?.website}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-secondary-400" />
                  <span>{supplier.address}</span>
                </div>
              </div>
            </Card>

            {/* Certifications */}
            <Card className="p-6">
              <h3 className="font-semibold text-secondary-900 mb-4">Certifications</h3>
              <div className="space-y-2">
                {supplier.certifications && supplier.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-secondary-700">{cert}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Business Hours */}
            <Card className="p-6">
              <h3 className="font-semibold text-secondary-900 mb-4">Business Hours</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Monday - Friday</span>
                  <span className="text-secondary-900">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Saturday</span>
                  <span className="text-secondary-900">9:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Sunday</span>
                  <span className="text-secondary-900">Closed</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-secondary-200">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'products', label: `Products (${supplier.total_products})` },
              { id: 'reviews', label: `Reviews (${supplier.total_reviews})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-secondary-900 mb-4">Company Highlights</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600">Years in Business</span>
                    <span className="font-medium">{new Date().getFullYear() - supplier.established} years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600">Employee Count</span>
                    <span className="font-medium">{supplier.employee_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600">Export Countries</span>
                    <span className="font-medium">{supplier.export_countries}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600">Main Products</span>
                    <span className="font-medium">{supplier.main_products}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-secondary-900 mb-4">Trade Capabilities</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600">Trade Type</span>
                    <span className="font-medium">{supplier.trade_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600">Payment Terms</span>
                    <span className="font-medium">{supplier.payment_terms}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600">Delivery Terms</span>
                    <span className="font-medium">{supplier.delivery_terms}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600">Min Order Value</span>
                    <span className="font-medium">${supplier.min_order_value}</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map(product => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                    </div>
                    <div className="p-4">
                      <Link href={`/buyer/products/${product.id}`}>
                        <h3 className="font-medium text-secondary-900 hover:text-primary-600 cursor-pointer line-clamp-2 mb-2">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-baseline space-x-1 mb-2">
                        <span className="text-lg font-bold text-primary-600">
                          ${product.price}
                        </span>
                        <span className="text-sm text-secondary-600">per {product.unit}</span>
                      </div>
                      <div className="text-xs text-secondary-500">
                        MOQ: {product.moq} {product.unit}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {products.length === 0 && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                  <p className="text-secondary-600">No products available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Review Summary */}
              <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary-900 mb-1">{supplier.rating}</div>
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      {renderStars(supplier.rating)}
                    </div>
                    <div className="text-sm text-secondary-600">{supplier.total_reviews} reviews</div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map(rating => (
                        <div key={rating} className="flex items-center space-x-2">
                          <span className="text-sm text-secondary-600 w-8">{rating}★</span>
                          <div className="flex-1 bg-secondary-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full" 
                              style={{ width: `${(supplier.rating_breakdown?.[rating] || 0)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-secondary-600 w-8">
                            {supplier.rating_breakdown?.[rating] || 0}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {reviews.map(review => (
                  <Card key={review.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{review.reviewer_name}</span>
                          {review.verified_purchase && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 mb-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-secondary-500 ml-2">{review.date}</span>
                        </div>
                        {review.product_name && (
                          <div className="text-sm text-secondary-600">
                            Product: {review.product_name}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-secondary-700">{review.comment}</p>
                  </Card>
                ))}
                
                {reviews.length === 0 && (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                    <p className="text-secondary-600">No reviews available</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
