<?php

namespace App\Http\Controllers\Admin\Categories;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Categories\StoreCategoryRequest;
use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;

class StoreController extends Controller
{
    public function __invoke(StoreCategoryRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $baseSlug = Str::slug($validated['name_en']) ?: 'category';
        $slug     = $baseSlug;
        $i        = 2;
        while (ProductCategory::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$i}";
            $i++;
        }
        ProductCategory::create([
            'name_ar' => $validated['name_ar'],
            'name_en' => $validated['name_en'],
            'slug'    => $slug,
        ]);

        return back()->with('success', 'Category created.');
    }
}
