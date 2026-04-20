<?php

namespace Database\Factories;

use App\Models\ProductCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $nameEn = ucfirst(fake()->unique()->words(2, true));

        return [
            'product_category_id' => ProductCategory::factory(),
            'name_ar'             => 'منتج '.fake()->unique()->word(),
            'name_en'             => $nameEn,
            'description_ar'      => 'وصف تفصيلي للمنتج الرقمي يشرح المزايا والاستخدامات.',
            'description_en'      => fake()->sentence(12),
            'price'               => fake()->randomFloat(2, 5, 499),
            'image_path'          => null,
            'is_active'           => true,
        ];
    }
}
