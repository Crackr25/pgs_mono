import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../lib/api';

export const useStripeOnboardingCheck = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Fetch company data separately
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (isAuthenticated && user && user.usertype === 'seller') {
        try {
          setLoading(true);
          const response = await apiService.getCurrentUserCompany();
          
          if (response.success && response.data) {
            setCompany(response.data);
          } else {
            // No company found for this user
            setCompany(null);
          }
        } catch (error) {
          console.error('Failed to fetch company data:', error);
          setCompany(null);
        } finally {
          setLoading(false);
          setHasChecked(true);
        }
      } else if (!isAuthenticated || user?.usertype !== 'seller') {
        // Not a seller or not authenticated, mark as checked
        setHasChecked(true);
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [user, isAuthenticated]);

  useEffect(() => {
    // Only check for sellers who are authenticated and loading is complete
    if (isAuthenticated && user && user.usertype === 'seller' && !loading && hasChecked) {
      const hasStripeAccount = company?.stripe_account_id;
      const onboardingComplete = company?.stripe_onboarding_status === 'completed';
      
      // Don't redirect if already on onboarding pages
      const isOnOnboardingPage = router.pathname.startsWith('/merchant/onboarding');
      
      console.log('Company:', company);
      console.log('hasStripeAccount:', hasStripeAccount);
      console.log('onboardingComplete:', onboardingComplete);
      console.log('isOnOnboardingPage:', isOnOnboardingPage);
      
      // Redirect if:
      // 1. No company exists, OR
      // 2. Company exists but no Stripe account, OR  
      // 3. Company has Stripe account but onboarding not completed
      const needsRedirect = !company || !hasStripeAccount || !onboardingComplete;
      
      if (needsRedirect && !isOnOnboardingPage) {
        console.log('Seller needs onboarding - redirecting to:', 
          !company ? 'company setup' : 'Stripe setup');
        
        // If no company, redirect to company onboarding first
        if (!company) {
          // router.push('//merchant/onboarding/stripe');
        } else {
          // If company exists but Stripe not set up, go to Stripe onboarding
          router.push('/merchant/onboarding/stripe');
        }
      }
    }
  }, [user, isAuthenticated, router, company, loading, hasChecked]);

  // Return onboarding status for components that need it
  const hasCompany = !!company;
  const hasStripeAccount = !!company?.stripe_account_id;
  const onboardingComplete = company?.stripe_onboarding_status === 'completed';
  const needsOnboarding = user?.usertype === 'seller' && 
    (!hasCompany || !hasStripeAccount || !onboardingComplete);

  return {
    needsOnboarding,
    hasCompany,
    hasStripeAccount,
    onboardingComplete,
    company,
    loading,
    hasChecked
  };
};
