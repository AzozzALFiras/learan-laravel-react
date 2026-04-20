import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ProductCategory } from '@/types';
import { Head } from '@inertiajs/react';
import { PackagePlus } from 'lucide-react';
import ProductForm from './product-form';

interface Props {
    categories: ProductCategory[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Products', href: '/admin/products' },
    { title: 'New', href: '/admin/products/create' },
];

export default function AdminProductsCreate({ categories }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Product — Admin" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                        <PackagePlus className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                            New product
                        </h1>
                        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                            Create a bilingual product and upload its cover image.
                        </p>
                    </div>
                </div>

                <ProductForm
                    categories={categories}
                    submitUrl="/admin/products"
                    submitMethod="post"
                    submitLabel="Create product"
                />
            </div>
        </AppLayout>
    );
}
