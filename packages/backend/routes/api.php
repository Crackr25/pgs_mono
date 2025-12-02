<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\MarketplaceController;
use App\Http\Controllers\Api\BuyerMessageController;
use App\Http\Controllers\Api\BuyerRFQController;
use App\Http\Controllers\Api\SavedProductController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\StarredSupplierController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\ContactInquiryController;
use App\Http\Controllers\Api\ShippingAddressController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\RealAnalyticsController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\ChatMessageController;
use App\Http\Controllers\StripeConnectController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AdminPaymentController;
use App\Http\Controllers\SellerPayoutController;
use App\Http\Controllers\AgentController;
use App\Http\Controllers\TestAgentController;
use App\Http\Controllers\BroadcastingAuthController;
use App\Http\Controllers\Api\UserProfileController;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Broadcasting authorization routes (custom implementation)
Route::post('/broadcasting/auth', [BroadcastingAuthController::class, 'authenticate'])
    ->middleware('auth:sanctum');

// Authentication routes (public)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Authentication routes (protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::get('/auth/user/company', [AuthController::class, 'getUserCompany']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    
    // User Profile Management
    Route::get('/profile', [UserProfileController::class, 'show']);
    Route::put('/profile', [UserProfileController::class, 'update']);
    Route::post('/profile/upload-picture', [UserProfileController::class, 'uploadProfilePicture']);
    Route::delete('/profile/picture', [UserProfileController::class, 'deleteProfilePicture']);
    Route::post('/profile/change-password', [UserProfileController::class, 'changePassword']);
});

// Public routes (no authentication required)
Route::get('/companies', [CompanyController::class, 'index']);
Route::get('/companies/{company}', [CompanyController::class, 'show']);
Route::get('/companies/{company}/products', [CompanyController::class, 'products']);
Route::get('/marketplace/stats', [CompanyController::class, 'getMarketplaceStats']);

// Marketplace routes (public - for buyer home page)
Route::get('/marketplace/products', [MarketplaceController::class, 'getRandomProducts']);
Route::get('/marketplace/products/{id}', [MarketplaceController::class, 'getProductDetails']);
Route::get('/marketplace/products/{id}/related', [MarketplaceController::class, 'getRelatedProducts']);
Route::post('/marketplace/inquiries', [MarketplaceController::class, 'submitInquiry']);
Route::get('/marketplace/categories', [MarketplaceController::class, 'getCategories']);
Route::get('/marketplace/locations', [MarketplaceController::class, 'getLocations']);

// Search routes (public - for search functionality)
Route::get('/search/suggestions', [SearchController::class, 'getSuggestions']);
Route::get('/search/products', [SearchController::class, 'searchProducts']);
Route::get('/search/popular', [SearchController::class, 'getPopularSearches']);
Route::post('/search/track', [SearchController::class, 'trackSearch']);

// Supplier routes (public - for supplier profile browsing like Alibaba)
Route::get('/suppliers/{id}', [SupplierController::class, 'show']);
Route::get('/suppliers/{id}/products', [SupplierController::class, 'products']);
Route::get('/suppliers/{id}/reviews', [SupplierController::class, 'reviews']);
Route::get('/suppliers/{id}/reviews/stats', [SupplierController::class, 'reviewStats']);
Route::post('/suppliers/{id}/reviews', [SupplierController::class, 'submitReview']); // Submit review (public)

// Quote creation (public - buyers don't need accounts)
Route::post('/quotes', [QuoteController::class, 'store']);
Route::get('/quotes', [QuoteController::class, 'index']);
Route::get('/quotes/stats', [QuoteController::class, 'stats']);
Route::get('/quotes/{quote}', [QuoteController::class, 'show']);

// Analytics routes (protected - requires authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/analytics/dashboard', [RealAnalyticsController::class, 'getDashboardAnalytics']);
    Route::get('/analytics/products/all', [RealAnalyticsController::class, 'getAllProducts']);
    Route::get('/analytics/buyer-engagement/export', [RealAnalyticsController::class, 'exportBuyerEngagement']);
    Route::get('/analytics/products/optimizations', [RealAnalyticsController::class, 'getProductOptimizations']);
    Route::get('/analytics/buyers/top', [RealAnalyticsController::class, 'getTopBuyers']);
    Route::get('/analytics/trends', [RealAnalyticsController::class, 'getMarketTrends']);
    Route::get('/analytics/export', [RealAnalyticsController::class, 'exportAnalyticsReport']);
});

// Message creation (public - buyers don't need accounts)
Route::post('/messages', [MessageController::class, 'store']);


// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{product}', [ProductController::class, 'show']);

    
    // Company management 
    Route::get('/companies/current', [CompanyController::class, 'getCurrentUserCompany']);
    Route::post('/companies', [CompanyController::class, 'store']);
    Route::put('/companies/{company}', [CompanyController::class, 'update']);
    Route::delete('/companies/{company}', [CompanyController::class, 'destroy']);
    
    // Company onboarding file uploads
    Route::post('/companies/{company}/upload-documents', [CompanyController::class, 'uploadDocuments']);
    Route::post('/companies/{company}/upload-kyc', [CompanyController::class, 'uploadKyc']);
    Route::post('/companies/{company}/upload-factory-tour', [CompanyController::class, 'uploadFactoryTour']);
    
    // Company banner management
    Route::post('/companies/{company}/upload-banner', [CompanyController::class, 'uploadBanner']);
    Route::delete('/companies/{company}/banner', [CompanyController::class, 'deleteBanner']);
    Route::post('/companies/{company}/upload-logo', [CompanyController::class, 'uploadLogo']);
    Route::delete('/companies/{company}/logo', [CompanyController::class, 'deleteLogo']);
    
    // Product management
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    Route::post('/products/{product}/upload-images', [ProductController::class, 'uploadImages']);
    Route::post('/products/{product}/upload-videos', [ProductController::class, 'uploadVideos']);
    Route::put('/products/{product}/image-order', [ProductController::class, 'updateImageOrder']);
    Route::delete('/products/{product}/images/{image}', [ProductController::class, 'deleteImage']);
    Route::delete('/products/{product}/videos/{video}', [ProductController::class, 'deleteVideo']);
    
    // Quote management
    Route::put('/quotes/{quote}', [QuoteController::class, 'update']);
    Route::put('/quotes/{quote}/status', [QuoteController::class, 'updateStatus']);
    Route::post('/quotes/{quote}/respond', [QuoteController::class, 'respond']);
    Route::delete('/quotes/{quote}', [QuoteController::class, 'destroy']);
    
    // Order management
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::put('/orders/{order}', [OrderController::class, 'update']);
    Route::delete('/orders/{order}', [OrderController::class, 'destroy']);
    Route::get('/orders/{order}/tracking', [OrderController::class, 'tracking']);
    
    // Message management
    Route::get('/messages', [MessageController::class, 'index']);
    Route::get('/messages/{message}', [MessageController::class, 'show']);
    Route::put('/messages/{message}/read', [MessageController::class, 'markAsRead']);
    Route::delete('/messages/{message}', [MessageController::class, 'destroy']);
    Route::get('/messages/unread-count', [MessageController::class, 'getUnreadCount']);
    
    // Real-time chat routes
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::get('/conversations/{id}', [ConversationController::class, 'show']);
    Route::get('/conversations/{id}/messages/after', [ConversationController::class, 'getMessagesAfter']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::post('/chat/send', [ChatMessageController::class, 'store']);
    Route::post('/chat/mark-read', [ChatMessageController::class, 'markAsRead']);
    Route::get('/chat/unread-count', [ChatMessageController::class, 'getUnreadCount']);

    // Buyer-specific message routes
    Route::get('/buyer/conversations', [BuyerMessageController::class, 'getConversations']);
    Route::get('/buyer/conversations/{id}', [BuyerMessageController::class, 'getConversationMessages']);
    Route::get('/buyer/conversations/{id}/messages/after', [BuyerMessageController::class, 'getMessagesAfter']);
    Route::post('/buyer/messages/send', [BuyerMessageController::class, 'sendMessage']);
    Route::post('/buyer/messages/send-attachment', [BuyerMessageController::class, 'sendAttachment']);
    Route::post('/buyer/messages/mark-read', [BuyerMessageController::class, 'markAsRead']);
    Route::get('/buyer/messages/unread-count', [BuyerMessageController::class, 'getUnreadCount']);

    // Buyer RFQ routes
    Route::get('/buyer/rfqs', [BuyerRFQController::class, 'index']);
    Route::post('/buyer/rfqs', [BuyerRFQController::class, 'store']);
    Route::get('/buyer/rfqs/{id}', [BuyerRFQController::class, 'show']);
    Route::put('/buyer/rfqs/{id}', [BuyerRFQController::class, 'update']);
    Route::delete('/buyer/rfqs/{id}', [BuyerRFQController::class, 'destroy']);
    Route::post('/buyer/rfqs/{id}/publish', [BuyerRFQController::class, 'publish']);
    Route::post('/buyer/rfqs/{id}/close', [BuyerRFQController::class, 'close']);
    Route::get('/buyer/rfqs/{id}/responses', [BuyerRFQController::class, 'getResponses']);
    Route::post('/buyer/rfqs/{id}/upload-attachment', [BuyerRFQController::class, 'uploadAttachment']);
    Route::delete('/buyer/rfqs/{id}/remove-attachment', [BuyerRFQController::class, 'removeAttachment']);
    Route::get('/buyer/rfqs/categories', [BuyerRFQController::class, 'getCategories']);
    Route::get('/buyer/rfqs/dashboard-stats', [BuyerRFQController::class, 'getDashboardStats']);

    // Saved Products routes
    Route::get('/saved-products', [SavedProductController::class, 'index']);
    Route::post('/saved-products', [SavedProductController::class, 'store']);
    Route::delete('/saved-products/{productId}', [SavedProductController::class, 'destroy']);
    Route::get('/saved-products/check/{productId}', [SavedProductController::class, 'checkSaved']);

    // Starred Suppliers routes
    Route::get('/starred-suppliers', [StarredSupplierController::class, 'index']);
    Route::post('/starred-suppliers', [StarredSupplierController::class, 'store']);
    Route::delete('/starred-suppliers/{supplierId}', [StarredSupplierController::class, 'destroy']);
    Route::get('/starred-suppliers/check/{supplierId}', [StarredSupplierController::class, 'checkStarred']);

    // Cart routes
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);
    Route::post('/cart/remove-items', [CartController::class, 'removeItems']);
    Route::get('/cart/count', [CartController::class, 'count']);

    // Shipping Address routes
    Route::get('/shipping-addresses', [ShippingAddressController::class, 'index']);
    Route::post('/shipping-addresses', [ShippingAddressController::class, 'store']);
    Route::get('/shipping-addresses/{id}', [ShippingAddressController::class, 'show']);
    Route::put('/shipping-addresses/{id}', [ShippingAddressController::class, 'update']);
    Route::delete('/shipping-addresses/{id}', [ShippingAddressController::class, 'destroy']);
    Route::post('/shipping-addresses/{id}/set-default', [ShippingAddressController::class, 'setDefault']);
    Route::get('/shipping-addresses/default/get', [ShippingAddressController::class, 'getDefault']);
});

// Contact inquiry routes (public - anyone can submit)
Route::post('/contact-inquiries', [ContactInquiryController::class, 'store']);

// Contact inquiry management routes (protected - admin only)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/contact-inquiries', [ContactInquiryController::class, 'index']);
    Route::get('/contact-inquiries/stats', [ContactInquiryController::class, 'stats']);
    Route::get('/contact-inquiries/{contactInquiry}', [ContactInquiryController::class, 'show']);
    Route::put('/contact-inquiries/{contactInquiry}', [ContactInquiryController::class, 'update']);
    Route::delete('/contact-inquiries/{contactInquiry}', [ContactInquiryController::class, 'destroy']);
});

// Stripe Connect routes (protected - merchants only)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/stripe/create-express-account', [StripeConnectController::class, 'createExpressAccount']);
    Route::post('/stripe/create-onboarding-link', [StripeConnectController::class, 'createOnboardingLink']);
    Route::get('/stripe/account-status', [StripeConnectController::class, 'getAccountStatus']);
    Route::post('/stripe/create-login-link', [StripeConnectController::class, 'createLoginLink']);
    Route::put('/stripe/update-account', [StripeConnectController::class, 'updateAccountInformation']);
    Route::put('/stripe/update-additional-info', [StripeConnectController::class, 'updateAdditionalInfo']);
    Route::get('/stripe/account-requirements', [StripeConnectController::class, 'getAccountRequirements']);
    Route::get('/stripe/debug-account', [StripeConnectController::class, 'debugAccountStructure']);
    Route::post('/stripe/validate-account-data', [StripeConnectController::class, 'validateAccountData']);
});

// Stripe webhook (public - no authentication)
Route::post('/stripe/webhook', [StripeConnectController::class, 'handleWebhook']);

// Payment processing routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/payments/create-intent', [PaymentController::class, 'createPaymentIntent']);
    Route::post('/payments/create-order-intent', [PaymentController::class, 'createOrderPaymentIntent']);
    Route::post('/payments/confirm', [PaymentController::class, 'confirmPayment']);
    Route::post('/payments/create-manual-transfer', [PaymentController::class, 'createManualTransfer']);
});

// Payment webhook (public - no authentication)
Route::post('/payments/webhook', [PaymentController::class, 'handlePaymentWebhook']);

// Seller Payout routes
Route::middleware('auth:sanctum')->group(function () {
    // Seller routes - get their own payouts
    Route::get('/seller/payouts', [SellerPayoutController::class, 'getSellerPayouts']);
    
    // Admin routes - manage all payouts
    Route::get('/admin/payouts', [SellerPayoutController::class, 'index']);
    Route::get('/admin/payouts/statistics', [SellerPayoutController::class, 'getStatistics']);
    Route::post('/admin/payouts/create-from-order', [SellerPayoutController::class, 'createFromOrder']);
    Route::post('/admin/payouts/{payout}/process-stripe', [SellerPayoutController::class, 'processStripePayout']);
    Route::post('/admin/payouts/{payout}/complete-manual', [SellerPayoutController::class, 'completeManualPayout']);
    Route::post('/admin/payouts/{payout}/retry', [SellerPayoutController::class, 'retryPayout']);
    
    // Admin Payment Ledger routes - comprehensive transaction tracking
    Route::get('/admin/payments', [AdminPaymentController::class, 'index']);
    Route::get('/admin/payments/statistics', [AdminPaymentController::class, 'statistics']);
    Route::get('/admin/payments/{payment}', [AdminPaymentController::class, 'show']);

    // Agent Management routes - for sellers to manage their agents
    Route::prefix('agents')->group(function () {
        Route::get('/', [AgentController::class, 'index']);
        Route::post('/', [AgentController::class, 'store']);
        Route::get('/roles', [AgentController::class, 'getRoles']);
        Route::get('/statistics', [AgentController::class, 'statistics']);
        Route::get('/{agent}', [AgentController::class, 'show']);
        Route::put('/{agent}', [AgentController::class, 'update']);
        Route::delete('/{agent}', [AgentController::class, 'destroy']);
        Route::post('/assign-conversation', [AgentController::class, 'assignConversation']);
    });

    // Public agent invitation acceptance (no auth required)


    // Test agent routes (development only)
 
});
    Route::post('/agents/accept-invitation', [AgentController::class, 'acceptInvitation']);

    Route::prefix('test/agents')->group(function () {
            Route::get('/create', [TestAgentController::class, 'createTestAgent']);
            Route::get('/pending', [TestAgentController::class, 'getPendingInvitations']);
            Route::delete('/cleanup', [TestAgentController::class, 'cleanupTestAgents']);
    });

// Storefront routes (protected - company owners manage their storefronts)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/storefronts', [\App\Http\Controllers\Api\StorefrontController::class, 'index']);
    Route::post('/storefronts', [\App\Http\Controllers\Api\StorefrontController::class, 'store']);
    Route::put('/storefronts/{id}', [\App\Http\Controllers\Api\StorefrontController::class, 'update']);
    Route::delete('/storefronts/{id}', [\App\Http\Controllers\Api\StorefrontController::class, 'destroy']);
    Route::post('/storefronts/{id}/upload-banner', [\App\Http\Controllers\Api\StorefrontController::class, 'uploadBanner']);
    Route::apiResource('/storefront-sections', \App\Http\Controllers\Api\StorefrontSectionController::class)->except(['index', 'show']);
    
    // Storefront Pages (Dynamic-style page management)
    Route::get('/storefront/pages', [\App\Http\Controllers\Api\StorefrontPageController::class, 'index']);
    Route::post('/storefront/pages', [\App\Http\Controllers\Api\StorefrontPageController::class, 'store']);
    Route::get('/storefront/pages/{slug}', [\App\Http\Controllers\Api\StorefrontPageController::class, 'show']);
    Route::put('/storefront/pages/{id}', [\App\Http\Controllers\Api\StorefrontPageController::class, 'update']);
    Route::delete('/storefront/pages/{id}', [\App\Http\Controllers\Api\StorefrontPageController::class, 'destroy']);
    
    // Storefront Menu Items (Custom navigation builder)
    Route::get('/storefront/menu', [\App\Http\Controllers\Api\StorefrontMenuController::class, 'index']);
    Route::post('/storefront/menu', [\App\Http\Controllers\Api\StorefrontMenuController::class, 'store']);
    Route::put('/storefront/menu/{id}', [\App\Http\Controllers\Api\StorefrontMenuController::class, 'update']);
    Route::delete('/storefront/menu/{id}', [\App\Http\Controllers\Api\StorefrontMenuController::class, 'destroy']);
    Route::post('/storefront/menu/reorder', [\App\Http\Controllers\Api\StorefrontMenuController::class, 'reorder']);
});

// Public storefront view (no auth required)
Route::get('/storefront-themes', [\App\Http\Controllers\Api\StorefrontThemeController::class, 'index']);
Route::get('/storefront-themes/{id}', [\App\Http\Controllers\Api\StorefrontThemeController::class, 'show']);
Route::get('/public/storefront/{slug}', [\App\Http\Controllers\Api\PublicStorefrontController::class, 'show']);
Route::get('/public/storefront/{slug}/menu', [\App\Http\Controllers\Api\PublicStorefrontController::class, 'getMenu']);
Route::get('/public/storefront/{slug}/products', [\App\Http\Controllers\Api\PublicStorefrontController::class, 'getProducts']);
Route::get('/public/storefront/{slug}/page/{pageSlug}', [\App\Http\Controllers\Api\PublicStorefrontController::class, 'showPage']);

// Admin routes - Protected by admin middleware
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // User Management
    Route::get('/users', [\App\Http\Controllers\Admin\AdminUserController::class, 'index']);
    Route::get('/users/statistics', [\App\Http\Controllers\Admin\AdminUserController::class, 'statistics']);
    Route::get('/users/{id}', [\App\Http\Controllers\Admin\AdminUserController::class, 'show']);
    Route::put('/users/{id}', [\App\Http\Controllers\Admin\AdminUserController::class, 'update']);
    Route::delete('/users/{id}', [\App\Http\Controllers\Admin\AdminUserController::class, 'destroy']);
    Route::post('/users/{id}/toggle-status', [\App\Http\Controllers\Admin\AdminUserController::class, 'toggleStatus']);
    Route::post('/users/{id}/reset-password', [\App\Http\Controllers\Admin\AdminUserController::class, 'resetPassword']);
    Route::post('/users/{id}/impersonate', [\App\Http\Controllers\Admin\AdminUserController::class, 'impersonate']);
    Route::post('/users/stop-impersonation', [\App\Http\Controllers\Admin\AdminUserController::class, 'stopImpersonation']);
    Route::get('/users/{id}/activity', [\App\Http\Controllers\Admin\AdminUserController::class, 'activityLog']);

    // Company Management
    Route::get('/companies', [\App\Http\Controllers\Admin\AdminCompanyController::class, 'index']);
    Route::get('/companies/statistics', [\App\Http\Controllers\Admin\AdminCompanyController::class, 'statistics']);
    Route::get('/companies/pending-verifications', [\App\Http\Controllers\Admin\AdminCompanyController::class, 'pendingVerifications']);
    Route::get('/companies/{id}', [\App\Http\Controllers\Admin\AdminCompanyController::class, 'show']);
    Route::put('/companies/{id}', [\App\Http\Controllers\Admin\AdminCompanyController::class, 'update']);
    Route::delete('/companies/{id}', [\App\Http\Controllers\Admin\AdminCompanyController::class, 'destroy']);
    Route::post('/companies/{id}/verify', [\App\Http\Controllers\Admin\AdminCompanyController::class, 'verify']);
    Route::post('/companies/{id}/reject', [\App\Http\Controllers\Admin\AdminCompanyController::class, 'reject']);
    Route::get('/companies/{id}/documents', [\App\Http\Controllers\Admin\AdminCompanyController::class, 'documents']);
    Route::post('/companies/{id}/stripe-status', [\App\Http\Controllers\Admin\AdminCompanyController::class, 'updateStripeStatus']);
    Route::get('/companies/{id}/activity', [\App\Http\Controllers\Admin\AdminCompanyController::class, 'activity']);

    // Agent Management
    Route::get('/agents', [\App\Http\Controllers\Admin\AdminAgentController::class, 'index']);
    Route::get('/agents/statistics', [\App\Http\Controllers\Admin\AdminAgentController::class, 'statistics']);
    Route::get('/agents/pending-invitations', [\App\Http\Controllers\Admin\AdminAgentController::class, 'pendingInvitations']);
    Route::post('/agents/create-invitation', [\App\Http\Controllers\Admin\AdminAgentController::class, 'createInvitation']);
    Route::get('/agents/{id}', [\App\Http\Controllers\Admin\AdminAgentController::class, 'show']);
    Route::put('/agents/{id}', [\App\Http\Controllers\Admin\AdminAgentController::class, 'update']);
    Route::delete('/agents/{id}', [\App\Http\Controllers\Admin\AdminAgentController::class, 'destroy']);
    Route::post('/agents/{id}/toggle-status', [\App\Http\Controllers\Admin\AdminAgentController::class, 'toggleStatus']);
    Route::post('/agents/{id}/permissions', [\App\Http\Controllers\Admin\AdminAgentController::class, 'updatePermissions']);
    Route::post('/agents/{id}/change-company', [\App\Http\Controllers\Admin\AdminAgentController::class, 'changeCompany']);
    Route::post('/agents/{id}/resend-invitation', [\App\Http\Controllers\Admin\AdminAgentController::class, 'resendInvitation']);
    Route::get('/agents/{id}/activity', [\App\Http\Controllers\Admin\AdminAgentController::class, 'activity']);

    // Product Management
    Route::get('/products', [\App\Http\Controllers\Admin\AdminProductController::class, 'index']);
    Route::get('/products/statistics', [\App\Http\Controllers\Admin\AdminProductController::class, 'statistics']);
    Route::get('/products/categories', [\App\Http\Controllers\Admin\AdminProductController::class, 'categories']);
    Route::get('/products/out-of-stock', [\App\Http\Controllers\Admin\AdminProductController::class, 'outOfStock']);
    Route::get('/products/low-stock', [\App\Http\Controllers\Admin\AdminProductController::class, 'lowStock']);
    Route::get('/products/{id}', [\App\Http\Controllers\Admin\AdminProductController::class, 'show']);
    Route::put('/products/{id}', [\App\Http\Controllers\Admin\AdminProductController::class, 'update']);
    Route::delete('/products/{id}', [\App\Http\Controllers\Admin\AdminProductController::class, 'destroy']);
    Route::post('/products/{id}/toggle-status', [\App\Http\Controllers\Admin\AdminProductController::class, 'toggleStatus']);
    Route::post('/products/bulk-update', [\App\Http\Controllers\Admin\AdminProductController::class, 'bulkUpdate']);
    Route::get('/products/{id}/activity', [\App\Http\Controllers\Admin\AdminProductController::class, 'activity']);

    // Order Management
    Route::get('/orders', [\App\Http\Controllers\Admin\AdminOrderController::class, 'index']);
    Route::get('/orders/statistics', [\App\Http\Controllers\Admin\AdminOrderController::class, 'statistics']);
    Route::get('/orders/pending', [\App\Http\Controllers\Admin\AdminOrderController::class, 'pending']);
    Route::get('/orders/recent', [\App\Http\Controllers\Admin\AdminOrderController::class, 'recent']);
    Route::get('/orders/revenue', [\App\Http\Controllers\Admin\AdminOrderController::class, 'revenue']);
    Route::get('/orders/export', [\App\Http\Controllers\Admin\AdminOrderController::class, 'export']);
    Route::get('/orders/status/{status}', [\App\Http\Controllers\Admin\AdminOrderController::class, 'byStatus']);
    Route::get('/orders/{id}', [\App\Http\Controllers\Admin\AdminOrderController::class, 'show']);
    Route::put('/orders/{id}', [\App\Http\Controllers\Admin\AdminOrderController::class, 'update']);
    Route::post('/orders/{id}/status', [\App\Http\Controllers\Admin\AdminOrderController::class, 'updateStatus']);
    Route::post('/orders/{id}/payment-status', [\App\Http\Controllers\Admin\AdminOrderController::class, 'updatePaymentStatus']);
    Route::post('/orders/bulk-update', [\App\Http\Controllers\Admin\AdminOrderController::class, 'bulkUpdate']);
    Route::get('/orders/{id}/activity', [\App\Http\Controllers\Admin\AdminOrderController::class, 'activity']);

    // Payment Management
    Route::get('/payments', [\App\Http\Controllers\Admin\AdminPaymentController::class, 'index']);
    Route::get('/payments/statistics', [\App\Http\Controllers\Admin\AdminPaymentController::class, 'statistics']);
    Route::get('/payments/completed', [\App\Http\Controllers\Admin\AdminPaymentController::class, 'completed']);
    Route::get('/payments/failed', [\App\Http\Controllers\Admin\AdminPaymentController::class, 'failed']);
    Route::get('/payments/pending', [\App\Http\Controllers\Admin\AdminPaymentController::class, 'pending']);
    Route::get('/payments/revenue', [\App\Http\Controllers\Admin\AdminPaymentController::class, 'revenue']);
    Route::get('/payments/platform-fees', [\App\Http\Controllers\Admin\AdminPaymentController::class, 'platformFees']);
    Route::get('/payments/export', [\App\Http\Controllers\Admin\AdminPaymentController::class, 'export']);
    Route::get('/payments/method/{method}', [\App\Http\Controllers\Admin\AdminPaymentController::class, 'byMethod']);
    Route::get('/payments/{id}', [\App\Http\Controllers\Admin\AdminPaymentController::class, 'show']);
    Route::get('/payments/{id}/activity', [\App\Http\Controllers\Admin\AdminPaymentController::class, 'activity']);

    // Stripe Management
    Route::get('/stripe/overview', [\App\Http\Controllers\Admin\AdminStripeController::class, 'overview']);
    Route::get('/stripe/accounts', [\App\Http\Controllers\Admin\AdminStripeController::class, 'connectedAccounts']);
    Route::get('/stripe/accounts/{companyId}', [\App\Http\Controllers\Admin\AdminStripeController::class, 'accountDetails']);
    Route::get('/stripe/transactions', [\App\Http\Controllers\Admin\AdminStripeController::class, 'transactions']);
    Route::get('/stripe/payouts', [\App\Http\Controllers\Admin\AdminStripeController::class, 'payouts']);
    Route::get('/stripe/config', [\App\Http\Controllers\Admin\AdminStripeController::class, 'configStatus']);
    Route::post('/stripe/test-connection', [\App\Http\Controllers\Admin\AdminStripeController::class, 'testConnection']);

    // Chat Monitoring
    Route::get('/chat/statistics', [\App\Http\Controllers\Admin\AdminChatController::class, 'statistics']);
    Route::get('/chat/conversations', [\App\Http\Controllers\Admin\AdminChatController::class, 'conversations']);
    Route::get('/chat/conversations/recent', [\App\Http\Controllers\Admin\AdminChatController::class, 'recent']);
    Route::get('/chat/conversations/active', [\App\Http\Controllers\Admin\AdminChatController::class, 'active']);
    Route::get('/chat/conversations/{id}', [\App\Http\Controllers\Admin\AdminChatController::class, 'show']);
    Route::get('/chat/conversations/{id}/messages', [\App\Http\Controllers\Admin\AdminChatController::class, 'messages']);
    Route::get('/chat/conversations/{id}/activity', [\App\Http\Controllers\Admin\AdminChatController::class, 'activity']);
    Route::put('/chat/conversations/{id}/status', [\App\Http\Controllers\Admin\AdminChatController::class, 'updateStatus']);
    Route::post('/chat/conversations/{id}/assign-agent', [\App\Http\Controllers\Admin\AdminChatController::class, 'assignAgent']);
    Route::get('/chat/messages/search', [\App\Http\Controllers\Admin\AdminChatController::class, 'searchMessages']);
    Route::get('/chat/unread-count', [\App\Http\Controllers\Admin\AdminChatController::class, 'unreadCount']);

    // Contact Inquiries
    Route::get('/inquiries/statistics', [\App\Http\Controllers\Admin\AdminInquiryController::class, 'statistics']);
    Route::get('/inquiries', [\App\Http\Controllers\Admin\AdminInquiryController::class, 'index']);
    Route::get('/inquiries/pending', [\App\Http\Controllers\Admin\AdminInquiryController::class, 'pending']);
    Route::get('/inquiries/recent', [\App\Http\Controllers\Admin\AdminInquiryController::class, 'recent']);
    Route::get('/inquiries/{id}', [\App\Http\Controllers\Admin\AdminInquiryController::class, 'show']);
    Route::put('/inquiries/{id}', [\App\Http\Controllers\Admin\AdminInquiryController::class, 'update']);
    Route::delete('/inquiries/{id}', [\App\Http\Controllers\Admin\AdminInquiryController::class, 'destroy']);
    Route::post('/inquiries/bulk-update', [\App\Http\Controllers\Admin\AdminInquiryController::class, 'bulkUpdate']);
});
