import AppLayout from '@/Layouts/AppLayout';
import Pagination from '@/Components/Pagination';
import StatCard from '@/Components/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

function formatDate(value) {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleDateString('en-LK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function InvoiceIndex({
    invoices,
    statistics = {},
    filters = {},
}) {
    const { auth } = usePage().props;
    const permissions = auth?.user?.permissions ?? [];

    const canUpdate = permissions.includes('invoices.update');

    const [search, setSearch] = useState(filters.search ?? '');
    const [paymentStatus, setPaymentStatus] = useState(
        filters.payment_status ?? ''
    );
    const [date, setDate] = useState(filters.date ?? '');

    const currency = new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2,
    });

    const applyFilters = (event) => {
        event.preventDefault();

        router.get(
            route('invoices.index'),
            {
                search: search || undefined,
                payment_status: paymentStatus || undefined,
                date: date || undefined,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clearFilters = () => {
        setSearch('');
        setPaymentStatus('');
        setDate('');

        router.get(
            route('invoices.index'),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const updatePayment = (invoice, status) => {
        const label =
            status === 'paid' ? 'Paid' : 'Pending';

        if (
            !window.confirm(
                `Change ${invoice.invoice_number} to ${label}?`
            )
        ) {
            return;
        }

        router.patch(
            route('invoices.payment.update', invoice.id),
            {
                payment_status: status,
            },
            {
                preserveScroll: true,
            }
        );
    };

    return (
        <AppLayout title="Invoices">
            <Head title="Invoices" />

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    title="Pending"
                    value={statistics.pending}
                    tone="amber"
                />

                <StatCard
                    title="Paid"
                    value={statistics.paid}
                    tone="green"
                />

                <StatCard
                    title="Today's Revenue"
                    value={currency.format(
                        Number(statistics.todayRevenue ?? 0)
                    )}
                    tone="blue"
                />
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Billing and Invoices
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Invoices are generated automatically when jobs are completed
                    </p>
                </div>

                <form
                    onSubmit={applyFilters}
                    className="grid gap-3 border-b border-slate-200 p-5 lg:grid-cols-[1fr_190px_190px_auto_auto]"
                >
                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Invoice, customer or job number"
                        className="rounded-lg border-slate-300 text-sm"
                    />

                    <select
                        value={paymentStatus}
                        onChange={(event) =>
                            setPaymentStatus(event.target.value)
                        }
                        className="rounded-lg border-slate-300 text-sm"
                    >
                        <option value="">All payments</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                    </select>

                    <input
                        type="date"
                        value={date}
                        onChange={(event) =>
                            setDate(event.target.value)
                        }
                        className="rounded-lg border-slate-300 text-sm"
                    />

                    <button
                        type="submit"
                        className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        Filter
                    </button>

                    {(filters.search ||
                        filters.payment_status ||
                        filters.date) && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold"
                        >
                            Clear
                        </button>
                    )}
                </form>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Invoice
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Customer
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Job and Vehicle
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Issued
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Total
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Payment
                                </th>
                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {invoices.data.length > 0 ? (
                                invoices.data.map((invoice) => (
                                    <tr
                                        key={invoice.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
                                            {invoice.invoice_number}
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-slate-900">
                                                {invoice.customer?.name ??
                                                    '—'}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {invoice.customer?.phone ??
                                                    '—'}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="text-sm text-slate-700">
                                                {invoice.job_card
                                                    ?.job_number ?? '—'}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {invoice.job_card
                                                    ?.service_booking
                                                    ?.vehicle
                                                    ?.registration_no ?? '—'}
                                            </p>
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                            {formatDate(
                                                invoice.issued_at
                                            )}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
                                            {currency.format(
                                                Number(
                                                    invoice.total_amount
                                                )
                                            )}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4">
                                            <StatusBadge
                                                status={
                                                    invoice.payment_status
                                                }
                                            />
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={route(
                                                        'invoices.show',
                                                        invoice.id
                                                    )}
                                                    className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                                                >
                                                    View
                                                </Link>

                                                {canUpdate &&
                                                    invoice.payment_status ===
                                                        'pending' && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updatePayment(
                                                                    invoice,
                                                                    'paid'
                                                                )
                                                            }
                                                            className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                                                        >
                                                            Mark Paid
                                                        </button>
                                                    )}

                                                {canUpdate &&
                                                    invoice.payment_status ===
                                                        'paid' && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updatePayment(
                                                                    invoice,
                                                                    'pending'
                                                                )
                                                            }
                                                            className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                                                        >
                                                            Mark Pending
                                                        </button>
                                                    )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-5 py-12 text-center text-sm text-slate-500"
                                    >
                                        No invoices found. Complete a job to generate one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={invoices.links} />
            </div>
        </AppLayout>
    );
}