<?php

namespace App\Http\Controllers\Admin\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Products\UpdateProductRequest;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class UpdateController extends Controller
{
    public function __invoke(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $data = $request->safe()->except('image');

        if ($request->hasFile('image')) {
            if ($product->image_path && Storage::disk('public')->exists($product->image_path)) {
                Storage::disk('public')->delete($product->image_path);
            }

            $data['image_path'] = $request->file('image')
                ->store("products/{$product->id}", 'public');
        }

        $product->update($data);

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Product updated.');
    }
}
