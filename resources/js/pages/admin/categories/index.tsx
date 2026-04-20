import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ProductCategory } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { WhenVisible } from '@inertiajs/react';
import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Props {
    categories?: ProductCategory[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Categories', href: '/admin/categories' },
];

function TableSkeleton() {
    return (
        <div className="animate-pulse overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
            <div className="flex gap-4 border-b border-zinc-200 bg-zinc-50 px-6 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
                {['w-36', 'w-48', 'w-16', 'w-24', 'w-16'].map((w, i) => (
                    <div key={i} className={`h-4 ${w} rounded bg-zinc-200 dark:bg-zinc-600`} />
                ))}
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 border-b border-zinc-100 px-6 py-4 last:border-0 dark:border-zinc-800">
                    {['w-36', 'w-48', 'w-16', 'w-24', 'w-16'].map((w, j) => (
                        <div key={j} className={`h-4 ${w} rounded bg-zinc-100 dark:bg-zinc-800`} />
                    ))}
                </div>
            ))}
        </div>
    );
}

type DialogMode = { type: 'closed' } | { type: 'create' } | { type: 'edit'; category: ProductCategory };

function CategoryDialog({ mode, onClose }: { mode: DialogMode; onClose: () => void }) {
    const isEdit = mode.type === 'edit';
    const initial = isEdit ? mode.category : { name_ar: '', name_en: '' };

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name_ar: initial.name_ar ?? '',
        name_en: initial.name_en ?? '',
    });

    if (mode.type === 'closed') return null;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                <div className="mb-5">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {isEdit ? 'تعديل القسم / Edit Category' : 'إضافة قسم جديد / New Category'}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">املأ الحقول باللغتين.</p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            الاسم بالعربي
                        </label>
                        <input
                            type="text"
                            dir="rtl"
                            value={data.name_ar}
                            onChange={(e) => setData('name_ar', e.target.value)}
                            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                            autoFocus
                        />
                        {errors.name_ar && <p className="mt-1 text-xs text-red-600">{errors.name_ar}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Name (English)
                        </label>
                        <input
                            type="text"
                            value={data.name_en}
                            onChange={(e) => setData('name_en', e.target.value)}
                            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                        {errors.name_en && <p className="mt-1 text-xs text-red-600">{errors.name_en}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 disabled:opacity-50"
                        >
                            {processing ? 'جاري الحفظ…' : isEdit ? 'تحديث' : 'إضافة'}
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
            <span className="text-xs text-zinc-400" title="لا يمكن حذف قسم به منتجات">
                —
            </span>
        );
    }

    if (confirming) {
        return (
            <div className="flex items-center gap-2">
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

export default function AdminCategoriesIndex({ categories }: Props) {
    const [dialog, setDialog] = useState<DialogMode>({ type: 'closed' });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories — Admin" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                            <FolderTree className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">أقسام المنتجات</h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                نظّم منتجاتك الرقمية داخل أقسام ثنائية اللغة.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setDialog({ type: 'create' })}
                        className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                    >
                        <Plus className="h-4 w-4" />
                        قسم جديد
                    </button>
                </div>

                <WhenVisible data="categories" fallback={<TableSkeleton />}>
                    {(categories?.length ?? 0) === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                            <FolderTree className="h-10 w-10 text-zinc-400" />
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">لا توجد أقسام بعد.</p>
                            <button
                                onClick={() => setDialog({ type: 'create' })}
                                className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
                            >
                                إضافة أول قسم
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <table className="w-full text-sm">
                                <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
                                    <tr>
                                        <th className="px-6 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">الاسم عربي</th>
                                        <th className="px-6 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Name (EN)</th>
                                        <th className="px-6 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Slug</th>
                                        <th className="px-6 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">المنتجات</th>
                                        <th className="px-6 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">أُنشئ</th>
                                        <th className="px-6 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {categories?.map((c) => (
                                        <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                                            <td className="px-6 py-4 text-right font-medium text-zinc-900 dark:text-zinc-100" dir="rtl">
                                                {c.name_ar}
                                            </td>
                                            <td className="px-6 py-4 text-zinc-700 dark:text-zinc-200">{c.name_en}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">{c.slug}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300">
                                                    {c.products_count ?? 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{c.created_at}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setDialog({ type: 'edit', category: c })}
                                                        className="rounded p-1 text-zinc-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
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
                    )}
                </WhenVisible>
            </div>

            <CategoryDialog mode={dialog} onClose={() => setDialog({ type: 'closed' })} />
        </AppLayout>
    );
}
