<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\MessageController;
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


// Quote creation (public - buyers don't need accounts)
Route::post('/quotes', [QuoteController::class, 'store']);
Route::get('/quotes', [QuoteController::class, 'index']);
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

    
});
