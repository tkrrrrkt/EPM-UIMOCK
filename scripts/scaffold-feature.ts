#!/usr/bin/env node
/**
 * scaffold-feature.ts
 *
 * Run (recommended):
 *   npx tsx scripts/scaffold-feature.ts <context> <feature>
 *   e.g. npx tsx scripts/scaffold-feature.ts master-data employee-master
 *
 * What it does:
 *  - Ensures .kiro/specs/<context>/<feature> exists (spec-init済み前提)
 *  - Creates skeleton dirs for:
 *      apps/web/src/features/<context>/<feature>/{ui,api,hooks,validators,state}
 *      apps/web/_v0_drop/<context>/<feature>/{PROMPT.md,OUTPUT.md,src/}
 *      apps/bff/src/modules/<context>/<feature>/{mappers/}
 *      apps/api/src/modules/<context>/<feature>/
 *  - Creates minimal stub files:
 *      - web api adapters: BffClient / MockBffClient / HttpBffClient
 *      - bff/api: controller/service/repository + mapper stub
 *
 * Notes:
 *  - File names are kebab-case (match feature id).
 *  - Class names are PascalCase (NestJS-friendly).
 */

import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFileIfMissing(filePath: string, content: string) {
  if (fs.existsSync(filePath)) return;
  fs.writeFileSync(filePath, content, "utf8");
}

function requireDirExists(rel: string) {
  const abs = path.join(repoRoot, rel);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) {
    throw new Error(
      `Required directory does not exist: ${rel}\n` +
        `Run /kiro:spec-init first to create .kiro/specs/<context>/<feature>/`
    );
  }
}

function toPascalCaseFromKebab(kebab: string): string {
  return kebab
    .split("-")
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join("");
}

function main() {
  const [, , context, feature] = process.argv;

  if (!context || !feature) {
    console.error("Usage: npx tsx scripts/scaffold-feature.ts <context> <feature>");
    process.exit(1);
  }

  // 0) Spec existence (must exist)
  requireDirExists(`.kiro/specs/${context}/${feature}`);

  const featureKebab = feature; // keep original
  const featurePascal = toPascalCaseFromKebab(featureKebab);

  // 1) Web feature skeleton
  const webFeatureRoot = path.join(repoRoot, `apps/web/src/features/${context}/${featureKebab}`);
  ensureDir(path.join(webFeatureRoot, "ui"));
  ensureDir(path.join(webFeatureRoot, "api"));
  ensureDir(path.join(webFeatureRoot, "hooks"));
  ensureDir(path.join(webFeatureRoot, "validators"));
  ensureDir(path.join(webFeatureRoot, "state")); // harmless; used in input-heavy features

  // Web BFF client stubs
  writeFileIfMissing(
    path.join(webFeatureRoot, "api", "BffClient.ts"),
    `// contracts must be imported from packages/contracts/src/bff (UI ↔ BFF)\n` +
      `export type BffClient = {\n` +
      `  // TODO: Define methods used by UI (use contracts/bff DTOs)\n` +
      `};\n`
  );

  writeFileIfMissing(
    path.join(webFeatureRoot, "api", "MockBffClient.ts"),
    `import { BffClient } from "./BffClient";\n\n` +
      `// UI-MOCK phase adapter (no real network)\n` +
      `export const mockBffClient: BffClient = {\n` +
      `  // TODO: implement mock methods\n` +
      `};\n`
  );

  writeFileIfMissing(
    path.join(webFeatureRoot, "api", "HttpBffClient.ts"),
    `import { BffClient } from "./BffClient";\n\n` +
      `// Real HTTP adapter. Keep fetch usage ONLY here (UI components must not call fetch directly)\n` +
      `export function createHttpBffClient(_baseUrl = "/bff"): BffClient {\n` +
      `  return {\n` +
      `    // TODO: implement HTTP calls to BFF endpoints\n` +
      `  };\n` +
      `}\n`
  );

  // 2) v0 drop skeleton (isolation zone)
  const v0Root = path.join(repoRoot, `apps/web/_v0_drop/${context}/${featureKebab}`);
  ensureDir(v0Root);
  ensureDir(path.join(v0Root, "src"));
  writeFileIfMissing(path.join(v0Root, "PROMPT.md"), `# v0 Prompt\n\n`);
  writeFileIfMissing(path.join(v0Root, "OUTPUT.md"), `# v0 Output Notes\n\n`);

  // 3) BFF module skeleton
  const bffRoot = path.join(repoRoot, `apps/bff/src/modules/${context}/${featureKebab}`);
  ensureDir(bffRoot);
  ensureDir(path.join(bffRoot, "mappers"));

  writeFileIfMissing(
    path.join(bffRoot, `${featureKebab}.controller.ts`),
    `// ${context}/${featureKebab} BFF controller\n` +
      `export class ${featurePascal}BffController {}\n`
  );
  writeFileIfMissing(
    path.join(bffRoot, `${featureKebab}.service.ts`),
    `// ${context}/${featureKebab} BFF service (aggregation/transform only)\n` +
      `export class ${featurePascal}BffService {}\n`
  );
  writeFileIfMissing(
    path.join(bffRoot, "mappers", `${featureKebab}.mapper.ts`),
    `// api DTO -> bff DTO mapper for ${context}/${featureKebab}\n` +
      `export const ${featurePascal}Mapper = {\n` +
      `  // TODO: mapping functions\n` +
      `};\n`
  );

  // 4) API module skeleton
  const apiRoot = path.join(repoRoot, `apps/api/src/modules/${context}/${featureKebab}`);
  ensureDir(apiRoot);

  writeFileIfMissing(
    path.join(apiRoot, `${featureKebab}.controller.ts`),
    `// ${context}/${featureKebab} Domain API controller\n` +
      `export class ${featurePascal}Controller {}\n`
  );
  writeFileIfMissing(
    path.join(apiRoot, `${featureKebab}.service.ts`),
    `// ${context}/${featureKebab} Domain service (business rules + tx boundary)\n` +
      `export class ${featurePascal}Service {}\n`
  );
  writeFileIfMissing(
    path.join(apiRoot, `${featureKebab}.repository.ts`),
    `// ${context}/${featureKebab} Repository (tenant_id required + double-where guard)\n` +
      `export class ${featurePascal}Repository {}\n`
  );

  console.log("✅ Scaffold created:");
  console.log(`- apps/web/src/features/${context}/${featureKebab}/...`);
  console.log(`- apps/web/_v0_drop/${context}/${featureKebab}/...`);
  console.log(`- apps/bff/src/modules/${context}/${featureKebab}/...`);
  console.log(`- apps/api/src/modules/${context}/${featureKebab}/...`);
}

main();
