/**
 * MockBffClient for Confidence Master
 *
 * Phase 1: UI-MOCK 検証用のモック実装
 */

import type { BffClient } from './BffClient'
import type {
  BffConfidenceLevelListRequest,
  BffConfidenceLevelListResponse,
  BffConfidenceLevelSaveRequest,
  BffConfidenceLevelSaveResponse,
  BffConfidenceLevelDeleteRequest,
  BffConfidenceLevel,
} from '@epm/contracts/bff/confidence-master'
import { DEFAULT_CONFIDENCE_LEVELS } from '@epm/contracts/bff/confidence-master'

// モックデータストレージ
let mockLevels: BffConfidenceLevel[] = DEFAULT_CONFIDENCE_LEVELS.map((level, index) => ({
  ...level,
  id: `cl-${String(index + 1).padStart(3, '0')}`,
}))

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class MockBffClient implements BffClient {
  async listConfidenceLevels(req: BffConfidenceLevelListRequest): Promise<BffConfidenceLevelListResponse> {
    await delay(300)

    let filtered = [...mockLevels]

    // 無効な確度を除外（デフォルト）
    if (!req.includeInactive) {
      filtered = filtered.filter((level) => level.isActive)
    }

    // sortOrderでソート
    filtered.sort((a, b) => a.sortOrder - b.sortOrder)

    return {
      companyId: req.companyId,
      companyName: 'ABC株式会社',
      levels: filtered,
    }
  }

  async saveConfidenceLevels(req: BffConfidenceLevelSaveRequest): Promise<BffConfidenceLevelSaveResponse> {
    await delay(500)

    // 更新処理
    const updatedLevels: BffConfidenceLevel[] = req.levels.map((input, index) => {
      const existing = input.id ? mockLevels.find((l) => l.id === input.id) : null

      return {
        id: existing?.id || `cl-${Date.now()}-${index}`,
        levelCode: input.levelCode,
        levelName: input.levelName,
        levelNameShort: input.levelNameShort,
        probabilityRate: input.probabilityRate / 100, // UI: 0-100 -> Store: 0-1
        colorCode: input.colorCode,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
      }
    })

    // モックストレージを更新
    mockLevels = updatedLevels

    return {
      success: true,
      levels: updatedLevels,
    }
  }

  async deleteConfidenceLevel(req: BffConfidenceLevelDeleteRequest): Promise<{ success: boolean }> {
    await delay(300)

    const index = mockLevels.findIndex((l) => l.id === req.levelId)
    if (index === -1) {
      throw new Error('CONFIDENCE_LEVEL_NOT_FOUND')
    }

    // 使用中チェック（モックでは常にOK）
    mockLevels.splice(index, 1)

    return { success: true }
  }
}

export const bffClient: BffClient = new MockBffClient()
