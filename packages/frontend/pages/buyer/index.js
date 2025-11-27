import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Plus, 
  TrendingUp, 
  Clock,
  Package,
  Users,
  Phone
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ProductGrid from '../../components/buyer/ProductGrid';
import { StatsSkeleton } from '../../components/common/Skeleton';
import ContactModal from '../../components/common/ContactModal';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../lib/api';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [marketplaceStats, setMarketplaceStats] = useState({
    total_suppliers: 0,
    verified_suppliers: 0,
    total_products: 0,
    active_products: 0
  });

  useEffect(() => {
    fetchMarketplaceStats();
  }, []);

  const fetchMarketplaceStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMarketplaceStats();
      setMarketplaceStats(response);
    } catch (error) {
      console.error('Error fetching marketplace stats:', error);
    } finally {
      setLoading(false);
    }
  };




  return (
    <>
      <Head>
        <title>Marketplace - Pinoy Global Supply</title>
      </Head>

      <div className="space-y-4 md:space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-4 md:p-6 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Welcome to the Marketplace</h1>
              <p className="text-sm sm:text-base md:text-lg text-blue-100 font-medium">
                Discover quality products from verified Philippine suppliers
              </p>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3 w-full sm:w-auto">
              <Button 
                variant="secondary" 
                onClick={() => setIsContactModalOpen(true)}
                className="flex-1 sm:flex-initial"
              >
                <Phone className="w-4 h-4 mr-2" />
                <span className="text-sm md:text-base">Contact Us</span>
              </Button>
              <Link href="/buyer/rfqs/create" className="flex-1 sm:flex-initial">
                <Button variant="secondary" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="text-sm md:text-base">Post RFQ</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white p-3 md:p-4 rounded-lg border border-secondary-200">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-secondary-600 truncate">Products</p>
                  <p className="text-sm md:text-lg font-bold text-secondary-900">
                    {marketplaceStats.active_products > 0 
                      ? marketplaceStats.active_products.toLocaleString() 
                      : '50K+'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 md:p-4 rounded-lg border border-secondary-200">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-secondary-600 truncate">Suppliers</p>
                  <p className="text-sm md:text-lg font-bold text-secondary-900">
                    {marketplaceStats.total_suppliers > 0 
                      ? marketplaceStats.total_suppliers.toLocaleString() 
                      : '2.5K+'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 md:p-4 rounded-lg border border-secondary-200">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-secondary-600 truncate">Avg Response</p>
                  <p className="text-sm md:text-lg font-bold text-secondary-900">2 hrs</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 md:p-4 rounded-lg border border-secondary-200">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-secondary-600 truncate">Success Rate</p>
                  <p className="text-sm md:text-lg font-bold text-secondary-900">95%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Marketplace */}
        <ProductGrid hideFilters={true} />

        {/* Contact Modal */}
        <ContactModal 
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
      </div>
    </>
  );
}
