import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ProductCategory } from '@/types';
import { Head } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import ProductForm from './product-form';

interface ProductPayload {
    id: number;
    product_category_id: number;
    name_ar: string;
    name_en: string;
    description_ar: string | null;
    description_en: string | null;
    price: number;
    is_active: boolean;
    image_url: string | null;
}

interface Props {
    product: ProductPayload;
    categories: ProductCategory[];
}

export default function AdminProductsEdit({ product, categories }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Products', href: '/admin/products' },
        { title: product.name_en, href: `/admin/products/${product.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${product.name_en} — Admin`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm">
                        <Pencil className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100" dir="rtl">
                            تعديل: {product.name_ar}
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{product.name_en}</p>
                    </div>
                </div>

                <ProductForm
                    categories={categories}
                    initial={{
                        product_category_id: product.product_category_id,
                        name_ar: product.name_ar,
                        name_en: product.name_en,
                        description_ar: product.description_ar ?? '',
                        description_en: product.description_en ?? '',
                        price: product.price,
                        is_active: product.is_active,
                    }}
                    initialImageUrl={product.image_url}
                    submitUrl={`/admin/products/${product.id}`}
                    submitMethod="patch"
                    submitLabel="حفظ التعديلات"
                />
            </div>
        </AppLayout>
    );
}
