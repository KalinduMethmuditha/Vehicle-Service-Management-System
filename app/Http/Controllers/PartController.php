<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdjustPartStockRequest;
use App\Http\Requests\StorePartRequest;
use App\Http\Requests\UpdatePartRequest;
use App\Models\Part;
use App\Services\PartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PartController extends Controller
{
    public function __construct(
        private readonly PartService $partService
    ) {
    }

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Part::class);

        $parts = Part::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('part_number', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere(
                            'description',
                            'like',
                            "%{$search}%"
                        );
                });
            })
            ->when(
                $request->input('stock') === 'low',
                fn ($query) => $query->lowStock()
            )
            ->when(
                $request->input('stock') === 'out',
                fn ($query) => $query->where('stock_quantity', 0)
            )
            ->when(
                $request->input('status') === 'active',
                fn ($query) => $query->where('is_active', true)
            )
            ->when(
                $request->input('status') === 'inactive',
                fn ($query) => $query->where('is_active', false)
            )
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Parts/Index', [
            'parts' => $parts,

            'statistics' => [
                'total' => Part::count(),
                'low_stock' => Part::lowStock()->count(),
                'out_of_stock' => Part::where(
                    'stock_quantity',
                    0
                )->count(),
            ],

            'filters' => $request->only([
                'search',
                'stock',
                'status',
            ]),
        ]);
    }

    public function store(StorePartRequest $request): RedirectResponse
    {
        $this->partService->create($request->validated());

        return to_route('parts.index')
            ->with('success', 'Part created successfully.');
    }

    public function update(
        UpdatePartRequest $request,
        Part $part
    ): RedirectResponse {
        $this->partService->update(
            $part,
            $request->validated()
        );

        return to_route('parts.index')
            ->with('success', 'Part updated successfully.');
    }

    public function adjustStock(
        AdjustPartStockRequest $request,
        Part $part
    ): RedirectResponse {
        $this->partService->adjustStock(
            $part,
            $request->validated('type'),
            $request->integer('quantity')
        );

        return to_route('parts.index')
            ->with('success', 'Stock adjusted successfully.');
    }

    public function destroy(Part $part): RedirectResponse
    {
        Gate::authorize('delete', $part);

        $this->partService->delete($part);

        return to_route('parts.index')
            ->with('success', 'Part deleted successfully.');
    }
}