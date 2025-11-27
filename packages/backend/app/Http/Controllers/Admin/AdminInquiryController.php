<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactInquiry;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminInquiryController extends Controller
{
    /**
     * Get inquiry statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_inquiries' => ContactInquiry::count(),
            'pending' => ContactInquiry::where('status', 'pending')->count(),
            'in_progress' => ContactInquiry::where('status', 'in_progress')->count(),
            'resolved' => ContactInquiry::where('status', 'resolved')->count(),
            'closed' => ContactInquiry::where('status', 'closed')->count(),
            'recent_inquiries' => ContactInquiry::where('created_at', '>=', now()->subDays(7))->count(),
            'by_type' => ContactInquiry::select('inquiry_type', DB::raw('count(*) as count'))
                                      ->groupBy('inquiry_type')
                                      ->get()
                                      ->pluck('count', 'inquiry_type'),
            'by_status' => ContactInquiry::select('status', DB::raw('count(*) as count'))
                                        ->groupBy('status')
                                        ->get()
                                        ->pluck('count', 'status'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get all inquiries with pagination and filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = ContactInquiry::with('user');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by inquiry type
        if ($request->has('inquiry_type') && $request->inquiry_type !== 'all') {
            $query->where('inquiry_type', $request->inquiry_type);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $inquiries = $query->paginate($perPage);

        return response()->json($inquiries);
    }

    /**
     * Get specific inquiry
     */
    public function show($id): JsonResponse
    {
        $inquiry = ContactInquiry::with('user')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $inquiry
        ]);
    }

    /**
     * Update inquiry
     */
    public function update(Request $request, $id): JsonResponse
    {
        $inquiry = ContactInquiry::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:pending,in_progress,resolved,closed',
            'admin_notes' => 'nullable|string|max:1000'
        ]);

        // Set responded_at timestamp if status is being changed to in_progress
        if (isset($validated['status']) && $validated['status'] === 'in_progress' && !$inquiry->responded_at) {
            $validated['responded_at'] = now();
        }

        $inquiry->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Inquiry updated successfully',
            'data' => $inquiry->fresh()
        ]);
    }

    /**
     * Delete inquiry
     */
    public function destroy($id): JsonResponse
    {
        $inquiry = ContactInquiry::findOrFail($id);
        $inquiry->delete();

        return response()->json([
            'success' => true,
            'message' => 'Inquiry deleted successfully'
        ]);
    }

    /**
     * Get pending inquiries
     */
    public function pending(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $inquiries = ContactInquiry::with('user')
                                  ->where('status', 'pending')
                                  ->orderBy('created_at', 'desc')
                                  ->paginate($perPage);

        return response()->json($inquiries);
    }

    /**
     * Get recent inquiries
     */
    public function recent(Request $request): JsonResponse
    {
        $days = $request->get('days', 7);
        $perPage = $request->get('per_page', 15);
        
        $inquiries = ContactInquiry::with('user')
                                  ->where('created_at', '>=', now()->subDays($days))
                                  ->orderBy('created_at', 'desc')
                                  ->paginate($perPage);

        return response()->json($inquiries);
    }

    /**
     * Bulk update inquiries
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'inquiry_ids' => 'required|array',
            'inquiry_ids.*' => 'exists:contact_inquiries,id',
            'action' => 'required|in:update_status,delete',
            'status' => 'required_if:action,update_status|in:pending,in_progress,resolved,closed',
        ]);

        $inquiryIds = $validated['inquiry_ids'];
        $action = $validated['action'];

        switch ($action) {
            case 'update_status':
                ContactInquiry::whereIn('id', $inquiryIds)->update(['status' => $validated['status']]);
                $message = 'Inquiry statuses updated successfully';
                break;
            case 'delete':
                ContactInquiry::whereIn('id', $inquiryIds)->delete();
                $message = 'Inquiries deleted successfully';
                break;
        }

        return response()->json([
            'success' => true,
            'message' => $message
        ]);
    }
}
