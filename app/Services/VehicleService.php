<?php

namespace App\Services;
use DomainException;
use Illuminate\Support\Facades\DB;
use App\Models\Vehicle;

class VehicleService
{
    public function create(array $data): Vehicle
    {
        return Vehicle::create($data);
    }

    public function update(Vehicle $vehicle, array $data): Vehicle
    {
        $vehicle->update($data);

        return $vehicle->refresh();
    }

    public function delete(Vehicle $vehicle): void
    {
      $hasBookingHistory = DB::table('service_bookings')
        ->where('vehicle_id', $vehicle->id)
        ->exists();

      if ($hasBookingHistory) {
        throw new DomainException(
            'This vehicle cannot be deleted because it has service booking history.'
        );
     }

     $vehicle->delete();
    }
}