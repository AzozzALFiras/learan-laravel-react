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
            'licenses' => Inertia::defer(fn () =>
                ProductLicense::query()
                    ->where('product_id', $product->id)
                    ->when(
                        $request->status && in_array($request->status, [LicenseStatus::Available->value, LicenseStatus::Sold->value], true),
                        fn ($q) => $q->where('status', $request->status)
                    )
                    ->latest()
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
            'filters' => $request->only('status'),
        ]);
    }
}
