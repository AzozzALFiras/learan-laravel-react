<?php

use App\Http\Controllers\Admin;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard', [
            'chart_data' => Inertia::defer(function () {
                $months = collect(range(5, 0))->map(function ($i) {
                    $date = now()->subMonths($i);
                    return [
                        'month' => $date->format('M'),
                        'count' => \App\Models\User::whereMonth('created_at', $date->month)
                            ->whereYear('created_at', $date->year)
                            ->count(),
                    ];
                });
                return $months->values()->all();
            }),
        ]);
    })->name('dashboard');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', Admin\DashboardController::class)->name('dashboard');

    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/',             Admin\Users\IndexController::class)  ->name('index');
        Route::patch('/{user}',     Admin\Users\UpdateController::class) ->name('update');
        Route::delete('/{user}',    Admin\Users\DestroyController::class)->name('destroy');
    });

    Route::prefix('categories')->name('categories.')->group(function () {
        Route::get('/',              Admin\Categories\IndexController::class)  ->name('index');
        Route::post('/',             Admin\Categories\StoreController::class)  ->name('store');
        Route::patch('/{category}',  Admin\Categories\UpdateController::class) ->name('update');
        Route::delete('/{category}', Admin\Categories\DestroyController::class)->name('destroy');
    });

    Route::prefix('products')->name('products.')->group(function () {
        Route::get('/',                    Admin\Products\IndexController::class)  ->name('index');
        Route::get('/create',              Admin\Products\CreateController::class) ->name('create');
        Route::post('/',                   Admin\Products\StoreController::class)  ->name('store');
        Route::get('/{product}/edit',      Admin\Products\EditController::class)   ->name('edit');
        Route::match(['patch', 'post'], '/{product}', Admin\Products\UpdateController::class)->name('update');
        Route::delete('/{product}',        Admin\Products\DestroyController::class)->name('destroy');

        Route::get('/{product}/licenses',    Admin\Products\Licenses\IndexController::class)  ->name('licenses.index');
        Route::post('/{product}/licenses',   Admin\Products\Licenses\StoreController::class)  ->name('licenses.store');
        Route::delete('/licenses/{license}', Admin\Products\Licenses\DestroyController::class)->name('licenses.destroy');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
