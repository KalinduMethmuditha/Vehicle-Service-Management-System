import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 font-sans sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <Link href="/" className="mb-8 flex items-center justify-center gap-3 text-[#1E3A8A]">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1E3A8A] shadow-sm">
                        <ApplicationLogo className="h-7 w-7 fill-current text-white" />
                    </span>
                    <span className="text-xl font-semibold tracking-tight">Vehicle Service</span>
                </Link>
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-8 shadow-sm sm:px-8">
                {children}
                </div>
            </div>
        </div>
    );
}
