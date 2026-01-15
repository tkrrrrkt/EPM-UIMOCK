# EPM SaaS Design System Rules

このドキュメントは、EPM（Enterprise Project Management）SaaSシステムのデザインシステム定義です。v0での画面作成時は、必ずこのデザインシステムに準拠してUIを構築してください。

## 概要

モダンで洗練された、使いやすくシンプルなB2B向けエンタープライズSaaSのデザインシステムです。Deep Teal（プライマリー）とRoyal Indigo（セカンダリー）をベースカラーとし、統一感のあるプロフェッショナルなUIを実現します。

---

## カラーパレット

### プライマリーカラー（Deep Teal）
**用途**: 主要なアクション、ブランド表現、重要な要素の強調

- **Primary 50**: `#f0fdfc` - 非常に薄い背景
- **Primary 100**: `#ccfbf8` - 薄い背景、ホバー効果
- **Primary 200**: `#99f6f0` - サブ背景
- **Primary 300**: `#5eead4` - ライトアクセント
- **Primary 400**: `#2dd4bf` - アクティブ状態
- **Primary 500**: `#14b8a6` - **メインプライマリー（デフォルト）**
- **Primary 600**: `#0d9488` - ホバー、アクティブ
- **Primary 700**: `#0f766e` - 濃いアクセント
- **Primary 800**: `#115e59` - 強調テキスト
- **Primary 900**: `#134e4a` - 最も濃い

**CSS変数**: `--primary: 174 72% 56%` (HSL)

### セカンダリーカラー（Royal Indigo）
**用途**: セカンダリーアクション、バッジ、補助的な強調、グラフ

- **Secondary 50**: `#eef2ff` - 非常に薄い背景
- **Secondary 100**: `#e0e7ff` - 薄い背景
- **Secondary 200**: `#c7d2fe` - サブ背景
- **Secondary 300**: `#a5b4fc` - ライトアクセント
- **Secondary 400**: `#818cf8` - アクティブ状態
- **Secondary 500**: `#6366f1` - **メインセカンダリー（デフォルト）**
- **Secondary 600**: `#4f46e5` - ホバー、アクティブ
- **Secondary 700**: `#4338ca` - 濃いアクセント
- **Secondary 800**: `#3730a3` - 強調テキスト
- **Secondary 900**: `#312e81` - 最も濃い

**CSS変数**: `--secondary: 239 84% 67%` (HSL)

### セマンティックカラー

#### Success（成功・完了）
- **Success 50**: `#f0fdf4`
- **Success 500**: `#22c55e` - **メイン成功色**
- **Success 600**: `#16a34a`
- **Success 700**: `#15803d`

**用途**: 成功メッセージ、完了状態、ポジティブなフィードバック
**CSS変数**: `--success: 142 71% 45%` (HSL)

#### Warning（警告・注意）
- **Warning 50**: `#fffbeb`
- **Warning 500**: `#f59e0b` - **メイン警告色**
- **Warning 600**: `#d97706`
- **Warning 700**: `#b45309`

**用途**: 警告メッセージ、注意喚起、一時的な状態
**CSS変数**: `--warning: 38 92% 50%` (HSL)

#### Error（エラー・危険）
- **Error 50**: `#fef2f2`
- **Error 500**: `#ef4444` - **メインエラー色**
- **Error 600**: `#dc2626`
- **Error 700**: `#b91c1c`

**用途**: エラーメッセージ、削除アクション、危険な操作
**CSS変数**: `--destructive: 0 84% 60%` (HSL)

#### Info（情報）
- **Info 50**: `#eff6ff`
- **Info 500**: `#3b82f6` - **メイン情報色**
- **Info 600**: `#2563eb`
- **Info 700**: `#1d4ed8`

**用途**: 情報メッセージ、ヘルプテキスト、ガイダンス
**CSS変数**: `--info: 221 83% 53%` (HSL)

### ニュートラルカラー（グレースケール）

- **Neutral 50**: `#fafafa` - 背景（最も薄い）
- **Neutral 100**: `#f5f5f5` - カード背景
- **Neutral 200**: `#e5e5e5` - ボーダー（薄い）
- **Neutral 300**: `#d4d4d4` - ボーダー
- **Neutral 400**: `#a3a3a3` - プレースホルダー
- **Neutral 500**: `#737373` - 補助テキスト
- **Neutral 600**: `#525252` - セカンダリーテキスト
- **Neutral 700**: `#404040` - テキスト
- **Neutral 800**: `#262626` - メインテキスト
- **Neutral 900**: `#171717` - 最も濃いテキスト

### グラデーションパターン

#### Primary Gradient
```css
background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
```
**用途**: ヒーローセクション、CTAボタン、特別な強調エリア

#### Secondary Gradient
```css
background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
```
**用途**: セカンダリーヒーロー、バッジ、グラフビジュアライゼーション

#### Neutral Gradient
```css
background: linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%);
```
**用途**: 背景、サブセクション

#### Success Gradient
```css
background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
```
**用途**: 成功メッセージ、完了画面

---

## タイポグラフィ

### フォントファミリー

```css
--font-sans: 'Geist', 'Geist Fallback', system-ui, -apple-system, sans-serif;
--font-mono: 'Geist Mono', 'Geist Mono Fallback', 'Courier New', monospace;
```

**使用方法**:
- **本文・UI全般**: `font-sans` クラスを使用
- **コード・数値**: `font-mono` クラスを使用

### フォントサイズ（Tailwindクラス）

- `text-xs`: 0.75rem (12px) - キャプション、メタ情報
- `text-sm`: 0.875rem (14px) - 小さな本文、ラベル
- `text-base`: 1rem (16px) - **標準本文**
- `text-lg`: 1.125rem (18px) - リード文、小見出し
- `text-xl`: 1.25rem (20px) - 中見出し
- `text-2xl`: 1.5rem (24px) - セクション見出し
- `text-3xl`: 1.875rem (30px) - ページタイトル
- `text-4xl`: 2.25rem (36px) - 大きなタイトル

### フォントウェイト

- `font-normal`: 400 - 標準本文
- `font-medium`: 500 - 強調テキスト
- `font-semibold`: 600 - 見出し、ラベル
- `font-bold`: 700 - 強い強調、大見出し

### 行間（Line Height）

- `leading-tight`: 1.25 - 見出し用
- `leading-normal`: 1.5 - **標準（推奨）**
- `leading-relaxed`: 1.625 - 読みやすい本文

**推奨**: 本文には `leading-relaxed` または `leading-6` を使用して可読性を確保

---

## スペーシング

Tailwindのスペーシングスケールを使用（4px基準）

### よく使うスペーシング

- `p-2`: 0.5rem (8px) - 小さなパディング
- `p-4`: 1rem (16px) - **標準パディング**
- `p-6`: 1.5rem (24px) - 中程度のパディング
- `p-8`: 2rem (32px) - 大きなパディング
- `gap-4`: 1rem (16px) - **標準ギャップ**
- `gap-6`: 1.5rem (24px) - 広めのギャップ

**原則**: 
- コンポーネント内部: `p-4`, `p-6`, `gap-4`
- セクション間: `p-8`, `gap-6`, `gap-8`
- 任意の値 `p-[16px]` は避け、Tailwindのスケール `p-4` を使用

---

## ボーダーラジウス（角丸）

```css
--radius: 0.5rem; /* 8px */
```

### 使用パターン

- `rounded-sm`: 0.125rem (2px) - 小さな要素
- `rounded`: 0.25rem (4px) - ボタン、インプット（小）
- `rounded-md`: 0.375rem (6px) - **標準（カード、ボタン）**
- `rounded-lg`: 0.5rem (8px) - **推奨（カード、モーダル）**
- `rounded-xl`: 0.75rem (12px) - 大きなカード
- `rounded-2xl`: 1rem (16px) - ヒーローカード

**推奨**: カードやモーダルには `rounded-lg` または `rounded-xl` を使用

---

## シャドウ（影）

### 標準シャドウ

- `shadow-sm`: 軽い影 - インプット、小さなカード
- `shadow`: **標準の影（推奨）** - カード、ボタン
- `shadow-md`: 中程度の影 - 浮いたカード
- `shadow-lg`: 大きな影 - モーダル、ドロップダウン
- `shadow-xl`: 非常に大きな影 - オーバーレイ

### カスタムシャドウ（CSS変数で定義済み）

```css
--shadow-soft: 0 2px 8px rgba(0, 0, 0, 0.08);
--shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.12);
--shadow-strong: 0 8px 24px rgba(0, 0, 0, 0.16);
```

**推奨**: カードには `shadow` または `shadow-md`、モーダルには `shadow-lg` を使用

---

## ボタンコンポーネント

### Primary Button（主要アクション）

```tsx
<Button variant="default" size="default">
  保存
</Button>
```

**スタイル**:
- 背景: `bg-primary` (#14b8a6)
- テキスト: `text-primary-foreground` (白)
- ホバー: `hover:bg-primary/90`
- サイズ: `h-10 px-4 py-2`

**用途**: 最も重要なアクション（保存、送信、確定など）

### Secondary Button（セカンダリーアクション）

```tsx
<Button variant="secondary" size="default">
  キャンセル
</Button>
```

**スタイル**:
- 背景: `bg-secondary` (#e5e5e5)
- テキスト: `text-secondary-foreground`
- ホバー: `hover:bg-secondary/80`

**用途**: 補助的なアクション（キャンセル、戻る、スキップなど）

### Outline Button（アウトライン）

```tsx
<Button variant="outline" size="default">
  詳細
</Button>
```

**スタイル**:
- 背景: 透明
- ボーダー: `border border-input`
- テキスト: `text-foreground`
- ホバー: `hover:bg-accent`

**用途**: 低優先度のアクション（詳細、編集、その他）

### Ghost Button（ゴースト）

```tsx
<Button variant="ghost" size="default">
  閉じる
</Button>
```

**スタイル**:
- 背景: 透明
- ボーダー: なし
- ホバー: `hover:bg-accent`

**用途**: 最小限の強調（閉じる、もっと見る、ナビゲーション）

### Destructive Button（削除・危険）

```tsx
<Button variant="destructive" size="default">
  削除
</Button>
```

**スタイル**:
- 背景: `bg-destructive` (エラー色)
- テキスト: `text-destructive-foreground`
- ホバー: `hover:bg-destructive/90`

**用途**: 削除、破壊的な操作

### アイコン付きボタン

```tsx
<Button variant="default" size="default">
  <Plus className="mr-2 h-4 w-4" />
  新規作成
</Button>
```

**ガイドライン**:
- アイコンサイズ: `h-4 w-4` (16px)
- 左アイコン: `mr-2`
- 右アイコン: `ml-2`

### アイコンボタン

```tsx
<Button variant="ghost" size="icon">
  <Search className="h-4 w-4" />
</Button>
```

**サイズ**: `size="icon"` で正方形のアイコンボタン

---

## カードコンポーネント

### 基本カード

```tsx
<Card>
  <CardHeader>
    <CardTitle>タイトル</CardTitle>
    <CardDescription>説明文</CardDescription>
  </CardHeader>
  <CardContent>
    コンテンツ
  </CardContent>
  <CardFooter>
    <Button>アクション</Button>
  </CardFooter>
</Card>
```

**スタイル**:
- 背景: `bg-card`
- ボーダー: `border border-border`
- 角丸: `rounded-lg`
- 影: `shadow`

**用途**: 情報のグループ化、ダッシュボードウィジェット

### 統計カード

```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">売上高</CardTitle>
    <DollarSign className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">¥12.5M</div>
    <p className="text-xs text-muted-foreground">前月比 +20.1%</p>
  </CardContent>
</Card>
```

**ガイドライン**:
- タイトル: `text-sm font-medium`
- 数値: `text-2xl font-bold`
- サブテキスト: `text-xs text-muted-foreground`

---

## テーブルコンポーネント

### 基本テーブル

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>項目名</TableHead>
      <TableHead>ステータス</TableHead>
      <TableHead>日付</TableHead>
      <TableHead className="text-right">金額</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">データ1</TableCell>
      <TableCell>
        <Badge variant="default">完了</Badge>
      </TableCell>
      <TableCell>2025-11-09</TableCell>
      <TableCell className="text-right">¥1,234</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**スタイル**:
- ヘッダー: `bg-muted/50`, `font-medium`
- セル: `p-4`, `align-middle`
- ホバー: `hover:bg-muted/50`

**ガイドライン**:
- 重要なセル（名前など）: `font-medium`
- 金額の右揃え: `text-right`
- ステータスにはBadgeを使用

---

## フォームコンポーネント

### Input（テキスト入力）

```tsx
<Input
  type="text"
  placeholder="入力してください"
  className="w-full"
/>
```

**スタイル**:
- 高さ: `h-10`
- パディング: `px-3 py-2`
- ボーダー: `border border-input`
- 角丸: `rounded-md`
- フォーカス: `focus-visible:ring-2 focus-visible:ring-ring`

### Textarea（複数行テキスト）

```tsx
<Textarea
  placeholder="詳細を入力してください"
  rows={4}
/>
```

### Select（ドロップダウン）

```tsx
<Select>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="選択してください" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">オプション1</SelectItem>
    <SelectItem value="option2">オプション2</SelectItem>
  </SelectContent>
</Select>
```

### Checkbox（チェックボックス）

```tsx
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <label htmlFor="terms" className="text-sm font-medium">
    利用規約に同意する
  </label>
</div>
```

### Switch（トグルスイッチ）

```tsx
<div className="flex items-center space-x-2">
  <Switch id="notifications" />
  <label htmlFor="notifications" className="text-sm font-medium">
    通知を有効にする
  </label>
</div>
```

### Date Picker（日付選択）

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" className="w-full justify-start text-left bg-transparent">
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, "PPP") : <span>日付を選択</span>}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0">
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
    />
  </PopoverContent>
</Popover>
```

---

## バッジコンポーネント

### デフォルトバッジ

```tsx
<Badge variant="default">進行中</Badge>
```

**バリアント**:
- `default`: プライマリーカラー（デフォルト）
- `secondary`: セカンダリーカラー
- `outline`: アウトライン
- `destructive`: エラー・警告

### カスタムカラーバッジ

```tsx
<Badge className="bg-success text-white">完了</Badge>
<Badge className="bg-warning text-white">保留</Badge>
<Badge className="bg-error text-white">エラー</Badge>
<Badge className="bg-secondary-500 text-white">レビュー中</Badge>
```

---

## アラート・通知コンポーネント

### Alert（アラート）

```tsx
<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>注意</AlertTitle>
  <AlertDescription>
    この操作は取り消せません。
  </AlertDescription>
</Alert>
```

**バリアント（カスタムクラスで）**:

```tsx
{/* Success */}
<Alert className="border-success bg-success/10 text-success">
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>成功</AlertTitle>
  <AlertDescription>保存が完了しました。</AlertDescription>
</Alert>

{/* Warning */}
<Alert className="border-warning bg-warning/10 text-warning">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>警告</AlertTitle>
  <AlertDescription>変更が保存されていません。</AlertDescription>
</Alert>

{/* Error */}
<Alert className="border-destructive bg-destructive/10 text-destructive">
  <XCircle className="h-4 w-4" />
  <AlertTitle>エラー</AlertTitle>
  <AlertDescription>操作に失敗しました。</AlertDescription>
</Alert>
```

### Toast（トースト通知）

```tsx
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()

toast({
  title: "保存完了",
  description: "データが正常に保存されました。",
})

// 成功
toast({
  title: "成功",
  description: "操作が完了しました。",
  className: "border-success bg-success/10",
})

// エラー
toast({
  variant: "destructive",
  title: "エラー",
  description: "操作に失敗しました。",
})
```

---

## タブコンポーネント

### 水平タブ（デフォルト）

```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">タブ1</TabsTrigger>
    <TabsTrigger value="tab2">タブ2</TabsTrigger>
    <TabsTrigger value="tab3">タブ3</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    タブ1のコンテンツ
  </TabsContent>
  <TabsContent value="tab2">
    タブ2のコンテンツ
  </TabsContent>
</Tabs>
```

### アンダーラインタブ（シンプル）

```tsx
<Tabs defaultValue="tab1" className="w-full">
  <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0">
    <TabsTrigger 
      value="tab1"
      className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
    >
      概要
    </TabsTrigger>
    <TabsTrigger 
      value="tab2"
      className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
    >
      詳細
    </TabsTrigger>
  </TabsList>
</Tabs>
```

---

## ダイアログ・モーダル

### 基本ダイアログ

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>開く</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>タイトル</DialogTitle>
      <DialogDescription>
        説明文がここに入ります。
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      {/* コンテンツ */}
    </div>
    <DialogFooter>
      <Button variant="outline">キャンセル</Button>
      <Button>保存</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 確認ダイアログ

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">削除</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
      <AlertDialogDescription>
        この操作は取り消せません。
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>キャンセル</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
        削除
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## ページネーション

### 標準ページネーション

```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">10</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

---

## ファイルアップロード

### シンプルなファイルアップロード

```tsx
<div className="grid w-full max-w-sm items-center gap-1.5">
  <Label htmlFor="file">ファイル</Label>
  <Input id="file" type="file" />
</div>
```

### ドラッグ&ドロップアップロード

```tsx
<div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
  <p className="text-sm font-medium mb-1">
    ファイルをドラッグ&ドロップ
  </p>
  <p className="text-xs text-muted-foreground mb-4">
    または クリックして選択
  </p>
  <Input type="file" className="hidden" />
</div>
```

---

## プログレスバー

```tsx
<Progress value={60} className="w-full" />
```

**カスタムカラー**:
```tsx
<Progress value={60} className="w-full [&>div]:bg-success" />
<Progress value={30} className="w-full [&>div]:bg-warning" />
<Progress value={90} className="w-full [&>div]:bg-secondary-500" />
```

---

## レイアウトパターン

### サイドバー付きレイアウト

```tsx
<div className="flex h-screen">
  {/* サイドバー */}
  <aside className="w-64 border-r border-border bg-card">
    <nav className="p-4">
      {/* ナビゲーション */}
    </nav>
  </aside>
  
  {/* メインコンテンツ */}
  <div className="flex-1 flex flex-col">
    {/* ヘッダー */}
    <header className="h-16 border-b border-border bg-background px-6 flex items-center justify-between">
      {/* ヘッダーコンテンツ */}
    </header>
    
    {/* メインエリア */}
    <main className="flex-1 overflow-auto p-6">
      {/* コンテンツ */}
    </main>
  </div>
</div>
```

### グリッドレイアウト（ダッシュボード）

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <Card>統計カード1</Card>
  <Card>統計カード2</Card>
  <Card>統計カード3</Card>
  <Card>統計カード4</Card>
</div>
```

### 2カラムレイアウト

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* メインコンテンツ（2カラム分） */}
  <div className="lg:col-span-2">
    <Card>メインコンテンツ</Card>
  </div>
  
  {/* サイドバー（1カラム分） */}
  <div>
    <Card>サイドバーコンテンツ</Card>
  </div>
</div>
```

---

## アイコン使用ガイドライン

### アイコンライブラリ

```tsx
import { Search, Bell, User, Settings, Menu, Plus, Edit, Trash2, Check, X, ChevronDown, ChevronRight, Home, FileText, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
```

### アイコンサイズ

- `h-3 w-3`: 12px - 非常に小さい
- `h-4 w-4`: 16px - **標準（推奨）**
- `h-5 w-5`: 20px - 中サイズ
- `h-6 w-6`: 24px - 大きめ
- `h-8 w-8`: 32px - 大きい

### アイコンの色

```tsx
<Search className="h-4 w-4 text-muted-foreground" />
<Bell className="h-4 w-4 text-primary" />
<AlertCircle className="h-4 w-4 text-destructive" />
```

---

## ダークモード対応

全てのコンポーネントはダークモードに自動対応します。カラーはCSS変数で定義されており、`dark:`プレフィックスは不要です。

### ダークモード用カラー変数（自動適用）

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: 222 47% 11%;
    --foreground: 213 31% 91%;
    --card: 222 47% 11%;
    --card-foreground: 213 31% 91%;
    /* その他の変数も自動で切り替わる */
  }
}
```

---

## 実装ルール

### 必須ルール

1. **カラーは必ずデザインシステムのパレットから選択する**
   - プライマリー: `bg-primary`, `text-primary`, `border-primary`
   - セカンダリー: `bg-secondary-500`, `text-secondary-600`
   - セマンティック: `bg-success`, `bg-warning`, `bg-destructive`
   - 任意の色 `bg-[#14b8a6]` は使用しない

2. **コンポーネントはshadcn/uiを使用する**
   - Button, Card, Input, Select, Dialog等、既存コンポーネントを活用
   - カスタムコンポーネントを作る前に、既存コンポーネントで実現できないか確認

3. **スペーシングはTailwindのスケールを使用する**
   - `gap-4`, `p-6`, `mx-4` 等
   - `gap-[16px]`, `p-[24px]` のような任意の値は避ける

4. **レイアウトはFlexboxを優先する**
   - `flex items-center justify-between`
   - 複雑な2Dレイアウトのみ `grid` を使用

5. **テキストは可読性を確保する**
   - 本文: `leading-relaxed` または `leading-6`
   - コントラスト: WCAG AA準拠

6. **ボーダーラジウスは統一する**
   - カード・モーダル: `rounded-lg` または `rounded-xl`
   - ボタン・インプット: `rounded-md`

7. **シャドウは控えめに使用する**
   - カード: `shadow` または `shadow-md`
   - モーダル: `shadow-lg`

### コード例（推奨パターン）

```tsx
// ✅ 良い例
<Card className="rounded-lg shadow-md">
  <CardHeader>
    <CardTitle className="text-2xl font-semibold text-foreground">
      プロジェクト概要
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">ステータス</span>
      <Badge className="bg-success text-white">進行中</Badge>
    </div>
  </CardContent>
  <CardFooter className="flex gap-2">
    <Button variant="default" className="flex-1">
      <Check className="mr-2 h-4 w-4" />
      承認
    </Button>
    <Button variant="outline" className="flex-1 bg-transparent">
      詳細
    </Button>
  </CardFooter>
</Card>

// ❌ 悪い例
<div style={{ backgroundColor: '#14b8a6', padding: '16px', borderRadius: '8px' }}>
  <h2 style={{ fontSize: '24px', fontWeight: 600 }}>プロジェクト概要</h2>
  <div style={{ marginTop: '16px' }}>
    <span>ステータス</span>
    <span style={{ backgroundColor: '#22c55e', color: 'white', padding: '4px 8px' }}>
      進行中
    </span>
  </div>
</div>
```

---

## チェックリスト

新しい画面・コンポーネントを作成する際は、以下を確認してください：

- [ ] プライマリーカラー（Deep Teal）またはセカンダリーカラー（Royal Indigo）を使用している
- [ ] セマンティックカラー（Success, Warning, Error）を適切に使用している
- [ ] 任意の色値（`bg-[#xxx]`）ではなく、定義済みのカラークラスを使用している
- [ ] shadcn/uiコンポーネント（Button, Card, Input等）を活用している
- [ ] Tailwindのスペーシングスケール（`p-4`, `gap-6`等）を使用している
- [ ] Flexboxを優先し、必要な場合のみGridを使用している
- [ ] テキストに適切な`leading-relaxed`を設定している
- [ ] ボーダーラジウスは`rounded-lg`等、統一されたスケールを使用している
- [ ] シャドウは控えめ（`shadow`, `shadow-md`）に使用している
- [ ] アイコンサイズは`h-4 w-4`を標準としている
- [ ] ダークモード対応（CSS変数ベース）を考慮している

---

## まとめ

このデザインシステムは、EPM SaaS製品の全ての画面・コンポーネント作成時に適用されます。**必ず定義されたカラー、コンポーネント、スペーシング、レイアウトパターンに従ってください**。統一感のある、プロフェッショナルで使いやすいUIを実現するために、このルールを遵守してください。

---

**バージョン**: 1.0  
**最終更新**: 2025-11-09  
**対象プロダクト**: EPM SaaS System
