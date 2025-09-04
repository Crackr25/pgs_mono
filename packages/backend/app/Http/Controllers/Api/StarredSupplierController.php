<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StarredSupplier;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class StarredSupplierController extends Controller
{
    /**
     * Get all starred suppliers for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $starredSuppliers = StarredSupplier::with(['supplier'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json($starredSuppliers);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch starred suppliers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Star a supplier for the authenticated user.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'supplier_id' => 'required|integer|exists:companies,id'
            ]);

            $user = Auth::user();
            $supplierId = $request->supplier_id;

            // Check if supplier is already starred
            $existingStar = StarredSupplier::where('user_id', $user->id)
                ->where('supplier_id', $supplierId)
                ->first();

            if ($existingStar) {
                return response()->json([
                    'success' => false,
                    'message' => 'Supplier is already starred'
                ], 409);
            }

            // Create new starred supplier
            $starredSupplier = StarredSupplier::create([
                'user_id' => $user->id,
                'supplier_id' => $supplierId
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Supplier starred successfully',
                'data' => $starredSupplier
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
                'message' => 'Failed to star supplier',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove a starred supplier for the authenticated user.
     */
    public function destroy(Request $request, $supplierId): JsonResponse
    {
        try {
            $user = Auth::user();

            $starredSupplier = StarredSupplier::where('user_id', $user->id)
                ->where('supplier_id', $supplierId)
                ->first();

            if (!$starredSupplier) {
                return response()->json([
                    'success' => false,
                    'message' => 'Starred supplier not found'
                ], 404);
            }

            $starredSupplier->delete();

            return response()->json([
                'success' => true,
                'message' => 'Supplier removed from starred list'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove starred supplier',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if a supplier is starred by the authenticated user.
     */
    public function checkStarred(Request $request, $supplierId): JsonResponse
    {
        try {
            $user = Auth::user();

            $isStarred = StarredSupplier::where('user_id', $user->id)
                ->where('supplier_id', $supplierId)
                ->exists();

            return response()->json([
                'success' => true,
                'is_starred' => $isStarred
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check starred status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
