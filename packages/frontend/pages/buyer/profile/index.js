import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Edit, 
  Save, 
  X,
  Upload,
  Camera,
  Users,
  Calendar,
  Award,
  TrendingUp
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../contexts/AuthContext';
import apiService from '../../../lib/api';

export default function BuyerProfile() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    // Company Information
    company_name: '',
    company_description: '',
    company_logo: null,
    industry: '',
    company_size: '',
    established_year: '',
    website: '',
    
    // Contact Information
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Philippines',
    postal_code: '',
    
    // Business Information
    business_type: '',
    annual_revenue: '',
    procurement_budget: '',
    preferred_suppliers: [],
    certifications: [],
    
    // Preferences
    preferred_categories: [],
    preferred_locations: [],
    payment_terms: '',
    delivery_preferences: '',
    quality_requirements: '',
    
    // Statistics (read-only)
    total_orders: 0,
    total_spent: 0,
    active_rfqs: 0,
    supplier_relationships: 0,
    member_since: ''
  });

  const industries = [
    'Manufacturing',
    'Construction',
    'Retail',
    'Healthcare',
    'Technology',
    'Food & Beverage',
    'Automotive',
    'Textiles',
    'Electronics',
    'Agriculture',
    'Other'
  ];

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ];

  const businessTypes = [
    'Manufacturer',
    'Distributor',
    'Retailer',
    'Service Provider',
    'Government',
    'Non-Profit',
    'Other'
  ];

  const categories = [
    'Electronics & Electrical',
    'Industrial Equipment',
    'Construction Materials',
    'Textiles & Apparel',
    'Automotive Parts',
    'Furniture & Home Decor',
    'Medical & Healthcare',
    'Agriculture & Farming'
  ];

  const locations = [
    'Metro Manila',
    'Cebu',
    'Davao',
    'Iloilo',
    'Cagayan de Oro',
    'Bacolod',
    'General Santos',
    'Zamboanga',
    'Baguio',
    'Batangas'
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileData();
    }
  }, [isAuthenticated]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for now - replace with actual API calls
      const mockProfile = {
        company_name: 'ABC Trading Corporation',
        company_description: 'Leading procurement company specializing in industrial equipment and construction materials for large-scale projects across the Philippines.',
        company_logo: null,
        industry: 'Manufacturing',
        company_size: '201-500 employees',
        established_year: '2015',
        website: 'www.abctrading.com',
        
        contact_person: 'John Smith',
        email: 'john.smith@abctrading.com',
        phone: '+63 2 8123 4567',
        address: '123 Business District',
        city: 'Makati City',
        state: 'Metro Manila',
        country: 'Philippines',
        postal_code: '1200',
        
        business_type: 'Distributor',
        annual_revenue: '$5M - $10M',
        procurement_budget: '$2M - $5M',
        preferred_suppliers: ['Manila Manufacturing Corp', 'Cebu Industrial Solutions'],
        certifications: ['ISO 9001', 'DTI Registered'],
        
        preferred_categories: ['Industrial Equipment', 'Construction Materials'],
        preferred_locations: ['Metro Manila', 'Cebu', 'Davao'],
        payment_terms: '30% advance, 70% on delivery',
        delivery_preferences: 'Door-to-door delivery preferred',
        quality_requirements: 'All products must meet international quality standards',
        
        total_orders: 156,
        total_spent: 2450000,
        active_rfqs: 12,
        supplier_relationships: 45,
        member_since: '2023-01-15T00:00:00Z'
      };

      setProfileData(mockProfile);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // Mock API call - replace with actual API
      console.log('Saving profile data:', profileData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfileData(); // Reset to original data
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Buyer Profile - Buyer Portal</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Company Profile</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Manage your company information and preferences
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleCancel} disabled={saving}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-red-800 text-sm">{error}</p>
          </Card>
        )}

        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Orders</p>
                <p className="text-2xl font-bold text-secondary-900">{profileData.total_orders}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Spent</p>
                <p className="text-2xl font-bold text-secondary-900">{formatCurrency(profileData.total_spent)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Active RFQs</p>
                <p className="text-2xl font-bold text-secondary-900">{profileData.active_rfqs}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Suppliers</p>
                <p className="text-2xl font-bold text-secondary-900">{profileData.supplier_relationships}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Company Information */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-secondary-900 mb-4">Company Information</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Company Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="company_name"
                    value={profileData.company_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-secondary-900">{profileData.company_name}</p>
                )}
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Company Description
                </label>
                {isEditing ? (
                  <textarea
                    name="company_description"
                    value={profileData.company_description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-secondary-900">{profileData.company_description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Industry
                </label>
                {isEditing ? (
                  <select
                    name="industry"
                    value={profileData.industry}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Industry</option>
                    {industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-secondary-900">{profileData.industry}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Company Size
                </label>
                {isEditing ? (
                  <select
                    name="company_size"
                    value={profileData.company_size}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Size</option>
                    {companySizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-secondary-900">{profileData.company_size}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Established Year
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="established_year"
                    value={profileData.established_year}
                    onChange={handleInputChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-secondary-900">{profileData.established_year}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Website
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    name="website"
                    value={profileData.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-secondary-900">{profileData.website}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-secondary-900 mb-4">Contact Information</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Contact Person
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="contact_person"
                    value={profileData.contact_person}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-secondary-900">{profileData.contact_person}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-secondary-900">{profileData.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-secondary-900">{profileData.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Business Type
                </label>
                {isEditing ? (
                  <select
                    name="business_type"
                    value={profileData.business_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Type</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-secondary-900">{profileData.business_type}</p>
                )}
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-secondary-900">{profileData.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  City
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={profileData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-secondary-900">{profileData.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  State/Province
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="state"
                    value={profileData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-secondary-900">{profileData.state}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Procurement Preferences */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-secondary-900 mb-4">Procurement Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Preferred Categories
                </label>
                {isEditing ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {categories.map(category => (
                      <label key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={profileData.preferred_categories.includes(category)}
                          onChange={() => handleArrayChange('preferred_categories', category)}
                          className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-secondary-700">{category}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileData.preferred_categories.map(category => (
                      <span key={category} className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Preferred Supplier Locations
                </label>
                {isEditing ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {locations.map(location => (
                      <label key={location} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={profileData.preferred_locations.includes(location)}
                          onChange={() => handleArrayChange('preferred_locations', location)}
                          className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-secondary-700">{location}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileData.preferred_locations.map(location => (
                      <span key={location} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                        {location}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Payment Terms
                  </label>
                  {isEditing ? (
                    <textarea
                      name="payment_terms"
                      value={profileData.payment_terms}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-secondary-900">{profileData.payment_terms}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Delivery Preferences
                  </label>
                  {isEditing ? (
                    <textarea
                      name="delivery_preferences"
                      value={profileData.delivery_preferences}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-secondary-900">{profileData.delivery_preferences}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Quality Requirements
                </label>
                {isEditing ? (
                  <textarea
                    name="quality_requirements"
                    value={profileData.quality_requirements}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-secondary-900">{profileData.quality_requirements}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Account Information */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-secondary-900 mb-4">Account Information</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-secondary-600">Member Since</p>
                <p className="text-secondary-900">{formatDate(profileData.member_since)}</p>
              </div>
              
              <div>
                <p className="text-sm text-secondary-600">Account Status</p>
                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                  <Award className="w-3 h-3 mr-1" />
                  Verified Buyer
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
