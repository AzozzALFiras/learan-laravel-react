<?php

namespace App\Models;

use App\Enums\LicenseStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductLicense extends Model
{
    /** @use HasFactory<\Database\Factories\ProductLicenseFactory> */
    use HasFactory;

    protected $fillable = [
        'product_id',
        'license_key',
        'status',
        'sold_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'status'  => LicenseStatus::class,
            'sold_at' => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
