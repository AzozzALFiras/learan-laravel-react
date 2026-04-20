import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type UserRole } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { WhenVisible } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface UserRow {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    created_at: string;
}

interface PaginatedUsers {
    data: UserRow[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface Props {
    users?: PaginatedUsers;
    filters: { search?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Users', href: '/admin/users' },
];

const roleStyles = {
    admin: 'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950 dark:text-purple-300',
    user: 'bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-300',
} as const;

function RoleBadge({ role }: { role: UserRole }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset capitalize ${roleStyles[role]}`}>
            {role}
        </span>
    );
}

function TableSkeleton() {
    return (
        <div className="animate-pulse overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
            <div className="flex gap-4 border-b border-zinc-200 bg-zinc-50 px-6 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
                {['w-36', 'w-48', 'w-20', 'w-24', 'w-16'].map((w, i) => (
                    <div key={i} className={`h-4 ${w} rounded bg-zinc-200 dark:bg-zinc-600`} />
                ))}
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex gap-4 border-b border-zinc-100 px-6 py-4 last:border-0 dark:border-zinc-800">
                    {['w-36', 'w-48', 'w-20', 'w-24', 'w-16'].map((w, j) => (
                        <div key={j} className={`h-4 ${w} rounded bg-zinc-100 dark:bg-zinc-800`} />
                    ))}
                </div>
            ))}
        </div>
    );
}

function RoleSelect({ user, currentUserId }: { user: UserRow; currentUserId: number }) {
    const isSelf = user.id === currentUserId;

    function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const newRole = e.target.value as UserRole;
        router.patch(
            `/admin/users/${user.id}`,
            { role: newRole },
            { preserveScroll: true },
        );
    }

    return (
        <select
            defaultValue={user.role}
            onChange={handleChange}
            disabled={isSelf}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 disabled:opacity-50"
        >
            <option value="user">user</option>
            <option value="admin">admin</option>
        </select>
    );
}

function DeleteButton({ user, currentUserId }: { user: UserRow; currentUserId: number }) {
    const [confirming, setConfirming] = useState(false);
    const isSelf = user.id === currentUserId;

    function handleDelete() {
        router.delete(`/admin/users/${user.id}`, { preserveScroll: true });
        setConfirming(false);
    }

    if (isSelf) return null;

    if (confirming) {
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={handleDelete}
                    className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                >
                    Confirm
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
        >
            <Trash2 className="h-4 w-4" />
        </button>
    );
}

export default function AdminUsersIndex({ users, filters }: Props) {
    const { auth } = usePage().props as unknown as { auth: { user: { id: number } } };
    const [search, setSearch] = useState(filters.search ?? '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/admin/users', { search }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users — Admin" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Users</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage user accounts and roles.</p>
                    </div>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email…"
                        className="w-full max-w-sm rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
                    />
                    <button
                        type="submit"
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                    >
                        Search
                    </button>
                    {filters.search && (
                        <Link
                            href="/admin/users"
                            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300"
                        >
                            Clear
                        </Link>
                    )}
                </form>

                <WhenVisible data="users" fallback={<TableSkeleton />}>
                    <div className="flex flex-col gap-4">
                        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <table className="w-full text-sm">
                                <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Name</th>
                                        <th className="px-6 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Email</th>
                                        <th className="px-6 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Role</th>
                                        <th className="px-6 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Joined</th>
                                        <th className="px-6 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {(users?.data ?? []).map((user) => (
                                        <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                                            <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{user.name}</td>
                                            <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <RoleBadge role={user.role} />
                                                    <RoleSelect user={user} currentUserId={auth.user.id} />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{user.created_at}</td>
                                            <td className="px-6 py-4">
                                                <DeleteButton user={user} currentUserId={auth.user.id} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {(users?.last_page ?? 0) > 1 && (
                            <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
                                <span>
                                    {users?.total} users — page {users?.current_page} of {users?.last_page}
                                </span>
                                <div className="flex gap-2">
                                    {users?.prev_page_url && (
                                        <Link
                                            href={users.prev_page_url}
                                            className="rounded-lg border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
                                        >
                                            Previous
                                        </Link>
                                    )}
                                    {users?.next_page_url && (
                                        <Link
                                            href={users.next_page_url}
                                            className="rounded-lg border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
                                        >
                                            Next
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </WhenVisible>
            </div>
        </AppLayout>
    );
}
