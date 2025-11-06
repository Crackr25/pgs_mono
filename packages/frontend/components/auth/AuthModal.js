import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../common/Modal';
import Button from '../common/Button';

const AuthModal = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const [mode, setMode] = useState(defaultMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    user_type: 'seller'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, error, clearError } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      if (mode === 'login') {
        await login({
          email: formData.email,
          password: formData.password
        });
      } else {
        await register(formData);
      }
      onClose();
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    clearError();
    setFormData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      user_type: 'seller'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'login' ? 'Login' : 'Register'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {mode === 'register' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <select
                name="user_type"
                value={formData.user_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="seller">Seller/Manufacturer</option>
                <option value="buyer">Buyer</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleInputChange}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Register')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>

        <div className="text-center pt-4 border-t">
          <p className="text-sm text-gray-600">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={switchMode}
              className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
            >
              {mode === 'login' ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </form>
    </Modal>
  );
};

export default AuthModal;
