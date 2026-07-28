import AppLayout from '@/Layouts/AppLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import StatCard from '@/Components/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';

const emptyBooking = {
    vehicle_id: '',
    starts_at: '',
    ends_at: '',
    complaint: '',
    notes: '',
    status: 'scheduled',
};

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

function toDateTimeLocal(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    const offset = date.getTimezoneOffset();

    return new Date(date.getTime() - offset * 60000)
        .toISOString()
        .slice(0, 16);
}

function nowDateTimeLocal() {
    return toDateTimeLocal(new Date());
}

function formatDateTime(value) {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString('en-LK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function BookingIndex({
    bookings,
    vehicles = [],
    statuses = [],
    statistics = {},
    filters = {},
}) {
    const { auth } = usePage().props;
    const permissions = auth?.user?.permissions ?? [];

    const canCreate = permissions.includes('bookings.create');
    const canUpdate = permissions.includes('bookings.update');
    const canDelete = permissions.includes('bookings.delete');

    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(
        filters.status ?? ''
    );
    const [dateFilter, setDateFilter] = useState(
        filters.date ?? ''
    );

    const [modalOpen, setModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [dateErrors, setDateErrors] = useState({});

    const bookingForm = useForm(emptyBooking);

    /**
     * Validate the starts_at / ends_at pair and return an object
     * of field-level error messages (empty object = valid).
     */
    const validateDates = (startsAt, endsAt, isEditing) => {
        const errors = {};

        if (!startsAt) {
            errors.starts_at = 'Start date and time is required.';
        }

        if (!endsAt) {
            errors.ends_at = 'End date and time is required.';
        }

        // Only enforce "not in the past" for new bookings
        if (startsAt && !isEditing) {
            const now = new Date();
            const startDate = new Date(startsAt);

            if (startDate < now) {
                errors.starts_at =
                    'Start date cannot be in the past.';
            }
        }

        if (startsAt && endsAt) {
            const startDate = new Date(startsAt);
            const endDate = new Date(endsAt);

            if (endDate <= startDate) {
                errors.ends_at =
                    'End date must be after the start date.';
            }
        }

        return errors;
    };

    /**
     * Called whenever starts_at changes — revalidates and
     * auto-clears ends_at if it's now invalid.
     */
    const handleStartsAtChange = (value) => {
        bookingForm.setData('starts_at', value);

        const currentEndsAt = bookingForm.data.ends_at;

        // Auto-clear end date if it's now before the new start
        if (currentEndsAt && value && new Date(currentEndsAt) <= new Date(value)) {
            bookingForm.setData((prev) => ({
                ...prev,
                starts_at: value,
                ends_at: '',
            }));
        }

        const errs = validateDates(
            value,
            currentEndsAt && new Date(currentEndsAt) > new Date(value)
                ? currentEndsAt
                : '',
            !!editingBooking
        );

        setDateErrors(errs);
    };

    /**
     * Called whenever ends_at changes — revalidates both fields.
     */
    const handleEndsAtChange = (value) => {
        bookingForm.setData('ends_at', value);

        const errs = validateDates(
            bookingForm.data.starts_at,
            value,
            !!editingBooking
        );

        setDateErrors(errs);
    };

    /**
     * Compute the minimum value allowed for the start datetime
     * input. For new bookings this is "now"; for edits there is
     * no minimum (the booking may already be in the past).
     */
    const minStartsAt = useMemo(() => {
        if (editingBooking) {
            return undefined;
        }

        return nowDateTimeLocal();
    }, [editingBooking, modalOpen]); // recalculate when modal opens

    /**
     * Compute the minimum value allowed for the end datetime
     * input — always at least one minute after starts_at.
     */
    const minEndsAt = useMemo(() => {
        if (!bookingForm.data.starts_at) {
            return minStartsAt;
        }

        // One minute after start
        const start = new Date(bookingForm.data.starts_at);
        start.setMinutes(start.getMinutes() + 1);

        return toDateTimeLocal(start);
    }, [bookingForm.data.starts_at, minStartsAt]);

    const openCreate = () => {
        setEditingBooking(null);
        setDateErrors({});
        bookingForm.reset();
        bookingForm.clearErrors();

        if (vehicles.length > 0) {
            bookingForm.setData({
                ...emptyBooking,
                vehicle_id: vehicles[0].id,
            });
        }

        setModalOpen(true);
    };

    const openEdit = (booking) => {
        setEditingBooking(booking);
        setDateErrors({});

        bookingForm.setData({
            vehicle_id: booking.vehicle_id ?? '',
            starts_at: toDateTimeLocal(booking.starts_at),
            ends_at: toDateTimeLocal(booking.ends_at),
            complaint: booking.complaint ?? '',
            notes: booking.notes ?? '',
            status: booking.status ?? 'scheduled',
        });

        bookingForm.clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingBooking(null);
        setDateErrors({});
        bookingForm.reset();
        bookingForm.clearErrors();
    };

    const submitBooking = (event) => {
        event.preventDefault();

        // Run client-side date validation before submitting
        const errs = validateDates(
            bookingForm.data.starts_at,
            bookingForm.data.ends_at,
            !!editingBooking
        );

        setDateErrors(errs);

        if (Object.keys(errs).length > 0) {
            return; // block submission
        }

        const options = {
            preserveScroll: true,
            onSuccess: closeModal,
        };

        if (editingBooking) {
            bookingForm.put(
                route('bookings.update', editingBooking.id),
                options
            );

            return;
        }

        bookingForm.post(route('bookings.store'), options);
    };

    const applyFilters = (event) => {
        event.preventDefault();

        router.get(
            route('bookings.index'),
            {
                search: search || undefined,
                status: statusFilter || undefined,
                date: dateFilter || undefined,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setDateFilter('');

        router.get(
            route('bookings.index'),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const deleteBooking = (booking) => {
        if (
            !window.confirm(
                `Delete booking "${booking.booking_number}"?`
            )
        ) {
            return;
        }

        router.delete(
            route('bookings.destroy', booking.id),
            {
                preserveScroll: true,
            }
        );
    };

    const formStatuses = editingBooking
        ? ['scheduled', 'confirmed', 'cancelled']
        : ['scheduled', 'confirmed'];

    // Merge client-side date errors with server-side errors
    const startsAtError =
        dateErrors.starts_at || bookingForm.errors.starts_at;
    const endsAtError =
        dateErrors.ends_at || bookingForm.errors.ends_at;

    return (
        <AppLayout title="Service Bookings">
            <Head title="Service Bookings" />

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    title="Today's Bookings"
                    value={statistics.today}
                    tone="blue"
                />

                <StatCard
                    title="Scheduled"
                    value={statistics.scheduled}
                    tone="amber"
                />

                <StatCard
                    title="Confirmed"
                    value={statistics.confirmed}
                    tone="green"
                />
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Service Bookings
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Schedule customer vehicle appointments
                        </p>
                    </div>

                    {canCreate && (
                        <button
                            type="button"
                            onClick={openCreate}
                            disabled={vehicles.length === 0}
                            className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            New Booking
                        </button>
                    )}
                </div>

                {vehicles.length === 0 && (
                    <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-700">
                        Create a customer vehicle before adding a booking.
                    </div>
                )}

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
                        placeholder="Booking number, registration or customer"
                        className="rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    />

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                        className="rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">All statuses</option>

                        {statuses.map((status) => (
                            <option
                                key={status.value}
                                value={status.value}
                            >
                                {status.label}
                            </option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(event) =>
                            setDateFilter(event.target.value)
                        }
                        className="rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    />

                    <button
                        type="submit"
                        className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900"
                    >
                        Filter
                    </button>

                    {(filters.search ||
                        filters.status ||
                        filters.date) && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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
                                    Booking
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Schedule
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Customer
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Vehicle
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Complaint
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Status
                                </th>
                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {bookings.data.length > 0 ? (
                                bookings.data.map((booking) => {
                                    const isCompleted =
                                        booking.status === 'completed';

                                    return (
                                        <tr
                                            key={booking.id}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
                                                {booking.booking_number}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                                <p>
                                                    {formatDateTime(
                                                        booking.starts_at
                                                    )}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    To{' '}
                                                    {formatDateTime(
                                                        booking.ends_at
                                                    )}
                                                </p>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                                {booking.vehicle?.customer
                                                    ?.name ?? '—'}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                                <p className="font-medium">
                                                    {booking.vehicle
                                                        ?.registration_no ??
                                                        '—'}
                                                </p>

                                                <p className="text-xs text-slate-400">
                                                    {booking.vehicle?.make}{' '}
                                                    {booking.vehicle?.model}
                                                </p>
                                            </td>

                                            <td className="max-w-xs px-5 py-4 text-sm text-slate-600">
                                                <p className="truncate">
                                                    {booking.complaint}
                                                </p>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4">
                                                <StatusBadge
                                                    status={booking.status}
                                                />
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {canUpdate &&
                                                        !isCompleted && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openEdit(
                                                                        booking
                                                                    )
                                                                }
                                                                className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                                                            >
                                                                Edit
                                                            </button>
                                                        )}

                                                    {canDelete &&
                                                        !isCompleted && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    deleteBooking(
                                                                        booking
                                                                    )
                                                                }
                                                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-5 py-12 text-center text-sm text-slate-500"
                                    >
                                        No bookings found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={bookings.links} />
            </div>

            <Modal
                open={modalOpen}
                title={
                    editingBooking
                        ? 'Edit Booking'
                        : 'New Booking'
                }
                onClose={closeModal}
                width="lg"
            >
                <form
                    onSubmit={submitBooking}
                    className="space-y-4"
                >
                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Vehicle
                        </label>

                        <select
                            value={bookingForm.data.vehicle_id}
                            onChange={(event) =>
                                bookingForm.setData(
                                    'vehicle_id',
                                    event.target.value
                                )
                            }
                            className="mt-1 w-full rounded-lg border-slate-300 text-sm"
                        >
                            <option value="">Select vehicle</option>

                            {vehicles.map((vehicle) => (
                                <option
                                    key={vehicle.id}
                                    value={vehicle.id}
                                >
                                    {vehicle.registration_no} –{' '}
                                    {vehicle.make} {vehicle.model} –{' '}
                                    {vehicle.customer?.name}
                                </option>
                            ))}
                        </select>

                        <ErrorMessage
                            message={bookingForm.errors.vehicle_id}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Start date and time
                            </label>

                            <input
                                type="datetime-local"
                                value={bookingForm.data.starts_at}
                                min={minStartsAt}
                                onChange={(event) =>
                                    handleStartsAtChange(
                                        event.target.value
                                    )
                                }
                                className={`mt-1 w-full rounded-lg text-sm ${
                                    startsAtError
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                                        : 'border-slate-300'
                                }`}
                            />

                            <ErrorMessage
                                message={startsAtError}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                End date and time
                            </label>

                            <input
                                type="datetime-local"
                                value={bookingForm.data.ends_at}
                                min={minEndsAt}
                                onChange={(event) =>
                                    handleEndsAtChange(
                                        event.target.value
                                    )
                                }
                                className={`mt-1 w-full rounded-lg text-sm ${
                                    endsAtError
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                                        : 'border-slate-300'
                                }`}
                            />

                            <ErrorMessage
                                message={endsAtError}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Customer complaint
                        </label>

                        <textarea
                            rows="4"
                            value={bookingForm.data.complaint}
                            onChange={(event) =>
                                bookingForm.setData(
                                    'complaint',
                                    event.target.value
                                )
                            }
                            placeholder="Describe the reported vehicle problem"
                            className="mt-1 w-full rounded-lg border-slate-300 text-sm"
                        />

                        <ErrorMessage
                            message={bookingForm.errors.complaint}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Notes
                        </label>

                        <textarea
                            rows="3"
                            value={bookingForm.data.notes}
                            onChange={(event) =>
                                bookingForm.setData(
                                    'notes',
                                    event.target.value
                                )
                            }
                            className="mt-1 w-full rounded-lg border-slate-300 text-sm"
                        />

                        <ErrorMessage
                            message={bookingForm.errors.notes}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Status
                        </label>

                        <select
                            value={bookingForm.data.status}
                            onChange={(event) =>
                                bookingForm.setData(
                                    'status',
                                    event.target.value
                                )
                            }
                            className="mt-1 w-full rounded-lg border-slate-300 text-sm"
                        >
                            {formStatuses.map((status) => (
                                <option
                                    key={status}
                                    value={status}
                                >
                                    {status
                                        .replaceAll('_', ' ')
                                        .replace(/\b\w/g, (letter) =>
                                            letter.toUpperCase()
                                        )}
                                </option>
                            ))}
                        </select>

                        <ErrorMessage
                            message={bookingForm.errors.status}
                        />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={bookingForm.processing}
                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {bookingForm.processing
                                ? 'Saving...'
                                : editingBooking
                                  ? 'Update Booking'
                                  : 'Create Booking'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}