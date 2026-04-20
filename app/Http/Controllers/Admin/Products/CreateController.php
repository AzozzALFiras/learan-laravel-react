<?php

namespace App\Http\Controllers\Admin\Products;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Inertia\Inertia;
use Inertia\Response;

class CreateController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('admin/products/create', [
            'categories' => ProductCategory::query()
                ->orderBy('name_en')
                ->get(['id', 'name_ar', 'name_en']),
        ]);
    }
}
