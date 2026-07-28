import AppLayout from '@/Layouts/AppLayout';
import {
    Head,
    Link,
    router,
    useForm,
} from '@inertiajs/react';
import { useState } from 'react';

export default function Index({
    users,
    roles,
    filters,
    currentUserId,
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [editingUser, setEditingUser] = useState(null);

    const form = useForm({
        name: '',
        email: '',
        role: '',
    });

    const openEditModal = (user) => {
        setEditingUser(user);

        form.setData({
            name: user.name,
            email: user.email,
            role: user.roles?.[0]?.name ?? '',
        });

        form.clearErrors();
    };

    const closeEditModal = () => {
        setEditingUser(null);
        form.reset();
        form.clearErrors();
    };

    const submitSearch = (event) => {
        event.preventDefault();

        router.get(
            route('admin.users.index'),
            { search },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clearSearch = () => {
        setSearch('');

        router.get(
            route('admin.users.index'),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const updateUser = (event) => {
        event.preventDefault();

        form.patch(
            route('admin.users.update', editingUser.id),
            {
                preserveScroll: true,
                onSuccess: closeEditModal,
            }
        );
    };

    const deleteUser = (user) => {
        if (Number(user.id) === Number(currentUserId)) {
            alert('You cannot delete your own account.');
            return;
        }

        if (
            !window.confirm(
                `Delete the account for ${user.name}?`
            )
        ) {
            return;
        }

        router.delete(
            route('admin.users.destroy', user.id),
            {
                preserveScroll: true,
            }
        );
    };

    const roleBadgeClass = (role) => {
        const styles = {
            Admin: 'bg-purple-100 text-purple-700',
            'Service Advisor': 'bg-blue-100 text-blue-700',
            Mechanic: 'bg-amber-100 text-amber-700',
        };

        return styles[role] ?? 'bg-slate-100 text-slate-700';
    };

    return (
        <AppLayout title="Users & Roles">
            <Head title="Users & Roles" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                        User Role Management
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Edit user details and assign system roles.
                    </p>
                </div>

                <form
                    onSubmit={submitSearch}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row"
                >
                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search name or email"
                        className="w-full rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    />

                    <button
                        type="submit"
                        className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                    >
                        Search
                    </button>

                    <button
                        type="button"
                        onClick={clearSearch}
                        className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Clear
                    </button>
                </form>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                        User
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                        Role
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                        Registered
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {users.data.map((user) => {
                                    const role =
                                        user.roles?.[0]?.name ??
                                        'No role';

                                    return (
                                        <tr key={user.id}>
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-slate-900">
                                                    {user.name}
                                                </p>

                                                <p className="text-sm text-slate-500">
                                                    {user.email}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClass(
                                                        role
                                                    )}`}
                                                >
                                                    {role}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {new Date(
                                                    user.created_at
                                                ).toLocaleDateString()}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(
                                                                user
                                                            )
                                                        }
                                                        className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            Number(
                                                                user.id
                                                            ) ===
                                                            Number(
                                                                currentUserId
                                                            )
                                                        }
                                                        onClick={() =>
                                                            deleteUser(
                                                                user
                                                            )
                                                        }
                                                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {users.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-5 py-10 text-center text-sm text-slate-500"
                                        >
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {users.links?.length > 3 && (
                        <div className="flex flex-wrap gap-2 border-t border-slate-200 px-5 py-4">
                            {users.links.map((link, index) =>
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        preserveScroll
                                        className={`rounded-lg px-3 py-2 text-sm ${
                                            link.active
                                                ? 'bg-blue-700 text-white'
                                                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ) : (
                                    <span
                                        key={index}
                                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-400"
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>

            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button
                        type="button"
                        aria-label="Close modal"
                        onClick={closeEditModal}
                        className="absolute inset-0 bg-slate-950/50"
                    />

                    <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Edit User
                        </h2>

                        <form
                            onSubmit={updateUser}
                            className="mt-5 space-y-4"
                        >
                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Name
                                </label>

                                <input
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData(
                                            'name',
                                            event.target.value
                                        )
                                    }
                                    className="mt-1 w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                />

                                {form.errors.name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {form.errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Email
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
                                    className="mt-1 w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                />

                                {form.errors.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {form.errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Role
                                </label>

                                <select
                                    value={form.data.role}
                                    onChange={(event) =>
                                        form.setData(
                                            'role',
                                            event.target.value
                                        )
                                    }
                                    className="mt-1 w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">
                                        Select role
                                    </option>

                                    {roles.map((role) => (
                                        <option
                                            key={role}
                                            value={role}
                                        >
                                            {role}
                                        </option>
                                    ))}
                                </select>

                                {form.errors.role && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {form.errors.role}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                >
                                    {form.processing
                                        ? 'Saving...'
                                        : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}