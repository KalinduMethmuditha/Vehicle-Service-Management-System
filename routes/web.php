<?php

use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\JobCardController;
use App\Http\Controllers\MechanicController;
use App\Http\Controllers\PartController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicVehicleRegistrationController;
use App\Http\Controllers\ServiceBookingController;
use App\Http\Controllers\VehicleController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::post(
    '/vehicle-registration',
    [PublicVehicleRegistrationController::class, 'store']
)
    ->middleware('throttle:5,1')
    ->name('public.vehicle.store');

/*
|--------------------------------------------------------------------------
| Authenticated and Verified Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {
    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    Route::get('/dashboard', DashboardController::class)
        ->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Admin User and Role Management
    |--------------------------------------------------------------------------
    */

    Route::prefix('admin')
        ->name('admin.')
        ->group(function () {
            Route::get(
                '/users',
                [UserManagementController::class, 'index']
            )->name('users.index');

            Route::patch(
                '/users/{user}',
                [UserManagementController::class, 'update']
            )->name('users.update');

            Route::delete(
                '/users/{user}',
                [UserManagementController::class, 'destroy']
            )->name('users.destroy');
        });

    /*
    |--------------------------------------------------------------------------
    | Customer Management
    |--------------------------------------------------------------------------
    */

    Route::resource('customers', CustomerController::class)
        ->only([
            'index',
            'store',
            'update',
            'destroy',
        ]);

    /*
    |--------------------------------------------------------------------------
    | Vehicle Management
    |--------------------------------------------------------------------------
    */

    Route::resource('vehicles', VehicleController::class)
        ->only([
            'index',
            'store',
            'update',
            'destroy',
        ]);

    /*
    |--------------------------------------------------------------------------
    | Mechanic Management
    |--------------------------------------------------------------------------
    */

    Route::resource('mechanics', MechanicController::class)
        ->only([
            'index',
            'store',
            'update',
            'destroy',
        ]);

    /*
    |--------------------------------------------------------------------------
    | Parts Inventory
    |--------------------------------------------------------------------------
    */

    Route::patch(
        'parts/{part}/stock',
        [PartController::class, 'adjustStock']
    )->name('parts.stock.adjust');

    Route::resource('parts', PartController::class)
        ->only([
            'index',
            'store',
            'update',
            'destroy',
        ]);

    /*
    |--------------------------------------------------------------------------
    | Service Bookings
    |--------------------------------------------------------------------------
    */

    Route::resource(
        'bookings',
        ServiceBookingController::class
    )->only([
        'index',
        'store',
        'update',
        'destroy',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Job Cards
    |--------------------------------------------------------------------------
    */

    Route::patch(
        'job-cards/{job_card}/status',
        [JobCardController::class, 'updateStatus']
    )->name('job-cards.status.update');

    Route::post(
        'job-cards/{jobCard}/invoice',
        [InvoiceController::class, 'generate']
    )->name('job-cards.invoice.generate');

    Route::resource('job-cards', JobCardController::class)
        ->only([
            'index',
            'store',
            'update',
            'destroy',
        ]);

    /*
    |--------------------------------------------------------------------------
    | Invoices
    |--------------------------------------------------------------------------
    */

    Route::get(
        'invoices',
        [InvoiceController::class, 'index']
    )->name('invoices.index');

    Route::get(
        'invoices/{invoice}',
        [InvoiceController::class, 'show']
    )->name('invoices.show');

    Route::patch(
        'invoices/{invoice}/payment',
        [InvoiceController::class, 'updatePayment']
    )->name('invoices.payment.update');
});

/*
|--------------------------------------------------------------------------
| Authenticated Profile Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {
    Route::get(
        '/profile',
        [ProfileController::class, 'edit']
    )->name('profile.edit');

    Route::patch(
        '/profile',
        [ProfileController::class, 'update']
    )->name('profile.update');

    Route::delete(
        '/profile',
        [ProfileController::class, 'destroy']
    )->name('profile.destroy');
});

Route::post(
    'job-cards/{jobCard}/ai-summary',
    [JobCardController::class, 'generateAiSummary']
)
    ->middleware('throttle:10,1')
    ->name('job-cards.ai-summary.generate');

require __DIR__.'/auth.php';