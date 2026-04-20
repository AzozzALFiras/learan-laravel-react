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
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
