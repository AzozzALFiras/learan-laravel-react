<?php

namespace App\Enums;

enum LicenseStatus: string
{
    case Available = 'available';
    case Sold      = 'sold';
}
