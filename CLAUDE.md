# Project Notes

## Admin Panel

- **Primary language is English.** All Admin (`/admin/*`) pages — headings, labels, buttons, table headers, badges, toasts, empty states, confirmation text — must be authored in English. Do not mix Arabic into Admin UI chrome.
- **Bilingual content fields are data, not UI.** Product / category records store both `name_ar` and `name_en`. Those values are rendered as data (use `dir="rtl"` on the Arabic span) but the surrounding UI stays English.
- **Customer-facing storefront is separate** and may use Arabic — this rule applies only to the Admin panel.
