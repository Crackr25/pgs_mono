import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({ 
  currentPage, 
  lastPage, 
  total, 
  perPage, 
  onPageChange, 
  onPerPageChange,
  showPerPageSelector = true,
  showInfo = true,
  from = 0,
  to = 0
}) {
  const pages = [];
  const maxVisiblePages = 5;
  
  // Calculate visible page numbers
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(lastPage, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Show pagination even with one page if there's data and per page selector is shown
  if (!total || total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-white border-t border-secondary-200">
      {/* Results Info */}
      {showInfo && (
        <div className="text-sm text-gray-600">
          Showing {from} to {to} of {total} results
        </div>
      )}
      
      {/* Pagination Controls */}
      {lastPage > 1 && (
        <div className="flex items-center gap-2">
          {/* First Page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          
          {/* Previous Page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {/* Page Numbers */}
          <div className="flex gap-1">
            {startPage > 1 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  1
                </button>
                {startPage > 2 && (
                  <span className="px-3 py-2 text-gray-500">...</span>
                )}
              </>
            )}
            
            {pages.map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-2 rounded border transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            {endPage < lastPage && (
              <>
                {endPage < lastPage - 1 && (
                  <span className="px-3 py-2 text-gray-500">...</span>
                )}
                <button
                  onClick={() => onPageChange(lastPage)}
                  className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  {lastPage}
                </button>
              </>
            )}
          </div>
          
          {/* Next Page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === lastPage}
            className="p-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          {/* Last Page */}
          <button
            onClick={() => onPageChange(lastPage)}
            disabled={currentPage === lastPage}
            className="p-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Per Page Selector */}
      {showPerPageSelector && onPerPageChange && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Show:</span>
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(parseInt(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-gray-600">per page</span>
        </div>
      )}
    </div>
  );
}
