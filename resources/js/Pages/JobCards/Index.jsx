import AppLayout from '@/Layouts/AppLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import StatCard from '@/Components/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const emptyJob = {
    service_booking_id: '',
    diagnosis: '',
    work_description: '',
    labor_cost: 0,
    mechanic_ids: [],
    parts: [],
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

export default function JobCardIndex({
    jobCards,
    mechanics = [],
    parts = [],
    availableBookings = [],
    statistics = {},
    filters = {},
}) {
    const { auth } = usePage().props;
    const permissions = auth?.user?.permissions ?? [];

    const canAssign = permissions.includes('jobs.assign');
    const canUpdateStatus = permissions.includes('jobs.update');

    const [statusFilter, setStatusFilter] = useState(
        filters.status ?? ''
    );
    const [modalOpen, setModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [summaryJob, setSummaryJob] = useState(null);

    const jobForm = useForm(emptyJob);
    const summaryForm = useForm({});

    const currency = new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2,
    });

    const openCreate = () => {
        setEditingJob(null);
        jobForm.clearErrors();

        jobForm.setData({
            ...emptyJob,
            service_booking_id:
                availableBookings[0]?.id ?? '',
            mechanic_ids:
                mechanics.length > 0
                    ? [String(mechanics[0].id)]
                    : [],
        });

        setModalOpen(true);
    };

    const openEdit = (job) => {
        setEditingJob(job);

        jobForm.setData({
            service_booking_id:
                job.service_booking_id ?? '',
            diagnosis: job.diagnosis ?? '',
            work_description:
                job.work_description ?? '',
            labor_cost: job.labor_cost ?? 0,
            mechanic_ids:
                job.mechanics?.map((mechanic) =>
                    String(mechanic.id)
                ) ?? [],
            parts:
                job.parts?.map((part) => ({
                    part_id: String(part.id),
                    quantity: part.pivot?.quantity ?? 1,
                })) ?? [],
        });

        jobForm.clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingJob(null);
        jobForm.reset();
        jobForm.clearErrors();
    };

    const submitJob = (event) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: closeModal,
        };

        if (editingJob) {
            jobForm.put(
                route('job-cards.update', editingJob.id),
                options
            );

            return;
        }

        jobForm.post(route('job-cards.store'), options);
    };

    const applyFilter = (event) => {
        event.preventDefault();

        router.get(
            route('job-cards.index'),
            {
                status: statusFilter || undefined,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clearFilter = () => {
        setStatusFilter('');

        router.get(
            route('job-cards.index'),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const addPartRow = () => {
        jobForm.setData('parts', [
            ...jobForm.data.parts,
            {
                part_id: '',
                quantity: 1,
            },
        ]);
    };

    const updatePartRow = (index, field, value) => {
        jobForm.setData(
            'parts',
            jobForm.data.parts.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                          ...item,
                          [field]: value,
                      }
                    : item
            )
        );
    };

    const removePartRow = (index) => {
        jobForm.setData(
            'parts',
            jobForm.data.parts.filter(
                (_, itemIndex) => itemIndex !== index
            )
        );
    };

    const allPartOptions = [...parts];

    editingJob?.parts?.forEach((part) => {
        if (
            !allPartOptions.some(
                (availablePart) =>
                    availablePart.id === part.id
            )
        ) {
            allPartOptions.push(part);
        }
    });

    const getPartOptions = (rowIndex) => {
        const selectedIds = jobForm.data.parts
            .filter((_, index) => index !== rowIndex)
            .map((item) => String(item.part_id));

        return allPartOptions.filter(
            (part) =>
                !selectedIds.includes(String(part.id))
        );
    };

    const bookingOptions = [...availableBookings];

    if (
        editingJob?.service_booking &&
        !bookingOptions.some(
            (booking) =>
                booking.id ===
                editingJob.service_booking.id
        )
    ) {
        bookingOptions.unshift(
            editingJob.service_booking
        );
    }

    const updateStatus = (job, status) => {
        let message = `Change ${job.job_number} to ${status.replaceAll(
            '_',
            ' '
        )}?`;

        if (status === 'completed') {
            message =
                'Complete this job? Assigned parts will be deducted and an invoice will be generated.';
        }

        if (!window.confirm(message)) {
            return;
        }

        router.patch(
            route('job-cards.status.update', job.id),
            { status },
            {
                preserveScroll: true,
                onError: (errors) => {
                    const firstError =
                        Object.values(errors)[0];

                    if (firstError) {
                        window.alert(firstError);
                    }
                },
            }
        );
    };

    const deleteJob = (job) => {
        if (
            !window.confirm(
                `Delete pending job "${job.job_number}"?`
            )
        ) {
            return;
        }

        router.delete(
            route('job-cards.destroy', job.id),
            {
                preserveScroll: true,
            }
        );
    };

    const generateAiSummary = (job) => {
        const hasExisting = Boolean(job.ai_summary);
        const label = hasExisting ? 'Regenerate' : 'Generate';

        if (
            !window.confirm(
                `${label} AI summary for job ${job.job_number}?`
            )
        ) {
            return;
        }

        summaryForm.post(
            route('job-cards.ai-summary.generate', job.id),
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    const updatedJob =
                        page.props.jobCards?.data?.find(
                            (item) => item.id === job.id
                        );

                    if (updatedJob?.ai_summary) {
                        setSummaryJob(updatedJob);
                    }
                },
                onError: (errors) => {
                    const firstError =
                        Object.values(errors)[0];

                    if (firstError) {
                        window.alert(firstError);
                    }
                },
            }
        );
    };

    return (
        <AppLayout title="Job Cards">
            <Head title="Job Cards" />

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    title="Pending"
                    value={statistics.pending}
                    tone="amber"
                />

                <StatCard
                    title="In Progress"
                    value={statistics.in_progress}
                    tone="blue"
                />

                <StatCard
                    title="Completed"
                    value={statistics.completed}
                    tone="green"
                />
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Job Cards
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Assign mechanics and parts to service jobs
                        </p>
                    </div>

                    {canAssign && (
                        <button
                            type="button"
                            onClick={openCreate}
                            disabled={
                                availableBookings.length === 0 ||
                                mechanics.length === 0
                            }
                            className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Create Job Card
                        </button>
                    )}
                </div>

                {canAssign &&
                    availableBookings.length === 0 && (
                        <div className="border-b border-blue-200 bg-blue-50 px-5 py-3 text-sm text-blue-700">
                            No bookings are currently available for new job cards.
                        </div>
                    )}

                <form
                    onSubmit={applyFilter}
                    className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row"
                >
                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                        className="rounded-lg border-slate-300 text-sm sm:w-64"
                    >
                        <option value="">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">
                            In Progress
                        </option>
                        <option value="completed">
                            Completed
                        </option>
                        <option value="cancelled">
                            Cancelled
                        </option>
                    </select>

                    <button
                        type="submit"
                        className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        Filter
                    </button>

                    {filters.status && (
                        <button
                            type="button"
                            onClick={clearFilter}
                            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold"
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
                                    Job
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Vehicle
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Schedule
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Mechanics
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Labor
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
                            {jobCards.data.length > 0 ? (
                                jobCards.data.map((job) => (
                                    <tr
                                        key={job.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="whitespace-nowrap px-5 py-4">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {job.job_number}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {
                                                    job.service_booking
                                                        ?.booking_number
                                                }
                                            </p>
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                            <p className="font-medium">
                                                {job.service_booking
                                                    ?.vehicle
                                                    ?.registration_no ??
                                                    '—'}
                                            </p>

                                            <p className="text-xs text-slate-400">
                                                {job.service_booking
                                                    ?.vehicle?.customer
                                                    ?.name ?? '—'}
                                            </p>
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                            {formatDateTime(
                                                job.service_booking
                                                    ?.starts_at
                                            )}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {job.mechanics?.length > 0
                                                ? job.mechanics
                                                      .map(
                                                          (mechanic) =>
                                                              mechanic.name
                                                      )
                                                      .join(', ')
                                                : '—'}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                            {currency.format(
                                                Number(job.labor_cost)
                                            )}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4">
                                            <StatusBadge
                                                status={job.status}
                                            />
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                {canAssign &&
                                                    job.status ===
                                                        'pending' && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEdit(
                                                                    job
                                                                )
                                                            }
                                                            className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}

                                                {canUpdateStatus &&
                                                    job.status ===
                                                        'pending' && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateStatus(
                                                                    job,
                                                                    'in_progress'
                                                                )
                                                            }
                                                            className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700"
                                                        >
                                                            Start
                                                        </button>
                                                    )}

                                                {canUpdateStatus &&
                                                    job.status ===
                                                        'in_progress' && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateStatus(
                                                                    job,
                                                                    'completed'
                                                                )
                                                            }
                                                            className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                                                        >
                                                            Complete
                                                        </button>
                                                    )}

                                                {canUpdateStatus &&
                                                    [
                                                        'pending',
                                                        'in_progress',
                                                    ].includes(
                                                        job.status
                                                    ) && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateStatus(
                                                                    job,
                                                                    'cancelled'
                                                                )
                                                            }
                                                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}

                                                {canAssign &&
                                                    job.status ===
                                                        'pending' && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                deleteJob(
                                                                    job
                                                                )
                                                            }
                                                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}

                                                {canUpdateStatus &&
                                                    job.status ===
                                                        'completed' && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                generateAiSummary(
                                                                    job
                                                                )
                                                            }
                                                            disabled={
                                                                summaryForm.processing
                                                            }
                                                            className="rounded-lg border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {job.ai_summary
                                                                ? 'Regenerate AI Summary'
                                                                : 'Generate AI Summary'}
                                                        </button>
                                                    )}

                                                {job.ai_summary && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSummaryJob(
                                                                job
                                                            )
                                                        }
                                                        className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700"
                                                    >
                                                        View Summary
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-5 py-12 text-center text-sm text-slate-500"
                                    >
                                        No job cards found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={jobCards.links} />
            </div>

            <Modal
                open={modalOpen}
                title={
                    editingJob
                        ? 'Edit Job Card'
                        : 'Create Job Card'
                }
                onClose={closeModal}
                width="lg"
            >
                <form onSubmit={submitJob} className="space-y-5">
                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Service booking
                        </label>

                        <select
                            value={
                                jobForm.data.service_booking_id
                            }
                            onChange={(event) =>
                                jobForm.setData(
                                    'service_booking_id',
                                    event.target.value
                                )
                            }
                            className="mt-1 w-full rounded-lg border-slate-300 text-sm"
                        >
                            <option value="">
                                Select booking
                            </option>

                            {bookingOptions.map((booking) => (
                                <option
                                    key={booking.id}
                                    value={booking.id}
                                >
                                    {booking.booking_number} –{' '}
                                    {
                                        booking.vehicle
                                            ?.registration_no
                                    }{' '}
                                    –{' '}
                                    {
                                        booking.vehicle?.customer
                                            ?.name
                                    }
                                </option>
                            ))}
                        </select>

                        <ErrorMessage
                            message={
                                jobForm.errors
                                    .service_booking_id
                            }
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Assigned mechanics
                        </label>

                        <select
                            multiple
                            value={jobForm.data.mechanic_ids}
                            onChange={(event) =>
                                jobForm.setData(
                                    'mechanic_ids',
                                    Array.from(
                                        event.target.selectedOptions,
                                        (option) => option.value
                                    )
                                )
                            }
                            className="mt-1 h-32 w-full rounded-lg border-slate-300 text-sm"
                        >
                            {mechanics.map((mechanic) => (
                                <option
                                    key={mechanic.id}
                                    value={mechanic.id}
                                >
                                    {mechanic.employee_id} –{' '}
                                    {mechanic.name} –{' '}
                                    {mechanic.specialization}
                                </option>
                            ))}
                        </select>

                        <p className="mt-1 text-xs text-slate-500">
                            Hold Ctrl to select multiple mechanics.
                        </p>

                        <ErrorMessage
                            message={
                                jobForm.errors.mechanic_ids
                            }
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Diagnosis
                            </label>

                            <textarea
                                rows="4"
                                value={jobForm.data.diagnosis}
                                onChange={(event) =>
                                    jobForm.setData(
                                        'diagnosis',
                                        event.target.value
                                    )
                                }
                                className="mt-1 w-full rounded-lg border-slate-300 text-sm"
                            />

                            <ErrorMessage
                                message={jobForm.errors.diagnosis}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Work description
                            </label>

                            <textarea
                                rows="4"
                                value={
                                    jobForm.data.work_description
                                }
                                onChange={(event) =>
                                    jobForm.setData(
                                        'work_description',
                                        event.target.value
                                    )
                                }
                                className="mt-1 w-full rounded-lg border-slate-300 text-sm"
                            />

                            <ErrorMessage
                                message={
                                    jobForm.errors
                                        .work_description
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Labor cost
                        </label>

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={jobForm.data.labor_cost}
                            onChange={(event) =>
                                jobForm.setData(
                                    'labor_cost',
                                    event.target.value
                                )
                            }
                            className="mt-1 w-full rounded-lg border-slate-300 text-sm"
                        />

                        <ErrorMessage
                            message={jobForm.errors.labor_cost}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-700">
                                Assigned parts
                            </label>

                            <button
                                type="button"
                                onClick={addPartRow}
                                className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700"
                            >
                                Add Part
                            </button>
                        </div>

                        <ErrorMessage
                            message={jobForm.errors.parts}
                        />

                        <div className="mt-3 space-y-3">
                            {jobForm.data.parts.length === 0 && (
                                <p className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">
                                    No parts assigned.
                                </p>
                            )}

                            {jobForm.data.parts.map(
                                (item, index) => (
                                    <div
                                        key={index}
                                        className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_120px_auto]"
                                    >
                                        <div>
                                            <select
                                                value={item.part_id}
                                                onChange={(event) =>
                                                    updatePartRow(
                                                        index,
                                                        'part_id',
                                                        event.target
                                                            .value
                                                    )
                                                }
                                                className="w-full rounded-lg border-slate-300 text-sm"
                                            >
                                                <option value="">
                                                    Select part
                                                </option>

                                                {getPartOptions(
                                                    index
                                                ).map((part) => (
                                                    <option
                                                        key={
                                                            part.id
                                                        }
                                                        value={
                                                            part.id
                                                        }
                                                    >
                                                        {
                                                            part.part_number
                                                        }{' '}
                                                        – {part.name}{' '}
                                                        (Stock:{' '}
                                                        {
                                                            part.stock_quantity
                                                        }
                                                        )
                                                    </option>
                                                ))}
                                            </select>

                                            <ErrorMessage
                                                message={
                                                    jobForm.errors[
                                                        `parts.${index}.part_id`
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div>
                                            <input
                                                type="number"
                                                min="1"
                                                value={
                                                    item.quantity
                                                }
                                                onChange={(event) =>
                                                    updatePartRow(
                                                        index,
                                                        'quantity',
                                                        event.target
                                                            .value
                                                    )
                                                }
                                                className="w-full rounded-lg border-slate-300 text-sm"
                                                placeholder="Quantity"
                                            />

                                            <ErrorMessage
                                                message={
                                                    jobForm.errors[
                                                        `parts.${index}.quantity`
                                                    ]
                                                }
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removePartRow(index)
                                            }
                                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
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
                            disabled={jobForm.processing}
                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {jobForm.processing
                                ? 'Saving...'
                                : editingJob
                                  ? 'Update Job Card'
                                  : 'Create Job Card'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                open={Boolean(summaryJob)}
                title="AI Service Summary"
                onClose={() => setSummaryJob(null)}
                width="lg"
            >
                {summaryJob && (
                    <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <p className="text-xs font-semibold uppercase text-slate-500">
                                    Job Number
                                </p>

                                <p className="mt-1 text-sm font-medium text-slate-900">
                                    {summaryJob.job_number}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase text-slate-500">
                                    Vehicle
                                </p>

                                <p className="mt-1 text-sm font-medium text-slate-900">
                                    {
                                        summaryJob
                                            .service_booking
                                            ?.vehicle
                                            ?.registration_no ??
                                            '—'
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="rounded-lg border border-purple-100 bg-purple-50 p-4">
                            <p className="whitespace-pre-line text-sm text-slate-800">
                                {summaryJob.ai_summary}
                            </p>
                        </div>

                        <p className="text-xs text-slate-400">
                            Generated:{' '}
                            {formatDateTime(
                                summaryJob.ai_summary_generated_at
                            )}
                        </p>

                        <div className="flex justify-end border-t border-slate-200 pt-4">
                            <button
                                type="button"
                                onClick={() => setSummaryJob(null)}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}