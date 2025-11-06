import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../lib/api';

export const useDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    analytics: {
      totalProducts: 0,
      totalQuotes: 0,
      totalOrders: 0,
      totalRevenue: '$0',
      mostViewedProducts: []
    },
    recentProducts: [],
    recentOrders: [],
    recentQuotes: []
  });
  const [userCompany, setUserCompany] = useState(null);

  // Fetch user's company data
  const fetchUserCompany = async () => {
    try {
      if (!user?.id) return null;
      const companies = await apiService.getCompanies({ user_id: user.id });
      if (companies.data && companies.data.length > 0) {
        setUserCompany(companies.data[0]);
        return companies.data[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching user company:', error);
      return null;
    }
  };

  // Fetch dashboard analytics
  const fetchDashboardAnalytics = async (companyId) => {
    try {
      const params = companyId ? { company_id: companyId } : {};
      const analytics = await apiService.getDashboardAnalytics(params);
      return analytics;
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      return null;
    }
  };

  // Fetch recent products
  const fetchRecentProducts = async (companyId) => {
    try {
      const params = { 
        per_page: 3, 
        sort_by: 'created_at', 
        sort_order: 'desc' 
      };
      if (companyId) params.company_id = companyId;
      
      const response = await apiService.getProducts(params);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recent products:', error);
      return [];
    }
  };

  // Fetch recent orders
  const fetchRecentOrders = async (companyId) => {
    try {
      const params = { 
        per_page: 3, 
        sort_by: 'created_at', 
        sort_order: 'desc' 
      };
      
      const response = await apiService.getOrders(companyId, params);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }
  };

  // Fetch recent quotes
  const fetchRecentQuotes = async (companyId) => {
    try {
      const params = { 
        per_page: 3, 
        sort_by: 'created_at', 
        sort_order: 'desc' 
      };
      if (companyId) params.company_id = companyId;
      
      const response = await apiService.getQuotes(params);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recent quotes:', error);
      return [];
    }
  };

  // Load all dashboard data
  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // First fetch user company
      const company = await fetchUserCompany();
      const companyId = company?.id;

      // Fetch all dashboard data in parallel
      const [analytics, recentProducts, recentOrders, recentQuotes] = await Promise.all([
        fetchDashboardAnalytics(companyId),
        fetchRecentProducts(companyId),
        fetchRecentOrders(companyId),
        fetchRecentQuotes(companyId)
      ]);

      setDashboardData({
        analytics: {
          totalProducts: analytics?.totalProducts || 0,
          totalQuotes: analytics?.totalQuotes || 0,
          totalOrders: analytics?.totalOrders || 0,
          totalRevenue: analytics?.totalRevenue || '$0',
          mostViewedProducts: analytics?.topProductsData || [],
          growthPercentages: analytics?.growthPercentages || {
            products: { value: '0%', type: 'neutral', isPositive: false },
            quotes: { value: '0%', type: 'neutral', isPositive: false },
            orders: { value: '0%', type: 'neutral', isPositive: false },
            revenue: { value: '0%', type: 'neutral', isPositive: false }
          }
        },
        recentProducts,
        recentOrders,
        recentQuotes
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh dashboard data
  const refreshDashboard = () => {
    loadDashboardData(true);
  };

  // Load data when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  return {
    dashboardData,
    userCompany,
    loading,
    refreshing,
    error,
    refreshDashboard
  };
};
