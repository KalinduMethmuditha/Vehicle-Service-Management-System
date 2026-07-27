import AppLayout from '@/Layouts/AppLayout';
import StatCard from '@/Components/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import { Head, Link } from '@inertiajs/react';

export default function AdminDashboard({
    stats = {},
    todayBookings = [],
    lowStockParts = [],
}) {
    const currency = new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2,
    });

    const formatTime = (date) => {
        if (!date) {
            return '—';
        }

        return new Date(date).toLocaleTimeString('en-LK', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Today's Bookings"
                    value={stats.todayBookings}
                    tone="blue"
                />

                <StatCard
                    title="Active Jobs"
                    value={stats.activeJobs}
                    tone="amber"
                />

                <StatCard
                    title="Low Stock"
                    value={stats.lowStock}
                    tone="red"
                />

                <StatCard
                    title="Today's Revenue"
                    value={currency.format(
                        Number(stats.dailyRevenue ?? 0)
                    )}
                    tone="green"
                />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-3">
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Today’s Bookings
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Scheduled appointments for today
                            </p>
                        </div>

                        <Link
                            href={route('bookings.index')}
                            className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                        >
                            View all
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                        Booking
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                        Time
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                        Customer
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                        Vehicle
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {todayBookings.length > 0 ? (
                                    todayBookings.map((booking) => (
                                        <tr key={booking.id}>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900">
                                                {booking.booking_number}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                                {formatTime(
                                                    booking.starts_at
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                                {booking.vehicle?.customer
                                                    ?.name ?? '—'}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                                {booking.vehicle
                                                    ?.registration_no ?? '—'}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4">
                                                <StatusBadge
                                                    status={booking.status}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-5 py-10 text-center text-sm text-slate-500"
                                        >
                                            No bookings scheduled today.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Low Stock
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Parts requiring attention
                            </p>
                        </div>

                        <Link
                            href={route('parts.index')}
                            className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                        >
                            Inventory
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {lowStockParts.length > 0 ? (
                            lowStockParts.map((part) => (
                                <div
                                    key={part.id}
                                    className="flex items-center justify-between px-5 py-4"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">
                                            {part.name}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {part.part_number}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <StatusBadge status="low" />

                                        <p className="mt-1 text-xs text-slate-500">
                                            {part.stock_quantity} /{' '}
                                            {part.minimum_stock_level}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="px-5 py-10 text-center text-sm text-slate-500">
                                No low-stock parts.
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}