import AppLayout from '@/Layouts/AppLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const initialForm = {
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
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

export default function CustomerIndex({
    customers,
    filters = {},
}) {
    const { auth } = usePage().props;

    const permissions =
        auth?.user?.permissions ?? [];

    const canCreate = permissions.includes('customers.create');
    const canUpdate = permissions.includes('customers.update');
    const canDelete = permissions.includes('customers.delete');

    const [search, setSearch] = useState(filters.search ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm(initialForm);

    const openCreateModal = () => {
        setEditingCustomer(null);
        reset();
        clearErrors();
        setModalOpen(true);
    };

    const openEditModal = (customer) => {
        setEditingCustomer(customer);

        setData({
            name: customer.name ?? '',
            email: customer.email ?? '',
            phone: customer.phone ?? '',
            address: customer.address ?? '',
            notes: customer.notes ?? '',
        });

        clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingCustomer(null);
        reset();
        clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: closeModal,
        };

        if (editingCustomer) {
            put(
                route('customers.update', editingCustomer.id),
                options
            );

            return;
        }

        post(route('customers.store'), options);
    };

    const submitSearch = (event) => {
        event.preventDefault();

        router.get(
            route('customers.index'),
            {
                search: search || undefined,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clearSearch = () => {
        setSearch('');

        router.get(
            route('customers.index'),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const deleteCustomer = (customer) => {
        const confirmed = window.confirm(
            `Delete customer "${customer.name}"?`
        );

        if (!confirmed) {
            return;
        }

        router.delete(
            route('customers.destroy', customer.id),
            {
                preserveScroll: true,
            }
        );
    };

    return (
        <AppLayout title="Customers">
            <Head title="Customers" />

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Customer Management
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage service-center customers
                        </p>
                    </div>

                    {canCreate && (
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
                        >
                            Add Customer
                        </button>
                    )}
                </div>

                <form
                    onSubmit={submitSearch}
                    className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row"
                >
                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search name, email or phone"
                        className="w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />

                    <button
                        type="submit"
                        className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900"
                    >
                        Search
                    </button>

                    {filters.search && (
                        <button
                            type="button"
                            onClick={clearSearch}
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
                                    Name
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Email
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Phone
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Address
                                </th>
                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {customers.data.length > 0 ? (
                                customers.data.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900">
                                            {customer.name}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                            {customer.email || '—'}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                            {customer.phone}
                                        </td>

                                        <td className="max-w-xs truncate px-5 py-4 text-sm text-slate-600">
                                            {customer.address || '—'}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {canUpdate && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(
                                                                customer
                                                            )
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
                                                            deleteCustomer(
                                                                customer
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
                                        colSpan="5"
                                        className="px-5 py-12 text-center text-sm text-slate-500"
                                    >
                                        No customers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={customers.links} />
            </div>

            <Modal
                open={modalOpen}
                title={
                    editingCustomer
                        ? 'Edit Customer'
                        : 'Add Customer'
                }
                onClose={closeModal}
                width="lg"
            >
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
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

                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Phone
                            </label>

                            <input
                                type="text"
                                value={data.phone}
                                onChange={(event) =>
                                    setData('phone', event.target.value)
                                }
                                className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                            />

                            <ErrorMessage message={errors.phone} />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Email
                        </label>

                        <input
                            type="email"
                            value={data.email}
                            onChange={(event) =>
                                setData('email', event.target.value)
                            }
                            className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />

                        <ErrorMessage message={errors.email} />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Address
                        </label>

                        <textarea
                            rows="3"
                            value={data.address}
                            onChange={(event) =>
                                setData('address', event.target.value)
                            }
                            className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />

                        <ErrorMessage message={errors.address} />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Notes
                        </label>

                        <textarea
                            rows="3"
                            value={data.notes}
                            onChange={(event) =>
                                setData('notes', event.target.value)
                            }
                            className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />

                        <ErrorMessage message={errors.notes} />
                    </div>

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
                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing
                                ? 'Saving...'
                                : editingCustomer
                                  ? 'Update Customer'
                                  : 'Create Customer'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}