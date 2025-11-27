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
  AlertCircle,
  ShoppingCart,
  Plus,
  Minus,
  ZoomIn,
  Search,
  X
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Skeleton from '../../../components/common/Skeleton';
import CartNotification from '../../../components/common/CartNotification';
import ToastNotification from '../../../components/common/ToastNotification';
import LoginPromptModal from '../../../components/common/LoginPromptModal';
import ImageZoomViewer from '../../../components/common/ImageZoomViewer';
import ProductSpotlight from '../../../components/common/ProductSpotlight';
import BusinessRecommendations from '../../../components/common/BusinessRecommendations';
import ProminentSearchBar from '../../../components/common/ProminentSearchBar';
import FloatingChatIcon from '../../../components/common/FloatingChatIcon';
import SimpleFloatingChat from '../../../components/common/SimpleFloatingChat';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useLoginPrompt } from '../../../hooks/useLoginPrompt';
import apiService from '../../../lib/api';
import { getImageUrl } from '../../../lib/imageUtils';

// Helper function to get the correct company website URL
const getCompanyWebsiteUrl = (companyWebsite) => {
  if (!companyWebsite) return null;
  
  // If it's a localhost URL, convert it to production URL
  if (companyWebsite.includes('localhost')) {
    // Extract the path from localhost URL (e.g., /store/anrabess)
    const urlObj = new URL(companyWebsite);
    const path = urlObj.pathname;
    
    // Use the current domain (production or staging)
    return `${window.location.origin}${path}`;
  }
  
  // If it's already a full URL with http/https, return as is
  if (companyWebsite.startsWith('http://') || companyWebsite.startsWith('https://')) {
    return companyWebsite;
  }
  
  // If it's a relative path, prepend current domain
  if (companyWebsite.startsWith('/')) {
    return `${window.location.origin}${companyWebsite}`;
  }
  
  // Otherwise, assume it's an external domain and add https
  return `https://${companyWebsite}`;
};

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart: addToCartContext } = useCart();
  const { user } = useAuth();
  const { requireAuth, showLoginPrompt, hideLoginPrompt, promptConfig } = useLoginPrompt();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(1);
  const [selectedSpecs, setSelectedSpecs] = useState({});
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [variationPrice, setVariationPrice] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryType, setInquiryType] = useState('');
  const [inquiryQuantity, setInquiryQuantity] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({});
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [imageHoverZoom, setImageHoverZoom] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  
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
      checkIfProductSaved();
      fetchRelatedProducts();
    }
  }, [id]);

  useEffect(() => {
    if (product) {
      // Set minimum quantity to MOQ
      setCartQuantity(product.moq || 1);
      
      // Set default variation if available
      if (product.variations && product.variations.length > 0) {
        setSelectedVariation(product.variations[0]);
        setVariationPrice(product.variations[0].price);
      }
    }
  }, [product]);

  const showToastNotification = (type, title, message, duration = 5000) => {
    setToastConfig({ type, title, message, duration });
    setShowToast(true);
  };

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

  const checkIfProductSaved = async () => {
    try {
      const savedStatus = await apiService.checkSavedProduct(id);
      setIsSaved(savedStatus.is_saved);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      setLoadingRelated(true);
      const relatedData = await apiService.getRelatedProducts(id, 8);
      setRelatedProducts(relatedData.data || []);
    } catch (error) {
      console.error('Error fetching related products:', error);
      setRelatedProducts([]);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleSaveProduct = () => {
    // Use requireAuth to check if user is logged in before allowing save
    requireAuth(
      async () => {
        if (savingProduct) return;
        
        try {
          setSavingProduct(true);
          
          if (isSaved) {
            await apiService.unsaveProduct(id);
            setIsSaved(false);
          } else {
            await apiService.saveProduct(id);
            setIsSaved(true);
          }
        } catch (error) {
          console.error('Error saving/unsaving product:', error);
          alert('Failed to save product. Please try again.');
        } finally {
          setSavingProduct(false);
        }
      },
      {
        title: "Login Required",
        message: "You need to log in to save products to your list.",
        actionText: `Save "${product?.name}" to your list`
      }
    );
  };

  const handleAddToCart = () => {
    // Use requireAuth to check if user is logged in before allowing add to cart
    requireAuth(
      async () => {
        if (addingToCart) return;

        try {
          setAddingToCart(true);
          
          // Call addToCart with correct parameters: productId, quantity, specifications
          await addToCartContext(product.id, cartQuantity, selectedSpecs);
          setShowCartNotification(true);
          
          // Hide notification after 3 seconds
          setTimeout(() => {
            setShowCartNotification(false);
          }, 3000);
          
        } catch (error) {
          console.error('Error adding to cart:', error);
          showToastNotification(
            'error',
            'Cart Error',
            'Failed to add product to cart. Please try again.'
          );
        } finally {
          setAddingToCart(false);
        }
      },
      {
        title: "Login Required",
        message: "You need to log in to add products to your cart.",
        actionText: `Add "${product?.name}" to cart`
      }
    );
  };

  const handleInquirySubmit = async () => {
    if (submittingInquiry) return;

    // Validation
    if (!inquiryType) {
      showToastNotification('error', 'Missing Inquiry Type', 'Please select an inquiry type');
      return;
    }

    if (!inquiryMessage.trim()) {
      showToastNotification('error', 'Missing Message', 'Please enter a message');
      return;
    }

    try {
      setSubmittingInquiry(true);

      // Create message content with product context
      const productContext = `

--- Product Details ---
Product: ${product.name}
Price: $${getCurrentPrice().toFixed(2)} per ${product.unit}
MOQ: ${getCurrentMOQ()} ${product.unit}
Category: ${product.category}
Supplier: ${product.company.name}
Product Link: ${window.location.href}`;

      const messagePayload = {
        supplier_id: product.company.user_id || product.company.id,
        product_id: parseInt(id),
        message: inquiryMessage.trim() + productContext,
        inquiry_type: inquiryType,
        quantity_of_interest: inquiryQuantity ? parseInt(inquiryQuantity) : null,
        product_context: {
          // Fields for ProductMessageHeader component
          id: product.id,
          name: product.name,
          image: product.images && product.images.length > 0 ? product.images[0] : null,
          has_image: product.images && product.images.length > 0,
          price: getCurrentPrice().toString(),
          unit: product.unit,
          company_name: product.company.name,
          // Additional context fields
          product_id: product.id,
          product_name: product.name,
          product_price: getCurrentPrice(),
          product_unit: product.unit,
          product_moq: getCurrentMOQ(),
          product_category: product.category,
          product_subcategory: product.subcategory,
          product_description: product.description,
          product_stock: getCurrentStock(),
          supplier_name: product.company.name,
          supplier_id: product.company.id,
          supplier_location: product.company.location || 'Philippines',
          product_url: window.location.href,
          inquiry_timestamp: new Date().toISOString()
        }
      };
      
      console.log('Sending inquiry payload:', messagePayload);
      
      const response = await apiService.sendProductMessage(messagePayload);
      
      console.log('Inquiry response:', response);
      
      showToastNotification(
        'success',
        'Inquiry sent successfully!',
        'The supplier will respond to your inquiry soon. You can track responses in your messages.',
        5000
      );
      
      setShowInquiryModal(false);
      // Reset form
      setInquiryType('');
      setInquiryQuantity('');
      setInquiryMessage('');
      
      
    } catch (error) {
      console.error('Error sending inquiry:', error);
      
      // Better error handling
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.errors) {
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
            'Inquiry Failed',
            'Failed to send inquiry. Please try again.'
          );
        }
      } else if (error.message) {
        showToastNotification('error', 'Error', error.message);
      } else {
        showToastNotification(
          'error',
          'Network Error',
          'Failed to send inquiry. Please check your connection and try again.'
        );
      }
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const openInquiryModal = () => {
    // Use requireAuth to check if user is logged in before allowing inquiry
    requireAuth(
      () => {
        // Pre-populate form with default inquiry type
        setInquiryType('price_inquiry');
        setInquiryQuantity('');
        
        // Set default message based on price inquiry template
        const template = inquiryTemplates.find(t => t.id === 'price_inquiry');
        if (template) {
          setInquiryMessage(
            template.template
              .replace('{product_name}', product.name)
              .replace('{quantity}', '[quantity]')
              .replace('{unit}', product.unit || 'units')
          );
        }
        
        setShowInquiryModal(true);
      },
      {
        title: "Login Required",
        message: "You need to log in to send inquiries to suppliers.",
        actionText: `Send inquiry for "${product?.name}"`
      }
    );
  };

  const handleQuantityChange = (newQuantity) => {
    const minQty = getCurrentMOQ();
    const maxQty = getCurrentStock() || 999999;
    
    if (newQuantity >= minQty && newQuantity <= maxQty) {
      setCartQuantity(newQuantity);
    }
  };

  const handleSpecChange = (specKey, specValue) => {
    setSelectedSpecs(prev => ({
      ...prev,
      [specKey]: specValue
    }));
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTemplate || (selectedTemplate === 'custom' && !customMessage.trim())) {
      showToastNotification('error', 'Invalid Message', 'Please select a template or write a custom message');
      return;
    }

    try {
      let messageContent = '';
      
      if (selectedTemplate === 'custom') {
        messageContent = customMessage.trim();
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
Price: $${getCurrentPrice().toFixed(2)} per ${product.unit}
MOQ: ${getCurrentMOQ()} ${product.unit}
Category: ${product.category}
Supplier: ${product.company.name}
Product Link: ${window.location.href}`;

      // Use the correct API method for product messages
      const messagePayload = {
        supplier_id: product.company.user_id || product.company.id,
        product_id: parseInt(id),
        message: messageContent + productContext,
        product_context: {
          product_name: product.name,
          product_price: getCurrentPrice(),
          product_unit: product.unit,
          product_moq: getCurrentMOQ(),
          supplier_name: product.company.name
        }
      };
      
      console.log('Sending message payload:', messagePayload); // Debug log
      
      const response = await apiService.sendProductMessage(messagePayload);
      
      console.log('Message response:', response); // Debug log
      
      showToastNotification(
        'success',
        'Message sent successfully!',
        'You can continue the conversation in your messages section.',
        5000
      );
      
      setShowMessageForm(false);
      setSelectedTemplate('');
      setCustomMessage('');
      setQuantity('');
      
      // Redirect to buyer messages after a short delay
      setTimeout(() => {
        router.push('/buyer/messages');
      }, 2000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Better error handling
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
            'Message Failed',
            'Failed to send message. Please try again.'
          );
        }
      } else if (error.message) {
        showToastNotification('error', 'Error', error.message);
      } else {
        showToastNotification(
          'error',
          'Network Error',
          'Failed to send message. Please check your connection and try again.'
        );
      }
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

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  const handleVariationChange = (variation) => {
    setSelectedVariation(variation);
    setVariationPrice(variation.price);
    // Reset quantity to MOQ of selected variation
    setCartQuantity(variation.moq || product.moq || 1);
  };

  const getCurrentPrice = () => {
    return variationPrice || product.price;
  };

  const getCurrentMOQ = () => {
    return selectedVariation?.moq || product.moq || 1;
  };

  const getCurrentStock = () => {
    return selectedVariation?.stock_quantity || product.stock_quantity;
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
        {/* Enhanced Search Bar - Alibaba Style - Same as Main Page */}
        <ProminentSearchBar />

        {/* Enhanced Breadcrumb - Alibaba Style */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
          <div className="flex flex-col space-y-2 md:space-y-3">
            {/* Category Breadcrumb */}
            <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-secondary-600 overflow-x-auto whitespace-nowrap pb-1">
              <Link href="/buyer" className="hover:text-primary-600 transition-colors">
                Marketplace
              </Link>
              <span>/</span>
              <Link href={`/buyer?category=${encodeURIComponent(product.category)}`} className="hover:text-primary-600 transition-colors">
                {product.category}
              </Link>
              <span>/</span>
              <Link href={`/buyer?category=${encodeURIComponent(product.subcategory || product.category)}`} className="hover:text-primary-600 transition-colors">
                {product.subcategory || 'Products'}
              </Link>
              <span>/</span>
              <span className="text-secondary-900 font-medium">{product.name}</span>
            </div>
            
            {/* Product Title with Rating and Sales Info */}
            <div className="flex flex-col space-y-2">
              <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-secondary-900 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs sm:text-sm">
                {/* Rating */}
                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {renderStars(product.rating || product.company?.rating || 4.5)}
                  </div>
                  <span className="text-secondary-600">
                    {(product.rating || product.company?.rating || 4.5).toFixed(1)}
                  </span>
                  <span className="text-secondary-500">
                    ({product.total_reviews || product.company?.total_reviews || 0} reviews)
                  </span>
                </div>
                
                {/* Sales Info */}
                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-secondary-500">
                  <span className="hidden sm:inline">•</span>
                  <span>{product.orders_count || 88} sold</span>
                  {product.is_trending && (
                    <>
                      <span>•</span>
                      <span className="text-orange-600 font-medium">#1 hot selling in {product.category}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Company Info - Clickable with Philippines location */}
              <div className="flex flex-wrap items-center gap-1 md:gap-2">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-3 h-3 text-primary-600" />
                </div>
                {/* OLD LOGIC (kept for reference, hidden):
                {product.company?.id ? (
                  <Link 
                    href={`/buyer/suppliers/${encodeURIComponent(product.company.id)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors cursor-pointer"
                    onClick={() => {
                      console.log('Navigating to supplier ID:', product.company.id);
                    }}
                  >
                    {product.company.name}
                  </Link>
                ) : (
                  <span className="text-primary-600 font-medium">
                    {product.company?.name || 'Unknown Company'}
                  </span>
                )}
                */}
                {/* NEW LOGIC: Redirect to manufacturer's website */}
                {product.company?.website ? (
                  (() => {
                    const websiteUrl = getCompanyWebsiteUrl(product.company.website);
                    const isInternalStorefront = websiteUrl && (websiteUrl.includes('/store/') || websiteUrl.startsWith('/store/'));
                    
                    console.log('=== COMPANY NAME CLICK DEBUG ===');
                    console.log('Company:', product.company.name);
                    console.log('Original website:', product.company.website);
                    console.log('Processed URL:', websiteUrl);
                    console.log('Is internal storefront:', isInternalStorefront);
                    
                    if (isInternalStorefront) {
                      // For internal storefronts, open in new tab
                      return (
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors cursor-pointer"
                          title={`Visit ${product.company.name}'s website`}
                          onClick={(e) => {
                            console.log('Clicking company link, opening:', websiteUrl);
                          }}
                        >
                          {product.company.name}
                        </a>
                      );
                    } else {
                      // For external websites, use regular anchor tag
                      return (
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors cursor-pointer"
                          title={`Visit ${product.company.name}'s website`}
                        >
                          {product.company.name}
                        </a>
                      );
                    }
                  })()
                ) : (
                  <span className="text-primary-600 font-medium">
                    {product.company?.name || 'Unknown Company'}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="block text-xs text-orange-500 mt-1">
                        No company website available
                      </div>
                    )}
                  </span>
                )}
                <span className="text-secondary-500">•</span>
                <span className="text-secondary-600 text-sm">{product.company?.years_in_business || '3'} yrs</span>
                <span className="text-secondary-500">•</span>
                <div className="flex items-center space-x-1">
                  <span className="w-4 h-3 bg-blue-500 rounded-sm flex items-center justify-center relative overflow-hidden">
                    <span className="absolute inset-0 bg-red-500" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}></span>
                    <span className="text-white text-xs font-bold relative z-10">PH</span>
                  </span>
                  <span className="text-secondary-600 text-sm">Philippines</span>
                </div>
              </div>
            </div>
          </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Left Column - Images + Business Recommendations + Tabs */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Product Images */}
            <div className="flex gap-2 md:gap-4">
              {/* Image Thumbnails - Hidden on mobile, visible on tablet+ */}
              {product.images && product.images.length > 1 && (
                <div className="hidden sm:flex flex-col space-y-2 w-16 md:w-20">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => selectImage(index)}
                      className={`relative aspect-square bg-secondary-100 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:border-primary-300 ${
                        currentImageIndex === index
                          ? 'border-primary-500 ring-2 ring-primary-200'
                          : 'border-secondary-200'
                      }`}
                    >
                      <Image
                        src={getImageUrl(image)}
                        alt={`${product.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Main Image */}
              <div className="flex-1">
                <div 
                  className="relative aspect-square bg-secondary-100 rounded-lg overflow-hidden cursor-zoom-in group"
                  onMouseEnter={() => setImageHoverZoom(true)}
                  onMouseLeave={() => setImageHoverZoom(false)}
                  onClick={() => setShowImageZoom(true)}
                >
                  {product.images && product.images.length > 0 ? (
                    <>
                      <Image
                        src={getImageUrl(product.images[currentImageIndex])}
                        alt={product.name}
                        fill
                        className={`object-cover transition-transform duration-300 ${
                          imageHoverZoom ? 'scale-110' : 'scale-100'
                        }`}
                      />
                      
                      {/* Zoom indicator */}
                      <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm flex items-center space-x-1">
                        <ZoomIn className="w-3 h-3" />
                        <span>Click to zoom</span>
                      </div>
                      
                      {product.images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              prevImage();
                            }}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all duration-200"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              nextImage();
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all duration-200"
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
            </div>

            {/* Business Recommendations - Below images, same width */}
            <div className="w-full">
              <BusinessRecommendations 
                currentProduct={product}
                currentCompany={product.company}
                className="w-full"
              />
            </div>

            {/* Tabs Navigation - Below Business Recommendations */}
            <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="border-b border-secondary-200 overflow-x-auto">
                <nav className="flex space-x-4 md:space-x-8 px-3 md:px-6 min-w-min">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'specifications', label: 'Specifications' },
                    { id: 'company', label: 'Company' },
                    { id: 'reviews', label: 'Reviews' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-3 md:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
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

              {/* Tab Content - Inside the same card */}
              <div className="p-4 md:p-6">
                {activeTab === 'overview' && (
                  <div className="max-w-none">
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
                  <div className="max-w-none">
                    <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Technical Specifications</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-secondary-100">
                          <span className="font-medium text-secondary-700">{key}:</span>
                          <span className="text-secondary-900">{value}</span>
                        </div>
                      ))}
                      {(!product.specifications || Object.keys(product.specifications).length === 0) && (
                        <div className="col-span-full text-center text-secondary-500 py-4">
                          No specifications available
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'company' && (
                  <div className="max-w-none space-y-6">
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
                  <div className="max-w-none space-y-6">
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
                    <div className="grid grid-cols-1 gap-4">
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
            </div>
          </div>

          {/* Right Column - Product Info with Improved Sticky Behavior */}
          <div className="lg:col-span-1 relative">
            <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto bg-white rounded-lg border border-gray-200 shadow-sm">
              {/* Product Title and Description - Keep all existing content */}
              <div className="p-4 md:p-6 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-secondary-900 mb-3">{product.name}</h1>
                <p className="text-secondary-600 text-sm leading-relaxed">{product.description}</p>
              </div>

              {/* Price Section */}
              <div className="p-4 md:p-6 border-b border-gray-100">
                <div className="flex flex-wrap items-baseline gap-2 mb-3 md:mb-4">
                  <span className="text-2xl md:text-3xl font-bold text-primary-600">
                    ${getCurrentPrice().toFixed(2)}
                  </span>
                  <span className="text-secondary-600">per {product.unit}</span>
                  {selectedVariation && (
                    <span className="text-sm text-secondary-500">
                      ({selectedVariation.name})
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-600 flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      MOQ:
                    </span>
                    <span className="font-medium">{getCurrentMOQ()} {product.unit}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-600 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Lead Time:
                    </span>
                    <span className="font-medium">{product.lead_time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-600 flex items-center">
                      <Truck className="w-4 h-4 mr-2" />
                      Stock:
                    </span>
                    <span className="font-medium">{getCurrentStock().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-600 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      HS Code:
                    </span>
                    <span className="font-medium">{product.hs_code}</span>
                  </div>
                </div>
              </div>

              {/* Product Variations */}
              {product.variations && product.variations.length > 0 && (
                <div className="p-4 md:p-6 border-b border-gray-100">
                  <h3 className="text-base md:text-lg font-semibold text-secondary-900 mb-3">Variations</h3>
                  <div className="space-y-2">
                    {product.variations.map((variation, index) => (
                      <button
                        key={index}
                        onClick={() => handleVariationChange(variation)}
                        className={`w-full p-3 border rounded-lg text-left transition-all duration-200 ${
                          selectedVariation === variation
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-secondary-900">{variation.name}</div>
                            {variation.description && (
                              <div className="text-sm text-secondary-600 mt-1">{variation.description}</div>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-xs text-secondary-500">
                              <span>MOQ: {variation.moq || product.moq} {product.unit}</span>
                              <span>Stock: {variation.stock_quantity?.toLocaleString() || 'N/A'}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary-600">
                              ${variation.price.toFixed(2)}
                            </div>
                            <div className="text-xs text-secondary-600">per {product.unit}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Company Info */}
              <div className="p-4 md:p-6 border-b border-gray-100">
                <div className="flex items-start space-x-2 md:space-x-3 mb-3 md:mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {/* OLD LOGIC (kept for reference, hidden):
                      {product.company?.id ? (
                        <Link 
                          href={`/buyer/suppliers/${encodeURIComponent(product.company.id)}`}
                          onClick={() => {
                            console.log('Navigating to supplier ID (sidebar):', product.company.id);
                          }}
                        >
                          <h3 className="font-semibold text-secondary-900 hover:text-primary-600 cursor-pointer">
                            {product.company.name}
                          </h3>
                        </Link>
                      ) : (
                        <h3 className="font-semibold text-secondary-900">
                          {product.company?.name || 'Unknown Company'}
                        </h3>
                      )}
                      */}
                      {/* NEW LOGIC: Redirect to manufacturer's website */}
                      {product.company?.website ? (
                        (() => {
                          const websiteUrl = getCompanyWebsiteUrl(product.company.website);
                          const isInternalStorefront = websiteUrl && (websiteUrl.includes('/store/') || websiteUrl.startsWith('/store/'));
                          
                          if (isInternalStorefront) {
                            // For internal storefronts, open in new tab
                            return (
                              <a
                                href={websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-secondary-900 hover:text-primary-600 hover:underline cursor-pointer transition-colors"
                                title={`Visit ${product.company.name}'s website`}
                              >
                                {product.company.name}
                              </a>
                            );
                          } else {
                            // For external websites, use regular anchor tag
                            return (
                              <a
                                href={websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-secondary-900 hover:text-primary-600 hover:underline cursor-pointer transition-colors"
                                title={`Visit ${product.company.name}'s website`}
                              >
                                {product.company.name}
                              </a>
                            );
                          }
                        })()
                      ) : (
                        <h3 className="font-semibold text-secondary-900">
                          {product.company?.name || 'Unknown Company'}
                          {process.env.NODE_ENV === 'development' && (
                            <div className="text-xs text-orange-500 mt-1">
                              No company website available
                            </div>
                          )}
                        </h3>
                      )}
                      {product.company?.verified && (
                        <Shield className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-secondary-600 mt-1">
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
                  <div className="text-right text-xs text-secondary-600">
                    <div>Response: {product.company.response_time}</div>
                    <div>Est. {product.company.established}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                    <Button 
                      onClick={() => requireAuth(
                        () => setShowFloatingChat(true),
                        {
                          title: "Login Required",
                          message: "You need to log in to chat with suppliers.",
                          actionText: `Chat with ${product?.company?.name}`
                        }
                      )}
                      variant="primary"
                      size="sm"
                      className="flex-1"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Chat now
                    </Button>
                    <Button 
                      onClick={openInquiryModal}
                      variant="success"
                      size="sm"
                      className="flex-1"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Send inquiry
                    </Button>
                  </div>
                </div>
              </div>

              {/* Add to Cart Section */}
              {getCurrentStock() > 0 && (
                <div className="p-4 md:p-6 border-b border-gray-100">
                  <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Add to Cart</h3>
                  
                  {/* Specifications Selection */}
                  {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2 text-sm">Select Specifications:</h4>
                      <div className="space-y-3">
                        {Object.entries(product.specifications).map(([key, value]) => {
                          if (typeof value === 'string' && value.includes(',')) {
                            const options = value.split(',').map(opt => opt.trim());
                            return (
                              <div key={key}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  {key}:
                                </label>
                                <select
                                  value={selectedSpecs[key] || ''}
                                  onChange={(e) => handleSpecChange(key, e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                >
                                  <option value="">Select {key}</option>
                                  {options.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            );
                          } else {
                            return (
                              <div key={key} className="flex justify-between py-1">
                                <span className="text-sm font-medium text-gray-700">{key}:</span>
                                <span className="text-sm text-gray-900">{value}</span>
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quantity Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity:
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(cartQuantity - 1)}
                        disabled={cartQuantity <= getCurrentMOQ()}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={cartQuantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        min={getCurrentMOQ()}
                        max={getCurrentStock()}
                        className="w-20 px-3 py-2 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                      <button
                        onClick={() => handleQuantityChange(cartQuantity + 1)}
                        disabled={cartQuantity >= getCurrentStock()}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      {product.unit} (Min: {getCurrentMOQ()}, Max: {getCurrentStock()})
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Price:</span>
                      <span className="text-xl font-bold text-primary-600">
                        ${(getCurrentPrice() * cartQuantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      ${getCurrentPrice().toFixed(2)} × {cartQuantity} {product.unit}
                      {selectedVariation && (
                        <span className="ml-2 text-primary-600">({selectedVariation.name})</span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={handleAddToCart}
                    disabled={addingToCart || cartQuantity < getCurrentMOQ() || cartQuantity > getCurrentStock()}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                  </Button>
                </div>
              )}

              {/* Out of Stock Message */}
              {getCurrentStock() === 0 && (
                <div className="p-4 md:p-6 border-b border-gray-100">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Out of Stock</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">
                      This product is currently out of stock. Contact the supplier for availability.
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleSaveProduct}
                    disabled={savingProduct}
                    className="flex items-center justify-center"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current text-red-600' : ''}`} />
                    {savingProduct ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                  </Button>
                  <Button variant="outline" className="flex items-center justify-center">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Message Form Modal */}
        {showMessageForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 md:p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6">
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
                    <label className="block text-xs md:text-sm font-medium text-secondary-700 mb-2">
                      Choose Message Template
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

        {/* Inquiry Modal */}
        {showInquiryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 md:p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
                <h3 className="text-lg md:text-xl font-semibold text-secondary-900">Send Inquiry</h3>
                <button
                  onClick={() => setShowInquiryModal(false)}
                  className="text-secondary-400 hover:text-secondary-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Supplier Info */}
              <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50">
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-secondary-900">{product?.company?.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-secondary-600 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{product?.company?.location || 'Philippines'}</span>
                      <span>•</span>
                      <span>Response: {product?.company?.response_time || '< 24h'}</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      {renderStars(product?.company?.rating || 4.5)}
                      <span className="text-sm text-secondary-600 ml-1">
                        ({product?.company?.total_reviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Info Summary */}
              <div className="p-4 md:p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {product?.images && product.images.length > 0 ? (
                      <Image
                        src={getImageUrl(product.images[0])}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-secondary-900 mb-1">{product?.name}</h4>
                    <div className="flex items-center space-x-3 text-sm text-secondary-600">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span className="font-medium text-primary-600">${product?.price}/{product?.unit}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Package className="w-3 h-3" />
                        <span>MOQ: {product?.moq} {product?.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6">
                <form onSubmit={(e) => { e.preventDefault(); handleInquirySubmit(); }} className="space-y-4 md:space-y-6">
                  {/* Inquiry Type */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Inquiry Type *
                    </label>
                    <select
                      value={inquiryType}
                      onChange={(e) => {
                        setInquiryType(e.target.value);
                        const template = inquiryTemplates.find(t => t.id === e.target.value);
                        if (template && template.template) {
                          setInquiryMessage(
                            template.template
                              .replace('{product_name}', product.name)
                              .replace('{quantity}', inquiryQuantity || '[quantity]')
                              .replace('{unit}', product.unit || 'units')
                          );
                        } else if (e.target.value === 'custom') {
                          setInquiryMessage('');
                        }
                      }}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">Select inquiry type...</option>
                      {inquiryTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity of Interest (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Quantity of Interest (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inquiryQuantity}
                        onChange={(e) => {
                          setInquiryQuantity(e.target.value);
                          // Update message template with new quantity
                          if (inquiryType && inquiryType !== 'custom') {
                            const template = inquiryTemplates.find(t => t.id === inquiryType);
                            if (template && template.template) {
                              setInquiryMessage(
                                template.template
                                  .replace('{product_name}', product.name)
                                  .replace('{quantity}', e.target.value || '[quantity]')
                                  .replace('{unit}', product.unit || 'units')
                              );
                            }
                          }
                        }}
                        min="1"
                        placeholder={`e.g., ${product?.moq || 100}`}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="absolute right-3 top-2 text-sm text-secondary-500">
                        {product?.unit}
                      </span>
                    </div>
                    <p className="text-xs text-secondary-500 mt-1">
                      This helps the supplier provide more accurate information
                    </p>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      rows={5}
                      placeholder="Please provide details about your inquiry..."
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      required
                    />
                    {inquiryType && inquiryType !== 'custom' && (
                      <p className="text-xs text-secondary-500 mt-1">
                        💡 Message auto-filled based on inquiry type. Feel free to customize it.
                      </p>
                    )}
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowInquiryModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="success"
                      className="flex-1"
                      disabled={
                        submittingInquiry || 
                        !inquiryType || 
                        !inquiryMessage.trim()
                      }
                    >
                      {submittingInquiry ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Send Inquiry
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 md:mt-12">
            <div className="mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-secondary-900 mb-2">
                Related Products
              </h2>
              <p className="text-sm md:text-base text-secondary-600">
                You might also be interested in these products from the same category
              </p>
            </div>
            
            {loadingRelated ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-secondary-200 h-48 rounded-lg mb-3"></div>
                    <div className="h-4 bg-secondary-200 rounded mb-2"></div>
                    <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link key={relatedProduct.id} href={`/buyer/products/${relatedProduct.id}`}>
                    <div className="group cursor-pointer bg-white rounded-lg border border-secondary-200 overflow-hidden hover:shadow-lg transition-all duration-200">
                      {/* Product Image */}
                      <div className="relative aspect-square bg-secondary-100">
                        {relatedProduct.has_image ? (
                          <img
                            src={getImageUrl(relatedProduct.image)}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-secondary-400" />
                          </div>
                        )}
                        
                        {/* Verified Badge */}
                        {relatedProduct.company?.verified && (
                          <div className="absolute top-2 left-2">
                            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                              <Shield className="w-3 h-3" />
                              <span>Verified</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-secondary-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                          {relatedProduct.name}
                        </h3>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-primary-600">
                            ${parseFloat(relatedProduct.price).toFixed(2)}
                            {relatedProduct.unit && `/${relatedProduct.unit}`}
                          </span>
                          <span className="text-xs text-secondary-500">
                            MOQ: {relatedProduct.moq}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1 mb-2">
                          <MapPin className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                          <span className="text-sm text-secondary-600 truncate">
                            {relatedProduct.company?.location || 'Philippines'}
                          </span>
                        </div>
                        
                        <div className="text-sm text-secondary-600 truncate">
                          {relatedProduct.company?.name}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cart Notification */}
        <CartNotification
          show={showCartNotification}
          onClose={() => setShowCartNotification(false)}
          productName={product?.name}
          quantity={cartQuantity}
        />

        {/* Login Prompt Modal */}
        <LoginPromptModal
          isOpen={showLoginPrompt}
          onClose={hideLoginPrompt}
          title={promptConfig.title}
          message={promptConfig.message}
          actionText={promptConfig.actionText}
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

        {/* Image Zoom Viewer */}
        {showImageZoom && product?.images && (
          <ImageZoomViewer
            images={product.images.map(img => getImageUrl(img))}
            currentIndex={currentImageIndex}
            onClose={() => setShowImageZoom(false)}
            onIndexChange={(index) => setCurrentImageIndex(index)}
          />
        )}

        {/* Floating Chat Icon */}
        <FloatingChatIcon
          onClick={() => requireAuth(
            () => setShowFloatingChat(true),
            {
              title: "Login Required",
              message: "You need to log in to chat with suppliers.",
              actionText: `Chat with ${product?.company?.name}`
            }
          )}
          isVisible={!showFloatingChat}
        />

        {/* Simple Floating Chat */}
        <SimpleFloatingChat
          isOpen={showFloatingChat}
          onClose={() => setShowFloatingChat(false)}
          product={product}
        />
      </div>
    </>
  );
}
