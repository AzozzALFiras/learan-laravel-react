<?php

namespace Database\Factories;

use App\Enums\LicenseStatus;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProductLicense>
 */
class ProductLicenseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id'  => Product::factory(),
            'license_key' => strtoupper(Str::random(4).'-'.Str::random(5).'-'.Str::random(5)),
            'status'      => LicenseStatus::Available,
            'sold_at'     => null,
            'notes'       => null,
        ];
    }

    public function sold(): static
    {
        return $this->state(fn () => [
            'status'  => LicenseStatus::Sold,
            'sold_at' => now(),
        ]);
    }
}
