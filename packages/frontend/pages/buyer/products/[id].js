import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
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
  AlertCircle
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Skeleton from '../../../components/common/Skeleton';
import apiService from '../../../lib/api';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [quantity, setQuantity] = useState('');
  
  const inquiryTemplates = [
    {
      id: 'price_inquiry',
      title: 'Price Inquiry',
      template: 'Hi, I am interested in your {product_name}. Could you please provide me with your best pricing for a quantity of {quantity} {unit}? I would also like to know about your payment terms and delivery timeline.'
    },
    {
      id: 'sample_request',
      title: 'Sample Request',
      template: 'Hello, I would like to request samples of your {product_name} for evaluation. We are considering this product for our upcoming project. Could you please let me know the sample availability and costs?'
    },
    {
      id: 'bulk_order',
      title: 'Bulk Order Inquiry',
      template: 'Good day! We are interested in placing a bulk order for {product_name}. Our required quantity is {quantity} {unit}. Please provide your best wholesale pricing, minimum order requirements, and delivery schedule.'
    },
    {
      id: 'technical_specs',
      title: 'Technical Specifications',
      template: 'Hi, I need more detailed technical specifications for {product_name}. Could you please provide additional documentation, certifications, and compatibility information for our technical evaluation?'
    },
    {
      id: 'partnership',
      title: 'Partnership Inquiry',
      template: 'Hello, we are interested in establishing a long-term partnership for {product_name} and similar products. We would like to discuss exclusive distribution opportunities and volume pricing structures.'
    },
    {
      id: 'custom',
      title: 'Custom Message',
      template: ''
    }
  ];

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const productData = await apiService.getMarketplaceProductDetails(id);
      setProduct(productData);
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    try {
      let messageContent = '';
      
      if (selectedTemplate === 'custom') {
        messageContent = customMessage;
      } else {
        const template = inquiryTemplates.find(t => t.id === selectedTemplate);
        if (template) {
          messageContent = template.template
            .replace('{product_name}', product.name)
            .replace('{quantity}', quantity || '[quantity]')
            .replace('{unit}', product.unit || 'units');
        }
      }

      // Add product context to the message
      const productContext = `
      
--- Product Details ---
Product: ${product.name}
Price: $${product.price.toFixed(2)} per ${product.unit}
MOQ: ${product.moq} ${product.unit}
Category: ${product.category}
Supplier: ${product.company.name}
Product Link: ${window.location.href}`;

      const messagePayload = {
        recipient_id: product.company.id,
        recipient_type: 'company',
        message: messageContent + productContext,
        product_id: parseInt(id),
        message_type: 'product_inquiry'
      };
      
      const response = await apiService.sendBuyerMessage(messagePayload);
      alert('Message sent successfully! You can continue the conversation in your messages.');
      setShowMessageForm(false);
      setSelectedTemplate('');
      setCustomMessage('');
      setQuantity('');
      
      // Redirect to buyer messages
      router.push('/buyer/messages');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const getTemplatePreview = () => {
    if (!selectedTemplate || selectedTemplate === 'custom') return '';
    
    const template = inquiryTemplates.find(t => t.id === selectedTemplate);
    if (!template || !product) return '';
    
    return template.template
      .replace('{product_name}', product.name)
      .replace('{quantity}', quantity || '[Enter quantity]')
      .replace('{unit}', product.unit || 'units');
  };

  const nextImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="h-96 w-full" />
            <div className="flex space-x-2">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-20 w-20" />
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
        <Link href="/buyer">
          <Button>Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{product.name} - Pinoy Global Supply</title>
        <meta name="description" content={product.description} />
      </Head>

      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-secondary-600">
          <Link href="/buyer" className="hover:text-primary-600">
            Marketplace
          </Link>
          <span>/</span>
          <Link href="/buyer" className="hover:text-primary-600">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-secondary-900">{product.name}</span>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>

        {/* Product Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-secondary-100 rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <>
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}${product.images[currentImageIndex]}`}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="w-16 h-16 text-secondary-400" />
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-2">{product.name}</h1>
              <p className="text-secondary-600">{product.description}</p>
            </div>

            {/* Price and Basic Info */}
            <div className="space-y-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-primary-600">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-secondary-600">per {product.unit}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-secondary-400" />
                  <span className="text-secondary-600">MOQ:</span>
                  <span className="font-medium">{product.moq} {product.unit}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-secondary-400" />
                  <span className="text-secondary-600">Lead Time:</span>
                  <span className="font-medium">{product.lead_time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-secondary-400" />
                  <span className="text-secondary-600">Stock:</span>
                  <span className="font-medium">{product.stock_quantity.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-secondary-400" />
                  <span className="text-secondary-600">HS Code:</span>
                  <span className="font-medium">{product.hs_code}</span>
                </div>
              </div>
            </div>

            {/* Company Info Card */}
            <Card className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-secondary-900">{product.company.name}</h3>
                      {product.company.verified && (
                        <Shield className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-secondary-600">
                      <MapPin className="w-3 h-3" />
                      <span>{product.company.location}</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      {renderStars(product.company.rating)}
                      <span className="text-sm text-secondary-600 ml-1">
                        ({product.company.total_reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-secondary-600">
                  <div>Response: {product.company.response_time}</div>
                  <div>Est. {product.company.established}</div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setShowMessageForm(true)}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="flex space-x-4">
              <Button variant="outline" className="flex-1">
                <Heart className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-secondary-200">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'specifications', label: 'Specifications' },
              { id: 'company', label: 'Company' },
              { id: 'reviews', label: 'Reviews' }
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
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-4">Product Overview</h3>
              <p className="text-secondary-700 mb-6">{product.description}</p>
              
              <h4 className="font-semibold mb-3">Key Features</h4>
              <ul className="list-disc list-inside space-y-1 text-secondary-700">
                <li>Energy-efficient LED technology</li>
                <li>Industrial-grade construction</li>
                <li>Long lifespan of 50,000+ hours</li>
                <li>IP65 waterproof rating</li>
                <li>3-year manufacturer warranty</li>
              </ul>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-secondary-100">
                    <span className="font-medium text-secondary-700">{key}:</span>
                    <span className="text-secondary-900">{value}</span>
                  </div>
                ))}
                {(!product.specifications || Object.keys(product.specifications).length === 0) && (
                  <div className="col-span-2 text-center text-secondary-500 py-4">
                    No specifications available
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">About {product.company.name}</h3>
                <p className="text-secondary-700 mb-4">{product.company.about}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Company Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Established:</span>
                        <span>{product.company.established}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Response Time:</span>
                        <span>{product.company.response_time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-secondary-400" />
                        <span>{product.company.contact.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-secondary-400" />
                        <span>{product.company.contact.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-secondary-400" />
                        <span>{product.company.contact.website}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.company.certifications && product.company.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                      >
                        <Award className="w-3 h-3 mr-1" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Review Tabs */}
              <div className="flex space-x-4 border-b border-secondary-200">
                <button className="pb-2 px-1 border-b-2 border-primary-500 text-primary-600 font-medium">
                  Product Reviews ({product.reviews?.product_reviews?.length || 0})
                </button>
                <button className="pb-2 px-1 border-b-2 border-transparent text-secondary-500 hover:text-secondary-700">
                  Company Reviews ({product.reviews?.company_reviews?.length || 0})
                </button>
              </div>

              {/* Product Reviews */}
              <div className="space-y-4">
                {product.reviews?.product_reviews?.map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{review.reviewer}</span>
                          {review.verified_purchase && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-secondary-500 ml-2">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-secondary-700">{review.comment}</p>
                  </Card>
                )) || (
                  <div className="text-center text-secondary-500 py-8">
                    No reviews available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Message Form Modal */}
        {showMessageForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Send Message to {product?.company?.name}</h3>
                  <button 
                    onClick={() => setShowMessageForm(false)}
                    className="text-secondary-400 hover:text-secondary-600"
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={handleMessageSubmit} className="space-y-4">
                  {/* Template Selection */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Choose Message Template
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {inquiryTemplates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => setSelectedTemplate(template.id)}
                          className={`p-3 text-left border rounded-md transition-colors ${
                            selectedTemplate === template.id
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-secondary-300 hover:border-secondary-400'
                          }`}
                        >
                          <div className="font-medium text-sm">{template.title}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Input for templates that need it */}
                  {selectedTemplate && selectedTemplate !== 'custom' && selectedTemplate !== 'technical_specs' && (
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Quantity Needed
                      </label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder={`Minimum: ${product?.moq || 0} ${product?.unit || 'units'}`}
                      />
                    </div>
                  )}

                  {/* Template Preview */}
                  {selectedTemplate && selectedTemplate !== 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Message Preview
                      </label>
                      <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-md text-sm text-secondary-700">
                        {getTemplatePreview() || 'Select a template and fill in the quantity to see preview'}
                      </div>
                    </div>
                  )}

                  {/* Custom Message Input */}
                  {selectedTemplate === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Custom Message *
                      </label>
                      <textarea
                        required
                        rows={6}
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Write your custom message here..."
                      />
                    </div>
                  )}

                  {/* Product Context Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="text-sm text-blue-800">
                      <strong>Note:</strong> Product details will be automatically included with your message:
                      <ul className="mt-1 ml-4 list-disc text-xs">
                        <li>Product name and specifications</li>
                        <li>Current pricing and MOQ</li>
                        <li>Direct link to this product page</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowMessageForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!selectedTemplate || (selectedTemplate === 'custom' && !customMessage.trim())}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50"
                    >
                      Send Message
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
