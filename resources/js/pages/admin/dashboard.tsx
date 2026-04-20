import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, WhenVisible } from '@inertiajs/react';
import { CalendarDays, ShieldCheck, User, Users } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface Stats {
    total_users: number;
    admin_users: number;
    regular_users: number;
    new_this_month: number;
}

interface MonthPoint {
    month: string;
    count: number;
}

interface RecentUser {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface Props {
    stats?: Stats;
    monthly_registrations?: MonthPoint[];
    recent_users?: RecentUser[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Dashboard', href: '/admin' },
];

function StatCard({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string;
    value: number;
    icon: React.ElementType;
    color: string;
}) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-zinc-900">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
                <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{value}</p>
            </div>
        </div>
    );
}

function StatsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="flex animate-pulse items-center gap-4 rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-zinc-900"
                >
                    <div className="h-12 w-12 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
                    <div className="space-y-2">
                        <div className="h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-800" />
                        <div className="h-7 w-12 rounded bg-zinc-200 dark:bg-zinc-700" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function RoleBadge({ role }: { role: string }) {
    const isAdmin = role === 'admin';
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            isAdmin
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
        }`}>
            {isAdmin ? 'Admin' : 'User'}
        </span>
    );
}

export default function AdminDashboard({ stats, monthly_registrations, recent_users }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Admin Dashboard</h1>
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Overview of your application.</p>
                </div>

                {/* Stat cards */}
                <WhenVisible data="stats" fallback={<StatsSkeleton />}>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard label="Total Users"    value={stats?.total_users    ?? 0} icon={Users}       color="bg-blue-500"    />
                        <StatCard label="Admins"         value={stats?.admin_users    ?? 0} icon={ShieldCheck} color="bg-purple-500"  />
                        <StatCard label="Regular Users"  value={stats?.regular_users  ?? 0} icon={User}        color="bg-emerald-500" />
                        <StatCard label="New This Month" value={stats?.new_this_month ?? 0} icon={CalendarDays} color="bg-amber-500"  />
                    </div>
                </WhenVisible>

                {/* Chart + Recent Users */}
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Bar chart */}
                    <div className="lg:col-span-2 rounded-xl border border-sidebar-border/70 bg-white p-5 dark:border-sidebar-border dark:bg-zinc-900">
                        <h2 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">User Registrations</h2>
                        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">Last 6 months</p>

                        <WhenVisible
                            data="monthly_registrations"
                            fallback={<div className="h-52 w-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />}
                        >
                            <ResponsiveContainer width="100%" height={208}>
                                <BarChart data={monthly_registrations ?? []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--color-zinc-900, #18181b)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                        }}
                                        labelStyle={{ color: '#a1a1aa' }}
                                        itemStyle={{ color: '#e4e4e7' }}
                                        cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                                    />
                                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Registrations" />
                                </BarChart>
                            </ResponsiveContainer>
                        </WhenVisible>
                    </div>

                    {/* Recent users */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-white p-5 dark:border-sidebar-border dark:bg-zinc-900">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent Users</h2>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Latest registrations</p>
                            </div>
                            <Link
                                href="/admin/users"
                                className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400"
                            >
                                View all →
                            </Link>
                        </div>

                        <WhenVisible
                            data="recent_users"
                            fallback={
                                <div className="space-y-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="flex animate-pulse items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                                            <div className="flex-1 space-y-1">
                                                <div className="h-3 w-24 rounded bg-zinc-100 dark:bg-zinc-800" />
                                                <div className="h-2.5 w-32 rounded bg-zinc-100 dark:bg-zinc-800" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            }
                        >
                            <div className="space-y-3">
                                {(recent_users ?? []).map((u) => (
                                    <div key={u.id} className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{u.name}</p>
                                            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{u.email}</p>
                                        </div>
                                        <RoleBadge role={u.role} />
                                    </div>
                                ))}
                            </div>
                        </WhenVisible>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
