<?php

namespace App\Http\Controllers\Admin\Products\Licenses;

use App\Enums\LicenseStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Products\StoreLicenseRequest;
use App\Models\Product;
use App\Models\ProductLicense;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class StoreController extends Controller
{
    public function __invoke(StoreLicenseRequest $request, Product $product): RedirectResponse
    {
        $candidates = $request->parsedKeys();

        if (empty($candidates)) {
            return back()->with('error', 'No valid license keys found.');
        }

        $existing = ProductLicense::query()
            ->whereIn('license_key', $candidates)
            ->pluck('license_key')
            ->all();

        $new = array_values(array_diff($candidates, $existing));
        $now = now();

        if (! empty($new)) {
            DB::transaction(function () use ($new, $product, $now) {
                $rows = array_map(fn ($key) => [
                    'product_id'  => $product->id,
                    'license_key' => $key,
                    'status'      => LicenseStatus::Available->value,
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ], $new);

                ProductLicense::insert($rows);
            });
        }

        $added   = count($new);
        $skipped = count($existing);

        return back()->with('success', "Added {$added} license(s). Skipped {$skipped} duplicate(s).");
    }
}
