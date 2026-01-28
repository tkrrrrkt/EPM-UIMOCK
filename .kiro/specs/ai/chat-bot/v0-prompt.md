# v0 Prompt: 経営参謀Bot（Executive Analyst Agent）

## プロジェクト概要

CFO/経営企画の「デジタル参謀」として、対話を通じて経営判断を支援するAIエージェント。単なる質問応答ではなく、文脈を保持した複数ターン対話、能動的な提案・深掘り質問、シナリオシミュレーション機能を持つ。

**実装方式**: v0_drop（モックデータ）
**デザイン**: 自然言語Q&Aの拡張版（より高度な対話機能）

---

## 技術要件

### フレームワーク
- **React 18** + **TypeScript**
- **Next.js 14** (App Router)
- **shadcn/ui** (Button, Card, Badge, Tabs)
- **Tailwind CSS**
- **Lucide React** (アイコン)

---

## UI要件

### 1. チャットウィンドウ（拡張版）

基本は自然言語Q&Aと同じだが、以下を追加:

```tsx
<ChatWindow>
  <ChatHeader>
    <div className="flex items-center gap-2">
      <Bot className="h-5 w-5" />
      <Title>経営参謀AI</Title>
      <Badge variant="secondary" className="text-xs">Beta</Badge>
    </div>
    <SessionInfo className="text-xs text-muted-foreground">
      セッション: 15分経過
    </SessionInfo>
    <Actions>
      <Button variant="ghost" size="icon" onClick={newSession}>
        <RefreshCw className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={minimize}>
        <Minimize2 className="h-4 w-4" />
      </Button>
    </Actions>
  </ChatHeader>

  <ChatMessages>
    {messages.map(msg => (
      <ChatMessage key={msg.id} {...msg} />
    ))}
  </ChatMessages>

  <QueryInput />
</ChatWindow>
```

### 2. AIメッセージ（拡張版）

#### 構造化回答 + 能動的提案

```tsx
<ChatMessage type="assistant">
  <Avatar>
    <Bot className="h-4 w-4" />
  </Avatar>

  <MessageContent>
    <Summary>
      2024年9月の業績サマリです。
    </Summary>

    <MetricsGrid className="grid grid-cols-2 gap-4 my-4">
      <MetricCard>
        <MetricLabel>📊 売上高</MetricLabel>
        <MetricValue>¥1,138M</MetricValue>
        <TrendBadge variant="negative">
          予算比▲5.2%
        </TrendBadge>
      </MetricCard>
      <MetricCard>
        <MetricLabel>📊 営業利益</MetricLabel>
        <MetricValue>¥127M</MetricValue>
        <TrendBadge variant="negative">
          予算比▲8.0%
        </TrendBadge>
      </MetricCard>
    </MetricsGrid>

    <AlertSection className="my-4">
      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>アラート</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1">
            <li>売上高の下振れが8月から継続（要注意）</li>
            <li>広告宣伝費が予算比+15%で超過</li>
          </ul>
        </AlertDescription>
      </Alert>
    </AlertSection>

    <KeyTopics className="my-4">
      <h4 className="font-semibold text-sm mb-2">💡 主要トピック:</h4>
      <ul className="space-y-1 text-sm">
        <li>1. A社大口案件の受注遅延（▲¥85M）</li>
        <li>2. 新製品キャンペーン前倒しによる広告費増（+¥35M）</li>
      </ul>
    </KeyTopics>

    <Separator className="my-4" />

    <SuggestionsSection>
      <h4 className="font-semibold text-sm mb-2">詳細を確認しますか？</h4>
      <div className="flex flex-wrap gap-2">
        <SuggestionButton onClick={() => ask("1. 売上下振れの詳細")}>
          1. 売上下振れの詳細
        </SuggestionButton>
        <SuggestionButton onClick={() => ask("2. 広告費超過の詳細")}>
          2. 広告費超過の詳細
        </SuggestionButton>
        <SuggestionButton onClick={() => ask("3. 部門別業績")}>
          3. 部門別業績
        </SuggestionButton>
      </div>
    </SuggestionsSection>

    <ActionButtons className="mt-4 flex gap-2">
      <Button variant="outline" size="sm">
        <FileText className="mr-1 h-3 w-3" />
        詳細レポート
      </Button>
      <Button variant="outline" size="sm">
        <FileSpreadsheet className="mr-1 h-3 w-3" />
        Excel出力
      </Button>
    </ActionButtons>
  </MessageContent>

  <Timestamp>09:45</Timestamp>
</ChatMessage>
```

### 3. 提案ボタンスタイル

```tsx
<SuggestionButton>
  <Button
    variant="outline"
    size="sm"
    className="justify-start text-left hover:bg-primary hover:text-primary-foreground transition-colors"
  >
    {label}
    <ChevronRight className="ml-auto h-4 w-4" />
  </Button>
</SuggestionButton>
```

### 4. 文脈保持表示

現在の対話の文脈を表示:

```tsx
<ContextBadge className="mb-2">
  <Badge variant="secondary" className="text-xs">
    <MessageSquare className="mr-1 h-3 w-3" />
    現在のトピック: 売上下振れ分析
  </Badge>
</ContextBadge>
```

### 5. シミュレーション結果表示

What-If分析の結果を表示:

```tsx
<SimulationResult>
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        シミュレーション結果
      </CardTitle>
      <CardDescription>
        「10月の挽回が50%に留まった場合」のシナリオ
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2">着地予測</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">売上高:</p>
            <p className="font-mono font-bold">¥14,538M</p>
            <p className="text-xs text-muted-foreground">
              年間予算比+0.9% ← ギリギリ達成
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">営業利益:</p>
            <p className="font-mono font-bold text-destructive">¥1,656M</p>
            <p className="text-xs text-muted-foreground">
              年間予算比▲4.2% ← 未達
            </p>
          </div>
        </div>
      </div>

      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>リスク評価</AlertTitle>
        <AlertDescription>
          このシナリオでは営業利益目標が未達。Q4での追加対策が必要。
        </AlertDescription>
      </Alert>

      <div>
        <h4 className="font-semibold mb-2">推奨対策</h4>
        <ul className="space-y-2">
          <li className="flex items-start">
            <CheckCircle2 className="mr-2 h-5 w-5 text-primary mt-0.5" />
            <span className="text-sm">変動費の更なる削減（目標: ▲¥50M）</span>
          </li>
          <li className="flex items-start">
            <CheckCircle2 className="mr-2 h-5 w-5 text-primary mt-0.5" />
            <span className="text-sm">サービス事業部の好調維持（上積み: +¥30M）</span>
          </li>
          <li className="flex items-start">
            <CheckCircle2 className="mr-2 h-5 w-5 text-primary mt-0.5" />
            <span className="text-sm">固定費の執行抑制（採用・設備投資の後ろ倒し）</span>
          </li>
        </ul>
      </div>
    </CardContent>
  </Card>
</SimulationResult>
```

### 6. 対話履歴ビューア

過去の対話を参照:

```tsx
<Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
  <DialogContent className="max-w-2xl max-h-[80vh]">
    <DialogHeader>
      <DialogTitle>対話履歴</DialogTitle>
      <DialogDescription>
        このセッションの対話履歴を表示しています
      </DialogDescription>
    </DialogHeader>

    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        {conversationHistory.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <Avatar className="h-8 w-8">
                <Bot className="h-4 w-4" />
              </Avatar>
            )}
            <div className={`max-w-[70%] rounded-lg p-3 ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}>
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {formatTime(msg.timestamp)}
              </p>
            </div>
            {msg.role === 'user' && (
              <Avatar className="h-8 w-8">
                <User className="h-4 w-4" />
              </Avatar>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>

    <DialogFooter>
      <Button variant="outline" onClick={exportHistory}>
        <Download className="mr-2 h-4 w-4" />
        対話履歴を出力
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## インタラクション

### 1. 複数ターン対話フロー

1. ユーザー: 「今月の業績サマリを教えて」
2. Bot: サマリ表示 + 3つの提案ボタン
3. ユーザー: 「1. 売上下振れの詳細」をクリック
4. Bot: 詳細分析 + 新たな提案（「年間着地への影響」等）
5. ユーザー: 「年間着地への影響」
6. Bot: シミュレーション結果 + 対策プラン
7. ...（最大10ターン）

### 2. 文脈保持

```typescript
interface ConversationContext {
  session_id: string;
  current_topic: string; // "売上下振れ"
  entities: {
    period?: string;     // "2024-09"
    department?: string; // "製造事業部"
    subject?: string;    // "売上高"
  };
  turn_count: number;
}
```

ユーザーが「それ」「これ」と言った場合、文脈から解決:

```typescript
// ユーザー: 「それの前年比は？」
// → 文脈から「売上高の前年比」と解釈
```

### 3. 能動的提案の生成

AIが次に聞くべき質問を提案:

```typescript
function generateSuggestions(
  currentTopic: string,
  previousMessages: Message[]
): Suggestion[] {
  // 現在のトピックに応じて動的に生成
  if (currentTopic === '売上下振れ') {
    return [
      { label: '部門別内訳', action: 'drill_down' },
      { label: '年間着地への影響', action: 'simulate' },
      { label: '対策プラン詳細', action: 'ask' },
    ];
  }
  // ...
}
```

---

## モックデータ

### MockBffClient.ts

```typescript
async sendChatMessage(
  req: ChatBotMessageRequestDto
): Promise<ChatBotMessageResponseDto> {
  await this.simulateDelay(1000);

  // セッションコンテキストを保持
  const context = this.getContext(req.session_id);

  // メッセージに応じた回答を生成
  if (req.message.includes('業績サマリ') || context.turn_count === 0) {
    return this.generatePerformanceSummary(req.session_id);
  } else if (req.message.includes('売上下振れ')) {
    return this.generateSalesVarianceDetail(req.session_id);
  } else if (req.message.includes('年間着地')) {
    return this.generateYearEndForecast(req.session_id);
  } else if (req.message.includes('対策プラン')) {
    return this.generateActionPlan(req.session_id);
  } else {
    return this.generateDefault(req.session_id);
  }
}

private generatePerformanceSummary(
  session_id: string
): ChatBotMessageResponseDto {
  this.updateContext(session_id, {
    current_topic: '業績サマリ',
    turn_count: 1,
  });

  return {
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
    session_id,
    data: {
      metrics: [/* ... */],
    },
    suggestions: [
      {
        label: '1. 売上下振れの詳細',
        description: '部門別内訳と要因分析',
        action: 'drill_down',
      },
      {
        label: '2. 広告費超過の詳細',
        description: 'ROI分析と推奨アクション',
        action: 'drill_down',
      },
      {
        label: '3. 部門別業績',
        description: '事業部別の業績サマリ',
        action: 'ask',
      },
    ],
    actions: [
      { label: '詳細レポート', action: 'detail' },
      { label: 'Excel出力', action: 'export' },
    ],
  };
}

private generateSalesVarianceDetail(
  session_id: string
): ChatBotMessageResponseDto {
  this.updateContext(session_id, {
    current_topic: '売上下振れ',
    entities: { subject: '売上高' },
    turn_count: 2,
  });

  return {
    message: `売上下振れの詳細です。

【差異内訳】
- 製造事業部: ▲¥85M（▲14.2%）← 主要因
- サービス事業部: +¥15M（+3.8%）← 好調
- その他: +¥8M（+4.0%）

【製造事業部の要因】
- A社向け大口案件（¥85M）の受注が10月にずれ込み
  - 理由: 先方の稟議承認遅延
  - 確定日: 2024-10-02（既に受注済み）
- 製造ライン改修による出荷遅延（¥15M）
  - 9月第2週のライン停止が影響
  - 10月に挽回出荷予定

【リスク評価】
🟡 中リスク: 10月の受注確定済みのため、挽回可能性高

【過去類似事例】
2023年6月に同様の遅延発生。翌月+18%で挽回達成。`,
    session_id,
    suggestions: [
      {
        label: '年間着地への影響',
        action: 'simulate',
      },
      {
        label: '部門長へのヒアリング項目',
        action: 'ask',
      },
      {
        label: 'サービス事業部の好調要因',
        action: 'drill_down',
      },
    ],
  };
}

// 他のメソッドも同様に実装...
```

---

## ファイル構成

```
apps/web/_v0_drop/ai/chat-bot/src/
├── components/
│   ├── ChatBotWindow.tsx             # メインウィンドウ
│   ├── EnhancedChatMessage.tsx       # 拡張版メッセージ
│   ├── SuggestionButtons.tsx         # 提案ボタン群
│   ├── ContextBadge.tsx              # 文脈表示
│   ├── SimulationResult.tsx          # シミュレーション結果
│   ├── ConversationHistory.tsx       # 対話履歴
│   └── SessionManager.tsx            # セッション管理
├── api/
│   └── MockBffClient.ts
├── hooks/
│   ├── useChatBotSession.ts          # セッション管理フック
│   └── useConversationContext.ts     # 文脈管理フック
├── utils/
│   ├── formatters.ts
│   └── contextResolver.ts            # 文脈解決
├── types/
│   └── index.ts
└── page.tsx                          # デモページ
```

---

## v0への指示

上記の要件に基づいて、以下を生成してください:

1. **ChatBotWindow.tsx**: メインウィンドウ（自然言語Q&Aの拡張）
2. **EnhancedChatMessage.tsx**: 拡張版メッセージコンポーネント
3. **SuggestionButtons.tsx**: 能動的提案ボタン群
4. **ContextBadge.tsx**: 現在の文脈表示
5. **SimulationResult.tsx**: シミュレーション結果カード
6. **ConversationHistory.tsx**: 対話履歴ビューア
7. **useChatBotSession.ts**: セッション管理フック
8. **page.tsx**: デモページ（対話フロー例）

**重要**:
- 自然言語Q&Aとの差別化を明確に（提案ボタン、文脈保持）
- 複数ターン対話のUXを考慮
- 能動的提案の視覚的強調
