<?php

namespace App\Http\Controllers\Admin\Products;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EditController extends Controller
{
    public function __invoke(Product $product): Response
    {
        return Inertia::render('admin/products/edit', [
            'product' => [
                'id'                  => $product->id,
                'product_category_id' => $product->product_category_id,
                'name_ar'             => $product->name_ar,
                'name_en'             => $product->name_en,
                'description_ar'      => $product->description_ar,
                'description_en'      => $product->description_en,
                'price'               => (float) $product->price,
                'is_active'           => $product->is_active,
                'image_url'           => $product->image_path
                    ? Storage::disk('public')->url($product->image_path)
                    : null,
            ],
            'categories' => ProductCategory::query()
                ->orderBy('name_en')
                ->get(['id', 'name_ar', 'name_en']),
        ]);
    }
}
