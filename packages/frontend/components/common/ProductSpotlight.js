import { useState } from 'react';
import { Star, Shield, Award, Truck, Clock, Users, CheckCircle, Info } from 'lucide-react';

export default function ProductSpotlight({ product, company }) {
  const [activeTab, setActiveTab] = useState('features');

  // Extract key features from product data
  const getSpotlightFeatures = () => {
    const features = [];
    
    // Product quality indicators
    if (product?.rating >= 4) {
      features.push({
        icon: <Star className="w-5 h-5" />,
        title: "Top Rated Product",
        description: `${product.rating}/5 stars from ${product.reviews || 'verified'} reviews`,
        type: "quality"
      });
    }

    // Company verification
    if (company?.verified) {
      features.push({
        icon: <Shield className="w-5 h-5" />,
        title: "Verified Supplier",
        description: "Business license and identity verified by PGS",
        type: "trust"
      });
    }

    // Premium features
    if (product?.is_premium || company?.is_premium) {
      features.push({
        icon: <Award className="w-5 h-5" />,
        title: "Premium Supplier",
        description: "Enhanced service quality and customer support",
        type: "premium"
      });
    }

    // Shipping advantages
    if (product?.fast_shipping || company?.fast_shipping) {
      features.push({
        icon: <Truck className="w-5 h-5" />,
        title: "Fast Shipping",
        description: "Quick delivery with reliable logistics partners",
        type: "shipping"
      });
    }

    // Experience indicator
    if (company?.years_in_business >= 5) {
      features.push({
        icon: <Clock className="w-5 h-5" />,
        title: "Experienced Supplier",
        description: `${company.years_in_business}+ years in business`,
        type: "experience"
      });
    }

    // Popular product
    if (product?.view_count >= 1000 || product?.order_count >= 50) {
      features.push({
        icon: <Users className="w-5 h-5" />,
        title: "Popular Choice",
        description: `${product.view_count || '1000+'}+ views this month`,
        type: "popularity"
      });
    }

    return features;
  };

  const spotlightFeatures = getSpotlightFeatures();

  const tabs = [
    { id: 'features', label: 'Key Features', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'advantages', label: 'Advantages', icon: <Award className="w-4 h-4" /> },
    { id: 'info', label: 'Quick Info', icon: <Info className="w-4 h-4" /> }
  ];

  const getFeatureColor = (type) => {
    switch (type) {
      case 'quality': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'trust': return 'text-green-600 bg-green-50 border-green-200';
      case 'premium': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'shipping': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'experience': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'popularity': return 'text-pink-600 bg-pink-50 border-pink-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const renderFeatures = () => (
    <div className="space-y-3">
      {spotlightFeatures.map((feature, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${getFeatureColor(feature.type)} transition-all duration-200 hover:shadow-md`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {feature.icon}
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
              <p className="text-xs opacity-80">{feature.description}</p>
            </div>
          </div>
        </div>
      ))}
      
      {spotlightFeatures.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No special features highlighted for this product</p>
        </div>
      )}
    </div>
  );

  const renderAdvantages = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {/* Competitive pricing */}
        {product?.price && (
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">$</span>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-blue-900">Competitive Price</h4>
              <p className="text-xs text-blue-700">Best value in market range</p>
            </div>
          </div>
        )}

        {/* Quality assurance */}
        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-green-900">Quality Assured</h4>
            <p className="text-xs text-green-700">Rigorous quality control process</p>
          </div>
        </div>

        {/* Customer support */}
        <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-purple-900">24/7 Support</h4>
            <p className="text-xs text-purple-700">Dedicated customer service team</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuickInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        {product?.category && (
          <div>
            <span className="text-gray-500">Category:</span>
            <p className="font-semibold text-gray-900">{product.category}</p>
          </div>
        )}
        
        {product?.brand && (
          <div>
            <span className="text-gray-500">Brand:</span>
            <p className="font-semibold text-gray-900">{product.brand}</p>
          </div>
        )}

        {product?.model_number && (
          <div>
            <span className="text-gray-500">Model:</span>
            <p className="font-semibold text-gray-900">{product.model_number}</p>
          </div>
        )}

        {product?.min_order_quantity && (
          <div>
            <span className="text-gray-500">MOQ:</span>
            <p className="font-semibold text-gray-900">{product.min_order_quantity} {product.unit || 'pcs'}</p>
          </div>
        )}

        {company?.location && (
          <div>
            <span className="text-gray-500">Location:</span>
            <p className="font-semibold text-gray-900">{company.location}</p>
          </div>
        )}

        {product?.lead_time && (
          <div>
            <span className="text-gray-500">Lead Time:</span>
            <p className="font-semibold text-gray-900">{product.lead_time}</p>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-sm text-gray-900 mb-3">Product Stats</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-primary-600">
              {product?.view_count || '100+'}
            </div>
            <div className="text-xs text-gray-500">Views</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-primary-600">
              {product?.order_count || '50+'}
            </div>
            <div className="text-xs text-gray-500">Orders</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-primary-600">
              {product?.rating || '4.5'}★
            </div>
            <div className="text-xs text-gray-500">Rating</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3">
        <h3 className="text-white font-semibold text-sm flex items-center">
          <Star className="w-4 h-4 mr-2" />
          Product Spotlight
        </h3>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2 text-xs font-medium flex items-center justify-center space-x-1 transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'features' && renderFeatures()}
        {activeTab === 'advantages' && renderAdvantages()}
        {activeTab === 'info' && renderQuickInfo()}
      </div>
    </div>
  );
}
