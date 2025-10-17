import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Search, ChevronDown, Clock, TrendingUp, Package } from 'lucide-react';
import apiService from '../../lib/api';

/**
 * ProminentSearchBar - Alibaba-style large central search bar
 * 
 * This component creates a prominent search section similar to Alibaba's design:
 * - Large, full-width search input with rounded corners
 * - Prominent orange/primary colored search button
 * - Optional category dropdown (can be extended)
 * - Fully responsive design that matches page layout width
 * - Placed below the main navigation for maximum visibility
 */
export default function ProminentSearchBar({ className = "" }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  // Search suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  // Refs for managing focus and clicks
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Sample categories - can be fetched from API
  const categories = [
    'All Categories',
    'Electronics',
    'Machinery',
    'Textiles',
    'Food & Agriculture',
    'Construction Materials',
    'Automotive',
    'Home & Garden',
    'Health & Beauty',
    'Sports & Entertainment'
  ];

  // Fallback suggestions for when API is unavailable or no results
  const fallbackSuggestions = [
    { name: 'bluetooth headphones', category: 'Electronics', company: { name: 'Tech Supplier' } },
    { name: 'led lights', category: 'Electronics', company: { name: 'LED Solutions' } },
    { name: 'face masks', category: 'Health & Beauty', company: { name: 'Safety First' } },
    { name: 'smartphones', category: 'Electronics', company: { name: 'Mobile Tech' } },
    { name: 'furniture', category: 'Home & Garden', company: { name: 'Home Decor Co' } }
  ];

  // Fetch search suggestions from API based on existing products
  const getSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    
    try {
      // Try to get suggestions from API first
      const response = await apiService.getSearchSuggestions(query, 8);
      
      if (response && response.data && response.data.length > 0) {
        setSuggestions(response.data);
        setShowSuggestions(true);
      } else {
        // Fallback to local filtering if no API results
        const filtered = fallbackSuggestions
          .filter(suggestion => 
            suggestion.name.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 8);
        
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      }
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      
      // Fallback to local suggestions on API error
      const filtered = fallbackSuggestions
        .filter(suggestion => 
          suggestion.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8);
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounce effect for search suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      getSuggestions(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedSuggestionIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(suggestions[selectedSuggestionIndex]);
        } else {
          handleSearch(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Select a suggestion
  const selectSuggestion = (suggestion) => {
    const searchTerm = suggestion.name || suggestion.text;
    setSearchQuery(searchTerm);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    
    // Perform search with selected suggestion
    const params = new URLSearchParams();
    params.set('q', searchTerm);
    if (selectedCategory !== 'All Categories') {
      params.set('category', selectedCategory);
    }
    router.push(`/buyer/search?${params.toString()}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      // Construct search URL with category filter if not "All Categories"
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim());
      if (selectedCategory !== 'All Categories') {
        params.set('category', selectedCategory);
      }
      router.push(`/buyer/search?${params.toString()}`);
    }
  };

  return (
    <div className={`bg-gradient-to-r from-primary-50 to-primary-100 py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Section Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-2">
            Find Products & Suppliers
          </h1>
          <p className="text-secondary-600 text-sm sm:text-base">
            Discover millions of products from verified suppliers worldwide
          </p>
        </div>

        {/* Main Search Bar - Alibaba Style */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex bg-white rounded-lg shadow-medium border border-secondary-200 overflow-hidden">
              {/* Category Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex items-center px-4 py-4 text-secondary-700 hover:bg-secondary-50 border-r border-secondary-200 min-w-0 whitespace-nowrap"
                >
                  <span className="text-sm font-medium truncate max-w-32 sm:max-w-none">
                    {selectedCategory}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                </button>

                {/* Category Dropdown Menu */}
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-secondary-200 rounded-b-lg shadow-medium z-50 max-h-60 overflow-y-auto">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoryDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 focus:bg-primary-50 focus:text-primary-700"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Input */}
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => searchQuery.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search for products, suppliers, or categories..."
                className="flex-1 px-4 py-4 text-base focus:outline-none focus:ring-0 border-0 min-w-0"
                autoComplete="off"
              />

              {/* Search Button - Primary Blue Theme */}
              <button
                type="submit"
                className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <div className="flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">Search</span>
                </div>
              </button>
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (
              <div 
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 bg-white border border-secondary-200 rounded-b-lg shadow-medium z-50 max-h-80 overflow-y-auto"
              >
                {isLoadingSuggestions ? (
                  <div className="px-4 py-3 text-center text-secondary-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                      <span>Searching...</span>
                    </div>
                  </div>
                ) : (
                  suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className={`w-full text-left px-4 py-3 hover:bg-secondary-50 focus:bg-secondary-50 border-b border-secondary-100 last:border-b-0 transition-colors ${
                        index === selectedSuggestionIndex ? 'bg-primary-50 border-primary-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Package className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col">
                            <div className="flex items-center space-x-2">
                              <span className="text-secondary-900 font-medium truncate">
                                {suggestion.name || suggestion.text}
                              </span>
                              {suggestion.category && (
                                <span className="text-xs text-secondary-500 bg-secondary-100 px-2 py-1 rounded-full flex-shrink-0">
                                  {suggestion.category}
                                </span>
                              )}
                            </div>
                            {suggestion.company && (
                              <span className="text-xs text-secondary-500 truncate">
                                by {suggestion.company.name}
                              </span>
                            )}
                            {suggestion.price && (
                              <span className="text-xs text-primary-600 font-medium">
                                ${parseFloat(suggestion.price).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Search className="w-3 h-3 text-secondary-300" />
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </form>

          {/* Popular Searches - Optional Enhancement */}
          <div className="mt-4 text-center">
            <p className="text-sm text-secondary-500 mb-2">Popular searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['LED Lights', 'Face Masks', 'Solar Panels', 'Smartphones', 'Furniture'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    const params = new URLSearchParams();
                    params.set('q', term);
                    router.push(`/buyer/search?${params.toString()}`);
                  }}
                  className="px-3 py-1 text-xs bg-white text-secondary-600 rounded-full border border-secondary-200 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showCategoryDropdown || showSuggestions) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowCategoryDropdown(false);
            setShowSuggestions(false);
          }}
        />
      )}
    </div>
  );
}
