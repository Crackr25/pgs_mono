import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../lib/api';

const OnboardingGuard = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [hasCompany, setHasCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      checkUserCompany();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, user, authLoading]);

  const checkUserCompany = async () => {
    try {
      setLoading(true);
      
      // Check if user has a company profile
      const companies = await apiService.getCompanies();
      const userCompany = companies.data?.find(company => company.user_id === user.id);
      
      if (userCompany) {
        setHasCompany(true);
      } else {
        setHasCompany(false);
        // If user doesn't have company data and not already on onboarding page, redirect
        if (router.pathname !== '/onboarding') {
          router.push('/onboarding');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking user company:', error);
      // If there's an error, assume no company and redirect to onboarding
      setHasCompany(false);
      if (router.pathname !== '/onboarding') {
        router.push('/onboarding');
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, let AuthGuard handle it
  if (!isAuthenticated) {
    return children;
  }

  // If user has no company and is not on onboarding page, don't render anything (redirect is happening)
  if (hasCompany === false && router.pathname !== '/onboarding') {
    return null;
  }

  // If user has company but is on onboarding page, redirect to dashboard
  if (hasCompany === true && router.pathname === '/onboarding') {
    router.push('/');
    return null;
  }

  return children;
};

export default OnboardingGuard;
