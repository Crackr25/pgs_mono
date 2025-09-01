<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quote;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class QuoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Quote::with(['product', 'company']);
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by company (for sellers to see their quotes)
        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }
        
        // Filter by buyer email (for buyers to see their quotes)
        if ($request->has('buyer_email')) {
            $query->where('buyer_email', $request->buyer_email);
        }
        
        // Search by product name or buyer name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('buyer_name', 'like', "%{$search}%")
                  ->orWhere('buyer_company', 'like', "%{$search}%")
                  ->orWhereHas('product', function($productQuery) use ($search) {
                      $productQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        // Pagination settings
        $perPage = $request->get('per_page', 10); // Default 10
        $perPage = in_array($perPage, [10, 15, 25, 50, 100]) ? $perPage : 10; // Allowed values
        
        $quotes = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json($quotes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'buyer_name' => 'required|string|max:255',
            'buyer_email' => 'required|email',
            'buyer_company' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:1',
            'target_price' => 'nullable|numeric|min:0',
            'deadline' => 'required|date|after:today',
            'message' => 'required|string'
        ]);

        $product = Product::findOrFail($validated['product_id']);
        $validated['company_id'] = $product->company_id;
        
        $quote = Quote::create($validated);
        
        return response()->json($quote->load(['product', 'company']), 201);
    }

    public function show(Quote $quote): JsonResponse
    {
        return response()->json($quote->load(['product', 'company']));
    }

    public function update(Request $request, Quote $quote): JsonResponse
    {
        // Only allow updates by the company that received the quote
        if ($quote->company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'sometimes|in:pending,responded,accepted,rejected,expired',
            'response_message' => 'nullable|string',
            'quoted_price' => 'nullable|numeric|min:0',
            'quoted_lead_time' => 'nullable|string'
        ]);

        $quote->update($validated);
        
        return response()->json($quote->load(['product', 'company']));
    }

    public function respond(Request $request, Quote $quote): JsonResponse
    {
        // Only allow responses by the company that received the quote
        if ($quote->company->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only allow responses to pending quotes
        if ($quote->status !== 'pending') {
            return response()->json(['message' => 'Quote has already been responded to or is not in pending status'], 400);
        }

        $validated = $request->validate([
            'response_message' => 'required|string',
            'quoted_price' => 'required|numeric|min:0',
            'quoted_lead_time' => 'required|string'
        ]);

        $validated['status'] = 'responded';
        $quote->update($validated);
        
        return response()->json($quote->load(['product', 'company']));
    }

    public function destroy(Quote $quote): JsonResponse
    {
        // Allow deletion by either the company or the buyer (if authenticated)
        $canDelete = false;
        
        if (auth()->check() && $quote->company->user_id === auth()->id()) {
            $canDelete = true;
        }
        
        if (!$canDelete) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $quote->delete();
        
        return response()->json(['message' => 'Quote deleted successfully']);
    }

    public function stats(Request $request): JsonResponse
    {
        // Aggregate counts by status with optional filters
        $query = Quote::query();

        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->has('buyer_email')) {
            $query->where('buyer_email', $request->buyer_email);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('buyer_name', 'like', "%{$search}%")
                    ->orWhere('buyer_company', 'like', "%{$search}%")
                    ->orWhereHas('product', function ($productQuery) use ($search) {
                        $productQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $counts = (clone $query)
            ->select('status', DB::raw('COUNT(*) as aggregate'))
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $total = (clone $query)->count();

        $pending = (int) ($counts['pending'] ?? 0);
        $responded = (int) ($counts['responded'] ?? 0);
        $accepted = (int) ($counts['accepted'] ?? 0);
        $rejected = (int) ($counts['rejected'] ?? 0);

        $responseRate = $total > 0 ? (int) round((($responded + $accepted) / $total) * 100) : 0;

        return response()->json([
            'pending' => $pending,
            'responded' => $responded,
            'accepted' => $accepted,
            'rejected' => $rejected,
            'total' => $total,
            'responseRate' => $responseRate,
        ]);
    }
}
