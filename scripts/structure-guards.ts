#!/usr/bin/env node
/**
 * structure-guards.ts
 *
 * Run (recommended):
 *   npx tsx scripts/structure-guards.ts
 *
 * Enforces (fail-fast):
 *  - UI must NOT reference packages/contracts/src/api
 *  - UI must NOT call Domain API directly (must call BFF only)
 *  - UI must NOT use fetch() directly except inside feature api/HttpBffClient.ts
 *  - v0 drop must NOT contain forbidden references (contracts/api, /api/)
 *  - v0 drop must keep all source files under apps/web/_v0_drop/<context>/<feature>/src/**
 *  - v0 drop must NOT generate layout.tsx (AppShell is the only shell)
 *  - BFF must NOT access DB directly (Prisma/DB-client hints)
 *
 * Also checks (soft / bootstrap-friendly):
 *  - UI SHOULD reference packages/contracts/src/bff somewhere (to avoid “no-contract UI” drift)
 *    -> Currently treated as WARNING. Upgrade to FAIL after first feature uses BFF DTOs.
 *
 * Adds warnings (non-blocking):
 *  - Base UI-like components must not be created under apps/web/src/features/**
 *  - Raw Tailwind color literals like bg-[#...] / text-[#...] / border-[#...] should not be used
 *  - Shell-like components (sidebar/header/layout) should not be created under features/**
 *  - layout.tsx under features/** is discouraged (start as WARN; consider upgrading to FAIL later)
 */

import fs from "node:fs";
import path from "node:path";

type Violation = {
  ruleId: string;
  file: string;
  line: number;
  message: string;
  snippet?: string;
};

type Warning = {
  ruleId: string;
  file: string;
  message: string;
  detail?: string;
};

const repoRoot = process.cwd();

const TARGET_DIRS = ["apps/web/src", "apps/web/_v0_drop", "apps/bff/src", "apps/api/src"];
const IGNORE_DIR_PARTS = ["node_modules", ".next", "dist", "build", ".turbo", ".git", "coverage"];
const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

function isIgnored(p: string) {
  return IGNORE_DIR_PARTS.some((x) => p.split(path.sep).includes(x));
}

function walk(dirAbs: string, out: string[] = []) {
  for (const ent of fs.readdirSync(dirAbs, { withFileTypes: true })) {
    const p = path.join(dirAbs, ent.name);
    if (isIgnored(p)) continue;
    if (ent.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function rel(pAbs: string) {
  return path.relative(repoRoot, pAbs).replaceAll("\\", "/");
}

function readLines(pAbs: string) {
  return fs.readFileSync(pAbs, "utf8").split(/\r?\n/);
}

function scanFile(fileAbs: string): Violation[] {
  const r = rel(fileAbs);
  const ext = path.extname(fileAbs);
  if (!EXT.has(ext)) return [];

  const lines = readLines(fileAbs);
  const v: Violation[] = [];

  const isWebSrc = r.startsWith("apps/web/src/");
  const isWebV0Drop = r.startsWith("apps/web/_v0_drop/");
  const isBff = r.startsWith("apps/bff/");

  const push = (ruleId: string, i: number, message: string) => {
    v.push({ ruleId, file: r, line: i + 1, message, snippet: lines[i]?.slice(0, 180) });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // UI must not reference contracts/api
    if (isWebSrc) {
      if (line.includes("packages/contracts/src/api") || /contracts\/src\/api/.test(line)) {
        push(
          "UI_NO_CONTRACTS_API",
          i,
          "UI must NOT reference packages/contracts/src/api. Use packages/contracts/src/bff only."
        );
      }
    }

    // UI must not call Domain API directly
    if (isWebSrc) {
      // Prefer catching URL-like usage patterns (reduces false positives)
      const urlLikeApi =
        /(fetch|axios\.|ky\.|got\.|request\(|new\s+URL\()/.test(line) && /['"`]\/api\//.test(line);
      const importAppsApi =
        /^\s*import\s+.*from\s+['"`].*apps\/api/.test(line) || /from\s+['"`].*apps\/api/.test(line);

      if (urlLikeApi || importAppsApi || /DOMAIN_API/i.test(line)) {
        push("UI_NO_DOMAIN_API_DIRECT", i, "UI must NOT call Domain API directly. UI must call BFF only.");
      }
    }

    // UI must not use fetch directly (except HttpBffClient.ts)
    if (isWebSrc) {
      const allowed = r.endsWith("/api/HttpBffClient.ts");
      if (line.includes("fetch(") && !allowed) {
        push("UI_NO_DIRECT_FETCH", i, "Direct fetch() is prohibited in UI. Use HttpBffClient only.");
      }
    }

    // v0 drop should not import contracts/api or call /api (except /api/bff/)
    if (isWebV0Drop) {
      if (
        line.includes("packages/contracts/src/api") ||
        /contracts\/src\/api/.test(line) ||
        (/['"`]\/api\//.test(line) && !/['"`]\/api\/bff\//.test(line))
      ) {
        push("V0_DROP_FORBIDDEN", i, "v0 drop contains forbidden references. Fix before migrating into apps/web/src.");
      }
    }

    // BFF must not access DB directly (Prisma/DB-client hints)
    if (isBff) {
      const prismaHints =
        /PrismaClient/.test(line) || /@prisma\/client/.test(line) || /from\s+['"`].*prisma/i.test(line);
      const otherDbHints = /from\s+['"`](pg|mysql2|typeorm|knex|kysely|drizzle-orm|better-sqlite3)/i.test(line);

      if (prismaHints || otherDbHints) {
        push("BFF_NO_DB_DIRECT", i, "BFF must NOT access DB directly. BFF must call Domain API only.");
      }
    }
  }

  return v;
}

function main() {
  const violations: Violation[] = [];
  const warnings: Warning[] = [];

  // Soft check support: does UI reference contracts/bff anywhere?
  let uiReferencesContractsBff = false;

  // WARN rules (Design System / Shell integrity)
  const BASE_UI_NAMES = new Set([
    "button.tsx",
    "input.tsx",
    "textarea.tsx",
    "table.tsx",
    "dialog.tsx",
    "tabs.tsx",
    "badge.tsx",
    "select.tsx",
    "dropdown-menu.tsx",
    "popover.tsx",
    "tooltip.tsx",
    "checkbox.tsx",
    "switch.tsx",
    "radio-group.tsx",
    "pagination.tsx",
    "breadcrumb.tsx",
    "alert.tsx",
    "alert-dialog.tsx",
    "toast.tsx",
    "toaster.tsx",
    "sonner.tsx",
  ]);

  const SHELL_LIKE_NAMES = new Set(["sidebar.tsx", "header.tsx", "layout.tsx", "appshell.tsx", "app-shell.tsx"]);

  const RAW_COLOR_LITERAL_RE = /(bg|text|border)-\[#([0-9a-fA-F]{3,8})\]/;

  for (const dir of TARGET_DIRS) {
    const abs = path.join(repoRoot, dir);
    if (!fs.existsSync(abs)) continue;

    for (const f of walk(abs)) {
      const r = rel(f);
      const ext = path.extname(f);
      if (!EXT.has(ext)) continue;

      // FAIL: enforce v0-drop isolation structure
      // - Only allow source files under apps/web/_v0_drop/<context>/<feature>/src/**
      if (r.startsWith("apps/web/_v0_drop/")) {
        if (!/apps\/web\/_v0_drop\/.*\/src\//.test(r)) {
          violations.push({
            ruleId: "V0_DROP_OUTSIDE_SRC",
            file: r,
            line: 1,
            message: "v0 drop must place source files under apps/web/_v0_drop/<context>/<feature>/src/** only.",
            snippet: r,
          });
        }

        // FAIL: forbid layout shell generation inside v0 drop
        const bn = path.basename(r).toLowerCase();
        if (bn === "layout.tsx") {
          violations.push({
            ruleId: "V0_DROP_NO_LAYOUT",
            file: r,
            line: 1,
            message: "Do NOT generate layout.tsx in v0 drop. AppShell is the only shell.",
            snippet: r,
          });
        }
      }

      // detect contracts/bff reference in web/src
      if (r.startsWith("apps/web/src/")) {
        const text = fs.readFileSync(f, "utf8");
        if (text.includes("packages/contracts/src/bff") || /contracts\/src\/bff/.test(text)) {
          uiReferencesContractsBff = true;
        }

        // WARN: raw color literals like bg-[#...]
        if (RAW_COLOR_LITERAL_RE.test(text)) {
          warnings.push({
            ruleId: "WARN_RAW_COLOR_LITERAL",
            file: r,
            message: "Raw color literal detected (e.g., bg-[#...]). Prefer semantic tokens/classes.",
            detail: "Use tokens / CSS variables / Tailwind semantic classes (bg-primary, text-muted-foreground, etc.).",
          });
        }
      }

      // WARN: base UI component files accidentally created under features/**
      if (r.startsWith("apps/web/src/features/")) {
        const bn = path.basename(r);

        if (BASE_UI_NAMES.has(bn)) {
          warnings.push({
            ruleId: "WARN_BASE_UI_UNDER_FEATURES",
            file: r,
            message: "Base UI-like component found under features/** (should live in shared/ui/components).",
            detail: `Move it to apps/web/src/shared/ui/components/${bn} and update Tier policy if needed.`,
          });
        }

        // WARN: shell-like components under features/**
        const bnLower = bn.toLowerCase();
        if (SHELL_LIKE_NAMES.has(bnLower)) {
          warnings.push({
            ruleId: "WARN_SHELL_LIKE_UNDER_FEATURES",
            file: r,
            message: "Shell-like component found under features/** (sidebar/header/layout should be in shared/shell).",
            detail: "Prefer apps/web/src/shared/shell/AppShell.tsx and shared/navigation/menu.ts.",
          });
        }

        // WARN: layout.tsx under features/** (start as WARN; consider upgrading to FAIL later)
        if (bnLower === "layout.tsx") {
          warnings.push({
            ruleId: "WARN_FEATURES_NO_LAYOUT",
            file: r,
            message: "layout.tsx under features/** is discouraged. Features should not create shells.",
            detail: "Use shared/shell/AppShell.tsx. Keep routes thin: page.tsx + feature components only.",
          });
        }
      }

      violations.push(...scanFile(f));
    }
  }

  // Soft check (bootstrap: WARNING)
  if (fs.existsSync(path.join(repoRoot, "apps/web/src")) && !uiReferencesContractsBff) {
    warnings.push({
      ruleId: "WARN_UI_SHOULD_USE_CONTRACTS_BFF",
      file: "apps/web/src",
      message:
        "UI should reference packages/contracts/src/bff (contracts-first). In bootstrap phase this is WARNING. Switch to FAIL after first feature uses BFF DTOs.",
      detail:
        "Once a feature is migrated (apps/web/src/features/**) and uses contracts/bff DTOs, upgrade this check to FAIL.",
    });
  }

  if (violations.length === 0) {
    console.log("✅ Structure Guards: OK (no violations)");

    if (warnings.length) {
      console.warn("\n⚠️  Structure Guards: warnings (non-blocking)\n");
      for (const w of warnings) {
        console.warn(`- [${w.ruleId}] ${w.file} ${w.message}`);
        if (w.detail) console.warn(`  > ${w.detail}`);
      }
      console.warn("");
    }

    process.exit(0);
  }

  console.error("❌ Structure Guards: violations found\n");
  for (const vv of violations) {
    console.error(`- [${vv.ruleId}] ${vv.file}:${vv.line} ${vv.message}`);
    if (vv.snippet) console.error(`  > ${vv.snippet.trim()}`);
  }

  if (warnings.length) {
    console.warn("\n⚠️  Structure Guards: warnings (non-blocking)\n");
    for (const w of warnings) {
      console.warn(`- [${w.ruleId}] ${w.file} ${w.message}`);
      if (w.detail) console.warn(`  > ${w.detail}`);
    }
    console.warn("");
  }

  process.exit(1);
}

main();
