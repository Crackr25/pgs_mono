<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShippingAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ShippingAddressController extends Controller
{
    /**
     * Get all shipping addresses for the authenticated user.
     */
    public function index()
    {
        $addresses = ShippingAddress::where('user_id', Auth::id())
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $addresses
        ]);
    }

    /**
     * Store a new shipping address.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'label' => 'nullable|string|max:255',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'zip_code' => 'required|string|max:20',
            'country' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'is_default' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        $data['user_id'] = Auth::id();

        // If this is the first address or explicitly set as default
        $existingAddressCount = ShippingAddress::where('user_id', Auth::id())->count();
        if ($existingAddressCount === 0 || ($request->has('is_default') && $request->is_default)) {
            $data['is_default'] = true;
        }

        $address = ShippingAddress::create($data);

        // If set as default, unset others
        if ($address->is_default) {
            $address->setAsDefault();
        }

        return response()->json([
            'success' => true,
            'message' => 'Shipping address created successfully',
            'data' => $address->fresh()
        ], 201);
    }

    /**
     * Get a specific shipping address.
     */
    public function show($id)
    {
        $address = ShippingAddress::where('user_id', Auth::id())
            ->where('id', $id)
            ->first();

        if (!$address) {
            return response()->json([
                'success' => false,
                'message' => 'Shipping address not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $address
        ]);
    }

    /**
     * Update a shipping address.
     */
    public function update(Request $request, $id)
    {
        $address = ShippingAddress::where('user_id', Auth::id())
            ->where('id', $id)
            ->first();

        if (!$address) {
            return response()->json([
                'success' => false,
                'message' => 'Shipping address not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'label' => 'nullable|string|max:255',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'zip_code' => 'required|string|max:20',
            'country' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'is_default' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $address->update($validator->validated());

        // If set as default, unset others
        if ($request->has('is_default') && $request->is_default) {
            $address->setAsDefault();
        }

        return response()->json([
            'success' => true,
            'message' => 'Shipping address updated successfully',
            'data' => $address->fresh()
        ]);
    }

    /**
     * Delete a shipping address.
     */
    public function destroy($id)
    {
        $address = ShippingAddress::where('user_id', Auth::id())
            ->where('id', $id)
            ->first();

        if (!$address) {
            return response()->json([
                'success' => false,
                'message' => 'Shipping address not found'
            ], 404);
        }

        // If this was the default address, set another one as default
        if ($address->is_default) {
            $nextAddress = ShippingAddress::where('user_id', Auth::id())
                ->where('id', '!=', $id)
                ->first();
            
            if ($nextAddress) {
                $nextAddress->setAsDefault();
            }
        }

        $address->delete();

        return response()->json([
            'success' => true,
            'message' => 'Shipping address deleted successfully'
        ]);
    }

    /**
     * Set an address as default.
     */
    public function setDefault($id)
    {
        $address = ShippingAddress::where('user_id', Auth::id())
            ->where('id', $id)
            ->first();

        if (!$address) {
            return response()->json([
                'success' => false,
                'message' => 'Shipping address not found'
            ], 404);
        }

        $address->setAsDefault();

        return response()->json([
            'success' => true,
            'message' => 'Default shipping address updated successfully',
            'data' => $address->fresh()
        ]);
    }

    /**
     * Get the default shipping address.
     */
    public function getDefault()
    {
        $address = ShippingAddress::where('user_id', Auth::id())
            ->where('is_default', true)
            ->first();

        return response()->json([
            'success' => true,
            'data' => $address
        ]);
    }
}
