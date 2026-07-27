import AppLayout from '@/Layouts/AppLayout';
import StatCard from '@/Components/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import { Head, Link } from '@inertiajs/react';

export default function MechanicDashboard({
    stats = {},
    assignedJobs = [],
}) {
    const formatDate = (date) => {
        if (!date) {
            return '—';
        }

        return new Date(date).toLocaleString('en-LK', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout title="Mechanic Dashboard">
            <Head title="Mechanic Dashboard" />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Today's Jobs"
                    value={stats.todayJobs}
                    tone="blue"
                />

                <StatCard
                    title="Pending"
                    value={stats.pendingJobs}
                    tone="amber"
                />

                <StatCard
                    title="In Progress"
                    value={stats.inProgressJobs}
                    tone="blue"
                />

                <StatCard
                    title="Completed Today"
                    value={stats.completedToday}
                    tone="green"
                />
            </div>

            <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Assigned Jobs
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Your pending and active work
                        </p>
                    </div>

                    <Link
                        href={route('job-cards.index')}
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
                                    Job
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Schedule
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Vehicle
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Customer
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {assignedJobs.length > 0 ? (
                                assignedJobs.map((job) => (
                                    <tr key={job.id}>
                                        <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900">
                                            {job.job_number}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                            {formatDate(
                                                job.service_booking
                                                    ?.starts_at
                                            )}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                            {job.service_booking?.vehicle
                                                ?.registration_no ?? '—'}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                            {job.service_booking?.vehicle
                                                ?.customer?.name ?? '—'}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4">
                                            <StatusBadge
                                                status={job.status}
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
                                        No active jobs are assigned to you.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </AppLayout>
    );
}