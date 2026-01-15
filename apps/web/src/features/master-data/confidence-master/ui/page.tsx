'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Save } from 'lucide-react'
import {
  Button,
  Card,
  useToast,
} from '@/shared/ui'
import { ConfidenceLevelTable } from './components'
import { bffClient } from '../api'
import type {
  BffConfidenceLevel,
  BffConfidenceLevelInput,
} from '@epm/contracts/bff/confidence-master'

// ログイン時に決定される会社ID（実際にはAuthコンテキストから取得）
const CURRENT_COMPANY_ID = 'company-001'

export default function ConfidenceMasterPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // データ
  const [levels, setLevels] = useState<BffConfidenceLevel[]>([])
  const [editingLevels, setEditingLevels] = useState<BffConfidenceLevelInput[]>([])
  const [companyName, setCompanyName] = useState<string>('')
  const [includeInactive, setIncludeInactive] = useState(false)

  const loadLevels = useCallback(async () => {
    setLoading(true)
    try {
      const response = await bffClient.listConfidenceLevels({
        companyId: CURRENT_COMPANY_ID,
        includeInactive,
      })
      setLevels(response.levels)
      setCompanyName(response.companyName)
      setIsDirty(false)
    } catch (error) {
      toast({
        title: 'エラー',
        description: '確度マスタの取得に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [includeInactive, toast])

  useEffect(() => {
    loadLevels()
  }, [loadLevels])

  const handleLevelsChange = (updated: BffConfidenceLevelInput[]) => {
    setEditingLevels(updated)
    setIsDirty(true)
  }

  const handleDelete = async (levelId: string) => {
    try {
      await bffClient.deleteConfidenceLevel({ companyId: CURRENT_COMPANY_ID, levelId })
      toast({
        title: '削除完了',
        description: '確度ランクを削除しました',
      })
      await loadLevels()
    } catch (error) {
      toast({
        title: 'エラー',
        description: '削除に失敗しました。使用中の確度は削除できません。',
        variant: 'destructive',
      })
    }
  }

  const handleSave = async () => {
    if (editingLevels.length === 0) {
      toast({
        title: 'エラー',
        description: '少なくとも1つの確度ランクが必要です',
        variant: 'destructive',
      })
      return
    }

    // バリデーション
    const codes = editingLevels.map((l) => l.levelCode)
    const duplicates = codes.filter((code, index) => codes.indexOf(code) !== index)
    if (duplicates.length > 0) {
      toast({
        title: 'エラー',
        description: `コードが重複しています: ${duplicates.join(', ')}`,
        variant: 'destructive',
      })
      return
    }

    const emptyCode = editingLevels.some((l) => !l.levelCode.trim())
    if (emptyCode) {
      toast({
        title: 'エラー',
        description: 'コードを入力してください',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const response = await bffClient.saveConfidenceLevels({
        companyId: CURRENT_COMPANY_ID,
        levels: editingLevels,
      })

      if (response.success) {
        toast({
          title: '保存完了',
          description: '確度マスタを保存しました',
        })
        await loadLevels()
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: '保存に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">確度マスタ設定</h1>
          <p className="text-muted-foreground mt-1">
            予算・見込入力で使用する確度ランクを管理します
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={loadLevels}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="gap-1"
          >
            <Save className="h-4 w-4" />
            保存
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            会社: <span className="font-medium text-foreground">{companyName}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="rounded border-gray-300"
              />
              無効な確度も表示
            </label>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            確度ランクごとの掛け率を設定します。期待値 = Σ(確度×金額) として自動計算されます。
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-muted-foreground">読み込み中...</div>
          </div>
        ) : (
          <ConfidenceLevelTable
            levels={levels}
            onChange={handleLevelsChange}
            onDelete={handleDelete}
            disabled={saving}
          />
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">期待値計算の例</h2>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>売上見込（5月）の例:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>S（受注 100%）: 500万 × 100% = 500万</li>
            <li>A（80%受注）: 300万 × 80% = 240万</li>
            <li>B（50%受注）: 200万 × 50% = 100万</li>
            <li>C（20%受注）: 100万 × 20% = 20万</li>
            <li>D（0%）: 50万 × 0% = 0万</li>
            <li>Z（目安なし）: 350万 × 0% = 0万</li>
          </ul>
          <p className="mt-4 font-medium">期待値合計: 860万</p>
        </div>
      </Card>
    </div>
  )
}
