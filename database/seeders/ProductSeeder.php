<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductLicense;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = ProductCategory::factory()->count(5)->create();

        $categories->each(function (ProductCategory $category) {
            Product::factory()
                ->count(4)
                ->for($category, 'category')
                ->create()
                ->each(function (Product $product) {
                    ProductLicense::factory()->count(8)->for($product)->create();
                    ProductLicense::factory()->count(2)->for($product)->sold()->create();
                });
        });
    }
}
