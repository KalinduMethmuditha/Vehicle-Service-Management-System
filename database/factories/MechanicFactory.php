<?php

namespace Database\Factories;

use App\Models\Mechanic;
use Illuminate\Database\Eloquent\Factories\Factory;

class MechanicFactory extends Factory
{
    protected $model = Mechanic::class;

    public function definition(): array
    {
        return [
            'user_id' => null,
            'employee_id' =>
                fake()->unique()->bothify('MEC-####'),
            'name' => fake()->name(),
            'specialization' => fake()->randomElement([
                'Engine Repair',
                'Electrical Systems',
                'Brake Systems',
                'Transmission',
                'General Maintenance',
            ]),
            'contact' => fake()->phoneNumber(),
            'is_active' => true,
        ];
    }
}