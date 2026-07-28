import { useForm, usePage } from '@inertiajs/react';

function ErrorMessage({ message }) {
    if (!message) {
        return null;
    }

    return (
        <p className="mt-1 text-xs font-medium text-red-600">
            {message}
        </p>
    );
}

export default function PublicVehicleForm() {
    const { flash } = usePage().props;

    const form = useForm({
        website: '',
        customer_name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        registration_no: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
        mileage: '',
        consent: false,
    });

    const submit = (event) => {
        event.preventDefault();

        form.post(route('public.vehicle.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <section
            id="register-vehicle"
            className="scroll-mt-12 bg-slate-100 px-5 py-16 lg:px-8"
        >
            <div className="mx-auto grid max-w-7xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[0.8fr_1.2fr]">
                {/* Mobile / Tablet Image Banner Header */}
                <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-slate-900 lg:hidden">
                    <img
                        src="/images/vehicle-service-hero.jpg"
                        alt="Vehicle servicing and inspection"
                        className="h-full w-full object-cover opacity-45"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80";
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                    <div className="absolute bottom-4 left-6 right-6 text-white">
                        <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-blue-300 ring-1 ring-inset ring-blue-500/30">
                            Public Registration
                        </span>
                        <h2 className="mt-1 text-xl font-extrabold sm:text-2xl">
                            Register Your Vehicle
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-300">
                            Submit customer and vehicle details without login.
                        </p>
                    </div>
                </div>

                {/* Desktop Visual Side Banner */}
                <div className="relative hidden min-h-full flex-col justify-between bg-slate-900 p-8 lg:flex">
                    <img
                        src="/images/vehicle-service-hero.jpg"
                        alt="Vehicle servicing and inspection"
                        className="absolute inset-0 h-full w-full object-cover opacity-40"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80";
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />

                    <div className="relative z-10">
                        <span className="inline-flex items-center rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 ring-1 ring-inset ring-blue-500/30">
                            Public Registration
                        </span>
                    </div>

                    <div className="relative z-10 text-white">
                        <h2 className="text-3xl font-extrabold tracking-tight">
                            Register Your Vehicle
                        </h2>

                        <p className="mt-3 text-sm leading-relaxed text-slate-300">
                            No account or login required. Provide your vehicle and contact details, and our service advisors will prepare your record for fast service scheduling.
                        </p>

                        <div className="mt-8 space-y-3 border-t border-slate-800 pt-6 text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                                <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Instant service record creation
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Transparent diagnosis & job card tracking
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Container */}
                <div className="p-6 sm:p-10">
                    {flash?.success && (
                        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-800 shadow-sm">
                            {flash.success}
                        </div>
                    )}

                    <form
                        onSubmit={submit}
                        className="space-y-8"
                    >
                        {/* Honeypot field for spam protection */}
                        <input
                            type="text"
                            name="website"
                            value={form.data.website}
                            onChange={(event) =>
                                form.setData(
                                    'website',
                                    event.target.value
                                )
                            }
                            className="hidden"
                            tabIndex="-1"
                            autoComplete="off"
                        />

                        {/* Customer Information */}
                        <fieldset className="space-y-4">
                            <legend className="border-b border-slate-200 pb-2 text-base font-semibold text-slate-900 w-full">
                                Customer Information
                            </legend>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-700">
                                        Full Name *
                                    </label>

                                    <input
                                        type="text"
                                        value={form.data.customer_name}
                                        onChange={(event) =>
                                            form.setData(
                                                'customer_name',
                                                event.target.value
                                            )
                                        }
                                        placeholder="John Doe"
                                        className="mt-1 w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-blue-600 focus:ring-blue-600"
                                    />

                                    <ErrorMessage
                                        message={form.errors.customer_name}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-700">
                                        Email Address *
                                    </label>

                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(event) =>
                                            form.setData(
                                                'email',
                                                event.target.value
                                            )
                                        }
                                        placeholder="john@example.com"
                                        className="mt-1 w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-blue-600 focus:ring-blue-600"
                                    />

                                    <ErrorMessage
                                        message={form.errors.email}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-700">
                                        Phone Number *
                                    </label>

                                    <input
                                        type="text"
                                        value={form.data.phone}
                                        onChange={(event) =>
                                            form.setData(
                                                'phone',
                                                event.target.value
                                            )
                                        }
                                        placeholder="+1 (555) 000-0000"
                                        className="mt-1 w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-blue-600 focus:ring-blue-600"
                                    />

                                    <ErrorMessage
                                        message={form.errors.phone}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-700">
                                        Address
                                    </label>

                                    <input
                                        type="text"
                                        value={form.data.address}
                                        onChange={(event) =>
                                            form.setData(
                                                'address',
                                                event.target.value
                                            )
                                        }
                                        placeholder="123 Main Street, City"
                                        className="mt-1 w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-blue-600 focus:ring-blue-600"
                                    />

                                    <ErrorMessage
                                        message={form.errors.address}
                                    />
                                </div>
                            </div>
                        </fieldset>

                        {/* Vehicle Information */}
                        <fieldset className="space-y-4">
                            <legend className="border-b border-slate-200 pb-2 text-base font-semibold text-slate-900 w-full">
                                Vehicle Information
                            </legend>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-700">
                                        Registration Number *
                                    </label>

                                    <input
                                        type="text"
                                        value={form.data.registration_no}
                                        onChange={(event) =>
                                            form.setData(
                                                'registration_no',
                                                event.target.value
                                            )
                                        }
                                        placeholder="ABC-1234"
                                        className="mt-1 w-full rounded-lg border-slate-300 text-sm uppercase shadow-sm focus:border-blue-600 focus:ring-blue-600"
                                    />

                                    <ErrorMessage
                                        message={form.errors.registration_no}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-700">
                                        Make *
                                    </label>

                                    <input
                                        type="text"
                                        value={form.data.make}
                                        onChange={(event) =>
                                            form.setData(
                                                'make',
                                                event.target.value
                                            )
                                        }
                                        placeholder="Toyota"
                                        className="mt-1 w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-blue-600 focus:ring-blue-600"
                                    />

                                    <ErrorMessage
                                        message={form.errors.make}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-700">
                                        Model *
                                    </label>

                                    <input
                                        type="text"
                                        value={form.data.model}
                                        onChange={(event) =>
                                            form.setData(
                                                'model',
                                                event.target.value
                                            )
                                        }
                                        placeholder="Camry"
                                        className="mt-1 w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-blue-600 focus:ring-blue-600"
                                    />

                                    <ErrorMessage
                                        message={form.errors.model}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-700">
                                        Year *
                                    </label>

                                    <input
                                        type="number"
                                        min="1900"
                                        max={new Date().getFullYear() + 1}
                                        value={form.data.year}
                                        onChange={(event) =>
                                            form.setData(
                                                'year',
                                                event.target.value
                                            )
                                        }
                                        className="mt-1 w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-blue-600 focus:ring-blue-600"
                                    />

                                    <ErrorMessage
                                        message={form.errors.year}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-700">
                                        Mileage (km) *
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={form.data.mileage}
                                        onChange={(event) =>
                                            form.setData(
                                                'mileage',
                                                event.target.value
                                            )
                                        }
                                        placeholder="45000"
                                        className="mt-1 w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-blue-600 focus:ring-blue-600"
                                    />

                                    <ErrorMessage
                                        message={form.errors.mileage}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-700">
                                        VIN (Optional)
                                    </label>

                                    <input
                                        type="text"
                                        maxLength="17"
                                        value={form.data.vin}
                                        onChange={(event) =>
                                            form.setData(
                                                'vin',
                                                event.target.value
                                            )
                                        }
                                        placeholder="1HGCR2F83HA000000"
                                        className="mt-1 w-full rounded-lg border-slate-300 font-mono text-sm uppercase shadow-sm focus:border-blue-600 focus:ring-blue-600"
                                    />

                                    <ErrorMessage
                                        message={form.errors.vin}
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-slate-700">
                                Additional Notes
                            </label>

                            <textarea
                                rows="3"
                                value={form.data.notes}
                                onChange={(event) =>
                                    form.setData(
                                        'notes',
                                        event.target.value
                                    )
                                }
                                placeholder="Describe any specific service requirements or concerns..."
                                className="mt-1 w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-blue-600 focus:ring-blue-600"
                            />

                            <ErrorMessage
                                message={form.errors.notes}
                            />
                        </div>

                        <label className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={form.data.consent}
                                onChange={(event) =>
                                    form.setData(
                                        'consent',
                                        event.target.checked
                                    )
                                }
                                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                            />

                            <span className="text-sm text-slate-600">
                                I confirm that the provided customer and vehicle information is accurate and agree to receive service updates.
                            </span>
                        </label>

                        <ErrorMessage
                            message={form.errors.consent}
                        />

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="w-full rounded-lg bg-blue-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {form.processing
                                ? 'Submitting...'
                                : 'Submit Vehicle Details'}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}