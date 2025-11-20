import { useState, useEffect } from 'react';
import { Eye, ShoppingCart, TrendingUp, Users, Star, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import apiService from '../../lib/api';
import { getImageUrl } from '../../lib/imageUtils';

export default function BusinessRecommendations({ 
  currentProduct, 
  currentCompany, 
  className = '' 
}) {
  const [recommendations, setRecommendations] = useState({
    relatedProducts: [],
    trending: [],
    fromSameSupplier: [],
    youMightLike: []
  });
  const [activeSection, setActiveSection] = useState('related');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [currentProduct?.id]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      
      // Fetch related products based on category using the proper API service
      const relatedData = await apiService.getMarketplaceProducts({ 
        category: currentProduct?.category, 
        limit: 4 
      });
      
      // Fetch trending products
      const trendingData = await apiService.getMarketplaceProducts({ 
        limit: 4,
        sort: 'trending' 
      });
      
      // Fetch products from same supplier
      const supplierData = await apiService.getMarketplaceProducts({ 
        limit: 8 // Get more to filter out current product
      });
      
      // Filter supplier products to exclude current product and show only from same company
      const filteredSupplierProducts = supplierData.data?.filter(product => 
        product.id !== currentProduct?.id && 
        product.company?.name === currentCompany?.name
      ) || [];
      
      // Fetch personalized recommendations (random products excluding current)
      const personalizedData = await apiService.getMarketplaceProducts({ 
        limit: 4 
      });
      
      // Filter out current product from all recommendations
      const filterCurrentProduct = (products) => 
        products?.filter(product => product.id !== currentProduct?.id) || [];

      setRecommendations({
        relatedProducts: filterCurrentProduct(relatedData.data || []),
        trending: filterCurrentProduct(trendingData.data || []),
        fromSameSupplier: filteredSupplierProducts.slice(0, 4),
        youMightLike: filterCurrentProduct(personalizedData.data || [])
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Fallback to empty arrays instead of mock data
      setRecommendations({
        relatedProducts: [],
        trending: [],
        fromSameSupplier: [],
        youMightLike: []
      });
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      id: 'related',
      title: 'Related Products',
      icon: <Eye className="w-4 h-4" />,
      data: recommendations.relatedProducts,
      description: `Similar products in ${currentProduct?.category || 'this category'}`
    },
    {
      id: 'trending',
      title: 'Trending Now',
      icon: <TrendingUp className="w-4 h-4" />,
      data: recommendations.trending,
      description: 'Popular products buyers are viewing'
    },
    {
      id: 'supplier',
      title: 'From This Supplier',
      icon: <Users className="w-4 h-4" />,
      data: recommendations.fromSameSupplier,
      description: `More products from ${currentCompany?.name || 'this supplier'}`
    },
    {
      id: 'personalized',
      title: 'You Might Like',
      icon: <Sparkles className="w-4 h-4" />,
      data: recommendations.youMightLike,
      description: 'Recommended based on your interests'
    }
  ];

  const activeData = sections.find(section => section.id === activeSection)?.data || [];

  const ProductCard = ({ product }) => {
    // Get the main image from the product - handle different API response formats
    const productImage = product.image || product.main_image?.image_path || product.images?.[0] || null;

    return (
      <Link href={`/buyer/products/${product.id}`}>
        <div className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer">
          <div className="relative">
            {getImageUrl(productImage) ? (
              <img
                src={getImageUrl(productImage)}
                alt={product.name}
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
            )}
            {product.company?.verified && (
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
                ✓
              </div>
            )}
          </div>
          
          <div className="p-3">
            <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {product.name}
            </h4>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-primary-600 font-bold text-sm">
                ${parseFloat(product.price).toFixed(2)}
              </span>
              <div className="flex items-center text-xs text-gray-500">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                {product.rating || '4.5'}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="truncate">{product.company?.name}</span>
              <span className="flex items-center">
                <ShoppingCart className="w-3 h-3 mr-1" />
                {product.orders || '0'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-40 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-48 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
        <h3 className="text-white font-semibold flex items-center">
          <Sparkles className="w-5 h-5 mr-2" />
          Business Recommendations
        </h3>
      </div>

      {/* Section Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex overflow-x-auto scrollbar-hide">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium flex items-center space-x-2 transition-colors border-b-2 ${
                activeSection === section.id
                  ? 'text-primary-600 border-primary-500 bg-white'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {section.icon}
              <span>{section.title}</span>
              <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {section.data.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Section Description */}
        <p className="text-gray-600 text-sm mb-4">
          {sections.find(section => section.id === activeSection)?.description}
        </p>

        {/* Products Grid */}
        {activeData.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {activeData.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm">No recommendations available</p>
          </div>
        )}

        {/* View More Button */}
        {activeData.length >= 4 && (
          <div className="text-center">
            <Link href={`/buyer/search?category=${currentProduct?.category || ''}`}>
              <button className="inline-flex items-center px-4 py-2 border border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium">
                View More Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
