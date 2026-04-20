<?php

namespace App\Http\Controllers\Admin\Products;

use App\Enums\LicenseStatus;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class IndexController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $filters = [
            'search'       => $request->string('search')->trim()->value() ?: null,
            'category_id'  => $request->integer('category_id') ?: null,
            'stock'        => in_array($request->stock, ['in_stock', 'out_of_stock'], true) ? $request->stock : null,
            'status'       => in_array($request->status, ['active', 'inactive'], true) ? $request->status : null,
            'date_from'    => $request->date('date_from')?->toDateString(),
            'date_to'      => $request->date('date_to')?->toDateString(),
            'sort'         => in_array($request->sort, ['newest', 'oldest', 'price_asc', 'price_desc', 'name'], true)
                ? $request->sort
                : 'newest',
        ];

        return Inertia::render('admin/products/index', [
            'filters' => $filters,
            'products' => Inertia::defer(fn () =>
                Product::query()
                    ->with('category:id,name_ar,name_en')
                    ->withCount(['licenses as available_stock' => fn ($q) => $q->where('status', LicenseStatus::Available->value)])
                    ->when($filters['search'], fn ($q, $s) => $q->where(function ($q) use ($s) {
                        $q->where('name_ar', 'like', "%{$s}%")
                          ->orWhere('name_en', 'like', "%{$s}%");
                    }))
                    ->when($filters['category_id'], fn ($q, $cid) => $q->where('product_category_id', $cid))
                    ->when($filters['status'] === 'active', fn ($q) => $q->where('is_active', true))
                    ->when($filters['status'] === 'inactive', fn ($q) => $q->where('is_active', false))
                    ->when($filters['date_from'], fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
                    ->when($filters['date_to'], fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
                    ->when($filters['stock'] === 'in_stock', fn ($q) => $q->whereHas('licenses', fn ($q) => $q->where('status', LicenseStatus::Available->value)))
                    ->when($filters['stock'] === 'out_of_stock', fn ($q) => $q->whereDoesntHave('licenses', fn ($q) => $q->where('status', LicenseStatus::Available->value)))
                    ->when($filters['sort'] === 'oldest', fn ($q) => $q->oldest())
                    ->when($filters['sort'] === 'price_asc', fn ($q) => $q->orderBy('price'))
                    ->when($filters['sort'] === 'price_desc', fn ($q) => $q->orderByDesc('price'))
                    ->when($filters['sort'] === 'name', fn ($q) => $q->orderBy('name_en'))
                    ->when($filters['sort'] === 'newest', fn ($q) => $q->latest())
                    ->paginate(15)
                    ->withQueryString()
                    ->through(fn (Product $p) => [
                        'id'              => $p->id,
                        'name_ar'         => $p->name_ar,
                        'name_en'         => $p->name_en,
                        'price'           => (float) $p->price,
                        'is_active'       => $p->is_active,
                        'image_url'       => $p->image_path ? Storage::disk('public')->url($p->image_path) : null,
                        'available_stock' => (int) $p->available_stock,
                        'category'        => $p->category ? [
                            'id'      => $p->category->id,
                            'name_ar' => $p->category->name_ar,
                            'name_en' => $p->category->name_en,
                        ] : null,
                        'created_at'      => $p->created_at->toDateString(),
                    ])
            ),
            'stats' => Inertia::defer(function () {
                $agg = Product::query()
                    ->leftJoin('product_licenses', function ($j) {
                        $j->on('product_licenses.product_id', '=', 'products.id')
                          ->where('product_licenses.status', LicenseStatus::Available->value);
                    })
                    ->selectRaw('products.id, products.is_active, COUNT(product_licenses.id) as avail')
                    ->groupBy('products.id', 'products.is_active')
                    ->get();

                return [
                    'total'         => $agg->count(),
                    'in_stock'      => $agg->where('avail', '>', 0)->count(),
                    'out_of_stock'  => $agg->where('avail', '=', 0)->count(),
                    'inactive'      => $agg->where('is_active', false)->count(),
                    'categories'    => ProductCategory::count(),
                ];
            }),
            'categories' => ProductCategory::query()
                ->orderBy('name_en')
                ->get(['id', 'name_ar', 'name_en']),
        ]);
    }
}
