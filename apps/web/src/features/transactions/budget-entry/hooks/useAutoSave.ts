"use client"

import * as React from "react"

// ============================================
// Types
// ============================================

export interface AutoSaveState {
  isSaving: boolean
  lastSavedAt: Date | null
  error: string | null
  pendingChanges: number
}

interface UseAutoSaveOptions {
  debounceMs?: number
  onSave: (changes: PendingChange[]) => Promise<{ success: boolean; error?: string }>
}

interface PendingChange {
  key: string
  value: string | null
  metadata: Record<string, unknown>
}

// ============================================
// Hook
// ============================================

export function useAutoSave({ debounceMs = 500, onSave }: UseAutoSaveOptions) {
  const [state, setState] = React.useState<AutoSaveState>({
    isSaving: false,
    lastSavedAt: null,
    error: null,
    pendingChanges: 0,
  })

  const pendingChangesRef = React.useRef<Map<string, PendingChange>>(new Map())
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const scheduleChange = React.useCallback(
    (key: string, value: string | null, metadata: Record<string, unknown> = {}) => {
      pendingChangesRef.current.set(key, { key, value, metadata })
      setState((prev) => ({
        ...prev,
        pendingChanges: pendingChangesRef.current.size,
        error: null,
      }))

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      // Schedule save
      saveTimeoutRef.current = setTimeout(() => {
        flushChanges()
      }, debounceMs)
    },
    [debounceMs]
  )

  const flushChanges = React.useCallback(async () => {
    if (pendingChangesRef.current.size === 0) return

    const changes = Array.from(pendingChangesRef.current.values())
    pendingChangesRef.current.clear()

    setState((prev) => ({
      ...prev,
      isSaving: true,
      pendingChanges: 0,
      error: null,
    }))

    try {
      const result = await onSave(changes)

      if (result.success) {
        setState((prev) => ({
          ...prev,
          isSaving: false,
          lastSavedAt: new Date(),
          error: null,
        }))
      } else {
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: result.error ?? "保存に失敗しました",
        }))
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isSaving: false,
        error: err instanceof Error ? err.message : "保存に失敗しました",
      }))
    }
  }, [onSave])

  const cancelPending = React.useCallback((key: string) => {
    pendingChangesRef.current.delete(key)
    setState((prev) => ({
      ...prev,
      pendingChanges: pendingChangesRef.current.size,
    }))
  }, [])

  const hasPendingChanges = React.useCallback(() => {
    return pendingChangesRef.current.size > 0
  }, [])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return {
    state,
    scheduleChange,
    flushChanges,
    cancelPending,
    hasPendingChanges,
  }
}
