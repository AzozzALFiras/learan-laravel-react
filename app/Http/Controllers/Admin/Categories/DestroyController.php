<?php

namespace App\Http\Controllers\Admin\Categories;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;

class DestroyController extends Controller
{
    public function __invoke(ProductCategory $category): RedirectResponse
    {
        if ($category->products()->exists()) {
            return back()->with('error', 'Cannot delete a category that has products.');
        }

        $category->delete();

        return back()->with('success', 'Category deleted.');
    }
}
