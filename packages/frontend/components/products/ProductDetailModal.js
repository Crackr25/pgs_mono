import { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Package,
  Shield,
  Star,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Award,
  Truck,
  DollarSign,
  Info,
  Copy,
  Share2,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Factory,
  CheckCircle,
  AlertCircle,
  Play,
  Video
} from 'lucide-react';
import Link from 'next/link';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Card from '../common/Card';
import apiService from '../../lib/api';

export default function ProductDetailModal({ isOpen, onClose, productId, onEdit, onDelete }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [companyInfo, setCompanyInfo] = useState(null);

  // Fetch product details when modal opens
  useEffect(() => {
    if (isOpen && productId) {
      fetchProductDetails();
    }
  }, [isOpen, productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProduct(productId);
      console.log('Product response:', response); // Debug log
      setProduct(response);
      
      // Fetch company information if available
      if (response.company_id) {
        try {
          const companyResponse = await apiService.getCompany(response.company_id);
          setCompanyInfo(companyResponse);
        } catch (companyError) {
          console.error('Error fetching company info:', companyError);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setProduct(null);
    setCurrentImageIndex(0);
    setActiveTab('overview');
    setCompanyInfo(null);
    onClose();
  };

  // Use the EXACT same image logic as MultiImageUpload (which works in edit page)
  const getImageUrl = (image) => {
    if (typeof image === "string") {
      return image.startsWith("http") ? image : `https://api.pinoyglobalsupply.com/storage/${image}`;
    }
    if (image.image_path) {
      return `https://api.pinoyglobalsupply.com/storage/${image.image_path}`;
    }
    return image.image_url || "";
  };

  // Video URL helper function
  // const getVideoUrl = (video) => {
    // if (!video) return "";
    // if (typeof video === "string") {
      // if (video.startsWith("http")) return video;
      //return `https://api.pinoyglobalsupply.com/storage/${video}`;
    //}
    //if (video.video_path) {
      //return `https://api.pinoyglobalsupply.com/storage/${video.video_path}`;
    //}
    //return video.video_url || "";
  //};

  const getVideoUrl = (video) => {
  if (!video) return "";

  // If it's already a full URL (starts with http), just return it
  if (typeof video === "string") {
    if (video.startsWith("http")) return video;
    return `https://api.pinoyglobalsupply.com/storage/${video.replace(/^storage\//, "")}`;
  }

  // If it's an object (from your database)
  if (video.path) {
    // Remove any leading "storage/" if it accidentally exists
    const path = video.path.replace(/^storage\//, "");
    return `https://api.pinoyglobalsupply.com/storage/${path}`;
  }

  return "";
};	

  const images = (() => {
    if (product?.images && product.images.length > 0) {
      // Multiple images - process each one through getImageUrl
      return product.images.map(img => getImageUrl(img)).filter(url => url !== '');
    } else if (product?.image) {
      // Single image - process through getImageUrl
      const url = getImageUrl(product.image);
      return url ? [url] : [];
    }
    return [];
  })();

  // Debug log for images and videos
  if (product) {
    console.log('Product media data:', {
      rawImages: product.images,
      rawImage: product.image,
      rawVideos: product.videos,
      videosType: typeof product.videos,
      processedImages: images,
      productKeys: Object.keys(product),
      API_URL: process.env.NEXT_PUBLIC_API_URL
    });
    
    // Test if we can load the first image
    if (images.length > 0) {
      console.log('Testing first image URL:', images[0]);
      const testImg = new Image();
      testImg.onload = () => console.log('✅ Image loaded successfully:', images[0]);
      testImg.onerror = (e) => console.log('❌ Image failed to load:', images[0], e);
      testImg.src = images[0];
    }
  }

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const copyProductLink = () => {
    const productUrl = `${window.location.origin}/products/${productId}`;
    navigator.clipboard.writeText(productUrl);
    // You can add a toast notification here
  };

  const parseVariants = (variants) => {
    if (!variants) return [];
    if (Array.isArray(variants)) return variants;
    try {
      return JSON.parse(variants);
    } catch {
      return [];
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="" 
      size="full"
      className="max-w-7xl mx-auto"
      showCloseButton={false}
    >
      <div className="flex flex-col h-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={copyProductLink}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(productId)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="danger" size="sm" onClick={() => onDelete(productId)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">{error}</p>
                <Button onClick={fetchProductDetails} className="mt-4">
                  Try Again
                </Button>
              </div>
            </div>
          ) : product ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              {/* Left Column - Images */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
                  {images.length > 0 ? (
                    <>
                      <img
                        src={images[currentImageIndex]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('Image load error:', images[currentImageIndex]);
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="hidden w-full h-full flex items-center justify-center bg-gray-100">
                        <Package className="w-24 h-24 text-gray-400" />
                      </div>
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                            {currentImageIndex + 1} / {images.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="w-24 h-24 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(0, 8).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                          currentImageIndex === index ? 'border-primary-500' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="hidden w-full h-full flex items-center justify-center bg-gray-100">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Product Videos */}
                {(() => {
                  // Safely parse videos data
                  let videos = [];
                  try {
                    if (product?.videos) {
                      if (Array.isArray(product.videos)) {
                        videos = product.videos;
                      } else if (typeof product.videos === 'string') {
                        videos = JSON.parse(product.videos);
                      } else if (typeof product.videos === 'object') {
                        videos = Object.values(product.videos);
                      }
                    }
                  } catch (error) {
                    console.error('Error parsing videos:', error);
                    videos = [];
                  }
                  
                  return videos && videos.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <Video className="w-5 h-5 mr-2 text-blue-600" />
                        Product Videos ({videos.length})
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {videos.slice(0, 3).map((video, index) => {
                        const videoUrl = getVideoUrl(video);
                        console.log('Video URL:', videoUrl, 'Video object:', video);
                        
                        return (
                          <div key={video.id || index} className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                            {videoUrl ? (
                              <video
                                src={videoUrl}
                                className="w-full h-full object-contain"
                                controls
                                preload="metadata"
                                onError={(e) => {
                                  console.error('Video load error:', videoUrl, e);
                                  e.target.style.display = 'none';
                                  if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'flex';
                                  }
                                }}
                                onLoadedMetadata={() => {
                                  console.log('✅ Video loaded successfully:', videoUrl);
                                }}
                              >
                                Your browser does not support the video tag.
                              </video>
                            ) : null}
                            
                            {/* Fallback for when video fails to load */}
                            <div className="hidden w-full h-full flex items-center justify-center bg-gray-800 text-white">
                              <div className="text-center">
                                <Video className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">Video unavailable</p>
                                <p className="text-xs text-gray-400">{video.name || `Video ${index + 1}`}</p>
                              </div>
                            </div>
                            
                            {/* Video overlay info */}
                            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                              {video.name || `Video ${index + 1}`}
                            </div>
                            
                            {/* Play button overlay - only show when video is paused */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                              <div className="bg-black bg-opacity-50 rounded-full p-3">
                                <Play className="w-8 h-8 text-white" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      </div>
                      
                      {/* Show all videos count if more than 3 */}
                      {videos.length > 3 && (
                        <div className="text-sm text-gray-600 text-center">
                          Showing 3 of {videos.length} videos
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}

                {/* Company Info Card */}
                {companyInfo && (
                  <Card className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Supplier Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Factory className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{companyInfo.name}</p>
                          <p className="text-sm text-gray-600">{companyInfo.business_type}</p>
                        </div>
                      </div>
                      {companyInfo.address && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{companyInfo.address}</span>
                        </div>
                      )}
                      {companyInfo.established_year && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Established: {companyInfo.established_year}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-600">Verified Supplier</span>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Right Column - Product Details */}
              <div className="space-y-6">
                {/* Product Header */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <p className="text-lg font-semibold text-primary-600 mb-2">
                    {formatPrice(product.price)}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>245 views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Package className="w-4 h-4" />
                      <span>MOQ: {product.moq}</span>
                    </div>
                    {product.lead_time && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{product.lead_time}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Minimum Order</div>
                    <div className="font-semibold">{product.moq} pieces</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Lead Time</div>
                    <div className="font-semibold">{product.lead_time || '7-14 days'}</div>
                  </div>
                  {product.hs_code && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">HS Code</div>
                      <div className="font-semibold">{product.hs_code}</div>
                    </div>
                  )}
                  {product.origin_country && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Origin</div>
                      <div className="font-semibold">{product.origin_country}</div>
                    </div>
                  )}
                </div>

                {/* Variants */}
                {parseVariants(product.variants).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Available Variants</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {parseVariants(product.variants).map((variant, index) => (
                        <div key={index} className="p-2 border border-gray-200 rounded text-sm">
                          {typeof variant === 'object' ? 
                            Object.entries(variant).map(([key, value]) => (
                              <div key={key}>
                                <span className="text-gray-600">{key}:</span> {value}
                              </div>
                            )) : 
                            variant
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <div>
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'specifications', label: 'Specifications' },
                        { id: 'company', label: 'Company Profile' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === tab.id
                              ? 'border-primary-500 text-primary-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="py-4">
                    {activeTab === 'overview' && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                          <p className="text-gray-600 leading-relaxed">
                            {product.description || 'No description available.'}
                          </p>
                        </div>
                        {product.specs && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Key Features</h4>
                            <p className="text-gray-600">{product.specs}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'specifications' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          {product.category && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-600">Category</span>
                              <span className="font-medium">{product.category}</span>
                            </div>
                          )}
                          {product.hs_code && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-600">HS Code</span>
                              <span className="font-medium">{product.hs_code}</span>
                            </div>
                          )}
                          {product.origin_country && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-600">Country of Origin</span>
                              <span className="font-medium">{product.origin_country}</span>
                            </div>
                          )}
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Minimum Order Quantity</span>
                            <span className="font-medium">{product.moq} pieces</span>
                          </div>
                          {product.lead_time && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-600">Lead Time</span>
                              <span className="font-medium">{product.lead_time}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'company' && (
                      <div className="space-y-4">
                        {companyInfo ? (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">{companyInfo.name}</h4>
                              <p className="text-gray-600">{companyInfo.description || 'Professional manufacturer and supplier.'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {companyInfo.business_type && (
                                <div>
                                  <span className="text-gray-600">Business Type:</span>
                                  <div className="font-medium">{companyInfo.business_type}</div>
                                </div>
                              )}
                              {companyInfo.established_year && (
                                <div>
                                  <span className="text-gray-600">Established:</span>
                                  <div className="font-medium">{companyInfo.established_year}</div>
                                </div>
                              )}
                              {companyInfo.employee_count && (
                                <div>
                                  <span className="text-gray-600">Employees:</span>
                                  <div className="font-medium">{companyInfo.employee_count}</div>
                                </div>
                              )}
                              {companyInfo.annual_revenue && (
                                <div>
                                  <span className="text-gray-600">Annual Revenue:</span>
                                  <div className="font-medium">{companyInfo.annual_revenue}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-600">Company information not available.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <Link href={`/products/edit/${product.id}`} className="flex-1">
                    <Button className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Product
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={copyProductLink}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
