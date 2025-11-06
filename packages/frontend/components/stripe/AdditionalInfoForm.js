import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import apiService from '../../lib/api';
import { AlertCircle, CheckCircle, User, CreditCard, MapPin } from 'lucide-react';

const AdditionalInfoForm = ({ accountStatus, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requirements, setRequirements] = useState(null);
  const [formData, setFormData] = useState({
    // Individual/Representative information
    ssn_last_4: '',
    ssn_full: '',
    id_number: '',
    // Address information
    address: {
      line1: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US'
    },
    // Date of birth
    dob: {
      day: '',
      month: '',
      year: ''
    },
    // Additional fields
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchAccountRequirements();
  }, []);

  const fetchAccountRequirements = async () => {
    try {
      setLoading(true);
      const response = await apiService.request('/stripe/account-requirements');
      if (response.success) {
        setRequirements(response);
      }
    } catch (error) {
      console.error('Failed to fetch requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare the update data
      const updateData = {};

      // Add individual information if provided
      const individualData = {};
      if (formData.ssn_last_4) individualData.ssn_last_4 = formData.ssn_last_4;
      if (formData.ssn_full) individualData.ssn_full = formData.ssn_full;
      if (formData.id_number) individualData.id_number = formData.id_number;
      if (formData.phone) individualData.phone = formData.phone;
      if (formData.email) individualData.email = formData.email;

      // Add address if provided
      if (formData.address.line1) {
        individualData.address = formData.address;
      }

      // Add date of birth if provided
      if (formData.dob.day && formData.dob.month && formData.dob.year) {
        individualData.dob = {
          day: parseInt(formData.dob.day),
          month: parseInt(formData.dob.month),
          year: parseInt(formData.dob.year)
        };
      }

      if (Object.keys(individualData).length > 0) {
        updateData.individual = individualData;
      }

      const response = await apiService.request('/stripe/update-additional-info', {
        method: 'PUT',
        data: updateData
      });

      if (response.success) {
        setSuccess('Account information updated successfully!');
        setFormData({
          ssn_last_4: '',
          ssn_full: '',
          id_number: '',
          address: { line1: '', city: '', state: '', postal_code: '', country: 'US' },
          dob: { day: '', month: '', year: '' },
          phone: '',
          email: ''
        });
        
        // Refresh account status
        if (onUpdate) onUpdate();
        
        // Refresh requirements
        setTimeout(fetchAccountRequirements, 1000);
      } else {
        setError(response.message || 'Failed to update account information');
      }
    } catch (error) {
      setError(error.message || 'Failed to update account information');
    } finally {
      setLoading(false);
    }
  };

  const getRequiredFields = () => {
    if (!requirements || !requirements.requirements) return [];
    
    const allRequired = [
      ...(requirements.requirements.currently_due || []),
      ...(requirements.requirements.past_due || [])
    ];
    
    return allRequired;
  };

  const isFieldRequired = (fieldName) => {
    const requiredFields = getRequiredFields();
    return requiredFields.some(field => field.includes(fieldName));
  };

  const requiredFields = getRequiredFields();

  if (loading && !requirements) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2">Loading requirements...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Requirements Status */}
      {requirements && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Account Requirements Status</h4>
          
          {requiredFields.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center text-amber-600">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {requiredFields.length} field(s) required for verification
                </span>
              </div>
              <div className="text-xs text-gray-600">
                Required: {requiredFields.join(', ')}
              </div>
            </div>
          ) : (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">All requirements satisfied</span>
            </div>
          )}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center text-green-800">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">{success}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center text-red-800">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium">Representative Information</h3>
          </div>
          <p className="text-sm text-gray-600">
            Information for the company representative or business owner who will be responsible for this account.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SSN Last 4 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SSN Last 4 Digits {isFieldRequired('ssn_last_4') && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={formData.ssn_last_4}
                onChange={(e) => handleInputChange('ssn_last_4', e.target.value)}
                placeholder="1234"
                maxLength="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Only the last 4 digits of your Social Security Number
              </p>
            </div>

            {/* Full SSN (if required) */}
            {isFieldRequired('ssn_full') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full SSN <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.ssn_full}
                  onChange={(e) => handleInputChange('ssn_full', e.target.value)}
                  placeholder="123-45-6789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Full Social Security Number (securely encrypted)
                </p>
              </div>
            )}

            {/* ID Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Number {isFieldRequired('id_number') && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={formData.id_number}
                onChange={(e) => handleInputChange('id_number', e.target.value)}
                placeholder="Driver's License or State ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number {isFieldRequired('phone') && <span className="text-red-500">*</span>}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1234567890"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth {isFieldRequired('dob') && <span className="text-red-500">*</span>}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={formData.dob.month}
                onChange={(e) => handleInputChange('dob.month', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Month</option>
                {Array.from({length: 12}, (_, i) => (
                  <option key={i+1} value={i+1}>{i+1}</option>
                ))}
              </select>
              <select
                value={formData.dob.day}
                onChange={(e) => handleInputChange('dob.day', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Day</option>
                {Array.from({length: 31}, (_, i) => (
                  <option key={i+1} value={i+1}>{i+1}</option>
                ))}
              </select>
              <select
                value={formData.dob.year}
                onChange={(e) => handleInputChange('dob.year', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Year</option>
                {Array.from({length: 80}, (_, i) => {
                  const year = new Date().getFullYear() - 18 - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium">Address Information</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address {isFieldRequired('address') && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={formData.address.line1}
                onChange={(e) => handleInputChange('address.line1', e.target.value)}
                placeholder="123 Main Street"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  placeholder="New York"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  placeholder="NY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
              <input
                type="text"
                value={formData.address.postal_code}
                onChange={(e) => handleInputChange('address.postal_code', e.target.value)}
                placeholder="10001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Updating Information...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Update Account Information
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdditionalInfoForm;
