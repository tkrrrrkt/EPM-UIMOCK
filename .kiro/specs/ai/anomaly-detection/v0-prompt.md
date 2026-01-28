# v0 Prompt: 異常値検知アラート（Anomaly Detection Alert）

## プロジェクト概要

実績データ入力時・月次締め時に異常値を自動検知してアラート通知する機能。「前月比+180%」「過去平均の-40%」等の異常値を検出し、ユーザーに確認を促す。

**実装方式**: v0_drop（モックデータ）
**デザイン**: モーダルアラート + 一覧テーブル

---

## 技術要件

### フレームワーク
- **React 18** + **TypeScript**
- **shadcn/ui** (Dialog, Alert, AlertDialog, Table, Badge)
- **Tailwind CSS**
- **Lucide React** (アイコン)

---

## UI要件

### 1. 入力時アラート（AlertDialog）

実績入力時、異常値を検知したら即座にモーダル表示:

```tsx
<AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        異常値検知
      </AlertDialogTitle>
      <AlertDialogDescription>
        入力された値が通常の範囲を大きく外れています
      </AlertDialogDescription>
    </AlertDialogHeader>

    <div className="space-y-4 py-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>広告宣伝費が前月比+180%です</AlertTitle>
        <AlertDescription>
          入力ミスの可能性があります。確認してください。
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">前月実績:</p>
          <p className="text-lg font-mono font-bold">
            ¥18,000,000
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">今月入力:</p>
          <p className="text-lg font-mono font-bold text-destructive">
            ¥50,000,000
          </p>
        </div>
      </div>

      <div>
        <p className="text-muted-foreground text-sm">差異:</p>
        <p className="text-xl font-mono font-bold text-destructive">
          +¥32,000,000 (+180%)
        </p>
      </div>

      <Separator />

      <div>
        <Label>確認してください:</Label>
        <RadioGroup defaultValue="check" className="mt-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="error" id="error" />
            <Label htmlFor="error" className="font-normal">
              入力ミスです（値を修正します）
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="correct" id="correct" />
            <Label htmlFor="correct" className="font-normal">
              正しい値です（理由を入力）
            </Label>
          </div>
        </RadioGroup>
      </div>

      {reason === 'correct' && (
        <div>
          <Label>理由・コメント:</Label>
          <Textarea
            placeholder="例: 新製品キャンペーンの前倒し実施"
            className="mt-2"
          />
        </div>
      )}
    </div>

    <AlertDialogFooter>
      <AlertDialogCancel>キャンセル</AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirm}>
        確認して続ける
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### 2. アラート一覧ページ

全アラートを一覧表示:

```tsx
<Page>
  <Header>
    <Breadcrumb>
      <BreadcrumbItem>KPI管理</BreadcrumbItem>
      <BreadcrumbItem>異常値アラート</BreadcrumbItem>
    </Breadcrumb>
    <h1 className="text-2xl font-bold mt-2">異常値アラート</h1>
  </Header>

  <FilterBar className="mb-6">
    <Select value={filterStatus} onValueChange={setFilterStatus}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="ステータス" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">すべて</SelectItem>
        <SelectItem value="pending">未確認</SelectItem>
        <SelectItem value="confirmed">確認済み</SelectItem>
        <SelectItem value="ignored">無視</SelectItem>
      </SelectContent>
    </Select>

    <Select value={filterSeverity} onValueChange={setFilterSeverity}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="重要度" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">すべて</SelectItem>
        <SelectItem value="high">高</SelectItem>
        <SelectItem value="medium">中</SelectItem>
        <SelectItem value="low">低</SelectItem>
      </SelectContent>
    </Select>
  </FilterBar>

  <SummaryCards className="grid grid-cols-3 gap-4 mb-6">
    <Card>
      <CardContent className="pt-6">
        <div className="text-2xl font-bold">{summary.total}</div>
        <p className="text-sm text-muted-foreground">総アラート数</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="pt-6">
        <div className="text-2xl font-bold text-destructive">
          {summary.pending}
        </div>
        <p className="text-sm text-muted-foreground">未確認</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="pt-6">
        <div className="text-2xl font-bold text-destructive">
          {summary.high_severity}
        </div>
        <p className="text-sm text-muted-foreground">高重要度</p>
      </CardContent>
    </Card>
  </SummaryCards>

  <AlertTable alerts={filteredAlerts} onConfirm={handleConfirm} />
</Page>
```

### 3. アラートテーブル

```tsx
<Card>
  <CardContent className="pt-6">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">重要度</TableHead>
          <TableHead>科目</TableHead>
          <TableHead>部門</TableHead>
          <TableHead>期間</TableHead>
          <TableHead className="text-right">検知値</TableHead>
          <TableHead className="text-right">予想値</TableHead>
          <TableHead className="text-right">差異</TableHead>
          <TableHead>メッセージ</TableHead>
          <TableHead className="w-24">ステータス</TableHead>
          <TableHead className="w-24">アクション</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alerts.map((alert) => (
          <TableRow key={alert.id}>
            <TableCell>
              <SeverityBadge severity={alert.severity} />
            </TableCell>
            <TableCell className="font-medium">
              {alert.subject.name}
            </TableCell>
            <TableCell>{alert.department.name}</TableCell>
            <TableCell>{alert.period.display_label}</TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(alert.detected_amount)}
            </TableCell>
            <TableCell className="text-right font-mono text-muted-foreground">
              {formatCurrency(alert.expected_amount)}
            </TableCell>
            <TableCell className="text-right font-mono">
              <span className="text-destructive">
                {formatVariance(alert.variance_amount, alert.variance_pct)}
              </span>
            </TableCell>
            <TableCell className="max-w-xs">
              <p className="text-sm truncate">{alert.message}</p>
            </TableCell>
            <TableCell>
              <StatusBadge status={alert.status} />
            </TableCell>
            <TableCell>
              {alert.status === 'pending' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openConfirmDialog(alert)}
                >
                  確認
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

### 4. 重要度バッジ

```tsx
<SeverityBadge severity="high">
  <Badge variant="destructive">
    🔴 高
  </Badge>
</SeverityBadge>

<SeverityBadge severity="medium">
  <Badge variant="warning">
    🟡 中
  </Badge>
</SeverityBadge>

<SeverityBadge severity="low">
  <Badge variant="secondary">
    🟢 低
  </Badge>
</SeverityBadge>
```

### 5. ステータスバッジ

```tsx
<StatusBadge status="pending">
  <Badge variant="outline" className="text-destructive border-destructive">
    未確認
  </Badge>
</StatusBadge>

<StatusBadge status="confirmed">
  <Badge variant="outline" className="text-success border-success">
    確認済み
  </Badge>
</StatusBadge>

<StatusBadge status="ignored">
  <Badge variant="secondary">
    無視
  </Badge>
</StatusBadge>
```

### 6. 確認ダイアログ

```tsx
<Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>異常値の確認</DialogTitle>
      <DialogDescription>
        このアラートを確認しますか？
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 py-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{selectedAlert.message}</AlertTitle>
        <AlertDescription>
          {selectedAlert.subject.name} - {selectedAlert.department.name}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">検知値:</p>
          <p className="font-mono font-bold">
            {formatCurrency(selectedAlert.detected_amount)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">予想値:</p>
          <p className="font-mono">
            {formatCurrency(selectedAlert.expected_amount)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">差異:</p>
          <p className="font-mono text-destructive">
            {formatPercentage(selectedAlert.variance_pct)}
          </p>
        </div>
      </div>

      <Separator />

      <div>
        <Label>対応:</Label>
        <RadioGroup defaultValue="confirm" className="mt-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="confirm" id="confirm" />
            <Label htmlFor="confirm" className="font-normal">
              確認済み（正しい値）
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ignore" id="ignore" />
            <Label htmlFor="ignore" className="font-normal">
              無視する
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label>備考:</Label>
        <Textarea
          placeholder="確認内容や理由を入力..."
          className="mt-2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
        キャンセル
      </Button>
      <Button onClick={handleConfirmAlert}>
        確認
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## インタラクション

### 1. 入力時アラートフロー

1. ユーザーが実績データを入力
2. Blurイベント or 次のフィールドへ移動
3. 値の検証（MockBffClient.detectAnomaly()）
4. 異常値検出 → AlertDialog 表示
5. ユーザーが確認・コメント入力
6. 「確認して続ける」→ データ保存 + アラート記録

### 2. 一覧ページフロー

1. ページロード時、MockBffClient.getAnomalyAlerts() 呼び出し
2. フィルタリング（ステータス、重要度）
3. テーブル表示
4. 「確認」ボタン → 確認ダイアログ表示
5. 対応選択 + 備考入力
6. 確認 → ステータス更新

### 3. 月次締め前チェック

月次締め画面で:

```tsx
<Dialog open={closeCheckDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>月次締め前チェック</DialogTitle>
    </DialogHeader>

    <div className="space-y-4 py-4">
      {anomalyAlerts.length > 0 ? (
        <>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {anomalyAlerts.length}件の異常値が検出されました
            </AlertTitle>
            <AlertDescription>
              確認してから締め処理を実行してください
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            {anomalyAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between border rounded p-2">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={alert.severity} />
                  <span className="text-sm">{alert.message}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => viewAlert(alert)}>
                  詳細
                </Button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertTitle>異常値なし</AlertTitle>
          <AlertDescription>
            すべてのデータが正常範囲内です
          </AlertDescription>
        </Alert>
      )}
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setCloseCheckDialogOpen(false)}>
        キャンセル
      </Button>
      {anomalyAlerts.length > 0 ? (
        <>
          <Button variant="outline" onClick={viewAllAlerts}>
            アラート一覧を確認
          </Button>
          <Button onClick={forceClose} variant="destructive">
            確認せずに締める
          </Button>
        </>
      ) : (
        <Button onClick={proceedClose}>
          締め処理を実行
        </Button>
      )}
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## モックデータ

[BFF契約のモックデータをそのまま使用]

---

## ファイル構成

```
apps/web/_v0_drop/ai/anomaly-detection/src/
├── components/
│   ├── AnomalyAlertDialog.tsx        # 入力時アラート
│   ├── AnomalyListPage.tsx           # 一覧ページ
│   ├── AnomalyTable.tsx              # アラートテーブル
│   ├── ConfirmAnomalyDialog.tsx      # 確認ダイアログ
│   ├── CloseCheckDialog.tsx          # 月次締め前チェック
│   ├── SeverityBadge.tsx             # 重要度バッジ
│   └── StatusBadge.tsx               # ステータスバッジ
├── api/
│   └── MockBffClient.ts
├── utils/
│   └── formatters.ts
├── types/
│   └── index.ts
└── page.tsx                          # デモページ
```

---

## v0への指示

上記の要件に基づいて、以下を生成してください:

1. **AnomalyAlertDialog.tsx**: 入力時アラートダイアログ
2. **AnomalyListPage.tsx**: アラート一覧ページ
3. **AnomalyTable.tsx**: アラートテーブル
4. **ConfirmAnomalyDialog.tsx**: 確認ダイアログ
5. **CloseCheckDialog.tsx**: 月次締め前チェックダイアログ
6. **SeverityBadge.tsx**: 重要度バッジコンポーネント
7. **StatusBadge.tsx**: ステータスバッジコンポーネント
8. **page.tsx**: デモページ（各UIパターンの統合例）

**重要**:
- AlertDialog の UX を重視（ユーザーが迷わない）
- 重要度とステータスの視覚的区別
- アクセシビリティ対応（Escape で閉じる、フォーカス管理）
