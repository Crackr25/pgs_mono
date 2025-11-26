import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { getImageUrl } from '../../../lib/storefront-api';
import ProductDetailModal from '../../../components/products/ProductDetailModal';
import StorefrontHeader from '../../../components/storefront/StorefrontHeader';

export default function StorefrontPage() {
  const router = useRouter();
  const { slug, page: pageSlug } = router.query;
  
  const [storefront, setStorefront] = useState(null);
  const [page, setPage] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [shouldShowEmbeddedProfile, setShouldShowEmbeddedProfile] = useState(false);

  useEffect(() => {
    if (slug && pageSlug) {
      fetchPageData();
    }
  }, [slug, pageSlug]);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Reset embedded profile state when fetching new page data
      setShouldShowEmbeddedProfile(false);

      console.log('🔍 Fetching page data for:', { slug, pageSlug });

      // First, fetch menu items to check if this is an embedded profile page
      const menuResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/storefront/${slug}/menu`);
      let isEmbeddedProfile = false;
      let storefrontData = null;
      
      if (menuResponse.ok) {
        const menuData = await menuResponse.json();
        console.log('📋 Menu data:', menuData);
        
        const menuTree = buildMenuTree(menuData);
        setMenuItems(menuTree);
        
        // Check if current page has embed_company_profile enabled
        const currentMenuItem = menuData.find(item => item.type === 'page' && item.target === pageSlug);
        console.log('🎯 Current menu item:', currentMenuItem);
        
        if (currentMenuItem && currentMenuItem.embed_company_profile) {
          console.log('✅ This is an embedded profile page!');
          isEmbeddedProfile = true;
          setShouldShowEmbeddedProfile(true);
        }
      }

      // If this is an embedded profile page, fetch storefront directly
      if (isEmbeddedProfile) {
        console.log('📥 Fetching storefront for embedded profile...');
        const storefrontResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/storefront/${slug}`);
        if (storefrontResponse.ok) {
          const data = await storefrontResponse.json();
          console.log('✅ Storefront data loaded:', data);
          setStorefront(data);
          // Create a dummy page object for embedded profile
          setPage({
            title: 'Company Profile',
            slug: pageSlug,
            meta_description: data.company?.description || '',
            sections: []
          });
        } else {
          throw new Error('Could not load storefront data');
        }
      } else {
        // Normal page - fetch page data
        console.log('📄 Fetching normal page data...');
        const pageResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/storefront/${slug}/page/${pageSlug}`);
        if (!pageResponse.ok) throw new Error('Page not found');
        const responseData = await pageResponse.json();
        
        setStorefront(responseData.storefront);
        setPage(responseData.page);
      }

      // Fetch products for the storefront
      const productsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/storefront/${slug}/products`);
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData);
      }

    } catch (err) {
      console.error('❌ Error fetching page:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Build hierarchical menu structure
  const buildMenuTree = (items) => {
    const tree = [];
    const itemMap = {};

    items.forEach(item => {
      itemMap[item.id] = { ...item, children: [] };
    });

    items.forEach(item => {
      if (item.parent_id && itemMap[item.parent_id]) {
        itemMap[item.parent_id].children.push(itemMap[item.id]);
      } else {
        tree.push(itemMap[item.id]);
      }
    });

    return tree;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (error || !storefront || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-gray-600 mb-8">{error || 'Page not found'}</p>
          <Link href={`/store/${slug}`}>
            <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              Go to Storefront
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const { company, primary_color } = storefront;

  return (
    <>
      <Head>
        <title>{page.title} - {company.name}</title>
        <meta name="description" content={page.meta_description || company.description} />
        {page.meta_keywords && <meta name="keywords" content={page.meta_keywords} />}
      </Head>

      <div className={shouldShowEmbeddedProfile ? "min-h-screen bg-white" : "min-h-screen bg-black"}>
        {/* Header Navigation */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          {/* Enhanced Company Info Header */}
          <StorefrontHeader 
            company={company}
            storefront={storefront}
            slug={slug}
            primaryColor={primary_color}
          />

          {/* Navigation Bar */}
          <div className="bg-black text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex items-center h-12">
                <div className="flex items-center space-x-8 flex-1">
                  {menuItems && menuItems.length > 0 ? (
                    menuItems.filter(item => item.is_visible).map((item) => {
                      const hasChildren = item.children && item.children.length > 0;
                      const isActive = item.type === 'page' && item.target === pageSlug;
                      
                      return (
                        <div
                          key={item.id}
                          className="relative group"
                          onMouseEnter={() => setOpenDropdown(item.id)}
                          onMouseLeave={() => setOpenDropdown(null)}
                        >
                          {item.type === 'page' ? (
                            <Link
                              href={`/store/${slug}/${item.target}`}
                              className={`text-sm hover:text-gray-300 transition-colors flex items-center gap-1 cursor-pointer ${isActive ? 'text-orange-400 font-semibold' : ''}`}
                            >
                              {item.label}
                              {hasChildren && (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              )}
                            </Link>
                          ) : item.type === 'section' ? (
                            <a
                              href={`/store/${slug}#${item.target}`}
                              className="text-sm hover:text-gray-300 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              {item.label}
                              {hasChildren && (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              )}
                            </a>
                          ) : (
                            <a
                              href={item.target}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm hover:text-gray-300 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              {item.label}
                              {hasChildren && (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              )}
                            </a>
                          )}

                          {hasChildren && (
                            <div className={`absolute top-full left-0 mt-0 bg-white text-gray-900 shadow-lg rounded-md min-w-[200px] py-2 transition-all ${
                              openDropdown === item.id ? 'opacity-100 visible' : 'opacity-0 invisible'
                            }`}>
                              {item.children.filter(child => child.is_visible).map((child) => (
                                <div key={child.id}>
                                  {child.type === 'page' ? (
                                    <Link
                                      href={`/store/${slug}/${child.target}`}
                                      className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                                    >
                                      {child.label}
                                    </Link>
                                  ) : child.type === 'section' ? (
                                    <a
                                      href={`/store/${slug}#${child.target}`}
                                      className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                                    >
                                      {child.label}
                                    </a>
                                  ) : (
                                    <a
                                      href={child.target}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                                    >
                                      {child.label}
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <Link href={`/store/${slug}`} className="text-sm hover:text-gray-300 transition-colors">
                      Home
                    </Link>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </header>

        {/* Page Content - Render sections from Page Builder */}
        {shouldShowEmbeddedProfile ? (
          <div className="w-full bg-white" style={{ height: 'calc(100vh - 150px)', overflow: 'hidden' }}>
            <iframe
              id="embedded-profile"
              src={`/buyer/suppliers/${company.id}?embedded=true`}
              className="w-full h-full border-0"
              style={{ width: '100%', height: '100%' }}
              title="Company Profile"
            />
          </div>
        ) : (
          <>
            <main>
              {page.sections && page.sections.length > 0 ? (
                <div>
                  {page.sections.map((section) => (
                    <StorefrontSection 
                      key={section.id} 
                      section={section}
                      primaryColor={primary_color}
                      company={company}
                      products={products}
                    />
                  ))}
                </div>
              ) : page.content ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-4xl font-bold mb-6" style={{ color: primary_color }}>
                      {page.title}
                    </h1>
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: page.content }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                  <p className="text-gray-500">No content available for this page yet.</p>
                </div>
              )}
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8 mt-16">
              <div className="max-w-7xl mx-auto px-4 text-center">
                <p>&copy; {new Date().getFullYear()} {company.name}. All rights reserved.</p>
                <p className="text-sm text-gray-400 mt-2">Powered by Pinoy Global Supply</p>
              </div>
            </footer>
          </>
        )}
      </div>
    </>
  );
}

// Component to render different section types (copied from main storefront)
function StorefrontSection({ section, primaryColor, company, products }) {
  const router = useRouter();
  const { slug } = router.query;
  const { section_type, title, content, images, settings } = section;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // State for real reviews from database
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Function to get a random product and navigate to it
  const handleImageClick = (e) => {
    e.preventDefault();
    
    // Use products from props first, fallback to company.products
    const availableProducts = products && products.length > 0 ? products : (company?.products || []);
    
    console.log('Available products:', availableProducts.length);
    
    if (availableProducts.length === 0) {
      console.log('No products available');
      return;
    }
    
    // Get random product
    const randomProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)];
    
    console.log('Selected random product:', randomProduct.name, 'ID:', randomProduct.id);
    
    // Navigate to the product detail page (buyer view)
    router.push(`/buyer/products/${randomProduct.id}`);
  };

  // Fetch featured products if this is a featured_products section
  useEffect(() => {
    if (section_type === 'featured_products') {
      const fetchFeaturedProducts = async () => {
        setLoadingProducts(true);
        const selectedProductIds = settings?.selected_products || [];
        
        if (selectedProductIds.length === 0) {
          setLoadingProducts(false);
          return;
        }
        
        try {
          // Fetch products from the public API
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/storefront/${slug}/products`);
          if (response.ok) {
            const allProducts = await response.json();
            // Filter to only show selected products in the order they were selected
            const displayProducts = selectedProductIds
              .map(id => allProducts.find(p => p.id === id))
              .filter(Boolean); // Remove any null/undefined (deleted products)
            setFeaturedProducts(displayProducts);
          }
        } catch (error) {
          console.error('Error fetching featured products:', error);
        } finally {
          setLoadingProducts(false);
        }
      };
      
      fetchFeaturedProducts();
    }
  }, [section_type, settings, slug]);

  // Fetch REAL reviews from database if this is a company_reviews section
  useEffect(() => {
    if (section_type === 'company_reviews' && company?.id) {
      const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
          const [reviewsData, statsData] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers/${company.id}/reviews?per_page=20`).then(r => r.json()),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers/${company.id}/reviews/stats`).then(r => r.json())
          ]);
          
          console.log('📊 Fetched reviews:', reviewsData);
          console.log('📊 Fetched stats:', statsData);
          
          setReviews(reviewsData.data || []);
          setReviewStats(statsData);
        } catch (error) {
          console.error('❌ Error fetching reviews:', error);
          setReviews([]);
          setReviewStats(null);
        } finally {
          setLoadingReviews(false);
        }
      };
      
      fetchReviews();
    }
  }, [section_type, company?.id]);

  // Auto-advance carousel for hero and slider sections
  useEffect(() => {
    if (section_type === 'hero' && images && images.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(timer);
    }
    
    if (section_type === 'slider') {
      const videos = settings?.videos || [];
      const allMedia = [...(images || []), ...videos];
      if (allMedia.length > 1) {
        const timer = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % allMedia.length);
        }, 5000);
        return () => clearInterval(timer);
      }
    }
  }, [section_type, images, settings]);

  // Parse images if they're JSON string
  const parsedImages = typeof images === 'string' ? JSON.parse(images) : images;

  if (section_type === 'hero') {
    if (parsedImages && parsedImages.length > 0) {
      return (
        <section className="mb-16 w-full">
          <div className="relative h-96 md:h-[600px] overflow-hidden w-full">
            {parsedImages.map((img, idx) => (
              <div
                key={idx}
                onClick={handleImageClick}
                className={`absolute inset-0 transition-opacity duration-1000 cursor-pointer ${
                  idx === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: `url(${getImageUrl(img)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center pointer-events-none">
                  {title && (
                    <h2 className="text-4xl md:text-6xl font-bold text-white text-center px-4 drop-shadow-lg">
                      {title}
                    </h2>
                  )}
                </div>
              </div>
            ))}
            
            {parsedImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev - 1 + parsedImages.length) % parsedImages.length);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev + 1) % parsedImages.length);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {parsedImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {parsedImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(idx);
                    }}
                    className={`w-3 h-3 rounded-full transition ${
                      idx === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }
  }

  if (section_type === 'about') {
    return (
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold mb-6">{title || 'About Us'}</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{content}</p>
          </div>
        </div>
      </section>
    );
  }

  if (section_type === 'text') {
    return (
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {title && <h2 className="text-3xl font-bold mb-6 text-gray-900">{title}</h2>}
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">{content}</p>
          </div>
        </div>
      </section>
    );
  }

  if (section_type === 'gallery' && parsedImages && parsedImages.length > 0) {
    return (
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            {title && <h2 className="text-3xl font-bold mb-6">{title}</h2>}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {parsedImages.map((img, idx) => (
                <img 
                  key={idx}
                  src={getImageUrl(img)}
                  alt={`Gallery image ${idx + 1}`}
                  onClick={handleImageClick}
                  className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-xl transition cursor-pointer transform hover:scale-105"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (section_type === 'image' && parsedImages && parsedImages.length > 0) {
    return (
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {title && <h2 className="text-3xl font-bold mb-6 px-6 pt-6">{title}</h2>}
            <img 
              src={getImageUrl(parsedImages[0])}
              alt={title || 'Section image'}
              onClick={handleImageClick}
              className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition"
            />
            {content && (
              <div className="p-6">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{content}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (section_type === 'slider') {
    const videos = settings?.videos || [];
    const allMedia = [...(parsedImages || []), ...videos];
    
    if (allMedia.length > 0) {
      return (
        <section className="mb-8 w-full">
          <div className="relative h-96 md:h-[600px] overflow-hidden bg-gray-900 w-full">
            {allMedia.map((media, idx) => {
              const isVideo = videos.includes(media);
              
              return (
                <div
                  key={idx}
                  onClick={handleImageClick}
                  className={`absolute inset-0 transition-opacity duration-1000 cursor-pointer ${
                    idx === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {isVideo ? (
                    <video
                      src={getImageUrl(media)}
                      className="w-full h-full object-cover pointer-events-none"
                      autoPlay
                      muted
                      loop
                    />
                  ) : (
                    <div
                      style={{
                        backgroundImage: `url(${getImageUrl(media)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                      className="w-full h-full"
                    />
                  )}
                  
                  {title && title.trim() !== '' && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center pointer-events-none">
                      <h2 className="text-4xl md:text-6xl font-bold text-white text-center px-4 drop-shadow-lg">
                        {title}
                      </h2>
                    </div>
                  )}
                </div>
              );
            })}
            
            {allMedia.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev - 1 + allMedia.length) % allMedia.length);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev + 1) % allMedia.length);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {allMedia.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide(idx);
                      }}
                      className={`w-3 h-3 rounded-full transition ${
                        idx === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      );
    }
  }

  if (section_type === 'products_showcase') {
    // Auto-display products with simple limit
    const availableProducts = products && products.length > 0 ? products : (company?.products || []);
    const productsLimit = settings?.products_limit || 8;
    const displayProducts = productsLimit === 0 ? availableProducts : availableProducts.slice(0, productsLimit);
    
    return (
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">{title || 'Our Products'}</h2>
            {content && (
              <p className="text-gray-700 mb-8">{content}</p>
            )}
          
          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayProducts.map((product) => {
                // Use getImageUrl helper function to construct proper image URLs
                const productImage = product.main_image 
                  ? getImageUrl(product.main_image)
                  : product.images?.[0]
                    ? getImageUrl(product.images[0])
                    : null;

                return (
                  <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group cursor-pointer" onClick={() => window.open(`/buyer/products/${product.id}`, '_blank')}>
                    <div className="relative w-full h-48 bg-gray-100">
                      {productImage ? (
                        <>
                          <img 
                            src={productImage}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              console.error('❌ Image failed to load:', productImage);
                              e.target.style.display = 'none';
                              e.target.parentElement.querySelector('.fallback-icon')?.classList.remove('hidden');
                            }}
                          />
                          <div className="fallback-icon hidden w-full h-full absolute inset-0 flex items-center justify-center text-gray-400">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description || product.specs}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg" style={{ color: primaryColor }}>
                          ${product.price}
                        </span>
                        <span className="text-xs text-gray-500">MOQ: {product.moq}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-lg font-semibold mb-2">No products available</p>
              <p className="text-sm">Add products to your catalog to display them here</p>
            </div>
          )}
          
            {productsLimit > 0 && availableProducts.length > productsLimit && (
              <div className="text-center mt-8">
                <p className="text-gray-700">
                  Showing {productsLimit} of {availableProducts.length} products
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (section_type === 'featured_products') {
    // Manual selection of specific products
    if (loadingProducts) {
      return (
        <section className="mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">{title || 'Featured Products'}</h2>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
              <p className="text-gray-700 mt-2">Loading products...</p>
            </div>
          </div>
        </section>
      );
    }
    
    return (
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">{title || 'Featured Products'}</h2>
            {content && (
              <p className="text-gray-700 mb-8">{content}</p>
            )}
            
            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} primaryColor={primaryColor} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-lg font-semibold mb-2">No products selected</p>
                <p className="text-sm">Please select products to feature in the page builder</p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Text Section with custom styling
  if (section_type === 'text' || section_type === 'heading') {
    const paddingMap = {
      none: 'py-0',
      small: 'py-6',
      medium: 'py-12',
      large: 'py-20',
      xlarge: 'py-32'
    };

    const paddingClass = paddingMap[settings?.padding] || 'py-12';
    const textColor = settings?.text_color || '#000000';
    const fontSize = settings?.font_size || '16px';
    const textAlign = settings?.text_align || 'left';
    const fontWeight = settings?.font_weight || 'normal';
    const bgColor = settings?.bg_color || 'transparent';
    
    // Background image can come from either images array (first image) or settings.bg_image
    let bgImage = null;
    if (images && images.length > 0) {
      bgImage = getImageUrl(images[0]);
    } else if (settings?.bg_image) {
      bgImage = getImageUrl(settings.bg_image);
    }

    const backgroundStyle = bgImage 
      ? {
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: bgColor !== 'transparent' ? bgColor : undefined
        }
      : {
          backgroundColor: bgColor !== 'transparent' ? bgColor : undefined
        };

    return (
      <section 
        className={`mb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${paddingClass} ${bgImage ? 'relative' : ''}`}
        style={backgroundStyle}
      >
        {bgImage && <div className="absolute inset-0 bg-black bg-opacity-30"></div>}
        <div className={`${bgImage ? 'relative z-10' : ''} max-w-4xl ${textAlign === 'center' ? 'mx-auto' : ''}`}>
          {title && (
            <h2 
              className="text-3xl font-bold mb-6"
              style={{ 
                color: textColor,
                textAlign: textAlign,
                fontWeight: fontWeight
              }}
            >
              {title}
            </h2>
          )}
          {section_type === 'heading' && title && !content && (
            <h2 
              className="text-4xl font-bold mb-4"
              style={{ 
                color: textColor,
                textAlign: textAlign,
                fontWeight: fontWeight
              }}
            >
              {title}
            </h2>
          )}
          {content && (
            <div 
              className="prose prose-lg max-w-none"
              style={{ 
                color: textColor,
                fontSize: fontSize,
                textAlign: textAlign,
                fontWeight: fontWeight
              }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      </section>
    );
  }

  // Company Reviews Section (Professional B2B Style) - DYNAMIC from Database
  if (section_type === 'company_reviews') {
    // Use REAL reviews from database API, not static settings
    const overallRating = reviewStats?.average_rating || 0;
    const totalReviews = reviewStats?.total_reviews || 0;
    const ratingBreakdown = reviewStats?.rating_breakdown || {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };

    // Show loading state while fetching
    if (loadingReviews) {
      return (
        <section className="mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-3xl font-bold mb-8 text-gray-900">{title || 'Supplier Reviews'}</h2>
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading reviews...</p>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">{title || 'Supplier Reviews'}</h2>
            
            {/* Show content only if there are actual reviews */}
            {totalReviews > 0 ? (
              <>
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                  {/* Overall Rating Card */}
                  <div className="md:col-span-1 bg-gray-50 rounded-lg p-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-orange-500 mb-2">
                        {overallRating.toFixed(1)}
                        <span className="text-2xl text-gray-600">/5</span>
                      </div>
                      <div className="flex justify-center mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-6 h-6 ${star <= Math.round(overallRating) ? 'text-orange-500' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-600 font-semibold">
                        {overallRating >= 4.5 ? 'Very satisfied' : overallRating >= 3.5 ? 'Satisfied' : overallRating >= 2.5 ? 'Average' : 'Needs improvement'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{totalReviews} Reviews</p>
                    </div>

                    {/* Supplier Service Ratings - Only show if data exists */}
                    {overallRating > 0 && (
                      <div className="mt-6 space-y-3 border-t pt-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Supplier Service</span>
                            <span className="text-sm font-semibold text-orange-500">{overallRating.toFixed(1)}</span>
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} className={`w-4 h-4 ${star <= Math.round(overallRating) ? 'text-orange-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">On-time shipment</span>
                            <span className="text-sm font-semibold text-orange-500">{overallRating.toFixed(1)}</span>
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} className={`w-4 h-4 ${star <= Math.round(overallRating) ? 'text-orange-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Product Quality</span>
                            <span className="text-sm font-semibold text-orange-500">{overallRating.toFixed(1)}</span>
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} className={`w-4 h-4 ${star <= Math.round(overallRating) ? 'text-orange-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Quality Breakdown */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Product Quality</h3>
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = ratingBreakdown[stars] || 0;
                        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                        
                        return (
                          <div key={stars} className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 w-16">{stars} Stars</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-orange-500 h-full rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-16 text-right">
                              {percentage.toFixed(0)}% ({count})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Review Filters */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">All Reviews ({totalReviews})</h3>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-medium hover:bg-orange-200 transition">
                      ALL ({totalReviews})
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition">
                      Verified ({reviews.filter(r => r.verified).length})
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition">
                      5 Stars ({ratingBreakdown[5] || 0})
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition">
                      4 Stars ({ratingBreakdown[4] || 0})
                    </button>
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-6">
                  {reviews.map((review, idx) => {
                    // Get product image URL
                    const productImage = review.product?.image 
                      ? getImageUrl(review.product.image)
                      : null;

                    return (
                      <div key={review.id || idx} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-start gap-4">
                          {/* User Avatar */}
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {review.reviewer_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          
                          <div className="flex-1">
                            {/* Review Header */}
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold">{review.reviewer_name || 'Anonymous'}</p>
                                  {review.verified && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      Verified Purchase
                                    </span>
                                  )}
                                </div>
                                {review.reviewer_company && (
                                  <p className="text-sm text-gray-500">{review.reviewer_company}</p>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>

                            {/* Product Info - Clickable like Alibaba */}
                            {review.product && (
                              <div 
                                onClick={() => window.open(`/buyer/products/${review.product.id}`, '_blank')}
                                className="flex items-center gap-3 mb-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer border border-gray-200"
                              >
                                <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                                  {productImage ? (
                                    <img 
                                      src={productImage}
                                      alt={review.product.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-blue-600 hover:text-blue-800 line-clamp-2">
                                    {review.product.name}
                                  </p>
                                  {review.product.category && (
                                    <p className="text-xs text-gray-500 mt-0.5">{review.product.category}</p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Rating */}
                            <div className="flex items-center gap-4 mb-3">
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                      key={star}
                                      className={`w-4 h-4 ${star <= review.rating ? 'text-orange-500' : 'text-gray-300'}`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="text-sm font-semibold text-orange-500">{review.rating}.0</span>
                              </div>
                            </div>

                            {/* Review Title */}
                            {review.title && (
                              <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                            )}

                            {/* Review Text */}
                            <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>

                          {/* Supplier Response */}
                          {review.response && (
                            <div className="mt-4 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                              <p className="text-sm font-semibold text-blue-900 mb-1">Supplier Response:</p>
                              <p className="text-sm text-blue-800">{review.response}</p>
                              {review.response_date && (
                                <p className="text-xs text-blue-600 mt-2">
                                  {new Date(review.response_date).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Empty State - No Reviews */
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="text-gray-500 text-lg">No reviews yet</p>
                <p className="text-gray-400 text-sm mt-2">Be the first to review this supplier</p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Render nothing extra - navigation happens via router.push
  return null;
}

// Component to render individual product card with image carousel
function ProductCard({ product, primaryColor }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = product.images || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Use getImageUrl helper function to construct proper image URLs
  const productImage = product.main_image 
    ? getImageUrl(product.main_image)
    : product.images?.[currentImageIndex]
      ? getImageUrl(product.images[currentImageIndex])
      : null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group">
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {productImage ? (
          <>
            <img 
              src={productImage}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => window.open(`/buyer/products/${product.id}`, '_blank')}
              onError={(e) => {
                console.error('❌ Image failed to load:', productImage);
                e.target.style.display = 'none';
                e.target.parentElement.querySelector('.fallback-icon')?.classList.remove('hidden');
              }}
            />
            <div className="fallback-icon hidden w-full h-full absolute inset-0 flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            {/* Image navigation arrows for multiple images */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Image counter badge */}
            {hasMultipleImages && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {currentImageIndex + 1}/{images.length}
              </div>
            )}
            
            {/* Dot indicators for multiple images */}
            {hasMultipleImages && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                    className={`w-2 h-2 rounded-full transition ${
                      idx === currentImageIndex 
                        ? 'bg-white' 
                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between">
          <div>
            {product.price && (
              <p className="text-lg font-bold" style={{ color: primaryColor }}>
                ${parseFloat(product.price).toFixed(2)}
              </p>
            )}
          </div>
          <button 
            className="px-4 py-2 rounded text-white text-sm font-semibold hover:opacity-90 transition"
            style={{ backgroundColor: primaryColor }}
            onClick={() => window.open(`/buyer/products/${product.id}`, '_blank')}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
