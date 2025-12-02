import { useState } from 'react';

export default function Footer() {
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  const handleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === 3) {
      setShowEasterEgg(true);
    }
  };

  return (
    <footer className="bg-white border-t border-secondary-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <p className="text-sm text-secondary-600">
              © 2025 Pinoy Global Supply. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="#" className="text-sm text-secondary-600 hover:text-secondary-900">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-secondary-600 hover:text-secondary-900">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-secondary-600 hover:text-secondary-900">
              Contact Support
            </a>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-secondary-200">
          <p 
            className="text-xs text-secondary-500 text-center cursor-pointer select-none"
            onClick={handleClick}
          >
            Connecting suppliers and manufacturers worldwide. Trusted by 10,000+ businesses.
          </p>
          {showEasterEgg && (
            <p className="text-xs text-secondary-400 text-center mt-2 animate-fade-in">
              Made with 💖 by Izakahr
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
