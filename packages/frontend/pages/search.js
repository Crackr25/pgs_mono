import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  Search,
  Filter,
  ArrowLeft,
  Package,
  FileText,
  ShoppingCart,
  Users
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../lib/api';

export default function SearchPage() {
  const router = useRouter();
  const { q: searchQuery } = router.query;
  const { user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({
    products: [],
    orders: [],
    quotes: [],
    buyers: []
  });
  const [searchTerm, setSearchTerm] = useState(searchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [searchError, setSearchError] = useState(null);

  // Perform search with debouncing
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({
        products: [],
        orders: [],
        quotes: [],
        buyers: []
      });
      return;
    }
    
    setLoading(true);
    setSearchError(null);
    try {
      console.log('Performing search for:', query);
      
      // Use different endpoints for global search
      const [marketplaceProducts, orders, quotes] = await Promise.all([
        // Use marketplace endpoint for global product search
        apiService.request(`/marketplace/products?search=${encodeURIComponent(query)}&per_page=10`),
        // Keep user-specific searches for orders and quotes
        apiService.getOrders(null, { search: query, per_page: 5 }).catch(() => ({ data: [] })),
        apiService.getQuotes({ search: query, per_page: 5 }).catch(() => ({ data: [] }))
      ]);

      console.log('Search results:', { 
        products: marketplaceProducts.data?.length || 0,
        orders: orders.data?.length || 0, 
        quotes: quotes.data?.length || 0 
      });

      setSearchResults({
        products: marketplaceProducts.data || [],
        orders: orders.data || [],
        quotes: quotes.data || [],
        buyers: [] // Could implement buyer search if needed
      });
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Instant search function - no debouncing for immediate results
  const instantSearch = (query) => {
    console.log('Instant search triggered for:', query, 'Length:', query.trim().length);
    
    if (query.trim().length >= 1) { // Search immediately after 1 character
      console.log('Performing instant search for:', query.trim());
      performSearch(query.trim());
      // Update URL without triggering page reload
      const newUrl = `/search?q=${encodeURIComponent(query.trim())}`;
      window.history.replaceState(null, '', newUrl);
    } else if (query.trim().length === 0) {
      // Clear results if search is empty
      console.log('Clearing search results');
      setSearchResults({
        products: [],
        orders: [],
        quotes: [],
        buyers: []
      });
    }
  };

  // Handle input change for instant auto-search
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    console.log('Search input changed:', value);
    setSearchTerm(value);
    
    // Trigger instant search - no delay
    instantSearch(value);
  };

  // Handle search form submission (for Enter key or button click)
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Perform immediate search
      performSearch(searchTerm.trim());
      // Update URL
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Load search results when query changes (from URL)
  useEffect(() => {
    console.log('URL query changed:', searchQuery, 'Current searchTerm:', searchTerm);
    if (searchQuery && searchQuery !== searchTerm) {
      setSearchTerm(searchQuery);
      performSearch(searchQuery);
    }
  }, [searchQuery]);

  // Perform initial search if there's a query in URL on mount
  useEffect(() => {
    if (searchQuery && searchTerm === '') {
      console.log('Initial search on mount:', searchQuery);
      setSearchTerm(searchQuery);
      performSearch(searchQuery);
    }
  }, []);

  const categories = [
    { id: 'all', label: 'All Results', icon: Search },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'quotes', label: 'Quotes', icon: FileText },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'buyers', label: 'Buyers', icon: Users }
  ];

  const getFilteredResults = () => {
    if (selectedCategory === 'all') {
      return {
        products: searchResults.products,
        orders: searchResults.orders,
        quotes: searchResults.quotes,
        buyers: searchResults.buyers
      };
    }
    return {
      [selectedCategory]: searchResults[selectedCategory] || []
    };
  };

  const getTotalResults = () => {
    return searchResults.products.length + 
           searchResults.orders.length + 
           searchResults.quotes.length + 
           searchResults.buyers.length;
  };

  return (
    <>
      <Head>
        <title>Search Results - SupplierHub</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Search Results</h1>
              {searchQuery && (
                <p className="text-sm text-secondary-600">
                  {getTotalResults()} results for "{searchQuery}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="p-4">
          <form onSubmit={handleSearch} className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchInputChange}
                placeholder="Search products, orders, quotes, buyers... (instant search - just start typing!)"
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                autoFocus
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                </div>
              )}
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>
          
          {/* Search Tips */}
          <div className="mt-2 text-xs text-secondary-500">
            💡 Tip: Results appear instantly as you type! Search starts after 1 character.
          </div>
          {searchError && (
            <div className="mt-2 text-xs text-red-600">
              ⚠️ {searchError}
            </div>
          )}
        </Card>

        {/* Category Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const count = category.id === 'all' ? getTotalResults() : (searchResults[category.id] || []).length;
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'bg-white text-secondary-600 border border-secondary-200 hover:bg-secondary-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
                {count > 0 && (
                  <Badge size="xs" variant="secondary">
                    {count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-secondary-600">
              {searchTerm.length >= 1 ? `Searching for "${searchTerm}"...` : 'Searching...'}
            </p>
          </div>
        ) : searchTerm.length > 0 && searchTerm.length < 1 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Start typing...</h3>
            <p className="text-secondary-600">
              Results will appear instantly as you type!
            </p>
          </div>
        ) : searchTerm.length >= 1 ? (
          <div className="space-y-6">
            {getFilteredResults().products && getFilteredResults().products.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Products</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredResults().products.map((product) => (
                    <Card 
                      key={product.id} 
                      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/buyer/products/${product.id}`)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-secondary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-secondary-900 truncate">
                            {product.name}
                          </h4>
                          <p className="text-sm text-secondary-500">
                            MOQ: {product.moq || 'N/A'} {product.unit || 'units'}
                          </p>
                          <p className="text-sm font-medium text-primary-600">
                            {product.price ? `$${product.price}` : 'Contact for price'}
                          </p>
                          {product.company && (
                            <p className="text-xs text-secondary-400">
                              by {product.company.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {getFilteredResults().quotes && getFilteredResults().quotes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quotes</h3>
                <div className="space-y-3">
                  {getFilteredResults().quotes.map((quote) => (
                    <Card key={quote.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-secondary-600" />
                          <div>
                            <p className="font-medium text-secondary-900">
                              {quote.product_name || `Quote #${quote.id}`}
                            </p>
                            <p className="text-sm text-secondary-500">
                              {quote.buyer_company || quote.buyer_name}
                            </p>
                          </div>
                        </div>
                        <Badge variant={quote.status === 'pending' ? 'warning' : 'success'}>
                          {quote.status}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {getFilteredResults().orders && getFilteredResults().orders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Orders</h3>
                <div className="space-y-3">
                  {getFilteredResults().orders.map((order) => (
                    <Card key={order.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <ShoppingCart className="w-5 h-5 text-secondary-600" />
                          <div>
                            <p className="font-medium text-secondary-900">
                              {order.order_number || `Order #${order.id}`}
                            </p>
                            <p className="text-sm text-secondary-500">
                              {order.quantity} units • {order.total_amount}
                            </p>
                          </div>
                        </div>
                        <Badge variant={order.status === 'completed' ? 'success' : 'info'}>
                          {order.status}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {getTotalResults() === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">No results found</h3>
                <p className="text-secondary-600">
                  Try adjusting your search terms or browse our categories.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Start searching</h3>
            <p className="text-secondary-600">
              Enter a search term to find products, orders, quotes, and more.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
