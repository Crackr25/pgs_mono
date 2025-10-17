import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Star, Shield, Clock, Filter as FilterIcon } from 'lucide-react';
import Card from './Card';
import Button from './Button';

export default function FilterSidebar({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  categories = [],
  locations = [],
  isLoading = false,
  isOpen = false,
  onClose,
  className = ''
}) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    priceRange: true,
    location: true
    // supplier: true,      // Disabled until backend implementation
    // delivery: true,      // Disabled until backend implementation  
    // rating: true         // Disabled until rating system is implemented
  });

  const priceRanges = [
    { label: 'Under $100', value: '0-100' },
    { label: '$100 - $500', value: '100-500' },
    { label: '$500 - $1,000', value: '500-1000' },
    { label: '$1,000 - $5,000', value: '1000-5000' },
    { label: 'Over $5,000', value: '5000+' }
  ];

  const deliveryOptions = [
    { label: 'Deliver by Nov 04', value: 'nov-04' },
    { label: 'Deliver by Nov 10', value: 'nov-10' },
    { label: 'Deliver by Nov 17', value: 'nov-17' },
    { label: 'Deliver by Nov 24', value: 'nov-24' },
    { label: 'Custom delivery time', value: 'custom' }
  ];

  const ratingOptions = [
    { label: '5.0 stars only', value: '5.0', stars: 5 },
    { label: '4.5+ stars', value: '4.5', stars: 4.5 },
    { label: '4.0+ stars', value: '4.0', stars: 4 },
    { label: '3.0+ stars', value: '3.0', stars: 3 }
  ];

  const supplierFeatures = [
    { label: 'Verified Suppliers', value: 'verified', icon: Shield },
    { label: 'Gold Suppliers', value: 'gold', icon: Star },
    { label: 'Trade Assurance', value: 'trade_assurance', icon: Shield },
    { label: 'Fast Response', value: 'fast_response', icon: Clock }
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-3 h-3 ${
              index < fullStars
                ? 'text-yellow-400 fill-current'
                : index === fullStars && hasHalfStar
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const FilterSection = ({ title, section, children }) => (
    <div className="border-b border-secondary-200 last:border-b-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between py-3 px-4 text-left hover:bg-secondary-50 transition-colors"
      >
        <span className="font-medium text-secondary-900">{title}</span>
        {expandedSections[section] ? (
          <ChevronUp className="w-4 h-4 text-secondary-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-secondary-500" />
        )}
      </button>
      {expandedSections[section] && (
        <div className="pb-4 px-4">
          {children}
        </div>
      )}
    </div>
  );

  const sidebarContent = (
    <div className={`bg-white h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-200">
        <div className="flex items-center space-x-2">
          <FilterIcon className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-secondary-900">Filters</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-xs"
          >
            Clear All
          </Button>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-secondary-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Category Filter */}
        <FilterSection title="Category" section="category">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={filters.category === ''}
                  onChange={(e) => onFilterChange('category', e.target.value)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-secondary-700">All Categories</span>
              </label>
              {Array.isArray(categories) && categories.map(category => (
                <label key={category} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={filters.category === category}
                    onChange={(e) => onFilterChange('category', e.target.value)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-secondary-700">{category}</span>
                </label>
              ))}
            </div>
          )}
        </FilterSection>

        {/* Supplier Features */}
        {/* Note: These features require additional backend implementation
        <FilterSection title="Supplier Features" section="supplier">
          <div className="space-y-2">
            {supplierFeatures.map(feature => {
              const IconComponent = feature.icon;
              return (
                <label key={feature.value} className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    value={feature.value}
                    checked={filters.supplierFeatures?.includes(feature.value) || false}
                    onChange={(e) => {
                      const current = filters.supplierFeatures || [];
                      const newFeatures = e.target.checked
                        ? [...current, feature.value]
                        : current.filter(f => f !== feature.value);
                      onFilterChange('supplierFeatures', newFeatures);
                    }}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="ml-2 flex items-center space-x-2">
                    <IconComponent className="w-4 h-4 text-primary-600" />
                    <span className="text-sm text-secondary-700 group-hover:text-primary-600">
                      {feature.label}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </FilterSection>
        */}

        {/* Delivery Time */}
        {/* Note: This feature requires additional backend implementation
        <FilterSection title="Delivery Time" section="delivery">
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="deliveryTime"
                value=""
                checked={filters.deliveryTime === ''}
                onChange={(e) => onFilterChange('deliveryTime', e.target.value)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-secondary-700">Any delivery time</span>
            </label>
            {deliveryOptions.map(option => (
              <label key={option.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="deliveryTime"
                  value={option.value}
                  checked={filters.deliveryTime === option.value}
                  onChange={(e) => onFilterChange('deliveryTime', e.target.value)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-secondary-700">{option.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>
        */}

        {/* Rating Filter */}
        {/* Note: This feature requires a rating system implementation
        <FilterSection title="Supplier Rating" section="rating">
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="rating"
                value=""
                checked={filters.rating === ''}
                onChange={(e) => onFilterChange('rating', e.target.value)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-secondary-700">Any rating</span>
            </label>
            {ratingOptions.map(option => (
              <label key={option.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  value={option.value}
                  checked={filters.rating === option.value}
                  onChange={(e) => onFilterChange('rating', e.target.value)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <div className="ml-2 flex items-center space-x-2">
                  {renderStars(option.stars)}
                  <span className="text-sm text-secondary-700">{option.label}</span>
                </div>
              </label>
            ))}
          </div>
        </FilterSection>
        */}

        {/* Price Range */}
        <FilterSection title="Price Range" section="priceRange">
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="priceRange"
                value=""
                checked={filters.priceRange === ''}
                onChange={(e) => onFilterChange('priceRange', e.target.value)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-secondary-700">All Prices</span>
            </label>
            {priceRanges.map(range => (
              <label key={range.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="priceRange"
                  value={range.value}
                  checked={filters.priceRange === range.value}
                  onChange={(e) => onFilterChange('priceRange', e.target.value)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-secondary-700">{range.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Location Filter */}
        <FilterSection title="Location" section="location">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="location"
                  value=""
                  checked={filters.location === ''}
                  onChange={(e) => onFilterChange('location', e.target.value)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-secondary-700">All Locations</span>
              </label>
              {Array.isArray(locations) && locations.map(location => (
                <label key={location} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="location"
                    value={location}
                    checked={filters.location === location}
                    onChange={(e) => onFilterChange('location', e.target.value)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-secondary-700">{location}</span>
                </label>
              ))}
            </div>
          )}
        </FilterSection>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 flex-shrink-0">
        <div className="sticky top-4">
          <Card className="p-0 max-h-[calc(100vh-2rem)] overflow-hidden">
            {sidebarContent}
          </Card>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <div className="relative w-80 max-w-[80vw]">
            <Card className="p-0 h-full overflow-hidden">
              {sidebarContent}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
