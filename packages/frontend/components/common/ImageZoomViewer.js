import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Move, X } from 'lucide-react';

export default function ImageZoomViewer({ 
  images = [], 
  currentIndex = 0, 
  onClose, 
  onIndexChange 
}) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const currentImage = images[currentIndex];

  useEffect(() => {
    // Reset transformations when image changes
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, [currentIndex]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleRotateLeft = () => {
    setRotation(prev => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation(prev => prev + 90);
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.25, Math.min(3, prev + delta)));
  };

  const nextImage = () => {
    if (currentIndex < images.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <div className="text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleZoomIn}
            className="p-2 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleRotateLeft}
            className="p-2 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-colors"
            title="Rotate Left"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleRotateRight}
            className="p-2 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-colors"
            title="Rotate Right"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleReset}
            className="p-2 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-colors"
            title="Reset"
          >
            <Move className="w-4 h-4" />
          </button>
          
          <button
            onClick={onClose}
            className="p-2 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            disabled={currentIndex === 0}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextImage}
            disabled={currentIndex === images.length - 1}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Image Container */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {currentImage && (
          <img
            ref={imageRef}
            src={currentImage}
            alt={`Product image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain select-none"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
            draggable={false}
          />
        )}
      </div>

      {/* Scale Indicator */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
        {Math.round(scale * 100)}%
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black bg-opacity-50 p-2 rounded">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onIndexChange(index)}
              className={`w-12 h-12 rounded overflow-hidden border-2 transition-colors ${
                index === currentIndex
                  ? 'border-primary-500'
                  : 'border-transparent hover:border-gray-400'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
