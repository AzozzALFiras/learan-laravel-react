<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => Inertia::defer(fn () => [
                'total_users'    => User::count(),
                'admin_users'    => User::where('role', UserRole::Admin)->count(),
                'regular_users'  => User::where('role', UserRole::User)->count(),
                'new_this_month' => User::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
            ]),
            'monthly_registrations' => Inertia::defer(function () {
                return collect(range(5, 0))->map(function ($i) {
                    $date = now()->subMonths($i);
                    return [
                        'month' => $date->format('M'),
                        'count' => User::whereMonth('created_at', $date->month)
                            ->whereYear('created_at', $date->year)
                            ->count(),
                    ];
                })->values()->all();
            }),
            'recent_users' => Inertia::defer(fn () =>
                User::latest()
                    ->limit(5)
                    ->get(['id', 'name', 'email', 'role', 'created_at'])
                    ->map(fn (User $user) => [
                        'id'         => $user->id,
                        'name'       => $user->name,
                        'email'      => $user->email,
                        'role'       => $user->role->value,
                        'created_at' => $user->created_at->diffForHumans(),
                    ])
                    ->all()
            ),
        ]);
    }
}
