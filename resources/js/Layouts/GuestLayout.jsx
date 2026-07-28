import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-8 font-sans sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <div className="mb-6 text-center">
                    <Link
                        href={route('home')}
                        className="inline-flex flex-col items-center justify-center group"
                    >
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 text-lg font-bold text-white shadow-md transition group-hover:bg-blue-800">
                            VS
                        </span>
                        <span className="mt-3 text-xl font-bold tracking-tight text-slate-900">
                            Vehicle Service
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                            Management System
                        </span>
                    </Link>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8">
                    {children}
                </div>

                <div className="mt-6 text-center">
                    <Link
                        href={route('home')}
                        className="text-xs font-semibold text-slate-600 hover:text-blue-700 transition"
                    >
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
