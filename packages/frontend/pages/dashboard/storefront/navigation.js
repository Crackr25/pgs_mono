import { useState, useEffect } from 'react';
import { storefrontAPI } from '../../../lib/storefront-api';
import { useRouter } from 'next/router';

export default function NavigationBuilder() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    type: 'page',
    target: '',
    show_dropdown: false,
    is_visible: true
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    fetchData();

    // Refetch data when user returns to this tab/window (e.g., after creating a page)
    const handleFocus = () => {
      console.log('Window focused - refreshing navigation data');
      fetchData();
    };

    window.addEventListener('focus', handleFocus);
    
    // Cleanup
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [menuResponse, pagesResponse] = await Promise.all([
        storefrontAPI.getMenuItems(),
        storefrontAPI.getPages()
      ]);
      setMenuItems(menuResponse.data);
      setPages(pagesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading navigation data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      label: '',
      type: 'page',
      target: '',
      show_dropdown: false,
      is_visible: true
    });
    setErrors({});
    setTouched({});
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      label: item.label,
      type: item.type,
      target: item.target,
      show_dropdown: item.show_dropdown,
      is_visible: item.is_visible
    });
    setErrors({});
    setTouched({});
    setShowModal(true);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'label':
        if (!value || value.trim().length === 0) {
          newErrors.label = 'Menu label is required';
        } else if (value.length < 2) {
          newErrors.label = 'Label must be at least 2 characters';
        } else if (value.length > 50) {
          newErrors.label = 'Label must be less than 50 characters';
        } else {
          delete newErrors.label;
        }
        break;

      case 'target':
        if (!value || value.trim().length === 0) {
          newErrors.target = formData.type === 'page' 
            ? 'Please select a page' 
            : formData.type === 'section'
            ? 'Section ID is required'
            : 'URL is required';
        } else if (formData.type === 'external' && !value.startsWith('http')) {
          newErrors.target = 'External URL must start with http:// or https://';
        } else if (formData.type === 'section' && !/^[a-z0-9-]+$/.test(value)) {
          newErrors.target = 'Section ID can only contain lowercase letters, numbers, and hyphens';
        } else {
          delete newErrors.target;
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
    const fieldsToValidate = ['label', 'target'];
    let isValid = true;
    
    fieldsToValidate.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
      setTouched(prev => ({ ...prev, [field]: true }));
    });

    if (!isValid) {
      alert('❌ Please fix the validation errors before submitting');
      return;
    }

    try {
      if (editingItem) {
        await storefrontAPI.updateMenuItem(editingItem.id, formData);
        alert('✅ Menu item updated successfully!');
      } else {
        await storefrontAPI.createMenuItem(formData);
        alert('✅ Menu item created successfully!');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      if (error.response?.data?.errors) {
        const serverErrors = {};
        Object.keys(error.response.data.errors).forEach(key => {
          serverErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(serverErrors);
        alert('❌ Validation error: Please check the form fields');
      } else {
        alert('❌ Error saving menu item: ' + errorMessage);
      }
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      await storefrontAPI.deleteMenuItem(itemId);
      alert('Menu item deleted successfully!');
      fetchData();
    } catch (error) {
      alert('Error deleting menu item: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReorder = async (itemId, direction) => {
    const currentIndex = menuItems.findIndex(item => item.id === itemId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === menuItems.length - 1)
    ) {
      return;
    }

    const newItems = [...menuItems];
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newItems[currentIndex], newItems[newIndex]] = [newItems[newIndex], newItems[currentIndex]];

    // Update sort orders
    const reorderedItems = newItems.map((item, index) => ({
      id: item.id,
      sort_order: index
    }));

    try {
      await storefrontAPI.reorderMenu(reorderedItems);
      setMenuItems(newItems);
    } catch (error) {
      alert('Error reordering menu: ' + (error.response?.data?.message || error.message));
    }
  };

  const getTargetDisplay = (item) => {
    if (item.type === 'page') {
      const page = pages.find(p => p.slug === item.target);
      return page ? `Page: ${page.title}` : item.target;
    } else if (item.type === 'section') {
      return `Section: #${item.target}`;
    } else {
      return `External: ${item.target}`;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'page': return '📄';
      case 'section': return '🔗';
      case 'external': return '🌐';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center">Loading navigation...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">🧭 Navigation Menu Builder</h1>
          <p className="text-gray-600 mt-2">Build your custom navigation menu - Dynamic style!</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2"
        >
          <span>➕</span> Add Menu Item
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-green-900 mb-2">💡 Menu Item Types</h3>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-white rounded p-2">
            <div className="font-semibold text-blue-700">📄 Page</div>
            <div className="text-xs text-gray-600">Link to custom page</div>
          </div>
          <div className="bg-white rounded p-2">
            <div className="font-semibold text-purple-700">🔗 Section</div>
            <div className="text-xs text-gray-600">Scroll to section (#anchor)</div>
          </div>
          <div className="bg-white rounded p-2">
            <div className="font-semibold text-green-700">🌐 External</div>
            <div className="text-xs text-gray-600">External URL</div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      {menuItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🧭</div>
          <h3 className="text-xl font-semibold mb-2">No Menu Items Yet</h3>
          <p className="text-gray-600 mb-6">Create your first menu item to build your navigation!</p>
          <button
            onClick={handleCreate}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
          >
            Add First Menu Item
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <p className="text-sm text-gray-600">
              <strong>Drag & Drop:</strong> Use ↑ ↓ buttons to reorder menu items
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {menuItems.map((item, index) => (
              <div
                key={item.id}
                className="p-4 hover:bg-gray-50 flex items-center gap-4"
              >
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleReorder(item.id, 'up')}
                    disabled={index === 0}
                    className={`px-2 py-1 rounded ${
                      index === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleReorder(item.id, 'down')}
                    disabled={index === menuItems.length - 1}
                    className={`px-2 py-1 rounded ${
                      index === menuItems.length - 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    ↓
                  </button>
                </div>

                {/* Type Icon */}
                <div className="text-2xl">
                  {getTypeIcon(item.type)}
                </div>

                {/* Item Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{item.label}</span>
                    {item.show_dropdown && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                        Dropdown ▼
                      </span>
                    )}
                    {!item.is_visible && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {getTargetDisplay(item)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">
                {editingItem ? '✏️ Edit Menu Item' : '➕ Add Menu Item'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Menu Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.label && touched.label ? 'border-red-500' : ''
                  }`}
                  value={formData.label}
                  onChange={(e) => handleFieldChange('label', e.target.value)}
                  onBlur={() => handleFieldBlur('label')}
                  placeholder="Home, About Us, Products, etc."
                  maxLength="50"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs">
                    {errors.label && touched.label ? (
                      <span className="text-red-500">⚠️ {errors.label}</span>
                    ) : (
                      <span className="text-gray-500">This text will appear in the navigation menu</span>
                    )}
                  </p>
                  <span className={`text-xs ${formData.label.length > 40 ? 'text-red-500' : 'text-gray-400'}`}>
                    {formData.label.length}/50
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Menu Item Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={formData.type}
                  onChange={(e) => {
                    setFormData({ ...formData, type: e.target.value, target: '' });
                    setErrors({});
                  }}
                >
                  <option value="page">📄 Page - Link to a custom page</option>
                  <option value="section">🔗 Section - Scroll to section on page</option>
                  <option value="external">🌐 External - Link to external URL</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.type === 'page' && 'Links to one of your custom pages'}
                  {formData.type === 'section' && 'Scrolls to a specific section on the current page'}
                  {formData.type === 'external' && 'Opens an external website in a new tab'}
                </p>
              </div>

              {formData.type === 'page' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">
                      Select Page <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const pagesResponse = await storefrontAPI.getPages();
                          setPages(pagesResponse.data);
                          alert('✅ Pages list refreshed!');
                        } catch (error) {
                          alert('❌ Error refreshing pages');
                        }
                      }}
                      className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 flex items-center gap-1"
                    >
                      🔄 Refresh Pages
                    </button>
                  </div>
                  <select
                    required
                    className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.target && touched.target ? 'border-red-500' : ''
                    }`}
                    value={formData.target}
                    onChange={(e) => handleFieldChange('target', e.target.value)}
                    onBlur={() => handleFieldBlur('target')}
                  >
                    <option value="">-- Select a page --</option>
                    {pages.map((page) => (
                      <option key={page.id} value={page.slug}>
                        {page.title} (/{page.slug})
                      </option>
                    ))}
                  </select>
                  {pages.length === 0 ? (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ No pages found. Create pages first in Pages Manager.
                    </p>
                  ) : errors.target && touched.target ? (
                    <p className="text-xs text-red-500 mt-1">⚠️ {errors.target}</p>
                  ) : formData.target ? (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Will link to: /store/yourstore/{formData.target}
                    </p>
                  ) : null}
                </div>
              )}

              {formData.type === 'section' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Section ID <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-500 text-lg mr-2">#</span>
                    <input
                      type="text"
                      required
                      className={`flex-1 px-4 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.target && touched.target ? 'border-red-500' : ''
                      }`}
                      value={formData.target}
                      onChange={(e) => handleFieldChange('target', e.target.value.toLowerCase())}
                      onBlur={() => handleFieldBlur('target')}
                      placeholder="products, contact, about"
                    />
                  </div>
                  {errors.target && touched.target ? (
                    <p className="text-xs text-red-500 mt-1">⚠️ {errors.target}</p>
                  ) : formData.target ? (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Will scroll to: #{formData.target}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      Enter section ID without #. Only lowercase letters, numbers, and hyphens.
                    </p>
                  )}
                </div>
              )}

              {formData.type === 'external' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    External URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.target && touched.target ? 'border-red-500' : ''
                    }`}
                    value={formData.target}
                    onChange={(e) => handleFieldChange('target', e.target.value)}
                    onBlur={() => handleFieldBlur('target')}
                    placeholder="https://example.com"
                  />
                  {errors.target && touched.target ? (
                    <p className="text-xs text-red-500 mt-1">⚠️ {errors.target}</p>
                  ) : formData.target && formData.target.startsWith('http') ? (
                    <p className="text-xs text-green-600 mt-1">✓ Valid URL</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Full URL including https://</p>
                  )}
                </div>
              )}

              <div className="flex items-center p-3 bg-gray-50 rounded">
                <input
                  type="checkbox"
                  id="show_dropdown"
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  checked={formData.show_dropdown}
                  onChange={(e) => setFormData({ ...formData, show_dropdown: e.target.checked })}
                />
                <label htmlFor="show_dropdown" className="ml-3">
                  <span className="text-sm font-medium">Show dropdown icon (▼) next to menu item</span>
                  <p className="text-xs text-gray-500">Visual indicator for dropdown menus</p>
                </label>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded">
                <input
                  type="checkbox"
                  id="is_visible"
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  checked={formData.is_visible}
                  onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                />
                <label htmlFor="is_visible" className="ml-3">
                  <span className="text-sm font-medium">Menu item is visible to public</span>
                  <p className="text-xs text-gray-500">Uncheck to hide this item from navigation</p>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={Object.keys(errors).length > 0}
                  className={`flex-1 py-3 rounded font-semibold transition ${
                    Object.keys(errors).length > 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {editingItem ? '💾 Update Menu Item' : '✨ Add Menu Item'}
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
