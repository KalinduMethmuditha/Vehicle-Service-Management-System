import AppLayout from '@/Layouts/AppLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import StatCard from '@/Components/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const emptyPart = {
    part_number: '',
    name: '',
    description: '',
    stock_quantity: 0,
    minimum_stock_level: 5,
    unit_price: '',
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

function getStockStatus(part) {
    if (!part.is_active) {
        return 'inactive';
    }

    if (Number(part.stock_quantity) === 0) {
        return 'out_of_stock';
    }

    if (
        Number(part.stock_quantity) <=
        Number(part.minimum_stock_level)
    ) {
        return 'low';
    }

    return 'in_stock';
}

export default function PartIndex({
    parts,
    statistics = {},
    filters = {},
}) {
    const { auth } = usePage().props;
    const permissions = auth?.user?.permissions ?? [];

    const canCreate = permissions.includes('parts.create');
    const canUpdate = permissions.includes('parts.update');
    const canDelete = permissions.includes('parts.delete');

    const [search, setSearch] = useState(filters.search ?? '');
    const [stockFilter, setStockFilter] = useState(
        filters.stock ?? ''
    );

    const [partModalOpen, setPartModalOpen] = useState(false);
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [editingPart, setEditingPart] = useState(null);
    const [selectedPart, setSelectedPart] = useState(null);

    const partForm = useForm(emptyPart);

    const stockForm = useForm({
        type: 'increase',
        quantity: 1,
    });

    const currency = new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2,
    });

    const openCreate = () => {
        setEditingPart(null);
        partForm.reset();
        partForm.clearErrors();
        setPartModalOpen(true);
    };

    const openEdit = (part) => {
        setEditingPart(part);

        partForm.setData({
            part_number: part.part_number ?? '',
            name: part.name ?? '',
            description: part.description ?? '',
            stock_quantity: part.stock_quantity ?? 0,
            minimum_stock_level:
                part.minimum_stock_level ?? 5,
            unit_price: part.unit_price ?? '',
            is_active: Boolean(part.is_active),
        });

        partForm.clearErrors();
        setPartModalOpen(true);
    };

    const closePartModal = () => {
        setPartModalOpen(false);
        setEditingPart(null);
        partForm.reset();
        partForm.clearErrors();
    };

    const submitPart = (event) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: closePartModal,
        };

        if (editingPart) {
            partForm.put(
                route('parts.update', editingPart.id),
                options
            );

            return;
        }

        partForm.post(route('parts.store'), options);
    };

    const openStockAdjustment = (part) => {
        setSelectedPart(part);
        stockForm.setData({
            type: 'increase',
            quantity: 1,
        });
        stockForm.clearErrors();
        setStockModalOpen(true);
    };

    const closeStockModal = () => {
        setStockModalOpen(false);
        setSelectedPart(null);
        stockForm.reset();
        stockForm.clearErrors();
    };

    const submitStockAdjustment = (event) => {
        event.preventDefault();

        stockForm.patch(
            route('parts.stock.adjust', selectedPart.id),
            {
                preserveScroll: true,
                onSuccess: closeStockModal,
            }
        );
    };

    const applyFilters = (event) => {
        event.preventDefault();

        router.get(
            route('parts.index'),
            {
                search: search || undefined,
                stock: stockFilter || undefined,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStockFilter('');

        router.get(
            route('parts.index'),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const deletePart = (part) => {
        if (
            !window.confirm(
                `Delete part "${part.name}"?`
            )
        ) {
            return;
        }

        router.delete(
            route('parts.destroy', part.id),
            {
                preserveScroll: true,
            }
        );
    };

    return (
        <AppLayout title="Parts Inventory">
            <Head title="Parts Inventory" />

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    title="Total Parts"
                    value={statistics.total}
                    tone="blue"
                />

                <StatCard
                    title="Low Stock"
                    value={statistics.low_stock}
                    tone="amber"
                />

                <StatCard
                    title="Out of Stock"
                    value={statistics.out_of_stock}
                    tone="red"
                />
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Parts Inventory
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage parts, pricing and stock levels
                        </p>
                    </div>

                    {canCreate && (
                        <button
                            type="button"
                            onClick={openCreate}
                            className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                        >
                            Add Part
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
                        placeholder="Search part number, name or description"
                        className="rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    />

                    <select
                        value={stockFilter}
                        onChange={(event) =>
                            setStockFilter(event.target.value)
                        }
                        className="rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">All stock levels</option>
                        <option value="low">Low stock</option>
                        <option value="out">Out of stock</option>
                    </select>

                    <button
                        type="submit"
                        className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900"
                    >
                        Filter
                    </button>

                    {(filters.search || filters.stock) && (
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
                                    Part
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Name
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Stock
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Minimum
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Unit price
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
                            {parts.data.length > 0 ? (
                                parts.data.map((part) => (
                                    <tr
                                        key={part.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="whitespace-nowrap px-5 py-4 font-mono text-sm font-semibold text-slate-900">
                                            {part.part_number}
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-slate-900">
                                                {part.name}
                                            </p>

                                            {part.description && (
                                                <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                                                    {part.description}
                                                </p>
                                            )}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
                                            {part.stock_quantity}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                            {part.minimum_stock_level}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                            {currency.format(
                                                Number(part.unit_price)
                                            )}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4">
                                            <StatusBadge
                                                status={getStockStatus(
                                                    part
                                                )}
                                            />
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {canUpdate && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openStockAdjustment(
                                                                    part
                                                                )
                                                            }
                                                            className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                                                        >
                                                            Stock
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEdit(part)
                                                            }
                                                            className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                                                        >
                                                            Edit
                                                        </button>
                                                    </>
                                                )}

                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deletePart(part)
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
                                        No parts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={parts.links} />
            </div>

            <Modal
                open={partModalOpen}
                title={editingPart ? 'Edit Part' : 'Add Part'}
                onClose={closePartModal}
                width="lg"
            >
                <form onSubmit={submitPart} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Part number
                            </label>

                            <input
                                type="text"
                                value={partForm.data.part_number}
                                onChange={(event) =>
                                    partForm.setData(
                                        'part_number',
                                        event.target.value
                                    )
                                }
                                className="mt-1 w-full rounded-lg border-slate-300 uppercase"
                            />

                            <ErrorMessage
                                message={
                                    partForm.errors.part_number
                                }
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Name
                            </label>

                            <input
                                type="text"
                                value={partForm.data.name}
                                onChange={(event) =>
                                    partForm.setData(
                                        'name',
                                        event.target.value
                                    )
                                }
                                className="mt-1 w-full rounded-lg border-slate-300"
                            />

                            <ErrorMessage
                                message={partForm.errors.name}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Description
                        </label>

                        <textarea
                            rows="3"
                            value={partForm.data.description}
                            onChange={(event) =>
                                partForm.setData(
                                    'description',
                                    event.target.value
                                )
                            }
                            className="mt-1 w-full rounded-lg border-slate-300"
                        />

                        <ErrorMessage
                            message={partForm.errors.description}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Initial stock
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={partForm.data.stock_quantity}
                                onChange={(event) =>
                                    partForm.setData(
                                        'stock_quantity',
                                        event.target.value
                                    )
                                }
                                className="mt-1 w-full rounded-lg border-slate-300"
                            />

                            <ErrorMessage
                                message={
                                    partForm.errors.stock_quantity
                                }
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Minimum level
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={
                                    partForm.data.minimum_stock_level
                                }
                                onChange={(event) =>
                                    partForm.setData(
                                        'minimum_stock_level',
                                        event.target.value
                                    )
                                }
                                className="mt-1 w-full rounded-lg border-slate-300"
                            />

                            <ErrorMessage
                                message={
                                    partForm.errors
                                        .minimum_stock_level
                                }
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Unit price
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={partForm.data.unit_price}
                                onChange={(event) =>
                                    partForm.setData(
                                        'unit_price',
                                        event.target.value
                                    )
                                }
                                className="mt-1 w-full rounded-lg border-slate-300"
                            />

                            <ErrorMessage
                                message={partForm.errors.unit_price}
                            />
                        </div>
                    </div>

                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                        <input
                            type="checkbox"
                            checked={partForm.data.is_active}
                            onChange={(event) =>
                                partForm.setData(
                                    'is_active',
                                    event.target.checked
                                )
                            }
                            className="rounded border-slate-300 text-blue-700"
                        />

                        <span className="text-sm font-medium text-slate-700">
                            Active part
                        </span>
                    </label>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                        <button
                            type="button"
                            onClick={closePartModal}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={partForm.processing}
                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {partForm.processing
                                ? 'Saving...'
                                : editingPart
                                  ? 'Update Part'
                                  : 'Create Part'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                open={stockModalOpen}
                title={`Adjust Stock${
                    selectedPart ? ` – ${selectedPart.name}` : ''
                }`}
                onClose={closeStockModal}
            >
                <form
                    onSubmit={submitStockAdjustment}
                    className="space-y-4"
                >
                    {selectedPart && (
                        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                            Current stock:{' '}
                            <strong>
                                {selectedPart.stock_quantity}
                            </strong>
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Adjustment
                        </label>

                        <select
                            value={stockForm.data.type}
                            onChange={(event) =>
                                stockForm.setData(
                                    'type',
                                    event.target.value
                                )
                            }
                            className="mt-1 w-full rounded-lg border-slate-300"
                        >
                            <option value="increase">
                                Increase stock
                            </option>

                            <option value="decrease">
                                Decrease stock
                            </option>
                        </select>

                        <ErrorMessage
                            message={stockForm.errors.type}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Quantity
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={stockForm.data.quantity}
                            onChange={(event) =>
                                stockForm.setData(
                                    'quantity',
                                    event.target.value
                                )
                            }
                            className="mt-1 w-full rounded-lg border-slate-300"
                        />

                        <ErrorMessage
                            message={stockForm.errors.quantity}
                        />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                        <button
                            type="button"
                            onClick={closeStockModal}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={stockForm.processing}
                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            Update Stock
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}