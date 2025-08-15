import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useLanguage } from '../hooks/useLanguage';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    user_type: 'seller'
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { login, register, error, clearError, isAuthenticated } = useAuth();
  const { translate } = useLanguage();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

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
        router.push('/');
      } else {
        await register(formData);
        router.push('/');
      }
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
    <>
      <Head>
        <title>{mode === 'login' ? 'Login' : 'Register'} - PSG</title>
        <meta name="description" content="Access your PSG account" />
      </Head>

      <div className="min-h-screen bg-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <h1 className="text-3xl font-bold text-primary-600">PSG</h1>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={switchMode}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={switchMode}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-secondary-300 rounded-md placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 border border-secondary-300 rounded-md placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 pr-10 border border-secondary-300 rounded-md placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-secondary-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-secondary-400" />
                    )}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <>
                  <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-secondary-700">
                      Confirm Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="password_confirmation"
                        name="password_confirmation"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.password_confirmation}
                        onChange={handleInputChange}
                        className="appearance-none block w-full px-3 py-2 pr-10 border border-secondary-300 rounded-md placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-secondary-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-secondary-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="user_type" className="block text-sm font-medium text-secondary-700">
                      Account Type
                    </label>
                    <div className="mt-1">
                      <select
                        id="user_type"
                        name="user_type"
                        value={formData.user_type}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="seller">Seller</option>
                        <option value="buyer">Buyer</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-900">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                      Forgot your password?
                    </a>
                  </div>
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {mode === 'login' ? (
                        <LogIn className="h-4 w-4 mr-2" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      {mode === 'login' ? 'Sign in' : 'Create account'}
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
