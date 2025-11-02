import { useState } from 'react';
import { FileText, Image, Video, Download, Edit, Trash2, Eye, X } from 'lucide-react';
import Button from './Button';

export default function DocumentDisplay({ 
  documents, 
  title, 
  onEdit, 
  onDelete, 
  isEditing = false,
  className = '' 
}) {
  const [previewFile, setPreviewFile] = useState(null);

  // Debug logging
  console.log('DocumentDisplay - Title:', title, 'Documents:', documents, 'Count:', documents?.length);

  if (!documents || documents.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <FileText className="mx-auto h-12 w-12 text-secondary-400" />
        <h3 className="mt-2 text-sm font-medium text-secondary-900">{title}</h3>
        <p className="mt-1 text-sm text-secondary-500">
          No documents uploaded yet.
        </p>
      </div>
    );
  }

  const getFileIcon = (filePath) => {
    if (!filePath || typeof filePath !== 'string') {
      return FileText; // Default icon for invalid paths
    }
    
    const extension = filePath.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return Image;
    } else if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) {
      return Video;
    } else {
      return FileText;
    }
  };

  const getFileName = (filePath) => {
    return filePath.split('/').pop();
  };

  const getPublicUrl = (filePath) => {
    // Convert storage path to public URL
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${filePath}`;
  };

  const isImage = (filePath) => {
    if (!filePath || typeof filePath !== 'string') return false;
    const extension = filePath.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
  };

  const isVideo = (filePath) => {
    if (!filePath || typeof filePath !== 'string') return false;
    const extension = filePath.split('.').pop().toLowerCase();
    return ['mp4', 'mov', 'avi', 'mkv'].includes(extension);
  };

  const handlePreview = (filePath) => {
    if (isImage(filePath) || isVideo(filePath)) {
      setPreviewFile(filePath);
    } else {
      // For PDFs and other documents, open in new tab
      window.open(getPublicUrl(filePath), '_blank');
    }
  };

  const handleDownload = (filePath) => {
    const link = document.createElement('a');
    link.href = getPublicUrl(filePath);
    link.download = getFileName(filePath);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={className}>
      <div className="mb-4">
        <h4 className="text-md font-medium text-secondary-900">{title}</h4>
        <p className="text-sm text-secondary-600">
          {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((document, index) => {
          // Handle both string paths and document objects
          const filePath = typeof document === 'string' ? document : document.url;
          const documentName = typeof document === 'string' ? null : document.name;
          
          const Icon = getFileIcon(filePath);
          const fileName = documentName || getFileName(filePath);
          const publicUrl = getPublicUrl(filePath);

          return (
            <div key={index} className="relative group bg-white border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              {/* File Preview */}
              <div className="aspect-square mb-3 bg-secondary-50 rounded-lg overflow-hidden">
                {isImage(filePath) ? (
                  <img
                    src={publicUrl}
                    alt={fileName}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handlePreview(filePath)}
                  />
                ) : isVideo(filePath) ? (
                  <div className="w-full h-full flex items-center justify-center bg-secondary-100 cursor-pointer"
                       onClick={() => handlePreview(filePath)}>
                    <Video className="h-12 w-12 text-secondary-400" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary-100 cursor-pointer"
                       onClick={() => handlePreview(filePath)}>
                    <Icon className="h-12 w-12 text-secondary-400" />
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="mb-3">
                <h5 className="text-sm font-medium text-secondary-900 truncate" title={fileName}>
                  {fileName}
                </h5>
                <p className="text-xs text-secondary-500 mt-1">
                  {filePath && typeof filePath === 'string' ? filePath.split('.').pop().toUpperCase() : 'FILE'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePreview(filePath)}
                    className="p-1.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDownload(filePath)}
                    className="p-1.5 text-secondary-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>

                {isEditing && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onEdit && onEdit(filePath, index)}
                      className="p-1.5 text-secondary-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Replace"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => onDelete && onDelete(filePath, index)}
                      className="p-1.5 text-secondary-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>
            
            {isImage(previewFile) ? (
              <img
                src={getPublicUrl(previewFile)}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            ) : isVideo(previewFile) ? (
              <video
                src={getPublicUrl(previewFile)}
                controls
                className="max-w-full max-h-full rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
