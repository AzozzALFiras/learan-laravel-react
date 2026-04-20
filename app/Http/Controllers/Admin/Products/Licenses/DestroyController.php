<?php

namespace App\Http\Controllers\Admin\Products\Licenses;

use App\Enums\LicenseStatus;
use App\Http\Controllers\Controller;
use App\Models\ProductLicense;
use Illuminate\Http\RedirectResponse;

class DestroyController extends Controller
{
    public function __invoke(ProductLicense $license): RedirectResponse
    {
        if ($license->status !== LicenseStatus::Available) {
            return back()->with('error', 'Cannot delete a license that has already been sold.');
        }

        $license->delete();

        return back()->with('success', 'License deleted.');
    }
}
