# v0 Prompt: 自然言語Q&A（Natural Language Query）

## プロジェクト概要

EPM（Enterprise Performance Management）システムに組み込む、経営データを自然言語で質問できるチャットUI。CFOや経営企画が「今期着地は？」「9月の営業1部の売上高は？」と質問すると、AIが経営データを検索・集計して回答する。

**実装方式**: v0_drop（モックデータ）
**デザイン**: Microsoft Copilot風の右下常駐チャット

---

## 技術要件

### フレームワーク
- **React 18** + **TypeScript**
- **Next.js 14** (App Router)
- **shadcn/ui** (Button, Card, Input, ScrollArea, Badge)
- **Tailwind CSS** (セマンティックトークン使用)
- **Lucide React** (アイコン)

### 状態管理
- React hooks (useState, useEffect, useMemo)
- ローカルストレージ（セッション保持）

### モックデータ
- MockBffClient クラスで実装
- 遅延シミュレーション (500ms)

---

## UI要件

### 1. レイアウト

#### 最小化状態
- 画面右下に固定配置
- サイズ: 56x56px の丸ボタン
- アイコン: MessageCircle（Lucide）
- バッジ: 未読件数（オプション）
- ホバー: scale(1.05)
- z-index: 50

#### 展開状態
- 画面右下に固定配置
- サイズ: 幅 400px、高さ 600px
- シャドウ: shadow-2xl
- 角丸: rounded-2xl
- z-index: 50
- アニメーション: scale-in (200ms ease-out)

### 2. コンポーネント構成

```
<ChatWindow>
  <ChatHeader>
    <Title>💬 経営AI</Title>
    <Actions>
      <MinimizeButton />
    </Actions>
  </ChatHeader>

  <ChatMessages>
    {messages.length === 0 ? (
      <EmptyState>
        <WelcomeMessage />
        <QuickQuestions />
      </EmptyState>
    ) : (
      messages.map(msg => (
        <ChatMessage key={msg.id} {...msg} />
      ))
    )}
  </ChatMessages>

  <QueryInput
    placeholder="質問を入力..."
    onSubmit={handleSubmit}
    disabled={isLoading}
  />
</ChatWindow>
```

### 3. チャットメッセージ

#### ユーザーメッセージ
- 右寄せ: `ml-auto`
- 背景: `bg-primary text-primary-foreground`
- 最大幅: `max-w-[80%]`
- パディング: `px-4 py-2`
- 角丸: `rounded-2xl rounded-br-sm`

#### AIメッセージ
- 左寄せ: `mr-auto`
- 背景: `bg-muted text-foreground`
- 最大幅: `max-w-[90%]`
- パディング: `px-4 py-3`
- 角丸: `rounded-2xl rounded-bl-sm`
- アバター: 左上に「AI」バッジ

#### システムメッセージ
- 中央寄せ: `mx-auto`
- 文字色: `text-muted-foreground text-xs`
- 例: 「セッション開始」

### 4. 回答フォーマット

#### テキスト + メトリクス表示

```tsx
<AnswerCard>
  <Summary className="mb-4">
    2024年度の見込着地は以下の通りです:
  </Summary>

  <Metrics className="space-y-3">
    <MetricItem>
      <MetricLabel>📊 売上高</MetricLabel>
      <MetricValue>¥12,000,000,000</MetricValue>
      <TrendBadge variant="negative">
        ▲¥500,000,000 (-4.2%)
        <span className="text-xs ml-1">予算比</span>
      </TrendBadge>
    </MetricItem>

    <MetricItem>
      <MetricLabel>📊 営業利益</MetricLabel>
      <MetricValue>¥800,000,000</MetricValue>
      <TrendBadge variant="negative">
        ▲¥120,000,000 (-13.0%)
        <span className="text-xs ml-1">予算比</span>
      </TrendBadge>
    </MetricItem>
  </Metrics>

  <KeyInsight className="mt-4">
    主要要因: 第2四半期の受注遅延
  </KeyInsight>

  <Actions className="mt-4 flex gap-2">
    <Button variant="outline" size="sm">
      詳細レポート
    </Button>
    <Button variant="outline" size="sm">
      グラフ表示
    </Button>
  </Actions>
</AnswerCard>
```

### 5. よくある質問（初回表示）

メッセージが0件の場合、以下のボタンを表示:

```tsx
<QuickQuestions className="space-y-2">
  <QuickQuestionButton onClick={() => ask("今期着地は？")}>
    今期着地は？
  </QuickQuestionButton>
  <QuickQuestionButton onClick={() => ask("今月の実績は？")}>
    今月の実績は？
  </QuickQuestionButton>
  <QuickQuestionButton onClick={() => ask("予算との差異は？")}>
    予算との差異は？
  </QuickQuestionButton>
  <QuickQuestionButton onClick={() => ask("前年同月比は？")}>
    前年同月比は？
  </QuickQuestionButton>
</QuickQuestions>
```

**スタイル**:
- ボタン: `variant="ghost"`, 左寄せ、ホバーで背景色
- アイコン: ChevronRight（Lucide）

### 6. 入力欄

```tsx
<QueryInput>
  <Textarea
    placeholder="質問を入力..."
    rows={1}
    maxRows={4}
    className="resize-none"
    onKeyDown={(e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    }}
  />
  <SendButton
    disabled={!query.trim() || isLoading}
    onClick={handleSubmit}
  >
    {isLoading ? (
      <Loader2 className="animate-spin" />
    ) : (
      <Send />
    )}
  </SendButton>
</QueryInput>
```

---

## インタラクション

### 1. 質問送信フロー

1. ユーザーが質問を入力
2. Enterキー or 送信ボタン
3. 入力欄をクリア
4. ユーザーメッセージを即座に追加
5. AIメッセージ（ローディング）を追加
6. MockBffClient.queryNlq() を呼び出し (500ms遅延)
7. ローディングを回答に置き換え
8. 自動スクロール（最下部）

### 2. ローディング表示

```tsx
<LoadingMessage>
  <LoadingDots>
    <span className="animate-bounce">●</span>
    <span className="animate-bounce delay-100">●</span>
    <span className="animate-bounce delay-200">●</span>
  </LoadingDots>
</LoadingMessage>
```

### 3. エラー表示

```tsx
<SystemMessage variant="error">
  ⚠️ 質問を処理できませんでした。もう一度お試しください。
</SystemMessage>
```

---

## 数値フォーマット

### formatters.ts

```typescript
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatVariance(
  amount: number,
  percentage: number
): string {
  const sign = amount < 0 ? '▲' : '+';
  const absAmount = Math.abs(amount);
  return `${sign}${formatCurrency(absAmount)} (${formatPercentage(percentage)})`;
}
```

---

## モックデータ

### MockBffClient.ts

```typescript
import type { NlqQueryRequestDto, NlqQueryResponseDto } from '../types';

export class MockBffClient {
  private responses: Record<string, NlqQueryResponseDto> = {
    '今期着地は？': {
      answer: '2024年度の見込着地は以下の通りです:',
      data: {
        metrics: [
          {
            label: '売上高',
            value: 12000000000,
            unit: '円',
            change: {
              amount: -500000000,
              percentage: -4.2,
              comparison: '予算比',
              direction: 'down',
            },
          },
          {
            label: '営業利益',
            value: 800000000,
            unit: '円',
            change: {
              amount: -120000000,
              percentage: -13.0,
              comparison: '予算比',
              direction: 'down',
            },
          },
        ],
      },
      sources: ['fact_amounts: 2024-09の集計'],
      confidence: 'high',
      actions: [
        { label: '詳細レポート', action: 'detail' },
        { label: 'グラフ表示', action: 'graph' },
      ],
    },

    '今月の実績は？': {
      answer: '2024年9月の実績は以下の通りです:',
      data: {
        metrics: [
          {
            label: '売上高',
            value: 1138000000,
            unit: '円',
            change: {
              amount: -62000000,
              percentage: -5.2,
              comparison: '予算比',
              direction: 'down',
            },
          },
          {
            label: '営業利益',
            value: 127000000,
            unit: '円',
            change: {
              amount: -11000000,
              percentage: -8.0,
              comparison: '予算比',
              direction: 'down',
            },
          },
        ],
      },
      confidence: 'high',
      actions: [
        { label: '詳細レポート', action: 'detail' },
      ],
    },

    '9月の営業1部の売上高は？': {
      answer: '2024年9月の営業1部売上高は以下の通りです:',
      data: {
        metrics: [
          {
            label: '売上高',
            value: 280000000,
            unit: '円',
            change: {
              amount: 30000000,
              percentage: 12.0,
              comparison: '予算比',
              direction: 'up',
            },
          },
        ],
        department: {
          stable_id: 'DEPT-SALES-01',
          name: '営業1部',
          hierarchy_path: '営業本部 > 営業1部',
        },
      },
      confidence: 'high',
    },

    '予算との差異は？': {
      answer: '2024年9月の予算差異TOP3:',
      data: {
        metrics: [
          {
            label: '売上高',
            value: 1138000000,
            unit: '円',
            change: {
              amount: -62000000,
              percentage: -5.2,
              comparison: '予算比',
              direction: 'down',
            },
          },
          {
            label: '広告宣伝費',
            value: 265000000,
            unit: '円',
            change: {
              amount: 35000000,
              percentage: 15.2,
              comparison: '予算比',
              direction: 'up',
            },
          },
          {
            label: '外注費',
            value: 132000000,
            unit: '円',
            change: {
              amount: -18000000,
              percentage: -12.0,
              comparison: '予算比',
              direction: 'down',
            },
          },
        ],
      },
      confidence: 'high',
      actions: [
        { label: '差異分析レポート', action: 'detail' },
      ],
    },

    '前年同月比は？': {
      answer: '2024年9月の前年同月比:',
      data: {
        metrics: [
          {
            label: '売上高',
            value: 1138000000,
            unit: '円',
            change: {
              amount: 41000000,
              percentage: 3.8,
              comparison: '前年同月比',
              direction: 'up',
            },
          },
          {
            label: '営業利益',
            value: 127000000,
            unit: '円',
            change: {
              amount: 3000000,
              percentage: 2.1,
              comparison: '前年同月比',
              direction: 'up',
            },
          },
        ],
      },
      confidence: 'high',
    },

    // デフォルト回答
    default: {
      answer: 'ご質問ありがとうございます。以下の質問パターンに対応しています:',
      clarification: {
        message: 'よくある質問から選択してください:',
        options: [
          { label: '今期着地は？', value: '今期着地は？' },
          { label: '今月の実績は？', value: '今月の実績は？' },
          { label: '予算との差異は？', value: '予算との差異は？' },
          { label: '前年同月比は？', value: '前年同月比は？' },
        ],
      },
      confidence: 'low',
    },
  };

  async queryNlq(req: NlqQueryRequestDto): Promise<NlqQueryResponseDto> {
    // 遅延シミュレーション
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 質問にマッチする回答を返す
    const response = this.responses[req.query] || this.responses.default;

    return response;
  }
}
```

---

## アクセシビリティ

- `aria-label`: すべてのボタンに付与
- `role="article"`: 各メッセージに付与
- キーボード操作: Enter（送信）、Escape（最小化）
- フォーカス管理: 送信後は入力欄にフォーカス維持

---

## ファイル構成

```
apps/web/_v0_drop/ai/nlq/src/
├── components/
│   ├── ChatWindow.tsx          # メインコンテナ
│   ├── ChatHeader.tsx          # ヘッダー
│   ├── ChatMessages.tsx        # メッセージリスト
│   ├── ChatMessage.tsx         # メッセージ1件
│   ├── QueryInput.tsx          # 入力欄
│   ├── QuickQuestions.tsx      # よくある質問
│   ├── AnswerCard.tsx          # 回答カード
│   ├── MetricDisplay.tsx       # 数値表示
│   └── LoadingDots.tsx         # ローディング
├── api/
│   └── MockBffClient.ts        # モックAPI
├── utils/
│   └── formatters.ts           # フォーマッター
├── types/
│   └── index.ts                # 型定義
├── hooks/
│   └── useChatSession.ts       # チャット状態管理
└── page.tsx                    # デモページ
```

---

## デザインリファレンス

- **Microsoft Copilot**: 右下固定チャット、展開/最小化
- **ChatGPT**: メッセージ表示、ローディング
- **Intercom**: よくある質問、クイックレスポンス

---

## v0への指示

上記の要件に基づいて、以下を生成してください:

1. **ChatWindow.tsx**: メインコンテナコンポーネント
2. **ChatMessage.tsx**: メッセージ表示コンポーネント
3. **AnswerCard.tsx**: 回答カード（メトリクス表示含む）
4. **QueryInput.tsx**: 入力欄コンポーネント
5. **QuickQuestions.tsx**: よくある質問ボタン群
6. **page.tsx**: デモページ（使用例）
7. **MockBffClient.ts**: モックAPIクライアント
8. **formatters.ts**: 数値フォーマット関数

**重要**:
- shadcn/uiコンポーネントを使用
- セマンティックトークンのみ使用（任意の値禁止）
- TypeScript型定義を完全に
- アクセシビリティ対応
- EPM特有の数値フォーマット（3桁カンマ、▲記号）
