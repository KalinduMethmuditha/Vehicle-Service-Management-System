<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMechanicRequest;
use App\Http\Requests\UpdateMechanicRequest;
use App\Models\Mechanic;
use App\Models\User;
use App\Services\MechanicService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class MechanicController extends Controller
{
    public function __construct(
        private readonly MechanicService $mechanicService
    ) {
    }

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Mechanic::class);

        $mechanics = Mechanic::query()
            ->with('user:id,name,email')
            ->when(
                $request->input('search'),
                function ($query, $search) {
                    $query->where(function ($query) use ($search) {
                        $query
                            ->where(
                                'employee_id',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'name',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'specialization',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'contact',
                                'like',
                                "%{$search}%"
                            );
                    });
                }
            )
            ->when(
                $request->input('status') === 'active',
                fn ($query) =>
                    $query->where('is_active', true)
            )
            ->when(
                $request->input('status') === 'inactive',
                fn ($query) =>
                    $query->where('is_active', false)
            )
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Mechanics/Index', [
            'mechanics' => $mechanics,

            'users' => User::query()
                ->orderBy('name')
                ->get(['id', 'name', 'email']),

            'filters' => $request->only([
                'search',
                'status',
            ]),
        ]);
    }

    public function store(
        StoreMechanicRequest $request
    ): RedirectResponse {
        $this->mechanicService->create(
            $request->validated()
        );

        return to_route('mechanics.index')
            ->with(
                'success',
                'Mechanic created successfully.'
            );
    }

    public function update(
        UpdateMechanicRequest $request,
        Mechanic $mechanic
    ): RedirectResponse {
        $this->mechanicService->update(
            $mechanic,
            $request->validated()
        );

        return to_route('mechanics.index')
            ->with(
                'success',
                'Mechanic updated successfully.'
            );
    }

    public function destroy(
        Mechanic $mechanic
    ): RedirectResponse {
        Gate::authorize('delete', $mechanic);

        $this->mechanicService->delete($mechanic);

        return to_route('mechanics.index')
            ->with(
                'success',
                'Mechanic deleted successfully.'
            );
    }
}