import { Search as SearchIcon } from 'lucide-react';

export default function SearchResultsHeader({ 
  searchQuery, 
  totalResults, 
  from, 
  to, 
  className = '' 
}) {
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M+';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K+';
    }
    return num.toLocaleString();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {searchQuery && (
        <div className="flex items-center space-x-2">
          <SearchIcon className="w-5 h-5 text-secondary-400" />
          <p className="text-lg text-secondary-600">
            Results for <span className="font-semibold text-secondary-900">"{searchQuery}"</span>
          </p>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">
          {searchQuery ? 'Search Results' : 'All Products'}
        </h1>
        
        {totalResults > 0 && (
          <div className="text-sm text-secondary-600">
            Showing <span className="font-medium">{from}</span>–<span className="font-medium">{to}</span> of{' '}
            <span className="font-medium">{formatNumber(totalResults)}</span> products
          </div>
        )}
      </div>
    </div>
  );
}
