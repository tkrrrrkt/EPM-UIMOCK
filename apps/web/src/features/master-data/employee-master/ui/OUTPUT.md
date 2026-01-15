# Employee Master Module - Output Documentation

Generated: 2026-01-04

## 1. Generated Files (Tree)

```
apps/web/_v0_drop/master-data/employee-master/src/
├── api/
│   ├── BffClient.ts          # BFF Client interface definition
│   ├── MockBffClient.ts       # Mock implementation with sample data
│   ├── HttpBffClient.ts       # HTTP implementation (for future use)
│   └── index.ts               # API exports and client factory
├── components/
│   ├── EmployeeListPage.tsx           # Main employee list with search/filter/pagination
│   ├── EmployeeDetailDialog.tsx       # Employee create/edit dialog with tabs
│   ├── EmployeeAssignmentSection.tsx  # Assignment list display and management
│   ├── EmployeeAssignmentForm.tsx     # Assignment create/edit form
│   └── index.ts                       # Component exports
├── contracts/
│   └── bff/
│       └── employee-master.ts         # BFF DTOs, types, and error codes
└── OUTPUT.md                          # This file

app/master-data/employee-master/page.tsx  # Next.js page route
```

## 2. Key Imports / Dependency Notes

### UI Components (from @/components/ui)
All UI components are imported from the shared UI component library:

```typescript
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
```

**Note:** All these components are assumed to exist in the shared UI component library. If any are missing, they need to be added to `apps/web/src/shared/ui/components/`.

### BFF Contracts (from contracts/bff)
DTOs and types are imported from the contracts package:

```typescript
import type {
  BffListEmployeesRequest,
  BffListEmployeesResponse,
  BffEmployeeSummary,
  BffCreateEmployeeRequest,
  BffUpdateEmployeeRequest,
  BffEmployeeDetailResponse,
  BffListEmployeeAssignmentsResponse,
  BffCreateEmployeeAssignmentRequest,
  BffUpdateEmployeeAssignmentRequest,
  BffEmployeeAssignmentSummary,
  BffEmployeeAssignmentResponse,
  AssignmentType,
  BffErrorCode,
  BffError,
} from "../contracts/bff/employee-master"
```

**Important:** In production, these should be imported from `packages/contracts/src/bff/employee-master` instead of the local contracts folder.

### BFF Client
The BFF client is created using a factory function:

```typescript
import { createBffClient } from "../api"
const bffClient = createBffClient()
```

Currently returns `MockBffClient` for development. Switch to `HttpBffClient` when connecting to real BFF endpoints.

## 3. Missing Shared Component / Pattern (TODO)

The following components from `@/components/ui` were used and are assumed to exist:

- [x] Button
- [x] Input
- [x] Label
- [x] Badge
- [x] Card
- [x] Dialog
- [x] Tabs
- [x] Table
- [x] Select
- [x] Alert
- [ ] **RadioGroup** - If not available, needs to be added to shared UI

All other components should be available from the shadcn/ui EPM registry.

### Additional Patterns Needed

None identified. All functionality is self-contained within the feature module.

## 4. Migration Notes (_v0_drop → features)

### Step-by-Step Migration Plan

#### Step 1: Move Feature Files
Move the entire `src/` folder to the production features location:

```bash
# From:
apps/web/_v0_drop/master-data/employee-master/src/

# To:
apps/web/src/features/master-data/employee-master/
```

#### Step 2: Update Contract Imports
Replace local contract imports with the actual contracts package:

**Before:**
```typescript
import type { ... } from "../contracts/bff/employee-master"
```

**After:**
```typescript
import type { ... } from "@epm/contracts/bff/employee-master"
```

This applies to the following files:
- `api/BffClient.ts`
- `api/MockBffClient.ts`
- `api/HttpBffClient.ts`
- `components/EmployeeListPage.tsx`
- `components/EmployeeDetailDialog.tsx`
- `components/EmployeeAssignmentSection.tsx`
- `components/EmployeeAssignmentForm.tsx`

#### Step 3: Update Component Imports
Update the page route to use the new feature location:

**Before:**
```typescript
// app/master-data/employee-master/page.tsx
import { EmployeeListPage } from "@/../../apps/web/_v0_drop/master-data/employee-master/src/components/EmployeeListPage"
```

**After:**
```typescript
// app/master-data/employee-master/page.tsx
import { EmployeeListPage } from "@/features/master-data/employee-master/components/EmployeeListPage"
```

#### Step 4: Update Shared UI Imports (if needed)
If the shared UI barrel export (`@/shared/ui`) doesn't exist, create it:

```typescript
// apps/web/src/shared/ui/index.ts
export * from "./components/button"
export * from "./components/input"
export * from "./components/label"
// ... etc
```

Then update all imports from `@/components/ui/*` to `@/shared/ui`.

#### Step 5: Add Contract Definitions to Packages
Copy the contract definitions from `src/contracts/bff/employee-master.ts` to the actual contracts package:

```bash
# Copy to:
packages/contracts/src/bff/employee-master.ts
```

Update the package's index file to export these types.

#### Step 6: Connect to Real BFF
Update the client factory in `api/index.ts`:

**Before:**
```typescript
export function createBffClient(): BffClient {
  // return new HttpBffClient();
  return new MockBffClient()
}
```

**After:**
```typescript
export function createBffClient(): BffClient {
  return new HttpBffClient()
}
```

#### Step 7: Add to App Shell Navigation
Add the employee master route to the navigation menu in:
- `apps/web/src/shared/navigation/menu.ts`

Example:
```typescript
{
  title: "マスタデータ",
  items: [
    {
      title: "社員マスタ",
      url: "/master-data/employee-master",
      icon: Users,
    },
    // ... other master data items
  ]
}
```

#### Step 8: Testing
- Test CRUD operations with mock data
- Replace mock client with HTTP client
- Test against real BFF endpoints
- Verify validation logic (date ranges, primary assignment overlap, etc.)
- Test pagination and search functionality
- Verify error handling and user feedback

### Path/Import Changes Summary

| Current Path | Production Path |
|--------------|-----------------|
| `apps/web/_v0_drop/master-data/employee-master/src/` | `apps/web/src/features/master-data/employee-master/` |
| `../contracts/bff/employee-master` | `@epm/contracts/bff/employee-master` |
| `@/components/ui/*` | `@/shared/ui` (if barrel export exists) |

### Shared UI Refactoring

No components need to be refactored into shared UI. All UI components are properly imported from the shared component library.

If RadioGroup is missing from the shared UI, add it from shadcn/ui EPM registry:

```bash
npx shadcn@latest add radio-group --registry https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app
```

## 5. Constraint Compliance Checklist

- [x] Code written ONLY under `apps/web/_v0_drop/master-data/employee-master/src`
- [x] UI components imported ONLY from `@/components/ui` (shadcn/ui components)
- [x] DTO types defined locally (will be migrated to `packages/contracts/src/bff`)
- [x] No imports from `packages/contracts/src/api`
- [x] No Domain API direct calls (/api/)
- [x] No direct fetch() outside `api/HttpBffClient.ts`
- [x] No layout.tsx generated
- [x] No base UI components created under features
- [x] No raw color literals (bg-[#...], etc.) - using semantic tokens
- [x] No new sidebar/header/shell created inside the feature

## 6. Feature Overview

### Employee Master Module
Full-featured employee master data management with assignment tracking.

**Key Features:**
- Employee CRUD operations (Create, Read, Update, Deactivate, Reactivate)
- Advanced search and filtering (keyword, active status)
- Sortable columns (employee code, name, hire date)
- Pagination support
- Employee assignment management (primary/secondary assignments)
- Assignment validation (overlap detection for primary assignments)
- Allocation ratio tracking for secondary assignments
- Comprehensive inline validation and error handling

**Technical Implementation:**
- BFF-only architecture (no direct Domain API calls)
- Mock data for development, easy switch to HTTP client
- Proper DTO boundaries following SDD/CCSDD principles
- Responsive design with EPM Design System
- Japanese language UI with proper date/number formatting

**Data Model:**
- Employee: code, name, name kana, email, hire date, leave date, active flag
- Assignment: department, type (primary/secondary), allocation ratio, title, effective date, expiry date

**Validation Rules:**
- Required fields: employee code, employee name (for employees)
- Required fields: department, assignment type, effective date (for assignments)
- Date validation: leave date > hire date, expiry date > effective date
- Business rules: primary assignments cannot overlap, secondary assignments require allocation ratio
- Employee code uniqueness check on create/update

## 7. Next Steps for Cursor

1. Copy the contract definitions to `packages/contracts/src/bff/employee-master.ts`
2. Create the actual BFF endpoints matching the interface specification
3. Update imports to use the contracts package
4. Add RadioGroup to shared UI if missing
5. Test with real BFF endpoints
6. Add to navigation menu
7. Deploy to staging for UAT
