import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Truck, 
  Shield, 
  CreditCard, 
  FileText,
  Search,
  Filter,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../contexts/AuthContext';

export default function BuyerServices() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      // Mock services data
      const mockServices = [
        {
          id: 1,
          name: 'Logistics & Shipping',
          provider: 'PGS Logistics',
          description: 'Door-to-door delivery services across the Philippines',
          price: 'Starting at ₱500',
          rating: 4.8,
          reviews: 234,
          category: 'logistics',
          features: ['Real-time tracking', 'Insurance coverage', 'Express delivery'],
          responseTime: '< 2 hours'
        },
        {
          id: 2,
          name: 'Trade Assurance',
          provider: 'PGS Insurance',
          description: 'Protect your orders with comprehensive trade insurance',
          price: '2% of order value',
          rating: 4.9,
          reviews: 156,
          category: 'insurance',
          features: ['100% coverage', 'Quick claims', 'Global protection'],
          responseTime: '< 1 hour'
        },
        {
          id: 3,
          name: 'Payment Solutions',
          provider: 'PGS Pay',
          description: 'Secure payment processing for international trades',
          price: '1.5% transaction fee',
          rating: 4.7,
          reviews: 189,
          category: 'payment',
          features: ['Multi-currency', 'Escrow service', 'Instant transfers'],
          responseTime: '< 30 minutes'
        },
        {
          id: 4,
          name: 'Quality Inspection',
          provider: 'PGS Quality',
          description: 'Third-party quality inspection and certification',
          price: 'Starting at ₱2,000',
          rating: 4.6,
          reviews: 98,
          category: 'inspection',
          features: ['Certified inspectors', 'Detailed reports', 'Photo documentation'],
          responseTime: '< 4 hours'
        }
      ];
      setServices(mockServices);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || service.category === filter;
    return matchesSearch && matchesFilter;
  });

  const getServiceIcon = (category) => {
    switch (category) {
      case 'logistics': return <Truck className="w-6 h-6 text-blue-600" />;
      case 'insurance': return <Shield className="w-6 h-6 text-green-600" />;
      case 'payment': return <CreditCard className="w-6 h-6 text-purple-600" />;
      case 'inspection': return <FileText className="w-6 h-6 text-orange-600" />;
      default: return <CheckCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Trade Services - Pinoy Global Supply</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Trade Services</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Professional services to support your trading activities
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Services</option>
                <option value="logistics">Logistics</option>
                <option value="insurance">Insurance</option>
                <option value="payment">Payment</option>
                <option value="inspection">Inspection</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-secondary-500" />
              <span className="text-sm text-secondary-600">{filteredServices.length} services</span>
            </div>
          </div>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="p-6">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                  {getServiceIcon(service.category)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-secondary-900 mb-1">{service.name}</h3>
                  <p className="text-sm text-secondary-600 mb-2">{service.provider}</p>
                  <div className="flex items-center space-x-1 mb-2">
                    {renderStars(service.rating)}
                    <span className="text-sm text-secondary-600">({service.reviews})</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">{service.price}</p>
                  <div className="flex items-center space-x-1 text-xs text-secondary-500">
                    <Clock className="w-3 h-3" />
                    <span>{service.responseTime}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-secondary-600 mb-4">{service.description}</p>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-secondary-900 mb-2">Features:</h4>
                <div className="flex flex-wrap gap-2">
                  {service.features.map((feature, index) => (
                    <span
                      key={index}
                      className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Learn More
                </Button>
                <Button size="sm" className="flex-1">
                  Get Quote
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <Card className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No services found</h3>
            <p className="text-secondary-600">
              {searchQuery ? 'Try adjusting your search criteria.' : 'Services will be available soon.'}
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
