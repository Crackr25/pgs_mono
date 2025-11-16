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
        {/* Navigation Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <Link href={`/store/${slug}`}>
                  <div className="flex items-center space-x-4 cursor-pointer">
                    {company.logo && (
                      <img src={getImageUrl(company.logo)} alt={company.name} className="h-12 w-auto" />
                    )}
                    <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-black text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex items-center h-12 space-x-8">
                <Link href={`/store/${slug}`} className="text-sm hover:text-gray-300">Home</Link>
                <Link href={`/store/${slug}/products`} className="text-sm hover:text-gray-300">Products</Link>
                <Link href={`/store/${slug}/profile`} className="text-sm text-blue-400 border-b-2 border-blue-400">Profile</Link>
                <Link href={`/store/${slug}/contact`} className="text-sm hover:text-gray-300">Contact</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Custom Company Profile Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section with Company Info */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <h1 className="text-5xl font-bold text-white">Company Profile</h1>
            </div>
            <div className="p-8">
              <div className="flex items-start gap-8">
                {company.logo && (
                  <img src={getImageUrl(company.logo)} alt={company.name} className="h-32 w-32 object-contain" />
                )}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4">{company.name}</h2>
                  <p className="text-gray-600 text-lg leading-relaxed">{company.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Details Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: primary_color }}>Business Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Company Name:</span>
                  <p className="text-gray-600">{company.name}</p>
                </div>
                <div>
                  <span className="font-semibold">Business Type:</span>
                  <p className="text-gray-600">Manufacturer & Supplier</p>
                </div>
                <div>
                  <span className="font-semibold">Year Established:</span>
                  <p className="text-gray-600">2020</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: primary_color }}>Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Email:</span>
                  <p className="text-gray-600">{company.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-semibold">Phone:</span>
                  <p className="text-gray-600">+63 XXX XXX XXXX</p>
                </div>
                <div>
                  <span className="font-semibold">Address:</span>
                  <p className="text-gray-600">Philippines</p>
                </div>
              </div>
            </div>
          </div>

          {/* Capabilities Section */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold mb-6" style={{ color: primary_color }}>Our Capabilities</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">🏭</div>
                <h4 className="font-bold mb-2">Manufacturing</h4>
                <p className="text-sm text-gray-600">State-of-the-art production facilities</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">✅</div>
                <h4 className="font-bold mb-2">Quality Control</h4>
                <p className="text-sm text-gray-600">Strict quality assurance processes</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">🚚</div>
                <h4 className="font-bold mb-2">Fast Delivery</h4>
                <p className="text-sm text-gray-600">Efficient logistics and shipping</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
