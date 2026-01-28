'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Check,
  ChevronDown,
  FileText,
  Layers,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
} from 'lucide-react'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@/shared/ui'
import { toast } from 'sonner'

import type {
  BffClient,
  CreateMeetingTypeDto,
  DepartmentOptionDto,
  MeetingCycle,
  MeetingTypeDto,
  MeetingTypeScope,
  SubmissionLevel,
  UpdateMeetingTypeDto,
} from '../api/bff-client'
import { MockBffClient } from '../api/mock-bff-client'

// Cycle labels
const CYCLE_LABELS: Record<MeetingCycle, string> = {
  MONTHLY: '月次',
  BIWEEKLY: '隔週',
  QUARTERLY: '四半期',
  YEARLY: '年次',
  AD_HOC: '随時',
}

// Validation errors interface
interface ValidationErrors {
  typeCode?: string
  typeName?: string
  typeNameShort?: string
  scope?: string
  scopeDepartmentStableId?: string
  cycle?: string
  submissionLevels?: string
}

// Form data interface
interface FormData {
  typeCode: string
  typeName: string
  typeNameShort: string
  scope: MeetingTypeScope
  scopeDepartmentStableId: string
  submissionDepth: number | null
  submissionLevels: SubmissionLevel[]
  cycle: MeetingCycle
  submissionRequired: boolean
  linkToPlanEvent: boolean
  description: string
  isActive: boolean
  sortOrder: number
}

const initialFormData: FormData = {
  typeCode: '',
  typeName: '',
  typeNameShort: '',
  scope: 'COMPANY',
  scopeDepartmentStableId: '',
  submissionDepth: null,
  submissionLevels: ['DEPARTMENT'],
  cycle: 'MONTHLY',
  submissionRequired: false,
  linkToPlanEvent: false,
  description: '',
  isActive: true,
  sortOrder: 1,
}

// Initialize BffClient
const bffClient: BffClient = new MockBffClient()

export function MeetingTypeMasterPage() {
  const router = useRouter()

  // State
  const [meetingTypes, setMeetingTypes] = useState<MeetingTypeDto[]>([])
  const [departments, setDepartments] = useState<DepartmentOptionDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [scopeFilter, setScopeFilter] = useState<MeetingTypeScope | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<MeetingTypeDto | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [typesResult, deptResult] = await Promise.all([
        bffClient.getMeetingTypes({
          scope: scopeFilter === 'ALL' ? undefined : scopeFilter,
          isActive: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
          search: searchQuery || undefined,
        }),
        bffClient.getDepartmentOptions(),
      ])
      setMeetingTypes(typesResult.items)
      setDepartments(deptResult)
    } catch {
      toast.error('データの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [scopeFilter, statusFilter, searchQuery])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Validate form
  const validateForm = useCallback((): boolean => {
    const errors: ValidationErrors = {}

    // typeCode validation
    if (!formData.typeCode.trim()) {
      errors.typeCode = '会議種別コードは必須です'
    } else if (!/^[A-Za-z0-9_]+$/.test(formData.typeCode)) {
      errors.typeCode = '英数字とアンダースコアのみ使用できます'
    } else if (formData.typeCode.length > 50) {
      errors.typeCode = '50文字以内で入力してください'
    }

    // typeName validation
    if (!formData.typeName.trim()) {
      errors.typeName = '会議種別名は必須です'
    } else if (formData.typeName.length > 200) {
      errors.typeName = '200文字以内で入力してください'
    }

    // typeNameShort validation
    if (formData.typeNameShort && formData.typeNameShort.length > 100) {
      errors.typeNameShort = '100文字以内で入力してください'
    }

    // scope validation
    if (!formData.scope) {
      errors.scope = '対象範囲は必須です'
    }

    // scopeDepartmentStableId validation (required when LOCAL)
    if (formData.scope === 'LOCAL' && !formData.scopeDepartmentStableId) {
      errors.scopeDepartmentStableId = '対象部門は必須です'
    }

    // cycle validation
    if (!formData.cycle) {
      errors.cycle = '開催サイクルは必須です'
    }

    // submissionLevels validation
    if (formData.submissionLevels.length === 0) {
      errors.submissionLevels = '報告を求めるレベルを最低1つ選択してください'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  // Handle form field change
  const handleFieldChange = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      // Clear validation error for this field
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }))
    },
    []
  )

  // Handle submission level toggle
  const handleSubmissionLevelToggle = useCallback((level: SubmissionLevel) => {
    setFormData((prev) => {
      const newLevels = prev.submissionLevels.includes(level)
        ? prev.submissionLevels.filter((l) => l !== level)
        : [...prev.submissionLevels, level]
      return { ...prev, submissionLevels: newLevels }
    })
    setValidationErrors((prev) => ({ ...prev, submissionLevels: undefined }))
  }, [])

  // Open dialog for new
  const handleOpenNew = useCallback(() => {
    setEditingId(null)
    setFormData(initialFormData)
    setValidationErrors({})
    setIsDialogOpen(true)
  }, [])

  // Open dialog for edit
  const handleOpenEdit = useCallback((item: MeetingTypeDto) => {
    setEditingId(item.id)
    setFormData({
      typeCode: item.typeCode,
      typeName: item.typeName,
      typeNameShort: item.typeNameShort || '',
      scope: item.scope,
      scopeDepartmentStableId: item.scopeDepartmentStableId || '',
      submissionDepth: item.submissionDepth ?? null,
      submissionLevels: [...item.submissionLevels],
      cycle: item.cycle,
      submissionRequired: item.submissionRequired,
      linkToPlanEvent: item.linkToPlanEvent,
      description: item.description || '',
      isActive: item.isActive,
      sortOrder: item.sortOrder,
    })
    setValidationErrors({})
    setIsDialogOpen(true)
  }, [])

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      if (editingId) {
        // Update
        const updateData: UpdateMeetingTypeDto = {
          typeName: formData.typeName,
          typeNameShort: formData.typeNameShort || undefined,
          scope: formData.scope,
          scopeDepartmentStableId:
            formData.scope === 'LOCAL' ? formData.scopeDepartmentStableId : undefined,
          submissionDepth:
            formData.scope === 'LOCAL' ? formData.submissionDepth ?? undefined : undefined,
          submissionLevels: formData.submissionLevels,
          cycle: formData.cycle,
          submissionRequired: formData.submissionRequired,
          linkToPlanEvent: formData.linkToPlanEvent,
          description: formData.description || undefined,
          isActive: formData.isActive,
          sortOrder: formData.sortOrder,
        }
        await bffClient.updateMeetingType(editingId, updateData)
        toast.success('会議種別を更新しました')
      } else {
        // Create
        const createData: CreateMeetingTypeDto = {
          typeCode: formData.typeCode,
          typeName: formData.typeName,
          typeNameShort: formData.typeNameShort || undefined,
          scope: formData.scope,
          scopeDepartmentStableId:
            formData.scope === 'LOCAL' ? formData.scopeDepartmentStableId : undefined,
          submissionDepth:
            formData.scope === 'LOCAL' ? formData.submissionDepth ?? undefined : undefined,
          submissionLevels: formData.submissionLevels,
          cycle: formData.cycle,
          submissionRequired: formData.submissionRequired,
          linkToPlanEvent: formData.linkToPlanEvent,
          description: formData.description || undefined,
          isActive: formData.isActive,
          sortOrder: formData.sortOrder,
        }
        await bffClient.createMeetingType(createData)
        toast.success('会議種別を登録しました')
      }
      setIsDialogOpen(false)
      loadData()
    } catch (error) {
      if (error instanceof Error && error.message === 'DUPLICATE_TYPE_CODE') {
        setValidationErrors((prev) => ({
          ...prev,
          typeCode: 'この会議種別コードは既に使用されています',
        }))
        toast.error('会議種別コードが重複しています')
      } else {
        toast.error('保存に失敗しました')
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [editingId, formData, validateForm, loadData])

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return

    try {
      await bffClient.deleteMeetingType(deleteTarget.id)
      toast.success('会議種別を削除しました')
      setDeleteTarget(null)
      setDeleteError(null)
      loadData()
    } catch (error) {
      if (error instanceof Error && error.message === 'REFERENCE_EXISTS') {
        setDeleteError(
          'この会議種別は他のデータから参照されているため削除できません。'
        )
      } else {
        toast.error('削除に失敗しました')
        setDeleteTarget(null)
      }
    }
  }, [deleteTarget, loadData])

  // Filtered total
  const filteredTotal = useMemo(() => meetingTypes.length, [meetingTypes])

  return (
    <div className="min-h-screen bg-background">
      <Card className="m-6 shadow">
        {/* Header */}
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                会議種別マスタ
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                経営会議の種別を定義します
              </p>
            </div>
            <Button onClick={handleOpenNew} className="gap-2">
              <Plus className="h-4 w-4" />
              新規登録
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Filter Bar */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={scopeFilter}
              onValueChange={(v) => setScopeFilter(v as MeetingTypeScope | 'ALL')}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="スコープ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">全て</SelectItem>
                <SelectItem value="COMPANY">全社</SelectItem>
                <SelectItem value="LOCAL">部門ローカル</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter(v as 'ALL' | 'ACTIVE' | 'INACTIVE')
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">全て</SelectItem>
                <SelectItem value="ACTIVE">有効のみ</SelectItem>
                <SelectItem value="INACTIVE">無効のみ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-32">コード</TableHead>
                  <TableHead className="flex-1">会議種別名</TableHead>
                  <TableHead className="w-32">スコープ</TableHead>
                  <TableHead className="w-24">サイクル</TableHead>
                  <TableHead className="w-16 text-center">報告</TableHead>
                  <TableHead className="w-16 text-center">有効</TableHead>
                  <TableHead className="w-32 text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="mx-auto h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="mx-auto h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="mx-auto h-8 w-16" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : meetingTypes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-32 text-center text-muted-foreground"
                    >
                      データがありません
                    </TableCell>
                  </TableRow>
                ) : (
                  meetingTypes.map((item) => (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleOpenEdit(item)}
                    >
                      <TableCell className="font-mono text-sm">
                        {item.typeCode}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.typeName}</div>
                          {item.typeNameShort && (
                            <div className="text-sm text-muted-foreground">
                              {item.typeNameShort}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.scope === 'COMPANY' ? (
                          <Badge
                            variant="outline"
                            className="gap-1 border-success/20 bg-success/10 text-success"
                          >
                            <Building2 className="h-3 w-3" />
                            全社
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="gap-1 border-primary/20 bg-primary/10 text-primary"
                          >
                            <Users className="h-3 w-3" />
                            {item.scopeDepartmentName}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{CYCLE_LABELS[item.cycle]}</TableCell>
                      <TableCell className="text-center">
                        {item.submissionRequired ? (
                          <Check className="mx-auto h-4 w-4 text-success" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.isActive ? (
                          <Check className="mx-auto h-4 w-4 text-success" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 px-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Settings className="h-4 w-4" />
                                <span className="text-xs">設定</span>
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/meetings/form-settings/${item.id}`)
                                }}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                報告フォーム設定
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/meetings/report-layout-settings/${item.id}`)
                                }}
                              >
                                <Layers className="mr-2 h-4 w-4" />
                                レポートレイアウト設定
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="編集"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenEdit(item)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="削除"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteTarget(item)
                              setDeleteError(null)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <div className="mt-4 text-sm text-muted-foreground">
            {filteredTotal}件
          </div>
        </CardContent>
      </Card>

      {/* Register/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? '会議種別編集' : '会議種別登録'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 基本情報 */}
            <div className="rounded-lg border p-4">
              <h3 className="mb-4 font-medium text-foreground">基本情報</h3>
              <div className="space-y-4">
                {/* 会議種別コード */}
                <div className="space-y-2">
                  <Label htmlFor="typeCode">
                    会議種別コード <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="typeCode"
                    value={formData.typeCode}
                    onChange={(e) =>
                      handleFieldChange('typeCode', e.target.value.toUpperCase())
                    }
                    disabled={!!editingId}
                    placeholder="MONTHLY_MGMT"
                    className={validationErrors.typeCode ? 'border-destructive' : ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    ※ 英数字とアンダースコアのみ、会社内で一意
                  </p>
                  {validationErrors.typeCode && (
                    <p className="text-sm text-destructive">
                      {validationErrors.typeCode}
                    </p>
                  )}
                </div>

                {/* 会議種別名 & 略称 */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="typeName">
                      会議種別名 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="typeName"
                      value={formData.typeName}
                      onChange={(e) => handleFieldChange('typeName', e.target.value)}
                      placeholder="月次経営会議"
                      className={
                        validationErrors.typeName ? 'border-destructive' : ''
                      }
                    />
                    {validationErrors.typeName && (
                      <p className="text-sm text-destructive">
                        {validationErrors.typeName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="typeNameShort">略称</Label>
                    <Input
                      id="typeNameShort"
                      value={formData.typeNameShort}
                      onChange={(e) =>
                        handleFieldChange('typeNameShort', e.target.value)
                      }
                      placeholder="月次会議"
                      className={
                        validationErrors.typeNameShort ? 'border-destructive' : ''
                      }
                    />
                    {validationErrors.typeNameShort && (
                      <p className="text-sm text-destructive">
                        {validationErrors.typeNameShort}
                      </p>
                    )}
                  </div>
                </div>

                {/* 説明 */}
                <div className="space-y-2">
                  <Label htmlFor="description">説明</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleFieldChange('description', e.target.value)
                    }
                    placeholder="毎月開催する全社経営会議"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* スコープ設定 */}
            <div className="rounded-lg border p-4">
              <h3 className="mb-4 font-medium text-foreground">スコープ設定</h3>
              <div className="space-y-4">
                {/* 対象範囲 */}
                <div className="space-y-2">
                  <Label>
                    対象範囲 <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.scope}
                    onValueChange={(v) =>
                      handleFieldChange('scope', v as MeetingTypeScope)
                    }
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="COMPANY" id="scope-company" />
                      <Label htmlFor="scope-company" className="font-normal">
                        全社（COMPANY）
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="LOCAL" id="scope-local" />
                      <Label htmlFor="scope-local" className="font-normal">
                        部門ローカル（LOCAL）
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* LOCAL選択時のみ表示 */}
                {formData.scope === 'LOCAL' && (
                  <>
                    {/* 対象部門 */}
                    <div className="space-y-2">
                      <Label htmlFor="scopeDepartment">
                        対象部門 <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.scopeDepartmentStableId}
                        onValueChange={(v) =>
                          handleFieldChange('scopeDepartmentStableId', v)
                        }
                      >
                        <SelectTrigger
                          id="scopeDepartment"
                          className={
                            validationErrors.scopeDepartmentStableId
                              ? 'border-destructive'
                              : ''
                          }
                        >
                          <SelectValue placeholder="部門を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.stableId} value={dept.stableId}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {validationErrors.scopeDepartmentStableId && (
                        <p className="text-sm text-destructive">
                          {validationErrors.scopeDepartmentStableId}
                        </p>
                      )}
                    </div>

                    {/* 報告対象の階層深さ */}
                    <div className="space-y-2">
                      <Label htmlFor="submissionDepth">報告対象の階層深さ</Label>
                      <Select
                        value={
                          formData.submissionDepth === null
                            ? 'ALL'
                            : String(formData.submissionDepth)
                        }
                        onValueChange={(v) =>
                          handleFieldChange(
                            'submissionDepth',
                            v === 'ALL' ? null : Number(v)
                          )
                        }
                      >
                        <SelectTrigger id="submissionDepth">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">全階層</SelectItem>
                          <SelectItem value="1">1（直下のみ）</SelectItem>
                          <SelectItem value="2">2（孫まで）</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        ※ 1=直下のみ, 2=孫まで, 全階層=配下すべて
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 報告設定 */}
            <div className="rounded-lg border p-4">
              <h3 className="mb-4 font-medium text-foreground">報告設定</h3>
              <div className="space-y-4">
                {/* 開催サイクル */}
                <div className="space-y-2">
                  <Label htmlFor="cycle">
                    開催サイクル <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.cycle}
                    onValueChange={(v) =>
                      handleFieldChange('cycle', v as MeetingCycle)
                    }
                  >
                    <SelectTrigger
                      id="cycle"
                      className={validationErrors.cycle ? 'border-destructive' : ''}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CYCLE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.cycle && (
                    <p className="text-sm text-destructive">
                      {validationErrors.cycle}
                    </p>
                  )}
                </div>

                {/* 報告を求めるレベル */}
                <div className="space-y-2">
                  <Label>
                    報告を求めるレベル <span className="text-destructive">*</span>
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="level-department"
                        checked={formData.submissionLevels.includes('DEPARTMENT')}
                        onCheckedChange={() =>
                          handleSubmissionLevelToggle('DEPARTMENT')
                        }
                      />
                      <Label htmlFor="level-department" className="font-normal">
                        部門（DEPARTMENT）
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="level-bu"
                        checked={formData.submissionLevels.includes('BU')}
                        onCheckedChange={() => handleSubmissionLevelToggle('BU')}
                      />
                      <Label htmlFor="level-bu" className="font-normal">
                        事業部（BU）
                      </Label>
                    </div>
                  </div>
                  {validationErrors.submissionLevels && (
                    <p className="text-sm text-destructive">
                      {validationErrors.submissionLevels}
                    </p>
                  )}
                </div>

                {/* チェックボックス */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="submissionRequired"
                      checked={formData.submissionRequired}
                      onCheckedChange={(checked) =>
                        handleFieldChange('submissionRequired', checked === true)
                      }
                    />
                    <Label htmlFor="submissionRequired" className="font-normal">
                      部門報告を必須にする
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="linkToPlanEvent"
                      checked={formData.linkToPlanEvent}
                      onCheckedChange={(checked) =>
                        handleFieldChange('linkToPlanEvent', checked === true)
                      }
                    />
                    <Label htmlFor="linkToPlanEvent" className="font-normal">
                      見込イベントと紐付ける
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* その他 */}
            <div className="rounded-lg border p-4">
              <h3 className="mb-4 font-medium text-foreground">その他</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* 表示順 */}
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">表示順</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    min={1}
                    value={formData.sortOrder}
                    onChange={(e) =>
                      handleFieldChange('sortOrder', Number(e.target.value) || 1)
                    }
                  />
                </div>
                {/* 有効 */}
                <div className="flex items-end pb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        handleFieldChange('isActive', checked === true)
                      }
                    />
                    <Label htmlFor="isActive" className="font-normal">
                      有効にする
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
            setDeleteError(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteError ? '削除できません' : '会議種別の削除'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteError ? (
                deleteError
              ) : (
                <>
                  「{deleteTarget?.typeName}」を削除してもよろしいですか？
                  <br />
                  この操作は取り消せません。
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {deleteError ? (
              <AlertDialogAction onClick={() => setDeleteTarget(null)}>
                閉じる
              </AlertDialogAction>
            ) : (
              <>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  削除
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
