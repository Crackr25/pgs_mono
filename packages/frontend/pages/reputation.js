import { useState } from 'react';
import Head from 'next/head';
import { 
  Star, 
  Shield, 
  Award, 
  TrendingUp, 
  Users, 
  MessageSquare,
  CheckCircle,
  Calendar,
  Filter,
  Download,
  Eye,
  ThumbsUp
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Table from '../components/common/Table';
import { formatDate } from '../lib/utils';

export default function Reputation() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const reputationMetrics = [
    {
      title: 'Overall Rating',
      value: '4.8',
      subtitle: 'out of 5.0',
      change: '+0.2',
      changeType: 'increase',
      icon: Star,
      color: 'yellow'
    },
    {
      title: 'Total Reviews',
      value: '247',
      change: '+18',
      changeType: 'increase',
      icon: MessageSquare,
      color: 'blue'
    },
    {
      title: 'Response Rate',
      value: '98%',
      change: '+2%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Repeat Customers',
      value: '156',
      change: '+12',
      changeType: 'increase',
      icon: Users,
      color: 'purple'
    }
  ];

  const verificationBadges = [
    {
      name: 'Verified Supplier',
      description: 'Company identity and business registration verified',
      status: 'verified',
      verifiedDate: '2023-06-15',
      icon: Shield
    },
    {
      name: 'Quality Assured',
      description: 'Products meet international quality standards',
      status: 'verified',
      verifiedDate: '2023-07-20',
      icon: Award
    },
    {
      name: 'Trade Assurance',
      description: 'Protected by platform trade assurance program',
      status: 'verified',
      verifiedDate: '2023-06-15',
      icon: CheckCircle
    },
    {
      name: 'Premium Supplier',
      description: 'Top-tier supplier with excellent track record',
      status: 'pending',
      verifiedDate: null,
      icon: Star
    }
  ];

  const reviews = [
    {
      id: 1,
      buyerName: 'John Smith',
      company: 'ABC Electronics',
      rating: 5,
      date: '2024-01-08',
      product: 'LED Light Fixture 50W',
      review: 'Excellent quality products and fast shipping. The LED fixtures exceeded our expectations. Great communication throughout the process.',
      helpful: 12,
      verified: true
    },
    {
      id: 2,
      buyerName: 'Maria Garcia',
      company: 'XYZ Motors',
      rating: 4,
      date: '2024-01-05',
      product: 'Automotive Wire Harness',
      review: 'Good quality wire harnesses. Delivery was on time and packaging was secure. Minor issue with one connector but quickly resolved.',
      helpful: 8,
      verified: true
    },
    {
      id: 3,
      buyerName: 'David Chen',
      company: 'Global Tech Solutions',
      rating: 5,
      date: '2024-01-02',
      product: 'Industrial LED Panel',
      review: 'Outstanding supplier! Professional service, high-quality products, and competitive pricing. Will definitely order again.',
      helpful: 15,
      verified: true
    },
    {
      id: 4,
      buyerName: 'Sarah Johnson',
      company: 'Green Energy Corp',
      rating: 4,
      date: '2023-12-28',
      product: 'Solar Panel Kit',
      review: 'Reliable supplier with good products. The solar panels work as expected. Customer service was responsive and helpful.',
      helpful: 6,
      verified: true
    }
  ];

  const performanceMetrics = [
    { metric: 'Product Quality', score: 4.9, benchmark: 4.2 },
    { metric: 'Communication', score: 4.8, benchmark: 4.1 },
    { metric: 'Shipping Speed', score: 4.7, benchmark: 4.0 },
    { metric: 'Packaging', score: 4.8, benchmark: 4.1 },
    { metric: 'After-sales Service', score: 4.6, benchmark: 3.9 }
  ];

  const reviewColumns = [
    {
      header: 'Buyer',
      key: 'buyerName',
      render: (value, row) => (
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-secondary-900">{value}</span>
            {row.verified && (
              <CheckCircle className="w-4 h-4 text-green-600" title="Verified Purchase" />
            )}
          </div>
          <div className="text-sm text-secondary-500">{row.company}</div>
        </div>
      )
    },
    {
      header: 'Rating',
      key: 'rating',
      render: (value) => (
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < value ? 'text-yellow-400 fill-current' : 'text-secondary-300'
              }`}
            />
          ))}
          <span className="ml-1 text-sm text-secondary-600">({value})</span>
        </div>
      )
    },
    {
      header: 'Product',
      key: 'product',
      render: (value) => (
        <span className="text-secondary-900">{value}</span>
      )
    },
    {
      header: 'Date',
      key: 'date',
      render: (value) => (
        <span className="text-secondary-900">{formatDate(value)}</span>
      )
    },
    {
      header: 'Helpful',
      key: 'helpful',
      render: (value) => (
        <div className="flex items-center space-x-1 text-sm text-secondary-600">
          <ThumbsUp className="w-4 h-4" />
          <span>{value}</span>
        </div>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
      )
    }
  ];

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-secondary-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Trust & Reputation - SupplierHub</title>
      </Head>

      <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-secondary-900">Trust & Reputation</h1>
            <p className="mt-1 text-xs sm:text-sm text-secondary-600">
              Build trust with buyers through verified credentials and positive reviews
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-sm border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button variant="outline" className="flex-1 sm:flex-initial text-xs sm:text-sm">
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Export Report</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>

        {/* Reputation Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {reputationMetrics.map((metric, index) => {
            const Icon = metric.icon;
            const colorClasses = {
              yellow: 'bg-yellow-100 text-yellow-600',
              blue: 'bg-blue-100 text-blue-600',
              green: 'bg-green-100 text-green-600',
              purple: 'bg-purple-100 text-purple-600'
            };
            
            return (
              <Card key={index} className="p-4 sm:p-5 md:p-6">
                <div className="flex items-center">
                  <div className={`p-2 sm:p-3 rounded-lg ${colorClasses[metric.color]}`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-secondary-600">{metric.title}</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-semibold text-secondary-900 truncate">
                      {metric.value}
                      {metric.subtitle && (
                        <span className="text-xs sm:text-sm font-normal text-secondary-500 ml-1">
                          {metric.subtitle}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {metric.change && (
                  <div className="mt-3 sm:mt-4 flex items-center">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span className="ml-1 text-xs sm:text-sm font-medium text-green-600">
                      {metric.change}
                    </span>
                    <span className="ml-1 text-xs sm:text-sm text-secondary-500">this month</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Verified Badges */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-medium text-secondary-900">Verified Badges</h3>
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
              <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Apply for More
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {verificationBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 border border-secondary-200 rounded-lg">
                  <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
                    badge.status === 'verified' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      badge.status === 'verified' ? 'text-green-600' : 'text-yellow-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm sm:text-base font-medium text-secondary-900 truncate">{badge.name}</h4>
                      <Badge 
                        variant={badge.status === 'verified' ? 'success' : 'warning'}
                        size="xs"
                        className="flex-shrink-0"
                      >
                        {badge.status}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-secondary-600 mb-2">{badge.description}</p>
                    {badge.verifiedDate && (
                      <p className="text-xs text-secondary-500">
                        Verified on {formatDate(badge.verifiedDate)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <h3 className="text-base sm:text-lg font-medium text-secondary-900 mb-4 sm:mb-6">Performance Metrics</h3>
          <div className="space-y-3 sm:space-y-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="text-xs sm:text-sm font-medium text-secondary-900">{metric.metric}</span>
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                      <span className="text-secondary-600">
                        Industry avg: {metric.benchmark}
                      </span>
                      <span className="font-medium text-secondary-900">
                        Your score: {metric.score}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(metric.score / 5) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {renderStars(Math.round(metric.score))}
                      <span className="text-xs sm:text-sm text-secondary-600 ml-1">({metric.score})</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-medium text-secondary-900">Recent Reviews</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-initial text-xs sm:text-sm">
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-initial text-xs sm:text-sm">
                View All Reviews
              </Button>
            </div>
          </div>
          
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="p-3 sm:p-4 bg-secondary-50 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs sm:text-sm font-medium text-primary-600">
                        {review.buyerName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm sm:text-base font-medium text-secondary-900 truncate">{review.buyerName}</h4>
                        {review.verified && (
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" title="Verified Purchase" />
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-secondary-600 truncate">{review.company}</p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-xs text-secondary-500">{formatDate(review.date)}</p>
                  </div>
                </div>
                
                <p className="text-xs sm:text-sm text-secondary-700 mb-2">{review.review}</p>
                <p className="text-xs text-secondary-500 mb-2 sm:mb-3 truncate">Product: {review.product}</p>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-1 text-xs text-secondary-600">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{review.helpful} people found this helpful</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs">
                    Respond
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <Table columns={reviewColumns} data={reviews} />
          </div>
        </Card>

        {/* Trust Building Tips */}
        <Card>
          <h3 className="text-base sm:text-lg font-medium text-secondary-900 mb-3 sm:mb-4">Trust Building Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base font-medium text-blue-800 mb-1">Complete Verification</h4>
                  <p className="text-xs sm:text-sm text-blue-700">
                    Upload all required documents and complete the verification process to earn trust badges.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base font-medium text-green-800 mb-1">Respond Quickly</h4>
                  <p className="text-xs sm:text-sm text-green-700">
                    Maintain a high response rate by replying to inquiries within 24 hours.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base font-medium text-purple-800 mb-1">Deliver Quality</h4>
                  <p className="text-xs sm:text-sm text-purple-700">
                    Consistently deliver high-quality products to earn positive reviews and repeat customers.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base font-medium text-yellow-800 mb-1">Meet Deadlines</h4>
                  <p className="text-xs sm:text-sm text-yellow-700">
                    Always deliver on time or communicate delays proactively to maintain trust.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
