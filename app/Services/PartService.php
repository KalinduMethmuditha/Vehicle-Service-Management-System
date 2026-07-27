<?php

namespace App\Services;

use App\Models\Part;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PartService
{
    public function create(array $data): Part
    {
        return Part::create($data);
    }

    public function update(Part $part, array $data): Part
    {
        $part->update($data);

        return $part->refresh();
    }

    public function adjustStock(
        Part $part,
        string $type,
        int $quantity
    ): Part {
        return DB::transaction(function () use (
            $part,
            $type,
            $quantity
        ) {
            $lockedPart = Part::query()
                ->lockForUpdate()
                ->findOrFail($part->id);

            if (
                $type === 'decrease' &&
                $lockedPart->stock_quantity < $quantity
            ) {
                throw ValidationException::withMessages([
                    'quantity' => 'Insufficient stock available.',
                ]);
            }

            if ($type === 'increase') {
                $lockedPart->increment('stock_quantity', $quantity);
            } else {
                $lockedPart->decrement('stock_quantity', $quantity);
            }

            return $lockedPart->refresh();
        });
    }

    public function delete(Part $part): void
    {
        $part->delete();
    }
}