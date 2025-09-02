<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rfq;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class BuyerRFQController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Check if user is authenticated
            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            $query = Rfq::where('buyer_id', Auth::id())
                        ->orderBy('created_at', 'desc');

            // Apply filters
            if ($request->has('status') && $request->status !== '') {
                $query->where('status', $request->status);
            }

            if ($request->has('category') && $request->category !== '') {
                $query->where('category', $request->category);
            }

            if ($request->has('search') && $request->search !== '') {
                $query->where(function($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%');
                });
            }

            $rfqs = $query->paginate(15);

            return response()->json($rfqs);
        } catch (\Exception $e) {
            \Log::error('Error fetching RFQs: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching RFQs. Please try again.',
                'debug' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            // Handle JSON string specifications from FormData
            $requestData = $request->all();
            if (isset($requestData['specifications']) && is_string($requestData['specifications'])) {
                $requestData['specifications'] = json_decode($requestData['specifications'], true);
            }

            $validator = Validator::make($requestData, [
                'title' => 'required|string|max:255',
                'description' => 'required|string|min:10',
                'category' => 'required|string|max:100',
                'quantity' => 'required|integer|min:1',
                'unit' => 'required|string|max:50',
                'budget_min' => 'required|numeric|min:0.01',
                'budget_max' => 'required|numeric|min:0.01',
                'delivery_location' => 'required|string|max:255',
                'delivery_date' => 'required|date|after:today',
                'specifications' => 'nullable|array',
                'specifications.*.key' => 'required_with:specifications.*.value|string|max:100',
                'specifications.*.value' => 'required_with:specifications.*.key|string|max:500',
                'attachments' => 'nullable|array',
                'attachments.*' => 'file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png,gif',
                'terms_conditions' => 'nullable|string|max:2000',
                'payment_terms' => 'nullable|string|max:1000',
                'validity_days' => 'required|integer|min:1|max:365',
                'status' => 'nullable|in:draft,published'
            ], [
                'title.required' => 'RFQ title is required.',
                'title.max' => 'RFQ title cannot exceed 255 characters.',
                'description.required' => 'RFQ description is required.',
                'description.min' => 'RFQ description must be at least 10 characters.',
                'category.required' => 'Please select a category for your RFQ.',
                'quantity.required' => 'Quantity is required.',
                'quantity.min' => 'Quantity must be at least 1.',
                'budget_min.required' => 'Minimum budget is required.',
                'budget_min.min' => 'Minimum budget must be greater than $0.',
                'budget_max.required' => 'Maximum budget is required.',
                'budget_max.min' => 'Maximum budget must be greater than $0.',
                'delivery_location.required' => 'Delivery location is required.',
                'delivery_date.required' => 'Delivery date is required.',
                'delivery_date.after' => 'Delivery date must be in the future.',
                'specifications.*.key.max' => 'Specification name cannot exceed 100 characters.',
                'specifications.*.value.max' => 'Specification value cannot exceed 500 characters.',
                'attachments.*.max' => 'Each file must be smaller than 10MB.',
                'attachments.*.mimes' => 'Only PDF, DOC, DOCX, JPG, JPEG, PNG, and GIF files are allowed.',
                'terms_conditions.max' => 'Terms and conditions cannot exceed 2000 characters.',
                'payment_terms.max' => 'Payment terms cannot exceed 1000 characters.',
                'validity_days.min' => 'RFQ validity must be at least 1 day.',
                'validity_days.max' => 'RFQ validity cannot exceed 365 days.'
            ]);

            if ($validator->fails()) {
                $errors = $validator->errors();
                $firstError = $errors->first();
                
                return response()->json([
                    'success' => false,
                    'message' => $firstError,
                    'errors' => $errors->toArray(),
                    'field_errors' => $errors->messages()
                ], 422);
            }

            // Validate budget range
            if ($requestData['budget_min'] >= $requestData['budget_max']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Maximum budget ($' . number_format($requestData['budget_max'], 2) . ') must be greater than minimum budget ($' . number_format($requestData['budget_min'], 2) . ').',
                    'errors' => ['budget' => ['Maximum budget must be greater than minimum budget']]
                ], 422);
            }

            // Handle file uploads
            $attachmentPaths = [];
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('rfq-attachments', 'public');
                    $attachmentPaths[] = [
                        'original_name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'size' => $file->getSize(),
                        'mime_type' => $file->getMimeType()
                    ];
                }
            }

            // Filter out empty specifications
            $specifications = collect($requestData['specifications'] ?? [])
                ->filter(function($spec) {
                    return !empty($spec['key']) && !empty($spec['value']);
                })
                ->values()
                ->toArray();

            // Calculate expiration date
            $expiresAt = Carbon::now()->addDays($requestData['validity_days']);

            $rfq = Rfq::create([
                'buyer_id' => Auth::id(),
                'title' => $requestData['title'],
                'description' => $requestData['description'],
                'category' => $requestData['category'],
                'quantity' => $requestData['quantity'],
                'unit' => $requestData['unit'],
                'budget_min' => $requestData['budget_min'],
                'budget_max' => $requestData['budget_max'],
                'delivery_location' => $requestData['delivery_location'],
                'delivery_date' => $requestData['delivery_date'],
                'specifications' => $specifications,
                'attachments' => $attachmentPaths,
                'terms_conditions' => $requestData['terms_conditions'] ?? null,
                'payment_terms' => $requestData['payment_terms'] ?? null,
                'validity_days' => $requestData['validity_days'],
                'expires_at' => $expiresAt,
                'status' => $requestData['status'] ?? 'draft'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'RFQ created successfully',
                'rfq' => $rfq->load('buyer')
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating RFQ: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $rfq = Rfq::where('buyer_id', Auth::id())
                     ->with(['buyer', 'quotes.supplier'])
                     ->findOrFail($id);

            return response()->json([
                'success' => true,
                'rfq' => $rfq
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'RFQ not found'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $rfq = Rfq::where('buyer_id', Auth::id())->findOrFail($id);

            // Only allow updates for draft RFQs
            if ($rfq->status !== 'draft') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only draft RFQs can be updated'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'category' => 'sometimes|required|string|max:100',
                'quantity' => 'sometimes|required|integer|min:1',
                'unit' => 'sometimes|required|string|max:50',
                'budget_min' => 'sometimes|required|numeric|min:0',
                'budget_max' => 'sometimes|required|numeric|min:0',
                'delivery_location' => 'sometimes|required|string|max:255',
                'delivery_date' => 'sometimes|required|date|after:today',
                'specifications' => 'nullable|array',
                'terms_conditions' => 'nullable|string',
                'payment_terms' => 'nullable|string',
                'validity_days' => 'sometimes|required|integer|min:1|max:365',
                'status' => 'nullable|in:draft,published'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = $request->only([
                'title', 'description', 'category', 'quantity', 'unit',
                'budget_min', 'budget_max', 'delivery_location', 'delivery_date',
                'specifications', 'terms_conditions', 'payment_terms', 'validity_days', 'status'
            ]);

            // Recalculate expiration if validity_days changed
            if ($request->has('validity_days')) {
                $updateData['expires_at'] = Carbon::now()->addDays($request->validity_days);
            }

            $rfq->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'RFQ updated successfully',
                'rfq' => $rfq->fresh()->load('buyer')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating RFQ: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $rfq = Rfq::where('buyer_id', Auth::id())->findOrFail($id);

            // Only allow deletion of draft RFQs or RFQs with no quotes
            if ($rfq->status !== 'draft' && $rfq->quote_count > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete RFQ with existing quotes'
                ], 403);
            }

            // Delete associated files
            if ($rfq->attachments) {
                foreach ($rfq->attachments as $attachment) {
                    Storage::disk('public')->delete($attachment['path']);
                }
            }

            $rfq->delete();

            return response()->json([
                'success' => true,
                'message' => 'RFQ deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting RFQ: ' . $e->getMessage()
            ], 500);
        }
    }

    public function publish($id)
    {
        try {
            $rfq = Rfq::where('buyer_id', Auth::id())->findOrFail($id);

            if ($rfq->status !== 'draft') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only draft RFQs can be published'
                ], 403);
            }

            $rfq->update([
                'status' => 'published',
                'expires_at' => Carbon::now()->addDays($rfq->validity_days)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'RFQ published successfully',
                'rfq' => $rfq->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error publishing RFQ: ' . $e->getMessage()
            ], 500);
        }
    }

    public function close($id)
    {
        try {
            $rfq = Rfq::where('buyer_id', Auth::id())->findOrFail($id);

            if ($rfq->status !== 'published') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only published RFQs can be closed'
                ], 403);
            }

            $rfq->update(['status' => 'closed']);

            return response()->json([
                'success' => true,
                'message' => 'RFQ closed successfully',
                'rfq' => $rfq->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error closing RFQ: ' . $e->getMessage()
            ], 500);
        }
    }

    public function uploadAttachment(Request $request, $id)
    {
        try {
            $rfq = Rfq::where('buyer_id', Auth::id())->findOrFail($id);

            $validator = Validator::make($request->all(), [
                'attachment' => 'required|file|max:10240' // 10MB max
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid file',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('attachment');
            $path = $file->store('rfq-attachments', 'public');

            $attachmentData = [
                'original_name' => $file->getClientOriginalName(),
                'path' => $path,
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType()
            ];

            $attachments = $rfq->attachments ?? [];
            $attachments[] = $attachmentData;

            $rfq->update(['attachments' => $attachments]);

            return response()->json([
                'success' => true,
                'message' => 'Attachment uploaded successfully',
                'attachment' => $attachmentData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error uploading attachment: ' . $e->getMessage()
            ], 500);
        }
    }

    public function removeAttachment(Request $request, $id)
    {
        try {
            $rfq = Rfq::where('buyer_id', Auth::id())->findOrFail($id);

            $attachmentIndex = $request->attachment_index;
            $attachments = $rfq->attachments ?? [];

            if (!isset($attachments[$attachmentIndex])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Attachment not found'
                ], 404);
            }

            // Delete file from storage
            Storage::disk('public')->delete($attachments[$attachmentIndex]['path']);

            // Remove from array
            unset($attachments[$attachmentIndex]);
            $attachments = array_values($attachments); // Reindex array

            $rfq->update(['attachments' => $attachments]);

            return response()->json([
                'success' => true,
                'message' => 'Attachment removed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error removing attachment: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getCategories()
    {
        $categories = [
            'Electronics & Electrical',
            'Industrial Equipment',
            'Construction Materials',
            'Textiles & Apparel',
            'Food & Beverages',
            'Automotive Parts',
            'Chemicals & Materials',
            'Furniture & Home Decor',
            'Medical & Healthcare',
            'Agriculture & Farming',
            'Other'
        ];

        return response()->json([
            'success' => true,
            'categories' => $categories
        ]);
    }

    public function getDashboardStats()
    {
        try {
            $buyerId = Auth::id();

            $stats = [
                'total_rfqs' => Rfq::where('buyer_id', $buyerId)->count(),
                'active_rfqs' => Rfq::where('buyer_id', $buyerId)->where('status', 'published')->count(),
                'draft_rfqs' => Rfq::where('buyer_id', $buyerId)->where('status', 'draft')->count(),
                'closed_rfqs' => Rfq::where('buyer_id', $buyerId)->where('status', 'closed')->count(),
                'expired_rfqs' => Rfq::where('buyer_id', $buyerId)->where('status', 'expired')->count(),
                'total_quotes_received' => Rfq::where('buyer_id', $buyerId)->sum('quote_count')
            ];

            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching dashboard stats: ' . $e->getMessage()
            ], 500);
        }
    }
}
