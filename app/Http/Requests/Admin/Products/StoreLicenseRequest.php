<?php

namespace App\Http\Requests\Admin\Products;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreLicenseRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'keys' => ['required', 'string', 'max:100000'],
        ];
    }

    /**
     * @return array<int, string>
     */
    public function parsedKeys(): array
    {
        $raw = (string) $this->input('keys', '');

        return collect(preg_split('/\r\n|\r|\n/', $raw))
            ->map(fn ($line) => trim($line))
            ->filter(fn ($line) => $line !== '' && mb_strlen($line) >= 3 && mb_strlen($line) <= 255)
            ->unique()
            ->values()
            ->all();
    }
}
