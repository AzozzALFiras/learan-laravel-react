import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, WhenVisible } from '@inertiajs/react';
import { BadgeCheck, CalendarDays, ShieldCheck, User } from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

interface ChartPoint {
    month: string;
    count: number;
}

interface Props {
    chart_data?: ChartPoint[];
}

function greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

function StatCard({
    icon: Icon,
    label,
    value,
    sub,
    color,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    sub?: string;
    color: string;
}) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-sidebar-border/70 bg-white p-5 dark:border-sidebar-border dark:bg-zinc-900">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
                <p className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-100">{value}</p>
                {sub && <p className="text-xs text-zinc-400 dark:text-zinc-500">{sub}</p>}
            </div>
        </div>
    );
}

function ChartSkeleton() {
    return (
        <div className="h-52 w-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
    );
}

export default function Dashboard({ chart_data }: Props) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user!;

    const memberSince = user.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Welcome header */}
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                        {greeting()}, {user.name} 👋
                    </h1>
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Stat cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        icon={CalendarDays}
                        label="Member Since"
                        value={memberSince}
                        color="bg-blue-500"
                    />
                    <StatCard
                        icon={user.role === 'admin' ? ShieldCheck : User}
                        label="Account Role"
                        value={user.role === 'admin' ? 'Administrator' : 'User'}
                        sub={user.role === 'admin' ? 'Full access' : 'Standard access'}
                        color={user.role === 'admin' ? 'bg-purple-500' : 'bg-emerald-500'}
                    />
                    <StatCard
                        icon={BadgeCheck}
                        label="Email Status"
                        value={user.email_verified_at ? 'Verified' : 'Not Verified'}
                        sub={user.email}
                        color={user.email_verified_at ? 'bg-emerald-500' : 'bg-amber-500'}
                    />
                </div>

                {/* Chart */}
                <div className="rounded-xl border border-sidebar-border/70 bg-white p-5 dark:border-sidebar-border dark:bg-zinc-900">
                    <h2 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Monthly New Users
                    </h2>
                    <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">Last 6 months</p>

                    <WhenVisible data="chart_data" fallback={<ChartSkeleton />}>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={chart_data ?? []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 12 }}
                                    className="fill-zinc-500 dark:fill-zinc-400"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fontSize: 12 }}
                                    className="fill-zinc-500 dark:fill-zinc-400"
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
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fill="url(#userGradient)"
                                    name="New Users"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </WhenVisible>
                </div>

            </div>
        </AppLayout>
    );
}
