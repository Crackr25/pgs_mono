import { useState, useEffect } from 'react';
import { storefrontAPI, getImageUrl } from '../../../../../lib/storefront-api';
import { useRouter } from 'next/router';
import apiService from '../../../../../lib/api';
import ProductDetailModal from '../../../../../components/products/ProductDetailModal';

export default function PageBuilder() {
  const router = useRouter();
  const { pageId } = router.query;
  
  const [page, setPage] = useState(null);
  const [storefront, setStorefront] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    section_type: 'hero',
    title: '',
    content: '',
    is_visible: true,
    settings: {}
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // Track existing images from server
  const [imagesToDelete, setImagesToDelete] = useState([]); // Track images to delete
  const [videos, setVideos] = useState([]); // Track new video uploads
  const [existingVideos, setExistingVideos] = useState([]); // Track existing videos from server
  const [videosToDelete, setVideosToDelete] = useState([]); // Track videos to delete
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_IMAGES = 10;
  const MAX_VIDEOS = 5;
  const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const ALLOWED_VIDEO_FORMATS = ['video/mp4', 'video/webm', 'video/ogg'];

  const sectionTypes = [
    { value: 'banner', label: '🎨 Banner Section', description: 'Single hero image with text overlay' },
    { value: 'hero', label: '�️ Hero/Slider', description: 'Multiple images carousel slider' },
    { value: 'slider', label: '🎬 Slider Section', description: 'Auto-play carousel with images/videos' },
    { value: 'heading', label: '📝 Heading Section', description: 'Large heading text' },
    { value: 'text', label: '📄 Text Section', description: 'Rich text content' },
    { value: 'products_showcase', label: '� Products Showcase', description: 'Auto-display products grid' },
    { value: 'featured_products', label: '⭐ Featured Products', description: 'Hand-pick products to feature' },
    { value: 'image', label: '🏞️ Image Section', description: 'Single image with caption' },
    { value: 'gallery', label: '🖼️ Gallery Section', description: 'Multiple images grid' },
    { value: 'company_reviews', label: '⭐ Company Reviews', description: 'Professional supplier reviews & ratings with statistics' },
    { value: 'contact', label: '📧 Contact Section', description: 'Contact form and info' },
    { value: 'team', label: '👥 Team Section', description: 'Team members grid' },
  ];

  useEffect(() => {
    if (pageId) {
      fetchData();
    }
  }, [pageId]);

  const fetchData = async () => {
    try {
      // Get storefront (which includes sections)
      const storefrontResponse = await storefrontAPI.getMyStorefront();
      const storefrontData = storefrontResponse.data;
      setStorefront(storefrontData);

      // Get the specific page
      const pagesResponse = await storefrontAPI.getPages();
      const currentPage = pagesResponse.data.find(p => p.id === parseInt(pageId));
      setPage(currentPage);

      // Filter sections for this page
      if (storefrontData.sections) {
        const pageSections = storefrontData.sections.filter(
          section => section.page_id === parseInt(pageId)
        );
        setSections(pageSections);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading page builder');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSection(null);
    setFormData({
      section_type: 'hero',
      title: '',
      content: '',
      is_visible: true,
      settings: {}
    });
    setImages([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setVideos([]);
    setExistingVideos([]);
    setVideosToDelete([]);
    setErrors({});
    setUploadProgress(0);
    setShowModal(true);
  };

  const handleEdit = (section) => {
    console.log('Editing section:', section);
    console.log('Section type:', section.section_type);
    setEditingSection(section);
    setFormData({
      section_type: section.section_type,
      title: section.title || '',
      content: section.content || '',
      is_visible: section.is_visible,
      settings: section.settings || {}
    });
    setImages([]);
    setExistingImages(section.images || []); // Load existing images
    setImagesToDelete([]);
    setVideos([]);
    setExistingVideos(section.settings?.videos || []); // Load existing videos
    setVideosToDelete([]);
    setErrors({});
    setUploadProgress(0);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    
    if (!formData.title && ['banner', 'heading'].includes(formData.section_type)) {
      newErrors.title = 'Title is required for this section type';
    }
    
    // Content is only required for text section, NOT for heading
    if (!formData.content && ['text'].includes(formData.section_type)) {
      newErrors.content = 'Content is required for this section type';
    }
    
    // Check if there are any images (existing + new)
    const totalImages = existingImages.length - imagesToDelete.length + images.length;
    if (totalImages === 0 && !editingSection && ['banner', 'gallery', 'image'].includes(formData.section_type)) {
      newErrors.images = 'At least one image is required for this section type';
    }
    
    // Check if there are any images or videos for slider and hero
    const totalVideos = existingVideos.length - videosToDelete.length + videos.length;
    if (formData.section_type === 'slider') {
      if (totalImages === 0 && totalVideos === 0) {
        newErrors.images = 'Slider section requires at least one image or video';
      }
    }
    
    // Hero section only requires images (title is now optional)
    if (formData.section_type === 'hero' && totalImages === 0 && !editingSection) {
      newErrors.images = 'At least one image is required for hero section';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('❌ Please fix the validation errors before submitting');
      return;
    }

    try {
      setUploadProgress(10);
      const sectionData = {
        ...formData,
        storefront_id: storefront.id,
        page_id: parseInt(pageId),
        sort_order: editingSection ? editingSection.sort_order : sections.length,
      };

      console.log('Submitting section data:', sectionData);
      console.log('Section type:', sectionData.section_type);
      console.log('Title:', sectionData.title);
      console.log('Title length:', sectionData.title?.length);
      console.log('Editing section?', !!editingSection);
      console.log('Images to upload:', images);
      console.log('Images to upload count:', images.length);
      console.log('Existing images:', existingImages);
      console.log('Existing images count:', existingImages.length);
      console.log('Images to delete:', imagesToDelete);
      console.log('Images to delete count:', imagesToDelete.length);
      console.log('Videos:', videos);
      console.log('Videos count:', videos.length);

      // Add images to delete if editing
      if (editingSection && imagesToDelete.length > 0) {
        sectionData.delete_images = imagesToDelete;
      }

      // Add videos to delete if editing
      if (editingSection && videosToDelete.length > 0) {
        sectionData.delete_videos = videosToDelete;
      }

      setUploadProgress(30);
      if (editingSection) {
        // Only send images array if there are new images to upload OR images to delete
        // If neither, don't send images array so backend keeps existing images
        const hasImageChanges = images.length > 0 || imagesToDelete.length > 0;
        await storefrontAPI.updateSection(
          editingSection.id, 
          sectionData, 
          hasImageChanges ? images : null,  // Only send if there are changes
          videos.length > 0 ? videos : null  // Only send if there are new videos
        );
        setUploadProgress(100);
        alert('✅ Section updated successfully!');
      } else {
        await storefrontAPI.createSection(sectionData, images, videos);
        setUploadProgress(100);
        alert('✅ Section created successfully!');
      }
      
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('❌ Error saving section:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      
      setUploadProgress(0);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      
      if (error.response?.data?.errors) {
        const serverErrors = {};
        Object.keys(error.response.data.errors).forEach(key => {
          serverErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(serverErrors);
        
        // Create detailed error message
        let detailedErrors = 'Validation errors:\n';
        Object.keys(serverErrors).forEach(key => {
          detailedErrors += `• ${key}: ${serverErrors[key]}\n`;
        });
        
        alert('❌ ' + detailedErrors);
      } else {
        alert('❌ Error saving section: ' + errorMessage);
      }
    }
  };

  const handleDelete = async (sectionId) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    
    try {
      await storefrontAPI.deleteSection(sectionId);
      alert('Section deleted successfully!');
      fetchData();
    } catch (error) {
      alert('Error deleting section: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newErrors = {};

    // Calculate total images (existing - deleted + new)
    const remainingExistingImages = existingImages.length - imagesToDelete.length;
    const totalImages = remainingExistingImages + images.length + files.length;

    // Validate total number of images
    if (totalImages > MAX_IMAGES) {
      newErrors.images = `Maximum ${MAX_IMAGES} images allowed. You currently have ${remainingExistingImages + images.length} image(s).`;
      setErrors(newErrors);
      e.target.value = '';
      return;
    }

    // Validate each file
    const invalidFiles = [];
    const oversizedFiles = [];
    
    files.forEach((file, index) => {
      // Check file type
      if (!ALLOWED_FORMATS.includes(file.type)) {
        invalidFiles.push(file.name);
      }
      
      // Check file size
      if (file.size > MAX_IMAGE_SIZE) {
        oversizedFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      newErrors.images = `Invalid format: ${invalidFiles.join(', ')}. Only JPG, PNG, WebP, GIF allowed.`;
    } else if (oversizedFiles.length > 0) {
      newErrors.images = `File(s) too large: ${oversizedFiles.join(', ')}. Maximum 5MB per image.`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      e.target.value = ''; // Reset input
      return;
    }

    // Append new images to existing array
    setImages(prev => [...prev, ...files]);
    setErrors({});
    e.target.value = ''; // Reset input for next selection
  };

  const handleRemoveExistingImage = (imageUrl) => {
    setImagesToDelete(prev => [...prev, imageUrl]);
  };

  const handleRestoreExistingImage = (imageUrl) => {
    setImagesToDelete(prev => prev.filter(url => url !== imageUrl));
  };

  const handleRemoveNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Video handling functions
  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    const newErrors = {};

    // Calculate total videos (existing - deleted + new)
    const remainingExistingVideos = existingVideos.length - videosToDelete.length;
    const totalVideos = remainingExistingVideos + videos.length + files.length;

    // Validate total number of videos
    if (totalVideos > MAX_VIDEOS) {
      newErrors.videos = `Maximum ${MAX_VIDEOS} videos allowed. You currently have ${remainingExistingVideos + videos.length} video(s).`;
      setErrors(newErrors);
      e.target.value = '';
      return;
    }

    // Validate each file
    const invalidFiles = [];
    const oversizedFiles = [];
    
    files.forEach((file) => {
      // Check file type
      if (!ALLOWED_VIDEO_FORMATS.includes(file.type)) {
        invalidFiles.push(file.name);
      }
      
      // Check file size
      if (file.size > MAX_VIDEO_SIZE) {
        oversizedFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      newErrors.videos = `Invalid format: ${invalidFiles.join(', ')}. Only MP4, WebM, OGG allowed.`;
    } else if (oversizedFiles.length > 0) {
      newErrors.videos = `File(s) too large: ${oversizedFiles.join(', ')}. Maximum 50MB per video.`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      e.target.value = '';
      return;
    }

    // Append new videos to existing array
    setVideos(prev => [...prev, ...files]);
    setErrors({});
    e.target.value = '';
  };

  const handleRemoveExistingVideo = (videoUrl) => {
    setVideosToDelete(prev => [...prev, videoUrl]);
  };

  const handleRestoreExistingVideo = (videoUrl) => {
    setVideosToDelete(prev => prev.filter(url => url !== videoUrl));
  };

  const handleRemoveNewVideo = (index) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center">Loading page builder...</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center text-red-600">Page not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard/storefront/pages')}
          className="text-blue-600 hover:underline mb-4 flex items-center gap-2"
        >
          ← Back to Pages
        </button>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🖼️ Page Builder</h1>
            <p className="text-gray-600 mt-2">
              Building: <span className="font-semibold">{page.title}</span>
              <span className="text-sm ml-2 text-gray-500">({page.slug})</span>
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2"
          >
            <span>➕</span> Add Section
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-purple-900 mb-2">💡 Building Your Page</h3>
        <p className="text-sm text-purple-800">
          Add sections below to build your page content. Sections will appear on your storefront in the order shown here.
        </p>
      </div>

      {/* Sections List */}
      {sections.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🖼️</div>
          <h3 className="text-xl font-semibold mb-2">No Sections Yet</h3>
          <p className="text-gray-600 mb-6">
            Start building your "{page.title}" page by adding sections!
          </p>
          <button
            onClick={handleCreate}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
          >
            Add First Section
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {sectionTypes.find(t => t.value === section.section_type)?.label.split(' ')[0] || '📄'}
                    </span>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {section.title || sectionTypes.find(t => t.value === section.section_type)?.label.substring(3) || section.section_type}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Type: {section.section_type}
                        {!section.is_visible && (
                          <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            Hidden
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {section.content && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {section.content}
                    </p>
                  )}
                  
                  {/* Show selected products count for featured_products */}
                  {section.section_type === 'featured_products' && section.settings?.selected_products && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">
                          ✓ {section.settings.selected_products.length} product{section.settings.selected_products.length !== 1 ? 's' : ''} selected
                        </span>
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Click "View Live" to see these products on your storefront
                      </p>
                    </div>
                  )}
                  
                  {section.images && section.images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {section.images.slice(0, 4).map((image, idx) => (
                        <img
                          key={idx}
                          src={getImageUrl(image)}
                          alt={`Section ${index + 1} image ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ))}
                      {section.images.length > 4 && (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-sm text-gray-600">
                          +{section.images.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(section)}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(section.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Button */}
      {storefront && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">🔍 Preview Your Page</h3>
              <p className="text-sm text-gray-600">
                View your page as it appears to visitors
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const timestamp = new Date().getTime();
                  window.open(`/store/${storefront.slug}/${page.slug}?v=${timestamp}`, '_blank');
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2 shadow-md"
              >
                <span>🔄</span> Preview Fresh
              </button>
              <a
                href={`/store/${storefront.slug}/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold flex items-center gap-2"
              >
                <span>🌐</span> View Live
              </a>
            </div>
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-800">
              💡 <strong>Tip:</strong> Use "Preview Fresh" to see your latest changes with cache cleared, 
              or "View Live" to see the page as your visitors would see it.
            </p>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex-shrink-0">
              <h2 className="text-2xl font-bold">
                {editingSection ? '✏️ Edit Section' : '➕ Add Section'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Section Type *</label>
                {editingSection ? (
                  <div className="w-full px-4 py-3 border rounded bg-gray-50">
                    <span className="font-semibold text-gray-700">
                      {sectionTypes.find(t => t.value === formData.section_type)?.label || formData.section_type}
                    </span>
                    <span className="text-gray-500 ml-2">
                      - {sectionTypes.find(t => t.value === formData.section_type)?.description}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      ℹ️ Section type cannot be changed after creation
                    </p>
                  </div>
                ) : (
                  <select
                    required
                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={formData.section_type}
                    onChange={(e) => setFormData({ ...formData, section_type: e.target.value })}
                  >
                    {sectionTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Hide Section Title field for Heading type since the heading itself is the title */}
              {formData.section_type !== 'heading' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Section Title
                  {['hero', 'banner'].includes(formData.section_type) && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : ''
                  }`}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Welcome to Our Company"
                  maxLength="200"
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1">⚠️ {errors.title}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{formData.title.length}/200</p>
              </div>
              )}

              {/* Special fields for Heading Section */}
              {formData.section_type === 'heading' && (
              <div className="space-y-4 border-2 border-blue-200 bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-2 text-blue-800 text-sm">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>
                    <strong>Heading Section:</strong> Create a large, prominent heading for your page. 
                    The "Section Title" field becomes your main heading text.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Heading Text <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.title ? 'border-red-500' : ''
                    }`}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Our Mission"
                    maxLength="200"
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1">⚠️ {errors.title}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{formData.title.length}/200</p>
                </div>
              </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Content
                  {['text'].includes(formData.section_type) && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                  {formData.section_type === 'heading' && (
                    <span className="text-gray-500 text-xs ml-2">(Optional subheading or description)</span>
                  )}
                </label>
                <textarea
                  className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm ${
                    errors.content ? 'border-red-500' : ''
                  }`}
                  rows="6"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={formData.section_type === 'heading' ? 'Add a subheading or brief description (optional)...' : 'Enter your content here...'}
                  maxLength="5000"
                />
                {errors.content && (
                  <p className="text-xs text-red-500 mt-1">⚠️ {errors.content}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{formData.content.length}/5000 characters</p>
                {formData.section_type === 'text' && (
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Use HTML tags for formatting: &lt;b&gt;bold&lt;/b&gt;, &lt;i&gt;italic&lt;/i&gt;, &lt;span style="color:red"&gt;colored&lt;/span&gt;
                  </p>
                )}
              </div>

              {/* Dynamic-Style Text Customization for Text Section */}
              {formData.section_type === 'text' && (
                <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50 space-y-4">
                  <h3 className="font-semibold text-purple-900 mb-3">🎨 Text Styling Options (Dynamic-Style)</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Text Color */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Text Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.settings?.text_color || '#000000'}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            settings: { ...formData.settings, text_color: e.target.value }
                          })}
                          className="w-12 h-10 border rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.settings?.text_color || '#000000'}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            settings: { ...formData.settings, text_color: e.target.value }
                          })}
                          className="flex-1 px-3 py-2 border rounded text-sm"
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    {/* Font Size */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Font Size</label>
                      <select
                        value={formData.settings?.font_size || '16px'}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          settings: { ...formData.settings, font_size: e.target.value }
                        })}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="12px">Small (12px)</option>
                        <option value="14px">Regular (14px)</option>
                        <option value="16px">Medium (16px)</option>
                        <option value="18px">Large (18px)</option>
                        <option value="20px">Extra Large (20px)</option>
                        <option value="24px">Huge (24px)</option>
                      </select>
                    </div>

                    {/* Text Alignment */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Text Alignment</label>
                      <select
                        value={formData.settings?.text_align || 'left'}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          settings: { ...formData.settings, text_align: e.target.value }
                        })}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                        <option value="justify">Justify</option>
                      </select>
                    </div>

                    {/* Font Weight */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Font Weight</label>
                      <select
                        value={formData.settings?.font_weight || 'normal'}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          settings: { ...formData.settings, font_weight: e.target.value }
                        })}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="300">Light</option>
                        <option value="normal">Normal</option>
                        <option value="500">Medium</option>
                        <option value="600">Semi Bold</option>
                        <option value="bold">Bold</option>
                      </select>
                    </div>
                  </div>

                  {/* Background Options */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-purple-900 mb-3">🖼️ Background Settings</h4>
                    
                    <div className="space-y-3">
                      {/* Background Color */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Background Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={formData.settings?.bg_color || '#ffffff'}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              settings: { ...formData.settings, bg_color: e.target.value }
                            })}
                            className="w-12 h-10 border rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.settings?.bg_color || '#ffffff'}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              settings: { ...formData.settings, bg_color: e.target.value }
                            })}
                            className="flex-1 px-3 py-2 border rounded text-sm"
                            placeholder="#ffffff"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ 
                              ...formData, 
                              settings: { ...formData.settings, bg_color: 'transparent' }
                            })}
                            className="px-3 py-2 border rounded text-sm hover:bg-gray-100"
                          >
                            Transparent
                          </button>
                        </div>
                      </div>

                      {/* Background Image */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Background Image</label>
                        
                        {/* Existing Background Image Preview */}
                        {editingSection && existingImages.length > 0 && (
                          <div className="mb-3">
                            <div className="relative group border-2 border-gray-200 rounded-lg overflow-hidden inline-block">
                              <img
                                src={getImageUrl(existingImages[0])}
                                alt="Current background"
                                className="w-full h-32 object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveExistingImage(existingImages[0])}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Current background image</p>
                          </div>
                        )}

                        {/* New Background Image Upload */}
                        {(!editingSection || (editingSection && existingImages.length === 0)) && (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                              onChange={handleImageChange}
                              className="hidden"
                              id="bg-image-upload"
                            />
                            <label htmlFor="bg-image-upload" className="cursor-pointer">
                              <div className="text-3xl mb-2">🖼️</div>
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Click to upload background image
                              </p>
                              <p className="text-xs text-gray-500">
                                JPG, PNG, WebP, GIF (Max 5MB)
                              </p>
                            </label>
                          </div>
                        )}

                        {/* New Image Preview */}
                        {images.length > 0 && (
                          <div className="mt-3">
                            <div className="relative group border-2 border-green-200 rounded-lg overflow-hidden inline-block bg-green-50">
                              <div className="w-full h-32 flex items-center justify-center p-3">
                                <div className="text-center">
                                  <svg className="w-10 h-10 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <p className="text-xs text-gray-600 font-medium">{images[0].name}</p>
                                  <p className="text-xs text-gray-400">{(images[0].size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveNewImage(0)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <p className="text-xs text-green-600 mt-1">✓ New background image ready</p>
                          </div>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                          💡 Background image will be displayed behind the text content
                        </p>
                      </div>

                      {/* Section Padding */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Section Padding</label>
                        <select
                          value={formData.settings?.padding || 'medium'}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            settings: { ...formData.settings, padding: e.target.value }
                          })}
                          className="w-full px-3 py-2 border rounded"
                        >
                          <option value="none">None</option>
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                          <option value="xlarge">Extra Large</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Showcase - Simple auto-display */}
              {formData.section_type === 'products_showcase' && (
                <div className="space-y-4 border-2 border-gray-200 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">📦 Products Showcase - Automatic Display</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    💡 Your products will be automatically displayed in a grid
                  </p>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Number of Products to Display
                    </label>
                    <select
                      className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                      value={formData.settings?.products_limit || 8}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        settings: { ...formData.settings, products_limit: parseInt(e.target.value) }
                      })}
                    >
                      <option value="4">4 Products</option>
                      <option value="8">8 Products (Recommended)</option>
                      <option value="12">12 Products</option>
                      <option value="16">16 Products</option>
                      <option value="20">20 Products</option>
                      <option value="0">All Products</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Shows your latest products automatically
                    </p>
                  </div>
                </div>
              )}

              {/* Featured Products - Manual selection */}
              {formData.section_type === 'featured_products' && (
                <div className="space-y-4 border-2 border-blue-200 bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-bold text-blue-900 mb-3">⭐ Featured Products - Manual Selection</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    💡 Select specific products to showcase on this page
                  </p>
                  
                  {/* Product Selector */}
                  <ProductSelector
                    selectedProducts={formData.settings?.selected_products || []}
                    onChange={(products) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, selected_products: products }
                    })}
                  />
                </div>
              )}

              {/* Images section - hide for products_showcase and featured_products, but show for text section as background */}
              {!['products_showcase', 'featured_products', 'hero', 'banner', 'gallery', 'image', 'slider'].includes(formData.section_type) && formData.section_type === 'text' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Background Image (Optional)
                </label>

                {/* Existing Images (when editing) */}
                {editingSection && existingImages.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">📁 Current Background Image</h4>
                    <div className="relative group border-2 border-gray-200 rounded-lg overflow-hidden inline-block">
                      <img 
                        src={getImageUrl(existingImages[0])}
                        alt="Current background"
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(existingImages[0])}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {imagesToDelete.includes(existingImages[0]) && (
                      <p className="text-xs text-red-600 mt-2">
                        ⚠️ Background image will be removed when you save
                      </p>
                    )}
                  </div>
                )}

                {/* New Images Upload - Show when creating new section OR editing with no existing images OR existing image marked for deletion */}
                {(!editingSection || existingImages.length === 0 || (editingSection && imagesToDelete.length > 0)) && (
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    errors.images ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-500'
                  }`}>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleImageChange}
                      className="hidden"
                      id="text-bg-image-upload"
                    />
                    <label htmlFor="text-bg-image-upload" className="cursor-pointer">
                      <div className="text-4xl mb-2">🖼️</div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Click to upload background image
                      </p>
                      <p className="text-xs text-gray-500">
                        or drag and drop
                      </p>
                    </label>
                  </div>
                )}

                {/* New Images Preview */}
                {images.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-green-700 mb-2">✨ New Background Image</h4>
                    <div className="relative group border-2 border-green-200 rounded-lg overflow-hidden inline-block bg-green-50">
                      <div className="w-full h-32 flex flex-col items-center justify-center p-2">
                        <svg className="w-8 h-8 text-green-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs text-gray-600 truncate w-full text-center">{images[0].name}</p>
                        <p className="text-xs text-gray-400">{(images[0].size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(0)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Remove this image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                
                {errors.images && (
                  <p className="text-xs text-red-500 mt-2">⚠️ {errors.images}</p>
                )}
              </div>
              )}

              {/* Images section for other section types (exclude heading, products_showcase, featured_products, text) */}
              {!['products_showcase', 'featured_products', 'text', 'heading'].includes(formData.section_type) && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Images
                  {['hero', 'banner', 'gallery'].includes(formData.section_type) && !editingSection && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>

                {/* Existing Images (when editing) */}
                {editingSection && existingImages.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">📁 Existing Images ({existingImages.length - imagesToDelete.length}/{existingImages.length})</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {existingImages.map((imageUrl, idx) => {
                        const isMarkedForDeletion = imagesToDelete.includes(imageUrl);
                        return (
                          <div key={idx} className={`relative group border-2 rounded-lg overflow-hidden ${
                            isMarkedForDeletion ? 'border-red-500 opacity-50' : 'border-gray-200'
                          }`}>
                            <img 
                              src={getImageUrl(imageUrl)}
                              alt={`Existing ${idx + 1}`}
                              className="w-full h-24 object-cover"
                            />
                            {isMarkedForDeletion ? (
                              <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleRestoreExistingImage(imageUrl)}
                                  className="bg-white text-green-600 px-3 py-1 rounded text-xs font-semibold hover:bg-green-50"
                                >
                                  ↶ Restore
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRemoveExistingImage(imageUrl)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                title="Remove this image"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {imagesToDelete.length > 0 && (
                      <p className="text-xs text-red-600 mt-2">
                        ⚠️ {imagesToDelete.length} image(s) will be deleted when you save
                      </p>
                    )}
                  </div>
                )}

                {/* New Images Upload */}
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  errors.images ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-500'
                }`}>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="text-4xl mb-2">📸</div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {editingSection ? 'Add more images' : 'Click to upload images'}
                    </p>
                    <p className="text-xs text-gray-500">
                      or drag and drop
                    </p>
                  </label>
                </div>

                {/* New Images Preview */}
                {images.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-green-700 mb-2">✨ New Images to Upload ({images.length})</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {Array.from(images).map((file, idx) => (
                        <div key={idx} className="relative group border-2 border-green-200 rounded-lg overflow-hidden bg-green-50">
                          <div className="w-full h-24 flex flex-col items-center justify-center p-2">
                            <svg className="w-8 h-8 text-green-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xs text-gray-600 truncate w-full text-center">{file.name}</p>
                            <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Remove this image"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {errors.images ? (
                  <p className="text-xs text-red-500 mt-2">⚠️ {errors.images}</p>
                ) : (
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    <p>✓ Formats: JPG, PNG, WebP, GIF</p>
                    <p>✓ Max size: 5MB per image</p>
                    <p>✓ Max total images: {MAX_IMAGES} {editingSection && `(Currently: ${existingImages.length - imagesToDelete.length + images.length})`}</p>
                    {editingSection && (
                      <p className="text-blue-600">💡 why</p>
                    )}
                  </div>
                )}
                
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-center mt-1 text-gray-600">Uploading... {uploadProgress}%</p>
                  </div>
                )}
              </div>
              )}

              {/* Videos section - hide for products_showcase, featured_products, text, and heading */}
              {!['products_showcase', 'featured_products', 'text', 'heading'].includes(formData.section_type) && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Videos
                  {formData.section_type === 'slider' && !editingSection && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>

                {/* Existing Videos (when editing) */}
                {editingSection && existingVideos.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">📁 Existing Videos ({existingVideos.length - videosToDelete.length}/{existingVideos.length})</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {existingVideos.map((videoUrl, idx) => {
                        const isMarkedForDeletion = videosToDelete.includes(videoUrl);
                        return (
                          <div key={idx} className={`relative group border-2 rounded-lg overflow-hidden ${
                            isMarkedForDeletion ? 'border-red-500 opacity-50' : 'border-gray-200'
                          }`}>
                            <video
                              src={getImageUrl(videoUrl)}
                              controls
                              className="w-full h-24 object-cover"
                            />
                            {isMarkedForDeletion ? (
                              <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleRestoreExistingVideo(videoUrl)}
                                  className="bg-white text-green-600 px-3 py-1 rounded text-xs font-semibold hover:bg-green-50"
                                >
                                  ↶ Restore
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRemoveExistingVideo(videoUrl)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                title="Remove this video"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {videosToDelete.length > 0 && (
                      <p className="text-xs text-red-600 mt-2">
                        ⚠️ {videosToDelete.length} video(s) will be deleted when you save
                      </p>
                    )}
                  </div>
                )}

                {/* New Videos Upload */}
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  errors.videos ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-500'
                }`}>
                  <input
                    type="file"
                    multiple
                    accept="video/mp4,video/webm,video/ogg"
                    onChange={handleVideoChange}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <div className="text-4xl mb-2">🎥</div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {editingSection ? 'Add more videos' : 'Click to upload videos'}
                    </p>
                    <p className="text-xs text-gray-500">
                      or drag and drop
                    </p>
                  </label>
                </div>

                {/* New Videos Preview */}
                {videos.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-green-700 mb-2">✨ New Videos to Upload ({videos.length})</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {Array.from(videos).map((file, idx) => (
                        <div key={idx} className="relative group border-2 border-green-200 rounded-lg overflow-hidden bg-green-50">
                          <div className="w-full h-24 flex flex-col items-center justify-center p-2">
                            <svg className="w-8 h-8 text-green-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xs text-gray-600 truncate w-full text-center">{file.name}</p>
                            <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveNewVideo(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Remove this video"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {errors.videos ? (
                  <p className="text-xs text-red-500 mt-2">⚠️ {errors.videos}</p>
                ) : (
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    <p>✓ Formats: MP4, WebM, OGG</p>
                    <p>✓ Max size: 50MB per video</p>
                    <p>✓ Max total videos: {MAX_VIDEOS} {editingSection && `(Currently: ${existingVideos.length - videosToDelete.length + videos.length})`}</p>
                    {editingSection && (
                      <p className="text-blue-600">💡 Click upload to add more videos, or click X on existing videos to remove them</p>
                    )}
                  </div>
                )}
                
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-center mt-1 text-gray-600">Uploading... {uploadProgress}%</p>
                  </div>
                )}
              </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_visible"
                  className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  checked={formData.is_visible}
                  onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                />
                <label htmlFor="is_visible" className="ml-2 text-sm font-medium">
                  Section is visible on storefront
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700"
                >
                  {editingSection ? 'Update Section' : 'Add Section'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Product Selector Component for Featured Products
function ProductSelector({ selectedProducts = [], onChange }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingProductId, setViewingProductId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiService.getProducts();
      console.log('Products fetched:', response.data);
      if (response.data && response.data.length > 0) {
        console.log('Sample product structure:', response.data[0]);
      }
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProduct = (productId) => {
    const newSelection = selectedProducts.includes(productId)
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId];
    onChange(newSelection);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-4">Loading products...</div>;
  }

  return (
    <div className="space-y-3">
      <div>
        <input
          type="text"
          placeholder="🔍 Search products..."
          className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="max-h-[500px] overflow-y-auto border rounded p-3 bg-gray-50">
        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            {searchTerm ? 'No products found matching your search' : 'No products available'}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => {
              const isSelected = selectedProducts.includes(product.id);
              
              // More robust image URL logic
              let productImage = null;
              
              // Check main_image first
              if (product.main_image) {
                if (typeof product.main_image === 'string') {
                  productImage = getImageUrl(product.main_image);
                } else if (product.main_image.image_path) {
                  productImage = getImageUrl(product.main_image.image_path);
                }
              }
              
              // Fallback to first image in images array
              if (!productImage && product.images && product.images.length > 0) {
                const firstImage = product.images[0];
                if (typeof firstImage === 'string') {
                  productImage = getImageUrl(firstImage);
                } else if (firstImage.image_path) {
                  productImage = getImageUrl(firstImage.image_path);
                }
              }
              
              console.log(`Product ${product.id} image:`, {
                main_image: product.main_image,
                images: product.images,
                resolved: productImage
              });

              return (
                <div
                  key={product.id}
                  className={`relative bg-white rounded-lg border-2 overflow-hidden transition-all hover:shadow-lg ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {/* Checkbox - Top Left Corner */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleProduct(product.id)}
                      className="w-5 h-5 text-blue-600 cursor-pointer bg-white rounded border-2 border-gray-300 shadow-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Selected Badge - Top Right Corner */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 z-10 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                      ✓ Selected
                    </div>
                  )}

                  {/* Product Image - Clickable */}
                  <div 
                    className="w-full h-40 bg-gray-100 cursor-pointer overflow-hidden group"
                    onClick={() => setViewingProductId(product.id)}
                  >
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          console.error('Image failed to load:', productImage);
                          e.target.style.display = 'none';
                          if (e.target.nextElementSibling) {
                            e.target.nextElementSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className={`${productImage ? 'hidden' : 'flex'} w-full h-full flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200`}>
                      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs text-gray-500">No Image</p>
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-white font-semibold text-sm bg-blue-600 px-3 py-1 rounded-full">
                        👁️ View Details
                      </span>
                    </div>
                  </div>

                  {/* Product Info - Clickable */}
                  <div 
                    className="p-3 cursor-pointer"
                    onClick={() => setViewingProductId(product.id)}
                  >
                    <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1 min-h-[2.5rem]">
                      {product.name}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">{product.category || 'Uncategorized'}</p>
                    <div className="flex items-center justify-between">
                      {product.price ? (
                        <span className="text-sm font-bold text-green-600">${product.price}</span>
                      ) : (
                        <span className="text-xs text-gray-400">Price on request</span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingProductId(product.id);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded p-2">
        {selectedProducts.length > 0 ? (
          <span className="font-semibold text-blue-700">
            ✓ {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
          </span>
        ) : (
          <span className="text-gray-600">Click checkboxes to select products, or click cards to view details</span>
        )}
      </div>

      {/* Product Detail Modal - Using the same modal from Products module */}
      <ProductDetailModal
        isOpen={viewingProductId !== null}
        onClose={() => setViewingProductId(null)}
        productId={viewingProductId}
        onEdit={null}
        onDelete={null}
      />
    </div>
  );
}
