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

// Authentication routes (public)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Authentication routes (protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::get('/auth/user/company', [AuthController::class, 'getUserCompany']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
});

// Public routes (no authentication required)
Route::get('/companies', [CompanyController::class, 'index']);
Route::get('/companies/{company}', [CompanyController::class, 'show']);
Route::get('/companies/{company}/products', [CompanyController::class, 'products']);
Route::get('/marketplace/stats', [CompanyController::class, 'getMarketplaceStats']);

// Marketplace routes (public - for buyer home page)
Route::get('/marketplace/products', [MarketplaceController::class, 'getRandomProducts']);
Route::get('/marketplace/products/{id}', [MarketplaceController::class, 'getProductDetails']);
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
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::post('/chat/send', [ChatMessageController::class, 'store']);
    Route::post('/chat/mark-read', [ChatMessageController::class, 'markAsRead']);
    Route::get('/chat/unread-count', [ChatMessageController::class, 'getUnreadCount']);

    // Buyer-specific message routes
    Route::get('/buyer/conversations', [BuyerMessageController::class, 'getConversations']);
    Route::get('/buyer/conversations/{id}', [BuyerMessageController::class, 'getConversationMessages']);
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
