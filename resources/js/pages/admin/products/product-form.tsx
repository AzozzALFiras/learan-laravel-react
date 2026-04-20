import { type ProductCategory } from '@/types';
import { Link, router } from '@inertiajs/react';
import type { FormDataConvertible } from '@inertiajs/core';
import { ImagePlus, Languages, X } from 'lucide-react';
import { ChangeEvent, FormEvent, useRef, useState } from 'react';

export interface ProductFormValues {
    product_category_id: number | '';
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    price: number | '';
    is_active: boolean;
    image: File | null;
}

interface Props {
    categories: ProductCategory[];
    initial?: Partial<ProductFormValues>;
    initialImageUrl?: string | null;
    submitUrl: string;
    submitMethod: 'post' | 'patch';
    submitLabel: string;
}

export default function ProductForm({ categories, initial, initialImageUrl, submitUrl, submitMethod, submitLabel }: Props) {
    const [values, setValues] = useState<ProductFormValues>({
        product_category_id: initial?.product_category_id ?? '',
        name_ar: initial?.name_ar ?? '',
        name_en: initial?.name_en ?? '',
        description_ar: initial?.description_ar ?? '',
        description_en: initial?.description_en ?? '',
        price: initial?.price ?? '',
        is_active: initial?.is_active ?? true,
        image: null,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(initialImageUrl ?? null);
    const [lang, setLang] = useState<'ar' | 'en'>('ar');
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function update<K extends keyof ProductFormValues>(k: K, v: ProductFormValues[K]) {
        setValues((s) => ({ ...s, [k]: v }));
    }

    function handleImageFile(file: File | null) {
        update('image', file);
        setImagePreview(file ? URL.createObjectURL(file) : initialImageUrl ?? null);
    }

    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        handleImageFile(e.target.files?.[0] ?? null);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0] ?? null;
        if (file && file.type.startsWith('image/')) handleImageFile(file);
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        setProcessing(true);

        const payload: Record<string, FormDataConvertible> = {
            product_category_id: values.product_category_id,
            name_ar: values.name_ar,
            name_en: values.name_en,
            description_ar: values.description_ar,
            description_en: values.description_en,
            price: values.price,
            is_active: values.is_active ? 1 : 0,
        };
        if (values.image) payload.image = values.image;
        if (submitMethod === 'patch') payload._method = 'patch';

        router.post(submitUrl, payload, {
            forceFormData: true,
            onError: (errs) => setErrors(errs as Record<string, string>),
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
                    <div className="mb-4 flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                        <Languages className="h-4 w-4 text-zinc-400" />
                        <button
                            type="button"
                            onClick={() => setLang('ar')}
                            className={`rounded-md px-3 py-1 text-xs font-medium ${
                                lang === 'ar'
                                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                            }`}
                        >
                            عربي
                        </button>
                        <button
                            type="button"
                            onClick={() => setLang('en')}
                            className={`rounded-md px-3 py-1 text-xs font-medium ${
                                lang === 'en'
                                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                            }`}
                        >
                            English
                        </button>
                    </div>

                    {lang === 'ar' ? (
                        <div className="space-y-4" dir="rtl">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    اسم المنتج
                                </label>
                                <input
                                    type="text"
                                    value={values.name_ar}
                                    onChange={(e) => update('name_ar', e.target.value)}
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                                />
                                {errors.name_ar && <p className="mt-1 text-xs text-red-600">{errors.name_ar}</p>}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    وصف المنتج
                                </label>
                                <textarea
                                    rows={6}
                                    value={values.description_ar}
                                    onChange={(e) => update('description_ar', e.target.value)}
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                                />
                                {errors.description_ar && <p className="mt-1 text-xs text-red-600">{errors.description_ar}</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Product name
                                </label>
                                <input
                                    type="text"
                                    value={values.name_en}
                                    onChange={(e) => update('name_en', e.target.value)}
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                                />
                                {errors.name_en && <p className="mt-1 text-xs text-red-600">{errors.name_en}</p>}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Description
                                </label>
                                <textarea
                                    rows={6}
                                    value={values.description_en}
                                    onChange={(e) => update('description_en', e.target.value)}
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                                />
                                {errors.description_en && <p className="mt-1 text-xs text-red-600">{errors.description_en}</p>}
                            </div>
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
                    <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">التفاصيل</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                القسم
                            </label>
                            <select
                                value={values.product_category_id}
                                onChange={(e) => update('product_category_id', e.target.value ? Number(e.target.value) : '')}
                                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                            >
                                <option value="">— اختر قسمًا —</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name_ar} — {c.name_en}
                                    </option>
                                ))}
                            </select>
                            {errors.product_category_id && <p className="mt-1 text-xs text-red-600">{errors.product_category_id}</p>}
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                السعر (USD)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={values.price}
                                    onChange={(e) => update('price', e.target.value === '' ? '' : Number(e.target.value))}
                                    className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-7 pr-3 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                                />
                            </div>
                            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
                        </div>
                    </div>
                    <label className="mt-4 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                        <input
                            type="checkbox"
                            checked={values.is_active}
                            onChange={(e) => update('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                        />
                        المنتج نشط (ظاهر للعملاء)
                    </label>
                </div>
            </div>

            <div className="space-y-4">
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
                    <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">صورة المنتج</h3>

                    {imagePreview ? (
                        <div className="relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
                            <img src={imagePreview} alt="preview" className="h-48 w-full object-cover" />
                            <button
                                type="button"
                                onClick={() => {
                                    handleImageFile(null);
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <label
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragging(true);
                            }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            className={`flex h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors ${
                                dragging
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                                    : 'border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/50'
                            }`}
                        >
                            <ImagePlus className="h-8 w-8 text-zinc-400" />
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">اسحب الصورة هنا أو اضغط لاختيار ملف</p>
                            <p className="text-xs text-zinc-400">JPG / PNG / WebP — حتى 2MB</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    )}
                    {imagePreview && (
                        <>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-3 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            >
                                استبدال الصورة
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </>
                    )}
                    {errors.image && <p className="mt-2 text-xs text-red-600">{errors.image}</p>}
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 disabled:opacity-50"
                    >
                        {processing ? 'جاري الحفظ…' : submitLabel}
                    </button>
                    <Link
                        href="/admin/products"
                        className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        إلغاء
                    </Link>
                </div>
            </div>
        </form>
    );
}
