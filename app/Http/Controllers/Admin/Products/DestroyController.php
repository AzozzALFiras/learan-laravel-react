<?php

namespace App\Http\Controllers\Admin\Products;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;

class DestroyController extends Controller
{
    public function __invoke(Product $product): RedirectResponse
    {
        $product->delete();

        return back()->with('success', 'Product deleted.');
    }
}
