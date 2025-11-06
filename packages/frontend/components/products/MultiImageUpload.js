import { useState, useRef } from 'react';
import { Upload, X, Star, StarOff, Image as ImageIcon } from 'lucide-react';
import Button from '../common/Button';

export default function MultiImageUpload({ 
  images = [], 
  onImagesChange, 
  maxImages = 10,
  className = '' 
}) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    );

    if (validFiles.length + images.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Convert files to preview objects
    const newImages = validFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      preview: URL.createObjectURL(file),
      isMain: images.length === 0 && index === 0, // First image is main if no existing images
      isNew: true
    }));

    onImagesChange([...images, ...newImages]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const removeImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    
    // If we removed the main image, make the first remaining image main
    if (updatedImages.length > 0 && !updatedImages.some(img => img.isMain)) {
      updatedImages[0].isMain = true;
    }
    
    onImagesChange(updatedImages);
  };

  const setMainImage = (imageId) => {
    const updatedImages = images.map(img => ({
      ...img,
      isMain: img.id === imageId
    }));
    onImagesChange(updatedImages);
  };

  const moveImage = (fromIndex, toIndex) => {
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    onImagesChange(updatedImages);
  };

  const getImageUrl = (image) => {
    if (image.preview) return image.preview;
    if (image.image_url) return image.image_url;
    if (image.image_path) {
      return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${image.image_path}`;
    }
    return '';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : images.length >= maxImages
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => images.length < maxImages && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={images.length >= maxImages}
        />
        
        {images.length >= maxImages ? (
          <div className="text-gray-500">
            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
            <p>Maximum {maxImages} images reached</p>
          </div>
        ) : (
          <div className="text-gray-600">
            <Upload className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">
              Drag and drop images here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maximum {maxImages} images, 5MB each
            </p>
          </div>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
            >
              {/* Image */}
              <img
                src={getImageUrl(image)}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex space-x-2">
                  {/* Set as Main Image */}
                  <button
                    onClick={() => setMainImage(image.id)}
                    className={`p-2 rounded-full transition-colors ${
                      image.isMain 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                    title={image.isMain ? 'Main image' : 'Set as main image'}
                  >
                    {image.isMain ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                  </button>

                  {/* Remove Image */}
                  <button
                    onClick={() => removeImage(image.id)}
                    className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Image Badge */}
              {image.isMain && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Main
                </div>
              )}

              {/* Image Order */}
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      {images.length > 0 && (
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Click the star icon to set an image as the main product image</p>
          <p>• The main image will be displayed first in product listings</p>
          <p>• Customers can swipe through all images in the product view</p>
        </div>
      )}
    </div>
  );
}
