# Research & Design Decisions

---

## Summary

- **Feature**: `master-data/dimension-master`
- **Discovery Scope**: Extension（既存マスタパターンの拡張）
- **Key Findings**:
  1. dimensions と dimension_values の2エンティティを1機能で管理（親子関係）
  2. dimension_values は階層構造を持ち、hierarchy_level / hierarchy_path のキャッシュ管理が必要
  3. scope_type（tenant/company）による値のスコープ管理が employee-master / project-master にない新要素

---

## Research Log

### 既存マスタパターンとの差分

- **Context**: employee-master / project-master との設計差分を把握
- **Sources Consulted**:
  - `.kiro/specs/master-data/project-master/design.md`
  - `.kiro/specs/entities/01_各種マスタ.md`
- **Findings**:
  - employee / project は単一エンティティの CRUD
  - dimension-master は dimensions（親）と dimension_values（子）の2エンティティ
  - dimension_values は自己参照による階層構造を持つ
  - dimension_values には scope_type / scope_company_id によるスコープ管理がある
- **Implications**:
  - BFF エンドポイントは dimensions 用と dimension_values 用で分離
  - dimension_values のエンドポイントは dimension_id をパスパラメータで受け取る
  - 階層更新時の子孫ノード再計算ロジックが Service 責務に追加

### 階層構造の管理方針

- **Context**: dimension_values の hierarchy_level / hierarchy_path 管理
- **Sources Consulted**:
  - `.kiro/specs/entities/01_各種マスタ.md` の「3.2 departments」
  - PostgreSQL recursive CTE ベストプラクティス
- **Findings**:
  - departments と同一パターン（キャッシュカラム + 再計算関数）
  - hierarchy_path/level は移動/コード変更後に再計算関数を呼ぶ
  - 循環参照チェックは Service 責務
- **Implications**:
  - 親値変更時は当該ノード + 全子孫ノードの hierarchy_level / hierarchy_path を再計算
  - 循環参照検出は親→ルートまで辿って自身が含まれないかチェック
  - 大量の子孫がある場合のパフォーマンス考慮（バッチ更新）

### スコープ管理（tenant / company）

- **Context**: dimension_values の scope_type による運用差分
- **Sources Consulted**:
  - `.kiro/specs/entities/01_各種マスタ.md` の「4.2 dimension_values」
- **Findings**:
  - scope_type = 'tenant': テナント共通の値（全社で共有）
  - scope_type = 'company': 会社別の値（scope_company_id 必須）
  - dimension の scope_policy は運用ガイド、真の制約は dimension_values.scope_type
- **Implications**:
  - scope_type = 'company' 時は scope_company_id の NOT NULL バリデーション必須
  - 一覧取得時に scope_company_id でフィルタ可能にする（BFF 責務）
  - companies との FK 整合チェックは Repository 層

---

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 統合サービス | dimensions と dimension_values を1つの Service で管理 | コード簡素化、トランザクション管理容易 | Service が肥大化する可能性 | **採用** |
| 分離サービス | DimensionService と DimensionValueService を分離 | SRP 遵守、責務明確 | 循環参照チェック等で相互呼び出しが発生 | 不採用 |

---

## Design Decisions

### Decision: 2エンティティの統合管理

- **Context**: dimensions と dimension_values を別機能にするか統合するか
- **Alternatives Considered**:
  1. 別機能として分離（dimension-master / dimension-value-master）
  2. 1機能として統合管理
- **Selected Approach**: 統合管理
- **Rationale**:
  - dimension_values は必ず dimensions に属する（親子関係）
  - 運用上も「ディメンション設定」として一画面で管理するのが自然
  - FK 整合性の観点から同一トランザクションで扱いたいケースがある
- **Trade-offs**:
  - Service のコード量が増える
  - BFF エンドポイント数が増える（12エンドポイント）
- **Follow-up**: Service 肥大化が顕著になれば将来分割を検討

### Decision: 階層キャッシュの再計算タイミング

- **Context**: hierarchy_level / hierarchy_path の更新タイミング
- **Alternatives Considered**:
  1. 親値変更時に同期的に全子孫を再計算
  2. 非同期バッチで再計算（整合性遅延許容）
- **Selected Approach**: 同期的再計算
- **Rationale**:
  - dimension_values の件数は通常数百件程度（大量データは dimension_members 側）
  - 管理画面での即時反映が必要
  - 整合性遅延は運用混乱の原因になる
- **Trade-offs**:
  - 大量子孫がある場合のレスポンス遅延リスク
  - トランザクション時間の延長
- **Follow-up**: 子孫数が 1,000 件を超える場合は警告ログ出力

### Decision: BFF エンドポイント構成

- **Context**: dimensions と dimension_values のエンドポイント設計
- **Alternatives Considered**:
  1. フラットなエンドポイント（/dimension-master, /dimension-value-master）
  2. ネストしたエンドポイント（/dimension-master/:dimensionId/values）
- **Selected Approach**: ネスト構成
- **Rationale**:
  - dimension_values は必ず特定の dimension に属する
  - RESTful なリソース階層として自然
  - パスパラメータで dimensionId を受け取ることで明示的な親子関係を表現
- **Trade-offs**:
  - URL が長くなる
  - ルーティング設定が増える
- **Follow-up**: なし

---

## Risks & Mitigations

- **循環参照の見逃し** — Service 層で親→ルート辿りチェックを必須化、Unit テストで網羅
- **階層再計算のパフォーマンス** — 子孫数上限警告（1,000件）、将来的なバッチ化検討
- **scope_company_id 整合性** — companies FK 制約 + Repository 層でのテナント整合チェック

---

## References

- [project-master/design.md](../project-master/design.md) — ベースパターン
- [entities/01_各種マスタ.md](../../entities/01_各種マスタ.md) — エンティティ定義
- `.kiro/steering/tech.md` — 技術憲法
- `.kiro/steering/structure.md` — 構造憲法
