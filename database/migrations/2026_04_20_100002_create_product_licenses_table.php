<?php

use App\Enums\LicenseStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_licenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('license_key')->unique();
            $table->string('status')->default(LicenseStatus::Available->value);
            $table->timestamp('sold_at')->nullable();
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->index(['product_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_licenses');
    }
};
