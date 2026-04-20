import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Paginated, type ProductLicenseRow } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { WhenVisible } from '@inertiajs/react';
import { CheckCircle2, Key, Package, ShoppingBag, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Props {
    product: { id: number; name_ar: string; name_en: string };
    counts: { available: number; sold: number; total: number };
    licenses?: Paginated<ProductLicenseRow>;
    filters: { status?: string };
}

function StatPill({ label, value, tone }: { label: string; value: number; tone: 'emerald' | 'zinc' | 'blue' }) {
    const tones = {
        emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300',
        blue: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950 dark:text-blue-300',
        zinc: 'bg-zinc-100 text-zinc-700 ring-zinc-600/20 dark:bg-zinc-800 dark:text-zinc-300',
    } as const;
    return (
        <div className={`rounded-lg px-4 py-3 ring-1 ring-inset ${tones[tone]}`}>
            <p className="text-xs font-medium opacity-70">{label}</p>
            <p className="mt-0.5 text-2xl font-semibold">{value}</p>
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="animate-pulse overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-4 border-b border-zinc-100 px-6 py-4 last:border-0 dark:border-zinc-800">
                    {['w-48', 'w-20', 'w-28', 'w-12'].map((w, j) => (
                        <div key={j} className={`h-4 ${w} rounded bg-zinc-200 dark:bg-zinc-700`} />
                    ))}
                </div>
            ))}
        </div>
    );
}

function DeleteLicenseButton({ license }: { license: ProductLicenseRow }) {
    const [confirming, setConfirming] = useState(false);

    if (license.status !== 'available') {
        return <span className="text-xs text-zinc-400">—</span>;
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
            className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
        >
            <Trash2 className="h-4 w-4" />
        </button>
    );
}

export default function AdminProductLicenses({ product, counts, licenses, filters }: Props) {
    const [keys, setKeys] = useState('');
    const [submitting, setSubmitting] = useState(false);

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

    function setStatus(s?: string) {
        router.get(
            `/admin/products/${product.id}/licenses`,
            s ? { status: s } : {},
            { preserveState: true, replace: true },
        );
    }

    const currentStatus = filters.status ?? '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Licenses — ${product.name_en}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-sm">
                        <Key className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100" dir="rtl">
                            تراخيص: {product.name_ar}
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{product.name_en}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <StatPill label="متاح" value={counts.available} tone="emerald" />
                    <StatPill label="مباع" value={counts.sold} tone="blue" />
                    <StatPill label="الإجمالي" value={counts.total} tone="zinc" />
                </div>

                <form
                    onSubmit={submit}
                    className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900"
                >
                    <div className="mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4 text-zinc-400" />
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">إضافة مفاتيح ترخيص</h3>
                    </div>
                    <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
                        ألصق المفاتيح — مفتاح واحد في كل سطر. المفاتيح المكررة سيتم تخطيها.
                    </p>
                    <textarea
                        value={keys}
                        onChange={(e) => setKeys(e.target.value)}
                        rows={6}
                        placeholder={'XXXX-XXXXX-XXXXX\nYYYY-YYYYY-YYYYY\n...'}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                        dir="ltr"
                    />
                    <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {keys.split('\n').filter((l) => l.trim()).length} مفتاح جاهز للإضافة
                        </p>
                        <button
                            type="submit"
                            disabled={submitting || !keys.trim()}
                            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 disabled:opacity-50"
                        >
                            {submitting ? 'جاري الإضافة…' : 'إضافة المفاتيح'}
                        </button>
                    </div>
                </form>

                <div className="flex gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-700">
                    {[
                        { label: 'الكل', value: '' },
                        { label: 'متاح', value: 'available' },
                        { label: 'مباع', value: 'sold' },
                    ].map((t) => (
                        <button
                            key={t.value}
                            onClick={() => setStatus(t.value || undefined)}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                currentStatus === t.value
                                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <WhenVisible data="licenses" fallback={<TableSkeleton />}>
                    <div className="flex flex-col gap-4">
                    {(licenses?.data.length ?? 0) === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                            <Key className="h-10 w-10 text-zinc-400" />
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">لا توجد تراخيص.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <table className="w-full text-sm">
                                <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">المفتاح</th>
                                        <th className="px-6 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">الحالة</th>
                                        <th className="px-6 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">تاريخ البيع</th>
                                        <th className="px-6 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">أُضيف</th>
                                        <th className="px-6 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {licenses?.data.map((l) => (
                                        <tr key={l.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                                            <td className="px-6 py-4 font-mono text-zinc-900 dark:text-zinc-100">{l.license_key}</td>
                                            <td className="px-6 py-4">
                                                {l.status === 'available' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        متاح
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-950 dark:text-blue-300">
                                                        <ShoppingBag className="h-3 w-3" />
                                                        مباع
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{l.sold_at ?? '—'}</td>
                                            <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{l.created_at}</td>
                                            <td className="px-6 py-4">
                                                <DeleteLicenseButton license={l} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {(licenses?.last_page ?? 0) > 1 && (
                        <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
                            <span>
                                {licenses?.total} ترخيص — صفحة {licenses?.current_page} من {licenses?.last_page}
                            </span>
                            <div className="flex gap-2">
                                {licenses?.prev_page_url && (
                                    <Link
                                        href={licenses.prev_page_url}
                                        className="rounded-lg border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
                                    >
                                        السابق
                                    </Link>
                                )}
                                {licenses?.next_page_url && (
                                    <Link
                                        href={licenses.next_page_url}
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
