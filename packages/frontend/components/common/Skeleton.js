export default function Skeleton({ className = "", variant = "rectangular", width, height, children }) {
  const baseClasses = "animate-pulse bg-gray-200 rounded";
  
  const variantClasses = {
    rectangular: "rounded",
    circular: "rounded-full",
    text: "rounded h-4"
  };
  
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

// Product Card Skeleton Component
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-secondary-200 overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="w-full h-48" />
      
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <Skeleton className="h-5 w-3/4" />
        
        {/* Price and MOQ skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        {/* Location skeleton */}
        <div className="flex items-center space-x-2">
          <Skeleton variant="circular" className="w-4 h-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        
        {/* Category skeleton */}
        <Skeleton className="h-6 w-20 rounded-full" />
        
        {/* Company info skeleton */}
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        
        {/* Buttons skeleton */}
        <div className="flex space-x-2">
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="h-8 flex-1 rounded-md" />
        </div>
      </div>
    </div>
  );
}

// Filter Skeleton Component
export function FilterSkeleton() {
  return (
    <div className="bg-white p-4 rounded-lg border border-secondary-200">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index}>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Stats Skeleton Component
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white p-4 rounded-lg border border-secondary-200">
          <div className="flex items-center space-x-3">
            <Skeleton variant="circular" className="w-10 h-10" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
