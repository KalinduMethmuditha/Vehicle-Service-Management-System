import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">
                    Dashboard
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    The dashboard is ready to receive real system data.
                </p>
            </div>
        </AppLayout>
    );
}