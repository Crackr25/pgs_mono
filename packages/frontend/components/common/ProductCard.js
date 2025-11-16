import Link from 'next/link';
import { ExternalLink, MapPin, MessageSquare, DollarSign, ShoppingCart, Star, Shield } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Badge from './Badge';
import { getImageUrl } from '../../lib/imageUtils';

export default function ProductCard({ 
  product, 
  onContact, 
  onQuote, 
  viewMode = 'grid', 
  className = '' 
}) {
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return numPrice.toFixed(2);
  };

  const renderSupplierLink = () => {
    const supplierName = product.company?.name || product.supplier?.name || 'Unknown Supplier';
    const supplierWebsite = product.company?.website || product.supplier?.website;
    const supplierId = product.company?.id || product.supplier?.id;

    // Priority 1: Website link (could be external website OR storefront)
    if (supplierWebsite) {
      // Check if it's a storefront URL (internal) or external website
      const isStorefront = supplierWebsite.includes('/store/');
      
      if (isStorefront) {
        // For storefronts, use Next.js Link for better performance
        return (
          <Link href={supplierWebsite.replace(process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000', '')}>
            <span 
              className="text-primary-600 hover:text-primary-700 hover:underline font-medium cursor-pointer transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
              title={`Visit ${supplierName}'s storefront`}
            >
              {supplierName}
            </span>
          </Link>
        );
      } else if (supplierWebsite.startsWith('http')) {
        // External website - open in new tab
        return (
          <a
            href={supplierWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 hover:underline font-medium cursor-pointer transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
            title={`Visit ${supplierName}'s website`}
          >
            {supplierName}
          </a>
        );
      }
    }

    // Priority 2: Internal supplier page (OLD LOGIC - kept as fallback)
    if (supplierId) {
      return (
        <Link href={`/buyer/suppliers/${supplierId}`}>
          <span 
            className="text-primary-600 hover:text-primary-700 hover:underline font-medium cursor-pointer transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
            title={`View ${supplierName}'s profile`}
          >
            {supplierName}
          </span>
        </Link>
      );
    }

    // Fallback: Non-clickable name
    return (
      <span className="text-secondary-700 font-medium">{supplierName}</span>
    );
  };

  const renderRating = () => {
    // Since rating isn't in the model yet, we'll skip rendering for now
    // This can be implemented when you add a reviews/ratings system
    return null;
    
    /* Future implementation when ratings are added:
    const rating = product.company?.rating || product.supplier?.rating;
    if (!rating) return null;

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
      <div className="flex items-center space-x-1">
        <div className="flex">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={`w-3 h-3 ${
                index < fullStars
                  ? 'text-yellow-400 fill-current'
                  : index === fullStars && hasHalfStar
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-secondary-600">({rating})</span>
      </div>
    );
    */
  };

  const renderBadges = () => {
    const badges = [];
    
    // Check for verified status (this exists in the company model)
    if (product.company?.verified) {
      badges.push(
        <Badge 
          key="verified" 
          variant="success" 
          size="sm"
          className="flex items-center space-x-1"
        >
          <Shield className="w-3 h-3" />
          <span>Verified</span>
        </Badge>
      );
    }

    // Gold supplier feature - this would need to be added to the model
    // For now, we'll comment it out
    /*
    if (product.company?.gold_supplier || product.supplier?.gold_supplier) {
      badges.push(
        <Badge 
          key="gold" 
          variant="warning" 
          size="sm"
          className="flex items-center space-x-1"
        >
          <Star className="w-3 h-3" />
          <span>Gold</span>
        </Badge>
      );
    }
    */

    // Category badge
    if (product.category) {
      badges.push(
        <Badge key="category" variant="secondary" size="sm">
          {product.category}
        </Badge>
      );
    }

    return badges;
  };

  if (viewMode === 'list') {
    return (
      <Card className={`group hover:shadow-lg transition-all duration-200 ${className}`}>
        <div className="flex space-x-4">
          {/* Product Image */}
          <Link href={`/buyer/products/${product.id}`}>
            <div className="flex-shrink-0 w-48 h-32 cursor-pointer">
              {product.has_image ? (
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center group-hover:bg-gray-300 transition-colors duration-200">
                  <ShoppingCart className="w-8 h-8 text-gray-500" />
                </div>
              )}
            </div>
          </Link>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <Link href={`/buyer/products/${product.id}`}>
              <div className="cursor-pointer">
                <h4 className="text-lg font-medium text-secondary-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {product.name}
                </h4>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-primary-600">
                    ${formatPrice(product.price)}{product.unit ? `/${product.unit}` : ''}
                  </span>
                  <span className="text-sm text-secondary-500">MOQ: {product.moq}</span>
                </div>

                <div className="flex items-center space-x-4 mb-2">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-secondary-400" />
                    <span className="text-sm text-secondary-600">
                      {product.company?.location || product.supplier?.location || 'N/A'}
                    </span>
                  </div>
                  {renderRating()}
                </div>

                <div className="mb-2">
                  {renderSupplierLink()}
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  {renderBadges()}
                </div>

                <p className="text-xs text-secondary-500">
                  Lead time: {product.lead_time || 'Contact supplier'}
                </p>
              </div>
            </Link>

            {/* Action Buttons */}
            <div className="flex space-x-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onContact(product);
                }}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 flex flex-col h-full ${className}`}>
      <Link href={`/buyer/products/${product.id}`}>
        <div className="cursor-pointer flex-1 flex flex-col">
          {/* Product Image */}
          <div className="relative mb-3">
            {product.has_image ? (
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center group-hover:bg-gray-300 transition-colors duration-200">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-500">No Image Available</p>
                </div>
              </div>
            )}

            {/* Supplier badges overlay */}
            <div className="absolute top-2 left-2 flex flex-col space-y-1">
              {product.company?.verified && (
                <Badge variant="success" size="sm" className="flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Verified</span>
                </Badge>
              )}
              {/* Gold supplier badge - uncomment when field is added to model
              {product.company?.gold_supplier && (
                <Badge variant="warning" size="sm" className="flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>Gold</span>
                </Badge>
              )}
              */}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="flex-1 flex flex-col">
            <h4 className="text-sm font-medium text-secondary-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors min-h-[2.5rem]">
              {product.name}
            </h4>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-primary-600">
                ${formatPrice(product.price)}{product.unit ? `/${product.unit}` : ''}
              </span>
              <span className="text-xs text-secondary-500">MOQ: {product.moq}</span>
            </div>
            
            <div className="flex items-center space-x-1 mb-2">
              <MapPin className="w-4 h-4 text-secondary-400 flex-shrink-0" />
              <span className="text-sm text-secondary-600 truncate">
                {product.company?.location || product.supplier?.location || 'N/A'}
              </span>
            </div>

            {renderRating() && (
              <div className="mb-2">
                {renderRating()}
              </div>
            )}
            
            <div className="mb-2">
              {product.category && (
                <Badge variant="secondary" size="sm">
                  {product.category}
                </Badge>
              )}
            </div>
            
            <div className="mb-3 mt-auto">
              <div className="mb-1">
                {renderSupplierLink()}
              </div>
              <p className="text-xs text-secondary-500">
                Lead time: {product.lead_time || 'Contact supplier'}
              </p>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Action Buttons */}
      <div className="mt-auto pt-3">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onContact(product);
            }}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Message
          </Button>
        </div>
      </div>
    </Card>
  );
}
