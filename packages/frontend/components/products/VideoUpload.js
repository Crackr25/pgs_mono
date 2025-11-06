import { useState, useRef } from 'react';
import { Upload, X, Play, Video, AlertCircle } from 'lucide-react';
import Button from '../common/Button';

export default function VideoUpload({ 
  videos = [], 
  onVideosChange, 
  maxVideos = 3,
  maxSizeMB = 50,
  className = '' 
}) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Ensure videos is always an array
  const videosList = (() => {
    if (!videos) return [];
    if (Array.isArray(videos)) return videos;
    if (typeof videos === 'string') {
      try {
        const parsed = JSON.parse(videos);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    if (typeof videos === 'object') {
      return Object.values(videos);
    }
    return [];
  })();

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isVideo = file.type.startsWith('video/');
      const isValidSize = file.size <= maxSizeMB * 1024 * 1024;
      const isValidType = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'].includes(file.type);
      
      if (!isVideo || !isValidSize || !isValidType) {
        alert(`Invalid file: ${file.name}. Please upload MP4, MOV, AVI, or WebM files under ${maxSizeMB}MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length + videosList.length > maxVideos) {
      alert(`Maximum ${maxVideos} videos allowed`);
      return;
    }

    // Convert files to preview objects
    const newVideos = validFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      duration: null, // Will be set when video loads
      isNew: true
    }));

    onVideosChange([...videosList, ...newVideos]);
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

  const removeVideo = (videoId) => {
    const updatedVideos = videosList.filter(video => video.id !== videoId);
    onVideosChange(updatedVideos);
  };

  const getVideoUrl = (video) => {
    if (video.preview) return video.preview;
    if (video.video_url) return video.video_url;
    if (video.video_path) {
      return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${video.video_path}`;
    }
    return '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : videosList.length >= maxVideos
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/mp4,video/mov,video/avi,video/webm"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        {videosList.length >= maxVideos ? (
          <div className="text-gray-500">
            <Video className="w-8 h-8 mx-auto mb-2" />
            <p>Maximum {maxVideos} videos reached</p>
          </div>
        ) : (
          <div className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600 mb-1">
              <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              MP4, MOV, AVI, WebM up to {maxSizeMB}MB each
            </p>
          </div>
        )}
      </div>

      {/* Video List */}
      {videosList.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Uploaded Videos ({videosList.length}/{maxVideos})</h4>
          <div className="grid grid-cols-1 gap-3">
            {videosList.map((video, index) => (
              <div key={video.id || index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                {/* Video Thumbnail */}
                <div className="relative w-20 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  <video
                    src={getVideoUrl(video)}
                    className="w-full h-full object-cover"
                    onLoadedMetadata={(e) => {
                      // Update duration when video loads
                      const duration = Math.round(e.target.duration);
                      const updatedVideos = videosList.map(v => 
                        v.id === video.id ? { ...v, duration } : v
                      );
                      onVideosChange(updatedVideos);
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {video.name || 'Product Video'}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{formatFileSize(video.file?.size || video.size || 0)}</span>
                    {video.duration && (
                      <>
                        <span>•</span>
                        <span>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => removeVideo(video.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove video"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guidelines */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Upload product demonstration or manufacturing videos</p>
        <p>• Keep videos under {maxSizeMB}MB for faster loading</p>
        <p>• Recommended duration: 30 seconds to 5 minutes</p>
        <p>• Videos help buyers understand your product better</p>
      </div>
    </div>
  );
}
