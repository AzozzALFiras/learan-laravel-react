<?php

namespace App\Http\Controllers\Admin\Categories;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Inertia\Inertia;
use Inertia\Response;

class IndexController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('admin/categories/index', [
            'categories' => Inertia::defer(fn () =>
                ProductCategory::query()
                    ->withCount('products')
                    ->latest()
                    ->get()
                    ->map(fn (ProductCategory $c) => [
                        'id'             => $c->id,
                        'name_ar'        => $c->name_ar,
                        'name_en'        => $c->name_en,
                        'slug'           => $c->slug,
                        'products_count' => $c->products_count,
                        'created_at'     => $c->created_at->toDateString(),
                    ])
                    ->all()
            ),
        ]);
    }
}
