"use client"

import * as React from "react"
import {
  Check,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Sparkles,
  FileText,
  Save,
  ArrowRight,
} from "lucide-react"

import { Button } from "@/shared/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/components/card"
import { Badge } from "@/shared/ui/components/badge"
import { Checkbox } from "@/shared/ui/components/checkbox"
import { Input } from "@/shared/ui/components/input"
import { Label } from "@/shared/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/components/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/components/collapsible"
import { Separator } from "@/shared/ui/components/separator"
import { cn } from "@/lib/utils"

import type {
  BffColumnMapping,
  BffCodeMapping,
  ColumnMappingTarget,
  BffTemplate,
  BffSubjectForMapping,
  BffDepartmentForMapping,
} from "@epm/contracts/bff/data-import"

// マッピングターゲットの日本語ラベル
const MAPPING_TARGET_LABELS: Record<ColumnMappingTarget | "null", string> = {
  SUBJECT_CODE: "科目コード",
  DEPARTMENT_CODE: "部門コード",
  PROJECT_CODE: "プロジェクトコード",
  PERIOD: "期間",
  AMOUNT: "金額",
  IGNORE: "無視",
  null: "未設定",
}

// 検出信頼度のバッジ
function ConfidenceBadge({ isLearned, isMatched }: { isLearned: boolean; isMatched: boolean }) {
  if (isLearned) {
    return (
      <Badge variant="default" className="bg-green-500 text-xs">
        <Check className="h-3 w-3 mr-1" />
        学習済み
      </Badge>
    )
  }
  if (isMatched) {
    return (
      <Badge variant="secondary" className="text-xs">
        <Sparkles className="h-3 w-3 mr-1" />
        自動検出
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
      <HelpCircle className="h-3 w-3 mr-1" />
      要確認
    </Badge>
  )
}

interface MappingPanelProps {
  // マッピングデータ
  columnMappings: BffColumnMapping[]
  subjectCodes: BffCodeMapping[]
  departmentCodes: BffCodeMapping[]
  // マスタデータ
  templates: BffTemplate[]
  subjects: BffSubjectForMapping[]
  departments: BffDepartmentForMapping[]
  // 状態
  selectedTemplateCode?: string
  saveMapping: boolean
  saveMappingName: string
  // コールバック
  onColumnMappingChange: (columnIndex: number, target: ColumnMappingTarget | null) => void
  onCodeMappingChange: (type: "subject" | "department", sourceValue: string, targetId: string) => void
  onTemplateSelect: (templateCode: string | undefined) => void
  onSaveMappingChange: (save: boolean) => void
  onSaveMappingNameChange: (name: string) => void
  onApply: () => void
  // ロード状態
  isApplying?: boolean
}

export function MappingPanel({
  columnMappings,
  subjectCodes,
  departmentCodes,
  templates,
  subjects,
  departments,
  selectedTemplateCode,
  saveMapping,
  saveMappingName,
  onColumnMappingChange,
  onCodeMappingChange,
  onTemplateSelect,
  onSaveMappingChange,
  onSaveMappingNameChange,
  onApply,
  isApplying = false,
}: MappingPanelProps) {
  const [columnMappingsOpen, setColumnMappingsOpen] = React.useState(true)
  const [subjectMappingsOpen, setSubjectMappingsOpen] = React.useState(true)
  const [departmentMappingsOpen, setDepartmentMappingsOpen] = React.useState(true)

  // 未マッピングのカウント
  const unmappedColumnCount = columnMappings.filter(
    (m) => !m.mappingTarget || m.mappingTarget === "IGNORE"
  ).length
  const unmappedSubjectCount = subjectCodes.filter(
    (m) => m.status === "UNMAPPED"
  ).length
  const unmappedDepartmentCount = departmentCodes.filter(
    (m) => m.status === "UNMAPPED"
  ).length

  const hasUnmapped = unmappedColumnCount > 0 || unmappedSubjectCount > 0 || unmappedDepartmentCount > 0

  return (
    <div className="space-y-6">
      {/* テンプレート選択 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">マッピングテンプレート</CardTitle>
          </div>
          <CardDescription>
            保存済みのマッピング設定を適用できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedTemplateCode || "none"}
            onValueChange={(value) => onTemplateSelect(value === "none" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="テンプレートを選択..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">（テンプレートを使用しない）</SelectItem>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.templateCode}>
                  <div className="flex items-center gap-2">
                    {template.templateName}
                    {template.isSystem && (
                      <Badge variant="secondary" className="text-xs">システム</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* カラムマッピング */}
      <Collapsible open={columnMappingsOpen} onOpenChange={setColumnMappingsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {columnMappingsOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-base">カラムマッピング</CardTitle>
                    <CardDescription>
                      ファイルの列をEPM標準フィールドに対応付けます
                    </CardDescription>
                  </div>
                </div>
                {unmappedColumnCount > 0 ? (
                  <Badge variant="destructive">{unmappedColumnCount} 件未設定</Badge>
                ) : (
                  <Badge variant="default" className="bg-green-500">
                    <Check className="h-3 w-3 mr-1" />
                    設定完了
                  </Badge>
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {columnMappings.map((mapping) => (
                  <div
                    key={mapping.columnIndex}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg border",
                      !mapping.mappingTarget && "border-amber-200 bg-amber-50/50"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{mapping.headerName}</span>
                        <ConfidenceBadge
                          isLearned={mapping.isLearned}
                          isMatched={!!mapping.mappingTarget}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        列 {mapping.columnIndex + 1}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Select
                      value={mapping.mappingTarget || "null"}
                      onValueChange={(value) =>
                        onColumnMappingChange(
                          mapping.columnIndex,
                          value === "null" ? null : (value as ColumnMappingTarget)
                        )
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">（未設定）</SelectItem>
                        <SelectItem value="SUBJECT_CODE">科目コード</SelectItem>
                        <SelectItem value="DEPARTMENT_CODE">部門コード</SelectItem>
                        <SelectItem value="PROJECT_CODE">プロジェクトコード</SelectItem>
                        <SelectItem value="PERIOD">期間</SelectItem>
                        <SelectItem value="AMOUNT">金額</SelectItem>
                        <SelectItem value="IGNORE">無視</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* 科目コードマッピング */}
      {subjectCodes.length > 0 && (
        <Collapsible open={subjectMappingsOpen} onOpenChange={setSubjectMappingsOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {subjectMappingsOpen ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <CardTitle className="text-base">科目コードマッピング</CardTitle>
                      <CardDescription>
                        外部コードをEPM科目マスタに対応付けます
                      </CardDescription>
                    </div>
                  </div>
                  {unmappedSubjectCount > 0 ? (
                    <Badge variant="destructive">{unmappedSubjectCount} 件未設定</Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-500">
                      <Check className="h-3 w-3 mr-1" />
                      設定完了
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {subjectCodes.map((mapping) => (
                    <div
                      key={mapping.sourceValue}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-lg border",
                        mapping.status === "UNMAPPED" && "border-amber-200 bg-amber-50/50"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <code className="px-1.5 py-0.5 bg-muted rounded text-sm">
                            {mapping.sourceValue}
                          </code>
                          <ConfidenceBadge
                            isLearned={mapping.isLearned}
                            isMatched={mapping.status === "MAPPED"}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {mapping.rowCount} 行で使用
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Select
                        value={mapping.targetId || "none"}
                        onValueChange={(value) =>
                          onCodeMappingChange("subject", mapping.sourceValue, value === "none" ? "" : value)
                        }
                      >
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="科目を選択..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">（未設定）</SelectItem>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              <div className="flex flex-col">
                                <span>{subject.code} - {subject.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {subject.hierarchyPath}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* 部門コードマッピング */}
      {departmentCodes.length > 0 && (
        <Collapsible open={departmentMappingsOpen} onOpenChange={setDepartmentMappingsOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {departmentMappingsOpen ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <CardTitle className="text-base">部門コードマッピング</CardTitle>
                      <CardDescription>
                        外部コードをEPM部門マスタに対応付けます
                      </CardDescription>
                    </div>
                  </div>
                  {unmappedDepartmentCount > 0 ? (
                    <Badge variant="destructive">{unmappedDepartmentCount} 件未設定</Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-500">
                      <Check className="h-3 w-3 mr-1" />
                      設定完了
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {departmentCodes.map((mapping) => (
                    <div
                      key={mapping.sourceValue}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-lg border",
                        mapping.status === "UNMAPPED" && "border-amber-200 bg-amber-50/50"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <code className="px-1.5 py-0.5 bg-muted rounded text-sm">
                            {mapping.sourceValue}
                          </code>
                          <ConfidenceBadge
                            isLearned={mapping.isLearned}
                            isMatched={mapping.status === "MAPPED"}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {mapping.rowCount} 行で使用
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Select
                        value={mapping.targetId || "none"}
                        onValueChange={(value) =>
                          onCodeMappingChange("department", mapping.sourceValue, value === "none" ? "" : value)
                        }
                      >
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="部門を選択..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">（未設定）</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              <div className="flex flex-col">
                                <span>{dept.code} - {dept.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {dept.hierarchyPath}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      <Separator />

      {/* マッピング保存オプション */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="save-mapping"
                checked={saveMapping}
                onCheckedChange={(checked) => onSaveMappingChange(checked as boolean)}
              />
              <Label
                htmlFor="save-mapping"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                このマッピングをテンプレートとして保存
              </Label>
            </div>
            {saveMapping && (
              <div className="pl-6">
                <Label htmlFor="mapping-name" className="text-sm">
                  テンプレート名
                </Label>
                <Input
                  id="mapping-name"
                  value={saveMappingName}
                  onChange={(e) => onSaveMappingNameChange(e.target.value)}
                  placeholder="例: 基幹システム用マッピング"
                  className="mt-1.5"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* アクションボタン */}
      <div className="flex items-center justify-between">
        {hasUnmapped && (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">未設定のマッピングがあります</span>
          </div>
        )}
        <div className="ml-auto">
          <Button
            onClick={onApply}
            disabled={isApplying}
            size="lg"
          >
            {isApplying ? (
              "適用中..."
            ) : (
              <>
                マッピングを適用
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MappingPanel
