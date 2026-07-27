<?php

namespace Database\Factories;

use App\Enums\BookingStatus;
use App\Models\ServiceBooking;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceBookingFactory extends Factory
{
    protected $model = ServiceBooking::class;

    public function definition(): array
    {
        $start = fake()->dateTimeBetween('+1 day', '+1 month');
        $end = (clone $start)->modify('+1 hour');

        return [
            'booking_number' =>
                fake()->unique()->bothify('BKG-########'),
            'vehicle_id' => Vehicle::factory(),
            'advisor_id' => null,
            'starts_at' => $start,
            'ends_at' => $end,
            'complaint' => fake()->sentence(),
            'notes' => fake()->optional()->sentence(),
            'status' => BookingStatus::Scheduled->value,
        ];
    }
}