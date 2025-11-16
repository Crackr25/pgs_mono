import { useState, useEffect } from 'react';
import { storefrontAPI } from '../../../../lib/storefront-api';
import { useRouter } from 'next/router';

export default function PagesManager() {
  const router = useRouter();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    meta_description: '',
    meta_keywords: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await storefrontAPI.getPages();
      setPages(response.data);
    } catch (error) {
      console.error('Error fetching pages:', error);
      alert('Error loading pages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPage(null);
    setFormData({
      title: '',
      slug: '',
      meta_description: '',
      meta_keywords: '',
      is_active: true
    });
    setErrors({});
    setTouched({});
    setShowModal(true);
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      meta_description: page.meta_description || '',
      meta_keywords: page.meta_keywords || '',
      is_active: page.is_active
    });
    setErrors({});
    setTouched({});
    setShowModal(true);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'title':
        if (!value || value.trim().length === 0) {
          newErrors.title = 'Page title is required';
        } else if (value.length < 3) {
          newErrors.title = 'Title must be at least 3 characters';
        } else if (value.length > 100) {
          newErrors.title = 'Title must be less than 100 characters';
        } else {
          delete newErrors.title;
        }
        break;

      case 'slug':
        if (value && !/^[a-z0-9-]+$/.test(value)) {
          newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
        } else if (value && value.length > 100) {
          newErrors.slug = 'Slug must be less than 100 characters';
        } else {
          delete newErrors.slug;
        }
        break;

      case 'meta_description':
        if (value && value.length > 160) {
          newErrors.meta_description = 'Meta description should be 150-160 characters for optimal SEO';
        } else if (value && value.length > 0 && value.length < 50) {
          newErrors.meta_description = 'Meta description is too short. Aim for 150-160 characters';
        } else {
          delete newErrors.meta_description;
        }
        break;

      case 'meta_keywords':
        if (value) {
          const keywords = value.split(',').map(k => k.trim()).filter(k => k);
          if (keywords.length > 10) {
            newErrors.meta_keywords = 'Maximum 10 keywords recommended for SEO';
          } else {
            delete newErrors.meta_keywords;
          }
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    
    // Auto-generate slug from title if slug is empty
    if (name === 'title' && !formData.slug && !editingPage) {
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug: autoSlug }));
    }
    
    // Validate on change if field has been touched
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleFieldBlur = (name) => {
    setTouched({ ...touched, [name]: true });
    validateField(name, formData[name]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const fieldsToValidate = ['title', 'slug', 'meta_description', 'meta_keywords'];
    let isValid = true;
    
    fieldsToValidate.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
      setTouched(prev => ({ ...prev, [field]: true }));
    });

    if (!isValid) {
      alert('Please fix the validation errors before submitting');
      return;
    }

    try {
      if (editingPage) {
        await storefrontAPI.updatePage(editingPage.id, formData);
        alert('✅ Page updated successfully!');
      } else {
        await storefrontAPI.createPage(formData);
        alert('✅ Page created successfully!');
      }
      setShowModal(false);
      fetchPages();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      if (error.response?.data?.errors) {
        // Laravel validation errors
        const serverErrors = {};
        Object.keys(error.response.data.errors).forEach(key => {
          serverErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(serverErrors);
        alert('❌ Validation error: Please check the form fields');
      } else {
        alert('❌ Error saving page: ' + errorMessage);
      }
    }
  };

  const handleDelete = async (pageId) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    
    try {
      await storefrontAPI.deletePage(pageId);
      alert('Page deleted successfully!');
      fetchPages();
    } catch (error) {
      alert('Error deleting page: ' + (error.response?.data?.message || error.message));
    }
  };

  const goToPageBuilder = (pageId) => {
    router.push(`/dashboard/storefront/pages/${pageId}/builder`);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center">Loading pages...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">📄 Pages Manager</h1>
          <p className="text-gray-600 mt-2">Create and manage custom pages for your storefront</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
        >
          <span>➕</span> Create New Page
        </button>
      </div>

      {/* Dynamic-Style Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">🎯 How It Works (Dynamic-Style)</h3>
        <ol className="text-sm text-blue-800 space-y-1 ml-4">
          <li>1. <strong>Create Pages</strong> - Add custom pages like About Us, Services, Contact</li>
          <li>2. <strong>Build Content</strong> - Use Page Builder to add sections to each page</li>
          <li>3. <strong>Add to Menu</strong> - Link pages to your navigation menu</li>
        </ol>
      </div>

      {/* Pages Table */}
      {pages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold mb-2">No Pages Yet</h3>
          <p className="text-gray-600 mb-6">Create your first page to get started!</p>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Create First Page
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Slug</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sections</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{page.title}</td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-sm">/{page.slug}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {page.sections_count || 0} sections
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {page.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        ⊘ Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => goToPageBuilder(page.id)}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                    >
                      🖼️ Page Builder
                    </button>
                    <button
                      onClick={() => handleEdit(page)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">
                {editingPage ? '✏️ Edit Page' : '➕ Create New Page'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Page Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title && touched.title ? 'border-red-500' : ''
                  }`}
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  onBlur={() => handleFieldBlur('title')}
                  placeholder="About Our Company"
                  maxLength="100"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {errors.title && touched.title ? (
                      <span className="text-red-500">⚠️ {errors.title}</span>
                    ) : (
                      'This will appear in navigation and page headers'
                    )}
                  </p>
                  <span className={`text-xs ${formData.title.length > 80 ? 'text-red-500' : 'text-gray-400'}`}>
                    {formData.title.length}/100
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">URL Slug</label>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm mr-2 bg-gray-100 px-3 py-2 rounded-l border">/store/yourstore/</span>
                  <input
                    type="text"
                    className={`flex-1 px-4 py-2 border rounded-r focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.slug && touched.slug ? 'border-red-500' : ''
                    }`}
                    value={formData.slug}
                    onChange={(e) => handleFieldChange('slug', e.target.value.toLowerCase())}
                    onBlur={() => handleFieldBlur('slug')}
                    placeholder="about-us"
                    maxLength="100"
                  />
                </div>
                <p className="text-xs mt-1">
                  {errors.slug && touched.slug ? (
                    <span className="text-red-500">⚠️ {errors.slug}</span>
                  ) : formData.slug ? (
                    <span className="text-green-600">✓ URL: /store/yourstore/{formData.slug}</span>
                  ) : (
                    <span className="text-gray-500">Auto-generated from title if left blank</span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Meta Description (SEO)
                  <span className="text-gray-400 font-normal ml-2">Recommended: 150-160 characters</span>
                </label>
                <textarea
                  className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.meta_description && touched.meta_description ? 'border-yellow-500' : ''
                  }`}
                  rows="3"
                  value={formData.meta_description}
                  onChange={(e) => handleFieldChange('meta_description', e.target.value)}
                  onBlur={() => handleFieldBlur('meta_description')}
                  placeholder="Learn about our company history, mission, and values. We are a leading manufacturer of..."
                  maxLength="160"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs">
                    {errors.meta_description && touched.meta_description ? (
                      <span className="text-yellow-600">💡 {errors.meta_description}</span>
                    ) : formData.meta_description.length >= 150 && formData.meta_description.length <= 160 ? (
                      <span className="text-green-600">✓ Perfect length for SEO!</span>
                    ) : (
                      <span className="text-gray-500">Appears in search engine results</span>
                    )}
                  </p>
                  <span className={`text-xs ${
                    formData.meta_description.length >= 150 && formData.meta_description.length <= 160
                      ? 'text-green-600 font-semibold'
                      : formData.meta_description.length > 160
                      ? 'text-red-500'
                      : 'text-gray-400'
                  }`}>
                    {formData.meta_description.length}/160
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Meta Keywords (SEO)
                  <span className="text-gray-400 font-normal ml-2">Max 10 keywords</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.meta_keywords && touched.meta_keywords ? 'border-yellow-500' : ''
                  }`}
                  value={formData.meta_keywords}
                  onChange={(e) => handleFieldChange('meta_keywords', e.target.value)}
                  onBlur={() => handleFieldBlur('meta_keywords')}
                  placeholder="manufacturing, electronics, supplier, wholesale, B2B"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs">
                    {errors.meta_keywords && touched.meta_keywords ? (
                      <span className="text-yellow-600">💡 {errors.meta_keywords}</span>
                    ) : (
                      <span className="text-gray-500">Comma-separated keywords for search engines</span>
                    )}
                  </p>
                  {formData.meta_keywords && (
                    <span className="text-xs text-gray-400">
                      {formData.meta_keywords.split(',').filter(k => k.trim()).length} keywords
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded">
                <input
                  type="checkbox"
                  id="is_active"
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active" className="ml-3">
                  <span className="text-sm font-medium">Page is active (visible to public)</span>
                  <p className="text-xs text-gray-500">Uncheck to hide this page from your storefront</p>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={Object.keys(errors).length > 0}
                  className={`flex-1 py-3 rounded font-semibold transition ${
                    Object.keys(errors).length > 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {editingPage ? '💾 Update Page' : '✨ Create Page'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
