# v0 Prompt: 差異分析オートコメント（Variance Analysis Report）

## プロジェクト概要

月次締め後、予算vs実績の差異を自動分析し、要因仮説付きのレポートを表示するEPM機能。CFO/経営企画が「差異レポート生成」ボタンをクリックすると、TOP10差異 + AI生成の要因仮説 + 推奨アクションが表示される。

**実装方式**: v0_drop（モックデータ）
**デザイン**: 全画面レポート表示

---

## 技術要件

### フレームワーク
- **React 18** + **TypeScript**
- **Next.js 14** (App Router)
- **shadcn/ui** (Button, Card, Table, Badge, Separator, Tabs, Sheet)
- **Tailwind CSS**
- **Lucide React** (アイコン)
- **Recharts** (トレンドグラフ用)

### 状態管理
- React hooks
- URLクエリパラメータ（期間選択）

---

## UI要件

### 1. ページレイアウト

```
┌─────────────────────────────────────────────────────────┐
│ Header                                                  │
│ ┌─────────────────┐  ┌──────────────────────────────┐ │
│ │ パンくずリスト  │  │ [PDF出力] [Excel出力]        │ │
│ └─────────────────┘  └──────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ サマリセクション                                         │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐         │
│ │ 売上差異   │ │ 利益差異   │ │ リスク     │         │
│ └────────────┘ └────────────┘ └────────────┘         │
├─────────────────────────────────────────────────────────┤
│ TOP10差異テーブル                                        │
│ ┌───┬────────┬──────┬──────┬──────┬────────┐       │
│ │順位│科目    │予算  │実績  │差異  │アクション│       │
│ ├───┼────────┼──────┼──────┼──────┼────────┤       │
│ │ 1 │売上高  │120億 │113.8億│▲6.2億│[詳細]  │       │
│ └───┴────────┴──────┴──────┴──────┴────────┘       │
├─────────────────────────────────────────────────────────┤
│ 詳細パネル（Sheet）                                      │
│ - 部門別内訳                                             │
│ - トレンドグラフ                                         │
│ - AI生成要因仮説                                         │
│ - 推奨アクション                                         │
└─────────────────────────────────────────────────────────┘
```

### 2. ヘッダー

```tsx
<Header className="border-b">
  <Container className="flex items-center justify-between py-4">
    <div>
      <Breadcrumb>
        <BreadcrumbItem>KPI管理</BreadcrumbItem>
        <BreadcrumbItem>差異分析</BreadcrumbItem>
      </Breadcrumb>
      <h1 className="text-2xl font-bold mt-2">
        FY2024 9月 予実差異分析レポート
      </h1>
      <p className="text-sm text-muted-foreground">
        生成日時: 2024-10-05 09:00
      </p>
    </div>
    <div className="flex gap-2">
      <Button variant="outline">
        <Download className="mr-2 h-4 w-4" />
        PDF出力
      </Button>
      <Button variant="outline">
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Excel出力
      </Button>
    </div>
  </Container>
</Header>
```

### 3. サマリカード

3枚のカードで重要指標を表示:

```tsx
<SummaryCards className="grid grid-cols-3 gap-4 mb-6">
  <Card>
    <CardHeader>
      <CardTitle className="text-sm text-muted-foreground">
        売上高 差異
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">▲¥62M</div>
      <p className="text-sm text-destructive">
        予算比 -5.2%
      </p>
      <Progress value={94.8} className="mt-2" />
      <p className="text-xs text-muted-foreground mt-1">
        達成率 94.8%
      </p>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle className="text-sm text-muted-foreground">
        営業利益 差異
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">▲¥11M</div>
      <p className="text-sm text-destructive">
        予算比 -8.0%
      </p>
      <Progress value={92.0} className="mt-2" />
      <p className="text-xs text-muted-foreground mt-1">
        達成率 92.0%
      </p>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle className="text-sm text-muted-foreground">
        リスク評価
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Badge variant="warning" className="text-lg px-3 py-1">
        🟡 中リスク
      </Badge>
      <p className="text-sm mt-2">
        売上下振れトレンド継続
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Q4での挽回が必要
      </p>
    </CardContent>
  </Card>
</SummaryCards>
```

### 4. TOP10差異テーブル

```tsx
<Card>
  <CardHeader>
    <CardTitle>TOP10 予実差異（絶対額）</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">順位</TableHead>
          <TableHead>科目</TableHead>
          <TableHead className="text-right">予算</TableHead>
          <TableHead className="text-right">実績</TableHead>
          <TableHead className="text-right">差異額</TableHead>
          <TableHead className="text-right">差異率</TableHead>
          <TableHead className="w-24">アクション</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {variances.map((v) => (
          <TableRow
            key={v.rank}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => openDetail(v)}
          >
            <TableCell>
              <Badge variant="outline">{v.rank}</Badge>
            </TableCell>
            <TableCell className="font-medium">
              {v.subject.name}
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(v.budget_amount)}
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(v.actual_amount)}
            </TableCell>
            <TableCell className="text-right font-mono">
              <span className={v.variance_amount < 0 ? 'text-destructive' : 'text-success'}>
                {formatVariance(v.variance_amount)}
              </span>
            </TableCell>
            <TableCell className="text-right font-mono">
              <span className={v.variance_pct < 0 ? 'text-destructive' : 'text-success'}>
                {formatPercentage(v.variance_pct)}
              </span>
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openDetail(v)}
              >
                詳細 <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

### 5. 詳細パネル（Sheet）

行クリックで右からスライドイン:

```tsx
<Sheet open={detailOpen} onOpenChange={setDetailOpen}>
  <SheetContent side="right" className="w-[600px] sm:w-[800px]">
    <SheetHeader>
      <SheetTitle>
        {selectedVariance?.subject.name} - 詳細分析
      </SheetTitle>
    </SheetHeader>

    <Tabs defaultValue="overview" className="mt-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">概要</TabsTrigger>
        <TabsTrigger value="breakdown">内訳</TabsTrigger>
        <TabsTrigger value="trend">トレンド</TabsTrigger>
        <TabsTrigger value="hypothesis">要因仮説</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewPanel variance={selectedVariance} />
      </TabsContent>

      <TabsContent value="breakdown">
        <BreakdownPanel variance={selectedVariance} />
      </TabsContent>

      <TabsContent value="trend">
        <TrendPanel variance={selectedVariance} />
      </TabsContent>

      <TabsContent value="hypothesis">
        <HypothesisPanel variance={selectedVariance} />
      </TabsContent>
    </Tabs>
  </SheetContent>
</Sheet>
```

#### 概要タブ

```tsx
<OverviewPanel>
  <Card>
    <CardHeader>
      <CardTitle>差異の事実</CardTitle>
    </CardHeader>
    <CardContent>
      <dl className="space-y-2">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">予算:</dt>
          <dd className="font-mono font-bold">
            {formatCurrency(variance.budget_amount)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">実績:</dt>
          <dd className="font-mono font-bold">
            {formatCurrency(variance.actual_amount)}
          </dd>
        </div>
        <Separator />
        <div className="flex justify-between">
          <dt className="text-muted-foreground">差異:</dt>
          <dd className="font-mono font-bold text-destructive">
            {formatVariance(variance.variance_amount)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">差異率:</dt>
          <dd className="font-mono font-bold text-destructive">
            {formatPercentage(variance.variance_pct)}
          </dd>
        </div>
      </dl>
    </CardContent>
  </Card>
</OverviewPanel>
```

#### 内訳タブ（部門別）

```tsx
<BreakdownPanel>
  <Card>
    <CardHeader>
      <CardTitle>部門別内訳</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>部門</TableHead>
            <TableHead className="text-right">予算</TableHead>
            <TableHead className="text-right">実績</TableHead>
            <TableHead className="text-right">差異</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variance.department_breakdown?.map((dept) => (
            <TableRow key={dept.department.stable_id}>
              <TableCell>{dept.department.name}</TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(dept.budget)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(dept.actual)}
              </TableCell>
              <TableCell className="text-right font-mono">
                <span className={dept.variance < 0 ? 'text-destructive' : 'text-success'}>
                  {formatVariance(dept.variance)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</BreakdownPanel>
```

#### トレンドタブ（グラフ）

```tsx
<TrendPanel>
  <Card>
    <CardHeader>
      <CardTitle>過去3ヶ月推移</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={variance.trend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip formatter={(value) => formatCurrency(value as number)} />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            name="実績"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4">
        <Alert variant={variance.trend_assessment === 'concern' ? 'destructive' : 'default'}>
          <TrendingDown className="h-4 w-4" />
          <AlertTitle>トレンド分析</AlertTitle>
          <AlertDescription>
            懸念: 8月から下振れトレンドに転換
          </AlertDescription>
        </Alert>
      </div>
    </CardContent>
  </Card>
</TrendPanel>
```

#### 要因仮説タブ（AI生成）

```tsx
<HypothesisPanel>
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Sparkles className="mr-2 h-5 w-5 text-primary" />
        AI生成 要因仮説
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2">主要因</h4>
        <p className="text-sm">{variance.hypothesis}</p>
      </div>

      {variance.past_cases && (
        <div>
          <h4 className="font-semibold mb-2">過去類似事例</h4>
          <p className="text-sm text-muted-foreground">
            {variance.past_cases}
          </p>
        </div>
      )}

      <Separator />

      <div>
        <h4 className="font-semibold mb-2">推奨アクション</h4>
        <ul className="space-y-2">
          {variance.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start">
              <CheckCircle2 className="mr-2 h-5 w-5 text-primary mt-0.5" />
              <span className="text-sm">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {variance.kpi_impact && (
        <>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">KPI・利益への影響</h4>
            <p className="text-sm">{variance.kpi_impact}</p>
          </div>
        </>
      )}
    </CardContent>
  </Card>

  <Card className="mt-4">
    <CardHeader>
      <CardTitle className="text-sm">免責事項</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-xs text-muted-foreground">
        本分析はAIによる自動生成です。最終的な経営判断は人間が行ってください。
      </p>
    </CardContent>
  </Card>
</HypothesisPanel>
```

---

## インタラクション

### 1. レポート生成フロー

1. ユーザーが期間を選択
2. 「レポート生成」ボタンをクリック
3. ローディング表示（2秒）
4. MockBffClient.generateVarianceReport() 呼び出し
5. レポート表示

### 2. 詳細パネル表示

1. テーブル行をクリック
2. 右からSheetスライドイン
3. タブでコンテンツ切り替え
4. Escapeキーで閉じる

---

## モックデータ

[BFF契約のモックデータをそのまま使用]

---

## ファイル構成

```
apps/web/_v0_drop/ai/variance-analysis/src/
├── components/
│   ├── VarianceReportPage.tsx       # メインページ
│   ├── SummaryCards.tsx             # サマリカード
│   ├── VarianceTable.tsx            # TOP10テーブル
│   ├── VarianceDetailSheet.tsx      # 詳細パネル
│   ├── OverviewPanel.tsx            # 概要タブ
│   ├── BreakdownPanel.tsx           # 内訳タブ
│   ├── TrendPanel.tsx               # トレンドタブ
│   └── HypothesisPanel.tsx          # 要因仮説タブ
├── api/
│   └── MockBffClient.ts
├── utils/
│   └── formatters.ts
├── types/
│   └── index.ts
└── page.tsx
```

---

## v0への指示

上記の要件に基づいて、以下を生成してください:

1. **VarianceReportPage.tsx**: メインページコンポーネント
2. **SummaryCards.tsx**: サマリカード3枚
3. **VarianceTable.tsx**: TOP10差異テーブル
4. **VarianceDetailSheet.tsx**: 詳細パネル（Sheet + Tabs）
5. **各タブコンポーネント**: Overview, Breakdown, Trend, Hypothesis
6. **page.tsx**: デモページ
7. **MockBffClient.ts**: モックAPIクライアント

**重要**:
- Rechartsでトレンドグラフ実装
- EPM特有の数値フォーマット
- 詳細パネルは右からスライドイン（Sheet）
- AI生成コンテンツは Sparkles アイコンで明示
