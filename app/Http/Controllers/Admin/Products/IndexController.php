<?php

namespace App\Http\Controllers\Admin\Products;

use App\Enums\LicenseStatus;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class IndexController extends Controller
{
    public function __invoke(Request $request): Response
    {
        return Inertia::render('admin/products/index', [
            'products' => Inertia::defer(fn () =>
                Product::query()
                    ->with('category:id,name_ar,name_en')
                    ->withCount(['licenses as available_stock' => fn ($q) => $q->where('status', LicenseStatus::Available->value)])
                    ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                        $q->where('name_ar', 'like', "%{$s}%")
                          ->orWhere('name_en', 'like', "%{$s}%");
                    }))
                    ->when($request->category_id, fn ($q, $cid) => $q->where('product_category_id', $cid))
                    ->latest()
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
                    ->selectRaw('products.id, COUNT(product_licenses.id) as avail')
                    ->groupBy('products.id')
                    ->get();

                return [
                    'total'         => $agg->count(),
                    'in_stock'      => $agg->where('avail', '>', 0)->count(),
                    'out_of_stock'  => $agg->where('avail', '=', 0)->count(),
                    'categories'    => ProductCategory::count(),
                ];
            }),
            'categories' => ProductCategory::query()
                ->orderBy('name_en')
                ->get(['id', 'name_ar', 'name_en']),
            'filters' => $request->only('search', 'category_id'),
        ]);
    }
}
