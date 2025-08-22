import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function ImageSwiper({ images = [], alt = '', className = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">No image</span>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  const getImageUrl = (image) => {
    if (typeof image === 'string') {
      return image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${image}`;
    }
    // Handle ProductImage objects from backend
    if (image.image_path) {
      return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${image.image_path}`;
    }
    return image.image_url || '';
  };

  const currentImage = images[currentIndex];

  return (
    <>
      <div className={`relative group ${className}`}>
        {/* Main Image */}
        <div className="relative overflow-hidden rounded-lg bg-gray-100">
          <img
            src={getImageUrl(currentImage)}
            alt={alt || `Image ${currentIndex + 1}`}
            className="w-full h-48 object-cover cursor-pointer"
            onClick={() => setShowFullscreen(true)}
          />
          
          {/* Navigation Arrows - only show if multiple images */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Navigation - only show if multiple images */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={getImageUrl(image)}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full">
            {/* Close Button */}
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation in Fullscreen */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Fullscreen Image */}
            <img
              src={getImageUrl(currentImage)}
              alt={alt || `Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Image Counter in Fullscreen */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
