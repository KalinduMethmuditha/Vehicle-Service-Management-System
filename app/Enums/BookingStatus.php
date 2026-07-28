<?php

namespace App\Enums;

enum BookingStatus: string
{
    case Pending = 'pending';
    case Scheduled = 'scheduled';
    case Confirmed = 'confirmed';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
