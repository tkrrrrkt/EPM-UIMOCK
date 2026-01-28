# ROIC分析 - Design Review

## Review Summary

| 項目 | 結果 |
|------|------|
| **判定** | **GO** |
| レビュー日 | 2026-01-27 |
| レビュアー | Claude Code |
| 対象ドキュメント | design.md v1.0 |

---

## 1. レビュー観点

### 1.1 既存アーキテクチャとの整合性

| チェック項目 | 結果 | コメント |
|-------------|------|---------|
| BFF/API分離 | OK | UI → BFF → Domain API の境界が明確 |
| Contracts-first | OK | BFF契約を先に定義、実装は契約に従属 |
| tenant_id double-guard | OK | Repository + RLS の二重防御を明記 |
| Error Policy | OK | Pass-through を選択、理由を明記 |

### 1.2 設計の一貫性と標準準拠

| チェック項目 | 結果 | コメント |
|-------------|------|---------|
| DTO命名規則 | OK | camelCase（DTO）/ snake_case（DB）を遵守 |
| Enum定義 | OK | const + type パターンに準拠 |
| Error定義 | OK | ErrorCode const + Error interface パターンに準拠 |
| 既存パターン参照 | OK | CVP analysis の契約パターンを踏襲 |

### 1.3 拡張性と保守性

| チェック項目 | 結果 | コメント |
|-------------|------|---------|
| 責務分離 | OK | Options/Data/SimpleInput の各エンドポイントに分離 |
| モード判定 | OK | 標準/簡易モードの判定ロジックが明確 |
| 共通コンポーネント | OK | CVPとの共通部分（DepartmentTree等）を識別 |

### 1.4 型安全性とインターフェース設計

| チェック項目 | 結果 | コメント |
|-------------|------|---------|
| Request/Response型 | OK | 全エンドポイントにDTO定義あり |
| null許容 | OK | 欠損値はnullで表現、UI側で「-」表示 |
| Enum型安全 | OK | as const + type で型安全を確保 |

---

## 2. Critical Issues

**なし** - 設計に重大な問題は見つかりませんでした。

---

## 3. Recommendations（推奨事項）

### 3.1 CVPとの共通コンポーネント検討

| 項目 | 内容 |
|------|------|
| 対象 | DepartmentTree, フィルター関連コンポーネント |
| 理由 | CVPと同一のUIパターンを使用するため、共通化の機会あり |
| 対応案 | Phase 2でリファクタリング検討（初期実装は各機能独立） |

**対応**: MVP完了後の改善項目として記録。初期実装では独立実装を優先。

### 3.2 簡易入力の固定イベント管理

| 項目 | 内容 |
|------|------|
| 対象 | ROIC_SIMPLE_ACTUAL イベントの自動生成 |
| 理由 | 固定イベント/バージョンの管理方針を明確化すべき |
| 対応案 | Domain API実装時に詳細化 |

**対応**: Phase 2のBackend実装時に詳細設計。

### 3.3 パフォーマンス考慮

| 項目 | 内容 |
|------|------|
| 対象 | 月末残高平均の計算（標準モード） |
| 理由 | 12ヶ月分のBS残高を取得・平均する処理 |
| 対応案 | 大量部門配下集約時のクエリ最適化（将来課題） |

**対応**: NFRで応答時間を監視し、必要に応じて最適化。

---

## 4. エンティティ整合性確認

### 4.1 確認済みエンティティ

| エンティティ | entities/*.md | design.md | 整合性 |
|------------|---------------|-----------|--------|
| fact_amounts | 02_トランザクション | Section Data Model | OK |
| plan_events | 01_各種マスタ Section 11.1 | Section Data Model | OK |
| plan_versions | 01_各種マスタ Section 11.2 | Section Data Model | OK |
| report_layouts | 01_各種マスタ Section 7.1 | Section Data Model | OK |
| companies (ROIC設定) | 01_各種マスタ Section 1.2 | Section Data Model | OK |
| subjects | 01_各種マスタ Section 6.1 | Section Data Model | OK |

### 4.2 DTO-DBマッピング確認

| 項目 | 結果 |
|------|------|
| camelCase/snake_case変換 | OK |
| 型変換（varchar→String, uuid→String等） | OK |
| NULL許可の反映 | OK |

---

## 5. Requirements Traceability 確認

| Requirement | Design対応 | 確認結果 |
|-------------|------------|---------|
| Req1: フィルター選択機能 | Section UI Design, BFF Endpoints | OK |
| Req2: 部門ツリー選択機能 | Section UI Design | OK |
| Req3: モード判定機能 | Section BFF Specification, Contracts | OK |
| Req4: 簡易入力パネル機能 | Section UI Design, Contracts | OK |
| Req5: データ取得・合成機能 | Section BFF Specification | OK |
| Req6: KPIカード表示機能 | Section Simulation Logic, Contracts | OK |
| Req7: ROICツリー表示・編集機能 | Section Simulation Logic, Contracts | OK |
| Req8: グラフ表示機能 | Section UI Design | OK |
| Req9: エラーハンドリング | Section Contracts Summary | OK |

---

## 6. 判定結果

### GO 判定理由

1. **アーキテクチャ整合性**: 既存パターン（CVP analysis等）と一貫した設計
2. **Contracts-first準拠**: BFF契約が明確に定義されている
3. **エンティティ整合性**: entities/*.md との整合性を確認済み
4. **Requirements Traceability**: 全要件に対応する設計セクションが存在
5. **Critical Issuesなし**: 重大な設計問題は見つからず
6. **2モード対応**: 標準/簡易モードの設計が明確

### 条件付き事項

- 簡易入力の固定イベント管理はPhase 2で詳細化

---

## 7. 次のステップ

1. **tasks.md 作成** - Contracts-first順序でタスク分解
2. **Contracts実装** - BFF契約をコードに落とし込み
3. **MockBffClient実装** - UI-MOCK先行開発
4. **以降、tasks.mdに従い実装**

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-27 | 初版作成・GO判定 | Claude Code |
