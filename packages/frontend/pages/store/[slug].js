import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { storefrontAPI, getImageUrl } from '../../lib/storefront-api';
import Head from 'next/head';
import Link from 'next/link';
import ProductDetailModal from '../../components/products/ProductDetailModal';

export default function PublicStorefront() {
  const router = useRouter();
  const { slug } = router.query;
  const [storefront, setStorefront] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const fetchStorefront = async () => {
      try {
        setLoading(true);
        const response = await storefrontAPI.getPublicStorefront(slug);
        setStorefront(response.data);
        
        // Fetch menu items for navigation
        try {
          console.log('Fetching menu for slug:', slug);
          const menuResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/storefront/${slug}/menu`);
          console.log('Menu response status:', menuResponse.status);
          
          if (menuResponse.ok) {
            const menuData = await menuResponse.json();
            console.log('Menu data received:', menuData);
            // Build hierarchical structure
            const menuTree = buildMenuTree(menuData);
            console.log('Menu tree built:', menuTree);
            setMenuItems(menuTree);
            
            // DISABLED: Auto-redirect to first page if no homepage sections exist
            // This was causing the page to redirect back immediately
            // const hasHomepageSections = response.data.sections?.some(s => s.is_visible && s.page_id === null);
            // if (!hasHomepageSections && menuTree.length > 0) {
            //   const firstPageItem = menuTree.find(item => item.type === 'page' && item.is_visible);
            //   if (firstPageItem) {
            //     console.log('Redirecting to first page:', firstPageItem.target);
            //     router.push(`/store/${slug}/${firstPageItem.target}`);
            //     return;
            //   }
            // }
          } else {
            console.error('Menu fetch failed with status:', menuResponse.status);
          }
        } catch (menuErr) {
          console.error('Error fetching menu:', menuErr);
          // Continue without menu items
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Storefront not found');
      } finally {
        setLoading(false);
      }
    };

    fetchStorefront();
  }, [slug, router]);

  // Build hierarchical menu structure
  const buildMenuTree = (items) => {
    const tree = [];
    const itemMap = {};

    // Create a map of all items
    items.forEach(item => {
      itemMap[item.id] = { ...item, children: [] };
    });

    // Build the tree
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading storefront...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!storefront) return null;

  const { company, sections, primary_color, secondary_color, banner_image, tagline, pages } = storefront;

  // Find the homepage - look for a page with slug 'homepage', 'home', or 'home-page'
  const homePage = pages?.find(p => {
    const slug = p.slug.toLowerCase();
    return slug === 'homepage' || slug === 'home' || slug === 'home-page';
  });
  
  console.log('🏠 Homepage Debug:');
  console.log('Pages:', pages);
  console.log('Found homepage:', homePage);
  console.log('All sections:', sections);
  
  // Show sections from the homepage OR legacy sections with page_id = null
  const sortedSections = sections ? [...sections]
    .filter(s => {
      if (!s.is_visible) return false;
      // Show sections from homepage if it exists, otherwise show legacy sections (page_id = null)
      if (homePage) {
        return s.page_id === homePage.id;
      } else {
        return s.page_id === null;
      }
    })
    .sort((a, b) => a.sort_order - b.sort_order) : [];
  
  console.log('Filtered sections for homepage:', sortedSections);
  
  const hasHeaderSection = false; // Deprecated: use page-based sections instead

  return (
    <>
      <Head>
        <title>{storefront.meta_title || `${company.name} - Pinoy Global Supply`}</title>
        <meta name="description" content={storefront.meta_description || company.description} />
        {storefront.meta_keywords && <meta name="keywords" content={storefront.meta_keywords} />}
      </Head>

      <div className="min-h-screen bg-black">
        {/* Header Navigation */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          {/* Company Info Bar */}
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {company.logo && (
                    <img 
                      src={getImageUrl(company.logo)} 
                      alt={company.name}
                      className="h-12 w-auto"
                    />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                    {tagline && <p className="text-sm text-gray-600">{tagline}</p>}
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <button 
                    className="px-6 py-2 rounded text-white font-semibold hover:opacity-90 transition"
                    style={{ backgroundColor: primary_color }}
                  >
                    Contact Supplier
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Alibaba-style Black Navigation Bar */}
          <div className="bg-black text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex items-center h-12">
                <div className="flex items-center space-x-8 flex-1">
                  {/* Dynamic Menu Items */}
                  {menuItems && menuItems.length > 0 ? (
                    menuItems.filter(item => item.is_visible).map((item) => {
                      const hasChildren = item.children && item.children.length > 0;
                      
                      return (
                        <div
                          key={item.id}
                          className="relative group"
                          onMouseEnter={() => setOpenDropdown(item.id)}
                          onMouseLeave={() => setOpenDropdown(null)}
                        >
                          {/* Parent Menu Item */}
                          {item.type === 'page' ? (
                            <Link
                              href={`/store/${slug}/${item.target}`}
                              className="text-sm hover:text-gray-300 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              {item.label}
                              {(item.show_dropdown || hasChildren) && (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              )}
                            </Link>
                          ) : item.type === 'section' ? (
                            <a
                              href={`#${item.target}`}
                              className="text-sm hover:text-gray-300 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              {item.label}
                              {(item.show_dropdown || hasChildren) && (
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
                              {(item.show_dropdown || hasChildren) && (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              )}
                            </a>
                          )}

                          {/* Dropdown Menu for Children */}
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
                                      href={`#${child.target}`}
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
                    // Default navigation if no menu items configured
                    <>
                      <a href="#home" className="text-sm hover:text-gray-300 transition-colors">
                        Home
                      </a>
                      <a href="#products" className="text-sm hover:text-gray-300 transition-colors flex items-center gap-1">
                        product
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </a>
                      <Link 
                        href={`/store/${slug}/profile`}
                        className="text-sm hover:text-gray-300 transition-colors flex items-center gap-1"
                      >
                        profile
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Link>
                      <a href="#contact" className="text-sm hover:text-gray-300 transition-colors">
                        contact address
                      </a>
                      <a href="#promotion" className="text-sm hover:text-gray-300 transition-colors">
                        Promotion
                      </a>
                    </>
                  )}
                </div>
                
                {/* Search box on the right */}
                <div className="ml-auto">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="search in this store"
                      className="bg-white text-gray-900 px-4 py-1 pr-10 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
                    />
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </header>

        {/* Welcome Message for Homepage */}
        {sortedSections.length === 0 && (
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-6">🏠</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to {company.name}</h2>
              <p className="text-lg text-gray-600 mb-6">
                Your storefront is ready! To customize your homepage:
              </p>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-xl text-blue-900 mb-3">📝 Quick Start Guide:</h3>
                <ol className="text-left text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <span className="font-bold text-blue-600 mr-2">1.</span>
                    <span>Create a page called "Home" or "Homepage" in <strong>Pages Manager</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold text-blue-600 mr-2">2.</span>
                    <span>Use the <strong>Page Builder</strong> to add sections (hero images, products, galleries, etc.)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold text-blue-600 mr-2">3.</span>
                    <span>Add the page to your <strong>Navigation Menu</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold text-blue-600 mr-2">4.</span>
                    <span>Create more pages (About Us, Services, Contact) and build your site!</span>
                  </li>
                </ol>
              </div>
              <a
                href="/dashboard/storefront/pages"
                className="inline-block px-8 py-3 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                style={{ backgroundColor: primary_color }}
              >
                🚀 Get Started - Create Your First Page
              </a>
            </div>
          </div>
        )}

        {/* Sections - Only show old homepage sections if they exist */}
        {sortedSections.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {sortedSections.map((section) => (
              <StorefrontSection 
                key={section.id} 
                section={section}
                primaryColor={primary_color}
                company={company}
                slug={slug}
              />
            ))}
          </div>
        )}

        {/* Banner - Fallback banner (deprecated) */}
        {!hasHeaderSection && banner_image && sortedSections.length > 0 && (
          <div 
            className="h-96 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${getImageUrl(banner_image)})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              {tagline && (
                <h2 className="text-4xl md:text-5xl font-bold text-white text-center px-4">
                  {tagline}
                </h2>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p>&copy; {new Date().getFullYear()} {company.name}. All rights reserved.</p>
            <p className="text-sm text-gray-400 mt-2">Powered by Pinoy Global Supply</p>
          </div>
        </footer>
      </div>
    </>
  );
}
// Component to render different section types
function StorefrontSection({ section, primaryColor, company, slug }) {
  const router = useRouter();
  const { section_type, title, content, images, settings } = section;
  const [currentSlide, setCurrentSlide] = useState(0);

  // Function to get a random product and open it in a new tab
  const handleImageClick = (e) => {
    e.preventDefault();
    const products = company?.products || [];
    
    console.log('Available products:', products.length);
    
    if (products.length === 0) {
      console.log('No products available');
      return;
    }
    
    // Get random product
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    
    console.log('Selected random product:', randomProduct.name, 'ID:', randomProduct.id);
    
    // Open the product detail page in a new tab (buyer view)
    window.open(`/buyer/products/${randomProduct.id}`, '_blank');
  };

  // Auto-advance carousel for hero and slider sections
  useEffect(() => {
    if ((section_type === 'hero' || section_type === 'slider')) {
      let totalSlides = 0;
      
      if (section_type === 'hero' && images && images.length > 1) {
        totalSlides = images.length;
      } else if (section_type === 'slider') {
        const imageCount = images ? images.length : 0;
        const videoCount = settings?.videos ? settings.videos.length : 0;
        totalSlides = imageCount + videoCount;
      }
      
      if (totalSlides > 1) {
        const timer = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % totalSlides);
        }, 5000); // Change slide every 5 seconds
        return () => clearInterval(timer);
      }
    }
  }, [section_type, images, settings]);

  if (section_type === 'hero') {
    // If has images, show as carousel/slider
    if (images && images.length > 0) {
      return (
        <section className="mb-0 -mt-12">
          <div className="relative h-96 md:h-[500px] overflow-hidden">
            {/* Slides */}
            {images.map((img, idx) => (
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
                <div className="absolute inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center pointer-events-none">
                  {title && (
                    <h2 className="text-4xl md:text-6xl font-bold text-white text-center px-4 drop-shadow-lg">
                      {title}
                    </h2>
                  )}
                </div>
              </div>
            ))}
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Dots indicator */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
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
    
    // If no images, show text banner
    if (title || content) {
      return (
        <section className="mb-16">
          <div 
            className="text-white rounded-lg shadow-lg p-12 text-center"
            style={{ background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)` }}
          >
            {title && <h2 className="text-4xl font-bold mb-4">{title}</h2>}
            {content && <p className="text-xl">{content}</p>}
          </div>
        </section>
      );
    }
    
    return null;
  }

  if (section_type === 'banner') {
    // Single static banner with image and text overlay
    if (images && images.length > 0) {
      return (
        <section className="mb-0 -mt-12">
          <div className="relative h-96 md:h-[400px] overflow-hidden">
            <div
              onClick={handleImageClick}
              className="absolute inset-0 cursor-pointer"
              style={{
                backgroundImage: `url(${getImageUrl(images[0])})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center pointer-events-none">
                {title && (
                  <h2 className="text-4xl md:text-6xl font-bold text-white text-center px-4 drop-shadow-lg">
                    {title}
                  </h2>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    }
    
    // If no image, show text banner
    if (title || content) {
      return (
        <section className="mb-16">
          <div 
            className="text-white rounded-lg shadow-lg p-12 text-center"
            style={{ background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)` }}
          >
            {title && <h2 className="text-4xl font-bold mb-4">{title}</h2>}
            {content && <p className="text-xl">{content}</p>}
          </div>
        </section>
      );
    }
    
    return null;
  }

  if (section_type === 'slider') {
    // Debug logging for slider section
    console.log('🎬 Slider Section Debug:');
    console.log('  - Title:', title);
    console.log('  - Title exists?', !!title);
    console.log('  - Title trimmed:', title?.trim());
    console.log('  - Settings:', settings);
    
    // Combine images and videos into slides
    const slides = [];
    
    // Add images as slides
    if (images && images.length > 0) {
      images.forEach(img => {
        slides.push({ type: 'image', src: img });
      });
    }
    
    // Add videos as slides
    const videos = settings?.videos || [];
    if (videos.length > 0) {
      videos.forEach(video => {
        slides.push({ type: 'video', src: video });
      });
    }
    
    if (slides.length === 0) return null;
    
    return (
      <section className="mb-0 -mt-12">
        <div className="relative h-96 md:h-[500px] overflow-hidden bg-black">
          {/* Slides */}
          {slides.map((slide, idx) => (
            <div
              key={idx}
              onClick={handleImageClick}
              className={`absolute inset-0 transition-opacity duration-1000 cursor-pointer ${
                idx === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {slide.type === 'image' ? (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${getImageUrl(slide.src)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {title && title.trim() !== '' && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center pointer-events-none">
                      <h2 className="text-4xl md:text-6xl font-bold text-white text-center px-4 drop-shadow-lg">
                        {title}
                      </h2>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <video
                    src={getImageUrl(slide.src)}
                    autoPlay={idx === currentSlide}
                    muted
                    loop
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  {title && title.trim() !== '' && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center pointer-events-none">
                      <h2 className="text-4xl md:text-6xl font-bold text-white text-center px-4 drop-shadow-lg">
                        {title}
                      </h2>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {/* Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          
          {/* Dots indicator */}
          {slides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-3 h-3 rounded-full transition ${
                    idx === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        {content && (
          <div className="bg-white rounded-lg shadow-md mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-700">{content}</p>
          </div>
        )}
      </section>
    );
  }

  if (section_type === 'about') {
    return (
      <section id="about" className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">{title || 'About Us'}</h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
      </section>
    );
  }

  if (section_type === 'heading') {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900" style={{ color: primaryColor }}>
            {title}
          </h2>
          {content && (
            <p className="text-xl text-center text-gray-700 max-w-3xl mx-auto">
              {content}
            </p>
          )}
        </div>
      </section>
    );
  }

  if (section_type === 'text') {
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
      <section className="mb-8">
        <div className="bg-white shadow-md p-8" style={backgroundStyle}>
          {bgImage && <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg"></div>}
          <div className={`${bgImage ? 'relative z-10' : ''} ${textAlign === 'center' ? 'mx-auto' : ''}`}>
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
        </div>
      </section>
    );
  }

  if (section_type === 'gallery' && images && images.length > 0) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">{title || 'Gallery'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, idx) => (
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
      </section>
    );
  }

  if (section_type === 'image' && images && images.length > 0) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {title && (
            <div className="p-6 pb-0">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">{title}</h2>
            </div>
          )}
          <img 
            src={getImageUrl(images[0])}
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
      </section>
    );
  }

  if (section_type === 'testimonials' && content) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">{title || 'Testimonials'}</h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed italic">{content}</p>
        </div>
      </section>
    );
  }

  if (section_type === 'certifications' && images && images.length > 0) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">{title || 'Certifications'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {images.map((img, idx) => (
              <div 
                key={idx} 
                onClick={handleImageClick}
                className="bg-gray-50 rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-xl transition transform hover:scale-105"
              >
                <img 
                  src={getImageUrl(img)}
                  alt={`Certification ${idx + 1}`}
                  className="w-full h-48 object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (section_type === 'products_showcase') {
    // Auto-display products with simple limit
    const products = company?.products || [];
    const productsLimit = settings?.products_limit || 8;
    const displayProducts = productsLimit === 0 ? products : products.slice(0, productsLimit);
    
    return (
      <section id="products" className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">{title || 'Our Products'}</h2>
          {content && (
            <p className="text-gray-700 mb-6">{content}</p>
          )}
          
          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} primaryColor={primaryColor} />
              ))}
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
          
          {productsLimit > 0 && products.length > productsLimit && (
            <div className="text-center mt-8">
              <p className="text-gray-700">
                Showing {productsLimit} of {products.length} products
              </p>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (section_type === 'featured_products') {
    // Manual selection of specific products - fetch from API
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    
    useEffect(() => {
      const fetchFeaturedProducts = async () => {
        const selectedProductIds = settings?.selected_products || [];
        if (selectedProductIds.length === 0) {
          setLoadingProducts(false);
          return;
        }
        
        if (!slug) return; // Wait for slug to be available
        
        try {
          // Fetch products from the public API using the storefront slug
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
    }, [slug]); // Add slug as dependency
    
    if (loadingProducts) {
      return (
        <section id="featured-products" className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-8">
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
      <section id="featured-products" className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">{title || 'Featured Products'}</h2>
          {content && (
            <p className="text-gray-700 mb-6">{content}</p>
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
      </section>
    );
  }

  if (section_type === 'contact') {
    return (
      <section id="contact" className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">{title || 'Contact Us'}</h2>
          {content && (
            <p className="text-gray-700 mb-6 whitespace-pre-wrap">{content}</p>
          )}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Get in Touch</h3>
            <form className="space-y-4">
              <input 
                type="text" 
                placeholder="Your Name"
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-opacity-50"
                style={{ '--tw-ring-color': primaryColor }}
              />
              <input 
                type="email" 
                placeholder="Your Email"
                className="w-full px-4 py-2 border rounded"
              />
              <textarea 
                placeholder="Your Message"
                rows="4"
                className="w-full px-4 py-2 border rounded"
              ></textarea>
              <button 
                type="submit"
                className="px-6 py-3 rounded text-white font-semibold"
                style={{ backgroundColor: primaryColor }}
              >
                Send Message
              </button>
            </form>
          </div>
          {images && images.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">Location</h3>
              <img 
                src={getImageUrl(images[0])}
                alt="Location or contact"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
        </div>
      </section>
    );
  }

  // Generic section fallback
  if (content) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          {title && <h2 className="text-3xl font-bold mb-6 text-gray-900">{title}</h2>}
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{content}</p>
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
  const [selectedProductId, setSelectedProductId] = useState(null);
  const images = product.images || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group">
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {images.length > 0 ? (
          <>
            <img 
              src={getImageUrl(images[currentImageIndex])}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => window.open(`/buyer/products/${product.id}`, '_blank')}
              onError={(e) => {
                console.error('Image failed to load:', getImageUrl(images[currentImageIndex]));
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

      {/* Product Detail Modal - for clickable images */}
      {selectedProductId && (
        <ProductDetailModal
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </div>
  );
}
