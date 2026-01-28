# AI機能 共通UI設計

## 作成日
2026-01-28

## 目的
AI機能5つ（自然言語Q&A、差異分析、グラフ生成、異常値検知、経営参謀Bot）の共通UI設計を定義し、一貫性のあるユーザー体験を提供する。

---

## 1. デザインシステム準拠

### 1.1 デザイントークン

**カラー**: `.kiro/steering/epm-design-system.md` に準拠

```typescript
// セマンティックトークン使用
colors: {
  // AI機能専用カラー
  ai: {
    primary: "hsl(var(--primary))",      // AI機能のアクセントカラー
    background: "hsl(var(--muted))",     // AIメッセージ背景
    border: "hsl(var(--border))",        // チャット枠線
  },

  // ステータスカラー
  status: {
    success: "hsl(var(--success))",
    warning: "hsl(var(--warning))",
    error: "hsl(var(--destructive))",
    info: "hsl(var(--info))",
  }
}
```

**タイポグラフィ**:
- フォント: Inter（本文）、JetBrains Mono（数値・コード）
- スケール: text-xs, text-sm, text-base, text-lg

**スペーシング**:
- セマンティック単位のみ使用（space-2, space-4, space-6...）
- 任意の値（pl-[13px]等）は禁止

### 1.2 コンポーネント

**Tier 1（shadcn/ui）**: そのまま使用
- Button, Card, Input, Textarea, Select, Dialog, Sheet, ScrollArea, Badge, Separator

**Tier 2（共通カスタム）**: AI機能共通
- ChatWindow（チャットウィンドウ）
- ChatMessage（メッセージ表示）
- QueryInput（質問入力）
- AnswerCard（回答カード）
- MetricDisplay（数値表示）
- TrendIndicator（増減表示）

**Tier 3（機能固有）**: 各機能で実装
- VarianceTable（差異分析テーブル）
- AnomalyAlertModal（異常値アラート）
- QuickQuestions（よくある質問）

---

## 2. 共通コンポーネント仕様

### 2.1 ChatWindow（チャットウィンドウ）

**配置**: 画面右下固定

**状態**:
- Minimized: 56x56px のボタン（アイコン + バッジ）
- Expanded: 幅400px、高さ600px のウィンドウ

**構造**:
```tsx
<ChatWindow>
  <ChatHeader>
    <Title>経営AI</Title>
    <Actions>
      <MinimizeButton />
      <CloseButton />
    </Actions>
  </ChatHeader>

  <ChatMessages>
    {messages.map(msg => <ChatMessage key={msg.id} {...msg} />)}
  </ChatMessages>

  <QueryInput onSubmit={handleSubmit} />
</ChatWindow>
```

**アニメーション**:
- 最小化/展開: scale + opacity (200ms ease-out)
- メッセージ追加: slideIn from bottom (150ms ease-out)

### 2.2 ChatMessage（メッセージ表示）

**種類**:
1. **User Message**: 右寄せ、primary背景
2. **AI Message**: 左寄せ、muted背景
3. **System Message**: 中央寄せ、灰色文字

**構造**:
```tsx
<ChatMessage type="ai">
  <Avatar>AI</Avatar>
  <MessageContent>
    <Text>{content}</Text>
    {data && <MetricDisplay data={data} />}
    {actions && <ActionButtons actions={actions} />}
  </MessageContent>
  <Timestamp>09:45</Timestamp>
</ChatMessage>
```

### 2.3 MetricDisplay（数値表示）

EPM特有の数値表示コンポーネント。

**表示形式**:
```tsx
<MetricDisplay>
  <MetricLabel>売上高</MetricLabel>
  <MetricValue>¥12,000,000,000</MetricValue>
  <TrendIndicator
    change="-500000000"
    percentage="-4.2"
    comparison="予算比"
  />
</MetricDisplay>
```

**フォーマット**:
- 金額: 3桁カンマ区切り、円マーク
- パーセント: 小数点1桁、%マーク
- 増減: ▲（減少）、▲なし（増加）

### 2.4 TrendIndicator（増減表示）

**表示例**:
```
▲¥500,000,000 (-4.2%)
+¥300,000,000 (+2.5%)
```

**カラー**:
- 増加: text-green-600（収益科目）/ text-red-600（費用科目）
- 減少: text-red-600（収益科目）/ text-green-600（費用科目）
- 方向は subject_type で判定

### 2.5 AnswerCard（回答カード）

AI回答を構造化して表示。

**構造**:
```tsx
<AnswerCard>
  <Summary>{summary}</Summary>

  <Metrics>
    {metrics.map(m => <MetricDisplay key={m.label} {...m} />)}
  </Metrics>

  <KeyInsights>
    <InsightItem>主要要因: 第2四半期の受注遅延</InsightItem>
  </KeyInsights>

  <Actions>
    <Button variant="outline">詳細レポート</Button>
    <Button variant="outline">グラフ表示</Button>
  </Actions>
</AnswerCard>
```

---

## 3. レイアウトパターン

### 3.1 全画面レイアウト（差異分析レポート）

```
┌─────────────────────────────────────┐
│ Header (ブレッドクラム + アクション)  │
├─────────────────────────────────────┤
│                                     │
│  Content Area                       │
│  - サマリカード                      │
│  - TOP10差異テーブル                 │
│  - 詳細セクション                    │
│                                     │
└─────────────────────────────────────┘
```

### 3.2 チャットオーバーレイ（自然言語Q&A、経営参謀Bot）

```
┌─────────────────────────────────────┐
│                                     │
│  Main Content (既存画面)             │
│                                     │
│                      ┌────────────┐ │
│                      │            │ │
│                      │ ChatWindow │ │
│                      │            │ │
│                      └────────────┘ │
└─────────────────────────────────────┘
```

### 3.3 モーダル（異常値検知アラート）

```
        ┌──────────────────────┐
        │  Alert Modal         │
        │  ─────────────────   │
        │  🚨 異常値検知       │
        │                      │
        │  広告宣伝費が前月比  │
        │  +180%です           │
        │                      │
        │  [入力ミス] [正しい] │
        └──────────────────────┘
```

---

## 4. インタラクションパターン

### 4.1 ローディング状態

**チャット送信時**:
```tsx
<ChatMessage type="ai">
  <LoadingDots>
    <Dot />
    <Dot />
    <Dot />
  </LoadingDots>
</ChatMessage>
```

**レポート生成時**:
```tsx
<ProgressIndicator>
  <Spinner />
  <Text>差異分析レポートを生成中...</Text>
  <Progress value={60} />
</ProgressIndicator>
```

### 4.2 エラー状態

**チャット内エラー**:
```tsx
<ChatMessage type="system" variant="error">
  ⚠️ 質問を処理できませんでした。
  もう一度お試しください。
</ChatMessage>
```

**Toast通知**:
```tsx
toast.error("データの取得に失敗しました")
```

### 4.3 空状態

**初回チャット**:
```tsx
<EmptyState>
  <Icon>💬</Icon>
  <Title>経営AIへようこそ</Title>
  <Description>
    経営データについて自然言語で質問できます
  </Description>
  <QuickQuestions />
</EmptyState>
```

---

## 5. アクセシビリティ

### 5.1 キーボード操作

- チャット入力: Enter（送信）、Shift+Enter（改行）
- ウィンドウ最小化: Escape
- 質問選択: Tab → Enter

### 5.2 スクリーンリーダー

```tsx
<ChatWindow aria-label="経営AIチャット">
  <ChatMessage
    role="article"
    aria-label="AIからの回答"
  >
    {content}
  </ChatMessage>
</ChatWindow>
```

### 5.3 カラーコントラスト

- WCAG AA準拠（4.5:1以上）
- 数値・重要情報は 7:1以上推奨

---

## 6. レスポンシブ対応

### 6.1 ブレークポイント

- Desktop: 1024px以上（通常表示）
- Tablet: 768-1023px（チャット幅調整）
- Mobile: 767px以下（全画面モーダル）

### 6.2 モバイル最適化

**チャットウィンドウ（モバイル）**:
- 右下固定 → 全画面Sheet
- 最小化ボタン → 下から上にスワイプで展開

---

## 7. パフォーマンス

### 7.1 遅延読み込み

```tsx
// チャット履歴の仮想スクロール
import { useVirtualizer } from '@tanstack/react-virtual'

// グラフの遅延読み込み
const RechartsChart = lazy(() => import('./RechartsChart'))
```

### 7.2 メモ化

```tsx
// メッセージリストのメモ化
const messages = useMemo(() =>
  rawMessages.map(formatMessage),
  [rawMessages]
)

// 数値フォーマットのメモ化
const formattedValue = useMemo(() =>
  formatCurrency(value),
  [value]
)
```

---

## 8. テスト方針

### 8.1 ユニットテスト

- 各コンポーネントの単体テスト
- 数値フォーマット関数のテスト
- インタラクションのテスト

### 8.2 ビジュアルリグレッションテスト

- Storybook + Chromatic
- 主要コンポーネントのスナップショット

### 8.3 E2Eテスト

- 主要ユーザーフローのテスト
- チャット送信 → 回答表示
- レポート生成 → PDF出力

---

## 9. 実装ディレクトリ構造

```
apps/web/_v0_drop/ai/
├── _shared/                    # 共通コンポーネント
│   ├── components/
│   │   ├── ChatWindow.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── QueryInput.tsx
│   │   ├── AnswerCard.tsx
│   │   ├── MetricDisplay.tsx
│   │   └── TrendIndicator.tsx
│   ├── hooks/
│   │   ├── useChatSession.ts
│   │   └── useMetricFormat.ts
│   ├── utils/
│   │   ├── formatters.ts      # 数値フォーマット
│   │   └── validators.ts
│   └── types/
│       └── common.ts
├── nlq/                        # 自然言語Q&A
│   └── src/
├── variance-analysis/          # 差異分析
│   └── src/
├── graph-generation/           # グラフ生成
│   └── src/
├── anomaly-detection/          # 異常値検知
│   └── src/
└── chat-bot/                   # 経営参謀Bot
    └── src/
```

---

## 10. v0生成時の注意事項

### 10.1 プロンプトで必ず指定すること

1. **デザインシステム準拠**
   - "Use shadcn/ui components"
   - "Use semantic color tokens from the design system"
   - "No arbitrary spacing values"

2. **EPM特有の要件**
   - "Format numbers with 3-digit comma separators"
   - "Display currency with ¥ symbol"
   - "Show variance with ▲ for decrease"

3. **アクセシビリティ**
   - "Add ARIA labels"
   - "Support keyboard navigation"
   - "Ensure WCAG AA contrast"

### 10.2 v0生成後のレビューポイント

- [ ] shadcn/uiコンポーネントを使用しているか
- [ ] セマンティックトークンを使用しているか
- [ ] 数値フォーマットが正しいか
- [ ] TypeScript型定義が適切か
- [ ] アクセシビリティ対応されているか

---

## 関連ドキュメント

- `.kiro/steering/epm-design-system.md` - EPMデザインシステム
- `.kiro/steering/v0-workflow.md` - v0ワークフロー
- `.kiro/specs/仕様概要/AIシミュレーション機能.md` - AI機能仕様概要
