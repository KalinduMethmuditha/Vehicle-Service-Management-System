import AppLayout from '@/Layouts/AppLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import StatusBadge from '@/Components/StatusBadge';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const emptyForm = {
    user_id: '',
    employee_id: '',
    name: '',
    specialization: '',
    contact: '',
    is_active: true,
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

export default function MechanicIndex({
    mechanics,
    users = [],
    filters = {},
}) {
    const { auth } = usePage().props;
    const permissions = auth?.user?.permissions ?? [];

    const canCreate = permissions.includes('mechanics.create');
    const canUpdate = permissions.includes('mechanics.update');
    const canDelete = permissions.includes('mechanics.delete');

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMechanic, setEditingMechanic] = useState(null);

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm(emptyForm);

    const openCreate = () => {
        setEditingMechanic(null);
        reset();
        clearErrors();
        setModalOpen(true);
    };

    const openEdit = (mechanic) => {
        setEditingMechanic(mechanic);

        setData({
            user_id: mechanic.user_id ?? '',
            employee_id: mechanic.employee_id ?? '',
            name: mechanic.name ?? '',
            specialization: mechanic.specialization ?? '',
            contact: mechanic.contact ?? '',
            is_active: Boolean(mechanic.is_active),
        });

        clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingMechanic(null);
        reset();
        clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: closeModal,
        };

        if (editingMechanic) {
            put(
                route('mechanics.update', editingMechanic.id),
                options
            );

            return;
        }

        post(route('mechanics.store'), options);
    };

    const applyFilters = (event) => {
        event.preventDefault();

        router.get(
            route('mechanics.index'),
            {
                search: search || undefined,
                status: status || undefined,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');

        router.get(
            route('mechanics.index'),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const deleteMechanic = (mechanic) => {
        if (
            !window.confirm(
                `Delete mechanic "${mechanic.name}"?`
            )
        ) {
            return;
        }

        router.delete(
            route('mechanics.destroy', mechanic.id),
            {
                preserveScroll: true,
            }
        );
    };

    return (
        <AppLayout title="Mechanics">
            <Head title="Mechanics" />

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Mechanic Management
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage mechanics and login accounts
                        </p>
                    </div>

                    {canCreate && (
                        <button
                            type="button"
                            onClick={openCreate}
                            className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                        >
                            Add Mechanic
                        </button>
                    )}
                </div>

                <form
                    onSubmit={applyFilters}
                    className="grid gap-3 border-b border-slate-200 p-5 md:grid-cols-[1fr_220px_auto_auto]"
                >
                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Employee ID, name, specialization or contact"
                        className="rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    />

                    <select
                        value={status}
                        onChange={(event) =>
                            setStatus(event.target.value)
                        }
                        className="rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <button
                        type="submit"
                        className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900"
                    >
                        Filter
                    </button>

                    {(filters.search || filters.status) && (
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
                                    Employee
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Name
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Specialization
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Contact
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Login account
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
                            {mechanics.data.length > 0 ? (
                                mechanics.data.map((mechanic) => (
                                    <tr
                                        key={mechanic.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
                                            {mechanic.employee_id}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                            {mechanic.name}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                            {mechanic.specialization}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                            {mechanic.contact}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {mechanic.user ? (
                                                <div>
                                                    <p>
                                                        {mechanic.user.email}
                                                    </p>
                                                </div>
                                            ) : (
                                                'Not linked'
                                            )}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4">
                                            <StatusBadge
                                                status={
                                                    mechanic.is_active
                                                        ? 'active'
                                                        : 'inactive'
                                                }
                                            />
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {canUpdate && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEdit(mechanic)
                                                        }
                                                        className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                                                    >
                                                        Edit
                                                    </button>
                                                )}

                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteMechanic(
                                                                mechanic
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
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-5 py-12 text-center text-sm text-slate-500"
                                    >
                                        No mechanics found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={mechanics.links} />
            </div>

            <Modal
                open={modalOpen}
                title={
                    editingMechanic
                        ? 'Edit Mechanic'
                        : 'Add Mechanic'
                }
                onClose={closeModal}
                width="lg"
            >
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Login account (optional)
                        </label>

                        <select
                            value={data.user_id}
                            onChange={(event) =>
                                setData(
                                    'user_id',
                                    event.target.value
                                )
                            }
                            className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">
                                No login account
                            </option>

                            {users.map((user) => (
                                <option
                                    key={user.id}
                                    value={user.id}
                                >
                                    {user.name} – {user.email}
                                </option>
                            ))}
                        </select>

                        <ErrorMessage message={errors.user_id} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Employee ID
                            </label>

                            <input
                                type="text"
                                value={data.employee_id}
                                onChange={(event) =>
                                    setData(
                                        'employee_id',
                                        event.target.value
                                    )
                                }
                                className="mt-1 w-full rounded-lg border-slate-300 text-sm uppercase focus:border-blue-500 focus:ring-blue-500"
                            />

                            <ErrorMessage
                                message={errors.employee_id}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Name
                            </label>

                            <input
                                type="text"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                            />

                            <ErrorMessage message={errors.name} />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Specialization
                        </label>

                        <input
                            type="text"
                            value={data.specialization}
                            onChange={(event) =>
                                setData(
                                    'specialization',
                                    event.target.value
                                )
                            }
                            placeholder="Engine Repair, Electrical Systems..."
                            className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />

                        <ErrorMessage
                            message={errors.specialization}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Contact
                        </label>

                        <input
                            type="text"
                            value={data.contact}
                            onChange={(event) =>
                                setData('contact', event.target.value)
                            }
                            className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />

                        <ErrorMessage message={errors.contact} />
                    </div>

                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(event) =>
                                setData(
                                    'is_active',
                                    event.target.checked
                                )
                            }
                            className="rounded border-slate-300 text-blue-700 focus:ring-blue-500"
                        />

                        <span className="text-sm font-medium text-slate-700">
                            Active mechanic
                        </span>
                    </label>

                    <ErrorMessage message={errors.is_active} />

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                        >
                            {processing
                                ? 'Saving...'
                                : editingMechanic
                                  ? 'Update Mechanic'
                                  : 'Create Mechanic'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}