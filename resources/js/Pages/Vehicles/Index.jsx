import AppLayout from '@/Layouts/AppLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const emptyForm = {
    customer_id: '',
    registration_no: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    mileage: 0,
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

export default function VehicleIndex({
    vehicles,
    customers = [],
    filters = {},
}) {
    const { auth } = usePage().props;
    const permissions = auth?.user?.permissions ?? [];

    const canCreate = permissions.includes('vehicles.create');
    const canUpdate = permissions.includes('vehicles.update');
    const canDelete = permissions.includes('vehicles.delete');

    const [search, setSearch] = useState(filters.search ?? '');
    const [customerFilter, setCustomerFilter] = useState(
        filters.customer_id ?? ''
    );
    const [modalOpen, setModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);

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
        setEditingVehicle(null);
        reset();
        clearErrors();

        if (customers.length > 0) {
            setData({
                ...emptyForm,
                customer_id: customers[0].id,
            });
        }

        setModalOpen(true);
    };

    const openEdit = (vehicle) => {
        setEditingVehicle(vehicle);

        setData({
            customer_id: vehicle.customer_id ?? '',
            registration_no: vehicle.registration_no ?? '',
            make: vehicle.make ?? '',
            model: vehicle.model ?? '',
            year: vehicle.year ?? new Date().getFullYear(),
            vin: vehicle.vin ?? '',
            mileage: vehicle.mileage ?? 0,
        });

        clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingVehicle(null);
        reset();
        clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: closeModal,
        };

        if (editingVehicle) {
            put(
                route('vehicles.update', editingVehicle.id),
                options
            );

            return;
        }

        post(route('vehicles.store'), options);
    };

    const applyFilters = (event) => {
        event.preventDefault();

        router.get(
            route('vehicles.index'),
            {
                search: search || undefined,
                customer_id: customerFilter || undefined,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clearFilters = () => {
        setSearch('');
        setCustomerFilter('');

        router.get(
            route('vehicles.index'),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const deleteVehicle = (vehicle) => {
        if (
            !window.confirm(
                `Delete vehicle "${vehicle.registration_no}"?`
            )
        ) {
            return;
        }

        router.delete(
            route('vehicles.destroy', vehicle.id),
            {
                preserveScroll: true,
            }
        );
    };

    return (
        <AppLayout title="Vehicles">
            <Head title="Vehicles" />

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Vehicle Management
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage customer vehicles and mileage
                        </p>
                    </div>

                    {canCreate && (
                        <button
                            type="button"
                            onClick={openCreate}
                            disabled={customers.length === 0}
                            className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Add Vehicle
                        </button>
                    )}
                </div>

                {customers.length === 0 && (
                    <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-700">
                        Create a customer before adding a vehicle.
                    </div>
                )}

                <form
                    onSubmit={applyFilters}
                    className="grid gap-3 border-b border-slate-200 p-5 md:grid-cols-[1fr_240px_auto_auto]"
                >
                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Registration, make, model, VIN or customer"
                        className="rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    />

                    <select
                        value={customerFilter}
                        onChange={(event) =>
                            setCustomerFilter(event.target.value)
                        }
                        className="rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">All customers</option>

                        {customers.map((customer) => (
                            <option
                                key={customer.id}
                                value={customer.id}
                            >
                                {customer.name}
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900"
                    >
                        Filter
                    </button>

                    {(filters.search || filters.customer_id) && (
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
                                    Registration
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Customer
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Vehicle
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Year
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Mileage
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    VIN
                                </th>
                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {vehicles.data.length > 0 ? (
                                vehicles.data.map((vehicle) => (
                                    <tr
                                        key={vehicle.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
                                            {vehicle.registration_no}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                            {vehicle.customer?.name ?? '—'}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                            {vehicle.make} {vehicle.model}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                            {vehicle.year}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                            {Number(
                                                vehicle.mileage
                                            ).toLocaleString()}{' '}
                                            km
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-600">
                                            {vehicle.vin || '—'}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {canUpdate && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEdit(vehicle)
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
                                                            deleteVehicle(
                                                                vehicle
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
                                        No vehicles found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={vehicles.links} />
            </div>

            <Modal
                open={modalOpen}
                title={
                    editingVehicle
                        ? 'Edit Vehicle'
                        : 'Add Vehicle'
                }
                onClose={closeModal}
                width="lg"
            >
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Customer
                        </label>

                        <select
                            value={data.customer_id}
                            onChange={(event) =>
                                setData(
                                    'customer_id',
                                    event.target.value
                                )
                            }
                            className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Select customer</option>

                            {customers.map((customer) => (
                                <option
                                    key={customer.id}
                                    value={customer.id}
                                >
                                    {customer.name} – {customer.phone}
                                </option>
                            ))}
                        </select>

                        <ErrorMessage
                            message={errors.customer_id}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Registration number
                            </label>

                            <input
                                type="text"
                                value={data.registration_no}
                                onChange={(event) =>
                                    setData(
                                        'registration_no',
                                        event.target.value
                                    )
                                }
                                className="mt-1 w-full rounded-lg border-slate-300 text-sm uppercase focus:border-blue-500 focus:ring-blue-500"
                            />

                            <ErrorMessage
                                message={errors.registration_no}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                VIN
                            </label>

                            <input
                                type="text"
                                maxLength="17"
                                value={data.vin}
                                onChange={(event) =>
                                    setData(
                                        'vin',
                                        event.target.value
                                    )
                                }
                                className="mt-1 w-full rounded-lg border-slate-300 font-mono text-sm uppercase focus:border-blue-500 focus:ring-blue-500"
                            />

                            <ErrorMessage message={errors.vin} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Make
                            </label>

                            <input
                                type="text"
                                value={data.make}
                                onChange={(event) =>
                                    setData('make', event.target.value)
                                }
                                className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                            />

                            <ErrorMessage message={errors.make} />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Model
                            </label>

                            <input
                                type="text"
                                value={data.model}
                                onChange={(event) =>
                                    setData('model', event.target.value)
                                }
                                className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                            />

                            <ErrorMessage message={errors.model} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Year
                            </label>

                            <input
                                type="number"
                                min="1900"
                                max={
                                    new Date().getFullYear() + 1
                                }
                                value={data.year}
                                onChange={(event) =>
                                    setData('year', event.target.value)
                                }
                                className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                            />

                            <ErrorMessage message={errors.year} />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Mileage (km)
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={data.mileage}
                                onChange={(event) =>
                                    setData(
                                        'mileage',
                                        event.target.value
                                    )
                                }
                                className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                            />

                            <ErrorMessage
                                message={errors.mileage}
                            />
                        </div>
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
                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                        >
                            {processing
                                ? 'Saving...'
                                : editingVehicle
                                  ? 'Update Vehicle'
                                  : 'Create Vehicle'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}