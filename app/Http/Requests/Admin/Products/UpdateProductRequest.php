<?php

namespace App\Http\Requests\Admin\Products;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_category_id' => ['required', 'integer', 'exists:product_categories,id'],
            'name_ar'             => ['required', 'string', 'max:255'],
            'name_en'             => ['required', 'string', 'max:255'],
            'description_ar'      => ['nullable', 'string', 'max:5000'],
            'description_en'      => ['nullable', 'string', 'max:5000'],
            'price'               => ['required', 'numeric', 'min:0'],
            'is_active'           => ['nullable', 'boolean'],
            'image'               => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => filter_var($this->is_active ?? true, FILTER_VALIDATE_BOOLEAN),
        ]);
    }
}
