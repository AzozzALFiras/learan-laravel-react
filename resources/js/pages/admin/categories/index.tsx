import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ProductCategory } from '@/types';
import { Head, Link, router, useForm, WhenVisible } from '@inertiajs/react';
import {
    ArrowDownUp,
    Calendar,
    FolderTree,
    Hash,
    Layers,
    Package,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    SlidersHorizontal,
    Tag,
    Trash2,
    X,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type SortKey = 'newest' | 'oldest' | 'name_en' | 'products';

interface Filters {
    search: string | null;
    date_from: string | null;
    date_to: string | null;
    sort: SortKey;
}

interface Props {
    categories?: ProductCategory[];
    filters: Filters;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Categories', href: '/admin/categories' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'name_en', label: 'Name (A–Z)' },
    { value: 'products', label: 'Most products' },
];

function TableSkeleton() {
    return (
        <div className="animate-pulse overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex gap-6 border-b border-zinc-200 bg-zinc-50/60 px-6 py-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                {['w-8', 'w-40', 'w-40', 'w-28', 'w-16', 'w-24', 'w-16'].map((w, i) => (
                    <div key={i} className={`h-3 ${w} rounded bg-zinc-200 dark:bg-zinc-700`} />
                ))}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-6 border-b border-zinc-100 px-6 py-4 last:border-0 dark:border-zinc-800">
                    {['w-8', 'w-40', 'w-40', 'w-28', 'w-10', 'w-24', 'w-12'].map((w, j) => (
                        <div key={j} className={`h-4 ${w} rounded bg-zinc-100 dark:bg-zinc-800`} />
                    ))}
                </div>
            ))}
        </div>
    );
}

type DialogMode = { type: 'create' } | { type: 'edit'; category: ProductCategory };

function CategoryDialog({ mode, onClose }: { mode: DialogMode; onClose: () => void }) {
    const isEdit = mode.type === 'edit';

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name_ar: isEdit ? mode.category.name_ar ?? '' : '',
        name_en: isEdit ? mode.category.name_en ?? '' : '',
    });

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    function submit(e: FormEvent) {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                reset();
                onClose();
            },
            preserveScroll: true,
        };
        if (isEdit) {
            patch(`/admin/categories/${mode.category.id}`, options);
        } else {
            post('/admin/categories', options);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-start justify-between border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <FolderTree className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                                {isEdit ? 'Edit category' : 'Create new category'}
                            </h2>
                            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                                Provide names in both Arabic and English. Slug is generated automatically.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-5 px-6 py-5">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                            Name (English)
                        </label>
                        <input
                            type="text"
                            value={data.name_en}
                            onChange={(e) => setData('name_en', e.target.value)}
                            placeholder="e.g. Software Licenses"
                            autoFocus
                            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                        />
                        {errors.name_en && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name_en}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                            Name (Arabic)
                        </label>
                        <input
                            type="text"
                            dir="rtl"
                            value={data.name_ar}
                            onChange={(e) => setData('name_ar', e.target.value)}
                            placeholder="اسم القسم"
                            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                        />
                        {errors.name_ar && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name_ar}</p>}
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            {processing ? 'Saving…' : isEdit ? 'Save changes' : 'Create category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DeleteButton({ category }: { category: ProductCategory }) {
    const [confirming, setConfirming] = useState(false);
    const disabled = (category.products_count ?? 0) > 0;

    function handleDelete() {
        router.delete(`/admin/categories/${category.id}`, { preserveScroll: true });
        setConfirming(false);
    }

    if (disabled) {
        return (
            <span
                className="inline-flex cursor-not-allowed items-center text-xs text-zinc-300 dark:text-zinc-600"
                title="Cannot delete a category with products"
            >
                —
            </span>
        );
    }

    if (confirming) {
        return (
            <div className="flex items-center gap-1.5">
                <button
                    onClick={handleDelete}
                    className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-red-700"
                >
                    Confirm
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
            title="Delete category"
        >
            <Trash2 className="h-4 w-4" />
        </button>
    );
}

export default function AdminCategoriesIndex({ categories, filters }: Props) {
    const [dialog, setDialog] = useState<DialogMode | null>(null);
    const [search, setSearch] = useState(filters?.search ?? '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters?.date_to ?? '');
    const [sort, setSort] = useState<SortKey>(filters?.sort ?? 'newest');

    const hasActiveFilters = useMemo(
        () => Boolean(filters?.search || filters?.date_from || filters?.date_to || (filters?.sort && filters.sort !== 'newest')),
        [filters],
    );

    function applyFilters(e?: FormEvent, overrides: Partial<Filters> = {}) {
        e?.preventDefault();
        router.get(
            '/admin/categories',
            {
                search: (overrides.search ?? search) || undefined,
                date_from: (overrides.date_from ?? dateFrom) || undefined,
                date_to: (overrides.date_to ?? dateTo) || undefined,
                sort: (overrides.sort ?? sort) !== 'newest' ? overrides.sort ?? sort : undefined,
            },
            { preserveState: true, replace: true },
        );
    }

    function clearFilters() {
        setSearch('');
        setDateFrom('');
        setDateTo('');
        setSort('newest');
        router.get('/admin/categories', {}, { preserveState: true, replace: true });
    }

    const totalCount = categories?.length ?? 0;
    const totalProducts = (categories ?? []).reduce((sum, c) => sum + (c.products_count ?? 0), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories — Admin" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
                            <FolderTree className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                                Categories
                            </h1>
                            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                                Organize your digital products into bilingual categories.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setDialog({ type: 'create' })}
                        className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                        <Plus className="h-4 w-4" />
                        New category
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Layers className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Total categories</p>
                            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{totalCount}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <Package className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Products across all</p>
                            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{totalProducts}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Tag className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Empty categories</p>
                            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                                {(categories ?? []).filter((c) => (c.products_count ?? 0) === 0).length}
                            </p>
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={applyFilters}
                    className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-[1fr_auto_auto_auto_auto]"
                >
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or slug…"
                            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                        />
                    </div>

                    <div className="relative">
                        <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100 md:w-44"
                            aria-label="Date from"
                        />
                    </div>

                    <div className="relative">
                        <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100 md:w-44"
                            aria-label="Date to"
                        />
                    </div>

                    <div className="relative">
                        <ArrowDownUp className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <select
                            value={sort}
                            onChange={(e) => {
                                const next = e.target.value as SortKey;
                                setSort(next);
                                applyFilters(undefined, { sort: next });
                            }}
                            className="w-full appearance-none rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-8 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100 md:w-44"
                        >
                            {SORT_OPTIONS.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            Apply
                        </button>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                title="Clear all filters"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Reset
                            </button>
                        )}
                    </div>
                </form>

                <WhenVisible data="categories" fallback={<TableSkeleton />}>
                    {(categories?.length ?? 0) === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                                <FolderTree className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {hasActiveFilters ? 'No categories match your filters' : 'No categories yet'}
                            </p>
                            <p className="max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
                                {hasActiveFilters
                                    ? 'Try adjusting your search or date range to see more results.'
                                    : 'Create your first category to start organizing your digital products.'}
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
                                <button
                                    onClick={() => setDialog({ type: 'create' })}
                                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Create first category
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
                                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                    {totalCount} {totalCount === 1 ? 'category' : 'categories'}
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
                                            <th className="px-5 py-3 font-medium">Name</th>
                                            <th className="px-5 py-3 font-medium">Slug</th>
                                            <th className="px-5 py-3 font-medium">Products</th>
                                            <th className="px-5 py-3 font-medium">Created</th>
                                            <th className="w-24 px-5 py-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {categories?.map((c, idx) => (
                                            <tr
                                                key={c.id}
                                                className="group transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40"
                                            >
                                                <td className="px-5 py-3.5 font-mono text-xs text-zinc-400 dark:text-zinc-500">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-medium text-zinc-900 dark:text-zinc-50">
                                                            {c.name_en}
                                                        </span>
                                                        <span
                                                            dir="rtl"
                                                            className="text-xs text-zinc-500 dark:text-zinc-400"
                                                        >
                                                            {c.name_ar}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                                                        {c.slug}
                                                    </code>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {(c.products_count ?? 0) > 0 ? (
                                                        <Link
                                                            href={`/admin/products?category_id=${c.id}`}
                                                            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                                                        >
                                                            <Package className="h-3 w-3" />
                                                            {c.products_count}
                                                        </Link>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 ring-1 ring-inset ring-zinc-300/60 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700">
                                                            0
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-xs text-zinc-500 dark:text-zinc-400">
                                                    {c.created_at}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => setDialog({ type: 'edit', category: c })}
                                                            className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <DeleteButton category={c} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </WhenVisible>
            </div>

            {dialog && <CategoryDialog mode={dialog} onClose={() => setDialog(null)} />}
        </AppLayout>
    );
}
