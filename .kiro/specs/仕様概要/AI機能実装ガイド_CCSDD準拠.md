# AI機能実装ガイド：CCSDD準拠の実行手引き

**対象**: AI機能の実装チーム（Backend、Frontend、AI/Prompt Engineers）
**参考**: AI機能ロードマップ_2026年実装戦略.md
**更新日**: 2026年1月30日

---

## 📋 概要

このドキュメントは、AI機能ロードマップをCCSDD（Contract-Centered Specification Driven Development）に沿って実装するための**週単位の実行手引き**です。

**原則**:
- ✅ 仕様（Requirements）→ 設計（Design）→ タスク（Tasks）の順序は絶対
- ✅ 実装前に必ず Contract（packages/contracts）を定義
- ✅ Multi-Tenant × RLS 無視禁止
- ✅ UI は BFF 経由のみ、API 直接呼び出し禁止

---

## 🎯 Phase 1A Foundation（Weeks 1-6）

### Week 1：Semantic Layer 仕様化

#### Task 1.1: 仕様ファイル作成

```bash
# プロジェクトルートで実行

# 1. Semantic Layer 初期化
/kiro:spec-init "ai/_shared/semantic-layer"

# プロンプト内容（以下を参考に調整）:
"""
Context: EPM プロジェクトにおいて、生成AI機能が正確にビジネスデータを理解・処理するための
メタデータ層を構築する。これは NLQ (自然言語クエリ)、RAG、エンティティ解決などの
AI 機能すべての基盤となる。

Scope:
- 既存の subjects（勘定科目）、departments（部門）、metrics（指標）に対する
  メタデータ拡張（説明、代替名、単位、階層情報）
- Period Resolver：相対的な期間表現（「今期」「前年同期」「Q3」）を fiscal_year + period_no に変換
- Semantic JSON エクスポート：LLM が読み込める形式で構造化データスキーマを提供
- Multi-Tenant セキュリティ：全メタデータに tenant_id フィルタリング

Dependencies:
- 既存テーブル：subjects, departments, periods, fact_amounts
- Prisma ORM（既存スタック）
"""
```

#### Task 1.2: 要件定義

```bash
/kiro:spec-requirements "ai/_shared/semantic-layer"

# 以下の要件を含める：

Requirement-1: Subject メタデータ拡張
  - code, name（既存）
  - description（AI向け説明）
  - alternative_names（複数個、「売上」「売上高」「sales」）
  - subject_type（「revenue」「cost」「asset」）
  - unit（「JPY」「units」）
  - formula（計算式がある場合）
  - parent_id（階層構造）

Requirement-2: Department メタデータ拡張
  - stable_id, name（既存）
  - hierarchy_path（「本社/営業部/東営業所」）
  - alternative_names（「営業」「Sales Dept」）
  - is_reporting_unit（レポート対象か）
  - cost_center_id（管理会計連携）

Requirement-3: Period Resolver サービス
  - Input: 「今期」「前年同期」「先月」「3ヶ月前」など日本語表現
  - Output: { fiscal_year, period_no, display_label }
  - 精度目標: 20パターン = 100% 正答
  - キャッシング: メタデータは変更頻度低い → キャッシュ1時間

Requirement-4: Semantic JSON スキーマ
  - エンドポイント: GET /api/ai/semantic-schema?tenant_id=XXX
  - 形式: LLM が読み込みやすい JSON
  - 含める情報: 全 subject、全 department、KPI 計算式、期間定義、単位
  - サイズ: < 1MB（LLMコンテキスト効率）

Requirement-5: Multi-Tenant セキュリティ
  - 全クエリに WHERE tenant_id = ? フィルタ
  - Semantic Layer service への入力は必ず tenant_id を含む
  - テスト: 異なる tenant_id でアクセス試行 → ブロック確認

Acceptance Criteria:
  - [ ] Period Resolver が 20 パターンで 100% 正答
  - [ ] Semantic JSON エクスポートが < 1 秒で完了
  - [ ] RLS テスト = 異 tenant 間でメタデータ漏洩なし
  - [ ] キャッシュヒット率 > 90%（初日）
```

#### Task 1.3: 技術設計

```bash
/kiro:spec-design "ai/_shared/semantic-layer"

# 含めるべき設計項目：

Design-1: データベーススキーマ拡張
  Prisma schema に以下カラムを追加:

  model Subject {
    // 既存
    code, name, type, deleted_at

    // 追加（AI向け）
    description: String?          // 「売上高は当期の全売上」
    metadata_json: Json?          // { alternatives, unit, formula }
    created_at, updated_at
  }

  model Department {
    // 既存
    stable_id, name, company_id, deleted_at

    // 追加（AI向け）
    hierarchy_level: Int?         // 1=本社, 2=営業部, 3=東営業所
    hierarchy_path: String?       // JSONPath格式
    metadata_json: Json?          // { alternatives, cost_center }
    is_reporting_unit: Boolean @default(true)
    created_at, updated_at
  }

Design-2: PeriodResolver サービス実装
  Location: apps/api/src/modules/ai/_shared/semantic-layer/period-resolver.service.ts

  class PeriodResolverService {
    constructor(private prisma: PrismaService) {}

    async resolvePeriodExpression(
      tenantId: string,
      expression: string,  // 「今期」「前年同期」など
      referenceDate?: Date
    ): Promise<{ fiscal_year: number; period_no: number }> {
      // 実装：日本語表現 → 期間マッピング
      // キャッシュ: Redis or Memory (time-based)
    }
  }

  サポート範囲（Week 1 優先）:
    - 「今期」「当期」
    - 「先月」「前月」
    - 「9月」「第3四半期」
    - 「前年同期」
    - 「前年」「去年」
    - 「今年」「当年」
    - 「去年同月」
    - 「3ヶ月前」

Design-3: Semantic Layer Service
  Location: apps/api/src/modules/ai/_shared/semantic-layer/semantic-layer.service.ts

  class SemanticLayerService {
    constructor(
      private prisma: PrismaService,
      private periodResolver: PeriodResolverService,
      private cache: CacheService
    ) {}

    async getSemanticSchema(tenantId: string): Promise<SemanticSchemaDto> {
      // キャッシュ確認 → JSON生成 → キャッシュ保存
      // 返値形式:
      // {
      //   subjects: { code, name, description, alternatives, unit, formula }[],
      //   departments: { stable_id, name, hierarchy_path, alternatives }[],
      //   periods: { fiscal_year, period_no, display_label }[],
      //   kpi_definitions: { kpi_code, name, formula, unit }[]
      // }
    }

    async enrichQuery(
      tenantId: string,
      userQuery: string
    ): Promise<EnrichedQueryDto> {
      // ユーザークエリをメタデータで拡張
      // 例：「売上」→ { candidates: [subject_code_1, subject_code_2], ... }
    }
  }

Design-4: BFF Contract 定義
  Location: packages/contracts/src/bff/ai/_shared/semantic-layer.ts

  export interface SemanticSchemaDto {
    subjects: SubjectMetadataDto[];
    departments: DepartmentMetadataDto[];
    periods: PeriodDto[];
    kpi_definitions: KpiDefinitionDto[];
  }

  export interface SubjectMetadataDto {
    code: string;
    name: string;
    description: string;
    alternative_names: string[];
    unit: string;
    formula?: string;
    subject_type: 'revenue' | 'cost' | 'asset' | 'liability' | 'equity';
  }

Design-5: キャッシング戦略
  - In-Memory キャッシュ (node-cache)
  - TTL: 1 時間（メタデータは変更頻度低）
  - キー: `semantic_schema:${tenant_id}`
  - クリア: メタデータ更新時に自動クリア

Design-6: テスト戦略
  - Unit: PeriodResolver の 20 パターン全テスト
  - Integration: DB からメタデータ取得 → JSON生成 → LLM読み込みテスト
  - Multi-Tenant: 異 tenant で isolation 確認
```

#### Task 1.4: 実装タスク分解

```bash
/kiro:spec-tasks "ai/_shared/semantic-layer"

# 以下タスクを生成:

Task-1.4.1: Prisma Schema 更新
  [ ] subjects に description, metadata_json 追加
  [ ] departments に hierarchy_level, hierarchy_path, metadata_json, is_reporting_unit 追加
  [ ] npx prisma migrate dev --name "add-ai-metadata"
  [ ] Migration テスト実行

Task-1.4.2: PeriodResolver Service 実装
  [ ] apps/api/src/modules/ai/_shared/semantic-layer/period-resolver.service.ts 作成
  [ ] 20 パターンの相対期間表現を解析する logiic 実装
  [ ] Unit テスト 20 ケース（全 PASS）
  [ ] キャッシング機能追加

Task-1.4.3: SemanticLayer Service 実装
  [ ] apps/api/src/modules/ai/_shared/semantic-layer/semantic-layer.service.ts 作成
  [ ] getSemanticSchema 実装（キャッシング付き）
  [ ] enrichQuery 実装
  [ ] Unit テスト 10 ケース以上

Task-1.4.4: BFF Contract 定義
  [ ] packages/contracts/src/bff/ai/_shared/semantic-layer.ts 作成
  [ ] SemanticSchemaDto, SubjectMetadataDto 等 型定義
  [ ] packages/contracts/src/index.ts に export 追加

Task-1.4.5: Domain API Controller 実装
  [ ] apps/api/src/modules/ai/_shared/semantic-layer/semantic-layer.controller.ts 作成
  [ ] GET /api/ai/semantic-schema エンドポイント
  [ ] Tenant ID バリデーション
  [ ] Integration テスト（DB + キャッシュ）

Task-1.4.6: Integration テスト
  [ ] PeriodResolver × DB の結合テスト
  [ ] SemanticSchema JSON サイズ < 1MB 確認
  [ ] キャッシュヒット率 > 90% 確認
  [ ] Multi-Tenant isolation テスト

Task-1.4.7: ドキュメント
  [ ] README：Period Resolver の使用方法
  [ ] README：Semantic Schema の形式
  [ ] API ドキュメント更新
```

---

#### Week 1 チェックリスト

- [ ] `/kiro:spec-init` → requirements → design → tasks の 4 コマンド完了
- [ ] Prisma migration 作成・テスト通過
- [ ] PeriodResolver Unit テスト 20/20 ケース PASS
- [ ] SemanticLayer Service 動作確認（ローカル DB で実行）
- [ ] BFF Contract 定義完了
- [ ] Multi-Tenant isolation テスト PASS
- [ ] Code Review 完了

**期待結果**: Semantic Layer が完全に動作。Week 2 で AI Entities（DB）に進むための基盤が完成。

---

### Week 2：AI Entities（データベース）仕様化

#### Task 2.1-2.7: データベース仕様化

```bash
/kiro:spec-init "ai/_shared/entities"
/kiro:spec-requirements "ai/_shared/entities"
/kiro:spec-design "ai/_shared/entities"
/kiro:spec-tasks "ai/_shared/entities"
```

**要件ポイント**:

```
Requirement-1: ai_conversations テーブル
  - Multi-turn dialogue を保存
  - Session ベース管理
  - Tenant × User × Session でパーティショニング

Requirement-2: ai_knowledge_base テーブル
  - pgvector 拡張を使用
  - RAG 用埋め込みベクトルを保存
  - 過去コメント、レポート、会議記録の埋め込み
  - Tenant ごとの検索可能

Requirement-3: ai_audit_logs テーブル
  - 全 AI クエリをログ
  - Cost 追跡（Input/Output tokens × LLM 価格）
  - User attribution（誰がクエリしたか）
  - Compliance：1 年間の保存

Requirement-4: ai_anomaly_alerts テーブル
  - 異常検知結果を保存
  - User confirmation status
  - Learning loop（false positive 率 追跡）

Requirement-5: RLS ポリシー
  - 全テーブルに tenant_id ベースの RLS 有効化
  - User role ベース制限（admin のみ cross-tenant 監査可）
```

**設計ポイント**:

```
Design-1: Prisma Schema
model ai_conversation {
  id            String    @id @default(cuid())
  tenant_id     String
  session_id    String    // UUID
  user_id       String
  messages      Json      // Array<{ role, content, timestamp }>
  context       Json?     // { department, period, company } など
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  @@index([tenant_id, session_id])
  @@index([tenant_id, user_id])
}

model ai_knowledge_base {
  id            String    @id @default(cuid())
  tenant_id     String
  source_type   String    // "comment" | "report" | "meeting_note"
  source_id     String    // Reference to comments/reports
  content       String
  embedding     Vector(1536) // pgvector
  metadata      Json?     // { period, department, subject }
  created_at    DateTime  @default(now())

  @@index([tenant_id])
  @@index([tenant_id, source_type])
}

model ai_audit_log {
  id            String    @id @default(cuid())
  tenant_id     String
  user_id       String
  feature       String    // "nlq" | "variance_analysis" | "anomaly"
  query         String
  response      String    @db.LongText
  model         String    // "claude-3.5-sonnet" | "gpt-4o"
  input_tokens  Int
  output_tokens Int
  cost_jpy      Float
  latency_ms    Int?
  error_message String?
  created_at    DateTime  @default(now())

  @@index([tenant_id, created_at desc])
  @@index([tenant_id, feature])
}

model ai_anomaly_alert {
  id            String    @id @default(cuid())
  tenant_id     String
  company_id    String
  period_no     Int
  subject_code  String
  anomaly_type  String    // "threshold_violation" | "duplicate" | "negative_value"
  severity      String    // "high" | "medium" | "low"
  expected_value Float?
  actual_value  Float
  rule_name     String
  status        String    // "open" | "confirmed" | "ignored"
  confirmed_by  String?   // User ID
  notes         String?
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  @@index([tenant_id, status])
  @@index([tenant_id, created_at desc])
}

Design-2: RLS ポリシー（PostgreSQL）
-- PostgreSQL RLS setup (execute directly)
ALTER TABLE ai_conversation ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_conversation_tenant_policy ON ai_conversation
  USING (tenant_id = current_setting('app.tenant_id'));

-- 他のテーブルも同様

Design-3: マイグレーション計画
  1. pgvector extension 有効化
  2. 4 テーブル作成
  3. インデックス作成
  4. RLS ポリシー適用
  5. テスト DB で検証
  6. 本番適用

Design-4: インデックス最適化
  - tenant_id + created_at で複合インデックス
  - Vector インデックス（pgvector 用）
  - session_id 単独インデックス（会話検索）
```

**実装タスク**:

```
Task-2.1: pgvector 拡張有効化
  [ ] CREATE EXTENSION IF NOT EXISTS vector;

Task-2.2: Prisma Schema 更新
  [ ] schema.prisma に 4 モデル追加
  [ ] generator に "prisma-client-js" 確認

Task-2.3: Migration 作成・実行
  [ ] npx prisma migrate dev --name "add-ai-tables"
  [ ] .prisma/migrations/ に SQL ファイル生成確認

Task-2.4: RLS ポリシー設定
  [ ] 各テーブルに RLS 有効化
  [ ] 各テーブルに tenant_id ポリシー作成

Task-2.5: Repository 層実装
  [ ] AI Conversation Repository
  [ ] AI Knowledge Base Repository
  [ ] AI Audit Log Repository
  [ ] AI Anomaly Alert Repository

Task-2.6: Integration テスト
  [ ] 各テーブルへの INSERT/SELECT テスト
  [ ] RLS isolation テスト（異 tenant でアクセス不可）
  [ ] Vector insert/search テスト

Task-2.7: ドキュメント
  [ ] DB スキーマドキュメント
  [ ] RLS ポリシー説明
  [ ] マイグレーション手順
```

#### Week 2 チェックリスト

- [ ] `/kiro:spec-init` → requirements → design → tasks 完了
- [ ] Prisma migration テスト通過
- [ ] RLS ポリシー検証テスト PASS
- [ ] Repository テスト 20/20 ケース PASS
- [ ] Code Review 完了

**期待結果**: AI データ格納基盤が完成。Week 3 で LLM Service に進むための準備完了。

---

### Week 3：LLM Service Adapter 仕様化

#### Task 3.1-3.5: LLM Service 仕様化

```bash
/kiro:spec-init "ai/_shared/llm-service"
/kiro:spec-requirements "ai/_shared/llm-service"
/kiro:spec-design "ai/_shared/llm-service"
/kiro:spec-tasks "ai/_shared/llm-service"
```

**要件ポイント**:

```
Requirement-1: Claude 3.5 Sonnet 統合
  - Anthropic Node SDK (@anthropic-ai/sdk) 使用
  - Model: claude-3-5-sonnet-20241022
  - Max tokens: 4096 (default)

Requirement-2: Request/Response ロギング
  - ai_audit_logs に全クエリ記録
  - Input/Output tokens 計数
  - Cost 計算：日本円（JPY）
  - Latency 測定

Requirement-3: エラーハンドリング
  - API エラー（Rate Limit, Timeout）→ Retry logic
  - LLM からのエラー → User-friendly メッセージ
  - Fallback to GPT-4o （Cost 最適化）

Requirement-4: マルチテナント Cost Management
  - Tenant ごとの月間 Cost キャップ設定
  - 超過時の警告 → Disable
  - Cost Dashboard（可視化）

Requirement-5: Prompt Engineering
  - System prompt の外部化（config から読み込み）
  - Temperature, Top-P 設定可能
  - Few-shot examples サポート
```

**設計ポイント**:

```
Design-1: LlmService インターフェース
Location: apps/api/src/modules/ai/_shared/llm-service/llm-service.interface.ts

export interface LlmService {
  complete(
    tenantId: string,
    userId: string,
    request: LlmCompleteRequest
  ): Promise<LlmCompleteResponse>;
}

export interface LlmCompleteRequest {
  model: 'claude-3.5-sonnet' | 'gpt-4o';
  system?: string;
  user_message: string;
  max_tokens?: number;
  temperature?: number;
  feature: string; // "variance_analysis", "nlq", etc.
}

export interface LlmCompleteResponse {
  message: string;
  input_tokens: number;
  output_tokens: number;
  cost_jpy: number;
  model: string;
  latency_ms: number;
}

Design-2: ClaudeAdapter 実装
Location: apps/api/src/modules/ai/_shared/llm-service/adapters/claude.adapter.ts

export class ClaudeAdapter implements LlmService {
  constructor(
    private client: Anthropic,
    private auditLogger: AiAuditLogService,
    private costManager: AiCostManagementService
  ) {}

  async complete(
    tenantId: string,
    userId: string,
    request: LlmCompleteRequest
  ): Promise<LlmCompleteResponse> {
    const startTime = Date.now();

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: request.max_tokens || 4096,
        system: request.system || this.getDefaultSystemPrompt(),
        messages: [
          { role: 'user', content: request.user_message }
        ],
        temperature: request.temperature || 0.7
      });

      const content = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;
      const costJpy = this.calculateCost('claude-3.5-sonnet', inputTokens, outputTokens);
      const latencyMs = Date.now() - startTime;

      // Log to audit
      await this.auditLogger.log({
        tenant_id: tenantId,
        user_id: userId,
        feature: request.feature,
        query: request.user_message,
        response: content,
        model: 'claude-3.5-sonnet',
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_jpy: costJpy,
        latency_ms: latencyMs
      });

      // Cost management check
      await this.costManager.checkCostLimit(tenantId, costJpy);

      return {
        message: content,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_jpy: costJpy,
        model: 'claude-3.5-sonnet',
        latency_ms: latencyMs
      };
    } catch (error) {
      // Log error
      // Fallback to GPT-4o or throw
    }
  }

  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    // Claude 3.5 Sonnet pricing (2026/01 rates)
    const inputPrice = 0.003; // $0.003 / 1M tokens
    const outputPrice = 0.015; // $0.015 / 1M tokens
    const exchangeRate = 145; // JPY per USD (approximate)

    const costUsd = (inputTokens * inputPrice + outputTokens * outputPrice) / 1_000_000;
    const costJpy = costUsd * exchangeRate;

    return Math.round(costJpy * 100) / 100; // 2 decimals
  }

  private getDefaultSystemPrompt(): string {
    return `You are a financial analyst assistant for an EPM system.
Your role is to analyze financial data and provide insights in Japanese.
Always cite data sources and show calculations.
Never make assumptions; if data is incomplete, say so.`;
  }
}

Design-3: Cost Management
Location: apps/api/src/modules/ai/_shared/llm-service/cost-management.service.ts

export class AiCostManagementService {
  async checkCostLimit(tenantId: string, costJpy: number): Promise<void> {
    const tenant = await this.getTenantConfig(tenantId);
    const monthlyUsage = await this.getMonthlyUsage(tenantId);

    if (monthlyUsage + costJpy > tenant.ai_cost_cap_jpy) {
      throw new Error(`AI cost limit exceeded for tenant ${tenantId}`);
    }
  }
}

Design-4: Retry Logic
使用ライブラリ: exponential-backoff

const exponentialBackoff = {
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  maxRetries: 3
};

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config = exponentialBackoff
): Promise<T> {
  let lastError: Error;
  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < config.maxRetries - 1) {
        const delay = Math.min(
          config.initialDelayMs * Math.pow(2, attempt),
          config.maxDelayMs
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

Design-5: BFF Contract
Location: packages/contracts/src/bff/ai/_shared/llm.ts

export interface LlmCompleteRequestDto {
  query: string;
  feature: 'variance_analysis' | 'nlq' | 'anomaly' | 'graph_generation';
  context?: Record<string, any>;
  max_tokens?: number;
}

export interface LlmCompleteResponseDto {
  answer: string;
  tokens_used: number;
  cost_jpy: number;
  latency_ms: number;
}
```

**実装タスク**:

```
Task-3.1: LLM Service インターフェース定義
  [ ] LlmService interface 作成
  [ ] LlmCompleteRequest, LlmCompleteResponse DTO 定義

Task-3.2: Claude Adapter 実装
  [ ] @anthropic-ai/sdk インストール・設定
  [ ] ClaudeAdapter クラス実装
  [ ] Cost 計算ロジック実装
  [ ] Error handling + Retry logic

Task-3.3: Cost Management Service
  [ ] AiCostManagementService 実装
  [ ] Tenant 月間使用量 tracking
  [ ] Cost cap enforcement

Task-3.4: Audit Logging
  [ ] ai_audit_logs への自動ロギング
  [ ] Token 計数・検証

Task-3.5: OpenAI Adapter（Fallback）
  [ ] OpenAiAdapter 実装（GPT-4o）
  [ ] Factory pattern で adapter 選択

Task-3.6: Integration テスト
  [ ] Claude API との実際の通信テスト（テスト API Key 使用）
  [ ] Cost 計算の正確性テスト
  [ ] Error handling テスト

Task-3.7: ドキュメント
  [ ] LLM Service 使用方法
  [ ] Cost 管理説明
  [ ] Model switching 方法
```

#### Week 3 チェックリスト

- [ ] `/kiro:spec-init` → requirements → design → tasks 完了
- [ ] @anthropic-ai/sdk インストール・テスト
- [ ] ClaudeAdapter 実装・テスト PASS
- [ ] Cost 計算ロジック検証
- [ ] Multi-tenant isolation テスト PASS
- [ ] Retry logic テスト（エラーシナリオ）
- [ ] Code Review 完了

**期待結果**: LLM Service が完全に動作。Phase 1A foundation 完成。Week 7 からの P0 Feature 実装に進む準備完了。

---

## 🎯 Phase 1B P0 Features（Weeks 7-16）

### Feature 1: 異常値自動検知（Weeks 7-9）

#### Spec Creation

```bash
/kiro:spec-init "ai/anomaly-detection"
/kiro:spec-requirements "ai/anomaly-detection"
/kiro:spec-design "ai/anomaly-detection"
/kiro:spec-tasks "ai/anomaly-detection"
```

#### 実装の流れ

```
1. Requirement: 異常検知ロジック定義
   - Threshold ルール 5 個（前月比、予算比、前年比、重複、負値）
   - Severity 判定（High/Medium/Low）

2. Design: Service 設計
   - AnomalyDetectionService（ルール定義）
   - AnomalyAlertRepository（DB 操作）
   - BFF Contract（API DTO）

3. Tasks: 実装タスク
   - Domain API: Service + Controller
   - BFF: Contract + Controller
   - UI: AlertsList component
   - Test: Unit + Integration

4. v0 Testing（ローカル）
   - Mock data で alert 生成
   - UI component render 確認

5. Production: HttpBffClient 統合
```

#### デリバリー

- **BFF Contract**: `AnomalyAlertsRequestDto`, `AnomalyAlertsResponseDto`
- **Domain API**: `GET /api/ai/anomaly-alerts`, `PATCH /api/ai/anomaly-alerts/:id/confirm`
- **BFF**: Gateway controller
- **UI**: React component （v0 → production 移行）
- **Tests**: 全シナリオ対応（Alert 生成、確認、無視等）

---

### Feature 2: 予実差異AI解説（Weeks 7-10）

#### Spec Creation

```bash
/kiro:spec-init "ai/variance-analysis"
/kiro:spec-requirements "ai/variance-analysis"
/kiro:spec-design "ai/variance-analysis"
/kiro:spec-tasks "ai/variance-analysis"
```

#### 実装の流れ

```
1. Requirement: 差異分析ビジネスロジック
   - Top 20 variance の自動抽出
   - RAG で過去コメント検索
   - Hypothesis 生成（Claude）
   - Trend 分析（3-6 ヶ月）

2. Design: 3 つの Service
   - VarianceQueryPlanner（差異の識別）
   - VarianceRagEngine（過去コメント検索）
   - VarianceAnalysisService（統合）

3. Tasks: 実装
   - Query Planner（Actual vs Budget vs Forecast）
   - RAG integration（pgvector search）
   - Prompt engineering
   - Report formatting

4. Prompt Design: 以下を含める
   """
   あなたは経営財務分析家です。
   以下の差異データと過去分析コメントを参照して、
   差異の原因仮説を3つ提示してください。

   各仮説について：
   - 説明（Why）
   - 根拠データ
   - 信頼度スコア（%）

   形式：JSON
   """

5. Test:
   - Query planning の正確性
   - RAG 検索結果の関連性
   - Prompt 出力の品質
```

#### デリバリー

- **BFF Contract**: `VarianceReportRequestDto`, `VarianceReportResponseDto`
- **Domain API**: `POST /api/ai/variance-analysis/generate-report`
- **RAG Integration**: pgvector embedding + semantic search
- **Prompt Templates**: 差異仮説生成用プロンプト定義
- **UI**: Report display component
- **Tests**: 実際の月次データで検証

---

### Feature 3: 自然言語Q&A（Weeks 8-12）

#### Spec Creation

```bash
/kiro:spec-init "ai/nlq"
/kiro:spec-requirements "ai/nlq"
/kiro:spec-design "ai/nlq"
/kiro:spec-tasks "ai/nlq"
```

#### 実装の流れ（最も複雑）

```
1. Requirement: 5 つのパターン
   - 「今期着地は？」
   - 「9月の売上高は？」
   - 「前年比は？」
   - 「予算との差異は？」
   - 「X部門の営業利益は？」

2. Design: 5 つのモジュール
   Module-1: IntentClassifier
     - 入力: 「9月の売上高は？」
     - 出力: Intent = 「metric_query」, Actions = [「時期指定」, 「科目特定」]
     - 実装: Few-shot LLM or Rule-based

   Module-2: EntityExtractor
     - 入力: 「9月」「売上高」「X部門」
     - 出力: { period: 9, subject_code: "50010", department_id: "dep_X" }
     - 実装: Semantic Layer + Regex + LLM

   Module-3: QueryPlanner
     - 入力: 抽出 Entity
     - 出力: Structured Query（SQL-like）
     - 実装: Domain Logic

   Module-4: QueryExecutor
     - 入力: Structured Query
     - 出力: Result Set
     - 実装: Prisma query builder

   Module-5: ResponseFormatter
     - 入力: Result Set
     - 出力: 自然な日本語回答 + Table + Graph
     - 実装: LLM prompt

3. Session Management
   - session_id で会話履歴追跡
   - Context 保持（前のクエリから学習）

4. Test: 各パターン × 複数企業データ
```

#### デリバリー

- **BFF Contract**: `NlqQueryRequestDto`, `NlqQueryResponseDto`
- **Domain API**: `POST /api/ai/nlq/query`
- **5 つのモジュール**: 各々 unit test + integration test
- **Prompt Templates**: Intent, Entity, Response formatting
- **UI**: Chat widget component
- **Tests**: 5 パターン × 10 バリエーション = 50 テストケース

---

## 📊 Week-by-Week チェックリスト（Phase 1B）

### Week 7
- [ ] Anomaly Detection spec 完成
- [ ] Anomaly Detection Service 実装開始
- [ ] Variance Analysis spec 完成
- [ ] BFF Contract 定義完了

### Week 8
- [ ] Anomaly Detection Controller + Repository 実装
- [ ] Anomaly Detection Unit test 通過
- [ ] Variance Analysis Service 実装開始
- [ ] NLQ spec 完成

### Week 9
- [ ] Anomaly Detection BFF → UI integrate
- [ ] Anomaly Detection prod deploy 準備
- [ ] Variance Analysis Service 完成
- [ ] NLQ Intent Classifier 実装開始

### Week 10
- [ ] Anomaly Detection prod deploy
- [ ] Variance Analysis Report Component 実装
- [ ] Variance Analysis RAG integration 完成
- [ ] NLQ Entity Extractor 実装

### Week 11
- [ ] Variance Analysis BFF integration
- [ ] Variance Analysis prod deploy 準備
- [ ] NLQ QueryPlanner + QueryExecutor 実装
- [ ] NLQ ResponseFormatter 実装

### Week 12
- [ ] Variance Analysis prod deploy
- [ ] NLQ Session Manager 実装
- [ ] NLQ 統合テスト（5 パターン全て）
- [ ] NLQ UI Chat Widget 実装開始

### Week 13
- [ ] NLQ BFF integration
- [ ] NLQ prod deploy 準備

**期待結果**: 3 つの P0 Feature が本番運用準備完了。実際のユーザーでのテスト開始。

---

## 🛠️ 実装チームの役割分担

### Backend Engineers（2 名）
- Week 1-3: Semantic Layer, Entities, LLM Service
- Week 7-12: Anomaly Detection, Variance Analysis (one each)
- Week 8-12: NLQ の分担（Intent → Entity → Query → Response）

### Prompt Engineer（0.5 FTE）
- Week 3: LLM Service prompt template
- Week 7-10: Variance Analysis prompts（仮説生成）
- Week 8-12: NLQ prompts（複数パターン）
- Weekly: Prompt 品質監視、A/B テスト

### Frontend Engineer（1 名）
- Week 6: UI component design（Anomaly, Variance, NLQ）
- Week 9-12: Anomaly Detection, Variance Analysis UI
- Week 12-13: NLQ Chat Widget

### QA/Tester（0.5 FTE）
- 全 Feature: Unit / Integration test 作成
- Weekly: Regression test
- User acceptance test 準備

---

## ⚠️ リスク・チェックポイント

### Data Quality Risk

```
Risk: 入力データが不完全 → AI 出力が不正確
Mitigation:
  [ ] Anomaly Detection で入力チェック
  [ ] Data Quality Dashboard 構築
  [ ] Monthly audit（異常検知アラート確認率）
```

### AI Quality Risk

```
Risk: LLM が幻覚を起こす（ハルシネーション）
Mitigation:
  [ ] 常に根拠データ提示（Sources）
  [ ] Confidence score 表示
  [ ] Human-in-the-loop（AI は提案、人が確定）
  [ ] Monthly prompt audit
```

### Performance Risk

```
Risk: API レスポンス > 5 秒（ユーザーストレス）
Mitigation:
  [ ] Caching strategy（Semantic Layer など）
  [ ] Async processing（大量データは非同期）
  [ ] Load testing（Week 6）
```

### Cost Risk

```
Risk: LLM API 費用が予測超過
Mitigation:
  [ ] Token 計数 + Cost tracking（ai_audit_logs）
  [ ] Tenant ごとの Cost cap 設定
  [ ] Model switching（Claude → GPT-4o）
  [ ] Monthly cost review
```

---

## 📋 Approval Gates

### Phase 1A Foundation (Week 3 End)
- [ ] Semantic Layer, Entities, LLM Service が本番環境で 1 週間動作
- [ ] Performance: API response < 500ms
- [ ] Security: RLS isolation confirmed
- [ ] Cost: 月額予算内に収まっている
- **Decision**: Go/No-Go to Phase 1B

### Phase 1B P0 (Week 13 End)
- [ ] 3 つの Feature（Anomaly, Variance, NLQ）が本番運用
- [ ] User adoption: 実際のユーザーが日常的に使用
- [ ] Quality: False positive rate < 10%, Accuracy > 80%
- [ ] Cost: 目標内
- **Decision**: Go to Phase 1C / 補正リリース

---

## 🎯 Next Steps（この週の行動）

1. **チーム招集**: このドキュメントをベースに、実装チームと確認会（2 時間）
2. **環境準備**: Dev 環境で Prisma, LLM SDK, pgvector 動作確認
3. **Week 1 開始**: `/kiro:spec-init "ai/_shared/semantic-layer"` 実行
4. **Daily Standup**: 毎朝 15 分で progress share
5. **Weekly Review**: 金曜に spec/implementation 進捗確認

---

**Document Status**: READY FOR EXECUTION
**Last Updated**: 2026年1月30日
**Next Review**: Week 1 終了時
