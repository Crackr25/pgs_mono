<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactInquiry;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class ContactInquiryController extends Controller
{
    /**
     * Display a listing of contact inquiries (admin only).
     */
    public function index(Request $request): JsonResponse
    {
        $query = ContactInquiry::with('user')
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by inquiry type
        if ($request->has('inquiry_type')) {
            $query->where('inquiry_type', $request->inquiry_type);
        }

        // Search by name, email, or subject
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        $inquiries = $query->paginate(15);

        return response()->json($inquiries);
    }

    /**
     * Store a newly created contact inquiry.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'inquiry_type' => 'required|in:general,technical,billing,partnership,complaint,feedback'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $inquiryData = $validator->validated();
            
            // Add user_id if authenticated
            if (Auth::check()) {
                $inquiryData['user_id'] = Auth::id();
            }

            $inquiry = ContactInquiry::create($inquiryData);

            // Send notification email to admin (optional)
            $this->sendAdminNotification($inquiry);

            // Send confirmation email to user (optional)
            $this->sendUserConfirmation($inquiry);

            return response()->json([
                'message' => 'Contact inquiry submitted successfully',
                'inquiry' => $inquiry
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to submit inquiry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified contact inquiry.
     */
    public function show(ContactInquiry $contactInquiry): JsonResponse
    {
        $contactInquiry->load('user');
        
        return response()->json($contactInquiry);
    }

    /**
     * Update the specified contact inquiry (admin only).
     */
    public function update(Request $request, ContactInquiry $contactInquiry): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:pending,in_progress,resolved,closed',
            'admin_notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updateData = $validator->validated();
            
            // Set responded_at timestamp if status is being changed to in_progress
            if (isset($updateData['status']) && $updateData['status'] === 'in_progress' && !$contactInquiry->responded_at) {
                $updateData['responded_at'] = now();
            }

            $contactInquiry->update($updateData);

            return response()->json([
                'message' => 'Contact inquiry updated successfully',
                'inquiry' => $contactInquiry->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update inquiry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified contact inquiry (admin only).
     */
    public function destroy(ContactInquiry $contactInquiry): JsonResponse
    {
        try {
            $contactInquiry->delete();

            return response()->json([
                'message' => 'Contact inquiry deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete inquiry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get inquiry statistics (admin only).
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total' => ContactInquiry::count(),
            'pending' => ContactInquiry::where('status', 'pending')->count(),
            'in_progress' => ContactInquiry::where('status', 'in_progress')->count(),
            'resolved' => ContactInquiry::where('status', 'resolved')->count(),
            'closed' => ContactInquiry::where('status', 'closed')->count(),
            'by_type' => ContactInquiry::selectRaw('inquiry_type, COUNT(*) as count')
                ->groupBy('inquiry_type')
                ->pluck('count', 'inquiry_type'),
            'recent_count' => ContactInquiry::where('created_at', '>=', now()->subDays(7))->count()
        ];

        return response()->json($stats);
    }

    /**
     * Send admin notification email (implement as needed).
     */
    private function sendAdminNotification(ContactInquiry $inquiry)
    {
        // TODO: Implement email notification to admin
        // Mail::to(config('app.admin_email'))->send(new ContactInquiryNotification($inquiry));
    }

    /**
     * Send user confirmation email (implement as needed).
     */
    private function sendUserConfirmation(ContactInquiry $inquiry)
    {
        // TODO: Implement confirmation email to user
        // Mail::to($inquiry->email)->send(new ContactInquiryConfirmation($inquiry));
    }
}
