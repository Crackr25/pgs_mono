import { useState, useEffect } from 'react';
import { storefrontAPI, getImageUrl } from '../../../lib/storefront-api';
import { useRouter } from 'next/router';

export default function StorefrontBuilder() {
  const router = useRouter();
  const [storefront, setStorefront] = useState(null);
  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState([]);
  const [formData, setFormData] = useState({
    tagline: '',
    about_us: '',
    primary_color: '#FF6600',
    secondary_color: '#000000',
    accent_color: '#333333',
    theme_id: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStorefront();
    fetchThemes();
  }, []);

  const fetchStorefront = async () => {
    try {
      console.log('Fetching storefront...');
      const response = await storefrontAPI.getMyStorefront();
      console.log('Storefront response:', response);
      console.log('Storefront data:', response.data);
      
      // Check if storefront exists and has an ID
      if (response.data && response.data.id) {
        setStorefront(response.data);
        setFormData({
          tagline: response.data.tagline || '',
          about_us: response.data.about_us || '',
          primary_color: response.data.primary_color,
          secondary_color: response.data.secondary_color,
          accent_color: response.data.accent_color,
          theme_id: response.data.theme_id,
        });
      } else {
        console.log('No storefront found (data is null or empty)');
        setStorefront(null);
      }
    } catch (error) {
      console.error('Error fetching storefront:', error);
      console.error('Error response:', error.response);
    } finally {
      setLoading(false);
    }
  };

  const fetchThemes = async () => {
    try {
      const response = await storefrontAPI.getThemes();
      setThemes(response.data);
    } catch (error) {
      console.error('Error fetching themes:', error);
    }
  };

  const handleCreate = async () => {
    try {
      setSaving(true);
      const response = await storefrontAPI.createStorefront(formData);
      console.log('Created storefront:', response.data);
      
      // Set storefront immediately with response data
      if (response.data && response.data.id) {
        setStorefront(response.data);
        setFormData({
          tagline: response.data.tagline || '',
          about_us: response.data.about_us || '',
          primary_color: response.data.primary_color,
          secondary_color: response.data.secondary_color,
          accent_color: response.data.accent_color,
          theme_id: response.data.theme_id,
        });
      }
      
      alert('Storefront created successfully!');
    } catch (error) {
      console.error('Error creating storefront:', error);
      alert('Error creating storefront: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const response = await storefrontAPI.updateStorefront(storefront.id, formData);
      setStorefront(response.data);
      alert('Storefront updated successfully!');
    } catch (error) {
      alert('Error updating storefront: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Storefront Builder</h1>

      {!storefront ? (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold mb-4">Create Your Storefront</h2>
          <p className="text-gray-600 mb-6">Set up your company's custom storefront to showcase your products and brand.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tagline</label>
              <input 
                type="text"
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.tagline}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
                placeholder="Your company's tagline"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">About Us</label>
              <textarea 
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
                value={formData.about_us}
                onChange={(e) => handleInputChange('about_us', e.target.value)}
                placeholder="Tell customers about your company"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Primary Color</label>
                <input 
                  type="color"
                  className="w-full h-12 border rounded cursor-pointer"
                  value={formData.primary_color}
                  onChange={(e) => handleInputChange('primary_color', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Secondary Color</label>
                <input 
                  type="color"
                  className="w-full h-12 border rounded cursor-pointer"
                  value={formData.secondary_color}
                  onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Accent Color</label>
                <input 
                  type="color"
                  className="w-full h-12 border rounded cursor-pointer"
                  value={formData.accent_color}
                  onChange={(e) => handleInputChange('accent_color', e.target.value)}
                />
              </div>
            </div>

            {themes.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <select
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.theme_id || ''}
                  onChange={(e) => handleInputChange('theme_id', e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">No theme (custom)</option>
                  {themes.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name} - {theme.description}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button 
              onClick={handleCreate}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : 'Create Storefront'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Storefront URL */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">Your storefront is live at:</p>
            <div className="flex items-center gap-3">
              <a 
                href={`/store/${storefront.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-blue-600 hover:underline break-all flex-1"
              >
                {typeof window !== 'undefined' ? window.location.origin : ''}/store/{storefront.slug}
              </a>
              <a 
                href={`/store/${storefront.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition whitespace-nowrap"
              >
                🔗 Visit Store
              </a>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Storefront Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tagline</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">About Us</label>
                <textarea 
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  value={formData.about_us}
                  onChange={(e) => handleInputChange('about_us', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Color</label>
                  <input 
                    type="color"
                    className="w-full h-12 border rounded cursor-pointer"
                    value={formData.primary_color}
                    onChange={(e) => handleInputChange('primary_color', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Secondary Color</label>
                  <input 
                    type="color"
                    className="w-full h-12 border rounded cursor-pointer"
                    value={formData.secondary_color}
                    onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Accent Color</label>
                  <input 
                    type="color"
                    className="w-full h-12 border rounded cursor-pointer"
                    value={formData.accent_color}
                    onChange={(e) => handleInputChange('accent_color', e.target.value)}
                  />
                </div>
              </div>

              {themes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <select
                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.theme_id || ''}
                    onChange={(e) => handleInputChange('theme_id', e.target.value ? parseInt(e.target.value) : null)}
                  >
                    <option value="">No theme (custom)</option>
                    {themes.map((theme) => (
                      <option key={theme.id} value={theme.id}>
                        {theme.name} - {theme.description}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button 
                onClick={handleUpdate}
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Dynamic-Style Management */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">📄 Dynamic-Style Page Management</h3>
            <p className="text-gray-600 mb-4">
              Create custom pages, build navigation menus, and add content sections - just like Dynamic!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pages Manager */}
              <div className="border-2 border-blue-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition bg-gradient-to-br from-blue-50 to-white">
                <div className="text-5xl mb-3">📝</div>
                <h4 className="font-bold text-xl mb-2 text-gray-900">Pages Manager</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Create custom pages (Home, About, Contact, etc.) then use Page Builder to add content
                </p>
                <button 
                  onClick={() => router.push('/dashboard/storefront/pages')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  📄 Manage Pages
                </button>
              </div>

              {/* Navigation Builder */}
              <div className="border-2 border-green-200 rounded-lg p-6 hover:border-green-500 hover:shadow-lg transition bg-gradient-to-br from-green-50 to-white">
                <div className="text-5xl mb-3">🧭</div>
                <h4 className="font-bold text-xl mb-2 text-gray-900">Navigation Menu Builder</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Dynamic-style menu with drag & drop submenus
                </p>
                <button 
                  onClick={() => router.push('/dashboard/storefront/navigation-v2')}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-green-800 font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  ✨ Build Dynamic Menu
                </button>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 font-medium mb-2">
                📚 <strong>How it works:</strong>
              </p>
              <ol className="text-sm text-yellow-800 space-y-1 ml-4">
                <li><strong>1.</strong> Create pages → <strong>2.</strong> Add sections using Page Builder → <strong>3.</strong> Build navigation menu → <strong>4.</strong> Done! 🚀</li>
              </ol>
            </div>
          </div>

          {/* Preview Button */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Preview Storefront</h3>
            <a
              href={`/store/${storefront.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
            >
              View Live Storefront
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
