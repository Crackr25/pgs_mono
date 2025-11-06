import { useState, useEffect } from 'react';
import { X, MapPin, Plus, Edit, Trash2, Check } from 'lucide-react';
import Button from '../common/Button';
import apiService from '../../lib/api';

export default function ShippingAddressModal({ 
  isOpen, 
  onClose, 
  onSelectAddress, 
  selectedAddressId = null 
}) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    label: '',
    first_name: '',
    last_name: '',
    company: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'Philippines',
    phone: '',
    email: '',
    is_default: false
  });

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
    }
  }, [isOpen]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await apiService.getShippingAddresses();
      if (response.success) {
        setAddresses(response.data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      first_name: '',
      last_name: '',
      company: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'Philippines',
      phone: '',
      email: '',
      is_default: false
    });
    setErrors({});
    setEditingAddress(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (address) => {
    setFormData({
      label: address.label || '',
      first_name: address.first_name,
      last_name: address.last_name,
      company: address.company || '',
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
      country: address.country,
      phone: address.phone,
      email: address.email,
      is_default: address.is_default
    });
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      let response;
      if (editingAddress) {
        response = await apiService.updateShippingAddress(editingAddress.id, formData);
      } else {
        response = await apiService.createShippingAddress(formData);
      }

      if (response.success) {
        await fetchAddresses();
        setShowForm(false);
        resetForm();
      } else {
        setErrors(response.errors || {});
      }
    } catch (error) {
      console.error('Error saving address:', error);
      setErrors({ general: 'Failed to save address. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await apiService.deleteShippingAddress(addressId);
      if (response.success) {
        await fetchAddresses();
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const response = await apiService.setDefaultShippingAddress(addressId);
      if (response.success) {
        await fetchAddresses();
      }
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const handleSelectAndClose = (address) => {
    onSelectAddress(address);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {showForm ? (editingAddress ? 'Edit Address' : 'Add New Address') : 'Select Shipping Address'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {!showForm ? (
            /* Address List */
            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No saved addresses</h3>
                      <p className="text-gray-600 mb-6">Add your first shipping address to get started.</p>
                      <Button onClick={handleAddNew} className="bg-primary-600 hover:bg-primary-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Address
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Saved Addresses</h3>
                        <Button onClick={handleAddNew} className="bg-primary-600 hover:bg-primary-700 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Add New
                        </Button>
                      </div>

                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedAddressId === address.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleSelectAndClose(address)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {address.label && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                    {address.label}
                                  </span>
                                )}
                                {address.is_default && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                    <Check className="w-3 h-3 mr-1" />
                                    Default
                                  </span>
                                )}
                              </div>
                              <h4 className="font-medium text-gray-900">
                                {address.first_name} {address.last_name}
                              </h4>
                              {address.company && (
                                <p className="text-sm text-gray-600">{address.company}</p>
                              )}
                              <p className="text-sm text-gray-600 mt-1">
                                {address.address_line_1}
                                {address.address_line_2 && `, ${address.address_line_2}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {address.city}, {address.state} {address.zip_code}
                              </p>
                              <p className="text-sm text-gray-600">{address.phone}</p>
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                              {selectedAddressId === address.id && (
                                <Check className="w-5 h-5 text-primary-600" />
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(address);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {!address.is_default && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(address.id);
                                  }}
                                  className="text-gray-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {!address.is_default && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetDefault(address.id);
                                }}
                                className="text-sm text-primary-600 hover:text-primary-700"
                              >
                                Set as default
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* Address Form */
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Label (Optional)
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({...formData, label: e.target.value})}
                  placeholder="e.g., Home, Office, Warehouse"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.first_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name[0]}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.last_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name[0]}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company (Optional)
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  value={formData.address_line_1}
                  onChange={(e) => setFormData({...formData, address_line_1: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.address_line_1 ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.address_line_1 && <p className="text-red-500 text-xs mt-1">{errors.address_line_1[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={formData.address_line_2}
                  onChange={(e) => setFormData({...formData, address_line_2: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.city ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city[0]}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.state ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state[0]}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.zip_code ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.zip_code && <p className="text-red-500 text-xs mt-1">{errors.zip_code[0]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone[0]}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Set as default address</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    editingAddress ? 'Update Address' : 'Save Address'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
