# v0 Prompt: グラフ自動生成（Graph Generation）

## プロジェクト概要

自然言語指示から適切なグラフ・表を自動生成する機能。「営業利益の前年比推移をグラフで」と指示すると、AIがグラフ種別を判定し、データを抽出してRechartsでグラフを表示する。

**実装方式**: v0_drop（モックデータ）
**デザイン**: チャット内埋め込み + 拡大表示

---

## 技術要件

### フレームワーク
- **React 18** + **TypeScript**
- **Recharts** (Line, Bar, Pie, Table)
- **shadcn/ui** (Card, Button, Dialog, Tabs)
- **Tailwind CSS**
- **html2canvas** (PNG出力用)
- **jsPDF** (PDF出力用)

---

## UI要件

### 1. チャット内グラフ表示

```tsx
<ChatMessage type="ai">
  <Text>営業利益の前年比推移です:</Text>

  <GraphCard className="mt-4">
    <GraphHeader>
      <GraphTitle>営業利益の前年比推移</GraphTitle>
      <GraphActions>
        <Button variant="ghost" size="icon" onClick={expandGraph}>
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={downloadPNG}>
          <Download className="h-4 w-4" />
        </Button>
      </GraphActions>
    </GraphHeader>

    <GraphContent>
      <LineChartComponent data={data} />
    </GraphContent>

    <GraphNarrative className="mt-4">
      <Text className="text-sm text-muted-foreground">
        2024年4-9月の営業利益は前年同期比+8.2%。
        主要要因は変動費削減（▲2億円）です。
      </Text>
    </GraphNarrative>
  </GraphCard>
</ChatMessage>
```

### 2. グラフカードスタイル

```tsx
<GraphCard>
  <div className="border rounded-lg p-4 bg-background">
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-semibold">{title}</h4>
      <div className="flex gap-1">
        {/* アクションボタン */}
      </div>
    </div>
    <div className="w-full h-[300px]">
      {/* グラフ本体 */}
    </div>
    {narrative && (
      <div className="mt-4 text-sm text-muted-foreground border-t pt-4">
        {narrative}
      </div>
    )}
  </div>
</GraphCard>
```

### 3. 拡大表示（Dialog）

```tsx
<Dialog open={expandedOpen} onOpenChange={setExpandedOpen}>
  <DialogContent className="max-w-4xl max-h-[90vh]">
    <DialogHeader>
      <DialogTitle>{graphTitle}</DialogTitle>
      <DialogDescription>
        {graphDescription}
      </DialogDescription>
    </DialogHeader>

    <Tabs defaultValue="chart">
      <TabsList>
        <TabsTrigger value="chart">グラフ</TabsTrigger>
        <TabsTrigger value="table">データテーブル</TabsTrigger>
      </TabsList>

      <TabsContent value="chart" className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            {/* 詳細設定 */}
          </LineChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="table">
        <DataTable data={data} />
      </TabsContent>
    </Tabs>

    <DialogFooter>
      <Button variant="outline" onClick={downloadPNG}>
        <Download className="mr-2 h-4 w-4" />
        PNG
      </Button>
      <Button variant="outline" onClick={downloadPDF}>
        <FileText className="mr-2 h-4 w-4" />
        PDF
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 4. 対応グラフ種類

#### 折れ線グラフ (Line Chart)

```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
    <XAxis
      dataKey="category"
      stroke="hsl(var(--muted-foreground))"
      fontSize={12}
    />
    <YAxis
      stroke="hsl(var(--muted-foreground))"
      fontSize={12}
      tickFormatter={(value) => `¥${(value / 1000000).toFixed(0)}M`}
    />
    <Tooltip
      contentStyle={{
        backgroundColor: 'hsl(var(--background))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
      }}
      formatter={(value: number) => formatCurrency(value)}
    />
    <Legend />
    {series.map((s) => (
      <Line
        key={s.dataKey}
        type="monotone"
        dataKey={s.dataKey}
        stroke={s.color}
        name={s.name}
        strokeWidth={2}
        dot={{ r: 4 }}
        activeDot={{ r: 6 }}
      />
    ))}
  </LineChart>
</ResponsiveContainer>
```

#### 棒グラフ (Bar Chart)

```tsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
    <XAxis dataKey="category" />
    <YAxis tickFormatter={(value) => `¥${(value / 1000000).toFixed(0)}M`} />
    <Tooltip formatter={(value: number) => formatCurrency(value)} />
    <Legend />
    {series.map((s) => (
      <Bar key={s.dataKey} dataKey={s.dataKey} fill={s.color} name={s.name} />
    ))}
  </BarChart>
</ResponsiveContainer>
```

#### 円グラフ (Pie Chart)

```tsx
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={data}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
      outerRadius={100}
      label={({ name, percentage }) => `${name} ${percentage}%`}
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
    </Pie>
    <Tooltip formatter={(value: number) => formatCurrency(value)} />
    <Legend />
  </PieChart>
</ResponsiveContainer>
```

#### データテーブル (Table)

```tsx
<Table>
  <TableHeader>
    <TableRow>
      {columns.map((col) => (
        <TableHead key={col.key} className={col.align === 'right' ? 'text-right' : ''}>
          {col.label}
        </TableHead>
      ))}
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((row, i) => (
      <TableRow key={i}>
        {columns.map((col) => (
          <TableCell
            key={col.key}
            className={`${col.align === 'right' ? 'text-right' : ''} ${col.format ? 'font-mono' : ''}`}
          >
            {col.format === 'currency'
              ? formatCurrency(row[col.key])
              : col.format === 'percentage'
              ? formatPercentage(row[col.key])
              : row[col.key]}
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## インタラクション

### 1. グラフ生成フロー

1. ユーザーが「営業利益の推移をグラフで」と質問
2. MockBffClient.generateGraph() 呼び出し
3. AI がグラフ種別を判定（line / bar / pie / table）
4. チャット内にグラフ表示
5. ナラティブ説明を追加

### 2. エクスポートフロー

**PNG出力**:
```typescript
import html2canvas from 'html2canvas';

async function downloadPNG(elementRef: RefObject<HTMLDivElement>) {
  const element = elementRef.current;
  if (!element) return;

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2, // 高解像度
  });

  const link = document.createElement('a');
  link.download = `graph-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
```

**PDF出力**:
```typescript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

async function downloadPDF(elementRef: RefObject<HTMLDivElement>) {
  const element = elementRef.current;
  if (!element) return;

  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(`graph-${Date.now()}.pdf`);
}
```

---

## モックデータ

### MockBffClient.ts

```typescript
async generateGraph(
  req: GraphGenerationRequestDto
): Promise<GraphGenerationResponseDto> {
  await this.simulateDelay(800);

  // 質問からグラフ種別を判定
  if (req.query.includes('推移') || req.query.includes('前年比')) {
    return this.mockLineChart();
  } else if (req.query.includes('比較')) {
    return this.mockBarChart();
  } else if (req.query.includes('構成比') || req.query.includes('円グラフ')) {
    return this.mockPieChart();
  } else {
    return this.mockTable();
  }
}

private mockLineChart(): GraphGenerationResponseDto {
  return {
    chart_type: 'line',
    title: '営業利益の前年比推移',
    data: {
      type: 'line',
      series: [
        { name: '2024年度', dataKey: 'value_2024', color: '#3b82f6' },
        { name: '2023年度', dataKey: 'value_2023', color: '#94a3b8' },
      ],
      data: [
        { category: '4月', value_2024: 120000000, value_2023: 110000000 },
        { category: '5月', value_2024: 125000000, value_2023: 115000000 },
        { category: '6月', value_2024: 130000000, value_2023: 120000000 },
        { category: '7月', value_2024: 128000000, value_2023: 118000000 },
        { category: '8月', value_2024: 132000000, value_2023: 122000000 },
        { category: '9月', value_2024: 127000000, value_2023: 121000000 },
      ],
      xAxisKey: 'category',
      yAxisLabel: '営業利益（円）',
    },
    narrative: '2024年4-9月の営業利益は前年同期比+8.2%。主要要因は変動費削減（▲2億円）です。',
    export_options: [
      { format: 'png', label: 'PNG画像' },
      { format: 'pdf', label: 'PDF' },
    ],
  };
}

private mockBarChart(): GraphGenerationResponseDto {
  return {
    chart_type: 'bar',
    title: '事業部別売上高比較',
    data: {
      type: 'bar',
      series: [
        { name: '2024年度', dataKey: 'value_2024', color: '#3b82f6' },
        { name: '2023年度', dataKey: 'value_2023', color: '#94a3b8' },
      ],
      data: [
        { category: '製造事業部', value_2024: 5400000000, value_2023: 5100000000 },
        { category: 'サービス事業部', value_2024: 4200000000, value_2023: 4000000000 },
        { category: 'その他', value_2024: 2400000000, value_2023: 2300000000 },
      ],
      xAxisKey: 'category',
      yAxisLabel: '売上高（円）',
    },
    narrative: '製造事業部が全体の45%を占め、前年比+5.9%と好調。',
  };
}

private mockPieChart(): GraphGenerationResponseDto {
  return {
    chart_type: 'pie',
    title: '事業部別売上構成比',
    data: {
      type: 'pie',
      data: [
        { name: '製造事業', value: 5400000000, percentage: 45.0, color: '#3b82f6' },
        { name: 'サービス事業', value: 4200000000, percentage: 35.0, color: '#10b981' },
        { name: 'その他', value: 2400000000, percentage: 20.0, color: '#f59e0b' },
      ],
    },
    narrative: '製造事業45%、サービス事業35%、その他20%。前年から製造が+5pt増加。',
  };
}

private mockTable(): GraphGenerationResponseDto {
  return {
    chart_type: 'table',
    title: '月次実績一覧',
    data: {
      type: 'table',
      columns: [
        { key: 'month', label: '月', format: undefined },
        { key: 'revenue', label: '売上高', format: 'currency' },
        { key: 'profit', label: '営業利益', format: 'currency' },
        { key: 'profit_rate', label: '利益率', format: 'percentage' },
      ],
      data: [
        { month: '4月', revenue: 2000000000, profit: 120000000, profit_rate: 6.0 },
        { month: '5月', revenue: 2100000000, profit: 125000000, profit_rate: 6.0 },
        { month: '6月', revenue: 2050000000, profit: 130000000, profit_rate: 6.3 },
      ],
    },
  };
}
```

---

## ファイル構成

```
apps/web/_v0_drop/ai/graph-generation/src/
├── components/
│   ├── GraphCard.tsx              # グラフカード
│   ├── LineChartComponent.tsx     # 折れ線グラフ
│   ├── BarChartComponent.tsx      # 棒グラフ
│   ├── PieChartComponent.tsx      # 円グラフ
│   ├── DataTableComponent.tsx     # データテーブル
│   ├── ExpandedGraphDialog.tsx    # 拡大表示
│   └── ExportButtons.tsx          # エクスポートボタン
├── api/
│   └── MockBffClient.ts
├── utils/
│   ├── formatters.ts
│   └── exportUtils.ts             # PNG/PDF出力
├── types/
│   └── index.ts
└── page.tsx                       # デモページ
```

---

## v0への指示

上記の要件に基づいて、以下を生成してください:

1. **GraphCard.tsx**: グラフカードコンポーネント
2. **LineChartComponent.tsx**: Recharts折れ線グラフ
3. **BarChartComponent.tsx**: Recharts棒グラフ
4. **PieChartComponent.tsx**: Recharts円グラフ
5. **DataTableComponent.tsx**: データテーブル
6. **ExpandedGraphDialog.tsx**: 拡大表示ダイアログ
7. **exportUtils.ts**: PNG/PDF出力ユーティリティ
8. **page.tsx**: デモページ（チャット統合例）

**重要**:
- Rechartsのデザインをカスタマイズ（EPMデザインシステム準拠）
- エクスポート機能を実装（html2canvas + jsPDF）
- レスポンシブ対応
