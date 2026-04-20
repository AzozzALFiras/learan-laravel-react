import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Paginated, type ProductCategory, type ProductRow } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { WhenVisible } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, FolderTree, Key, LayoutGrid, List, Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Stats {
    total: number;
    in_stock: number;
    out_of_stock: number;
    categories: number;
}

interface Props {
    products?: Paginated<ProductRow>;
    stats?: Stats;
    categories: ProductCategory[];
    filters: { search?: string; category_id?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Products', href: '/admin/products' },
];

function StatCard({
    label,
    value,
    icon: Icon,
    gradient,
}: {
    label: string;
    value: number | string;
    icon: typeof Package;
    gradient: string;
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
                    <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">{value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}

function StatCardSkeleton() {
    return (
        <div className="animate-pulse rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div className="h-8 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
                </div>
                <div className="h-12 w-12 rounded-xl bg-zinc-200 dark:bg-zinc-700" />
            </div>
        </div>
    );
}

function StockBadge({ stock }: { stock: number }) {
    if (stock <= 0) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-950 dark:text-red-300">
                <AlertTriangle className="h-3 w-3" />
                نفذ المخزون
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            متوفر — {stock}
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
                    className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                >
                    تأكيد
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300"
                >
                    إلغاء
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
            title="حذف"
        >
            <Trash2 className="h-4 w-4" />
        </button>
    );
}

function ProductCard({ product }: { product: ProductRow }) {
    return (
        <div className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name_ar}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-300 dark:text-zinc-600">
                        <Package className="h-12 w-12" />
                    </div>
                )}
                <div className="absolute top-2 left-2">
                    <StockBadge stock={product.available_stock} />
                </div>
                {!product.is_active && (
                    <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center rounded-full bg-zinc-900/80 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
                            معطّل
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100" dir="rtl">
                        {product.name_ar}
                    </h3>
                    <p className="shrink-0 font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        ${product.price.toFixed(2)}
                    </p>
                </div>
                <p className="mb-3 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">{product.name_en}</p>
                {product.category && (
                    <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        <FolderTree className="h-3 w-3" />
                        {product.category.name_ar}
                    </span>
                )}

                <div className="mt-auto flex items-center gap-1 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <Link
                        href={`/admin/products/${product.id}/licenses`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                    >
                        <Key className="h-3.5 w-3.5" />
                        التراخيص
                    </Link>
                    <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded-md p-1.5 text-zinc-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
                        title="تعديل"
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
                <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                    <div className="aspect-[4/3] bg-zinc-200 dark:bg-zinc-700" />
                    <div className="space-y-2 p-4">
                        <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
                        <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
                        <div className="h-5 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function AdminProductsIndex({ products, stats, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [categoryId, setCategoryId] = useState(filters.category_id ?? '');
    const [view, setView] = useState<'grid' | 'table'>('grid');

    function applyFilters(e?: FormEvent) {
        e?.preventDefault();
        router.get(
            '/admin/products',
            { search: search || undefined, category_id: categoryId || undefined },
            { preserveState: true, replace: true },
        );
    }

    const hasFilters = Boolean(filters.search || filters.category_id);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products — Admin" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">المنتجات الرقمية</h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                أدِر منتجاتك ومخزون التراخيص من مكان واحد.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/admin/products/create"
                        className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                    >
                        <Plus className="h-4 w-4" />
                        منتج جديد
                    </Link>
                </div>

                <WhenVisible
                    data="stats"
                    fallback={
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard label="إجمالي المنتجات" value={stats?.total ?? 0} icon={Package} gradient="from-blue-500 to-indigo-600" />
                        <StatCard label="متوفر" value={stats?.in_stock ?? 0} icon={CheckCircle2} gradient="from-emerald-500 to-teal-600" />
                        <StatCard label="نفذ المخزون" value={stats?.out_of_stock ?? 0} icon={AlertTriangle} gradient="from-amber-500 to-orange-600" />
                        <StatCard label="الأقسام" value={stats?.categories ?? 0} icon={FolderTree} gradient="from-purple-500 to-pink-600" />
                    </div>
                </WhenVisible>

                <form
                    onSubmit={applyFilters}
                    className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900"
                >
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ابحث بالاسم العربي أو الإنجليزي…"
                            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
                        />
                    </div>
                    <select
                        value={categoryId}
                        onChange={(e) => {
                            setCategoryId(e.target.value);
                            setTimeout(() => applyFilters(), 0);
                        }}
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                        <option value="">كل الأقسام</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name_ar} — {c.name_en}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                    >
                        بحث
                    </button>
                    {hasFilters && (
                        <Link
                            href="/admin/products"
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300"
                        >
                            مسح
                        </Link>
                    )}

                    <div className="ml-auto flex items-center gap-1 rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
                        <button
                            type="button"
                            onClick={() => setView('grid')}
                            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${
                                view === 'grid'
                                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                            }`}
                        >
                            <LayoutGrid className="h-3.5 w-3.5" /> شبكة
                        </button>
                        <button
                            type="button"
                            onClick={() => setView('table')}
                            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${
                                view === 'table'
                                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                            }`}
                        >
                            <List className="h-3.5 w-3.5" /> جدول
                        </button>
                    </div>
                </form>

                <WhenVisible data="products" fallback={<GridSkeleton />}>
                    <div className="flex flex-col gap-6">
                    {(products?.data.length ?? 0) === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                            <Package className="h-10 w-10 text-zinc-400" />
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">لا توجد منتجات مطابقة.</p>
                        </div>
                    ) : view === 'grid' ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {products?.data.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <table className="w-full text-sm">
                                <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-zinc-500 dark:text-zinc-400">#</th>
                                        <th className="px-4 py-3 text-right text-zinc-500 dark:text-zinc-400">المنتج</th>
                                        <th className="px-4 py-3 text-left text-zinc-500 dark:text-zinc-400">القسم</th>
                                        <th className="px-4 py-3 text-left text-zinc-500 dark:text-zinc-400">السعر</th>
                                        <th className="px-4 py-3 text-left text-zinc-500 dark:text-zinc-400">المخزون</th>
                                        <th className="px-4 py-3 text-left text-zinc-500 dark:text-zinc-400"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {products?.data.map((p) => (
                                        <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                                            <td className="px-4 py-3">
                                                <div className="h-10 w-10 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                                                    {p.image_url ? (
                                                        <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-zinc-300">
                                                            <Package className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3" dir="rtl">
                                                <div className="font-medium text-zinc-900 dark:text-zinc-100">{p.name_ar}</div>
                                                <div className="text-xs text-zinc-500 dark:text-zinc-400" dir="ltr">{p.name_en}</div>
                                            </td>
                                            <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{p.category?.name_ar ?? '—'}</td>
                                            <td className="px-4 py-3 font-mono text-emerald-600 dark:text-emerald-400">${p.price.toFixed(2)}</td>
                                            <td className="px-4 py-3"><StockBadge stock={p.available_stock} /></td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <Link href={`/admin/products/${p.id}/licenses`} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100" title="التراخيص">
                                                        <Key className="h-4 w-4" />
                                                    </Link>
                                                    <Link href={`/admin/products/${p.id}/edit`} className="rounded-md p-1.5 text-zinc-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950" title="تعديل">
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
                    )}

                    {(products?.last_page ?? 0) > 1 && (
                        <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
                            <span>
                                {products?.total} منتج — صفحة {products?.current_page} من {products?.last_page}
                            </span>
                            <div className="flex gap-2">
                                {products?.prev_page_url && (
                                    <Link
                                        href={products.prev_page_url}
                                        className="rounded-lg border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
                                    >
                                        السابق
                                    </Link>
                                )}
                                {products?.next_page_url && (
                                    <Link
                                        href={products.next_page_url}
                                        className="rounded-lg border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
                                    >
                                        التالي
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
