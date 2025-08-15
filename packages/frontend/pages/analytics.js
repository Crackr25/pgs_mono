import { useState } from 'react';
import Head from 'next/head';
import { 
  Package, 
  FileText, 
  ShoppingCart, 
  DollarSign, 
  Eye, 
  Users, 
  TrendingUp,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import DashboardCard from '../components/analytics/DashboardCard';
import PerformanceChart from '../components/analytics/PerformanceChart';
import { analyticsData } from '../lib/dummyData';

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30d');

  const performanceMetrics = [
    {
      title: 'Total Products',
      value: analyticsData.totalProducts,
      change: '+12%',
      changeType: 'increase',
      icon: Package,
      color: 'blue'
    },
    {
      title: 'Total Quotes',
      value: analyticsData.totalQuotes,
      change: '+8%',
      changeType: 'increase',
      icon: FileText,
      color: 'green'
    },
    {
      title: 'Total Orders',
      value: analyticsData.totalOrders,
      change: '+23%',
      changeType: 'increase',
      icon: ShoppingCart,
      color: 'purple'
    },
    {
      title: 'Revenue',
      value: analyticsData.totalRevenue,
      change: '+15%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'yellow'
    }
  ];

  const monthlyData = [
    { label: 'Jan', value: 45 },
    { label: 'Feb', value: 52 },
    { label: 'Mar', value: 48 },
    { label: 'Apr', value: 61 },
    { label: 'May', value: 55 },
    { label: 'Jun', value: 67 }
  ];

  const categoryData = [
    { label: 'Electronics', value: 35 },
    { label: 'Automotive', value: 25 },
    { label: 'Textiles', value: 20 },
    { label: 'Others', value: 20 }
  ];

  const topProductsData = [
    { label: 'LED Fixtures', value: 1250 },
    { label: 'Wire Harness', value: 890 },
    { label: 'Solar Panels', value: 675 },
    { label: 'Motors', value: 520 },
    { label: 'Sensors', value: 380 }
  ];

  const buyerEngagementColumns = [
    {
      header: 'Buyer Company',
      key: 'buyer',
      render: (value) => (
        <div className="font-medium text-secondary-900">{value}</div>
      )
    },
    {
      header: 'Inquiries',
      key: 'inquiries',
      render: (value) => (
        <span className="text-secondary-900">{value}</span>
      )
    },
    {
      header: 'Orders',
      key: 'orders',
      render: (value) => (
        <span className="text-secondary-900">{value}</span>
      )
    },
    {
      header: 'Total Value',
      key: 'value',
      render: (value) => (
        <span className="font-medium text-green-600">{value}</span>
      )
    },
    {
      header: 'Conversion Rate',
      key: 'conversion',
      render: (_, row) => {
        const rate = ((row.orders / row.inquiries) * 100).toFixed(1);
        return (
          <div className="flex items-center">
            <div className="w-16 bg-secondary-200 rounded-full h-2 mr-2">
              <div
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: `${rate}%` }}
              />
            </div>
            <span className="text-sm text-secondary-900">{rate}%</span>
          </div>
        );
      }
    }
  ];

  return (
    <>
      <Head>
        <title>Analytics - SupplierHub</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Analytics & Performance</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Track your business performance and buyer engagement
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceMetrics.map((metric, index) => (
            <DashboardCard key={index} {...metric} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceChart
            title="Monthly Orders"
            data={monthlyData}
            type="line"
          />
          <PerformanceChart
            title="Product Categories"
            data={categoryData}
            type="donut"
          />
        </div>

        {/* Most Viewed Products */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-secondary-900">Most Viewed Products</h3>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
          <PerformanceChart
            title=""
            data={topProductsData}
            type="bar"
          />
        </Card>

        {/* Buyer Engagement Tracker */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-secondary-900">Buyer Engagement Tracker</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <Table columns={buyerEngagementColumns} data={analyticsData.buyerEngagement} />
        </Card>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Performance Insights</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Strong Growth in Electronics
                  </p>
                  <p className="text-sm text-green-700">
                    Your electronics products have seen a 35% increase in views this month.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    High Buyer Retention
                  </p>
                  <p className="text-sm text-blue-700">
                    85% of your buyers have made repeat inquiries, indicating strong satisfaction.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Calendar className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Seasonal Opportunity
                  </p>
                  <p className="text-sm text-yellow-700">
                    Consider promoting automotive parts - demand typically increases in Q2.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-16 flex-col">
                <Package className="w-5 h-5 mb-1" />
                <span className="text-xs">Optimize Products</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Users className="w-5 h-5 mb-1" />
                <span className="text-xs">Contact Top Buyers</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <TrendingUp className="w-5 h-5 mb-1" />
                <span className="text-xs">View Trends</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Download className="w-5 h-5 mb-1" />
                <span className="text-xs">Export Data</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Traffic Sources */}
        <Card>
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Traffic Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary-50 rounded-lg">
              <div className="text-2xl font-bold text-secondary-900">45%</div>
              <div className="text-sm text-secondary-600">Direct Search</div>
            </div>
            <div className="text-center p-4 bg-secondary-50 rounded-lg">
              <div className="text-2xl font-bold text-secondary-900">30%</div>
              <div className="text-sm text-secondary-600">RFQ Matching</div>
            </div>
            <div className="text-center p-4 bg-secondary-50 rounded-lg">
              <div className="text-2xl font-bold text-secondary-900">25%</div>
              <div className="text-sm text-secondary-600">Referrals</div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
