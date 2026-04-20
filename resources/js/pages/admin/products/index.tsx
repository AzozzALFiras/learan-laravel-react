import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Paginated, type ProductCategory, type ProductRow } from '@/types';
import { Head, Link, router, WhenVisible } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownUp,
    Ban,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    FolderTree,
    Hash,
    Key,
    LayoutGrid,
    List,
    Package,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    SlidersHorizontal,
    Trash2,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type SortKey = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'name';
type StockKey = '' | 'in_stock' | 'out_of_stock';
type StatusKey = '' | 'active' | 'inactive';

interface Stats {
    total: number;
    in_stock: number;
    out_of_stock: number;
    inactive: number;
    categories: number;
}

interface Filters {
    search: string | null;
    category_id: number | null;
    stock: StockKey | null;
    status: StatusKey | null;
    date_from: string | null;
    date_to: string | null;
    sort: SortKey;
}

interface Props {
    products?: Paginated<ProductRow>;
    stats?: Stats;
    categories: ProductCategory[];
    filters: Filters;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Products', href: '/admin/products' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'price_asc', label: 'Price — low to high' },
    { value: 'price_desc', label: 'Price — high to low' },
    { value: 'name', label: 'Name (A–Z)' },
];

function StatCard({
    label,
    value,
    icon: Icon,
    tone,
}: {
    label: string;
    value: number | string;
    icon: typeof Package;
    tone: 'blue' | 'emerald' | 'amber' | 'zinc' | 'purple';
}) {
    const tones = {
        blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        zinc: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
        purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    };

    return (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
                <p className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{value}</p>
            </div>
        </div>
    );
}

function StatCardSkeleton() {
    return (
        <div className="flex animate-pulse items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="h-10 w-10 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex-1 space-y-1.5">
                <div className="h-3 w-24 rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-6 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
            </div>
        </div>
    );
}

function StockBadge({ stock }: { stock: number }) {
    if (stock <= 0) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-950 dark:text-red-300">
                <AlertTriangle className="h-3 w-3" />
                Out of stock
            </span>
        );
    }
    if (stock < 5) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950 dark:text-amber-300">
                <AlertTriangle className="h-3 w-3" />
                Low · {stock}
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            In stock · {stock}
        </span>
    );
}

function DeleteProductButton({ productId }: { productId: number }) {
    const [confirming, setConfirming] = useState(false);

    function handleDelete() {
        router.delete(`/admin/products/${productId}`, { preserveScroll: true });
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
            title="Delete product"
        >
            <Trash2 className="h-4 w-4" />
        </button>
    );
}

function ProductCard({ product }: { product: ProductRow }) {
    return (
        <div className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name_en}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-300 dark:text-zinc-700">
                        <Package className="h-12 w-12" />
                    </div>
                )}
                <div className="absolute left-2 top-2 flex flex-col gap-1">
                    <StockBadge stock={product.available_stock} />
                </div>
                {!product.is_active && (
                    <div className="absolute right-2 top-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900/85 px-2 py-0.5 text-xs font-medium text-white shadow-sm backdrop-blur">
                            <Ban className="h-3 w-3" />
                            Inactive
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-4">
                <div className="mb-1 flex items-start justify-between gap-3">
                    <h3 className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {product.name_en}
                    </h3>
                    <p className="shrink-0 font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        ${product.price.toFixed(2)}
                    </p>
                </div>
                <p
                    dir="rtl"
                    className="mb-3 line-clamp-1 text-right text-xs text-zinc-500 dark:text-zinc-400"
                >
                    {product.name_ar}
                </p>
                {product.category && (
                    <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        <FolderTree className="h-3 w-3" />
                        {product.category.name_en}
                    </span>
                )}

                <div className="mt-auto flex items-center gap-1 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <Link
                        href={`/admin/products/${product.id}/licenses`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                        <Key className="h-3.5 w-3.5" />
                        Licenses
                    </Link>
                    <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded-md p-1.5 text-zinc-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50"
                        title="Edit"
                    >
                        <Pencil className="h-4 w-4" />
                    </Link>
                    <DeleteProductButton productId={product.id} />
                </div>
            </div>
        </div>
    );
}

function GridSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="animate-pulse overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                >
                    <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800" />
                    <div className="space-y-2 p-4">
                        <div className="h-4 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800" />
                        <div className="h-3 w-1/2 rounded bg-zinc-100 dark:bg-zinc-800" />
                        <div className="h-5 w-20 rounded bg-zinc-100 dark:bg-zinc-800" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="animate-pulse overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex gap-6 border-b border-zinc-200 bg-zinc-50/60 px-6 py-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                {['w-10', 'w-40', 'w-32', 'w-20', 'w-28', 'w-24', 'w-16'].map((w, i) => (
                    <div key={i} className={`h-3 ${w} rounded bg-zinc-200 dark:bg-zinc-700`} />
                ))}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-6 border-b border-zinc-100 px-6 py-4 last:border-0 dark:border-zinc-800">
                    <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                    {['w-40', 'w-32', 'w-16', 'w-24', 'w-20', 'w-16'].map((w, j) => (
                        <div key={j} className={`h-4 ${w} rounded bg-zinc-100 dark:bg-zinc-800`} />
                    ))}
                </div>
            ))}
        </div>
    );
}

export default function AdminProductsIndex({ products, stats, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [categoryId, setCategoryId] = useState(filters.category_id ? String(filters.category_id) : '');
    const [stock, setStock] = useState<StockKey>((filters.stock ?? '') as StockKey);
    const [status, setStatus] = useState<StatusKey>((filters.status ?? '') as StatusKey);
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const [sort, setSort] = useState<SortKey>(filters.sort);
    const [view, setView] = useState<'grid' | 'table'>('table');

    const hasActiveFilters = useMemo(
        () =>
            Boolean(
                filters.search ||
                    filters.category_id ||
                    filters.stock ||
                    filters.status ||
                    filters.date_from ||
                    filters.date_to ||
                    filters.sort !== 'newest',
            ),
        [filters],
    );

    function applyFilters(e?: FormEvent, overrides: Partial<Record<string, string>> = {}) {
        e?.preventDefault();
        const payload = {
            search: overrides.search ?? search ?? '',
            category_id: overrides.category_id ?? categoryId,
            stock: overrides.stock ?? stock,
            status: overrides.status ?? status,
            date_from: overrides.date_from ?? dateFrom,
            date_to: overrides.date_to ?? dateTo,
            sort: (overrides.sort ?? sort) === 'newest' ? '' : overrides.sort ?? sort,
        };
        router.get(
            '/admin/products',
            Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== '' && v !== null && v !== undefined)),
            { preserveState: true, replace: true },
        );
    }

    function clearFilters() {
        setSearch('');
        setCategoryId('');
        setStock('');
        setStatus('');
        setDateFrom('');
        setDateTo('');
        setSort('newest');
        router.get('/admin/products', {}, { preserveState: true, replace: true });
    }

    useEffect(() => {
        // keep local state in sync if server sends new filters (e.g. via browser nav)
        setSearch(filters.search ?? '');
        setCategoryId(filters.category_id ? String(filters.category_id) : '');
    }, [filters.search, filters.category_id]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products — Admin" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                                Products
                            </h1>
                            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                                Manage your digital products and license inventory in one place.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/admin/products/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                        <Plus className="h-4 w-4" />
                        New product
                    </Link>
                </div>

                {/* Stats */}
                <WhenVisible
                    data="stats"
                    fallback={
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                            {Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}
                        </div>
                    }
                >
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                        <StatCard label="Total products" value={stats?.total ?? 0} icon={Package} tone="blue" />
                        <StatCard label="In stock" value={stats?.in_stock ?? 0} icon={CheckCircle2} tone="emerald" />
                        <StatCard label="Out of stock" value={stats?.out_of_stock ?? 0} icon={AlertTriangle} tone="amber" />
                        <StatCard label="Inactive" value={stats?.inactive ?? 0} icon={Ban} tone="zinc" />
                        <StatCard label="Categories" value={stats?.categories ?? 0} icon={FolderTree} tone="purple" />
                    </div>
                </WhenVisible>

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
                            placeholder="Search by product name…"
                            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                        />
                    </div>

                    <div className="relative md:col-span-2">
                        <FolderTree className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <select
                            value={categoryId}
                            onChange={(e) => {
                                setCategoryId(e.target.value);
                                applyFilters(undefined, { category_id: e.target.value });
                            }}
                            className="w-full appearance-none rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                        >
                            <option value="">All categories</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name_en}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="relative md:col-span-2">
                        <Package className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <select
                            value={stock}
                            onChange={(e) => {
                                const v = e.target.value as StockKey;
                                setStock(v);
                                applyFilters(undefined, { stock: v });
                            }}
                            className="w-full appearance-none rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                        >
                            <option value="">Any stock</option>
                            <option value="in_stock">In stock</option>
                            <option value="out_of_stock">Out of stock</option>
                        </select>
                    </div>

                    <div className="relative md:col-span-2">
                        <CheckCircle2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <select
                            value={status}
                            onChange={(e) => {
                                const v = e.target.value as StatusKey;
                                setStatus(v);
                                applyFilters(undefined, { status: v });
                            }}
                            className="w-full appearance-none rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                        >
                            <option value="">Any status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
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

                    {/* Date range row */}
                    <div className="relative md:col-span-3">
                        <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                            aria-label="Created from"
                        />
                    </div>
                    <div className="relative md:col-span-3">
                        <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                            aria-label="Created to"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:col-span-6 md:justify-end">
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
                        <div className="flex items-center gap-0.5 rounded-lg border border-zinc-300 p-0.5 dark:border-zinc-700">
                            <button
                                type="button"
                                onClick={() => setView('table')}
                                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                    view === 'table'
                                        ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                                }`}
                                aria-pressed={view === 'table'}
                            >
                                <List className="h-3.5 w-3.5" />
                                Table
                            </button>
                            <button
                                type="button"
                                onClick={() => setView('grid')}
                                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                    view === 'grid'
                                        ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                                }`}
                                aria-pressed={view === 'grid'}
                            >
                                <LayoutGrid className="h-3.5 w-3.5" />
                                Grid
                            </button>
                        </div>
                    </div>
                </form>

                <WhenVisible data="products" fallback={view === 'grid' ? <GridSkeleton /> : <TableSkeleton />}>
                    <div className="flex flex-col gap-4">
                        {(products?.data.length ?? 0) === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                                    <Package className="h-6 w-6" />
                                </div>
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                    {hasActiveFilters ? 'No products match your filters' : 'No products yet'}
                                </p>
                                <p className="max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
                                    {hasActiveFilters
                                        ? 'Try changing or clearing some filters to see more products.'
                                        : 'Add your first digital product to start selling.'}
                                </p>
                                {hasActiveFilters ? (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                        Clear filters
                                    </button>
                                ) : (
                                    <Link
                                        href="/admin/products/create"
                                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        New product
                                    </Link>
                                )}
                            </div>
                        ) : view === 'grid' ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {products?.data.map((p) => <ProductCard key={p.id} product={p} />)}
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
                                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                        Showing {products?.data.length ?? 0} of {products?.total ?? 0} products
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
                                                <th className="w-14 px-5 py-3 font-medium">
                                                    <Hash className="h-3.5 w-3.5" />
                                                </th>
                                                <th className="px-5 py-3 font-medium">Product</th>
                                                <th className="px-5 py-3 font-medium">Category</th>
                                                <th className="px-5 py-3 font-medium">Price</th>
                                                <th className="px-5 py-3 font-medium">Stock</th>
                                                <th className="px-5 py-3 font-medium">Status</th>
                                                <th className="px-5 py-3 font-medium">Created</th>
                                                <th className="w-32 px-5 py-3 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                            {products?.data.map((p) => (
                                                <tr
                                                    key={p.id}
                                                    className="group transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40"
                                                >
                                                    <td className="px-5 py-3">
                                                        <div className="h-10 w-10 overflow-hidden rounded-md bg-zinc-100 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700">
                                                            {p.image_url ? (
                                                                <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-zinc-300 dark:text-zinc-600">
                                                                    <Package className="h-4 w-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex flex-col gap-0.5">
                                                            <Link
                                                                href={`/admin/products/${p.id}/edit`}
                                                                className="font-medium text-zinc-900 hover:text-blue-600 dark:text-zinc-50 dark:hover:text-blue-400"
                                                            >
                                                                {p.name_en}
                                                            </Link>
                                                            <span dir="rtl" className="text-xs text-zinc-500 dark:text-zinc-400">
                                                                {p.name_ar}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        {p.category ? (
                                                            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                                                                <FolderTree className="h-3 w-3" />
                                                                {p.category.name_en}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-zinc-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3 font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                        ${p.price.toFixed(2)}
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <StockBadge stock={p.available_stock} />
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        {p.is_active ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300">
                                                                <CheckCircle2 className="h-3 w-3" />
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-300">
                                                                <Ban className="h-3 w-3" />
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3 text-xs text-zinc-500 dark:text-zinc-400">{p.created_at}</td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Link
                                                                href={`/admin/products/${p.id}/licenses`}
                                                                className="rounded-md p-1.5 text-zinc-400 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/50"
                                                                title="Licenses"
                                                            >
                                                                <Key className="h-4 w-4" />
                                                            </Link>
                                                            <Link
                                                                href={`/admin/products/${p.id}/edit`}
                                                                className="rounded-md p-1.5 text-zinc-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50"
                                                                title="Edit"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                            <DeleteProductButton productId={p.id} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {(products?.last_page ?? 0) > 1 && (
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <span className="text-zinc-500 dark:text-zinc-400">
                                    {products?.total} products · Page{' '}
                                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                                        {products?.current_page}
                                    </span>{' '}
                                    of {products?.last_page}
                                </span>
                                <div className="flex gap-2">
                                    {products?.prev_page_url ? (
                                        <Link
                                            href={products.prev_page_url}
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
                                    {products?.next_page_url ? (
                                        <Link
                                            href={products.next_page_url}
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
