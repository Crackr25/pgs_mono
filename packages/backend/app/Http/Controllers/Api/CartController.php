<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    /**
     * Get all cart items for the authenticated user.
     */
    public function index()
    {
        $cartItems = CartItem::with(['product', 'product.company'])
            ->forUser(Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'cart_items' => $cartItems,
            'total_items' => $cartItems->sum('quantity'),
            'total_amount' => $cartItems->sum('total_price')
        ]);
    }

    /**
     * Add item to cart.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'selected_specifications' => 'nullable|array'
        ]);

        $product = Product::findOrFail($request->product_id);
        
        // Check if quantity doesn't exceed stock
        if ($request->quantity > $product->stock_quantity) {
            throw ValidationException::withMessages([
                'quantity' => ['Requested quantity exceeds available stock (' . $product->stock_quantity . ')']
            ]);
        }

        // Check if product meets minimum order quantity
        if ($request->quantity < $product->moq) {
            throw ValidationException::withMessages([
                'quantity' => ['Minimum order quantity is ' . $product->moq . ' ' . $product->unit]
            ]);
        }

        // Check if item with same specs already exists in cart
        $existingItem = CartItem::where('user_id', Auth::id())
            ->where('product_id', $request->product_id)
            ->where('selected_specifications', json_encode($request->selected_specifications ?? []))
            ->first();

        if ($existingItem) {
            // Update quantity if item exists
            $newQuantity = $existingItem->quantity + $request->quantity;
            
            if ($newQuantity > $product->stock_quantity) {
                throw ValidationException::withMessages([
                    'quantity' => ['Total quantity would exceed available stock (' . $product->stock_quantity . ')']
                ]);
            }
            
            $existingItem->update(['quantity' => $newQuantity]);
            $cartItem = $existingItem;
        } else {
            // Create new cart item
            $cartItem = CartItem::create([
                'user_id' => Auth::id(),
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'selected_specifications' => $request->selected_specifications ?? [],
                'unit_price' => $product->price
            ]);
        }

        $cartItem->load(['product', 'product.company']);

        return response()->json([
            'message' => 'Item added to cart successfully',
            'cart_item' => $cartItem
        ], 201);
    }

    /**
     * Update cart item quantity.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $cartItem = CartItem::where('user_id', Auth::id())
            ->findOrFail($id);

        $product = $cartItem->product;

        // Check if quantity doesn't exceed stock
        if ($request->quantity > $product->stock_quantity) {
            throw ValidationException::withMessages([
                'quantity' => ['Requested quantity exceeds available stock (' . $product->stock_quantity . ')']
            ]);
        }

        // Check if product meets minimum order quantity
        if ($request->quantity < $product->moq) {
            throw ValidationException::withMessages([
                'quantity' => ['Minimum order quantity is ' . $product->moq . ' ' . $product->unit]
            ]);
        }

        $cartItem->update(['quantity' => $request->quantity]);
        $cartItem->load(['product', 'product.company']);

        return response()->json([
            'message' => 'Cart item updated successfully',
            'cart_item' => $cartItem
        ]);
    }

    /**
     * Remove item from cart.
     */
    public function destroy($id)
    {
        $cartItem = CartItem::where('user_id', Auth::id())
            ->findOrFail($id);

        $cartItem->delete();

        return response()->json([
            'message' => 'Item removed from cart successfully'
        ]);
    }

    /**
     * Clear all cart items for the user.
     */
    public function clear()
    {
        CartItem::where('user_id', Auth::id())->delete();

        return response()->json([
            'message' => 'Cart cleared successfully'
        ]);
    }

    /**
     * Get cart item count for the user.
     */
    public function count()
    {
        $count = CartItem::where('user_id', Auth::id())->sum('quantity');

        return response()->json([
            'count' => $count
        ]);
    }

    /**
     * Remove specific cart items by their IDs (used after successful checkout).
     */
    public function removeItems(Request $request)
    {
        $request->validate([
            'cart_item_ids' => 'required|array',
            'cart_item_ids.*' => 'integer|exists:cart_items,id'
        ]);

        $removedCount = CartItem::where('user_id', Auth::id())
            ->whereIn('id', $request->cart_item_ids)
            ->delete();

        return response()->json([
            'message' => "Removed {$removedCount} items from cart successfully",
            'removed_count' => $removedCount
        ]);
    }
}
