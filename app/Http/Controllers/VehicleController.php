<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVehicleRequest;
use App\Http\Requests\UpdateVehicleRequest;
use App\Models\Customer;
use App\Models\Vehicle;
use App\Services\VehicleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class VehicleController extends Controller
{
    public function __construct(
        private readonly VehicleService $vehicleService
    ) {
    }

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Vehicle::class);

        $allowedSorts = [
            'registration_no',
            'make',
            'model',
            'year',
            'mileage',
            'created_at',
        ];

        $sort = in_array(
            $request->input('sort'),
            $allowedSorts,
            true
        ) ? $request->input('sort') : 'created_at';

        $direction = $request->input('direction') === 'asc'
            ? 'asc'
            : 'desc';

        $vehicles = Vehicle::query()
            ->with('customer:id,name,phone')
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('registration_no', 'like', "%{$search}%")
                        ->orWhere('make', 'like', "%{$search}%")
                        ->orWhere('model', 'like', "%{$search}%")
                        ->orWhere('vin', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($query) use ($search) {
                            $query->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when(
                $request->input('customer_id'),
                fn ($query, $customerId) =>
                    $query->where('customer_id', $customerId)
            )
            ->orderBy($sort, $direction)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Vehicles/Index', [
            'vehicles' => $vehicles,
            'customers' => Customer::query()
                ->orderBy('name')
                ->get(['id', 'name', 'phone']),
            'filters' => $request->only([
                'search',
                'customer_id',
                'sort',
                'direction',
            ]),
        ]);
    }

    public function store(StoreVehicleRequest $request): RedirectResponse
    {
        $this->vehicleService->create($request->validated());

        return to_route('vehicles.index')
            ->with('success', 'Vehicle created successfully.');
    }

    public function update(
        UpdateVehicleRequest $request,
        Vehicle $vehicle
    ): RedirectResponse {
        $this->vehicleService->update(
            $vehicle,
            $request->validated()
        );

        return to_route('vehicles.index')
            ->with('success', 'Vehicle updated successfully.');
    }

    public function destroy(Vehicle $vehicle): RedirectResponse
    {
        Gate::authorize('delete', $vehicle);

        $this->vehicleService->delete($vehicle);

        return to_route('vehicles.index')
            ->with('success', 'Vehicle deleted successfully.');
    }
}