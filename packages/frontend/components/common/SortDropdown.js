import { ChevronDown } from 'lucide-react';

export default function SortDropdown({ 
  value, 
  onChange, 
  options = [],
  className = '' 
}) {
  const defaultOptions = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Rating: High to Low', value: 'rating_desc' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Most Popular', value: 'popular' }
  ];

  const sortOptions = options.length > 0 ? options : defaultOptions;

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-secondary-300 rounded-lg px-4 py-2 pr-10 text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-secondary-400 transition-colors cursor-pointer"
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDown className="w-4 h-4 text-secondary-500" />
      </div>
    </div>
  );
}
