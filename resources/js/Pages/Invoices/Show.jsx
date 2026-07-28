import AppLayout from '@/Layouts/AppLayout';
import StatusBadge from '@/Components/StatusBadge';
import { Head, Link } from '@inertiajs/react';

export default function InvoiceShow({ invoice }) {
    const job = invoice.job_card;
    const booking = job?.service_booking;
    const vehicle = booking?.vehicle;
    const parts = job?.parts ?? [];

    const currency = new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2,
    });

    const formatDate = (value) => {
        if (!value) {
            return '—';
        }

        return new Date(value).toLocaleDateString('en-LK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AppLayout title="Invoice">
            <Head title={invoice.invoice_number} />

            <div className="mb-5 flex items-center justify-between print:hidden">
                <Link
                    href={route('invoices.index')}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                    Back to Invoices
                </Link>

                <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
                >
                    Print Invoice
                </button>
            </div>

            <article className="mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm print:max-w-none print:border-0 print:p-0 print:shadow-none">
                <header className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-6 sm:flex-row">
                    <div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 font-bold text-white">
                            VS
                        </div>

                        <h1 className="mt-4 text-2xl font-bold text-slate-900">
                            Vehicle Service Center
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Vehicle Service Management System
                        </p>
                    </div>

                    <div className="sm:text-right">
                        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                            Invoice
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-900">
                            {invoice.invoice_number}
                        </p>

                        <p className="mt-3 text-sm text-slate-600">
                            Issued: {formatDate(invoice.issued_at)}
                        </p>

                        <div className="mt-2">
                            <StatusBadge
                                status={invoice.payment_status}
                            />
                        </div>
                    </div>
                </header>

                <div className="grid gap-8 border-b border-slate-200 py-6 sm:grid-cols-2">
                    <section>
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Bill To
                        </h2>

                        <p className="mt-3 font-semibold text-slate-900">
                            {invoice.customer?.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                            {invoice.customer?.phone}
                        </p>

                        <p className="text-sm text-slate-600">
                            {invoice.customer?.email}
                        </p>

                        <p className="mt-1 whitespace-pre-line text-sm text-slate-600">
                            {invoice.customer?.address}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Vehicle and Job
                        </h2>

                        <dl className="mt-3 space-y-2 text-sm">
                            <div className="flex justify-between gap-4">
                                <dt className="text-slate-500">
                                    Job number
                                </dt>
                                <dd className="font-medium text-slate-900">
                                    {job?.job_number}
                                </dd>
                            </div>

                            <div className="flex justify-between gap-4">
                                <dt className="text-slate-500">
                                    Registration
                                </dt>
                                <dd className="font-medium text-slate-900">
                                    {vehicle?.registration_no}
                                </dd>
                            </div>

                            <div className="flex justify-between gap-4">
                                <dt className="text-slate-500">
                                    Vehicle
                                </dt>
                                <dd className="font-medium text-slate-900">
                                    {vehicle?.make} {vehicle?.model}
                                </dd>
                            </div>

                            <div className="flex justify-between gap-4">
                                <dt className="text-slate-500">
                                    Mileage
                                </dt>
                                <dd className="font-medium text-slate-900">
                                    {Number(
                                        vehicle?.mileage ?? 0
                                    ).toLocaleString()}{' '}
                                    km
                                </dd>
                            </div>
                        </dl>
                    </section>
                </div>

                <div className="overflow-x-auto py-6">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Description
                                </th>
                                <th className="py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                    Quantity
                                </th>
                                <th className="py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                    Unit Price
                                </th>
                                <th className="py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                    Amount
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr className="border-b border-slate-100">
                                <td className="py-4 text-sm text-slate-900">
                                    Labor and service work
                                </td>
                                <td className="py-4 text-right text-sm text-slate-600">
                                    1
                                </td>
                                <td className="py-4 text-right text-sm text-slate-600">
                                    {currency.format(
                                        Number(invoice.labor_total)
                                    )}
                                </td>
                                <td className="py-4 text-right text-sm font-medium text-slate-900">
                                    {currency.format(
                                        Number(invoice.labor_total)
                                    )}
                                </td>
                            </tr>

                            {parts.map((part) => {
                                const quantity = Number(
                                    part.pivot?.quantity ?? 0
                                );

                                const price = Number(
                                    part.pivot?.unit_price ?? 0
                                );

                                return (
                                    <tr
                                        key={part.id}
                                        className="border-b border-slate-100"
                                    >
                                        <td className="py-4">
                                            <p className="text-sm text-slate-900">
                                                {part.name}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {part.part_number}
                                            </p>
                                        </td>

                                        <td className="py-4 text-right text-sm text-slate-600">
                                            {quantity}
                                        </td>

                                        <td className="py-4 text-right text-sm text-slate-600">
                                            {currency.format(price)}
                                        </td>

                                        <td className="py-4 text-right text-sm font-medium text-slate-900">
                                            {currency.format(
                                                quantity * price
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end border-t border-slate-200 pt-6">
                    <dl className="w-full max-w-sm space-y-3">
                        <div className="flex justify-between text-sm">
                            <dt className="text-slate-500">
                                Labor total
                            </dt>
                            <dd className="font-medium text-slate-900">
                                {currency.format(
                                    Number(invoice.labor_total)
                                )}
                            </dd>
                        </div>

                        <div className="flex justify-between text-sm">
                            <dt className="text-slate-500">
                                Parts total
                            </dt>
                            <dd className="font-medium text-slate-900">
                                {currency.format(
                                    Number(invoice.parts_total)
                                )}
                            </dd>
                        </div>

                        <div className="flex justify-between border-t border-slate-200 pt-3 text-lg">
                            <dt className="font-bold text-slate-900">
                                Total
                            </dt>
                            <dd className="font-bold text-blue-800">
                                {currency.format(
                                    Number(invoice.total_amount)
                                )}
                            </dd>
                        </div>
                    </dl>
                </div>

                {job?.work_description && (
                    <section className="mt-8 rounded-lg bg-slate-50 p-4">
                        <h2 className="text-xs font-semibold uppercase text-slate-500">
                            Work Completed
                        </h2>

                        <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
                            {job.work_description}
                        </p>
                    </section>
                )}

                <footer className="mt-10 border-t border-slate-200 pt-5 text-center text-xs text-slate-500">
                    This invoice was generated by the Vehicle Service Management System.
                </footer>
            </article>
        </AppLayout>
    );
}