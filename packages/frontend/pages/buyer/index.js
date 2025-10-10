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

      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome to the Marketplace</h1>
              <p className="text-lg text-blue-100 font-medium">
                Discover quality products from verified Philippine supplier
              </p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <Button 
                variant="secondary" 
                onClick={() => setIsContactModalOpen(true)}
              >
                <Phone className="w-4 h-4 mr-2" />
                Contact Us
              </Button>
              <Link href="/buyer/rfqs/create">
                <Button variant="secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  Post RFQ
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-secondary-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Products</p>
                  <p className="text-lg font-bold text-secondary-900">
                    {marketplaceStats.active_products > 0 
                      ? marketplaceStats.active_products.toLocaleString() 
                      : '50K+'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-secondary-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Suppliers</p>
                  <p className="text-lg font-bold text-secondary-900">
                    {marketplaceStats.total_suppliers > 0 
                      ? marketplaceStats.total_suppliers.toLocaleString() 
                      : '2.5K+'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-secondary-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Avg Response</p>
                  <p className="text-lg font-bold text-secondary-900">2 hrs</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-secondary-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Success Rate</p>
                  <p className="text-lg font-bold text-secondary-900">95%</p>
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
