<?php

namespace App\Http\Controllers\Admin\Categories;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Categories\UpdateCategoryRequest;
use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;

class UpdateController extends Controller
{
    public function __invoke(UpdateCategoryRequest $request, ProductCategory $category): RedirectResponse
    {
        $category->update($request->validated());

        return back()->with('success', 'Category updated.');
    }

}
