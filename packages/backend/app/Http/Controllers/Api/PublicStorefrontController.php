<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompanyStorefront;

class PublicStorefrontController extends Controller
{
    /**
     * Display a public storefront by slug
     */
    public function show($slug)
    {
        $storefront = CompanyStorefront::where('slug', $slug)
            ->where('is_active', true)
            ->with([
                'company.products' => function($query) {
                    $query->where('active', true)->with('images');
                },
                'company.user',
                'theme',
                'pages' => function($query) {
                    $query->where('is_active', true);
                },
                'sections' => function($query) {
                    $query->where('is_visible', true)->orderBy('sort_order');
                },
                'menuItems' => function($query) {
                    $query->where('is_visible', true)->orderBy('sort_order');
                }
            ])
            ->firstOrFail();

        return response()->json($storefront);
    }

    /**
     * Display a specific page on the storefront
     */
    public function showPage($slug, $pageSlug)
    {
        $storefront = CompanyStorefront::where('slug', $slug)
            ->where('is_active', true)
            ->with([
                'company.user',
                'theme',
                'menuItems' => function($query) {
                    $query->where('is_visible', true)->orderBy('sort_order');
                }
            ])
            ->firstOrFail();

        // Find the page by slug
        $page = $storefront->pages()
            ->where('slug', $pageSlug)
            ->where('is_active', true)
            ->with([
                'sections' => function($query) {
                    $query->where('is_visible', true)->orderBy('sort_order');
                }
            ])
            ->firstOrFail();

        return response()->json([
            'storefront' => $storefront,
            'page' => $page
        ]);
    }

    /**
     * Get menu items for public storefront navigation
     */
    public function getMenu($slug)
    {
        $storefront = CompanyStorefront::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $menuItems = $storefront->menuItems()
            ->where('is_visible', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json($menuItems);
    }

    /**
     * Get products for public storefront
     */
    public function getProducts($slug)
    {
        $storefront = CompanyStorefront::where('slug', $slug)
            ->where('is_active', true)
            ->with('company')
            ->firstOrFail();

        $products = $storefront->company->products()
            ->where('active', true)
            ->with(['images', 'mainImage'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($products);
    }
}
