import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Eye, 
  Users, 
  TrendingUp,
  Calendar,
  Download,
  Filter,
  AlertCircle,
  Loader2,
  Settings,
  Mail,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import DashboardCard from '../components/analytics/DashboardCard';
import PerformanceChart from '../components/analytics/PerformanceChart';
import AnalyticsNotification from '../components/analytics/AnalyticsNotification';
import LoadingNotification from '../components/analytics/LoadingNotification';
import apiService from '../lib/api';

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [topBuyers, setTopBuyers] = useState([]);
  const [optimizations, setOptimizations] = useState([]);
  const [trends, setTrends] = useState(null);
  
  // Notification states
  const [notification, setNotification] = useState({
    isOpen: false,
    type: '',
    title: '',
    message: '',
    data: null,
    onAction: null,
    actionLabel: null
  });
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getDashboardAnalytics({
        date_range: dateRange
      });
      
      setAnalyticsData(response);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, title, message, data = null, onAction = null, actionLabel = null) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message,
      data,
      onAction,
      actionLabel
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  // Handler functions for button actions
  const handleViewAllProducts = async () => {
    try {
      setLoadingMessage('Loading product analytics...');
      setLoading(true);
      const response = await apiService.getAllProducts({ page: 1, limit: 50 });
      setAllProducts(response.data);
      setShowAllProducts(true);
      
      showNotification(
        'products',
        'Products Loaded Successfully',
        `Found ${response.data.length} products with detailed analytics data.`,
        response.data,
        () => {
          closeNotification();
          // Could navigate to products page or show detailed view
        },
        'View Details'
      );
    } catch (err) {
      console.error('Error fetching all products:', err);
      showNotification(
        'error',
        'Failed to Load Products',
        'Unable to fetch product data. Please check your connection and try again.',
        null,
        () => {
          closeNotification();
          handleViewAllProducts();
        },
        'Retry'
      );
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleExportBuyerEngagement = async () => {
    try {
      setLoadingMessage('Preparing buyer engagement export...');
      setLoading(true);
      const response = await apiService.exportBuyerEngagement({ date_range: dateRange });
      
      // Create and download file
      const blob = new Blob([atob(response.content)], { type: response.mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = response.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showNotification(
        'export',
        'Export Successful',
        `Buyer engagement data has been downloaded as ${response.filename}`,
        null
      );
    } catch (err) {
      console.error('Error exporting data:', err);
      showNotification(
        'error',
        'Export Failed',
        'Unable to export buyer engagement data. Please try again.',
        null,
        () => {
          closeNotification();
          handleExportBuyerEngagement();
        },
        'Retry'
      );
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleOptimizeProducts = async () => {
    try {
      setLoadingMessage('Analyzing product optimization opportunities...');
      setLoading(true);
      const response = await apiService.getProductOptimizations();
      setOptimizations(response);
      
      showNotification(
        'optimization',
        'Optimization Analysis Complete',
        `Found ${response.length} optimization opportunities for your products.`,
        response,
        () => {
          closeNotification();
          // Could navigate to optimization details
        },
        'Review Suggestions'
      );
    } catch (err) {
      console.error('Error getting optimizations:', err);
      showNotification(
        'error',
        'Analysis Failed',
        'Unable to analyze product optimization opportunities. Please try again.',
        null,
        () => {
          closeNotification();
          handleOptimizeProducts();
        },
        'Retry'
      );
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleContactTopBuyers = async () => {
    try {
      setLoadingMessage('Analyzing top buyers for outreach...');
      setLoading(true);
      const response = await apiService.getTopBuyers({ date_range: dateRange });
      setTopBuyers(response);
      
      showNotification(
        'buyers',
        'Top Buyers Analysis Ready',
        `Identified ${response.length} high-priority buyers for outreach.`,
        response,
        () => {
          closeNotification();
          // Could open email composer or contact management
        },
        'Start Outreach'
      );
    } catch (err) {
      console.error('Error getting top buyers:', err);
      showNotification(
        'error',
        'Analysis Failed',
        'Unable to analyze top buyers. Please try again.',
        null,
        () => {
          closeNotification();
          handleContactTopBuyers();
        },
        'Retry'
      );
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleViewTrends = async () => {
    try {
      setLoadingMessage('Fetching market trends and insights...');
      setLoading(true);
      const response = await apiService.getMarketTrends();
      setTrends(response);
      
      // Show traffic sources if available
      const dataToShow = response.traffic_sources || response.trending_categories || [];
      
      showNotification(
        'trends',
        'Market Trends Analysis Complete',
        response.traffic_sources ? 
          'Traffic sources and market insights have been analyzed.' :
          'Latest market insights and trending categories have been loaded.',
        dataToShow,
        () => {
          closeNotification();
          // Could navigate to trends dashboard
        },
        'View Full Report'
      );
    } catch (err) {
      console.error('Error getting trends:', err);
      showNotification(
        'error',
        'Trends Analysis Failed',
        'Unable to fetch market trends data. Please try again.',
        null,
        () => {
          closeNotification();
          handleViewTrends();
        },
        'Retry'
      );
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleExportData = async () => {
    try {
      setLoadingMessage('Generating comprehensive analytics report...');
      setLoading(true);
      const response = await apiService.exportAnalyticsReport({ date_range: dateRange });
      
      // Create and download file
      const blob = new Blob([atob(response.content)], { type: response.mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = response.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showNotification(
        'export',
        'Analytics Report Downloaded',
        `Complete analytics report has been saved as ${response.filename}`,
        null
      );
    } catch (err) {
      console.error('Error exporting analytics report:', err);
      showNotification(
        'error',
        'Export Failed',
        'Unable to generate analytics report. Please try again.',
        null,
        () => {
          closeNotification();
          handleExportData();
        },
        'Retry'
      );
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoadingMessage('Generating Excel-compatible report...');
      setLoading(true);
      
      const response = await fetch(`/api/analytics/export-excel?company_id=${companyId}&date_range=${dateRange}`);
      const data = await response.json();
      
      if (data.filename && data.content) {
        // Create and download file
        const blob = new Blob([atob(data.content)], { type: data.mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showNotification(
          'export',
          'Excel Report Downloaded',
          `Excel-compatible report saved as ${data.filename}. You can open it in Excel, Google Sheets, or any spreadsheet application.`,
          null
        );
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error exporting Excel report:', err);
      showNotification(
        'error',
        'Excel Export Failed',
        'Unable to generate Excel report. Please try again.',
        null,
        () => {
          closeNotification();
          handleExportExcel();
        },
        'Retry'
      );
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Analytics - SupplierHub</title>
        </Head>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
            <p className="text-secondary-600">Loading analytics data...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Analytics - SupplierHub</title>
        </Head>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchAnalyticsData}>Try Again</Button>
          </div>
        </div>
      </>
    );
  }

  if (!analyticsData) {
    return null;
  }

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

  const monthlyData = analyticsData.monthlyData || [];
  const categoryData = analyticsData.categoryData || [];
  const topProductsData = analyticsData.topProductsData || [];

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
            
            {/* Export Options */}
            <Button 
              variant="outline" 
              onClick={handleExportData}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportExcel}
              disabled={loading}
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Exporting...' : 'Export Excel'}
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <Button variant="outline" size="sm" onClick={handleViewAllProducts}>
              <Eye className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
          <PerformanceChart
            title=""
            data={topProductsData}
            type="bar"
          />
          
          {/* Show all products modal/section */}
          {showAllProducts && allProducts.length > 0 && (
            <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
              <h4 className="font-medium mb-3">All Products ({allProducts.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                {allProducts.map((product, index) => (
                  <div key={index} className="p-3 bg-white rounded border text-sm">
                    <div className="font-medium text-secondary-900">{product.name}</div>
                    <div className="text-secondary-600">{product.category || 'Uncategorized'}</div>
                    <div className="text-xs text-secondary-500 mt-1 flex justify-between">
                      <span>{product.orders_count || 0} orders</span>
                      {product.last_order_date !== 'No orders yet' && (
                        <span className="text-green-600">Last: {product.last_order_date}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => setShowAllProducts(false)}
              >
                Hide Details
              </Button>
            </div>
          )}
        </Card>

        {/* Buyer Engagement Tracker */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-secondary-900">Buyer Engagement Tracker</h3>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportBuyerEngagement}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          {/* Filter section */}
          {showFilters && (
            <div className="mb-4 p-4 bg-secondary-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Min Inquiries
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 5"
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Company Type
                  </label>
                  <select className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm">
                    <option value="">All Companies</option>
                    <option value="manufacturer">Manufacturer</option>
                    <option value="distributor">Distributor</option>
                    <option value="retailer">Retailer</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          <Table columns={buyerEngagementColumns} data={analyticsData.buyerEngagement || []} />
          
          {/* Top Buyers Section */}
          {topBuyers.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-3 text-blue-900">Top Buyers to Contact</h4>
              <div className="space-y-2">
                {topBuyers.slice(0, 5).map((buyer, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <div className="font-medium text-secondary-900">{buyer.company}</div>
                      <div className="text-sm text-secondary-600">
                        {buyer.inquiries} inquiries • {buyer.pending_responses} pending
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {buyer.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`mailto:${buyer.email}`, '_blank')}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        buyer.priority === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {buyer.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Performance Insights</h3>
            <div className="space-y-4">
              {analyticsData.performanceInsights && analyticsData.performanceInsights.length > 0 ? (
                analyticsData.performanceInsights.map((insight, index) => (
                  <div 
                    key={index}
                    className={`flex items-start space-x-3 p-3 border rounded-lg ${
                      insight.type === 'success' 
                        ? 'bg-green-50 border-green-200' 
                        : insight.type === 'info'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <TrendingUp className={`w-5 h-5 mt-0.5 ${
                      insight.type === 'success' 
                        ? 'text-green-600' 
                        : insight.type === 'info'
                        ? 'text-blue-600'
                        : 'text-yellow-600'
                    }`} />
                    <div>
                      <p className={`text-sm font-medium ${
                        insight.type === 'success' 
                          ? 'text-green-800' 
                          : insight.type === 'info'
                          ? 'text-blue-800'
                          : 'text-yellow-800'
                      }`}>
                        {insight.title}
                      </p>
                      <p className={`text-sm ${
                        insight.type === 'success' 
                          ? 'text-green-700' 
                          : insight.type === 'info'
                          ? 'text-blue-700'
                          : 'text-yellow-700'
                      }`}>
                        {insight.message}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-secondary-500">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No insights available yet. More data needed to generate insights.</p>
                </div>
              )}
              
              {/* Product Optimization Suggestions */}
              {optimizations.length > 0 && (
                <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium mb-3 text-orange-900">Product Optimization Suggestions</h4>
                  <div className="space-y-2">
                    {optimizations.map((opt, index) => (
                      <div key={index} className="p-3 bg-white rounded border">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-secondary-900">{opt.product_name}</div>
                            <div className="text-sm text-secondary-600">{opt.suggestion}</div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            opt.priority === 'high' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {opt.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Market Trends */}
              {trends && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium mb-3 text-purple-900">Market Trends</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-purple-800 mb-2">Trending Categories</h5>
                      {trends.trending_categories?.map((cat, index) => (
                        <div key={index} className="text-sm text-purple-700">
                          {cat.category}: {cat.total_orders} orders
                        </div>
                      ))}
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-purple-800 mb-2">Key Insights</h5>
                      {Object.entries(trends.insights || {}).map(([key, value], index) => (
                        <div key={index} className="text-sm text-purple-700">
                          {value}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-16 flex-col"
                onClick={handleOptimizeProducts}
                disabled={loading}
              >
                <Settings className="w-5 h-5 mb-1" />
                <span className="text-xs">Optimize Products</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex-col"
                onClick={handleContactTopBuyers}
                disabled={loading}
              >
                <Users className="w-5 h-5 mb-1" />
                <span className="text-xs">Contact Top Buyers</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex-col"
                onClick={handleViewTrends}
                disabled={loading}
              >
                <BarChart3 className="w-5 h-5 mb-1" />
                <span className="text-xs">View Trends</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex-col"
                onClick={handleExportData}
                disabled={loading}
              >
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
              <div className="text-2xl font-bold text-secondary-900">
                {analyticsData.trafficSources?.directSearch || 0}%
              </div>
              <div className="text-sm text-secondary-600">Direct Search</div>
            </div>
            <div className="text-center p-4 bg-secondary-50 rounded-lg">
              <div className="text-2xl font-bold text-secondary-900">
                {analyticsData.trafficSources?.rfqMatching || 0}%
              </div>
              <div className="text-sm text-secondary-600">RFQ Matching</div>
            </div>
            <div className="text-center p-4 bg-secondary-50 rounded-lg">
              <div className="text-2xl font-bold text-secondary-900">
                {analyticsData.trafficSources?.referrals || 0}%
              </div>
              <div className="text-sm text-secondary-600">Referrals</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Notification */}
      <AnalyticsNotification
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        data={notification.data}
        onClose={closeNotification}
        onAction={notification.onAction}
        actionLabel={notification.actionLabel}
      />

      {/* Loading Notification */}
      <LoadingNotification
        isOpen={loading && loadingMessage !== ''}
        message={loadingMessage}
      />
    </>
  );
}
