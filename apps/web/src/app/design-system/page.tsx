"use client"

import * as React from "react"
import {
  Check,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Plus,
  Edit,
  Trash2,
  Search,
  Bell,
  Settings,
  User,
  ChevronRight,
  Upload,
} from "lucide-react"

import { Button } from "@/shared/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/components/card"
import { Input } from "@/shared/ui/components/input"
import { Label } from "@/shared/ui/components/label"
import { Textarea } from "@/shared/ui/components/textarea"
import { Badge } from "@/shared/ui/components/badge"
import { Switch } from "@/shared/ui/components/switch"
import { Checkbox } from "@/shared/ui/components/checkbox"
import { Separator } from "@/shared/ui/components/separator"
import { Progress } from "@/shared/ui/components/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/components/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/components/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/components/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/components/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/components/tooltip"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/shared/ui/components/pagination"

export default function DesignSystemPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">EPM Design System</h1>
        <p className="text-muted-foreground mt-2">
          Deep Teal（プライマリー）とRoyal Indigo（セカンダリー）をベースとしたデザインシステム
        </p>
      </div>

      {/* Color Palette */}
      <Section title="カラーパレット" description="プライマリー、セカンダリー、セマンティックカラー">
        <div className="space-y-6">
          {/* Primary Colors */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Primary (Deep Teal)</h4>
            <div className="flex flex-wrap gap-2">
              <ColorSwatch cssVar="--primary-50" label="50" hex="#f0fdfc" />
              <ColorSwatch cssVar="--primary-100" label="100" hex="#ccfbf8" />
              <ColorSwatch cssVar="--primary-200" label="200" hex="#99f6f0" />
              <ColorSwatch cssVar="--primary-300" label="300" hex="#5eead4" />
              <ColorSwatch cssVar="--primary-400" label="400" hex="#2dd4bf" />
              <ColorSwatch cssVar="--primary-500" label="500" hex="#14b8a6" isMain />
              <ColorSwatch cssVar="--primary-600" label="600" hex="#0d9488" />
              <ColorSwatch cssVar="--primary-700" label="700" hex="#0f766e" />
              <ColorSwatch cssVar="--primary-800" label="800" hex="#115e59" />
              <ColorSwatch cssVar="--primary-900" label="900" hex="#134e4a" />
            </div>
          </div>

          {/* Secondary Colors */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Secondary (Royal Indigo)</h4>
            <div className="flex flex-wrap gap-2">
              <ColorSwatch cssVar="--secondary-50" label="50" hex="#eef2ff" />
              <ColorSwatch cssVar="--secondary-100" label="100" hex="#e0e7ff" />
              <ColorSwatch cssVar="--secondary-200" label="200" hex="#c7d2fe" />
              <ColorSwatch cssVar="--secondary-300" label="300" hex="#a5b4fc" />
              <ColorSwatch cssVar="--secondary-400" label="400" hex="#818cf8" />
              <ColorSwatch cssVar="--secondary-500" label="500" hex="#6366f1" isMain />
              <ColorSwatch cssVar="--secondary-600" label="600" hex="#4f46e5" />
              <ColorSwatch cssVar="--secondary-700" label="700" hex="#4338ca" />
              <ColorSwatch cssVar="--secondary-800" label="800" hex="#3730a3" />
              <ColorSwatch cssVar="--secondary-900" label="900" hex="#312e81" />
            </div>
          </div>

          {/* Semantic Colors */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Semantic Colors</h4>
            <div className="flex flex-wrap gap-2">
              <ColorSwatch cssVar="--success" label="Success" hex="#22c55e" />
              <ColorSwatch cssVar="--warning" label="Warning" hex="#f59e0b" />
              <ColorSwatch cssVar="--destructive" label="Error" hex="#ef4444" />
              <ColorSwatch cssVar="--info" label="Info" hex="#3b82f6" />
            </div>
          </div>
        </div>
      </Section>

      {/* Typography */}
      <Section title="タイポグラフィ" description="フォントサイズとウェイト">
        <div className="space-y-4">
          <div className="text-xs text-muted-foreground">text-xs (12px) - キャプション、メタ情報</div>
          <div className="text-sm">text-sm (14px) - 小さな本文、ラベル</div>
          <div className="text-base">text-base (16px) - 標準本文</div>
          <div className="text-lg">text-lg (18px) - リード文、小見出し</div>
          <div className="text-xl font-medium">text-xl (20px) - 中見出し</div>
          <div className="text-2xl font-semibold">text-2xl (24px) - セクション見出し</div>
          <div className="text-3xl font-bold">text-3xl (30px) - ページタイトル</div>
          <div className="text-4xl font-bold">text-4xl (36px) - 大きなタイトル</div>
        </div>
      </Section>

      {/* Buttons */}
      <Section title="ボタン" description="各種ボタンバリアント">
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold mb-3">Variants</h4>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Sizes</h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon"><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">With Icons</h4>
            <div className="flex flex-wrap gap-3">
              <Button><Plus className="mr-2 h-4 w-4" />新規作成</Button>
              <Button variant="outline"><Edit className="mr-2 h-4 w-4" />編集</Button>
              <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />削除</Button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">States</h4>
            <div className="flex flex-wrap gap-3">
              <Button disabled>Disabled</Button>
              <Button className="cursor-wait opacity-70">
                <span className="animate-spin mr-2">⏳</span>
                Loading...
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Form Components */}
      <Section title="フォームコンポーネント" description="入力フィールド、セレクト、チェックボックス等">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="input-example">テキスト入力</Label>
              <Input id="input-example" placeholder="入力してください" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="textarea-example">複数行テキスト</Label>
              <Textarea id="textarea-example" placeholder="詳細を入力してください" rows={3} />
            </div>

            <div className="space-y-2">
              <Label>セレクト</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">オプション 1</SelectItem>
                  <SelectItem value="option2">オプション 2</SelectItem>
                  <SelectItem value="option3">オプション 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="checkbox-example" />
              <Label htmlFor="checkbox-example">チェックボックス</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="switch-example" />
              <Label htmlFor="switch-example">トグルスイッチ</Label>
            </div>

            <div className="space-y-2">
              <Label>ファイルアップロード</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">ファイルをドラッグ&ドロップ</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Cards */}
      <Section title="カード" description="基本カードと統計カード">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>基本カード</CardTitle>
              <CardDescription>カードの説明文がここに入ります</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">カードのコンテンツ領域です。</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">アクション</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">売上高</CardTitle>
              <span className="text-muted-foreground">¥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥12.5M</div>
              <p className="text-xs text-muted-foreground">前月比 +20.1%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">プロジェクト数</CardTitle>
              <span className="text-muted-foreground">#</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <Progress value={75} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Badges */}
      <Section title="バッジ" description="ステータス表示用バッジ">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-3">Variants</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Custom Colors</h4>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-success text-white">完了</Badge>
              <Badge className="bg-warning text-white">保留</Badge>
              <Badge className="bg-destructive text-white">エラー</Badge>
              <Badge className="bg-info text-white">情報</Badge>
              <Badge className="bg-secondary-500 text-white">レビュー中</Badge>
            </div>
          </div>
        </div>
      </Section>

      {/* Alerts */}
      <Section title="アラート" description="通知・警告メッセージ">
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>情報</AlertTitle>
            <AlertDescription>これは情報メッセージです。</AlertDescription>
          </Alert>

          <Alert className="border-success bg-success/10">
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertTitle className="text-success">成功</AlertTitle>
            <AlertDescription>操作が正常に完了しました。</AlertDescription>
          </Alert>

          <Alert className="border-warning bg-warning/10">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertTitle className="text-warning">警告</AlertTitle>
            <AlertDescription>変更が保存されていません。</AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>操作に失敗しました。</AlertDescription>
          </Alert>
        </div>
      </Section>

      {/* Table */}
      <Section title="テーブル" description="データ表示用テーブル">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>日付</TableHead>
                <TableHead className="text-right">金額</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">プロジェクトA</TableCell>
                <TableCell><Badge className="bg-success text-white">完了</Badge></TableCell>
                <TableCell>2025-12-01</TableCell>
                <TableCell className="text-right">¥1,234,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">プロジェクトB</TableCell>
                <TableCell><Badge className="bg-warning text-white">進行中</Badge></TableCell>
                <TableCell>2025-12-15</TableCell>
                <TableCell className="text-right">¥2,567,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">プロジェクトC</TableCell>
                <TableCell><Badge variant="secondary">計画中</Badge></TableCell>
                <TableCell>2026-01-01</TableCell>
                <TableCell className="text-right">¥890,000</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </Section>

      {/* Tabs */}
      <Section title="タブ" description="コンテンツ切り替え用タブ">
        <Tabs defaultValue="tab1" className="w-full">
          <TabsList>
            <TabsTrigger value="tab1">概要</TabsTrigger>
            <TabsTrigger value="tab2">詳細</TabsTrigger>
            <TabsTrigger value="tab3">履歴</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="p-4 border rounded-lg mt-2">
            <p className="text-sm text-muted-foreground">概要タブのコンテンツです。</p>
          </TabsContent>
          <TabsContent value="tab2" className="p-4 border rounded-lg mt-2">
            <p className="text-sm text-muted-foreground">詳細タブのコンテンツです。</p>
          </TabsContent>
          <TabsContent value="tab3" className="p-4 border rounded-lg mt-2">
            <p className="text-sm text-muted-foreground">履歴タブのコンテンツです。</p>
          </TabsContent>
        </Tabs>
      </Section>

      {/* Dialog */}
      <Section title="ダイアログ" description="モーダルダイアログ">
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>ダイアログを開く</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ダイアログタイトル</DialogTitle>
                <DialogDescription>
                  ダイアログの説明文がここに入ります。
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">ダイアログのコンテンツ領域です。</p>
              </div>
              <DialogFooter>
                <Button variant="outline">キャンセル</Button>
                <Button>保存</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Section>

      {/* Pagination */}
      <Section title="ページネーション" description="ページ送りコンポーネント">
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
              <PaginationLink href="#">3</PaginationLink>
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
      </Section>

      {/* Progress */}
      <Section title="プログレスバー" description="進捗表示">
        <div className="space-y-4 max-w-md">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Default</span>
              <span>60%</span>
            </div>
            <Progress value={60} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Success</span>
              <span>90%</span>
            </div>
            <Progress value={90} className="[&>div]:bg-success" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Warning</span>
              <span>45%</span>
            </div>
            <Progress value={45} className="[&>div]:bg-warning" />
          </div>
        </div>
      </Section>

      {/* Icons */}
      <Section title="アイコン" description="Lucide Reactアイコン">
        <div className="flex flex-wrap gap-4">
          {[Search, Bell, Settings, User, Plus, Edit, Trash2, Check, X, ChevronRight, AlertCircle, CheckCircle, Info].map((Icon, i) => (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div className="p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent>{Icon.displayName}</TooltipContent>
            </Tooltip>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          標準サイズ: h-4 w-4 (16px) | 中サイズ: h-5 w-5 (20px) | 大サイズ: h-6 w-6 (24px)
        </p>
      </Section>

      {/* Spacing & Border Radius */}
      <Section title="スペーシング & ボーダーラジウス" description="Tailwindスケール">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-semibold mb-3">Spacing Scale</h4>
            <div className="space-y-2">
              {[
                { class: "p-2", value: "8px" },
                { class: "p-4", value: "16px" },
                { class: "p-6", value: "24px" },
                { class: "p-8", value: "32px" },
              ].map((item) => (
                <div key={item.class} className="flex items-center gap-3">
                  <div className={`${item.class} bg-primary/20 border border-primary/30`}>
                    <div className="w-8 h-8 bg-primary rounded" />
                  </div>
                  <span className="text-sm font-mono">{item.class} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Border Radius</h4>
            <div className="flex flex-wrap gap-3">
              {[
                { class: "rounded-sm", label: "sm" },
                { class: "rounded", label: "default" },
                { class: "rounded-md", label: "md" },
                { class: "rounded-lg", label: "lg" },
                { class: "rounded-xl", label: "xl" },
                { class: "rounded-2xl", label: "2xl" },
              ].map((item) => (
                <div key={item.class} className="text-center">
                  <div className={`w-16 h-16 bg-primary ${item.class}`} />
                  <span className="text-xs font-mono mt-1 block">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Shadows */}
      <Section title="シャドウ" description="影のバリエーション">
        <div className="flex flex-wrap gap-6">
          {[
            { class: "shadow-sm", label: "shadow-sm" },
            { class: "shadow", label: "shadow" },
            { class: "shadow-md", label: "shadow-md" },
            { class: "shadow-lg", label: "shadow-lg" },
            { class: "shadow-xl", label: "shadow-xl" },
          ].map((item) => (
            <div key={item.class} className="text-center">
              <div className={`w-24 h-24 bg-card rounded-lg ${item.class}`} />
              <span className="text-xs font-mono mt-2 block">{item.label}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

function Section({ title, description, children }: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Separator className="mb-6" />
      {children}
    </section>
  )
}

function ColorSwatch({ cssVar, label, hex, isMain }: {
  cssVar: string
  label: string
  hex: string
  isMain?: boolean
}) {
  return (
    <div className="text-center">
      <div
        className={`w-16 h-16 rounded-lg ${isMain ? "ring-2 ring-offset-2 ring-primary" : ""}`}
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <div className="mt-1">
        <span className={`text-xs font-medium ${isMain ? "text-primary" : ""}`}>{label}</span>
        <span className="text-xs text-muted-foreground block">{hex}</span>
      </div>
    </div>
  )
}
