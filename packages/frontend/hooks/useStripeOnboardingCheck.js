import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../lib/api';

export const useStripeOnboardingCheck = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch company data separately
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (isAuthenticated && user && user.usertype === 'seller') {
        try {
          setLoading(true);
          const response = await apiService.getCurrentUserCompany();
          if (response.success && response.data) {
            setCompany(response.data);
          }
        } catch (error) {
          console.error('Failed to fetch company data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCompanyData();
  }, [user, isAuthenticated]);

  useEffect(() => {
    // Only check for sellers who are authenticated and have company data
    if (isAuthenticated && user && user.usertype === 'seller' && company && !loading) {
      const hasStripeAccount = company?.stripe_account_id;
      const onboardingComplete = company?.stripe_onboarding_status === 'completed';
      
      // Don't redirect if already on onboarding pages
      const isOnOnboardingPage = router.pathname.startsWith('/merchant/onboarding');
      
      if ((!hasStripeAccount || !onboardingComplete) && !isOnOnboardingPage) {
        console.log('Seller needs Stripe onboarding - redirecting');
        router.push('/merchant/onboarding/stripe');
      }
    }
  }, [user, isAuthenticated, router, company, loading]);

  // Return onboarding status for components that need it
  const needsOnboarding = user?.usertype === 'seller' && company && 
    (!company?.stripe_account_id || company?.stripe_onboarding_status !== 'completed');

  return {
    needsOnboarding,
    hasStripeAccount: !!company?.stripe_account_id,
    onboardingComplete: company?.stripe_onboarding_status === 'completed',
    company,
    loading
  };
};
