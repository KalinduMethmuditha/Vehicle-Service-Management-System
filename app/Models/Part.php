<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Part extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'part_number',
        'name',
        'description',
        'stock_quantity',
        'minimum_stock_level',
        'unit_price',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'stock_quantity' => 'integer',
            'minimum_stock_level' => 'integer',
            'unit_price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereColumn(
            'stock_quantity',
            '<=',
            'minimum_stock_level'
        );
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0);
    }

    public function jobCards(): BelongsToMany
    {
         return $this->belongsToMany(JobCard::class)
           ->withPivot(['quantity', 'unit_price'])
           ->withTimestamps();
    }
}