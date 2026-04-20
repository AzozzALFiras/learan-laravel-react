import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Paginated, type ProductLicenseRow } from '@/types';
import { Head, Link, router, WhenVisible } from '@inertiajs/react';
import {
    ArrowDownUp,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Copy,
    Hash,
    Key,
    Package,
    RotateCcw,
    Search,
    ShoppingBag,
    SlidersHorizontal,
    Sparkles,
    Trash2,
    Upload,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type SortKey = 'newest' | 'oldest' | 'sold_at';
type StatusKey = '' | 'available' | 'sold';

interface Filters {
    search: string | null;
    status: StatusKey | null;
    date_from: string | null;
    date_to: string | null;
    sort: SortKey;
}

interface Props {
    product: { id: number; name_ar: string; name_en: string };
    counts: { available: number; sold: number; total: number };
    licenses?: Paginated<ProductLicenseRow>;
    filters: Filters;
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'sold_at', label: 'Recently sold' },
];

function StatPill({
    label,
    value,
    icon: Icon,
    tone,
}: {
    label: string;
    value: number;
    icon: typeof Key;
    tone: 'emerald' | 'blue' | 'zinc';
}) {
    const tones = {
        emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        zinc: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
    };
    return (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
                <p className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{value}</p>
            </div>
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="animate-pulse overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex gap-6 border-b border-zinc-200 bg-zinc-50/60 px-6 py-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                {['w-8', 'w-64', 'w-24', 'w-32', 'w-28', 'w-16'].map((w, i) => (
                    <div key={i} className={`h-3 ${w} rounded bg-zinc-200 dark:bg-zinc-700`} />
                ))}
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex gap-6 border-b border-zinc-100 px-6 py-4 last:border-0 dark:border-zinc-800">
                    {['w-8', 'w-64', 'w-20', 'w-28', 'w-24', 'w-8'].map((w, j) => (
                        <div key={j} className={`h-4 ${w} rounded bg-zinc-100 dark:bg-zinc-800`} />
                    ))}
                </div>
            ))}
        </div>
    );
}

function DeleteLicenseButton({ license }: { license: ProductLicenseRow }) {
    const [confirming, setConfirming] = useState(false);

    if (license.status !== 'available') {
        return <span className="text-xs text-zinc-300 dark:text-zinc-600">—</span>;
    }

    function handleDelete() {
        router.delete(`/admin/products/licenses/${license.id}`, { preserveScroll: true });
        setConfirming(false);
    }

    if (confirming) {
        return (
            <div className="flex items-center gap-1">
                <button
                    onClick={handleDelete}
                    className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-red-700"
                >
                    Confirm
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
            title="Delete license"
        >
            <Trash2 className="h-4 w-4" />
        </button>
    );
}

function CopyButton({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);
    function copy() {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }
    return (
        <button
            onClick={copy}
            className="rounded-md p-1.5 text-zinc-400 opacity-0 transition-all hover:bg-zinc-100 hover:text-zinc-700 group-hover:opacity-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            title={copied ? 'Copied!' : 'Copy license key'}
        >
            {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
    );
}

export default function AdminProductLicenses({ product, counts, licenses, filters }: Props) {
    const [keys, setKeys] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState<StatusKey>((filters.status ?? '') as StatusKey);
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const [sort, setSort] = useState<SortKey>(filters.sort);

    const hasActiveFilters = useMemo(
        () =>
            Boolean(
                filters.search || filters.status || filters.date_from || filters.date_to || filters.sort !== 'newest',
            ),
        [filters],
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Products', href: '/admin/products' },
        { title: product.name_en, href: `/admin/products/${product.id}/edit` },
        { title: 'Licenses', href: `/admin/products/${product.id}/licenses` },
    ];

    function submit(e: FormEvent) {
        e.preventDefault();
        if (!keys.trim()) return;
        setSubmitting(true);
        router.post(
            `/admin/products/${product.id}/licenses`,
            { keys },
            {
                preserveScroll: true,
                onSuccess: () => setKeys(''),
                onFinish: () => setSubmitting(false),
            },
        );
    }

    function applyFilters(e?: FormEvent, overrides: Partial<Record<string, string>> = {}) {
        e?.preventDefault();
        const payload = {
            search: overrides.search ?? search,
            status: overrides.status ?? status,
            date_from: overrides.date_from ?? dateFrom,
            date_to: overrides.date_to ?? dateTo,
            sort: (overrides.sort ?? sort) === 'newest' ? '' : overrides.sort ?? sort,
        };
        router.get(
            `/admin/products/${product.id}/licenses`,
            Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== '' && v !== null && v !== undefined)),
            { preserveState: true, replace: true },
        );
    }

    function clearFilters() {
        setSearch('');
        setStatus('');
        setDateFrom('');
        setDateTo('');
        setSort('newest');
        router.get(`/admin/products/${product.id}/licenses`, {}, { preserveState: true, replace: true });
    }

    const readyCount = keys.split('\n').filter((l) => l.trim()).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Licenses — ${product.name_en}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20">
                            <Key className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                                Licenses · {product.name_en}
                            </h1>
                            <p dir="rtl" className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                                {product.name_ar}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                        <Package className="h-4 w-4" />
                        View product
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <StatPill label="Available" value={counts.available} icon={CheckCircle2} tone="emerald" />
                    <StatPill label="Sold" value={counts.sold} icon={ShoppingBag} tone="blue" />
                    <StatPill label="Total keys" value={counts.total} icon={Key} tone="zinc" />
                </div>

                {/* Add licenses */}
                <form
                    onSubmit={submit}
                    className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                    <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4 text-zinc-400" />
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Bulk upload licenses</h3>
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            <Sparkles className="mr-1 inline h-3 w-3" />
                            Duplicates are automatically skipped
                        </span>
                    </div>
                    <div className="px-5 py-4">
                        <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
                            Paste one license key per line. Keys will be added to this product's available inventory.
                        </p>
                        <textarea
                            value={keys}
                            onChange={(e) => setKeys(e.target.value)}
                            rows={6}
                            placeholder={'XXXX-XXXXX-XXXXX\nYYYY-YYYYY-YYYYY\nZZZZ-ZZZZZ-ZZZZZ'}
                            className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-900 shadow-inner placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                            dir="ltr"
                        />
                        <div className="mt-3 flex items-center justify-between">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">{readyCount}</span>{' '}
                                {readyCount === 1 ? 'key' : 'keys'} ready to import
                            </p>
                            <button
                                type="submit"
                                disabled={submitting || !keys.trim()}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                            >
                                <Upload className="h-3.5 w-3.5" />
                                {submitting ? 'Importing…' : `Import ${readyCount || ''}`.trim()}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Filter toolbar */}
                <form
                    onSubmit={applyFilters}
                    className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-12"
                >
                    <div className="relative md:col-span-4">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search license key…"
                            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 font-mono text-sm text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                        />
                    </div>

                    <div className="relative md:col-span-2">
                        <Key className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <select
                            value={status}
                            onChange={(e) => {
                                const v = e.target.value as StatusKey;
                                setStatus(v);
                                applyFilters(undefined, { status: v });
                            }}
                            className="w-full appearance-none rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                        >
                            <option value="">All statuses</option>
                            <option value="available">Available</option>
                            <option value="sold">Sold</option>
                        </select>
                    </div>

                    <div className="relative md:col-span-2">
                        <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                            aria-label="Added from"
                        />
                    </div>
                    <div className="relative md:col-span-2">
                        <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                            aria-label="Added to"
                        />
                    </div>

                    <div className="relative md:col-span-2">
                        <ArrowDownUp className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <select
                            value={sort}
                            onChange={(e) => {
                                const v = e.target.value as SortKey;
                                setSort(v);
                                applyFilters(undefined, { sort: v });
                            }}
                            className="w-full appearance-none rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                        >
                            {SORT_OPTIONS.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 md:col-span-12 md:justify-end">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            Apply filters
                        </button>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Reset
                            </button>
                        )}
                    </div>
                </form>

                <WhenVisible data="licenses" fallback={<TableSkeleton />}>
                    <div className="flex flex-col gap-4">
                        {(licenses?.data.length ?? 0) === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                                    <Key className="h-6 w-6" />
                                </div>
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                    {hasActiveFilters ? 'No licenses match your filters' : 'No licenses yet'}
                                </p>
                                <p className="max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
                                    {hasActiveFilters
                                        ? 'Try clearing or changing a filter to see more keys.'
                                        : 'Use the upload form above to add license keys for this product.'}
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
                                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                        Showing {licenses?.data.length ?? 0} of {licenses?.total ?? 0} licenses
                                    </h2>
                                    {hasActiveFilters && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-950 dark:text-blue-300">
                                            Filtered
                                        </span>
                                    )}
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-zinc-50/80 text-left text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-800/40 dark:text-zinc-400">
                                            <tr>
                                                <th className="w-12 px-5 py-3 font-medium">
                                                    <Hash className="h-3.5 w-3.5" />
                                                </th>
                                                <th className="px-5 py-3 font-medium">License key</th>
                                                <th className="px-5 py-3 font-medium">Status</th>
                                                <th className="px-5 py-3 font-medium">Sold at</th>
                                                <th className="px-5 py-3 font-medium">Added</th>
                                                <th className="w-16 px-5 py-3 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                            {licenses?.data.map((l, idx) => {
                                                const pageOffset =
                                                    ((licenses?.current_page ?? 1) - 1) * (licenses?.per_page ?? 25);
                                                return (
                                                    <tr
                                                        key={l.id}
                                                        className="group transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40"
                                                    >
                                                        <td className="px-5 py-3 text-xs font-mono text-zinc-400 dark:text-zinc-500">
                                                            {pageOffset + idx + 1}
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <code className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                                                                    {l.license_key}
                                                                </code>
                                                                <CopyButton value={l.license_key} />
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            {l.status === 'available' ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300">
                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                    Available
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-950 dark:text-blue-300">
                                                                    <ShoppingBag className="h-3 w-3" />
                                                                    Sold
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                                                            {l.sold_at ?? '—'}
                                                        </td>
                                                        <td className="px-5 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                                                            {l.created_at}
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            <div className="flex items-center justify-end">
                                                                <DeleteLicenseButton license={l} />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {(licenses?.last_page ?? 0) > 1 && (
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <span className="text-zinc-500 dark:text-zinc-400">
                                    {licenses?.total} licenses · Page{' '}
                                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                                        {licenses?.current_page}
                                    </span>{' '}
                                    of {licenses?.last_page}
                                </span>
                                <div className="flex gap-2">
                                    {licenses?.prev_page_url ? (
                                        <Link
                                            href={licenses.prev_page_url}
                                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5" />
                                            Previous
                                        </Link>
                                    ) : (
                                        <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-600">
                                            <ChevronLeft className="h-3.5 w-3.5" />
                                            Previous
                                        </span>
                                    )}
                                    {licenses?.next_page_url ? (
                                        <Link
                                            href={licenses.next_page_url}
                                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                        >
                                            Next
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </Link>
                                    ) : (
                                        <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-600">
                                            Next
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </span>
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
