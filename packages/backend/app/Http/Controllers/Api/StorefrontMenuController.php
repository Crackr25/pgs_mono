<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StorefrontMenuItem;
use Illuminate\Http\Request;

class StorefrontMenuController extends Controller
{
    /**
     * Get menu items for a storefront
     */
    public function index(Request $request)
    {
        $storefront = $request->user()->company->storefront;
        
        if (!$storefront) {
            return response()->json(['message' => 'Storefront not found'], 404);
        }

        $menuItems = StorefrontMenuItem::where('storefront_id', $storefront->id)
            ->orderBy('sort_order')
            ->get();

        return response()->json($menuItems);
    }

    /**
     * Create a new menu item
     */
    public function store(Request $request)
    {
        $storefront = $request->user()->company->storefront;
        
        if (!$storefront) {
            return response()->json(['message' => 'Storefront not found'], 404);
        }

        $validated = $request->validate([
            'label' => 'required|string|min:2|max:50',
            'type' => 'required|in:page,section,external',
            'target' => 'required|string',
            'parent_id' => 'nullable|exists:storefront_menu_items,id',
            'sort_order' => 'integer',
            'is_visible' => 'boolean',
            'show_dropdown' => 'boolean',
            'embed_company_profile' => 'boolean',
        ], [
            'label.required' => 'Menu label is required',
            'label.min' => 'Menu label must be at least 2 characters',
            'label.max' => 'Menu label must not exceed 50 characters',
            'type.required' => 'Menu type is required',
            'type.in' => 'Menu type must be page, section, or external',
            'target.required' => 'Target is required based on menu type',
            'parent_id.exists' => 'Selected parent menu item does not exist',
        ]);

        $validated['storefront_id'] = $storefront->id;

        $menuItem = StorefrontMenuItem::create($validated);

        return response()->json($menuItem, 201);
    }

    /**
     * Update a menu item
     */
    public function update(Request $request, $id)
    {
        $storefront = $request->user()->company->storefront;
        
        $menuItem = StorefrontMenuItem::where('storefront_id', $storefront->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'label' => 'string|min:2|max:50',
            'type' => 'in:page,section,external',
            'target' => 'string',
            'parent_id' => 'nullable|exists:storefront_menu_items,id',
            'sort_order' => 'integer',
            'is_visible' => 'boolean',
            'show_dropdown' => 'boolean',
            'embed_company_profile' => 'boolean',
        ], [
            'label.min' => 'Menu label must be at least 2 characters',
            'label.max' => 'Menu label must not exceed 50 characters',
            'type.in' => 'Menu type must be page, section, or external',
            'parent_id.exists' => 'Selected parent menu item does not exist',
        ]);

        $menuItem->update($validated);

        return response()->json($menuItem);
    }

    /**
     * Delete a menu item
     */
    public function destroy(Request $request, $id)
    {
        $storefront = $request->user()->company->storefront;
        
        $menuItem = StorefrontMenuItem::where('storefront_id', $storefront->id)
            ->findOrFail($id);

        $menuItem->delete();

        return response()->json(['message' => 'Menu item deleted successfully']);
    }

    /**
     * Reorder menu items
     */
    public function reorder(Request $request)
    {
        $storefront = $request->user()->company->storefront;
        
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:storefront_menu_items,id',
            'items.*.sort_order' => 'required|integer',
        ]);

        foreach ($validated['items'] as $item) {
            StorefrontMenuItem::where('id', $item['id'])
                ->where('storefront_id', $storefront->id)
                ->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['message' => 'Menu items reordered successfully']);
    }
}
