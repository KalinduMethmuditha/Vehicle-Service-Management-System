<?php

namespace App\Http\Controllers;

use App\Http\Requests\PublicVehicleRegistrationRequest;
use App\Services\PublicVehicleRegistrationService;
use Illuminate\Http\RedirectResponse;

class PublicVehicleRegistrationController extends Controller
{
    public function store(
        PublicVehicleRegistrationRequest $request,
        PublicVehicleRegistrationService $service
    ): RedirectResponse {
        $service->register($request->validated());

        return to_route('home')->with(
            'success',
            'Your customer and vehicle details were submitted successfully.'
        );
    }
}