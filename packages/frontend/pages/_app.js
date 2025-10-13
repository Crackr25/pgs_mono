import '../styles/globals.css';
import '../styles/pinoy-theme.css';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import AuthGuard from '../components/auth/AuthGuard';
import OnboardingGuard from '../components/auth/OnboardingGuard';
import { AuthProvider } from '../contexts/AuthContext';

// Pages that don't require authentication
// All buyer pages are public, allowing unauthenticated browsing
const publicPages = ['/login'];

// Check if current page is a buyer page (public)
const isBuyerPage = (pathname) => {
  return pathname.startsWith('/buyer');
};

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isPublicPage = publicPages.includes(router.pathname);
  const isBuyerPageRoute = isBuyerPage(router.pathname);

  return (
    <AuthProvider>
      <Layout>
        {isPublicPage || isBuyerPageRoute ? (
          <Component {...pageProps} />
        ) : (
          <AuthGuard>
            <OnboardingGuard>
              <Component {...pageProps} />
            </OnboardingGuard>
          </AuthGuard>
        )}
      </Layout>
    </AuthProvider>
  );
}
