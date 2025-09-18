import { useStripe, useElements } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';

export default function StripeDebugInfo({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        stripeLoaded: !!stripe,
        elementsLoaded: !!elements,
        clientSecretProvided: !!clientSecret,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Set' : 'Missing',
        timestamp: new Date().toISOString()
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);
    return () => clearInterval(interval);
  }, [stripe, elements, clientSecret]);

  return (
    <div className="p-4 bg-gray-100 rounded-lg text-xs font-mono">
      <h4 className="font-bold mb-2">Stripe Debug Info:</h4>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
}
