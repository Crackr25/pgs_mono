import { useState, useRef, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Clock, X, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/router';

export default function ProductSearchBar({ 
  onSearch, 
  placeholder = "Search products, suppliers, or categories...",
  className = "",
  showFilters = true,
  compact = false 
}) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches] = useState([
    "hair clipper", "bluetooth speaker", "office chair", "laptop bag", 
    "water bottle", "phone case", "wireless headphones", "desk lamp"
  ]);
  const [loading, setLoading] = useState(false);
  const [showQuickFilters, setShowQuickFilters] = useState(false);
  
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  useEffect(() => {
    // Debounced search suggestions
    const timeoutId = setTimeout(() => {
      if (query.length >= 2) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const fetchSuggestions = async (searchQuery) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/marketplace/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=8`);
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // Fallback to mock suggestions
      const mockSuggestions = popularSearches
        .filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5)
        .map(text => ({ type: 'product', text, category: 'Electronics' }));
      setSuggestions(mockSuggestions);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    // Add to recent searches
    const updatedRecent = [
      searchQuery,
      ...recentSearches.filter(item => item !== searchQuery)
    ].slice(0, 5);
    
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));

    // Hide suggestions
    setShowSuggestions(false);
    setQuery(searchQuery);

    // Perform search
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/buyer/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const SuggestionItem = ({ suggestion, onClick }) => (
    <button
      onClick={() => onClick(suggestion.text)}
      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 group transition-colors"
    >
      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-primary-100 transition-colors">
        {suggestion.type === 'product' ? (
          <Search className="w-4 h-4 text-gray-500 group-hover:text-primary-600" />
        ) : suggestion.type === 'category' ? (
          <Filter className="w-4 h-4 text-gray-500 group-hover:text-primary-600" />
        ) : (
          <TrendingUp className="w-4 h-4 text-gray-500 group-hover:text-primary-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-900 group-hover:text-primary-600 transition-colors">
          {suggestion.text}
        </div>
        {suggestion.category && (
          <div className="text-xs text-gray-500">in {suggestion.category}</div>
        )}
      </div>
    </button>
  );

  const QuickFilters = () => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg mt-2 p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Filters</h4>
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => handleSearch(query + ' verified supplier')}
          className="text-left p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
        >
          <div className="text-sm font-medium text-gray-900">Verified Suppliers</div>
          <div className="text-xs text-gray-500">Trusted businesses only</div>
        </button>
        
        <button 
          onClick={() => handleSearch(query + ' fast shipping')}
          className="text-left p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
        >
          <div className="text-sm font-medium text-gray-900">Fast Shipping</div>
          <div className="text-xs text-gray-500">Quick delivery available</div>
        </button>
        
        <button 
          onClick={() => handleSearch(query + ' wholesale')}
          className="text-left p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
        >
          <div className="text-sm font-medium text-gray-900">Wholesale</div>
          <div className="text-xs text-gray-500">Bulk pricing available</div>
        </button>
        
        <button 
          onClick={() => handleSearch(query + ' premium quality')}
          className="text-left p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
        >
          <div className="text-sm font-medium text-gray-900">Premium Quality</div>
          <div className="text-xs text-gray-500">High-grade products</div>
        </button>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Main Search Input */}
      <div className={`relative ${compact ? '' : 'max-w-2xl mx-auto'}`}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400`} />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className={`block w-full ${compact ? 'pl-9 pr-16 py-2 text-sm' : 'pl-10 pr-20 py-3'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-all`}
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
            {query && (
              <button
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
              </button>
            )}
            
            {showFilters && (
              <button
                onClick={() => setShowQuickFilters(!showQuickFilters)}
                className="text-gray-400 hover:text-primary-600 transition-colors"
                title="Quick Filters"
              >
                <SlidersHorizontal className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
              </button>
            )}
            
            <button
              onClick={() => handleSearch()}
              className={`bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors ${compact ? 'px-2 py-1' : 'px-3 py-1.5'}`}
            >
              <Search className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
            </button>
          </div>
        </div>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && (query.length >= 2 || recentSearches.length > 0) && (
          <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-96 overflow-y-auto">
            {loading && (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            )}

            {/* Recent Searches */}
            {!loading && query.length < 2 && recentSearches.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Recent Searches
                </div>
                {recentSearches.map((search, index) => (
                  <SuggestionItem
                    key={index}
                    suggestion={{ text: search, type: 'recent' }}
                    onClick={handleSearch}
                  />
                ))}
              </div>
            )}

            {/* Suggestions */}
            {!loading && suggestions.length > 0 && (
              <div>
                {recentSearches.length > 0 && query.length >= 2 && (
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100">
                    Suggestions
                  </div>
                )}
                {suggestions.map((suggestion, index) => (
                  <SuggestionItem
                    key={index}
                    suggestion={suggestion}
                    onClick={handleSearch}
                  />
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {!loading && query.length < 2 && recentSearches.length === 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Popular Searches
                </div>
                {popularSearches.slice(0, 6).map((search, index) => (
                  <SuggestionItem
                    key={index}
                    suggestion={{ text: search, type: 'popular' }}
                    onClick={handleSearch}
                  />
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && query.length >= 2 && suggestions.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">No suggestions found</div>
                <button
                  onClick={() => handleSearch()}
                  className="text-primary-600 text-sm mt-1 hover:underline"
                >
                  Search for "{query}" anyway
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Filters */}
        {showQuickFilters && <QuickFilters />}
      </div>

      {/* Overlay */}
      {(showSuggestions || showQuickFilters) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowSuggestions(false);
            setShowQuickFilters(false);
          }}
        />
      )}
    </div>
  );
}
