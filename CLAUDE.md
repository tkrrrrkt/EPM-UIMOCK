# CLAUDE.md
# CCSDD / SDD Operating Guide for Claude Code

⚠️ IMPORTANT — SOURCE OF TRUTH NOTICE

This file is NOT a source of truth.

Authoritative documents for this project are:
- `.kiro/steering/*.md` (Project Constitution)
- `.kiro/specs/<context>/<feature>/*` (Feature Specifications)
- `.kiro/specs/仕様検討/*.md` (QA Discussion Records)
- `.kiro/specs/仕様概要/*.md` (Confirmed Spec Summaries)
- `packages/contracts/*` (Boundary Contracts SSoT)

If there is any conflict, ALWAYS defer to the documents above.
This file exists only to help Claude Code navigate and comply with them.

---

## 0. Project Context (Read-Only)

This repository is an **Enterprise Performance Management (EPM) SaaS** built with
**CCSDD (Contract-Centered Specification Driven Development)**.

Core goals:
- SSoT-driven architecture (specs > contracts > code)
- Contracts-first boundaries
- Multi-tenant SaaS with strict governance (RLS, auditability)
- UI generated with v0, isolated and migrated safely
- AI is an assistant, not a decision-maker

Product intent, scope, and AI philosophy are defined in:
- `.kiro/steering/product.md`

---

## 1. Golden Rules (NON-NEGOTIABLE)

1. **SSoT is `.kiro/` and `packages/contracts/`**
   - Code is always subordinate to specifications and contracts.
2. **Contracts-first order**
   - contracts → database → domain API → BFF → UI
3. **cc-sdd workflow is mandatory**
   - Do NOT skip steps or hand-roll specs.
4. **Strict layer boundaries**
   - UI → BFF only
   - BFF → Domain API allowed
   - UI must NEVER import API contracts
5. **Multi-tenant enforcement**
   - All data access requires `tenant_id`
   - RLS must be enabled and never bypassed
6. **If unsure**
   - Stop, inspect `.kiro/steering/` and `.kiro/specs/`
   - Propose spec changes BEFORE code changes

---

## 2. Required CCSDD Workflow (ALWAYS follow this order)

All feature work for `<context>/<feature>` MUST follow:

1. `/kiro:spec-init "<context>/<feature>"`
2. `/kiro:spec-requirements "<context>/<feature>"`
3. `/kiro:spec-design "<context>/<feature>"`
4. `/kiro:spec-tasks "<context>/<feature>"`
5. Implement **ONE task at a time** from `tasks.md`

Before writing or modifying any code:
- Read `requirements.md`
- Then `design.md`
- Then `tasks.md`

If any section is missing or ambiguous:
→ Update the spec first.  
→ Never “fill gaps” with assumptions in code.

Canonical definition of this workflow:
- `.kiro/steering/development-process.md`

---

## 3. v0 UI Generation Rules (Two-Phase)

Source of truth:
- `.kiro/steering/v0-workflow.md`
- `.kiro/steering/epm-design-system.md`

### Phase 1: UI-MOCK (Isolation)
- Generate UI ONLY under:
  - `apps/web/_v0_drop/<context>/<feature>/src`
- Use `MockBffClient`
- No production imports
- No domain logic

### Phase 2: UI-BFF (Migration)
- Migrate validated UI to:
  - `apps/web/src/features/<context>/<feature>/`
- Replace mock with `HttpBffClient`
- Enforce BFF contracts and error mapping

Never:
- Write v0 output directly into `apps/web/src`
- Call Domain API from UI
- Implement business rules in UI

---

## 4. Boundary & Import Rules

### UI (apps/web)
- Allowed:
  - `packages/contracts/src/bff`
  - `@/shared/ui`
- Forbidden:
  - `packages/contracts/src/api`
  - Direct fetch outside `HttpBffClient`

### BFF (apps/bff)
- Uses BFF contracts
- May import API contracts
- No domain logic beyond mapping/aggregation

### Domain API (apps/api)
- Business logic authority
- Enforces tenant isolation
- Uses API contracts only

Canonical structure rules:
- `.kiro/steering/structure.md`
- `.kiro/steering/tech.md`

---

## 5. Design System Rules (UI)

Design System SSoT:
- `.kiro/steering/epm-design-system.md`

Rules:
- Use semantic tokens only
- No raw color literals
- No arbitrary spacing values
- Respect Tier 1 / 2 / 3 component policy
- Never recreate base UI components in features

---

## 6. What NOT To Do (Common Failures)

- Do NOT implement code before contracts/specs exist
- Do NOT infer missing requirements
- Do NOT bypass RLS or tenant filters
- Do NOT treat this file as authoritative spec
- Do NOT generate large refactors without spec updates

---

## 7. When in Doubt

If there is any uncertainty:
1. Open `.kiro/steering/development-process.md`
2. Check the relevant `.kiro/specs/<context>/<feature>/`
3. Propose clarification or update specs
4. Then proceed with implementation

Claude Code must behave as a **strict CCSDD operator**, not an autonomous designer.
