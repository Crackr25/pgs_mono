import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CheckCircle, AlertCircle, UserPlus, Eye, EyeOff } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import apiService from '../../lib/api';

const AcceptInvitation = () => {
    const router = useRouter();
    const { token } = router.query;
    const [formData, setFormData] = useState({
        password: '',
        password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [invitationData, setInvitationData] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validatingToken, setValidatingToken] = useState(true);

    useEffect(() => {
        if (token) {
            validateToken();
        }
    }, [token]);

    const validateToken = async () => {
        try {
            setValidatingToken(true);
            // You might want to add an API endpoint to validate the token and get invitation details
            // For now, we'll just check if token exists
            if (token) {
                setInvitationData({ token });
            }
        } catch (error) {
            console.error('Token validation error:', error);
            setError('Invalid or expired invitation token');
        } finally {
            setValidatingToken(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.password_confirmation) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await apiService.acceptAgentInvitation(
                token,
                formData.password,
                formData.password_confirmation
            );
            
            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (error) {
            console.error('Error accepting invitation:', error);
            setError(error.message || 'Failed to accept invitation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (validatingToken) {
        return (
            <>
                <Head>
                    <title>Validating Invitation - Pinoy Global Supply</title>
                </Head>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                    <Card className="max-w-md w-full">
                        <div className="text-center">
                            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                                <UserPlus className="h-6 w-6 text-blue-600" />
                            </div>
                            <h2 className="mt-6 text-2xl font-bold text-gray-900">
                                Validating Invitation
                            </h2>
                            <p className="mt-2 text-gray-600">
                                Please wait while we validate your invitation...
                            </p>
                        </div>
                    </Card>
                </div>
            </>
        );
    }

    if (!token || error.includes('Invalid or expired')) {
        return (
            <>
                <Head>
                    <title>Invalid Invitation - Pinoy Global Supply</title>
                </Head>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                    <Card className="max-w-md w-full">
                        <div className="text-center">
                            <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <h2 className="mt-6 text-2xl font-bold text-gray-900">
                                Invalid Invitation
                            </h2>
                            <p className="mt-2 text-gray-600">
                                {!token ? 'No invitation token provided' : 'This invitation token is invalid or has expired'}
                            </p>
                            <div className="mt-6">
                                <Button
                                    onClick={() => router.push('/login')}
                                    variant="outline"
                                >
                                    Go to Login
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </>
        );
    }

    if (success) {
        return (
            <>
                <Head>
                    <title>Invitation Accepted - Pinoy Global Supply</title>
                </Head>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                    <Card className="max-w-md w-full">
                        <div className="text-center">
                            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <h2 className="mt-6 text-2xl font-bold text-gray-900">
                                Invitation Accepted!
                            </h2>
                            <p className="mt-2 text-gray-600">
                                Your agent account has been successfully activated.
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Redirecting to login page in 3 seconds...
                            </p>
                            <div className="mt-6">
                                <Button
                                    onClick={() => router.push('/login')}
                                    className="w-full"
                                >
                                    Go to Login Now
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>Accept Agent Invitation - Pinoy Global Supply</title>
            </Head>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <Card className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserPlus className="h-6 w-6 text-blue-600" />
                        </div>
                        <h2 className="mt-6 text-2xl font-bold text-gray-900">
                            Accept Agent Invitation
                        </h2>
                        <p className="mt-2 text-gray-600">
                            Set up your password to complete your agent account activation
                        </p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-sm font-medium text-red-800">
                                            Error
                                        </h3>
                                        <p className="mt-1 text-sm text-red-700">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter your password (min. 8 characters)"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Password must be at least 8 characters long
                            </p>
                        </div>
                        
                        <div>
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password_confirmation}
                                    onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Confirm your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <UserPlus className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <h3 className="text-sm font-medium text-blue-800">
                                        Agent Account Setup
                                    </h3>
                                    <p className="mt-1 text-sm text-blue-700">
                                        Once you complete this setup, you'll be able to manage company operations and represent your assigned business on the Pinoy Global Supply platform.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? 'Setting up account...' : 'Accept Invitation & Setup Account'}
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                className="text-sm text-gray-500 hover:text-gray-700 underline"
                            >
                                Already have an account? Sign in
                            </button>
                        </div>
                    </form>
                </Card>
            </div>
        </>
    );
};

export default AcceptInvitation;
