<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PartFactory extends Factory
{
    public function definition(): array
    {
        return [
            'part_number' => fake()->unique()->bothify('PRT-####'),
            'name' => fake()->randomElement([
                'Oil Filter',
                'Air Filter',
                'Brake Pad',
                'Spark Plug',
                'Engine Oil',
            ]),
            'description' => fake()->sentence(),
            'stock_quantity' => fake()->numberBetween(0, 50),
            'minimum_stock_level' => 5,
            'unit_price' => fake()->randomFloat(2, 500, 25000),
            'is_active' => true,
        ];
    }
}