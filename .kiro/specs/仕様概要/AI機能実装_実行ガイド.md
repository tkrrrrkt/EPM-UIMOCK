# AI機能実装：実行ガイド
## ロードマップからCCSDD仕様化への一歩ずつの手順

**対象**: EPMプロジェクト全体
**実装フェーズ**: Phase 1A（基盤構築）→ Phase 1B（P0機能）
**開発手法**: CCSDD (Contract-Centered Specification Driven Development)

---

## 🎯 実行チェックリスト（この1週間）

### Day 1: 現状確認 & ドキュメント熟読

- [ ] このガイドの「Part 1: 仕様化の流れ」を読む（15分）
- [ ] `.kiro/steering/development-process.md` を読む（20分）
- [ ] `AI機能ロードマップ_2026年実装戦略.md` を読む（30分）
- [ ] 既存プロジェクト（KPI Master など）の仕様構造を確認（20分）
  ```bash
  find .kiro/specs/master-data/kpi-definitions -type f
  ```
- [ ] チーム全体で「これから何をするか」を共有（30分）

### Day 2-3: 契約（Contract）の監査

- [ ] `packages/contracts/src/bff/ai/` が存在するか確認
  ```bash
  ls -la packages/contracts/src/bff/ai/
  ```
- [ ] 既存AIコントラクトをリスト化
  ```bash
  grep -r "interface.*RequestDto\|interface.*ResponseDto" packages/contracts/src/bff/ai/
  ```
- [ ] **以下が定義されているか確認**:
  - [ ] `NlqQueryRequestDto` / `NlqQueryResponseDto`
  - [ ] `VarianceReportRequestDto` / `VarianceReportResponseDto`
  - [ ] `AnomalyAlertDto`
  - 不足があれば記録 → `Part 2: 契約の準備` を実行

### Day 4: Spec 仕様化 開始

#### 仕様化パターン（3ステップ）

各機能について必ずこの順序を守る：

```
Step A: 要件定義
  /kiro:spec-init "ai/_shared/semantic-layer"
  /kiro:spec-requirements "ai/_shared/semantic-layer"

Step B: 設計
  /kiro:spec-design "ai/_shared/semantic-layer"

Step C: タスク分解
  /kiro:spec-tasks "ai/_shared/semantic-layer"
```

- [ ] Semantic Layer 仕様化開始
  ```bash
  /kiro:spec-init "ai/_shared/semantic-layer"
  ```

---

## Part 1: 仕様化の流れ（CCSDD形式）

### 全体フロー

```
┌─────────────────────────────────────────────────────┐
│ Step 1: spec-init                                   │
│ 状況: 新機能を開始する                              │
│ 内容: プロジェクト初期化、メタデータ作成             │
│ 出力: spec.json + folder structure                │
└──────────────────────┬──────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ Step 2: spec-requirements                           │
│ 状況: 「何を」作るのかを定義                        │
│ 内容: User Stories, Acceptance Criteria            │
│ 出力: requirements.md                               │
│ 実施: Product Manager + Tech Lead が主導           │
└──────────────────────┬──────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ Step 3: spec-design                                 │
│ 状況: 「どのように」を設計                          │
│ 内容: Architecture, Components, Data Flow, API      │
│ 出力: design.md                                      │
│ 実施: Tech Lead + Architects が主導                 │
└──────────────────────┬──────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ Step 4: spec-tasks                                  │
│ 状況: 「誰が何をいつまで」をタスク化                │
│ 内容: Checklist of implementation tasks            │
│ 出力: tasks.md (with [ ] checkboxes)               │
│ 実施: Tech Lead + Engineers が実行                 │
└──────────────────────┬──────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ Step 5: 実装 (during spec-tasks)                    │
│ 状況: actual coding                                 │
│ チェックリスト: tasks.md の [ ] を [x] に更新      │
└─────────────────────────────────────────────────────┘
```

### 実装例: Semantic Layer

#### Step A: spec-init

**実行**:
```bash
/kiro:spec-init "ai/_shared/semantic-layer"
```

**質問に答える**:
```
Q1: Project type
→ "AI Infrastructure"

Q2: Language
→ "Japanese" (日本語で仕様化)

Q3: Target audience
→ "Backend Engineers, AI Engineers"
```

**出力**:
```
.kiro/specs/ai/_shared/semantic-layer/
  ├── spec.json          # Metadata
  ├── requirements.md    # (empty, next step)
  ├── design.md          # (empty, next step)
  └── tasks.md           # (empty, next step)
```

---

#### Step B: spec-requirements

**実行**:
```bash
/kiro:spec-requirements "ai/_shared/semantic-layer"
```

**質問に答える**:
```
Q: What is the requirement specification?
→ [以下の内容を貼り付け]

---
## 要件定義：Semantic Layer

### ビジネス要件

1. **メタデータの構造化**
   - 全 Subject（科目）について、AI が理解可能な形式でメタデータを保有
   - 含む情報: Code, Name, Description, Alternative Names, Type (Revenue/Cost/Asset)

2. **部門階層の明示化**
   - Departments の安定ID + 階層パスを AI が理解可能に
   - 例: "営業部" → "営業部/東京支社" → "営業部/東京支社/営業課"

3. **期間の相対表現解決**
   - 「今期」「前年同期」「Q3」などの日本語表現を fiscal_year + period_no に変換
   - 例: "今期" + 現在 2026年3月 → fiscal_year=2026, period_no=3

4. **KPI計算式の明示化**
   - 営業利益 = 売上 - COGS - 販管費、などの計算ロジックを LLM が読めるように

5. **AI向けメタデータエクスポート**
   - JSON フォーマットで全メタデータを API エンドポイントから取得可能
   - 例: GET /api/ai/semantic-schema

### 機能要件

F1. subjects テーブルに metadata JSONB カラムを追加
   - metadata: { description, aliases: [], type, related_subjects: [] }

F2. departments テーブルに hierarchy_path を追加
   - 例: "営業部|東京支社|営業課"

F3. periods テーブルに relative_names を追加
   - 例: { "今期": fiscal_year, "前年同期": fiscal_year-1, "Q3": period_no=3 }

F4. PeriodResolver Service 実装
   - 入力: "今期"（自然言語）+ current_date
   - 出力: { fiscal_year: 2026, period_no: 3, label: "2026年3月" }
   - 対応パターン（最初は 10 パターン）:
     * 「今期」「今月」
     * 「前期」「前月」「前年同月」「前年同期」
     * 「Q1」「Q2」「Q3」「Q4」

F5. Semantic Schema API
   - GET /api/ai/semantic-schema
   - 応答: { subjects: [...], departments: [...], periods: [...], kpi_formulas: [...] }
   - キャッシュ: 1 時間（メタデータは頻繁に変わらない）

### 非機能要件

NF1. Multi-Tenant: 全メタデータが tenant_id でフィルタリング
NF2. RLS: PostgreSQL の RLS ポリシーでテナント分離を強制
NF3. パフォーマンス: Semantic Schema 取得 < 1 秒
NF4. 監査ログ: メタデータへのアクセスを ai_audit_logs に記録

---
```

**出力**: requirements.md が生成される

---

#### Step C: spec-design

**実行**:
```bash
/kiro:spec-design "ai/_shared/semantic-layer"
```

**プロンプト内容** (AI に尋ねる):
```
## 設計仕様：Semantic Layer

### アーキテクチャ

```
AI Features (NLQ, Variance Analysis)
  ↓ (depends on)
Semantic Layer Service
  ├─ MetadataProvider (subjects, departments, metrics metadata)
  ├─ PeriodResolver (相対表現 → fiscal_year + period_no)
  ├─ RelatedSubjectsResolver (関連科目の自動検出)
  └─ SemanticSchemaExporter (JSON エクスポート)
  ↓
PostgreSQL
  ├─ subjects.metadata (JSONB)
  ├─ departments.hierarchy_path (STRING)
  ├─ periods.relative_names (JSONB)
  └─ kpi_definitions.formula (STRING)
```

### Database Schema Changes

```prisma
model Subject {
  id String @id
  tenant_id String
  code String
  name String
  metadata Json // { description, aliases, type, related_ids }

  @@unique([tenant_id, code])
}

model Department {
  id String @id
  tenant_id String
  stable_id String // 永続的な ID（名前変更対応用）
  name String
  hierarchy_path String // "営業部|東京支社"

  @@unique([tenant_id, stable_id])
}

model Period {
  id String @id
  tenant_id String
  fiscal_year Int
  period_no Int
  relative_names Json // { "今期": true, "Q3": true }

  @@unique([tenant_id, fiscal_year, period_no])
}
```

### Components

**PeriodResolverService**:
```typescript
interface PeriodResolutionRequest {
  expression: string; // "今期", "前年同期"
  reference_date: Date; // 現在日時
  fiscal_year_start_month?: number; // 4 = 日本企業
}

interface PeriodResolutionResponse {
  fiscal_year: number;
  period_no: number;
  display_label: string;
  confidence: number; // 0-100
}

class PeriodResolverService {
  async resolve(req: PeriodResolutionRequest): Promise<PeriodResolutionResponse>
}
```

**SemanticLayerService**:
```typescript
interface SemanticSchemaExportRequest {
  tenant_id: string;
  include_formulas?: boolean;
}

interface SemanticSchema {
  subjects: SubjectMetadata[];
  departments: DepartmentMetadata[];
  periods: PeriodMetadata[];
  kpi_formulas: KpiFormula[];
  updated_at: Date;
}

class SemanticLayerService {
  async exportSchema(req: SemanticSchemaExportRequest): Promise<SemanticSchema>
  async resolvePeriod(expression: string, ref_date: Date): Promise<Period>
}
```

### API Contract

**BFF Controller**:
```
GET /api/ai/semantic-schema
  request: { tenant_id? (from auth) }
  response: SemanticSchema
  cache: 1 hour

POST /api/ai/resolve-period
  request: { expression, reference_date }
  response: { fiscal_year, period_no, label }
  cache: none (deterministic)
```

---
```

**出力**: design.md が生成される

---

#### Step D: spec-tasks

**実行**:
```bash
/kiro:spec-tasks "ai/_shared/semantic-layer"
```

**プロンプト内容**:
```
## 実装タスク：Semantic Layer

### Database層 (1-2日)

- [ ] Task 1.1: Prisma schema 更新 (subjects.metadata 追加)
  実行: `npx prisma migrate create --name add_subject_metadata`
  検証: Migration 作成完了

- [ ] Task 1.2: Prisma schema 更新 (departments.hierarchy_path 追加)
  実行: `npx prisma migrate create --name add_department_hierarchy`

- [ ] Task 1.3: Prisma schema 更新 (periods.relative_names 追加)
  実行: `npx prisma migrate create --name add_period_relative_names`

- [ ] Task 1.4: migrate deploy
  実行: `npx prisma migrate deploy`
  検証: DB 接続確認

- [ ] Task 1.5: RLS ポリシー設定
  実行: PostgreSQL に RLS ポリシー適用
  検証: tenant_id による行分離が機能

### Repository層 (1日)

- [ ] Task 2.1: SubjectRepository.findWithMetadata() 実装
  参照: `apps/api/src/modules/master-data/subject/`
  パターン: KPI Master のリポジトリを参考に

- [ ] Task 2.2: DepartmentRepository.findWithHierarchy() 実装

- [ ] Task 2.3: PeriodRepository.findByRelativeName() 実装

### Service層 (2-3日)

- [ ] Task 3.1: PeriodResolverService 実装
  file: `apps/api/src/modules/ai/_shared/semantic-layer/period-resolver.service.ts`
  テスト対象:
    - "今期" → { fiscal_year: 2026, period_no: 3 }
    - "前期" → { fiscal_year: 2026, period_no: 2 }
    - "前年同月" → { fiscal_year: 2025, period_no: 3 }
    - "Q1" → { period_no: 1 }
    - "Q3" → { period_no: 3 }

- [ ] Task 3.2: SemanticLayerService 実装
  file: `apps/api/src/modules/ai/_shared/semantic-layer/semantic-layer.service.ts`
  主要メソッド:
    - exportSchema(tenantId): Promise<SemanticSchema>
    - resolvePeriod(expression, refDate): Promise<Period>

- [ ] Task 3.3: キャッシュ層実装 (Redis or Memory)
  実装: exportSchema() の結果を 1 時間キャッシュ

### Controller層 (1日)

- [ ] Task 4.1: SemanticLayerController 実装 (Domain API)
  file: `apps/api/src/modules/ai/_shared/semantic-layer/semantic-layer.controller.ts`
  endpoints:
    - GET /ai/semantic-schema
    - POST /ai/resolve-period

- [ ] Task 4.2: BFF ゲートウェイ実装
  file: `apps/bff/src/modules/ai/_shared/semantic-layer/semantic-layer.controller.ts`
  責務: リクエスト検証、契約マッピング、エラーハンドリング

### テスト (1-2日)

- [ ] Task 5.1: ユニットテスト - PeriodResolverService
  テストケース: 10 パターン × 複数の reference_date

- [ ] Task 5.2: ユニットテスト - SemanticLayerService
  テストケース: メタデータ取得、キャッシュ動作

- [ ] Task 5.3: 統合テスト - API endpoints
  テストケース: tenant_id フィルタリング確認、RLS動作確認

- [ ] Task 5.4: パフォーマンステスト
  検証: Semantic Schema 取得 < 1 秒

### ドキュメント (1日)

- [ ] Task 6.1: 実装ガイド作成
  内容: 新しい AI エンジニアが PeriodResolver を使える手順書

- [ ] Task 6.2: API ドキュメント (OpenAPI/Swagger)

---
```

**出力**: tasks.md （チェックボックス付き）

---

## Part 2: 契約（Contract）の準備

### 必須確認項目

以下のファイルを確認し、不足があれば追加:

```bash
# Step 1: AI コントラクトの確認
cat packages/contracts/src/bff/ai/index.ts

# Step 2: 不足する型を追加（必要に応じて）
# 以下は「必ず存在すべき」型
```

### 必須となるBFFコントラクト型

**ファイル**: `packages/contracts/src/bff/ai/index.ts`

```typescript
// ============================================
// 1. Base Types (Shared)
// ============================================

export interface PeriodDto {
  fiscal_year: number;
  period_no: number;
  display_label: string;
}

export interface DepartmentDto {
  stable_id: string;
  name: string;
  hierarchy_path: string;
}

export interface SubjectDto {
  code: string;
  name: string;
  type: 'Revenue' | 'Cost' | 'Asset' | 'Liability' | 'Equity';
  description?: string;
}

// ============================================
// 2. Semantic Layer Contracts
// ============================================

export interface SemanticSchemaDto {
  subjects: SubjectDto[];
  departments: DepartmentDto[];
  periods: PeriodDto[];
  kpi_formulas?: KpiFormulaDto[];
  updated_at: Date;
}

export interface PeriodResolutionRequestDto {
  expression: string; // "今期", "前年同期"
  reference_date: Date;
}

export interface PeriodResolutionResponseDto {
  fiscal_year: number;
  period_no: number;
  display_label: string;
}

// ============================================
// 3. Anomaly Detection Contracts
// ============================================

export interface AnomalyAlertDto {
  id: string;
  subject_code: string;
  anomaly_type: 'threshold_violation' | 'duplicate' | 'negative_value';
  severity: 'high' | 'medium' | 'low';
  expected_value: number;
  actual_value: number;
  status: 'open' | 'confirmed' | 'ignored';
  created_at: Date;
}

export interface AnomalyAlertsRequestDto {
  period_no?: number;
  status?: 'open' | 'confirmed' | 'ignored';
}

export interface AnomalyAlertsResponseDto {
  alerts: AnomalyAlertDto[];
  summary: {
    total: number;
    high_severity_count: number;
  };
}

// ============================================
// 4. Variance Analysis Contracts
// ============================================

export interface VarianceItemDto {
  subject_code: string;
  subject_name: string;
  variance_amount: number;
  variance_percentage: number;
  trend?: 'up' | 'down' | 'stable';
  ai_hypothesis?: string;
  hypothesis_confidence?: number; // 0-100
}

export interface VarianceReportRequestDto {
  fiscal_year: number;
  period_no: number;
  department_stable_id?: string;
}

export interface VarianceReportResponseDto {
  period: PeriodDto;
  summary: string; // AI-generated summary
  top_variances: VarianceItemDto[];
  overall_assessment: string;
  generated_at: Date;
}

// ============================================
// 5. NLQ Contracts
// ============================================

export interface NlqQueryRequestDto {
  query: string; // "9月の売上高は？"
  session_id?: string;
  context?: {
    focus_department?: string;
    focus_period?: PeriodDto;
  };
}

export interface NlqQueryResponseDto {
  answer: string; // AI-generated natural language response
  data?: {
    values: number[];
    subjects: string[];
    periods: PeriodDto[];
  };
  sources: string[]; // データソース（監査証跡）
  confidence: number; // 0-100
  follow_up_actions?: string[]; // "詳細を見る" など
}

// ============================================
// 6. Graph Generation Contracts
// ============================================

export interface GraphGenerationRequestDto {
  data_query: string; // NLQ と同じ
  preferred_chart_type?: 'line' | 'bar' | 'pie' | 'table';
}

export interface GraphDataDto {
  type: 'line' | 'bar' | 'pie' | 'table';
  title: string;
  xAxis?: string[];
  yAxis?: string[];
  series: Array<{ name: string; data: number[] }>;
  narrative?: string;
}

export interface GraphGenerationResponseDto {
  chart: GraphDataDto;
  export_url?: string; // PNG/PDF エクスポート用
}

// ============================================
// 7. Chat Bot Contracts
// ============================================

export interface ChatBotMessageRequestDto {
  message: string;
  session_id: string;
  conversation_history?: ChatMessageDto[]; // 前のターン
}

export interface ChatMessageDto {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data_context?: object;
}

export interface ChatBotMessageResponseDto {
  message: string;
  session_id: string;
  data?: object; // グラフ or テーブル
  suggestions: string[]; // 次のステップ提案
  actions: Array<{ label: string; type: string; payload: object }>;
}

// ============================================
// 8. Export all for easy import
// ============================================

export * from './semantic-layer.types';
export * from './anomaly-detection.types';
export * from './variance-analysis.types';
export * from './nlq.types';
export * from './graph-generation.types';
export * from './chat-bot.types';
```

### 確認手順

```bash
# 1. ファイルが存在するか確認
ls -la packages/contracts/src/bff/ai/

# 2. TypeScript エラーがないか確認
npm run typecheck

# 3. エクスポートが完全か確認
grep "export interface" packages/contracts/src/bff/ai/index.ts | wc -l
# 出力: 20+ であれば OK
```

---

## Part 3: Week ごとの実行スケジュール

### Week 1: Foundation - Semantic Layer

**Day 1-2: 仕様化**
```bash
/kiro:spec-init "ai/_shared/semantic-layer"
/kiro:spec-requirements "ai/_shared/semantic-layer"
/kiro:spec-design "ai/_shared/semantic-layer"
```

**Day 3: Design Review**
- Tech Lead + Architects で仕様をレビュー
- `.kiro/steering/` に沿っているか確認
- Contract との整合性確認

**Day 4-5: Task 分解**
```bash
/kiro:spec-tasks "ai/_shared/semantic-layer"
```

**Week 1 終了時**:
- [ ] requirements.md が完成し、Product Owner が承認
- [ ] design.md が完成し、Tech Lead が承認
- [ ] tasks.md が生成され、Engineers がタスク割当を理解

---

### Week 2: Foundation - Entities & LLM Service

**並行実施** (Semantic Layer 実装と並行):

```bash
# Day 1-2: AI Entities 仕様化
/kiro:spec-init "ai/_shared/entities"
/kiro:spec-requirements "ai/_shared/entities"
/kiro:spec-design "ai/_shared/entities"
/kiro:spec-tasks "ai/_shared/entities"

# Day 3-4: LLM Service 仕様化
/kiro:spec-init "ai/_shared/llm-service"
/kiro:spec-requirements "ai/_shared/llm-service"
/kiro:spec-design "ai/_shared/llm-service"
/kiro:spec-tasks "ai/_shared/llm-service"
```

**Week 2 終了時**:
- [ ] 3つの Foundation 仕様が全て完成
- [ ] DB schema (Prisma) の migration が生成完了
- [ ] LLM adapter の実装パターンが明確

---

### Week 3-4: P0 Features - Specification

**並行実施**:

```bash
# Week 3, Day 1-2: Anomaly Detection 仕様化（最速）
/kiro:spec-init "ai/anomaly-detection"
/kiro:spec-requirements "ai/anomaly-detection"
/kiro:spec-design "ai/anomaly-detection"
/kiro:spec-tasks "ai/anomaly-detection"

# Week 3, Day 3-4: Variance Analysis 仕様化
/kiro:spec-init "ai/variance-analysis"
/kiro:spec-requirements "ai/variance-analysis"
/kiro:spec-design "ai/variance-analysis"
/kiro:spec-tasks "ai/variance-analysis"

# Week 4, Day 1-2: NLQ 仕様化
/kiro:spec-init "ai/nlq"
/kiro:spec-requirements "ai/nlq"
/kiro:spec-design "ai/nlq"
/kiro:spec-tasks "ai/nlq"
```

**Week 4 終了時**:
- [ ] 3つの P0 Feature 仕様が完成
- [ ] Prompt Engineer が「NLQ の 5 パターン」を設計完了
- [ ] 実装開始準備完了

---

## Part 4: 仕様化時のコツ（Common Pitfalls を避ける）

### ❌ してはいけないこと

1. **Requirements なしで Design を作る**
   - 「とりあえず設計図を書こう」→ 後で要件が変わる = 無駄
   - **必ず requirements.md で ビジネス要件 を明確化**

2. **Design を Design Review なしで進める**
   - 実装に入ってから「あ、RLS が考慮されていない」→ 手戻り
   - **Design Review（Architects + PM）は必須ゲート**

3. **Prompt Engineering を後回しにする**
   - 実装後に「AI の出力品質が悪い」→ 難しい修正
   - **Design 段階で Prompt も試作してテスト**

4. **Multi-Tenant 要件を軽視する**
   - 「あ、tenant_id でフィルタ漏れしてた」= セキュリティホール
   - **Product Owner / Tech Lead による RLS 監査は必須**

### ✅ すべきこと

1. **Requirements は User Story フォーマットで**
   ```
   As a CFO
   I want to understand variance causes automatically
   So that I can make faster decisions in monthly review

   Acceptance Criteria:
   - AI generates 3+ hypotheses within 3 seconds
   - Each hypothesis includes confidence score (0-100)
   - System logs sources for audit trail
   ```

2. **Design には Data Flow Diagram を含める**
   ```
   fact_amounts → AnomalyDetector → ai_anomaly_alerts → BFF → UI
   ```

3. **Database Schema Changes を早めに計画**
   - Prisma migration の実行タイミング
   - RLS ポリシーの PostgreSQL コマンド

4. **Test Plan を Design に含める**
   ```
   テストケース:
   - Happy Path: 正常な期間入力 → 正しい fiscal_year 返却
   - Edge Case: "Q1" → period_no=1（fiscal_year_start_month=4 の企業）
   - Error Case: 存在しない期間表現 → エラーレスポンス
   ```

---

## Part 5: チーム構成 & ロール

### 仕様化フェーズ（Weeks 1-4）

| ロール | 人数 | 責務 | Time |
|--------|------|-----|------|
| **Product Manager** | 1 | requirements.md の正確性確認 | 20% |
| **Tech Lead** | 1 | design.md のレビュー、Design Review 主導 | 40% |
| **AI Engineer** | 0.5 | Semantic Layer 詳細設計、Prompt 初期実装 | 50% |
| **Backend Engineer** | 1 | Database / API 設計、tasks.md レビュー | 30% |

### 実装フェーズ（Weeks 5-20）

| ロール | 人数 | 責務 | Time |
|--------|------|-----|------|
| **Backend Engineer** | 2 | Semantic Layer, Anomaly, Variance, NLQ 実装 | 100% |
| **Frontend Engineer** | 1 | Chat Widget, Alert UI, Graph UI 実装 | 100% |
| **Prompt Engineer** | 0.5 | LLM Prompts, Testing, Tuning | 50% |

---

## Part 6: リスク & 緊急対応

### リスク 1: 要件定義が曖昧で進まない

**症状**: requirements.md を何度も修正

**対策**:
- Domain Expert（CFO/FP&A Manager）をレビュアーに招く
- User Story のテンプレートを厳密に使う
- Acceptance Criteria を「テスト可能」な形に

### リスク 2: Prompt の品質が低い

**症状**: AI の回答が不正確 / ハルシネーション多発

**対策**:
- Design 段階で 10 パターン以上のテストデータで検証
- RAG（Retrieval）を必ず組込む（根拠データを提示）
- Confidence Score を必須化（100% の確度でない場合は明示）

### リスク 3: RLS ポリシーで情報漏洩

**症状**: Tenant A が Tenant B のデータを見える

**対策**:
- Design Review で RLS 監査人を必須化
- 統合テストで必ず Cross-Tenant Access テストを実施
- PostgreSQL の RLS ポリシーを外部監査

---

## Part 7: 成功のサイン

### Week 1-2 終了時

- ✅ 3つの Foundation 仕様が全て承認済み
- ✅ Database migration が生成完了（エラーなし）
- ✅ LLM adapter の実装方向が確定
- ✅ チーム全体が「何をするか」を理解

### Week 3-4 終了時

- ✅ 3つの P0 Feature 仕様が承認済み
- ✅ BFF Contract（ai/index.ts）が完成
- ✅ Prompt Engineer が「NLQ の 5 パターン」を実装開始
- ✅ Design Review による「GO サイン」を取得

### Week 5-6 開始時

- ✅ 実装タスクを Engineers に assign
- ✅ Git ブランチを作成 (`ai/phase-1a-foundation`)
- ✅ PR レビュープロセスを決定（RLS 監査を含む）
- ✅ 実装開始 🚀

---

## Part 8: テンプレート & チェックリスト

### 仕様化前チェック（開始前に全て確認）

```
□ product.md の Phase 1-4 を理解済み
□ development-process.md の CCSDD workflow を理解済み
□ tech.md の Multi-Tenant / RLS 要件を理解済み
□ 既存プロジェクト（KPI Master）の仕様を確認済み
□ チーム全体がロードマップに同意済み
□ Prompt Engineer を確保済み
□ Design Review 担当者を決定済み
```

### 各仕様化ステップのチェック

**requirements.md 完了チェック**:
```
□ User Stories が 5+ 個定義済み
□ Acceptance Criteria が「テスト可能」な形
□ Business Value が明確
□ Dependencies が記載済み
□ Non-Functional Requirements（RLS, Performance等）が含まれる
□ Product Owner / PM が承認済み
```

**design.md 完了チェック**:
```
□ Architecture Diagram が存在
□ Data Flow Diagram が存在
□ Database Schema Changes が明記
□ API Contracts（BFF）が明記
□ Error Handling Strategy が定義
□ Security Considerations（RLS, PII等）が含まれる
□ Tech Lead / Architect が承認済み
```

**tasks.md 完了チェック**:
```
□ 実装タスクが 10+ 個分解済み
□ 各タスクが「1-2 日」の単位に分割可能
□ Dependencies が明記済み
□ Test ケースが含まれる
□ Engineers が「この作業はできる」と確信
□ Estimated effort が見積もられている
```

---

## 最後に：明日から始めるアクション

### 本日（Day 0）の宿題

1. **このドキュメント（実行ガイド）を読む** (30分)
2. **AI機能ロードマップを読む** (30分)
3. **development-process.md を読む** (20分)

**合計**: 80 分

### 明日（Day 1）

```bash
# Step 1: 現在の Spec 状況確認
ls -la .kiro/specs/ai/

# Step 2: Semantic Layer 仕様化開始
/kiro:spec-init "ai/_shared/semantic-layer"
```

### Day 3 (本週 end)

- 仕様化完了デモ
- チーム Design Review
- 実装開始準備完了

---

**Next Action**: `/kiro:spec-init "ai/_shared/semantic-layer"` を実行してください！

**Questions?** このドキュメントまたは `.kiro/specs/仕様概要/AI機能ロードマップ_2026年実装戦略.md` を参照してください。
