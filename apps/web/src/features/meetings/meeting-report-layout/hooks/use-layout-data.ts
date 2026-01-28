'use client'

import { useState, useEffect, useCallback } from 'react'
import { mockBffClient } from '../api/mock-bff-client'
import type { ReportLayoutDto, ReportPageDto, ReportComponentDto, LayoutTemplateDto } from '../types'

interface UseDataReturn<T> {
  data: T | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useLayouts(meetingTypeId: string): UseDataReturn<ReportLayoutDto[]> {
  const [data, setData] = useState<ReportLayoutDto[] | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!meetingTypeId) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await mockBffClient.getLayouts(meetingTypeId)
      setData(result.items.sort((a, b) => a.sortOrder - b.sortOrder))
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch layouts'))
    } finally {
      setIsLoading(false)
    }
  }, [meetingTypeId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

export function usePages(layoutId: string | null): UseDataReturn<ReportPageDto[]> {
  const [data, setData] = useState<ReportPageDto[] | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!layoutId) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await mockBffClient.getPages(layoutId)
      setData(result.items.sort((a, b) => a.sortOrder - b.sortOrder))
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch pages'))
    } finally {
      setIsLoading(false)
    }
  }, [layoutId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

export function useComponents(pageId: string | null): UseDataReturn<ReportComponentDto[]> {
  const [data, setData] = useState<ReportComponentDto[] | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!pageId) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await mockBffClient.getComponents(pageId)
      setData(result.items.sort((a, b) => a.sortOrder - b.sortOrder))
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch components'))
    } finally {
      setIsLoading(false)
    }
  }, [pageId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

export function useTemplates(): UseDataReturn<LayoutTemplateDto[]> {
  const [data, setData] = useState<LayoutTemplateDto[] | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await mockBffClient.getTemplates()
      setData(result.items)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch templates'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

export function useLayoutDetail(layoutId: string | null, layouts: ReportLayoutDto[] | undefined) {
  if (!layoutId || !layouts) return null
  return layouts.find((l) => l.id === layoutId) || null
}

export function usePageDetail(pageId: string | null, pages: ReportPageDto[] | undefined) {
  if (!pageId || !pages) return null
  return pages.find((p) => p.id === pageId) || null
}

export function useComponentDetail(componentId: string | null, components: ReportComponentDto[] | undefined) {
  if (!componentId || !components) return null
  return components.find((c) => c.id === componentId) || null
}
