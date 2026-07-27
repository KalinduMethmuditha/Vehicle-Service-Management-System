<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'registration_no',
        'make',
        'model',
        'year',
        'vin',
        'mileage',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'mileage' => 'integer',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
        
    }
    public function serviceBookings(): HasMany
    {
        return $this->hasMany(ServiceBooking::class);
    }
}