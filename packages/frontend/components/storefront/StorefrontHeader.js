import React, { useState } from 'react';
import { getImageUrl } from '../../lib/storefront-api';
import SimpleFloatingChat from '../common/SimpleFloatingChat';
import LoginPromptModal from '../common/LoginPromptModal';
import { useAuth } from '../../contexts/AuthContext';
import { useLoginPrompt } from '../../hooks/useLoginPrompt';

export default function StorefrontHeader({ company, storefront, slug, primaryColor }) {
  const { user } = useAuth();
  const { requireAuth, showLoginPrompt, hideLoginPrompt, promptConfig } = useLoginPrompt();
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const {
    name,
    logo,
    manufacturer_type,
    verified,
    certification_badge,
    certification_agency,
    years_in_business,
    location,
    country,
    main_categories,
    leading_factory_rank,
    odm_services_available
  } = company;

  // Debug log
  console.log('🎨 StorefrontHeader loaded:', { name, verified, certification_agency });

  // Calculate years for display
  const yearsDisplay = years_in_business || (company.year_established ? new Date().getFullYear() - company.year_established : null);

  // Use company banner if available with blue tint
  const hasBanner = company.company_banner || storefront?.banner_image;
  const bannerUrl = company.company_banner 
    ? getImageUrl(company.company_banner)
    : storefront?.banner_image 
      ? getImageUrl(storefront.banner_image)
      : null;

  return (
    <div 
      className="border-b relative overflow-hidden"
      style={{
        backgroundColor: '#D3E4FD'
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-start justify-between gap-4">
          {/* Left Section: Logo and Company Info */}
          <div className="flex items-start space-x-3 md:space-x-4 flex-1 w-full md:w-auto">
            {/* Logo */}
            {logo && (
              <div className="flex-shrink-0">
                <img 
                  src={getImageUrl(logo)} 
                  alt={name}
                  className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 object-contain rounded-lg border-2 border-gray-200 bg-white p-2"
                />
              </div>
            )}

            {/* Company Details */}
            <div className="flex-1">
              {/* Verification Badge */}
              {verified && certification_agency && (
                <div className="flex items-center space-x-2 mb-2">
                  <div className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified by {certification_agency}
                  </div>
                  {certification_badge && (
                    <span className="text-xs text-gray-500">
                      <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {certification_badge}
                    </span>
                  )}
                </div>
              )}

              {/* Company Name with Dropdown Icon */}
              <div className="flex items-center space-x-2 mb-2 md:mb-3">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight">{name}</h1>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Company Details Row */}
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs sm:text-sm text-gray-700 mb-2 md:mb-3">
                {/* Manufacturer Type */}
                {manufacturer_type && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-blue-600">{manufacturer_type}</span>
                  </div>
                )}

                {/* Years in Business */}
                {yearsDisplay && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span><strong>{yearsDisplay}</strong> yrs</span>
                  </>
                )}

                {/* Location */}
                {(location || country) && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span>{location || country}</span>
                  </>
                )}
              </div>

              {/* Main Categories */}
              {main_categories && main_categories.length > 0 && (
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Main categories:</span>{' '}
                  {main_categories.slice(0, 4).join(', ')}
                  {main_categories.length > 4 && `, +${main_categories.length - 4} more`}
                </div>
              )}

              {/* Badges Row */}
              <div className="flex items-center space-x-2">
                {/* Leading Factory Badge */}
                {leading_factory_rank && (
                  <div className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-semibold border border-orange-300">
                    {leading_factory_rank}
                  </div>
                )}

                {/* ODM Services Badge */}
                {odm_services_available && (
                  <div className="bg-white text-gray-700 text-xs px-3 py-1 rounded-full font-medium border border-gray-300 flex items-center">
                    <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    ODM services available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section: Action Buttons */}
          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto md:ml-6">
            <button 
              className="flex-1 md:flex-initial px-4 md:px-6 py-2 md:py-2.5 rounded-md text-sm md:text-base text-white font-semibold hover:opacity-90 transition-all shadow-md whitespace-nowrap"
              style={{ backgroundColor: primaryColor || '#FF6600' }}
              onClick={() => requireAuth(
                () => {
                  // Scroll to contact section on the page
                  const contactSection = document.getElementById('contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    // If no contact section, navigate to #contact
                    window.location.href = `#contact`;
                  }
                },
                {
                  title: "Login Required",
                  message: "You need to log in to contact suppliers.",
                  actionText: `Contact ${company.name}`
                }
              )}
            >
              Contact supplier
            </button>
            <button 
              className="flex-1 md:flex-initial px-4 md:px-6 py-2 md:py-2.5 rounded-md text-sm md:text-base bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all border border-gray-300 shadow-sm whitespace-nowrap"
              onClick={() => requireAuth(
                () => setShowFloatingChat(true),
                {
                  title: "Login Required",
                  message: "You need to log in to chat with suppliers.",
                  actionText: `Chat with ${company.name}`
                }
              )}
            >
              Chat now
            </button>
          </div>
        </div>
      </div>

      {/* Floating Chat Modal */}
      {showFloatingChat && (
        <SimpleFloatingChat
          isOpen={showFloatingChat}
          onClose={() => setShowFloatingChat(false)}
          product={{
            company: {
              id: company.id,
              name: company.name,
              user_id: company.user_id
            }
          }}
        />
      )}

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={hideLoginPrompt}
        title={promptConfig.title}
        message={promptConfig.message}
        actionText={promptConfig.actionText}
      />
    </div>
  );
}
