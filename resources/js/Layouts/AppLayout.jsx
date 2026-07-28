import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AppLayout({ title, children }) {
    const { auth, flash } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const user = auth?.user;
    const roles = user?.roles ?? [];

    const isAdmin = roles.includes('Admin');
    const isAdvisor = roles.includes('Service Advisor');
    const isMechanic = roles.includes('Mechanic');

    const adminNavigation = [
        {
            label: 'Dashboard',
            route: 'dashboard',
            active: 'dashboard',
        },
        {
            label: 'Users & Roles',
            route: 'admin.users.index',
            active: 'admin.users.*',
        },
        {
            label: 'Customers',
            route: 'customers.index',
            active: 'customers.*',
        },
        {
            label: 'Vehicles',
            route: 'vehicles.index',
            active: 'vehicles.*',
        },
        {
            label: 'Mechanics',
            route: 'mechanics.index',
            active: 'mechanics.*',
        },
        {
            label: 'Bookings',
            route: 'bookings.index',
            active: 'bookings.*',
        },
        {
            label: 'Job Cards',
            route: 'job-cards.index',
            active: 'job-cards.*',
        },
        {
            label: 'Parts Inventory',
            route: 'parts.index',
            active: 'parts.*',
        },
        {
            label: 'Invoices',
            route: 'invoices.index',
            active: 'invoices.*',
        },
    ];

    const advisorNavigation = [
        {
            label: 'Dashboard',
            route: 'dashboard',
            active: 'dashboard',
        },
        {
            label: 'Customers',
            route: 'customers.index',
            active: 'customers.*',
        },
        {
            label: 'Vehicles',
            route: 'vehicles.index',
            active: 'vehicles.*',
        },
        {
            label: 'Bookings',
            route: 'bookings.index',
            active: 'bookings.*',
        },
        {
            label: 'Job Cards',
            route: 'job-cards.index',
            active: 'job-cards.*',
        },
        {
            label: 'Invoices',
            route: 'invoices.index',
            active: 'invoices.*',
        },
    ];

    const mechanicNavigation = [
        {
            label: 'Dashboard',
            route: 'dashboard',
            active: 'dashboard',
        },
        {
            label: 'Assigned Jobs',
            route: 'job-cards.index',
            active: 'job-cards.*',
        },
    ];

    let navigation = [];

    if (isAdmin) {
        navigation = adminNavigation;
    } else if (isAdvisor) {
        navigation = advisorNavigation;
    } else if (isMechanic) {
        navigation = mechanicNavigation;
    }

    const currentRole = roles[0] ?? 'User';

    const SidebarContent = () => (
        <>
            <div className="border-b border-slate-700 px-5 py-5">
                <Link
                    href={route('dashboard')}
                    className="flex items-center gap-3"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
                        VS
                    </div>

                    <div>
                        <p className="font-semibold text-white">
                            Vehicle Service
                        </p>

                        <p className="text-xs text-slate-400">
                            Management System
                        </p>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
                {navigation
                    .filter((item) => route().has(item.route))
                    .map((item) => {
                        const active = route().current(
                            item.active
                        );

                        return (
                            <Link
                                key={item.route}
                                href={route(item.route)}
                                onClick={() =>
                                    setSidebarOpen(false)
                                }
                                className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                                    active
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
            </nav>

            <div className="border-t border-slate-700 p-4">
                <div className="mb-4 rounded-lg bg-slate-800 p-3">
                    <p className="truncate text-sm font-medium text-white">
                        {user?.name}
                    </p>

                    <p className="truncate text-xs text-slate-400">
                        {user?.email}
                    </p>

                    <span className="mt-2 inline-flex rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-300">
                        {currentRole}
                    </span>
                </div>

                {route().has('profile.edit') && (
                    <Link
                        href={route('profile.edit')}
                        className="mb-2 block w-full rounded-lg border border-slate-600 px-4 py-2 text-center text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                    >
                        Profile
                    </Link>
                )}

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="w-full rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-300"
                >
                    Sign out
                </Link>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white">
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden print:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 transition-transform duration-200 print:hidden lg:translate-x-0 ${
                    sidebarOpen
                        ? 'translate-x-0'
                        : '-translate-x-full'
                }`}
            >
                <SidebarContent />
            </aside>

            <div className="lg:pl-64 print:pl-0">
                <header className="sticky top-0 z-30 border-b border-slate-200 bg-white print:hidden">
                    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setSidebarOpen(true)
                                }
                                className="rounded-lg border border-slate-300 p-2 text-slate-600 lg:hidden"
                                aria-label="Open sidebar"
                            >
                                <span className="block h-0.5 w-5 bg-current" />
                                <span className="mt-1 block h-0.5 w-5 bg-current" />
                                <span className="mt-1 block h-0.5 w-5 bg-current" />
                            </button>

                            <div>
                                <h1 className="text-lg font-semibold text-slate-900">
                                    {title}
                                </h1>

                                <p className="hidden text-xs text-slate-500 sm:block">
                                    Vehicle Service Management
                                    System
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-sm font-medium text-slate-800">
                                {user?.name}
                            </p>

                            <p className="text-xs text-slate-500">
                                {currentRole}
                            </p>
                        </div>
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8 print:p-0">
                    {flash?.success && (
                        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 print:hidden">
                            {flash.success}
                        </div>
                    )}

                    {flash?.error && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 print:hidden">
                            {flash.error}
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
}