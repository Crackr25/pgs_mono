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
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\ChatMessageController;

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
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
});

// Public routes (no authentication required)
Route::get('/companies', [CompanyController::class, 'index']);
Route::get('/companies/{company}', [CompanyController::class, 'show']);
Route::get('/companies/{company}/products', [CompanyController::class, 'products']);

// Marketplace routes (public - for buyer home page)
Route::get('/marketplace/products', [MarketplaceController::class, 'getRandomProducts']);
Route::get('/marketplace/products/{id}', [MarketplaceController::class, 'getProductDetails']);
Route::post('/marketplace/inquiries', [MarketplaceController::class, 'submitInquiry']);
Route::get('/marketplace/categories', [MarketplaceController::class, 'getCategories']);
Route::get('/marketplace/locations', [MarketplaceController::class, 'getLocations']);


// Quote creation (public - buyers don't need accounts)
Route::post('/quotes', [QuoteController::class, 'store']);
Route::get('/quotes', [QuoteController::class, 'index']);
Route::get('/quotes/stats', [QuoteController::class, 'stats']);
Route::get('/quotes/{quote}', [QuoteController::class, 'show']);

// Message creation (public - buyers don't need accounts)
Route::post('/messages', [MessageController::class, 'store']);


// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{product}', [ProductController::class, 'show']);

    
    // Company management
    Route::post('/companies', [CompanyController::class, 'store']);
    Route::put('/companies/{company}', [CompanyController::class, 'update']);
    Route::delete('/companies/{company}', [CompanyController::class, 'destroy']);
    
    // Company onboarding file uploads
    Route::post('/companies/{company}/upload-documents', [CompanyController::class, 'uploadDocuments']);
    Route::post('/companies/{company}/upload-kyc', [CompanyController::class, 'uploadKyc']);
    Route::post('/companies/{company}/upload-factory-tour', [CompanyController::class, 'uploadFactoryTour']);
    
    // Product management
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    Route::post('/products/{product}/upload-images', [ProductController::class, 'uploadImages']);
    Route::put('/products/{product}/image-order', [ProductController::class, 'updateImageOrder']);
    Route::delete('/products/{product}/images/{image}', [ProductController::class, 'deleteImage']);
    
    // Quote management
    Route::put('/quotes/{quote}', [QuoteController::class, 'update']);
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
    Route::post('/buyer/rfqs/{id}/upload-attachment', [BuyerRFQController::class, 'uploadAttachment']);
    Route::delete('/buyer/rfqs/{id}/remove-attachment', [BuyerRFQController::class, 'removeAttachment']);
    Route::get('/buyer/rfqs/categories', [BuyerRFQController::class, 'getCategories']);
    Route::get('/buyer/rfqs/dashboard-stats', [BuyerRFQController::class, 'getDashboardStats']);

    // Saved Products routes
    Route::get('/saved-products', [SavedProductController::class, 'index']);
    Route::post('/saved-products', [SavedProductController::class, 'store']);
    Route::delete('/saved-products/{productId}', [SavedProductController::class, 'destroy']);
    Route::get('/saved-products/check/{productId}', [SavedProductController::class, 'checkSaved']);

    // Supplier routes
    Route::get('/suppliers/{id}', [SupplierController::class, 'show']);
    Route::get('/suppliers/{id}/products', [SupplierController::class, 'products']);
    Route::get('/suppliers/{id}/reviews', [SupplierController::class, 'reviews']);

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
    Route::get('/cart/count', [CartController::class, 'count']);

    
});
