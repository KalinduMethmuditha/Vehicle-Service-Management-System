<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateManagedUserRequest;
use App\Models\User;
use App\Services\UserManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function __construct(
        private readonly UserManagementService $userManagementService
    ) {
    }

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $search = trim((string) $request->query('search', ''));

        $users = User::query()
            ->with('roles:id,name')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => UserManagementService::SYSTEM_ROLES,
            'filters' => [
                'search' => $search,
            ],
            'currentUserId' => $request->user()->id,
        ]);
    }

    public function update(
        UpdateManagedUserRequest $request,
        User $user
    ): RedirectResponse {
        Gate::authorize('update', $user);

        $this->userManagementService->update(
            $request->user(),
            $user,
            $request->validated()
        );

        return back()->with(
            'success',
            'User and role updated successfully.'
        );
    }

    public function destroy(
        Request $request,
        User $user
    ): RedirectResponse {
        Gate::authorize('delete', $user);

        $this->userManagementService->delete(
            $request->user(),
            $user
        );

        return back()->with(
            'success',
            'User account deleted successfully.'
        );
    }
}