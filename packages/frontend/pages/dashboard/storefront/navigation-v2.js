import { useState, useEffect } from 'react';
import { storefrontAPI } from '../../../lib/storefront-api';
import { useRouter } from 'next/router';

export default function DynamicMenuBuilder() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  
  const [formData, setFormData] = useState({
    label: '',
    type: 'page',
    target: '',
    parent_id: null,
    sort_order: 0,
    is_visible: true,
    show_dropdown: false,
    embed_company_profile: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    fetchData();
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

  // Build hierarchical menu structure
  const buildMenuTree = (items) => {
    const tree = [];
    const itemMap = {};

    // Create a map of all items
    items.forEach(item => {
      itemMap[item.id] = { ...item, children: [] };
    });

    // Build the tree
    items.forEach(item => {
      if (item.parent_id && itemMap[item.parent_id]) {
        itemMap[item.parent_id].children.push(itemMap[item.id]);
      } else {
        tree.push(itemMap[item.id]);
      }
    });

    return tree;
  };

  const menuTree = buildMenuTree(menuItems);

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      label: '',
      type: 'page',
      target: '',
      parent_id: null,
      sort_order: menuItems.length,
      is_visible: true,
      show_dropdown: false,
      embed_company_profile: false,
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
      parent_id: item.parent_id || null,
      sort_order: item.sort_order,
      is_visible: item.is_visible,
      show_dropdown: item.show_dropdown,
      embed_company_profile: item.embed_company_profile || false,
    });
    setErrors({});
    setTouched({});
    setShowModal(true);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'label':
        if (!value || value.trim().length < 2) {
          newErrors.label = 'Label must be at least 2 characters';
        } else if (value.length > 50) {
          newErrors.label = 'Label must not exceed 50 characters';
        } else {
          delete newErrors.label;
        }
        break;

      case 'target':
        // If embed_company_profile is checked, target becomes optional
        if (formData.embed_company_profile && formData.type === 'page') {
          // Auto-generate a default slug if empty
          if (!value || value.trim() === '') {
            const defaultSlug = formData.label ? formData.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 'company-profile';
            setFormData(prev => ({ ...prev, target: defaultSlug }));
          }
          delete newErrors.target;
        } else if (!value || value.trim() === '') {
          newErrors.target = 'Target is required';
        } else if (formData.type === 'external' && !value.startsWith('http')) {
          newErrors.target = 'External URL must start with http:// or https://';
        } else if (formData.type === 'section' && !/^[a-z0-9-]+$/.test(value)) {
          newErrors.target = 'Section ID must contain only lowercase letters, numbers, and hyphens';
        } else {
          delete newErrors.target;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    let newValue = inputType === 'checkbox' ? checked : value;
    
    // Convert empty string to null for parent_id
    if (name === 'parent_id' && (newValue === '' || newValue === 'null')) {
      newValue = null;
    }
    
    // Convert parent_id to integer if it has a value
    if (name === 'parent_id' && newValue !== null) {
      newValue = parseInt(newValue);
    }
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    if (touched[name]) {
      validateField(name, newValue);
    }
  };

  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Auto-generate target slug if embed_company_profile is checked and target is empty
    if (formData.embed_company_profile && formData.type === 'page' && (!formData.target || formData.target.trim() === '')) {
      const defaultSlug = formData.label ? formData.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 'company-profile';
      setFormData(prev => ({ ...prev, target: defaultSlug }));
      formData.target = defaultSlug;
    }

    // Validate all fields
    const allTouched = {
      label: true,
      target: true,
    };
    setTouched(allTouched);

    const isLabelValid = validateField('label', formData.label);
    const isTargetValid = formData.embed_company_profile && formData.type === 'page' ? true : validateField('target', formData.target);

    if (!isLabelValid || !isTargetValid) {
      alert('❌ Please fix the validation errors before submitting');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        parent_id: formData.parent_id === '' || formData.parent_id === null || formData.parent_id === undefined ? null : parseInt(formData.parent_id)
      };

      if (editingItem) {
        await storefrontAPI.updateMenuItem(editingItem.id, dataToSend);
        alert('✅ Menu item updated successfully!');
      } else {
        await storefrontAPI.createMenuItem(dataToSend);
        alert('✅ Menu item created successfully!');
      }
      
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving menu item:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      
      alert('❌ Error saving menu item: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await storefrontAPI.deleteMenuItem(id);
      alert('Menu item deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Error deleting menu item');
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, item) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(item);
  };

  const handleDrop = async (e, targetItem) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.id === targetItem.id) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    // Check if dropping on itself or its own child
    if (isDescendant(draggedItem, targetItem)) {
      alert('Cannot move a parent into its own child');
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    try {
      // Update parent_id to create nesting
      await storefrontAPI.updateMenuItem(draggedItem.id, {
        ...draggedItem,
        parent_id: targetItem.id
      });
      
      alert('✅ Menu item moved successfully!');
      fetchData();
    } catch (error) {
      console.error('Error moving menu item:', error);
      alert('Error moving menu item');
    }

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const isDescendant = (parent, child) => {
    if (!parent.children) return false;
    return parent.children.some(c => c.id === child.id || isDescendant(c, child));
  };

  const makeTopLevel = async (item) => {
    try {
      await storefrontAPI.updateMenuItem(item.id, {
        ...item,
        parent_id: null
      });
      alert('✅ Menu item moved to top level!');
      fetchData();
    } catch (error) {
      console.error('Error updating menu item:', error);
      alert('Error updating menu item');
    }
  };

  // Render menu item (recursive for children)
  const renderMenuItem = (item, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isDragging = draggedItem?.id === item.id;
    const isDragOver = dragOverItem?.id === item.id;

    return (
      <div key={item.id} className="mb-2">
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, item)}
          onDragOver={(e) => handleDragOver(e, item)}
          onDrop={(e) => handleDrop(e, item)}
          onDragEnd={handleDragEnd}
          className={`
            bg-white border-2 rounded-lg p-4 cursor-move transition-all
            ${isDragging ? 'opacity-50 border-blue-500' : 'border-gray-200'}
            ${isDragOver && !isDragging ? 'border-orange-500 bg-orange-50' : ''}
            hover:border-gray-300 hover:shadow-md
          `}
          style={{ marginLeft: `${depth * 32}px` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              {/* Drag Handle */}
              <div className="flex flex-col space-y-0.5 text-gray-400 cursor-grab active:cursor-grabbing">
                <div className="flex space-x-0.5">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
                <div className="flex space-x-0.5">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
                <div className="flex space-x-0.5">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
              </div>

              {/* Menu Item Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{item.label}</span>
                  {item.parent_id && (
                    <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                      Sub-item
                    </span>
                  )}
                  {hasChildren && (
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                      {item.children.length} {item.children.length === 1 ? 'child' : 'children'}
                    </span>
                  )}
                  {item.show_dropdown && (
                    <span className="text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium mr-2">
                    {item.type}
                  </span>
                  <span className="text-gray-600">{item.target}</span>
                </div>
              </div>

              {/* Visibility Status */}
              {!item.is_visible && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                  Hidden
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {item.parent_id && (
                <button
                  onClick={() => makeTopLevel(item)}
                  className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition"
                  title="Move to top level"
                >
                  ↑ Top Level
                </button>
              )}
              <button
                onClick={() => handleEdit(item)}
                className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Render children */}
        {hasChildren && (
          <div className="mt-2">
            {item.children.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Navigation Menu Builder</h1>
              <p className="text-gray-600">
                Dynamic-style menu builder - drag items to nest them as sub-menus
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/storefront')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              ← Back to Storefront
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800 flex-1">
              <p className="font-semibold mb-2">💡 How to create submenus (nested items):</p>
              <div className="space-y-2 ml-2">
                <div className="flex items-start gap-2">
                  <span className="font-bold">Method 1:</span>
                  <span><strong>Drag & Drop</strong> - Drag any menu item and drop it onto another item to make it a submenu</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold">Method 2:</span>
                  <span><strong>Use Parent Selector</strong> - When creating/editing an item, select a "Parent Menu Item"</span>
                </div>
                <div className="bg-white border border-blue-200 rounded p-2 mt-2">
                  <p className="font-semibold text-xs mb-1">Example:</p>
                  <p className="text-xs">
                    1. Create "Products" menu (parent)<br/>
                    2. Create "Electronics" menu → Select "Products" as parent → Becomes submenu!<br/>
                    3. Create "Clothing" menu → Select "Products" as parent → Another submenu!
                  </p>
                  <p className="text-xs mt-1 text-blue-700">
                    Result: <strong>Products ▼</strong> (with Electronics, Clothing underneath)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Menu Item Button */}
        <div className="mb-6">
          <button
            onClick={handleCreate}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Menu Item</span>
          </button>
        </div>

        {/* Menu Items List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Menu Structure ({menuItems.length} items)
          </h2>

          {menuTree.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <p className="text-lg mb-2">No menu items yet</p>
              <p className="text-sm">Click "Add Menu Item" above to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {menuTree.map(item => renderMenuItem(item))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingItem ? 'Edit Menu Item' : 'Create Menu Item'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Label */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Menu Label <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="label"
                      value={formData.label}
                      onChange={handleFieldChange}
                      onBlur={handleFieldBlur}
                      className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none transition ${
                        touched.label && errors.label
                          ? 'border-red-300 focus:border-red-500'
                          : touched.label && !errors.label
                          ? 'border-green-300 focus:border-green-500'
                          : 'border-gray-200 focus:border-orange-500'
                      }`}
                      placeholder="e.g., About Us"
                    />
                    {touched.label && !errors.label && (
                      <div className="absolute right-3 top-3 text-green-500">✓</div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div>
                      {touched.label && errors.label && (
                        <p className="text-sm text-red-600">⚠️ {errors.label}</p>
                      )}
                    </div>
                    <p className={`text-xs ${
                      formData.label.length > 50 ? 'text-red-500' :
                      formData.label.length > 40 ? 'text-yellow-600' : 'text-gray-500'
                    }`}>
                      {formData.label.length}/50
                    </p>
                  </div>
                </div>

                {/* Parent Menu */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Parent Menu Item (Optional)
                  </label>
                  
                  <select
                    name="parent_id"
                    value={formData.parent_id === null ? '' : String(formData.parent_id)}
                    onChange={handleFieldChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition"
                  >
                    <option value="">None (Top Level)</option>
                    {menuItems
                      .filter(item => {
                        // Don't show the item itself as an option
                        if (editingItem && item.id === editingItem.id) return false;
                        // Don't show items that are already children of this item (prevent circular reference)
                        if (editingItem && item.parent_id === editingItem.id) return false;
                        return true;
                      })
                      .map(item => (
                        <option key={item.id} value={item.id}>
                          {item.parent_id ? '  └─ ' : ''}{item.label} ({item.type})
                        </option>
                      ))}
                  </select>
                  <div className="flex items-start gap-2 mt-2">
                    {formData.parent_id ? (
                      <p className="text-xs text-purple-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        This will be a <strong>submenu</strong> under "{menuItems.find(m => m.id == formData.parent_id)?.label}"
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                        </svg>
                        This will be a <strong>top-level</strong> menu item (not a submenu)
                      </p>
                    )}
                  </div>
                  {editingItem && (
                    <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2">
                      <p className="text-xs text-blue-700">
                        💡 <strong>Tip:</strong> To create items <em>under</em> "{editingItem.label}", create a new menu item and select "{editingItem.label}" as parent.
                      </p>
                    </div>
                  )}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Link Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['page', 'section', 'external'].map(type => (
                      <label
                        key={type}
                        className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition ${
                          formData.type === type
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={type}
                          checked={formData.type === type}
                          onChange={handleFieldChange}
                          className="sr-only"
                        />
                        <span className="font-medium capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Target */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {formData.type === 'page' ? 'Select Page' :
                     formData.type === 'section' ? 'Section ID' : 'External URL'}
                    {!(formData.embed_company_profile && formData.type === 'page') && (
                      <span className="text-red-500">*</span>
                    )}
                    {formData.embed_company_profile && formData.type === 'page' && (
                      <span className="text-purple-600 text-xs ml-2">(Optional - auto-generated from label)</span>
                    )}
                  </label>

                  {formData.type === 'page' ? (
                    <select
                      name="target"
                      value={formData.target}
                      onChange={handleFieldChange}
                      onBlur={handleFieldBlur}
                      className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none transition ${
                        touched.target && errors.target
                          ? 'border-red-300 focus:border-red-500'
                          : touched.target && !errors.target
                          ? 'border-green-300 focus:border-green-500'
                          : 'border-gray-200 focus:border-orange-500'
                      }`}
                    >
                      <option value="">Select a page...</option>
                      {pages.map(page => (
                        <option key={page.id} value={page.slug}>
                          {page.title} ({page.slug})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        name="target"
                        value={formData.target}
                        onChange={handleFieldChange}
                        onBlur={handleFieldBlur}
                        className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none transition ${
                          touched.target && errors.target
                            ? 'border-red-300 focus:border-red-500'
                            : touched.target && !errors.target
                            ? 'border-green-300 focus:border-green-500'
                            : 'border-gray-200 focus:border-orange-500'
                        }`}
                        placeholder={
                          formData.type === 'section'
                            ? 'e.g., products, about-us, contact'
                            : 'e.g., https://example.com'
                        }
                      />
                      {touched.target && !errors.target && formData.target && (
                        <div className="absolute right-3 top-3 text-green-500">✓</div>
                      )}
                    </div>
                  )}

                  {touched.target && errors.target && (
                    <p className="text-sm text-red-600 mt-1">⚠️ {errors.target}</p>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.type === 'page' && !formData.embed_company_profile && 'Choose from your created pages'}
                    {formData.type === 'page' && formData.embed_company_profile && '✨ Leave empty to auto-generate URL from label (e.g., "Company Profile" → "company-profile")'}
                    {formData.type === 'section' && 'Lowercase, numbers, and hyphens only (e.g., products, about-us)'}
                    {formData.type === 'external' && 'Full URL including http:// or https://'}
                  </p>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      name="show_dropdown"
                      checked={formData.show_dropdown}
                      onChange={handleFieldChange}
                      className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Show Dropdown Icon</span>
                      <p className="text-xs text-gray-500">Display a ▼ arrow next to this menu item</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      name="is_visible"
                      checked={formData.is_visible}
                      onChange={handleFieldChange}
                      className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Visible</span>
                      <p className="text-xs text-gray-500">Show this menu item on the public storefront</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border-2 border-purple-200 rounded-lg hover:bg-purple-50 cursor-pointer transition bg-purple-50">
                    <input
                      type="checkbox"
                      name="embed_company_profile"
                      checked={formData.embed_company_profile}
                      onChange={handleFieldChange}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-purple-900 flex items-center gap-2">
                        🏢 Embed Company Profile
                        <span className="px-2 py-0.5 text-xs bg-purple-600 text-white rounded-full">NEW</span>
                      </span>
                      <p className="text-xs text-purple-700">Load supplier profile page design (like ANRABESS) when this menu is clicked</p>
                    </div>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={Object.keys(errors).length > 0}
                    className={`px-6 py-2.5 rounded-lg transition font-medium ${
                      Object.keys(errors).length > 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {editingItem ? 'Update' : 'Create'} Menu Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
