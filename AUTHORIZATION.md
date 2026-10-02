# Authorization Policy

The API and service layer are authoritative. Hiding controls in the UI is not an access-control boundary. Every permission check resolves the active user and organization from the HTTP-only session and current database record.

| Capability | ADMIN | MANAGER | STAFF |
| --- | --- | --- | --- |
| Read and create bookings; edit pending bookings; return items | Yes | Yes | Yes |
| Cancel bookings or force status transitions | Yes | Yes | No |
| Read and create/edit customers | Yes | Yes | Yes |
| Delete customers | Yes | Yes | No |
| Read inventory | Yes | Yes | Yes |
| Create, edit, or delete inventory | Yes | Yes | No |
| Read damage reports and report damage | Yes | Yes | Yes |
| Resolve damage reports | Yes | Yes | No |
| Read and manage deliveries | Yes | Yes | Yes |
| Read finance reports, payment history, and expenses | Yes | Yes | No |
| Record payments and expenses | Yes | Yes | Yes |
| Approve or record refunds | Yes | No | No |
| View booking-level rental totals and balances | Yes | Yes | Yes |
| Read settings | Yes | Yes | Yes |
| Change workspace settings, invitations, or members | Yes | No | No |
| Read and manage own notifications | Yes | Yes | Yes |
| Read audit logs | Yes | Yes | No |

Public registration always creates a new ADMIN-owned workspace. Existing workspaces may add users only through a single-use invitation addressed to the invited email. Invitations expire after seven days, are revocable, store only a SHA-256 token hash, and cannot grant ADMIN. Existing users and memberships are not rewritten by the invitation migration. Rental/deposit overpayments remain recorded as payments but allocations are capped at remaining obligations; the schema has no customer-credit ledger. Refunds must not exceed refundable deposit paid and only ADMIN may record them.