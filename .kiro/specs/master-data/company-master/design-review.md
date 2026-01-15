# Design Review Document

## Feature: master-data/company-master

**Review Date**: 2026-01-04
**Reviewer**: Claude (AI-assisted)
**Design Version**: 1.0

---

## Review Summary

| Category | Status | Notes |
|----------|--------|-------|
| Architecture Alignment | ✅ PASS | CCSDD準拠、層境界明確 |
| Contract Completeness | ✅ PASS | BFF/API/Error全定義済み |
| Entity Consistency | ✅ PASS | エンティティ定義と整合 |
| Security (Multi-tenant) | ✅ PASS | RLS + double-guard |
| UI Specification | ✅ PASS | v0生成に十分な詳細度 |

**Overall Decision**: ✅ **GO**

---

## Review Details

### 1. Architecture Alignment

**Status**: ✅ PASS

**Checklist**:
- [x] UI → BFF → Domain API → DB の層構造を遵守
- [x] UI は `contracts/api` を参照していない
- [x] BFF はビジネスルールの正本を持たない
- [x] Domain API がビジネスルールの最終判断を行う
- [x] Repository は tenant_id を第一引数で受け取る

**Evidence**: design.md Section "Architecture Responsibilities"

---

### 2. Contract Completeness

**Status**: ✅ PASS

**Checklist**:
- [x] BFF Request/Response DTO が全エンドポイントで定義済み
- [x] API Request/Response DTO が全エンドポイントで定義済み
- [x] Error Codes が網羅的に定義済み
- [x] Enum（ConsolidationType）が定義済み
- [x] Naming Convention（camelCase）が統一されている

**BFF Endpoints Coverage**:
| Endpoint | Request DTO | Response DTO | Status |
|----------|-------------|--------------|--------|
| GET /company-master | BffListCompaniesRequest | BffListCompaniesResponse | ✅ |
| GET /company-master/tree | - | BffCompanyTreeResponse | ✅ |
| GET /company-master/:id | - | BffCompanyDetailResponse | ✅ |
| POST /company-master | BffCreateCompanyRequest | BffCompanyDetailResponse | ✅ |
| PATCH /company-master/:id | BffUpdateCompanyRequest | BffCompanyDetailResponse | ✅ |
| POST /:id/deactivate | - | BffCompanyDetailResponse | ✅ |
| POST /:id/reactivate | - | BffCompanyDetailResponse | ✅ |

**Error Codes Coverage**:
| Error Code | Use Case | Status |
|------------|----------|--------|
| COMPANY_NOT_FOUND | 詳細/更新/無効化/再有効化 | ✅ |
| COMPANY_CODE_DUPLICATE | 登録/更新 | ✅ |
| COMPANY_ALREADY_INACTIVE | 無効化 | ✅ |
| COMPANY_ALREADY_ACTIVE | 再有効化 | ✅ |
| PARENT_COMPANY_NOT_FOUND | 親法人設定 | ✅ |
| SELF_REFERENCE_NOT_ALLOWED | 自己参照禁止 | ✅ |
| VALIDATION_ERROR | 全バリデーション | ✅ |

**Evidence**: design.md Section "Contracts Summary"

---

### 3. Entity Consistency

**Status**: ✅ PASS

**Checklist**:
- [x] エンティティ定義（01_各種マスタ.md 1.2）の全カラムがPrisma Schemaに反映
- [x] 型変換が正確（varchar→String, numeric→Decimal, char→String）
- [x] UNIQUE制約（tenant_id + company_code）が反映
- [x] CHECK制約がアプリケーション層で検証される設計
- [x] NULL許可がPrisma `?` で正しく表現

**Entity-Prisma Mapping**:
| Entity Column | Prisma Field | Type Match | Status |
|---------------|--------------|------------|--------|
| id (uuid) | id (String) | ✅ | ✅ |
| tenant_id (uuid) | tenantId (String) | ✅ | ✅ |
| company_code (varchar 20) | companyCode (VarChar 20) | ✅ | ✅ |
| company_name (varchar 200) | companyName (VarChar 200) | ✅ | ✅ |
| company_name_short (varchar 100) | companyNameShort (VarChar 100)? | ✅ | ✅ |
| parent_company_id (uuid) | parentCompanyId (String)? | ✅ | ✅ |
| consolidation_type (varchar 20) | consolidationType (VarChar 20) | ✅ | ✅ |
| ownership_ratio (numeric 5,2) | ownershipRatio (Decimal 5,2)? | ✅ | ✅ |
| voting_ratio (numeric 5,2) | votingRatio (Decimal 5,2)? | ✅ | ✅ |
| currency_code (char 3) | currencyCode (Char 3) | ✅ | ✅ |
| reporting_currency_code (char 3) | reportingCurrencyCode (Char 3)? | ✅ | ✅ |
| fiscal_year_end_month (int) | fiscalYearEndMonth (Int) | ✅ | ✅ |
| timezone (varchar 50) | timezone (VarChar 50)? | ✅ | ✅ |
| is_active (boolean) | isActive (Boolean) | ✅ | ✅ |
| created_at (timestamptz) | createdAt (DateTime) | ✅ | ✅ |
| updated_at (timestamptz) | updatedAt (DateTime) | ✅ | ✅ |
| created_by (uuid) | createdBy (String)? | ✅ | ✅ |
| updated_by (uuid) | updatedBy (String)? | ✅ | ✅ |

**Evidence**: design.md Section "Data Model"

---

### 4. Security (Multi-tenant)

**Status**: ✅ PASS

**Checklist**:
- [x] RLS Policy が定義済み（tenant_isolation）
- [x] Repository で tenant_id を where 句に含める（アプリケーションガード）
- [x] PrismaService.setTenantContext() の呼び出しが明記
- [x] 親法人設定時の同一テナント制約がService責務に明記

**Double-Guard Implementation**:
```
1. RLS Policy: tenant_id = current_setting('app.tenant_id')
2. Application Guard: where { tenant_id: tenantId }
```

**Evidence**: design.md Section "Repository Specification", "RLS Policy"

---

### 5. UI Specification

**Status**: ✅ PASS

**Checklist**:
- [x] 画面構成が明確（一覧/詳細/編集/ツリー）
- [x] フォーム項目と入力形式が詳細に定義
- [x] 条件付き制御（比率入力のdisabled）が明記
- [x] 表示ラベル（連結種別/決算月）が定義
- [x] 選択肢リスト（通貨/タイムゾーン）が定義
- [x] 無効法人の表示仕様が明確

**v0生成に必要な情報**:
| 項目 | 定義状況 |
|------|---------|
| 画面構成 | ✅ テーブル + ダイアログ + ツリー |
| フォーム項目 | ✅ 全項目の入力形式・必須・制約 |
| 表示ラベル | ✅ 日本語ラベル定義済み |
| 選択肢 | ✅ 通貨/TZ/連結種別/決算月 |
| 条件付き制御 | ✅ 非連結時の比率入力不可 |
| 無効表示 | ✅ 一覧グレーアウト、ツリー非表示 |

**Evidence**: design.md Section "UI Specification"

---

### 6. Requirements Traceability

**Status**: ✅ PASS

全要件（Req 1〜10）が設計コンポーネントにトレース可能。

| Requirement | Traceability Status |
|-------------|---------------------|
| Req 1: 一覧検索表示 | ✅ GET endpoint, BffListCompaniesRequest/Response |
| Req 2: 詳細表示 | ✅ GET /:id endpoint, BffCompanyDetailResponse |
| Req 3: 新規登録 | ✅ POST endpoint, validation rules, error codes |
| Req 4: 更新 | ✅ PATCH endpoint, validation rules, error codes |
| Req 5: 無効化 | ✅ POST /deactivate, state transition check |
| Req 6: 再有効化 | ✅ POST /reactivate, state transition check |
| Req 7: 会社階層 | ✅ parentCompanyId, GET /tree, self-reference check |
| Req 8: マルチテナント | ✅ RLS + double-guard |
| Req 9: 一意性制約 | ✅ @@unique, COMPANY_CODE_DUPLICATE |
| Req 10: 監査ログ | ✅ created_by/at, updated_by/at |

**Evidence**: design.md Section "Requirements Traceability"

---

## Critical Issues

**None identified.**

---

## Minor Recommendations（実装時の注意点）

1. **ツリー構築ロジック**: 1階層前提だが、将来の多階層対応を考慮し、再帰的な構築ロジックにしておくと拡張しやすい

2. **比率のDecimal処理**: JavaScript/TypeScriptでDecimalを扱う際はprisma Decimal型からnumberへの変換精度に注意（小数1桁なら問題なし）

3. **親法人選択肢の取得**: 詳細/編集ダイアログを開く際、親法人候補リストを別途取得するAPIが必要になる可能性あり（現状は一覧データを流用可能）

---

## Decision

### ✅ GO

設計は要件を満たしており、CCSDD準拠、エンティティ整合性、セキュリティ要件を充足している。
次フェーズ（Tasks作成）への移行を承認する。

---

## Sign-off

- **Design Author**: Claude (AI-assisted)
- **Reviewer**: Claude (AI-assisted)
- **Decision**: GO
- **Date**: 2026-01-04
