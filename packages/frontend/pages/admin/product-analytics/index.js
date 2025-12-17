import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  TrendingUp, 
  Eye, 
  Search, 
  Package, 
  BarChart3, 
  Download,
  Calendar,
  Filter,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import apiService from '../../../lib/api';

export default function ProductAnalytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30); // days
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, searches, views, categories

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAnalyticsDashboard(timeRange);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const response = await apiService.exportAnalytics(type, timeRange);
      // Create download link
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-analytics-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (error) {
      console.error('Error exporting analytics:', error);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const { overview, most_searched, trending_searches, most_viewed_products, trending_products, category_stats } = dashboardData;

  return (
    <>
      <Head>
        <title>Product Analytics - Admin Portal</title>
      </Head>

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track product searches, views, and category performance
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('searches')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Searches</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {overview.total_searches?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {overview.total_views?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Terms</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {overview.unique_search_terms?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Filter className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Viewed Products</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {overview.unique_viewed_products?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {overview.conversion_rate || 0}%
                </p>
              </div>
              <div className="bg-teal-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'searches', label: 'Top Searches' },
              { id: 'views', label: 'Top Products' },
              { id: 'categories', label: 'Categories' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trending Searches */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🔥 Trending Searches</h3>
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <div className="space-y-3">
                {trending_searches?.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900">{item.search_term}</p>
                        <p className="text-sm text-gray-500">{item.recent_count} searches</p>
                      </div>
                    </div>
                    <div className="flex items-center text-green-600">
                      <ArrowUp className="h-4 w-4" />
                      <span className="text-sm font-semibold">{item.growth_rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Trending Products */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🚀 Trending Products</h3>
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div className="space-y-3">
                {trending_products?.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.recent_count} views</p>
                      </div>
                    </div>
                    <div className="flex items-center text-green-600">
                      <ArrowUp className="h-4 w-4" />
                      <span className="text-sm font-semibold">{item.growth_rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'searches' && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Most Searched Terms</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('searches')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Search Term</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Search Count</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Results</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {most_searched?.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.search_term}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.search_count?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.total_results?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'views' && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Most Viewed Products</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('views')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unique Viewers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Duration</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {most_viewed_products?.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-10 w-10 rounded object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">${item.price}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {item.view_count?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.unique_viewers?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.avg_duration ? `${Math.round(item.avg_duration)}s` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'categories' && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Category Performance</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('categories')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unique Viewers</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {category_stats?.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {item.view_count?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.product_count?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.unique_viewers?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
