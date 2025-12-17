import '../styles/globals.css';
import '../styles/pinoy-theme.css';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import AuthGuard from '../components/auth/AuthGuard';
import OnboardingGuard from '../components/auth/OnboardingGuard';
import { AuthProvider } from '../contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { ToastProvider } from '../components/common/Toast';

// Pages that don't require authentication
// All buyer pages are public, allowing unauthenticated browsing
const publicPages = ['/login', '/register'];

// Check if current page is a buyer page (public)
const isBuyerPage = (pathname) => {
  return pathname.startsWith('/buyer');
};

// Check if current page is a storefront page (public)
const isStorefrontPage = (pathname) => {
  return pathname.startsWith('/store');
};

// Check if current page is an agent invitation page (public)
const isAgentInvitationPage = (pathname) => {
  return pathname.startsWith('/agent/accept-invitation');
};

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isPublicPage = publicPages.includes(router.pathname);
  const isBuyerPageRoute = isBuyerPage(router.pathname);
  const isStorefrontPageRoute = isStorefrontPage(router.pathname);
  const isAgentInvitationPageRoute = isAgentInvitationPage(router.pathname);

  return (
    <AuthProvider>
      <ToastProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Layout>
        {isPublicPage || isBuyerPageRoute || isStorefrontPageRoute || isAgentInvitationPageRoute ? (
          <Component {...pageProps} />
        ) : (
          <AuthGuard>
            <OnboardingGuard>
              <Component {...pageProps} />
            </OnboardingGuard>
          </AuthGuard>
        )}
        </Layout>
      </ToastProvider>
    </AuthProvider>
  );
}
