import { useState, useEffect } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle, Eye } from 'lucide-react';

export default function FileUpload({ 
  label, 
  accept = '*/*', 
  multiple = false, 
  maxSize = 10, // MB
  onFilesChange,
  onUpload, // New prop for handling upload
  uploadProgress = {}, // New prop for upload progress
  uploadErrors = {}, // New prop for upload errors
  className = ''
}) {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState({});

  // Generate preview URLs for image files
  useEffect(() => {
    const newPreviews = {};
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        newPreviews[file.name] = URL.createObjectURL(file);
      }
    });
    setPreviews(newPreviews);

    // Cleanup old preview URLs
    return () => {
      Object.values(newPreviews).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [files]);

  const handleFiles = (newFiles) => {
    const fileArray = Array.from(newFiles);
    const validFiles = fileArray.filter(file => {
      const sizeMB = file.size / (1024 * 1024);
      return sizeMB <= maxSize;
    });
    
    const updatedFiles = multiple ? [...files, ...validFiles] : validFiles.slice(0, 1);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
    
    // Auto-upload if onUpload function is provided
    if (onUpload && validFiles.length > 0) {
      onUpload(validFiles);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  return (
    <div className={className}>
      {label && <label className="form-label">{label}</label>}
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive ? 'border-primary-500 bg-primary-50' : 'border-secondary-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <Upload className="mx-auto h-12 w-12 text-secondary-400" />
        <p className="mt-2 text-sm text-secondary-600">
          <span className="font-medium">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-secondary-500">
          Max file size: {maxSize}MB
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => {
            const progress = uploadProgress[file.name] || 0;
            const error = uploadErrors[file.name];
            const isUploaded = progress === 100;
            const isUploading = progress > 0 && progress < 100;
            
            return (
              <div key={index} className="p-3 bg-secondary-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {isUploaded ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      ) : error ? (
                        <AlertCircle className="h-4 w-4 text-red-500 mt-1" />
                      ) : (
                        <File className="h-4 w-4 text-secondary-500 mt-1" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-secondary-700 truncate">{file.name}</span>
                        <span className="text-xs text-secondary-500 flex-shrink-0">
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      
                      {/* Image Preview */}
                      {previews[file.name] && (
                        <div className="mt-2">
                          <img
                            src={previews[file.name]}
                            alt={`Preview of ${file.name}`}
                            className="max-w-32 max-h-32 object-cover rounded border border-secondary-200"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {isUploading && (
                      <span className="text-xs text-secondary-500">{progress}%</span>
                    )}
                    {!isUploading && (
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Progress bar */}
                {isUploading && (
                  <div className="mt-2">
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Error message */}
                {error && (
                  <div className="mt-2 text-xs text-red-600">
                    {error}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
