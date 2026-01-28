# AI機能 BFF契約定義

## 作成日
2026-01-28

## 目的
AI機能5つのBFF（Backend for Frontend）契約を定義する。ファクトテーブルの詳細に依存せず、UIに必要な情報のみを定義。

---

## 1. 共通型定義

### 1.1 基本型

```typescript
// 期間
export interface PeriodDto {
  fiscal_year: number;        // 2024
  period_no: number;          // 9
  display_label: string;      // "FY2024 9月"
}

// 部門
export interface DepartmentDto {
  stable_id: string;          // "DEPT-SALES-01"
  name: string;               // "営業1部"
  hierarchy_path: string;     // "営業本部 > 営業1部"
}

// 科目
export interface SubjectDto {
  code: string;               // "4000"
  name: string;               // "売上高"
  type: 'revenue' | 'expense' | 'asset' | 'liability' | 'kpi';
}

// 数値と増減
export interface MetricValueDto {
  label: string;              // "売上高"
  value: number;              // 12000000000
  unit: string;               // "円"
  change?: MetricChangeDto;
}

export interface MetricChangeDto {
  amount: number;             // -500000000
  percentage: number;         // -4.2
  comparison: string;         // "予算比" | "前年比" | "前月比"
  direction: 'up' | 'down';   // UI表示用
}

// アクション
export interface ActionDto {
  label: string;              // "詳細レポート"
  action: 'detail' | 'graph' | 'drill_down' | 'export';
  params?: Record<string, any>;
}
```

---

## 2. 自然言語Q&A (nlq)

### 2.1 質問リクエスト

```typescript
export interface NlqQueryRequestDto {
  query: string;              // "今期着地は？"
  session_id?: string;        // セッションID（任意）
  context?: {
    period?: string;          // 文脈保持用
    department?: string;
    subject?: string;
  };
}
```

### 2.2 回答レスポンス

```typescript
export interface NlqQueryResponseDto {
  answer: string;             // テキスト回答
  data?: NlqDataDto;          // 構造化データ
  sources?: string[];         // 出典
  confidence?: 'high' | 'medium' | 'low';
  actions?: ActionDto[];      // 推奨アクション
  clarification?: ClarificationDto;  // 曖昧な場合の確認
}

export interface NlqDataDto {
  metrics: MetricValueDto[];
  period?: PeriodDto;
  department?: DepartmentDto;
}

export interface ClarificationDto {
  message: string;            // "期間を指定してください"
  options: Array<{
    label: string;
    value: string;
  }>;
}
```

### 2.3 モックデータ例

```typescript
const mockNlqResponse: NlqQueryResponseDto = {
  answer: "2024年度の見込着地は以下の通りです:",
  data: {
    metrics: [
      {
        label: "売上高",
        value: 12000000000,
        unit: "円",
        change: {
          amount: -500000000,
          percentage: -4.2,
          comparison: "予算比",
          direction: "down"
        }
      },
      {
        label: "営業利益",
        value: 800000000,
        unit: "円",
        change: {
          amount: -120000000,
          percentage: -13.0,
          comparison: "予算比",
          direction: "down"
        }
      }
    ],
    period: {
      fiscal_year: 2024,
      period_no: 9,
      display_label: "FY2024 4-9月"
    }
  },
  sources: ["fact_amounts: 2024-09の集計"],
  confidence: "high",
  actions: [
    { label: "詳細レポート", action: "detail" },
    { label: "グラフ表示", action: "graph" }
  ]
};
```

---

## 3. 差異分析レポート (variance-analysis)

### 3.1 レポート生成リクエスト

```typescript
export interface VarianceReportRequestDto {
  period: string;             // "2024-09"
  company_id?: string;
  department_stable_id?: string;  // 全社 or 特定部門
  top_n?: number;             // TOP何件（デフォルト10）
}
```

### 3.2 レポートレスポンス

```typescript
export interface VarianceReportResponseDto {
  period: PeriodDto;
  generated_at: string;       // ISO8601
  summary: string;            // エグゼクティブサマリ
  alerts: string[];           // アラート
  top_variances: VarianceItemDto[];
  overall_assessment: {
    risk_level: 'high' | 'medium' | 'low';
    next_actions: string[];
  };
}

export interface VarianceItemDto {
  rank: number;
  subject: SubjectDto;
  budget_amount: number;
  actual_amount: number;
  variance_amount: number;
  variance_pct: number;
  department_breakdown?: Array<{
    department: DepartmentDto;
    budget: number;
    actual: number;
    variance: number;
  }>;
  trend: Array<{
    period: string;           // "2024-07"
    value: number;
    variance_pct: number;
  }>;
  hypothesis: string;         // AI生成の要因仮説
  past_cases?: string;        // 過去類似事例
  recommendations: string[];  // 推奨アクション
  kpi_impact?: string;        // KPI・利益への影響
}
```

### 3.3 モックデータ例

```typescript
const mockVarianceReport: VarianceReportResponseDto = {
  period: {
    fiscal_year: 2024,
    period_no: 9,
    display_label: "FY2024 9月"
  },
  generated_at: "2024-10-05T09:00:00Z",
  summary: "全社売上高は予算比▲5.2%（▲6,200万円）で着地。主要要因は大口案件の受注遅延（製造事業▲8,500万円）。一方、変動費削減により営業利益は予算比▲8.0%に留まる。",
  alerts: [
    "営業利益率が目標12.0%に対し11.2%（▲0.8pt）で推移。Q4での挽回が必要。"
  ],
  top_variances: [
    {
      rank: 1,
      subject: {
        code: "4000",
        name: "売上高",
        type: "revenue"
      },
      budget_amount: 1200000000,
      actual_amount: 1138000000,
      variance_amount: -62000000,
      variance_pct: -5.2,
      department_breakdown: [
        {
          department: {
            stable_id: "DEPT-MFG",
            name: "製造事業部",
            hierarchy_path: "製造事業部"
          },
          budget: 600000000,
          actual: 515000000,
          variance: -85000000
        },
        {
          department: {
            stable_id: "DEPT-SVC",
            name: "サービス事業部",
            hierarchy_path: "サービス事業部"
          },
          budget: 400000000,
          actual: 415000000,
          variance: 15000000
        }
      ],
      trend: [
        { period: "2024-07", value: 1210000000, variance_pct: 2.1 },
        { period: "2024-08", value: 1182000000, variance_pct: -1.5 },
        { period: "2024-09", value: 1138000000, variance_pct: -5.2 }
      ],
      hypothesis: "主要因: A社向け大口案件（¥85,000,000）の受注が10月にずれ込み。予算策定時は9月受注想定だったが、先方の稟議承認遅延により10月第1週に受注確定。副次的要因: 製造ライン改修による出荷遅延（¥15,000,000）。9月第2週のライン停止が影響、10月に挽回出荷予定。",
      past_cases: "2023年6月に同様の大口案件遅延が発生。その際は翌月に+18%の挽回達成。",
      recommendations: [
        "A社案件のデリバリースケジュールを確認し、10月売上を精査",
        "製造ラインの10月出荷計画を前倒しできるか検討",
        "サービス事業部の好調要因を分析し、横展開可能性を評価"
      ],
      kpi_impact: "売上高達成率 94.8% → 経営目標（95%以上）未達。粗利額▲2,480万円（粗利率40%前提）。10月に全額回収できれば年間目標は達成可能。"
    }
  ],
  overall_assessment: {
    risk_level: "medium",
    next_actions: [
      "10月第1週: A社案件の受注確定を確認",
      "10月末: 広告キャンペーンROIを算出",
      "11月初: Q4見込を再精査"
    ]
  }
};
```

---

## 4. グラフ自動生成 (graph-generation)

### 4.1 グラフ生成リクエスト

```typescript
export interface GraphGenerationRequestDto {
  query: string;              // "営業利益の前年比推移をグラフで"
  chart_type?: 'line' | 'bar' | 'pie' | 'table' | 'auto';  // auto: AI判定
  period_range?: {
    from: string;             // "2024-04"
    to: string;               // "2024-09"
  };
}
```

### 4.2 グラフレスポンス

```typescript
export interface GraphGenerationResponseDto {
  chart_type: 'line' | 'bar' | 'pie' | 'table';
  title: string;
  data: RechartsDataDto;      // Recharts互換
  narrative?: string;         // ナラティブ説明
  export_options: Array<{
    format: 'png' | 'pdf' | 'excel';
    label: string;
  }>;
}

// Recharts互換のデータ構造
export type RechartsDataDto =
  | LineChartDataDto
  | BarChartDataDto
  | PieChartDataDto
  | TableDataDto;

export interface LineChartDataDto {
  type: 'line';
  series: Array<{
    name: string;             // "2024年度"
    dataKey: string;          // "value_2024"
    color: string;            // "#3b82f6"
  }>;
  data: Array<{
    category: string;         // "4月"
    [key: string]: any;       // value_2024, value_2023...
  }>;
  xAxisKey: string;           // "category"
  yAxisLabel: string;         // "営業利益（百万円）"
}

export interface BarChartDataDto {
  type: 'bar';
  series: Array<{
    name: string;
    dataKey: string;
    color: string;
  }>;
  data: Array<{
    category: string;
    [key: string]: any;
  }>;
  xAxisKey: string;
  yAxisLabel: string;
}

export interface PieChartDataDto {
  type: 'pie';
  data: Array<{
    name: string;             // "製造事業"
    value: number;            // 5400000000
    percentage: number;       // 45.0
    color: string;            // "#3b82f6"
  }>;
}

export interface TableDataDto {
  type: 'table';
  columns: Array<{
    key: string;
    label: string;
    format?: 'number' | 'currency' | 'percentage';
  }>;
  data: Array<Record<string, any>>;
}
```

### 4.3 モックデータ例

```typescript
const mockGraphResponse: GraphGenerationResponseDto = {
  chart_type: "line",
  title: "営業利益の前年比推移",
  data: {
    type: "line",
    series: [
      { name: "2024年度", dataKey: "value_2024", color: "#3b82f6" },
      { name: "2023年度", dataKey: "value_2023", color: "#94a3b8" }
    ],
    data: [
      { category: "4月", value_2024: 120, value_2023: 110 },
      { category: "5月", value_2024: 125, value_2023: 115 },
      { category: "6月", value_2024: 130, value_2023: 120 },
      { category: "7月", value_2024: 128, value_2023: 118 },
      { category: "8月", value_2024: 132, value_2023: 122 },
      { category: "9月", value_2024: 127, value_2023: 121 }
    ],
    xAxisKey: "category",
    yAxisLabel: "営業利益（百万円）"
  },
  narrative: "2024年4-9月の営業利益は前年同期比+8.2%。主要要因は変動費削減（▲2億円）です。",
  export_options: [
    { format: "png", label: "PNG画像" },
    { format: "pdf", label: "PDF" }
  ]
};
```

---

## 5. 異常値検知アラート (anomaly-detection)

### 5.1 アラート一覧取得

```typescript
export interface AnomalyAlertsRequestDto {
  company_id: string;
  period?: string;            // 指定期間のアラート
  status?: 'pending' | 'confirmed' | 'ignored' | 'all';
  severity?: 'high' | 'medium' | 'low' | 'all';
}
```

### 5.2 アラートレスポンス

```typescript
export interface AnomalyAlertsResponseDto {
  alerts: AnomalyAlertDto[];
  summary: {
    total: number;
    pending: number;
    high_severity: number;
  };
}

export interface AnomalyAlertDto {
  id: string;
  severity: 'high' | 'medium' | 'low';
  subject: SubjectDto;
  department: DepartmentDto;
  period: PeriodDto;
  anomaly_type: 'threshold' | 'statistical' | 'trend_deviation';
  detected_amount: number;
  expected_amount: number;
  variance_amount: number;
  variance_pct: number;
  message: string;
  detection_details: {
    prev_month?: number;
    history_mean?: number;
    z_score?: number;
  };
  status: 'pending' | 'confirmed' | 'ignored';
  confirmed_by?: string;
  confirmed_at?: string;
  notes?: string;
  created_at: string;
}
```

### 5.3 アラート確認

```typescript
export interface ConfirmAnomalyRequestDto {
  alert_id: string;
  action: 'confirm' | 'ignore';
  notes?: string;
}

export interface ConfirmAnomalyResponseDto {
  success: boolean;
  alert: AnomalyAlertDto;
}
```

### 5.4 モックデータ例

```typescript
const mockAnomalyAlerts: AnomalyAlertsResponseDto = {
  alerts: [
    {
      id: "ANO-001",
      severity: "high",
      subject: { code: "6100", name: "広告宣伝費", type: "expense" },
      department: {
        stable_id: "DEPT-ALL",
        name: "全社",
        hierarchy_path: "全社"
      },
      period: {
        fiscal_year: 2024,
        period_no: 9,
        display_label: "FY2024 9月"
      },
      anomaly_type: "threshold",
      detected_amount: 50000000,
      expected_amount: 18000000,
      variance_amount: 32000000,
      variance_pct: 180,
      message: "広告宣伝費が前月比+180%です。入力ミスの可能性があります。",
      detection_details: {
        prev_month: 18000000
      },
      status: "pending",
      created_at: "2024-10-01T10:30:00Z"
    }
  ],
  summary: {
    total: 3,
    pending: 3,
    high_severity: 1
  }
};
```

---

## 6. 経営参謀Bot (chat-bot)

### 6.1 対話リクエスト

```typescript
export interface ChatBotMessageRequestDto {
  message: string;
  session_id: string;         // 必須（文脈保持）
  conversation_history?: ChatBotMessageDto[];  // 履歴（任意）
}
```

### 6.2 対話レスポンス

```typescript
export interface ChatBotMessageResponseDto {
  message: string;
  session_id: string;
  data?: ChatBotDataDto;
  suggestions?: ChatBotSuggestionDto[];  // 能動提案
  actions?: ActionDto[];
}

export interface ChatBotDataDto {
  metrics?: MetricValueDto[];
  trend?: Array<{
    period: string;
    value: number;
  }>;
  breakdown?: Array<{
    label: string;
    value: number;
    percentage: number;
  }>;
  simulation?: {
    scenario: string;
    result: MetricValueDto[];
  };
}

export interface ChatBotSuggestionDto {
  label: string;
  description?: string;
  action: 'ask' | 'drill_down' | 'simulate' | 'export';
}

export interface ChatBotMessageDto {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
```

### 6.3 セッション管理

```typescript
export interface ChatBotSessionDto {
  session_id: string;
  user_id: string;
  created_at: string;
  last_activity_at: string;
  context: {
    current_topic?: string;   // "売上下振れ"
    entities: {
      period?: string;
      department?: string;
      subject?: string;
    };
  };
}
```

### 6.4 モックデータ例

```typescript
const mockChatBotResponse: ChatBotMessageResponseDto = {
  message: `2024年9月の業績サマリです。

📊 売上高: ¥1,138M（予算比▲5.2%、前年比+3.8%）
📊 営業利益: ¥127M（予算比▲8.0%、前年比+2.1%）
📊 営業利益率: 11.2%（目標12.0%、▲0.8pt）

🚨 アラート:
- 売上高の下振れが8月から継続（要注意）
- 広告宣伝費が予算比+15%で超過

💡 主要トピック:
1. A社大口案件の受注遅延（▲¥85M）
2. 新製品キャンペーン前倒しによる広告費増（+¥35M）`,
  session_id: "SESSION-001",
  data: {
    metrics: [
      {
        label: "売上高",
        value: 1138000000,
        unit: "円",
        change: {
          amount: -62000000,
          percentage: -5.2,
          comparison: "予算比",
          direction: "down"
        }
      }
    ]
  },
  suggestions: [
    {
      label: "1. 売上下振れの詳細",
      description: "部門別内訳と要因分析",
      action: "drill_down"
    },
    {
      label: "2. 広告費超過の詳細",
      description: "ROI分析と推奨アクション",
      action: "drill_down"
    },
    {
      label: "3. 部門別業績",
      description: "事業部別の業績サマリ",
      action: "ask"
    }
  ],
  actions: [
    { label: "詳細レポート", action: "detail" },
    { label: "Excel出力", action: "export" }
  ]
};
```

---

## 7. エラーレスポンス

### 7.1 共通エラー形式

```typescript
export interface ErrorResponseDto {
  error: {
    code: string;             // "AI_SERVICE_UNAVAILABLE"
    message: string;          // "AIサービスが一時的に利用できません"
    details?: string;
    retry_after?: number;     // 秒数
  };
}
```

### 7.2 エラーコード一覧

| コード | 意味 | 対応 |
|-------|------|------|
| AI_SERVICE_UNAVAILABLE | LLMサービス停止 | リトライ推奨 |
| INVALID_QUERY | 質問が不正 | 質問を修正 |
| INSUFFICIENT_DATA | データ不足 | 期間変更を提案 |
| RATE_LIMIT_EXCEEDED | レート制限 | 時間をおいてリトライ |
| PERMISSION_DENIED | 権限不足 | 管理者に連絡 |

---

## 8. 実装ガイドライン

### 8.1 MockBffClient実装例

```typescript
// apps/web/_v0_drop/ai/_shared/api/MockBffClient.ts

export class MockBffClient {
  // 自然言語Q&A
  async queryNlq(req: NlqQueryRequestDto): Promise<NlqQueryResponseDto> {
    await this.simulateDelay(500);
    return mockNlqResponse;
  }

  // 差異分析レポート
  async generateVarianceReport(
    req: VarianceReportRequestDto
  ): Promise<VarianceReportResponseDto> {
    await this.simulateDelay(2000);
    return mockVarianceReport;
  }

  // グラフ生成
  async generateGraph(
    req: GraphGenerationRequestDto
  ): Promise<GraphGenerationResponseDto> {
    await this.simulateDelay(800);
    return mockGraphResponse;
  }

  // 異常値アラート取得
  async getAnomalyAlerts(
    req: AnomalyAlertsRequestDto
  ): Promise<AnomalyAlertsResponseDto> {
    await this.simulateDelay(300);
    return mockAnomalyAlerts;
  }

  // チャットBot
  async sendChatMessage(
    req: ChatBotMessageRequestDto
  ): Promise<ChatBotMessageResponseDto> {
    await this.simulateDelay(1000);
    return mockChatBotResponse;
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 8.2 型定義の配置

```typescript
// packages/contracts/src/bff/ai/index.ts (将来的に移行)
export * from './nlq';
export * from './variance-analysis';
export * from './graph-generation';
export * from './anomaly-detection';
export * from './chat-bot';
export * from './common';
```

**現在（v0_drop段階）**:
```typescript
// apps/web/_v0_drop/ai/_shared/types/index.ts
// 上記の型定義をすべて含める
```

---

## 関連ドキュメント

- `.kiro/specs/ai/_共通/ui-design-common.md` - UI共通設計
- `.kiro/specs/仕様概要/AIシミュレーション機能.md` - 機能仕様
- `.kiro/steering/v0-workflow.md` - v0ワークフロー
