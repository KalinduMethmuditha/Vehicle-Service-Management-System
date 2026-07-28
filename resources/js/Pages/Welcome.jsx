import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PublicVehicleForm from '@/Components/PublicVehicleForm';

export default function Welcome() {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const hasLogin = typeof route === 'function' && route().has('login');
    const hasRegister = typeof route === 'function' && route().has('register');
    const hasDashboard = typeof route === 'function' && route().has('dashboard');

    return (
        <>
            <Head title="Vehicle Service Management System" />

            <div className="min-h-screen bg-slate-50 text-slate-900 font-sans scroll-smooth">
                {/* HEADER / NAVIGATION */}
                <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
                        {/* Brand Logo */}
                        <Link href={route('home')} className="flex items-center gap-3 group">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 font-bold text-white shadow-sm transition group-hover:bg-blue-800">
                                VS
                            </span>
                            <div>
                                <p className="font-bold text-slate-900 leading-tight">
                                    Vehicle Service
                                </p>
                                <p className="text-xs text-slate-500 font-medium">
                                    Management System
                                </p>
                            </div>
                        </Link>

                        {/* Desktop Nav Links */}
                        <nav className="hidden items-center gap-8 md:flex text-sm font-medium text-slate-600">
                            <Link href={route('home')} className="hover:text-blue-700 transition">
                                Home
                            </Link>
                            <a href="#services" className="hover:text-blue-700 transition">
                                Services
                            </a>
                            <a href="#about" className="hover:text-blue-700 transition">
                                About
                            </a>
                            <a href="#register-vehicle" className="hover:text-blue-700 transition">
                                Register Vehicle
                            </a>
                        </nav>

                        {/* Auth Nav Buttons */}
                        <div className="hidden items-center gap-3 md:flex">
                            {user ? (
                                hasDashboard && (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                                    >
                                        Dashboard
                                    </Link>
                                )
                            ) : (
                                <>
                                    {hasLogin && (
                                        <Link
                                            href={route('login')}
                                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                                        >
                                            Login
                                        </Link>
                                    )}

                                    {hasRegister && (
                                        <Link
                                            href={route('register')}
                                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                                        >
                                            Register
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden focus:outline-none focus:ring-2 focus:ring-blue-600"
                            aria-expanded={mobileMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Dropdown Menu */}
                    {mobileMenuOpen && (
                        <div className="border-b border-slate-200 bg-white px-5 py-4 md:hidden space-y-3">
                            <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
                                <Link
                                    href={route('home')}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="py-1.5 hover:text-blue-700"
                                >
                                    Home
                                </Link>
                                <a
                                    href="#services"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="py-1.5 hover:text-blue-700"
                                >
                                    Services
                                </a>
                                <a
                                    href="#about"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="py-1.5 hover:text-blue-700"
                                >
                                    About
                                </a>
                                <a
                                    href="#register-vehicle"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="py-1.5 hover:text-blue-700"
                                >
                                    Register Vehicle
                                </a>
                            </nav>

                            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                                {user ? (
                                    hasDashboard && (
                                        <Link
                                            href={route('dashboard')}
                                            className="w-full text-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                                        >
                                            Dashboard
                                        </Link>
                                    )
                                ) : (
                                    <>
                                        {hasLogin && (
                                            <Link
                                                href={route('login')}
                                                className="w-full text-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                            >
                                                Login
                                            </Link>
                                        )}
                                        {hasRegister && (
                                            <Link
                                                href={route('register')}
                                                className="w-full text-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                                            >
                                                Register
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </header>

                <main>
                    {/* HERO SECTION */}
                    <section className="bg-slate-950 text-white">
                        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
                            {/* Left Content */}
                            <div>
                                <span className="inline-flex items-center rounded-full bg-blue-500/15 px-3.5 py-1 text-xs font-semibold text-blue-300 ring-1 ring-inset ring-blue-500/30">
                                    Enterprise Vehicle Care
                                </span>

                                <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-5xl tracking-tight">
                                    Drive Further with Confidence
                                </h1>

                                <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                                    Experience professional vehicle care built on quality, reliability, and customer satisfaction.
                                </p>

                                <div className="mt-8 flex flex-wrap gap-4">
                                    <a
                                        href="#register-vehicle"
                                        className="rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                                    >
                                        Register Your Vehicle
                                    </a>

                                    {hasLogin && (
                                        <Link
                                            href={route('login')}
                                            className="rounded-lg border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                                        >
                                            Staff Login
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Right Image */}
                            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
                                <img
                                    src="/images/vehicle-service-hero.jpg"
                                    alt="Professional vehicle servicing and mechanic workshop"
                                    className="h-[360px] w-full object-cover lg:h-[460px]"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80";
                                    }}
                                />
                            </div>
                        </div>
                    </section>

                    {/* FEATURES SECTION */}
                    <section id="services" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                                Core Capabilities
                            </span>

                            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
                                Complete Vehicle Service Management
                            </h2>

                            <p className="mt-3 text-base text-slate-600">
                                Streamline your service center operations with powerful, integrated management tools.
                            </p>
                        </div>

                        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Feature 1 */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:shadow-md">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>

                                <h3 className="mt-5 text-lg font-bold text-slate-900">
                                    Customer and Vehicle Management
                                </h3>

                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Register, organize, and manage complete customer profiles, vehicle registration numbers, VINs, and repair history.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:shadow-md">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>

                                <h3 className="mt-5 text-lg font-bold text-slate-900">
                                    Service Bookings
                                </h3>

                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Schedule service appointments seamlessly, track booking statuses, and manage vehicle reception effectively.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:shadow-md">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a2 2 0 01-2 2 2 2 0 01-2-2V4zm-6 8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8z" />
                                    </svg>
                                </div>

                                <h3 className="mt-5 text-lg font-bold text-slate-900">
                                    Job and Mechanic Tracking
                                </h3>

                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Assign specialized mechanics to job cards, record work diagnoses, monitor status progression, and track parts used.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:shadow-md">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>

                                <h3 className="mt-5 text-lg font-bold text-slate-900">
                                    Billing and Invoices
                                </h3>

                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Calculate labor and parts costs automatically, generate clear job invoices, and record payment statuses accurately.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ABOUT SECTION */}
                    <section id="about" className="border-t border-slate-200 bg-white px-5 py-20 lg:px-8">
                        <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-2 lg:items-center">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                                    About The Platform
                                </span>

                                <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
                                    Built for Professional Automotive Workshops
                                </h2>

                                <p className="mt-4 text-base leading-relaxed text-slate-600">
                                    Vehicle Service Management System is designed to eliminate fragmented record-keeping and manual errors in service operations. From the moment a customer registers their vehicle to final invoicing, every step is organized and transparent.
                                </p>

                                <div className="mt-8 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                                            ✓
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900">End-to-End Workflow</h4>
                                            <p className="text-xs text-slate-600 mt-0.5">Seamless transition from public registration to service booking, job card completion, and billing.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                                            ✓
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900">Role-Based Operations</h4>
                                            <p className="text-xs text-slate-600 mt-0.5">Dedicated management for admins, service advisors, and mechanics with granular permission controls.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900">
                                    Ready to get started?
                                </h3>

                                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                                    If you are a vehicle owner, submit your vehicle details using our public registration form below. Service center staff can log in to access the operational dashboard.
                                </p>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <a
                                        href="#register-vehicle"
                                        className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition"
                                    >
                                        Register Vehicle
                                    </a>

                                    {hasLogin && (
                                        <Link
                                            href={route('login')}
                                            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                                        >
                                            Staff Login
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* PUBLIC VEHICLE REGISTRATION FORM */}
                    <PublicVehicleForm />
                </main>

                {/* FOOTER */}
                <footer className="border-t border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-center sm:flex-row sm:text-left lg:px-8">
                        <div>
                            <p className="text-sm font-bold text-slate-900">
                                Vehicle Service Management System
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Drive further with confidence.
                            </p>
                        </div>

                        <p className="text-xs text-slate-500">
                            &copy; {new Date().getFullYear()} Vehicle Service Management System. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}