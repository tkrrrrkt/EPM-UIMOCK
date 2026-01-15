#!/usr/bin/env node
/**
 * v0-migrate.ts
 *
 * Run (recommended):
 *   npx tsx scripts/v0-migrate.ts <context> <feature> [--force]
 *   e.g. npx tsx scripts/v0-migrate.ts master-data employee-master
 *
 * Copies:
 *   apps/web/_v0_drop/<context>/<feature>/src/*
 * into:
 *   apps/web/src/features/<context>/<feature>/ui/
 *
 * Safety:
 *  - Refuses to overwrite existing files unless --force is given.
 *
 * Recommended workflow:
 *  1) Generate UI with v0 into _v0_drop (isolation)
 *  2) Fix obvious violations INSIDE _v0_drop (no contracts/api, no /api, no direct fetch in UI)
 *  3) Run this migrate script
 *  4) Run structure-guards again (must pass)
 */

import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function copyDir(src: string, dst: string, force: boolean) {
  ensureDir(dst);

  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name);
    const d = path.join(dst, ent.name);

    if (ent.isDirectory()) {
      copyDir(s, d, force);
      continue;
    }

    if (fs.existsSync(d) && !force) {
      throw new Error(`Refusing to overwrite existing file: ${path.relative(repoRoot, d)} (use --force)`);
    }

    fs.copyFileSync(s, d);
  }
}

function main() {
  const args = process.argv.slice(2);
  const context = args[0];
  const feature = args[1];
  const force = args.includes("--force");

  if (!context || !feature) {
    console.error("Usage: npx tsx scripts/v0-migrate.ts <context> <feature> [--force]");
    process.exit(1);
  }

  const src = path.join(repoRoot, `apps/web/_v0_drop/${context}/${feature}/src`);
  const dst = path.join(repoRoot, `apps/web/src/features/${context}/${feature}/ui`);

  if (!fs.existsSync(src)) {
    console.error(`Source does not exist: apps/web/_v0_drop/${context}/${feature}/src`);
    process.exit(1);
  }

  ensureDir(dst);
  copyDir(src, dst, force);

  console.log("✅ v0 migrate done:");
  console.log(`- from: ${path.relative(repoRoot, src)}`);
  console.log(`- to  : ${path.relative(repoRoot, dst)}`);
  console.log("");
  console.log("Next:");
  console.log("- Run: npx tsx scripts/structure-guards.ts");
}

main();
