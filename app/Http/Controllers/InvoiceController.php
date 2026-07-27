<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Http\Requests\UpdateInvoicePaymentRequest;
use App\Models\Invoice;
use App\Models\JobCard;
use App\Services\InvoiceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function __construct(
        private readonly InvoiceService $invoiceService
    ) {
    }

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Invoice::class);

        $invoices = Invoice::query()
            ->with([
                'customer:id,name,email,phone',
                'jobCard:id,job_number,service_booking_id',
                'jobCard.serviceBooking.vehicle',
            ])
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where(
                        'invoice_number',
                        'like',
                        "%{$search}%"
                    )
                        ->orWhereHas(
                            'customer',
                            fn ($query) =>
                                $query->where(
                                    'name',
                                    'like',
                                    "%{$search}%"
                                )
                        )
                        ->orWhereHas(
                            'jobCard',
                            fn ($query) =>
                                $query->where(
                                    'job_number',
                                    'like',
                                    "%{$search}%"
                                )
                        );
                });
            })
            ->when(
                $request->input('payment_status'),
                fn ($query, $status) =>
                    $query->where('payment_status', $status)
            )
            ->when(
                $request->input('date'),
                fn ($query, $date) =>
                    $query->whereDate('issued_at', $date)
            )
            ->latest('issued_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,

            'statistics' => [
                'pending' => Invoice::where(
                    'payment_status',
                    PaymentStatus::Pending->value
                )->count(),

                'paid' => Invoice::where(
                    'payment_status',
                    PaymentStatus::Paid->value
                )->count(),

                'todayRevenue' => Invoice::where(
                    'payment_status',
                    PaymentStatus::Paid->value
                )
                    ->whereDate('paid_at', today())
                    ->sum('total_amount'),
            ],

            'filters' => $request->only([
                'search',
                'payment_status',
                'date',
            ]),
        ]);
    }

    public function show(Invoice $invoice): Response
    {
        Gate::authorize('view', $invoice);

        $invoice->load([
            'customer',
            'jobCard.mechanics',
            'jobCard.parts',
            'jobCard.serviceBooking.vehicle',
        ]);

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice,
        ]);
    }

    public function generate(JobCard $jobCard): RedirectResponse
    {
        Gate::authorize('create', Invoice::class);

        $this->invoiceService->generateForJob($jobCard);

        return to_route('invoices.index')
            ->with('success', 'Invoice generated successfully.');
    }

    public function updatePayment(
        UpdateInvoicePaymentRequest $request,
        Invoice $invoice
    ): RedirectResponse {
        $this->invoiceService->updatePaymentStatus(
            $invoice,
            PaymentStatus::from(
                $request->validated('payment_status')
            )
        );

        return to_route('invoices.index')
            ->with('success', 'Payment status updated successfully.');
    }
}