# EPM SaaS Design System Rules (SSoT / 合体版)

このドキュメントは、EPM（**Enterprise Performance Management**）SaaSシステムのデザインシステム定義です。
v0 / Cursor / 人間が UI を作成する際は、**必ずこのデザインシステムに準拠**してください。

---

## 0. SSoT（Single Source of Truth）と“二重管理”の扱い

このREADMEは **「人が理解しやすい日本語の定義（解説＋例）」** を厚めに持ちます。
一方で、**実装で使われる色・影・角丸などの“真の値”はCSS tokensが正本**です。

### 0.1 正本（実体）の置き場

* ルール（本書）: `apps/web/src/shared/ui/README.md`
* Tokens（色/影/角丸/タイポ等の実体）: `apps/web/src/shared/ui/tokens/globals.css`
* UI Components（共通部品）: `apps/web/src/shared/ui/components/*`
* App Shell（レイアウトの正本）: `apps/web/src/shared/shell/*`
* Navigation/Menu（IAの正本）: `apps/web/src/shared/navigation/menu.ts`

### 0.2 二重管理を許容する範囲と注意書き（必読）

本書では、理解しやすさのために **カラーHEX例やHSL例**も掲載します。
ただし、**実装上の最終的な値は tokens/globals.css が正本**です。

> ✅ ルール変更の手順（必須）

* **色の“値”を変える場合**：`tokens/globals.css` を更新し、必要なら本READMEの説明例も追随させる
* **色の“用途・使い方”を変える場合**：本READMEを更新し、必要なら tokens や Tailwind設定も追随させる
* **コンポーネントの標準（Tier）を変える場合**：本README（Tier定義）を更新し、必要なら v0-prompt-template も更新する

> ✅ 追随先（要チェック）

* `apps/web/src/shared/ui/tokens/globals.css`（色・影・角丸の実体）
* `apps/web/tailwind.config.(ts|js)`（`bg-primary` 等が tokens を参照できるか）
* `/.kiro/steering/v0-prompt-template.md`（v0がTier1を守る制約）

---

## 1. 概要

モダンで洗練された、使いやすくシンプルなB2B向けエンタープライズSaaSのデザインシステムです。
**Deep Teal（プライマリー）**と**Royal Indigo（セカンダリー）**をベースカラーとし、統一感のあるプロフェッショナルなUIを実現します。

---

## 2. Component Adoption Tiers (SSoT)

All UI components live under `apps/web/src/shared/ui/components/`.
However, not all components are considered “standard” for product UI.

### Tier 1 (Standard / MUST Prefer)

Feature UI MUST prefer these components. v0 should use only these unless explicitly told otherwise.

* button.tsx
* input.tsx
* textarea.tsx
* label.tsx
* checkbox.tsx
* radio-group.tsx
* switch.tsx
* select.tsx
* dropdown-menu.tsx
* table.tsx
* pagination.tsx
* tabs.tsx
* dialog.tsx
* alert-dialog.tsx
* alert.tsx
* badge.tsx
* toast.tsx / toaster.tsx / sonner.tsx
* popover.tsx
* tooltip.tsx
* separator.tsx
* scroll-area.tsx
* skeleton.tsx
* spinner.tsx
* breadcrumb.tsx

### Tier 2 (Allowed / Use When Needed)

Use only when feature requirements justify it.

* calendar.tsx
* sheet.tsx
* drawer.tsx
* command.tsx
* navigation-menu.tsx
* sidebar.tsx
* collapsible.tsx
* accordion.tsx
* context-menu.tsx
* menubar.tsx
* progress.tsx
* resizable.tsx
* slider.tsx
* hover-card.tsx
* avatar.tsx
* input-otp.tsx
* chart.tsx (Use only with approved chart patterns for dashboards/reports)

### Tier 3 (Avoid by Default)

Avoid unless there is a clear UX benefit and an approved pattern exists.

* carousel.tsx
* aspect-ratio.tsx

Policy:

* Do NOT add new base components inside `features/**`.
* If a new base component is required, add it under `shared/ui/components` with a short rationale in this README and (if impactful) an ADR.

---

## 3. カラーパレット

> **重要**：本章のHEX/HSLは理解のための併記です。
> **実装の正本は `apps/web/src/shared/ui/tokens/globals.css`** です。

### 3.1 プライマリーカラー（Deep Teal）

**用途**: 主要なアクション、ブランド表現、重要な要素の強調

* **Primary 50**: `#f0fdfc` - 非常に薄い背景
* **Primary 100**: `#ccfbf8` - 薄い背景、ホバー効果
* **Primary 200**: `#99f6f0` - サブ背景
* **Primary 300**: `#5eead4` - ライトアクセント
* **Primary 400**: `#2dd4bf` - アクティブ状態
* **Primary 500**: `#14b8a6` - **メインプライマリー（デフォルト）**
* **Primary 600**: `#0d9488` - ホバー、アクティブ
* **Primary 700**: `#0f766e` - 濃いアクセント
* **Primary 800**: `#115e59` - 強調テキスト
* **Primary 900**: `#134e4a` - 最も濃い

**CSS変数（例）**: `--primary: 174 72% 56%` (HSL)

### 3.2 セカンダリーカラー（Royal Indigo）

**用途**: セカンダリーアクション、バッジ、補助的な強調、グラフ

* **Secondary 50**: `#eef2ff` - 非常に薄い背景
* **Secondary 100**: `#e0e7ff` - 薄い背景
* **Secondary 200**: `#c7d2fe` - サブ背景
* **Secondary 300**: `#a5b4fc` - ライトアクセント
* **Secondary 400**: `#818cf8` - アクティブ状態
* **Secondary 500**: `#6366f1` - **メインセカンダリー（デフォルト）**
* **Secondary 600**: `#4f46e5` - ホバー、アクティブ
* **Secondary 700**: `#4338ca` - 濃いアクセント
* **Secondary 800**: `#3730a3` - 強調テキスト
* **Secondary 900**: `#312e81` - 最も濃い

**CSS変数（例）**: `--secondary: 239 84% 67%` (HSL)

### 3.3 セマンティックカラー

#### Success（成功・完了）

* **Success 50**: `#f0fdf4`
* **Success 500**: `#22c55e` - **メイン成功色**
* **Success 600**: `#16a34a`
* **Success 700**: `#15803d`

**用途**: 成功メッセージ、完了状態、ポジティブなフィードバック
**CSS変数（例）**: `--success: 142 71% 45%` (HSL)

#### Warning（警告・注意）

* **Warning 50**: `#fffbeb`
* **Warning 500**: `#f59e0b` - **メイン警告色**
* **Warning 600**: `#d97706`
* **Warning 700**: `#b45309`

**用途**: 警告メッセージ、注意喚起、一時的な状態
**CSS変数（例）**: `--warning: 38 92% 50%` (HSL)

#### Error（エラー・危険）

* **Error 50**: `#fef2f2`
* **Error 500**: `#ef4444` - **メインエラー色**
* **Error 600**: `#dc2626`
* **Error 700**: `#b91c1c`

**用途**: エラーメッセージ、削除アクション、危険な操作
**CSS変数（例）**: `--destructive: 0 84% 60%` (HSL)

#### Info（情報）

* **Info 50**: `#eff6ff`
* **Info 500**: `#3b82f6` - **メイン情報色**
* **Info 600**: `#2563eb`
* **Info 700**: `#1d4ed8`

**用途**: 情報メッセージ、ヘルプテキスト、ガイダンス
**CSS変数（例）**: `--info: 221 83% 53%` (HSL)

### 3.4 ニュートラルカラー（グレースケール）

* **Neutral 50**: `#fafafa` - 背景（最も薄い）
* **Neutral 100**: `#f5f5f5` - カード背景
* **Neutral 200**: `#e5e5e5` - ボーダー（薄い）
* **Neutral 300**: `#d4d4d4` - ボーダー
* **Neutral 400**: `#a3a3a3` - プレースホルダー
* **Neutral 500**: `#737373` - 補助テキスト
* **Neutral 600**: `#525252` - セカンダリーテキスト
* **Neutral 700**: `#404040` - テキスト
* **Neutral 800**: `#262626` - メインテキスト
* **Neutral 900**: `#171717` - 最も濃いテキスト

### 3.5 グラデーションパターン

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

## 4. タイポグラフィ

### 4.1 フォントファミリー

```css
--font-sans: 'Geist', 'Geist Fallback', system-ui, -apple-system, sans-serif;
--font-mono: 'Geist Mono', 'Geist Mono Fallback', 'Courier New', monospace;
```

**使用方法**:

* **本文・UI全般**: `font-sans` クラスを使用
* **コード・数値**: `font-mono` クラスを使用

### 4.2 フォントサイズ（Tailwindクラス）

* `text-xs`: 0.75rem (12px) - キャプション、メタ情報
* `text-sm`: 0.875rem (14px) - 小さな本文、ラベル
* `text-base`: 1rem (16px) - **標準本文**
* `text-lg`: 1.125rem (18px) - リード文、小見出し
* `text-xl`: 1.25rem (20px) - 中見出し
* `text-2xl`: 1.5rem (24px) - セクション見出し
* `text-3xl`: 1.875rem (30px) - ページタイトル
* `text-4xl`: 2.25rem (36px) - 大きなタイトル

### 4.3 フォントウェイト

* `font-normal`: 400 - 標準本文
* `font-medium`: 500 - 強調テキスト
* `font-semibold`: 600 - 見出し、ラベル
* `font-bold`: 700 - 強い強調、大見出し

### 4.4 行間（Line Height）

* `leading-tight`: 1.25 - 見出し用
* `leading-normal`: 1.5 - **標準（推奨）**
* `leading-relaxed`: 1.625 - 読みやすい本文

**推奨**: 本文には `leading-relaxed` または `leading-6` を使用して可読性を確保

---

## 5. スペーシング

Tailwindのスペーシングスケールを使用（4px基準）

### よく使うスペーシング

* `p-2`: 0.5rem (8px) - 小さなパディング
* `p-4`: 1rem (16px) - **標準パディング**
* `p-6`: 1.5rem (24px) - 中程度のパディング
* `p-8`: 2rem (32px) - 大きなパディング
* `gap-4`: 1rem (16px) - **標準ギャップ**
* `gap-6`: 1.5rem (24px) - 広めのギャップ

**原則**:

* コンポーネント内部: `p-4`, `p-6`, `gap-4`
* セクション間: `p-8`, `gap-6`, `gap-8`
* 任意の値 `p-[16px]` は避け、Tailwindのスケール `p-4` を使用

---

## 6. ボーダーラジウス（角丸）

```css
--radius: 0.5rem; /* 8px */
```

### 使用パターン

* `rounded-sm`: 0.125rem (2px) - 小さな要素
* `rounded`: 0.25rem (4px) - ボタン、インプット（小）
* `rounded-md`: 0.375rem (6px) - **標準（カード、ボタン）**
* `rounded-lg`: 0.5rem (8px) - **推奨（カード、モーダル）**
* `rounded-xl`: 0.75rem (12px) - 大きなカード
* `rounded-2xl`: 1rem (16px) - ヒーローカード

**推奨**: カードやモーダルには `rounded-lg` または `rounded-xl` を使用

---

## 7. シャドウ（影）

### 標準シャドウ

* `shadow-sm`: 軽い影 - インプット、小さなカード
* `shadow`: **標準の影（推奨）** - カード、ボタン
* `shadow-md`: 中程度の影 - 浮いたカード
* `shadow-lg`: 大きな影 - モーダル、ドロップダウン
* `shadow-xl`: 非常に大きな影 - オーバーレイ

### カスタムシャドウ（CSS変数で定義済み）

```css
--shadow-soft: 0 2px 8px rgba(0, 0, 0, 0.08);
--shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.12);
--shadow-strong: 0 8px 24px rgba(0, 0, 0, 0.16);
```

**推奨**: カードには `shadow` または `shadow-md`、モーダルには `shadow-lg` を使用

---

## 8. 実装ルール

### 8.1 必須ルール

1. **カラーは必ずデザインシステムのパレットから選択する**

   * プライマリー: `bg-primary`, `text-primary`, `border-primary`
   * セカンダリー: `bg-secondary-500`, `text-secondary-600`
   * セマンティック: `bg-success`, `bg-warning`, `bg-destructive`
   * 任意の色 `bg-[#14b8a6]` は使用しない

2. **コンポーネントはTier/SSoTに従う**

   * FeatureはTier1を優先
   * `features/**` 配下でベースUIを増やさない

3. **スペーシングはTailwindのスケールを使用する**

   * `gap-4`, `p-6`, `mx-4` 等
   * `gap-[16px]`, `p-[24px]` のような任意の値は避ける

4. **レイアウトはFlexboxを優先する**

   * `flex items-center justify-between`
   * 複雑な2Dレイアウトのみ `grid` を使用

5. **テキストは可読性を確保する**

   * 本文: `leading-relaxed` または `leading-6`
   * コントラスト: WCAG AA準拠を意識

6. **ボーダーラジウスは統一する**

   * カード・モーダル: `rounded-lg` または `rounded-xl`
   * ボタン・インプット: `rounded-md`

7. **シャドウは控えめに使用する**

   * カード: `shadow` または `shadow-md`
   * モーダル: `shadow-lg`

---

## 9. UIコンポーネント例（抜粋）

> 例は理解のためのものです。実装ではTier/SSoTと tokens を前提にしてください。

### 9.1 Buttons

#### Primary Button（主要アクション）

```tsx
<Button variant="default" size="default">
  保存
</Button>
```

#### Secondary Button（セカンダリーアクション）

```tsx
<Button variant="secondary" size="default">
  キャンセル
</Button>
```

#### Outline Button（アウトライン）

```tsx
<Button variant="outline" size="default">
  詳細
</Button>
```

#### Ghost Button（ゴースト）

```tsx
<Button variant="ghost" size="default">
  閉じる
</Button>
```

#### Destructive Button（削除・危険）

```tsx
<Button variant="destructive" size="default">
  削除
</Button>
```

#### Buttons with Icons（アイコン付きボタン）

```tsx
<Button variant="default" size="default">
  <Plus className="mr-2 h-4 w-4" />
  新規作成
</Button>
```

#### Icon Button（アイコンボタン）

```tsx
<Button variant="ghost" size="icon">
  <Search className="h-4 w-4" />
</Button>
```

### 9.2 Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>タイトル</CardTitle>
    <CardDescription>説明文</CardDescription>
  </CardHeader>
  <CardContent>コンテンツ</CardContent>
  <CardFooter>
    <Button>アクション</Button>
  </CardFooter>
</Card>
```

### 9.3 Table

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
      <TableCell><Badge variant="default">完了</Badge></TableCell>
      <TableCell>2025-11-09</TableCell>
      <TableCell className="text-right">¥1,234</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### 9.4 Form

```tsx
<Input type="text" placeholder="入力してください" className="w-full" />
<Textarea placeholder="詳細を入力してください" rows={4} />
```

### 9.5 Date Picker（日付選択）

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" className="w-full justify-start text-left bg-transparent">
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, "PPP") : <span>日付を選択</span>}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0">
    <Calendar mode="single" selected={date} onSelect={setDate} />
  </PopoverContent>
</Popover>
```

### 9.6 Alerts

```tsx
<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>注意</AlertTitle>
  <AlertDescription>この操作は取り消せません。</AlertDescription>
</Alert>
```

### 9.7 Tabs

```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">タブ1</TabsTrigger>
    <TabsTrigger value="tab2">タブ2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">タブ1のコンテンツ</TabsContent>
  <TabsContent value="tab2">タブ2のコンテンツ</TabsContent>
</Tabs>
```

### 9.8 Pagination

```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
    <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
    <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
    <PaginationItem><PaginationEllipsis /></PaginationItem>
    <PaginationItem><PaginationNext href="#" /></PaginationItem>
  </PaginationContent>
</Pagination>
```

---

## 10. アイコン使用ガイドライン

### 10.1 アイコンライブラリ

```tsx
import {
  Search, Bell, User, Settings, Menu, Plus, Edit, Trash2, Check, X,
  ChevronDown, ChevronRight, Home, FileText, Calendar, DollarSign,
  TrendingUp, AlertCircle
} from 'lucide-react'
```

### 10.2 アイコンサイズ

* `h-3 w-3`: 12px - 非常に小さい
* `h-4 w-4`: 16px - **標準（推奨）**
* `h-5 w-5`: 20px - 中サイズ
* `h-6 w-6`: 24px - 大きめ
* `h-8 w-8`: 32px - 大きい

### 10.3 アイコンの色

```tsx
<Search className="h-4 w-4 text-muted-foreground" />
<Bell className="h-4 w-4 text-primary" />
<AlertCircle className="h-4 w-4 text-destructive" />
```

---

## 11. ダークモード対応

全てのコンポーネントはダークモードに自動対応することを目指します。
（ThemeProvider / tokens が切り替えの正本）

**参考例（※正本は tokens 側）**

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: 222 47% 11%;
    --foreground: 213 31% 91%;
    --card: 222 47% 11%;
    --card-foreground: 213 31% 91%;
  }
}
```

---

## 12. チェックリスト

新しい画面・コンポーネントを作成する際は、以下を確認してください。

* [ ] プライマリーカラー（Deep Teal）またはセカンダリーカラー（Royal Indigo）を適切に使用している
* [ ] セマンティックカラー（Success, Warning, Error, Info）を適切に使用している
* [ ] 任意の色値（`bg-[#xxx]`）ではなく、定義済みのカラークラスを使用している
* [ ] Tier1コンポーネントを優先している
* [ ] `features/**` にベースUIが増えていない
* [ ] Tailwindのスペーシングスケール（`p-4`, `gap-6`等）を使用している
* [ ] ボーダーラジウスは`rounded-lg`等、統一されたスケールを使用している
* [ ] シャドウは控えめ（`shadow`, `shadow-md`）に使用している
* [ ] アイコンサイズは`h-4 w-4`を標準としている
* [ ] ダークモード対応（ThemeProvider/tokens）を考慮している

---

## 13. まとめ

このデザインシステムは、EPM SaaS製品の全ての画面・コンポーネント作成時に適用されます。
**必ず定義されたカラー、コンポーネント、スペーシング、パターンに従ってください**。
統一感のある、プロフェッショナルで使いやすいUIを実現するために、このルールを遵守してください。

---

## 14. バージョン情報

* バージョン: 1.0
* 最終更新: 2025-11-09
* 対象: EPM SaaS System
