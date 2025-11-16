import { useState, useEffect } from 'react';
import { storefrontAPI, getImageUrl } from '../../../lib/storefront-api';
import { useRouter } from 'next/router';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import apiService from '../../../lib/api';

export default function StorefrontSections() {
  const router = useRouter();
  const [storefront, setStorefront] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionType, setSectionType] = useState('hero');
  const [showTemplates, setShowTemplates] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  const sectionTypes = [
    // Header/Hero Sections
    { value: 'banner', label: 'Banner', icon: '🎨', description: 'Single hero image with text overlay', recommended: 1, tip: 'Simple, clean banner - perfect for single message', category: 'header' },
    { value: 'hero', label: 'Hero/Slider', icon: '🖼️', description: 'Multiple images carousel slider', recommended: 2, tip: 'Multiple images rotating - great for showcasing variety', category: 'header' },
    
    // Content Sections
    { value: 'heading', label: 'Heading', icon: '�', description: 'Large heading/title section', recommended: 3, tip: 'Add section titles and headers like Dynamic', category: 'content' },
    { value: 'text', label: 'Text/Paragraph', icon: '�', description: 'Simple text content block', recommended: 4, tip: 'Add paragraphs, descriptions, or any text content', category: 'content' },
    { value: 'about', label: 'About Us', icon: '📄', description: 'Text content section with title', recommended: 5, tip: 'Tell your company story and build trust', category: 'content' },
    
    // Media Sections
    { value: 'gallery', label: 'Image Gallery', icon: '🖼️', description: 'Multiple images in a grid', recommended: 6, tip: 'Display your facility, products, or team', category: 'media' },
    { value: 'video', label: 'Video Section', icon: '🎥', description: 'Embedded video', recommended: 7, tip: 'Show factory tours or product demos', category: 'media' },
    
    // Business Sections
    { value: 'products_showcase', label: 'Products Showcase', icon: '📦', description: 'Display products grid', recommended: 8, tip: 'Auto-display all your products', category: 'business' },
    { value: 'featured_products', label: 'Featured Products', icon: '⭐', description: 'Hand-pick products to feature', recommended: 9, tip: 'Manually select which products to showcase', category: 'business' },
    { value: 'certifications', label: 'Certifications', icon: '🏆', description: 'Company certificates', recommended: 10, tip: 'Build credibility with certifications', category: 'business' },
    { value: 'testimonials', label: 'Testimonials', icon: '💬', description: 'Customer reviews', recommended: 10, tip: 'Social proof from satisfied customers', category: 'business' },
    { value: 'team', label: 'Team Members', icon: '👥', description: 'Team profiles', recommended: 11, tip: 'Introduce your team to build trust', category: 'business' },
    { value: 'contact', label: 'Contact Info', icon: '📞', description: 'Contact details', recommended: 12, tip: 'Make it easy for buyers to reach you', category: 'business' },
  ];

  const templates = [
    {
      name: 'Complete Storefront',
      description: 'Full-featured storefront with all sections',
      icon: '⭐',
      sections: ['hero', 'about', 'products_showcase', 'certifications', 'gallery', 'testimonials', 'contact']
    },
    {
      name: 'Quick Start',
      description: 'Essential sections to get started fast',
      icon: '⚡',
      sections: ['hero', 'about', 'products_showcase', 'contact']
    },
    {
      name: 'Product Focused',
      description: 'Highlight your products and capabilities',
      icon: '🛍️',
      sections: ['hero', 'products_showcase', 'gallery', 'certifications', 'contact']
    },
    {
      name: 'Trust Builder',
      description: 'Build credibility and trust with buyers',
      icon: '🏆',
      sections: ['hero', 'about', 'certifications', 'testimonials', 'team', 'contact']
    }
  ];

  useEffect(() => {
    fetchStorefront();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiService.getProducts();
      const productList = response.data || response;
      setAllProducts(productList);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchStorefront = async () => {
    try {
      const response = await storefrontAPI.getMyStorefront();
      if (response.data && response.data.id) {
        setStorefront(response.data);
        setSections(response.data.sections || []);
      } else {
        router.push('/dashboard/storefront');
      }
    } catch (error) {
      console.error('Error fetching storefront:', error);
      alert('Please create a storefront first');
      router.push('/dashboard/storefront');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update sort_order for all items
    const updatedItems = items.map((item, index) => ({
      ...item,
      sort_order: index,
    }));

    setSections(updatedItems);

    // Update each section's sort_order in the backend
    try {
      for (const item of updatedItems) {
        await storefrontAPI.updateSection(item.id, { sort_order: item.sort_order });
      }
    } catch (error) {
      console.error('Error updating section order:', error);
      alert('Failed to update section order');
      fetchStorefront(); // Reload to reset
    }
  };

  const handleAddSection = () => {
    setEditingSection(null);
    setSectionType('hero');
    setShowAddModal(true);
  };

  const handleUseTemplate = async (template) => {
    if (!confirm(`Apply "${template.name}" template? This will add ${template.sections.length} sections.`)) return;

    try {
      for (let i = 0; i < template.sections.length; i++) {
        const sectionType = template.sections[i];
        const sectionInfo = sectionTypes.find(t => t.value === sectionType);
        
        await storefrontAPI.createSection({
          storefront_id: storefront.id,
          section_type: sectionType,
          title: sectionInfo?.label || sectionType,
          content: '',
          is_visible: true,
        }, []);
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      alert(`${template.name} template applied successfully!`);
      fetchStorefront();
      setShowTemplates(false);
    } catch (error) {
      console.error('Error applying template:', error);
      alert('Failed to apply template. Please try adding sections manually.');
    }
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setSectionType(section.section_type);
    setShowAddModal(true);
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      await storefrontAPI.deleteSection(sectionId);
      alert('Section deleted successfully!');
      fetchStorefront();
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Failed to delete section');
    }
  };

  const toggleSectionVisibility = async (section) => {
    try {
      await storefrontAPI.updateSection(section.id, {
        is_visible: !section.is_visible,
      });
      fetchStorefront();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Failed to update visibility');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Page Builder</h1>
          <p className="text-gray-600 mt-2">Drag and drop sections to customize your storefront</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard/storefront')}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            ← Back to Settings
          </button>
          {sections.length === 0 && (
            <button
              onClick={() => setShowTemplates(true)}
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              ⚡ Use Template
            </button>
          )}
          <button
            onClick={handleAddSection}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add Section
          </button>
        </div>
      </div>

      {/* Template Selector Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Choose a Template</h2>
              <p className="text-gray-600 mt-1">Quick start with pre-built section layouts</p>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.name}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition cursor-pointer"
                  onClick={() => handleUseTemplate(template)}
                >
                  <div className="text-4xl mb-3">{template.icon}</div>
                  <h3 className="text-lg font-bold mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {template.sections.map((sec) => {
                      const sectionInfo = sectionTypes.find(t => t.value === sec);
                      return (
                        <span key={sec} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {sectionInfo?.icon} {sectionInfo?.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setShowTemplates(false)}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {sections.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-semibold mb-2">No sections yet</h2>
          <p className="text-gray-600 mb-6">
            Start building your storefront by adding sections
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowTemplates(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              ⚡ Use Template (Quick Start)
            </button>
            <button
              onClick={handleAddSection}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Add Section Manually
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Drag & Drop Tip */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="font-semibold text-blue-900">Pro Tip: Prioritize Your Sections</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Drag sections using the <span className="font-mono bg-blue-100 px-1">⋮⋮</span> handle to reorder them.
                  The top section appears first on your storefront!
                </p>
              </div>
            </div>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {sections.map((section, index) => (
                  <Draggable
                    key={section.id}
                    draggableId={section.id.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white rounded-lg shadow-md p-6 ${
                          snapshot.isDragging ? 'shadow-2xl' : ''
                        } ${!section.is_visible ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-move text-2xl text-gray-400 hover:text-gray-600"
                          >
                            ⋮⋮
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">
                                  {sectionTypes.find((t) => t.value === section.section_type)?.icon || '📄'}
                                </span>
                                <div>
                                  <h3 className="text-lg font-semibold">
                                    {section.title || sectionTypes.find((t) => t.value === section.section_type)?.label}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {sectionTypes.find((t) => t.value === section.section_type)?.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleSectionVisibility(section)}
                                  className={`px-3 py-1 rounded text-sm ${
                                    section.is_visible
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {section.is_visible ? '👁️ Visible' : '🚫 Hidden'}
                                </button>
                                <button
                                  onClick={() => handleEditSection(section)}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteSection(section.id)}
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>

                            {section.content && (
                              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                {section.content}
                              </p>
                            )}

                            {section.images && section.images.length > 0 && (
                              <div className="flex gap-2 mt-3 overflow-x-auto">
                                {section.images.slice(0, 5).map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={getImageUrl(img)}
                                    alt={`Section image ${idx + 1}`}
                                    className="w-20 h-20 object-cover rounded"
                                  />
                                ))}
                                {section.images.length > 5 && (
                                  <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-sm">
                                    +{section.images.length - 5}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Featured Products Preview */}
                            {section.section_type === 'featured_products' && section.settings?.selected_products && (
                              <div className="mt-3">
                                <div className="flex gap-2 overflow-x-auto">
                                  {allProducts
                                    .filter(p => section.settings.selected_products.includes(p.id))
                                    .slice(0, 5)
                                    .map((product) => {
                                      const imageUrl = product.main_image?.image_path
                                        ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${product.main_image.image_path}`
                                        : product.main_image
                                        ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${product.main_image}`
                                        : product.images?.[0]?.image_path
                                        ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${product.images[0].image_path}`
                                        : null;

                                      return (
                                        <div key={product.id} className="relative flex-shrink-0">
                                          {imageUrl ? (
                                            <img
                                              src={imageUrl}
                                              alt={product.name}
                                              className="w-20 h-20 object-cover rounded"
                                            />
                                          ) : (
                                            <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                                              <span className="text-xs text-gray-500">No img</span>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  {section.settings.selected_products.length > 5 && (
                                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-sm flex-shrink-0">
                                      +{section.settings.selected_products.length - 5}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        </>
      )}

      {/* Add/Edit Section Modal */}
      {showAddModal && (
        <SectionEditorModal
          section={editingSection}
          sectionType={sectionType}
          setSectionType={setSectionType}
          sectionTypes={sectionTypes}
          storefrontId={storefront.id}
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
            fetchStorefront();
          }}
        />
      )}
    </div>
  );
}

// Section Editor Modal Component
function SectionEditorModal({ section, sectionType, setSectionType, sectionTypes, storefrontId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: section?.title || '',
    content: section?.content || '',
    is_visible: section?.is_visible ?? true,
    settings: section?.settings || {},
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(section?.images || []);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Debug log
    console.log('Section Type:', sectionType);
    console.log('Form Data:', formData);

    // Client-side validation
    if (sectionType === 'heading' && !formData.title) {
      alert('Please enter a heading text');
      setSaving(false);
      return;
    }

    if (sectionType === 'text' && !formData.content) {
      alert('Please enter text content');
      setSaving(false);
      return;
    }

    try {
      const data = {
        storefront_id: storefrontId,
        section_type: sectionType,
        title: formData.title,
        content: formData.content,
        settings: formData.settings,
        is_visible: formData.is_visible, // Boolean conversion now handled in API
      };

      console.log('💾 Saving section with data:', data);
      console.log('  - Section type:', sectionType);
      console.log('  - Title:', formData.title);
      console.log('  - Title length:', formData.title?.length);

      if (section) {
        // Update existing section
        await storefrontAPI.updateSection(section.id, data, images);
        alert('Section updated successfully!');
      } else {
        // Create new section
        await storefrontAPI.createSection(data, images);
        alert('Section created successfully!');
      }

      onSave();
    } catch (error) {
      console.error('Error saving section:', error);
      console.error('Error response:', error.response);
      
      // Extract detailed validation errors
      const errorMessage = error.response?.data?.message || error.message;
      const validationErrors = error.response?.data?.errors;
      
      let alertMessage = 'Failed to save section: ' + errorMessage;
      
      if (validationErrors) {
        alertMessage += '\n\nValidation errors:\n';
        Object.keys(validationErrors).forEach(field => {
          alertMessage += `- ${field}: ${validationErrors[field].join(', ')}\n`;
        });
      }
      
      alert(alertMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">
            {section ? 'Edit Section' : 'Add New Section'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section Type */}
          {!section && (
            <div>
              <label className="block text-sm font-medium mb-3">
                Section Type
                <span className="ml-2 text-xs text-gray-500">(Recommended order shown)</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {sectionTypes
                  .sort((a, b) => a.recommended - b.recommended)
                  .map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSectionType(type.value)}
                      className={`p-4 border-2 rounded-lg text-left transition relative ${
                        sectionType === type.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {type.recommended <= 3 && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            #{type.recommended}
                          </span>
                        </div>
                      )}
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="font-semibold">{type.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                      {type.tip && (
                        <div className="text-xs text-blue-600 mt-2 italic">💡 {type.tip}</div>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Title */}
          {!['text'].includes(sectionType) && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {sectionType === 'heading' ? 'Heading Text' : 'Section Title'}
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={
                  sectionType === 'heading' 
                    ? 'e.g., Our Core Values, Why Choose Us' 
                    : 'e.g., Our Story, About Us'
                }
                required={sectionType === 'heading'}
              />
              {sectionType === 'heading' && (
                <p className="text-xs text-gray-500 mt-1">
                  This will be displayed as a large heading on your storefront
                </p>
              )}
            </div>
          )}

          {/* Content - For most sections BUT NOT products_showcase or featured_products */}
          {['about', 'contact', 'testimonials', 'text', 'heading'].includes(sectionType) && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {sectionType === 'text' ? 'Text Content' : 
                   sectionType === 'heading' ? 'Subheading/Description (Optional)' : 'Content'}
                </label>
                <textarea
                  rows={sectionType === 'text' ? '8' : '6'}
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={
                    sectionType === 'text' 
                      ? 'Enter paragraphs, descriptions, or any text content...' 
                      : sectionType === 'heading'
                      ? 'Add a subtitle or brief description (optional)'
                      : 'Enter your content here...'
                  }
                  required={sectionType === 'text'}
                />
                {sectionType === 'text' && (
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Use HTML tags for formatting: &lt;b&gt;bold&lt;/b&gt;, &lt;i&gt;italic&lt;/i&gt;, &lt;span style="color:red"&gt;colored&lt;/span&gt;
                  </p>
                )}
              </div>

              {/* Text Styling Options for Text Section */}
              {sectionType === 'text' && (
                <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50 space-y-4">
                  <h3 className="font-semibold text-purple-900 mb-3">🎨 Text Styling Options</h3>
                  
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
                    <h4 className="font-semibold text-purple-900 mb-3">Background Settings</h4>
                    
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
                        <label className="block text-sm font-medium mb-2">Background Image (Optional)</label>
                        
                        {formData.settings?.bg_image && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2">Current background:</p>
                            <div className="relative inline-block">
                              <img
                                src={getImageUrl(formData.settings.bg_image)}
                                alt="Background"
                                className="w-32 h-24 object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => setFormData({ 
                                  ...formData, 
                                  settings: { ...formData.settings, bg_image: null }
                                })}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setImages([file]);
                              setFormData({ 
                                ...formData, 
                                settings: { ...formData.settings, has_bg_image: true }
                              });
                            }
                          }}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          📷 Upload a background image (1920x400px recommended)
                        </p>
                      </div>

                      {/* Padding */}
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
            </div>
          )}

          {/* Products Showcase - Simple auto-display */}
          {sectionType === 'products_showcase' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Add a brief introduction to your products (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Your products will be automatically displayed in a grid
                </p>
              </div>

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

          {/* Featured Products - Manual selection with blue box */}
          {sectionType === 'featured_products' && (
            <div className="space-y-4 border-2 border-blue-200 bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-bold text-blue-900 mb-3">⭐ Featured Products - Manual Selection</h3>
              
              {/* Description field for featured products */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Add a brief introduction to your featured products (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Select specific products to showcase below
                </p>
              </div>

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

          {/* Images */}
          {['banner', 'hero', 'gallery', 'certifications', 'team'].includes(sectionType) && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {sectionType === 'banner' && 'Banner Image (Single)'}
                {sectionType === 'hero' && 'Slider Images (Multiple)'}
                {!['banner', 'hero'].includes(sectionType) && 'Images'}
              </label>
              
              {existingImages.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Current images:</p>
                  <div className="flex gap-2 flex-wrap">
                    {existingImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={getImageUrl(img)}
                        alt={`Image ${idx + 1}`}
                        className="w-24 h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}

              <input
                type="file"
                multiple={sectionType !== 'banner'}
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-2">
                {sectionType === 'banner' && '📷 Upload ONE image for your banner (1920x400px recommended)'}
                {sectionType === 'hero' && '🎠 Upload MULTIPLE images for a rotating slider'}
                {!['banner', 'hero'].includes(sectionType) && 'Upload multiple images for this section'}
              </p>
            </div>
          )}

          {/* Visibility */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2 w-5 h-5"
                checked={formData.is_visible}
                onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
              />
              <span className="text-sm font-medium">Show this section on the storefront</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              disabled={saving}
            >
              {saving ? 'Saving...' : section ? 'Update Section' : 'Add Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Product Selector Component for Products Showcase
function ProductSelector({ selectedProducts = [], onChange }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts();
      // Handle both paginated and non-paginated responses
      const productList = response.data || response;
      setProducts(productList);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (productId) => {
    const newSelection = selectedProducts.includes(productId)
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId];
    onChange(newSelection);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.category?.toLowerCase().includes(search.toLowerCase())
  );

  const getProductImage = (product) => {
    if (product.main_image?.image_path) {
      return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${product.main_image.image_path}`;
    }
    if (product.images && product.images.length > 0) {
      return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${product.images[0].image_path}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
        <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-sm text-gray-600 font-medium">No products found</p>
        <p className="text-xs text-gray-500 mt-1">Add products to your catalog first</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="mb-3">
        <label className="block text-sm font-medium mb-2">
          Select Products to Display ({selectedProducts.length} selected)
        </label>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredProducts.map((product) => {
          const isSelected = selectedProducts.includes(product.id);
          const imageUrl = getProductImage(product);
          
          return (
            <div
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition ${
                isSelected 
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200' 
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}}
                className="w-5 h-5 text-blue-600"
              />
              
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">No img</span>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500">
                  {product.category} • ${product.price}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No products match your search
        </p>
      )}

      <p className="text-xs text-gray-500 mt-3">
        💡 Click on products to select/deselect them for display
      </p>
    </div>
  );
}
