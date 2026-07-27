<?php

namespace App\Models;

use App\Enums\JobStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class JobCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_number',
        'service_booking_id',
        'diagnosis',
        'work_description',
        'labor_cost',
        'status',
        'started_at',
        'completed_at',
        'stock_deducted_at',
        'completion_summary',
    ];

    protected function casts(): array
    {
        return [
            'labor_cost' => 'decimal:2',
            'status' => JobStatus::class,
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'stock_deducted_at' => 'datetime',
        ];
    }

    public function serviceBooking(): BelongsTo
    {
        return $this->belongsTo(ServiceBooking::class);
    }

    public function mechanics(): BelongsToMany
    {
        return $this->belongsToMany(Mechanic::class)
            ->withTimestamps();
    }

    public function parts(): BelongsToMany
    {
        return $this->belongsToMany(Part::class)
            ->withPivot(['quantity', 'unit_price'])
            ->withTimestamps();
    }

    public function invoice(): HasOne
    {
         return $this->hasOne(Invoice::class);
    }
    
}