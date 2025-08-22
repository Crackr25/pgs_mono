import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, UserPlus, ShoppingCart, Store } from 'lucide-react';
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
    usertype: 'buyer'
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
      usertype: 'buyer'
    });
  };

  return (
    <>
      <Head>
        <title>{mode === 'login' ? 'Login' : 'Register'} - PSG</title>
        <meta name="description" content="Access your PSG account" />
      </Head>

      <div className="min-h-screen relative overflow-hidden">
        {/* Clean Background with Color Palette */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0046ad] via-[#0046ad] to-[#003d99]">
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), 
                               radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`
            }}></div>
          </div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* Logo and Header */}
            <div className="text-center">
              <div className="mx-auto h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-2xl mb-6 p-2">
                <img 
                  src="/pgs2.png" 
                  alt="Pinoy Global Supply Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Pinoy Global Supply
              </h1>
              <h2 className="text-xl font-semibold text-white/90 mb-4">
                {mode === 'login' ? 'Welcome Back' : 'Join Our Community'}
              </h2>
            </div>

            {/* Login Form Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                    <div className="text-sm text-red-700 font-medium">{error}</div>
                  </div>
                )}

                {mode === 'register' && (
                  <>
                    {/* User Type Selection */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">
                        I am a...
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, usertype: 'buyer' }))}
                          className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                            formData.usertype === 'buyer'
                              ? 'border-[#0046ad] bg-[#0046ad]/5 shadow-lg'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-3">
                            <div className={`p-3 rounded-full ${
                              formData.usertype === 'buyer'
                                ? 'bg-[#0046ad] text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <ShoppingCart className="h-6 w-6" />
                            </div>
                            <div className="text-center">
                              <h4 className={`font-semibold ${
                                formData.usertype === 'buyer' ? 'text-[#0046ad]' : 'text-gray-700'
                              }`}>
                                Buyer
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                I want to purchase products
                              </p>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, usertype: 'seller' }))}
                          className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                            formData.usertype === 'seller'
                              ? 'border-[#0046ad] bg-[#0046ad]/5 shadow-lg'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-3">
                            <div className={`p-3 rounded-full ${
                              formData.usertype === 'seller'
                                ? 'bg-[#0046ad] text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <Store className="h-6 w-6" />
                            </div>
                            <div className="text-center">
                              <h4 className={`font-semibold ${
                                formData.usertype === 'seller' ? 'text-[#0046ad]' : 'text-gray-700'
                              }`}>
                                Seller
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                I want to sell products
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0046ad] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0046ad] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0046ad] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#0046ad] transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <>
                    <div className="space-y-1">
                      <label htmlFor="password_confirmation" className="block text-sm font-semibold text-gray-700">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="password_confirmation"
                          name="password_confirmation"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          value={formData.password_confirmation}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0046ad] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#0046ad] transition-colors"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
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
                        className="h-4 w-4 text-[#0046ad] focus:ring-[#0046ad] border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>

                    <div className="text-sm">
                      <a href="#" className="font-medium text-[#0046ad] hover:text-[#003d99] transition-colors">
                        Forgot password?
                      </a>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#0046ad] hover:bg-[#003d99] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#0046ad] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        {mode === 'login' ? (
                          <LogIn className="h-5 w-5 mr-2" />
                        ) : (
                          <UserPlus className="h-5 w-5 mr-2" />
                        )}
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Sign up / Login switch section - moved below form */}
            <div className="text-center mt-6">
              <p className="text-white/80 text-sm">
                {mode === 'login' ? (
                  <>
                    New to PGS?{' '}
                    <button
                      onClick={switchMode}
                      className="font-semibold text-yellow-300 hover:text-yellow-200 underline transition-colors"
                    >
                      Create Account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={switchMode}
                      className="font-semibold text-yellow-300 hover:text-yellow-200 underline transition-colors"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
