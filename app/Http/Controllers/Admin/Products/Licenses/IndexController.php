<?php

namespace App\Http\Controllers\Admin\Products\Licenses;

use App\Enums\LicenseStatus;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductLicense;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IndexController extends Controller
{
    public function __invoke(Request $request, Product $product): Response
    {
        $filters = [
            'search'    => $request->string('search')->trim()->value() ?: null,
            'status'    => in_array($request->status, [LicenseStatus::Available->value, LicenseStatus::Sold->value], true)
                ? $request->status
                : null,
            'date_from' => $request->date('date_from')?->toDateString(),
            'date_to'   => $request->date('date_to')?->toDateString(),
            'sort'      => in_array($request->sort, ['newest', 'oldest', 'sold_at'], true) ? $request->sort : 'newest',
        ];

        $counts = ProductLicense::query()
            ->where('product_id', $product->id)
            ->selectRaw('status, COUNT(*) as c')
            ->groupBy('status')
            ->pluck('c', 'status');

        $available = (int) ($counts[LicenseStatus::Available->value] ?? 0);
        $sold      = (int) ($counts[LicenseStatus::Sold->value] ?? 0);

        return Inertia::render('admin/products/licenses/index', [
            'product' => [
                'id'      => $product->id,
                'name_ar' => $product->name_ar,
                'name_en' => $product->name_en,
            ],
            'counts' => [
                'available' => $available,
                'sold'      => $sold,
                'total'     => $available + $sold,
            ],
            'filters' => $filters,
            'licenses' => Inertia::defer(fn () =>
                ProductLicense::query()
                    ->where('product_id', $product->id)
                    ->when($filters['status'], fn ($q, $s) => $q->where('status', $s))
                    ->when($filters['search'], fn ($q, $s) => $q->where('license_key', 'like', "%{$s}%"))
                    ->when($filters['date_from'], fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
                    ->when($filters['date_to'], fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
                    ->when($filters['sort'] === 'oldest', fn ($q) => $q->oldest())
                    ->when($filters['sort'] === 'sold_at', fn ($q) => $q->orderByDesc('sold_at'))
                    ->when($filters['sort'] === 'newest', fn ($q) => $q->latest())
                    ->paginate(25)
                    ->withQueryString()
                    ->through(fn (ProductLicense $l) => [
                        'id'          => $l->id,
                        'license_key' => $l->license_key,
                        'status'      => $l->status->value,
                        'sold_at'     => $l->sold_at?->toDateTimeString(),
                        'created_at'  => $l->created_at->toDateString(),
                    ])
            ),
        ]);
    }
}
