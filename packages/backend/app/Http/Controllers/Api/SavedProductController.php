<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedProduct;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class SavedProductController extends Controller
{
    /**
     * Get all saved products for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $savedProducts = SavedProduct::with(['product.company'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $savedProducts
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch saved products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save a product for the authenticated user.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'product_id' => 'required|integer|exists:products,id'
            ]);

            $user = Auth::user();
            $productId = $request->product_id;

            // Check if product is already saved
            $existingSave = SavedProduct::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first();

            if ($existingSave) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product is already saved'
                ], 409);
            }

            // Create new saved product
            $savedProduct = SavedProduct::create([
                'user_id' => $user->id,
                'product_id' => $productId
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Product saved successfully',
                'data' => $savedProduct
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove a saved product for the authenticated user.
     */
    public function destroy(Request $request, $productId): JsonResponse
    {
        try {
            $user = Auth::user();

            $savedProduct = SavedProduct::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first();

            if (!$savedProduct) {
                return response()->json([
                    'success' => false,
                    'message' => 'Saved product not found'
                ], 404);
            }

            $savedProduct->delete();

            return response()->json([
                'success' => true,
                'message' => 'Product removed from saved list'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove saved product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if a product is saved by the authenticated user.
     */
    public function checkSaved(Request $request, $productId): JsonResponse
    {
        try {
            $user = Auth::user();

            $isSaved = SavedProduct::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->exists();

            return response()->json([
                'success' => true,
                'is_saved' => $isSaved
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check saved status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
