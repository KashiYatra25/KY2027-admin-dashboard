# Admin Dashboard — Refactor Guideline Audit

Audited: `lib/api/` structure against `.kiro/refactor-guidelines.md`
Scope: API hooks, constants, barrel exports, helper types, file organization.

---

## Summary

| # | Area | Status | Severity |
|---|------|--------|----------|
| 1 | `useCoupons.ts` — plain React Query + axios instead of wire-axon | ❌ FAIL | High |
| 2 | `sharedFeatureConfig` naming mismatch (`adminFeatureConfig`) | ❌ FAIL | High |
| 3 | `useApiMutation` hooks missing `toastConfig` (success + error) | ❌ FAIL | High |
| 4 | `useApiMutation` missing `bodyValidator` (zod) | ❌ FAIL | Medium |
| 5 | `useApiQuery` missing `gcTime` | ❌ FAIL | Medium |
| 6 | `useVerifyAdminCreds` / `useAdminLogout` — raw axios (acceptable auth exception, but inconsistent) | ⚠️ WARN | Low |
| 7 | Response type uses `data` indirection / inline response types | ⚠️ WARN | Low |
| 8 | Helper types/functions organization | ✅ PASS | — |
| 9 | One component / hook per file | ✅ PASS | — |
| 10 | No deprecated re-exports / aliases | ✅ PASS | — |

---

## Detailed Findings

### 1. ❌ `useCoupons.ts` uses plain React Query + axios (HIGH)

The guideline is explicit: REST GET → `useApiQuery`, REST POST/PATCH/DELETE → `useApiMutation` from `wire-axon/hooks`. `useCoupons.ts` instead uses raw `axios` wrapped in `@tanstack/react-query`'s `useQuery`/`useMutation`.

Current (non-compliant):
```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function fetchCoupons(): Promise<Coupon[]> {
  const response = await axios.get<CouponsListResponse>(`${BACKEND_URL}/admin/coupons`, {
    withCredentials: true,
    timeout: API_TIMEOUT,
  });
  return response.data.coupons ?? [];
}

export function useCoupons() {
  const { data, ... } = useQuery({ queryKey: ["coupons"], queryFn: fetchCoupons, ... });
}
```

Problems this creates:
- Bypasses the `RefreshTokenStrategy` (no automatic 401 → refresh → retry). Coupons calls rely only on the HttpOnly cookie and will NOT auto-refresh the access token like `useAdminUsers`/`useCAApplications` do.
- Inconsistent with the two already-migrated hooks.

Fix: rewrite `useCoupons`/`useCreateCoupon` with `useApiQuery`/`useApiMutation` + `adminFeatureConfig`, matching `useAdminUsers.ts`. Add `toastConfig`, `bodyValidator`, `gcTime`, `invalidateQueryName: "coupons"`. Rename file to `.tsx` (needed for customToast JSX).

---

### 2. ❌ `sharedFeatureConfig` naming mismatch (HIGH)

The guideline mandates the shared config be named `sharedFeatureConfig` and imported as:
```ts
import { BACKEND_URL, sharedFeatureConfig } from "@/lib/api/constants";
```

But `lib/api/constants/index.ts` defines it as `adminFeatureConfig`:
```ts
export const adminFeatureConfig = { withCredentials: true, auth: adminAuthStrategy };
```

And `lib/api/index.ts` re-exports a name that does not exist:
```ts
export { BACKEND_URL, API_TIMEOUT, sharedFeatureConfig } from "./constants"; // ❌ broken
```

Verified via `tsc`:
```
error TS2724: '"./lib/api/constants"' has no exported member named 'sharedFeatureConfig'.
Did you mean 'adminFeatureConfig'?
```

This is a broken barrel export. Any consumer importing `sharedFeatureConfig` from `@/lib/api` gets `undefined`.

Fix (pick one, be consistent everywhere):
- Rename `adminFeatureConfig` → `sharedFeatureConfig` in constants, update both migrated hooks, and keep `lib/api/index.ts` as-is. (Preferred — matches guideline wording.)
- Or change `lib/api/index.ts` to export `adminFeatureConfig`. (Fixes the break but diverges from guideline naming.)

---

### 3. ❌ `useApiMutation` hooks missing `toastConfig` (HIGH)

Guideline: "Every `useApiMutation` hook MUST have BOTH success and error toasts" using `customToast` components, and the file must be `.tsx`.

- `useInviteAdmin` (`useAdminUsers.ts`) — no `toastConfig`. File is `.ts`.
- `useApproveCA` (`useCAApplications.ts`) — no `toastConfig`. File is `.ts`.
- `useCreateCoupon` (`useCoupons.ts`) — no `toastConfig` (and not even wire-axon).

Fix: add `toastConfig: { successConfig: { customToast: ... }, errorConfig: { customToast: ... } }` with Default*Toast components, and rename the files to `.tsx`.

---

### 4. ❌ `useApiMutation` missing `bodyValidator` zod schema (MEDIUM)

Guideline: mutations must have `bodyValidator: { bodySchema: RequestSchema }`.

- `useInviteAdmin`, `useApproveCA`, `useCreateCoupon` — none define a zod `bodyValidator`.

Only `lib/api/utils/auth.schema.ts` has a zod schema (used by the raw-axios login hook). Add per-domain request schemas (e.g., `InviteAdminSchema`, `ApproveCASchema`, `CreateCouponSchema`) and pass them as `bodyValidator`.

---

### 5. ❌ `useApiQuery` queries missing `gcTime` (MEDIUM)

Guideline standard config: `retry: 3`, `staleTime: 5m`, `gcTime: 30m`.

- `useAdminUsers`: has `staleTime` + `retry: 3`, missing `gcTime`.
- `useCAApplications`: has `staleTime` + `retry: 3`, missing `gcTime`.

Also note both use `staleTime: 1000*60*2` (2m) rather than the documented 5m default — acceptable if intentional, but `gcTime` should still be added. Guideline shows these inside a `queryOptions: { ... }` block; current code passes them as top-level props — verify that matches the installed `wire-axon` API.

---

### 6. ⚠️ Auth hooks use raw axios (LOW / inconsistency)

`useVerifyAdminCreds.tsx` and `useAdminLogout.tsx` use raw `axios` + `@tanstack/react-query`. These are login/logout endpoints that intentionally sit outside the authed `RefreshTokenStrategy` (you can't refresh before you have a session), so raw axios is defensible. They DO correctly follow the toast + `.tsx` + `extractErrorMessage` conventions. `useRefreshToken.tsx` wraps a session refresh — also fine.

No change required, but document the exception so it isn't mistaken for the `useCoupons` violation.

---

### 7. ⚠️ Response typing / inline types (LOW)

- Response types `AdminUsersResponse`/`InviteAdminResponse` are declared inline in `useAdminUsers.ts` rather than in `lib/api/helper/types/admin.types.ts` (where `AdminUser`/`InviteAdminData` already live). `VerifyAdminCredsResponse` is also redefined inline in `useVerifyAdminCreds.tsx` even though a type of that name is exported from `helper/types`. Move/consolidate into the domain `.types.ts` files per guideline ("No inline type definitions that could be reused").
- Response shapes read `response.data.coupons`, `.admin`, etc. — the backend flat-response rule is a backend concern; the frontend types look flat (`{ info, admins }`) which is correct. No `data.data` indirection found. ✅

---

### 8. ✅ Helper types & functions organization (PASS)

`lib/api/helper/types/` uses `{domain}.types.ts` (`auth`, `admin`, `coupon`, `ca`) with an `index.ts` barrel (4 files → barrel justified). `lib/api/helper/functions/error.functions.ts` follows `{domain}.functions.ts`. Matches guideline layout exactly.

Minor: `functions/index.ts` has only 1 export (`extractErrorMessage`) — guideline says index files only when 3+ exports. Prefer importing `error.functions` directly until a 3rd function exists. Hooks already import the file directly, so the index is currently dead weight.

---

### 9. ✅ One component/hook per file (PASS)

Each hook lives in its own file; `hooks/index.ts` is a pure barrel. No multiple components crammed into one file in `lib/api`.

---

### 10. ✅ No deprecated re-exports / aliases (PASS)

No `@deprecated` aliases or backwards-compat re-exports found in `lib/api`. The only broken re-export is the `sharedFeatureConfig` name typo (Finding #2), which is a bug, not a deprecation alias.

---

## Recommended Fix Order

1. Fix `sharedFeatureConfig`/`adminFeatureConfig` naming (unblocks a broken barrel export). (#2)
2. Migrate `useCoupons.ts` → wire-axon `.tsx`. (#1)
3. Add `toastConfig` (success+error customToast) to all 3 mutations; rename those files to `.tsx`. (#3)
4. Add zod `bodyValidator` schemas to all mutations. (#4)
5. Add `gcTime` (and confirm `queryOptions` nesting) to all queries. (#5)
6. Move inline response types into `helper/types/*.types.ts`. (#7)
7. Drop the single-export `functions/index.ts` barrel. (#8 minor)

## Verification performed
- `npx tsc --noEmit` on a probe importing `sharedFeatureConfig` → `TS2724` confirms the broken export.
- `grep` confirmed only `useAdminUsers` and `useCAApplications` use wire-axon; `useCoupons` uses `@tanstack/react-query` + axios.
- Directory listing confirmed helper types layout and one-hook-per-file structure.
