<?php

namespace App\Http\Controllers\Admin\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Products\StoreProductRequest;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;

class StoreController extends Controller
{
    public function __invoke(StoreProductRequest $request): RedirectResponse
    {
        $data = $request->safe()->except('image');

        $product = Product::create([
            ...$data,
            'image_path' => null,
        ]);

        $path = $request->file('image')
            ->store("products/{$product->id}", 'public');

        $product->update(['image_path' => $path]);

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Product created.');
    }
}
