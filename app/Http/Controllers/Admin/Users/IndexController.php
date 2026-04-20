<?php

namespace App\Http\Controllers\Admin\Users;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IndexController extends Controller
{
    public function __invoke(Request $request): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => Inertia::defer(fn () =>
                User::query()
                    ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                        $q->where('name', 'like', "%{$s}%")
                          ->orWhere('email', 'like', "%{$s}%");
                    }))
                    ->latest()
                    ->paginate(15)
                    ->withQueryString()
                    ->through(fn (User $user) => [
                        'id'         => $user->id,
                        'name'       => $user->name,
                        'email'      => $user->email,
                        'role'       => $user->role->value,
                        'created_at' => $user->created_at->toDateString(),
                    ])
            ),
            'filters' => $request->only('search'),
        ]);
    }
}
