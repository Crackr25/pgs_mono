import { useState } from 'react';
import { X, Image as ImageIcon, Video, Trash2, Loader } from 'lucide-react';
import Button from '../common/Button';
import apiService from '../../lib/api';
import { toast } from 'react-hot-toast';

export default function CreatePostModal({ onClose, onPostCreated, currentUser }) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) {
      toast.error('Maximum 4 images allowed');
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const handleVideoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (videos.length + files.length > 2) {
      toast.error('Maximum 2 videos allowed');
      return;
    }
    setVideos(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && images.length === 0 && videos.length === 0) {
      toast.error('Please add some content, images, or videos');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('content', content);

      images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      videos.forEach((video, index) => {
        formData.append(`videos[${index}]`, video);
      });

      const response = await apiService.createWallPost(formData);
      onPostCreated(response.post);
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-secondary-200">
          <h2 className="text-xl font-bold text-secondary-900">Create Post</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary-100 rounded-full transition-colors"
            disabled={submitting}
          >
            <X className="w-6 h-6 text-secondary-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-secondary-900">{currentUser.name}</p>
              <p className="text-xs text-secondary-600">{currentUser.active_company?.name}</p>
            </div>
          </div>

          {/* Content Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={6}
            disabled={submitting}
          />

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    disabled={submitting}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Video Previews */}
          {videos.length > 0 && (
            <div className="mt-4 space-y-2">
              {videos.map((video, index) => (
                <div key={index} className="relative">
                  <video
                    src={URL.createObjectURL(video)}
                    className="w-full h-48 object-cover rounded-lg"
                    controls
                  />
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    disabled={submitting}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Media Buttons */}
          <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-secondary-200">
            <label className="flex items-center space-x-2 px-4 py-2 bg-secondary-100 hover:bg-secondary-200 rounded-lg cursor-pointer transition-colors">
              <ImageIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-secondary-700">Photo</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                disabled={submitting || images.length >= 4}
              />
            </label>

            <label className="flex items-center space-x-2 px-4 py-2 bg-secondary-100 hover:bg-secondary-200 rounded-lg cursor-pointer transition-colors">
              <Video className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-secondary-700">Video</span>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoSelect}
                className="hidden"
                disabled={submitting || videos.length >= 2}
              />
            </label>
          </div>

          {/* Submit Button */}
          <div className="mt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={submitting || (!content.trim() && images.length === 0 && videos.length === 0)}
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
