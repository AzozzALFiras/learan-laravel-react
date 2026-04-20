<?php

namespace App\Http\Controllers\Admin\Categories;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IndexController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $filters = [
            'search'    => $request->string('search')->trim()->value() ?: null,
            'date_from' => $request->date('date_from')?->toDateString(),
            'date_to'   => $request->date('date_to')?->toDateString(),
            'sort'      => in_array($request->sort, ['newest', 'oldest', 'name_en', 'products'], true)
                ? $request->sort
                : 'newest',
        ];

        return Inertia::render('admin/categories/index', [
            'filters' => $filters,
            'categories' => Inertia::defer(fn () =>
                ProductCategory::query()
                    ->withCount('products')
                    ->when($filters['search'], fn ($q, $s) => $q->where(function ($q) use ($s) {
                        $q->where('name_ar', 'like', "%{$s}%")
                          ->orWhere('name_en', 'like', "%{$s}%")
                          ->orWhere('slug', 'like', "%{$s}%");
                    }))
                    ->when($filters['date_from'], fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
                    ->when($filters['date_to'], fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
                    ->when($filters['sort'] === 'oldest', fn ($q) => $q->oldest())
                    ->when($filters['sort'] === 'name_en', fn ($q) => $q->orderBy('name_en'))
                    ->when($filters['sort'] === 'products', fn ($q) => $q->orderByDesc('products_count'))
                    ->when($filters['sort'] === 'newest', fn ($q) => $q->latest())
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
