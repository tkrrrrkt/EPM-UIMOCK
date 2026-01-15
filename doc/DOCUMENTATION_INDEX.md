# ドキュメント索引 - EPM SaaS CCSDD プロジェクト

**最終更新:** 2025-12-21

---

## 📚 ドキュメント分類一覧

### 1️⃣ プロジェクトオンボーディング（新規参加者向け）

| ファイル | 対象者 | 目的 | 内容 |
|---------|--------|------|------|
| **CLAUDE.md** | AI開発者 | プロジェクトコンテキスト | Claude Code向けプロジェクト概要、コマンド、パターン |
| **KIRO_HELP.md** | 開発者全員 | Kiroコマンドリファレンス | `/kiro/*` コマンドの使い方、ワークフロー、よくある質問 |
| **doc/DEVELOPMENT_PROCESS_GUIDE.md** | 全開発者（必読） | CCSDD完全ガイド | 12STEP開発プロセス、Cursor/Kiroプロンプト集、コマンド一覧（1,578行） |
| **doc/v0-usage-guide.md** | フロントエンド開発者 | v0.dev使用ガイド | Quick Start、プロンプト例、FAQ、トラブルシューティング |

---

### 2️⃣ CCSDD/SDD開発手法（開発プロセス）

| ファイル | 対象者 | 目的 | 内容 |
|---------|--------|------|------|
| **.kiro/steering/development-process.md** | 全開発者（SSoT） | CCSDD開発プロセス定義 | 14STEP開発順序、v0 Two-Phase、7原則 |
| **doc/DEVELOPMENT_PROCESS_GUIDE.md** | 全開発者 | CCSDD実践ガイド | 詳細手順、プロンプト集、ファイル配置表 |
| **.kiro/steering/glossary.md** | 全開発者 | 用語統一 | BFF、Domain API、Contract、CCSDD等の定義 |
| **doc/technical/SDD統合Doc.md** | Tech Lead | SDD全体像理解 | SDD思想、Kiro設定、開発フロー、成功パターン |

---

### 3️⃣ Steering（プロジェクト全体ルール - SSoT）

| ファイル | 対象者 | 目的 | 内容 |
|---------|--------|------|------|
| **.kiro/steering/product.md** | 全開発者 | プロダクト定義 | EPM SaaSのビジョン、ターゲット、機能概要 |
| **.kiro/steering/tech.md** | 全開発者 | 技術スタック定義 | Next.js, PostgreSQL, TypeScript等の技術選定理由 |
| **.kiro/steering/structure.md** | 全開発者 | ディレクトリ構造ルール | apps/web, packages/contracts の配置規約、禁止パターン |
| **.kiro/steering/epm-design-system.md** | UI開発者 | デザインシステムSSoT | EPMカラーパレット（Deep Teal/Royal Indigo）、コンポーネントTier定義（973行） |
| **.kiro/steering/v0-workflow.md** | UI開発者 | v0統合ルール | v0 → _v0_drop → features 移行フロー、制約チェック |
| **.kiro/steering/v0-prompt-template.md** | UI開発者 | v0プロンプト基本版 | v0.dev用プロンプトテンプレート（291行、レジストリURL指定版） |
| **.kiro/steering/v0-prompt-template-enhanced.md** | UI開発者（推奨） | v0プロンプト拡張版 | デザイン詳細埋め込み版（558行、色・タイポグラフィ完全定義） |

---

### 4️⃣ Kiro SDD設定ファイル（AI用ルール）

#### 4-1. Rules（AIの動作ルール）

| ファイル | 対象者 | 目的 | 内容 |
|---------|--------|------|------|
| **.kiro/settings/rules/design-principles.md** | AI | 設計原則 | SOLID, DRY, KISS等の適用ルール |
| **.kiro/settings/rules/design-discovery-full.md** | AI | 詳細設計生成 | 完全な設計書生成ルール（詳細モード） |
| **.kiro/settings/rules/design-discovery-light.md** | AI | 簡易設計生成 | 軽量設計書生成ルール（スピード重視） |
| **.kiro/settings/rules/design-review.md** | AI | 設計レビュー | 設計品質チェックルール |
| **.kiro/settings/rules/gap-analysis.md** | AI | ギャップ分析 | 既存コードと新仕様の差分分析ルール |
| **.kiro/settings/rules/ears-format.md** | AI | 要件記述形式 | EARS形式（Easy Approach to Requirements Syntax）ルール |
| **.kiro/settings/rules/steering-principles.md** | AI | Steering生成 | プロジェクトルール生成の原則 |
| **.kiro/settings/rules/tasks-generation.md** | AI | タスク生成 | 実装タスクの生成ルール |
| **.kiro/settings/rules/tasks-parallel-analysis.md** | AI | 並列タスク分析 | 並列実行可能タスクの特定ルール |

#### 4-2. Templates（ドキュメントテンプレート）

| ファイル | 対象者 | 目的 | 内容 |
|---------|--------|------|------|
| **.kiro/settings/templates/specs/requirements.md** | AI | 要件定義テンプレート | requirements.md の構造定義 |
| **.kiro/settings/templates/specs/requirements-init.md** | AI | 初期要件テンプレート | spec-init 時の requirements.md |
| **.kiro/settings/templates/specs/design.md** | AI | 設計書テンプレート | design.md の構造定義 |
| **.kiro/settings/templates/specs/tasks.md** | AI | タスクテンプレート | tasks.md の構造定義 |
| **.kiro/settings/templates/specs/research.md** | AI | 調査ログテンプレート | research.md の構造定義 |
| **.kiro/settings/templates/steering/product.md** | AI | Product Steeringテンプレート | product.md の構造 |
| **.kiro/settings/templates/steering/tech.md** | AI | Tech Steeringテンプレート | tech.md の構造 |
| **.kiro/settings/templates/steering/structure.md** | AI | Structure Steeringテンプレート | structure.md の構造 |
| **.kiro/settings/templates/steering-custom/*.md** | AI | カスタムSteering | API、認証、DB、デプロイ、エラーハンドリング、セキュリティ、テスト |

#### 4-3. Cursor Commands（Kiroコマンド実装）

| ファイル | 対象者 | 目的 | 内容 |
|---------|--------|------|------|
| **.cursor/commands/kiro/spec-init.md** | AI | `/kiro/spec-init` | 新規仕様初期化コマンド |
| **.cursor/commands/kiro/spec-requirements.md** | AI | `/kiro/spec-requirements` | 要件定義生成コマンド |
| **.cursor/commands/kiro/spec-design.md** | AI | `/kiro/spec-design` | 設計書生成コマンド |
| **.cursor/commands/kiro/spec-tasks.md** | AI | `/kiro/spec-tasks` | タスク生成コマンド |
| **.cursor/commands/kiro/spec-impl.md** | AI | `/kiro/spec-impl` | 実装開始コマンド |
| **.cursor/commands/kiro/spec-status.md** | AI | `/kiro/spec-status` | 進捗確認コマンド |
| **.cursor/commands/kiro/steering.md** | AI | `/kiro/steering` | Steering生成コマンド |
| **.cursor/commands/kiro/steering-custom.md** | AI | `/kiro/steering-custom` | カスタムSteering生成 |
| **.cursor/commands/kiro/validate-design.md** | AI | `/kiro/validate-design` | 設計検証コマンド |
| **.cursor/commands/kiro/validate-gap.md** | AI | `/kiro/validate-gap` | ギャップ分析コマンド |
| **.cursor/commands/kiro/validate-impl.md** | AI | `/kiro/validate-impl` | 実装検証コマンド |

---

### 5️⃣ 実装済み仕様（.kiro/specs/）

| ファイル | 対象者 | 目的 | 内容 |
|---------|--------|------|------|
| **.kiro/specs/master-data/employee-master/requirements.md** | 開発者 | 社員マスタ要件 | 社員マスタCRUDの要件定義 |
| **.kiro/specs/master-data/employee-master/design.md** | 開発者 | 社員マスタ設計 | BFF/API設計、DTO定義、エラーハンドリング |
| **.kiro/specs/master-data/employee-master/design-review.md** | Tech Lead | 社員マスタレビュー | 設計レビュー結果、改善点 |
| **.kiro/specs/master-data/employee-master/tasks.md** | 開発者 | 社員マスタタスク | 実装タスク一覧（Contracts → DB → API → BFF → UI） |
| **.kiro/specs/master-data/employee-master/v0-prompt.md** | UI開発者 | 社員マスタUI生成 | v0.dev用プロンプト（実際に使用したもの） |

---

### 6️⃣ ビジネス要件・企画（doc/business/）

| ファイル | 対象者 | 目的 | 内容 |
|---------|--------|------|------|
| **doc/business/EPM企画書.pdf** | ステークホルダー | EPM全体像 | ビジネス企画書（PDF） |
| **doc/business/EPMリサーチ統合版.md** | ビジネス・開発 | EPM調査結果 | 市場調査、競合分析、機能要求（1,627KB） |
| **doc/business/EPM業務要件洗い出し.md** | ビジネス・開発 | 業務要件 | 業務フロー、要件一覧 |
| **doc/business/EPM機能一覧.md** | ビジネス・開発 | 機能リスト | 実装予定機能の一覧 |
| **doc/business/基本アーキテクチャ.md** | Tech Lead | アーキテクチャ概要 | システム全体のアーキテクチャ設計 |

---

### 7️⃣ 技術ドキュメント（doc/technical/）

| ファイル | 対象者 | 目的 | 内容 |
|---------|--------|------|------|
| **doc/technical/SDD統合Doc.md** | 開発者 | SDD全体理解 | Kiro SDD思想、設定、ワークフロー |
| **doc/technical/V0統合Doc.md** | UI開発者 | v0統合理解 | v0.dev統合の全体像、成功パターン |
| **doc/technical/v0-fetch-workflow-complete.md** | UI開発者 | v0取得完全ガイド | 詳細手順、トラブルシューティング、調査結果 |
| **doc/technical/v0-integration-methods.md** | UI開発者 | v0取得方法比較 | ChatGPT+Claude調査結果（API/CLI/ZIP比較） |
| **doc/technical/design-system-migration-log.md** | UI開発者 | DS移行履歴 | EPMデザインシステム移行ログ |

---

### 8️⃣ 開発ガイド（doc/）

| ファイル | 対象者 | 目的 | 内容 |
|---------|--------|------|------|
| **doc/DEVELOPMENT_PROCESS_GUIDE.md** | 全開発者 | CCSDD完全ガイド | 12STEP、プロンプト集、コマンド一覧、ファイル配置表 |
| **doc/v0-usage-guide.md** | UI開発者 | v0使用ガイド | Quick Start、FAQ、トラブルシューティング |
| **doc/guides/V0デザインシステム.md** | UI開発者 | v0 DS設定 | v0.devでのデザインシステム使用方法 |
| **doc/guides/v0-cli-integration.md** | UI開発者 | v0 CLI統合 | v0 CLIツールの統合方法 |
| **doc/guides/v0-complete-setup-guide.md** | UI開発者 | v0完全セットアップ | v0環境構築の完全ガイド |
| **doc/guides/v0-cursor-integration-workflow.md** | UI開発者 | v0×Cursor連携 | v0とCursorを組み合わせたワークフロー |

---

### 9️⃣ スクリプト・自動化（scripts/）

| ファイル | 対象者 | 目的 | 内容 |
|---------|--------|------|------|
| **scripts/README.md** | 開発者 | スクリプト使用方法 | v0-fetch.sh, v0-integrate.sh等の使い方、トラブルシューティング |
| **scripts/v0-fetch.sh** | UI開発者 | v0ファイル取得 | v0.devからコンポーネントを_v0_dropに取得 |
| **scripts/v0-integrate.sh** | UI開発者 | v0統合ワークフロー | v0-fetch + Cursorレビュー + features/移行を自動化 |
| **scripts/structure-guards.ts** | 開発者 | 構造検証 | プロジェクト構造がステアリングに準拠しているかチェック |
| **scripts/scaffold-feature.ts** | 開発者 | 機能スキャフォールド | 新機能のディレクトリ構造を自動生成 |
| **scripts/v0-*.ts** | 開発者（参考） | v0 API調査 | v0 Platform API調査スクリプト（調査用、未統合） |

---

### 🔟 コンポーネント・UI（apps/web/src/shared/ui/）

| ファイル | 対象者 | 目的 | 内容 |
|---------|--------|------|------|
| **apps/web/src/shared/ui/README.md** | UI開発者 | コンポーネントカタログ | Tier 1/2/3コンポーネント一覧、使用ルール、EPMカラートークン |

---

### 1️⃣1️⃣ 生成物・OUTPUT（apps/web/_v0_drop/）

| ファイル | 対象者 | 目的 | 内容 |
|---------|--------|------|------|
| **apps/web/_v0_drop/*/src/OUTPUT.md** | UI開発者 | v0生成物レポート | 生成ファイル一覧、Missing Components、統合手順、制約チェック |
| **apps/web/src/features/*/OUTPUT.md** | UI開発者 | 統合後レポート | features/移行後の最終レポート |

---

## 🎯 ユースケース別推奨ドキュメント

### 新規参加者（初日）

1. **CLAUDE.md** - プロジェクトコンテキスト（5分）
2. **doc/DEVELOPMENT_PROCESS_GUIDE.md** - CCSDD開発プロセス完全ガイド（30分）
3. **.kiro/steering/development-process.md** - 開発プロセスSSoT（15分）

### フロントエンド開発開始

1. **doc/v0-usage-guide.md** - v0使用ガイド（10分）
2. **.kiro/steering/epm-design-system.md** - デザインシステム（必要時参照）
3. **apps/web/src/shared/ui/README.md** - コンポーネント一覧

### 新機能実装開始

1. **doc/DEVELOPMENT_PROCESS_GUIDE.md** - 開発プロセス・プロンプト集
2. **KIRO_HELP.md** - `/kiro/spec-init` 等のコマンド確認
3. **.kiro/specs/master-data/employee-master/** - 既存仕様を参考
4. **scripts/README.md** - スクリプト使用方法

### トラブルシューティング

1. **doc/v0-usage-guide.md** - v0関連エラー
2. **doc/technical/v0-fetch-workflow-complete.md** - v0取得詳細
3. **scripts/README.md** - スクリプトエラー
4. **.kiro/steering/structure.md** - ディレクトリ構造エラー

---

## 📂 ディレクトリ別サマリー

| ディレクトリ | 役割 | ファイル数 | 対象者 |
|-------------|------|-----------|--------|
| **プロジェクトルート/** | オンボーディング | 2 | 全員 |
| **doc/** | 開発ガイド・索引 | 3 | 全開発者 |
| **.kiro/steering/** | プロジェクトルール（SSoT） | 9 | 全開発者 |
| **.kiro/settings/rules/** | AI動作ルール | 9 | AI |
| **.kiro/settings/templates/** | ドキュメントテンプレート | 14 | AI |
| **.cursor/commands/kiro/** | Kiroコマンド実装 | 11 | AI |
| **.kiro/specs/master-data/employee-master/** | 社員マスタ仕様 | 5 | 開発者 |
| **doc/business/** | ビジネス要件 | 5 | ビジネス・開発 |
| **doc/technical/** | 技術ドキュメント | 5 | 開発者 |
| **doc/guides/** | 開発ガイド | 4 | UI開発者 |
| **scripts/** | 自動化スクリプト | 1 README + 8 scripts | 開発者 |
| **apps/web/src/shared/ui/** | UIコンポーネント | 1 README | UI開発者 |

---

## ✅ ドキュメント整合性チェック

### SSoT（Single Source of Truth）

以下は**正本（唯一の真実）**であり、他のドキュメントはこれに従属する：

- ✅ `.kiro/steering/development-process.md` - 開発プロセス
- ✅ `.kiro/steering/epm-design-system.md` - デザインシステム
- ✅ `.kiro/steering/structure.md` - ディレクトリ構造
- ✅ `.kiro/steering/product.md` - プロダクト定義
- ✅ `.kiro/steering/tech.md` - 技術スタック

### 階層構造

```
.kiro/steering/development-process.md（SSoT: 定義）
  └── doc/DEVELOPMENT_PROCESS_GUIDE.md（実践ガイド: 詳細手順・プロンプト集）

.kiro/steering/v0-workflow.md（SSoT: v0ルール）
  └── doc/v0-usage-guide.md（実践ガイド: Quick Start・FAQ）
```

---

## 🔄 メンテナンス推奨

### 定期更新が必要なドキュメント

- **doc/v0-usage-guide.md** - v0の仕様変更に追随
- **doc/technical/v0-fetch-workflow-complete.md** - v0 Platform API更新に追随
- **.kiro/steering/epm-design-system.md** - デザインシステム拡張時

### 不要になる可能性があるドキュメント

- **scripts/v0-*.ts** - v0 Platform API調査スクリプト（将来的にAPIが改善されれば本採用の可能性）

---

**合計ドキュメント数: 約65ファイル（テンプレート・コマンド含む）**
