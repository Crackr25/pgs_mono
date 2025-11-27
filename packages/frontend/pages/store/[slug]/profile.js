import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { storefrontAPI, getImageUrl } from '../../../lib/storefront-api';
import Head from 'next/head';
import Link from 'next/link';

export default function CompanyProfile() {
  const router = useRouter();
  const { slug } = router.query;
  const [storefront, setStorefront] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchStorefront = async () => {
      try {
        const response = await storefrontAPI.getPublicStorefront(slug);
        setStorefront(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStorefront();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!storefront) return <div className="min-h-screen flex items-center justify-center">Not found</div>;

  const { company, primary_color } = storefront;

  return (
    <>
      <Head>
        <title>{company.name} - Company Profile</title>
      </Head>

      <div className="min-h-screen bg-gray-50">

        {/* Custom Company Profile Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
          {/* Hero Section with Company Info */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6 sm:mb-8">
            <div className="h-32 sm:h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white px-4 text-center">Company Profile</h1>
            </div>
            <div className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 md:gap-8">
                {company.logo && (
                  <img src={getImageUrl(company.logo)} alt={company.name} className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 object-contain mx-auto sm:mx-0" />
                )}
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-center sm:text-left">{company.name}</h2>
                  <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed text-center sm:text-left">{company.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 md:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{ color: primary_color }}>Business Information</h3>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <span className="font-semibold text-sm sm:text-base">Company Name:</span>
                  <p className="text-gray-600 text-sm sm:text-base">{company.name}</p>
                </div>
                <div>
                  <span className="font-semibold text-sm sm:text-base">Business Type:</span>
                  <p className="text-gray-600 text-sm sm:text-base">Manufacturer & Supplier</p>
                </div>
                <div>
                  <span className="font-semibold text-sm sm:text-base">Year Established:</span>
                  <p className="text-gray-600 text-sm sm:text-base">2020</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 md:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{ color: primary_color }}>Contact Information</h3>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <span className="font-semibold text-sm sm:text-base">Email:</span>
                  <p className="text-gray-600 text-sm sm:text-base break-words">{company.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-semibold text-sm sm:text-base">Phone:</span>
                  <p className="text-gray-600 text-sm sm:text-base">+63 XXX XXX XXXX</p>
                </div>
                <div>
                  <span className="font-semibold text-sm sm:text-base">Address:</span>
                  <p className="text-gray-600 text-sm sm:text-base">Philippines</p>
                </div>
              </div>
            </div>
          </div>

          {/* Capabilities Section */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: primary_color }}>Our Capabilities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-4 sm:p-5 md:p-6 bg-gray-50 rounded-lg">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🏭</div>
                <h4 className="font-bold mb-2 text-sm sm:text-base">Manufacturing</h4>
                <p className="text-xs sm:text-sm text-gray-600">State-of-the-art production facilities</p>
              </div>
              <div className="text-center p-4 sm:p-5 md:p-6 bg-gray-50 rounded-lg">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">✅</div>
                <h4 className="font-bold mb-2 text-sm sm:text-base">Quality Control</h4>
                <p className="text-xs sm:text-sm text-gray-600">Strict quality assurance processes</p>
              </div>
              <div className="text-center p-4 sm:p-5 md:p-6 bg-gray-50 rounded-lg">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🚚</div>
                <h4 className="font-bold mb-2 text-sm sm:text-base">Fast Delivery</h4>
                <p className="text-xs sm:text-sm text-gray-600">Efficient logistics and shipping</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
