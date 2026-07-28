<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Vehicle;
use Illuminate\Support\Facades\DB;

class PublicVehicleRegistrationService
{
    public function register(array $data): Vehicle
    {
        return DB::transaction(function () use ($data) {
            $customer = Customer::firstOrCreate(
                [
                    'email' => $data['email'],
                ],
                [
                    'name' => $data['customer_name'],
                    'phone' => $data['phone'],
                    'address' => $data['address'] ?? null,
                    'notes' => $data['notes'] ?? null,
                ]
            );

            return Vehicle::create([
                'customer_id' => $customer->id,
                'registration_no' =>
                    $data['registration_no'],
                'make' => $data['make'],
                'model' => $data['model'],
                'year' => $data['year'],
                'vin' => $data['vin'] ?? null,
                'mileage' => $data['mileage'],
            ]);
        });
    }
}