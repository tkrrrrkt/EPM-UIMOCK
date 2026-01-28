'use client'

import { useState, useEffect } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from '@/shared/ui'
import { Plus, ArrowLeft } from 'lucide-react'
import { KpiEventTable } from './kpi-event-table'
import { KpiItemTable } from './kpi-item-table'
import { CreateEventDialog } from './dialogs/create-event-dialog'
import { CreateKpiItemDialog } from './dialogs/create-kpi-item-dialog'
import { getBffClient } from '../api/client'
import type {
  BffKpiEvent,
  BffKpiItem,
  BffDepartment,
  BffEmployee,
  BffSelectOption,
} from '../lib/types'

interface KpiMasterPageProps {
  onNavigateToList?: () => void
}

export function KpiMasterPage({ onNavigateToList }: KpiMasterPageProps) {
  const client = getBffClient()

  const [events, setEvents] = useState<BffKpiEvent[]>([])
  const [items, setItems] = useState<BffKpiItem[]>([])
  const [departments, setDepartments] = useState<BffDepartment[]>([])
  const [employees, setEmployees] = useState<BffEmployee[]>([])
  const [subjects, setSubjects] = useState<BffSelectOption[]>([])
  const [kpiDefinitions, setKpiDefinitions] = useState<BffSelectOption[]>([])
  const [metrics, setMetrics] = useState<BffSelectOption[]>([])

  const [selectedEventId, setSelectedEventId] = useState<string>('')

  // Dialog states
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isKpiItemDialogOpen, setIsKpiItemDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<BffKpiEvent | null>(null)
  const [editingKpiItem, setEditingKpiItem] = useState<BffKpiItem | null>(null)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const [
        eventsData,
        deptsData,
        empsData,
        subjectsData,
        defsData,
        metricsData,
      ] = await Promise.all([
        client.getEvents(),
        client.getDepartments(),
        client.getEmployees(),
        client.getSelectableSubjects(),
        client.getSelectableKpiDefinitions(),
        client.getSelectableMetrics(),
      ])
      setEvents(eventsData)
      setDepartments(deptsData)
      setEmployees(empsData)
      setSubjects(subjectsData)
      setKpiDefinitions(defsData)
      setMetrics(metricsData)
      if (eventsData.length > 0) {
        setSelectedEventId(eventsData[0].id)
      }
    }
    loadData()
  }, [client])

  // Load KPI items when event changes
  useEffect(() => {
    if (selectedEventId) {
      const loadItems = async () => {
        const itemsData = await client.getKpiItems(selectedEventId)
        setItems(itemsData)
      }
      loadItems()
    }
  }, [client, selectedEventId])

  const selectedEvent = events.find((e) => e.id === selectedEventId)

  // Event handlers
  const handleOpenNewEvent = () => {
    setEditingEvent(null)
    setIsEventDialogOpen(true)
  }

  const handleEditEvent = (event: BffKpiEvent) => {
    setEditingEvent(event)
    setIsEventDialogOpen(true)
  }

  const handleCloseEventDialog = (open: boolean) => {
    setIsEventDialogOpen(open)
    if (!open) {
      setEditingEvent(null)
    }
  }

  const handleSubmitEvent = async (data: {
    eventCode: string
    eventName: string
    fiscalYear: number
  }) => {
    const newEvent = await client.createEvent(data)
    setEvents((prev) => [newEvent, ...prev])
    setSelectedEventId(newEvent.id)
  }

  const handleDuplicateEvent = async (event: BffKpiEvent) => {
    const newYear = event.fiscalYear + 1
    const newEvent = await client.createEvent({
      eventCode: `KPI-${newYear}`,
      eventName: `${newYear}年度 KPI管理`,
      fiscalYear: newYear,
    })
    setEvents((prev) => [newEvent, ...prev])
    setSelectedEventId(newEvent.id)
  }

  // KPI Item handlers
  const handleOpenNewKpiItem = () => {
    setEditingKpiItem(null)
    setIsKpiItemDialogOpen(true)
  }

  const handleEditKpiItem = (item: BffKpiItem) => {
    setEditingKpiItem(item)
    setIsKpiItemDialogOpen(true)
  }

  const handleCloseKpiItemDialog = (open: boolean) => {
    setIsKpiItemDialogOpen(open)
    if (!open) {
      setEditingKpiItem(null)
    }
  }

  const handleSubmitKpiItem = async (data: {
    kpiCode: string
    kpiName: string
    kpiType: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC'
    hierarchyLevel: 1 | 2
    parentKpiItemId?: string
    refSubjectId?: string
    refKpiDefinitionId?: string
    refMetricId?: string
    departmentStableId?: string
    ownerEmployeeId?: string
  }) => {
    if (editingKpiItem) {
      const updated = await client.updateKpiItem(editingKpiItem.id, data)
      setItems((prev) =>
        prev.map((item) => (item.id === editingKpiItem.id ? updated : item))
      )
    } else {
      const newItem = await client.createKpiItem({
        eventId: selectedEventId,
        ...data,
      })
      setItems((prev) => [...prev, newItem])
    }
  }

  const handleDeleteKpiItem = async (itemId: string) => {
    await client.deleteKpiItem(itemId)
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          {onNavigateToList && (
            <Button variant="ghost" size="sm" onClick={onNavigateToList}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              KPI状況照会
            </Button>
          )}
          <h1 className="text-2xl font-semibold text-foreground">
            KPI管理設定
          </h1>
        </div>

        {/* Events Section */}
        <Card className="mb-6 border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">イベント一覧</CardTitle>
            <Button onClick={handleOpenNewEvent}>
              <Plus className="mr-2 h-4 w-4" />
              新規イベント
            </Button>
          </CardHeader>
          <CardContent>
            <KpiEventTable
              events={events}
              selectedEventId={selectedEventId}
              onSelectEvent={setSelectedEventId}
              onEditEvent={handleEditEvent}
              onDuplicateEvent={handleDuplicateEvent}
            />
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* KPI Items Section */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg">KPI項目管理</CardTitle>
              {selectedEvent && (
                <p className="mt-1 text-sm text-muted-foreground">
                  対象: {selectedEvent.eventCode} - {selectedEvent.eventName}
                </p>
              )}
            </div>
            <Button
              onClick={handleOpenNewKpiItem}
              disabled={!selectedEventId}
            >
              <Plus className="mr-2 h-4 w-4" />
              KPI項目追加
            </Button>
          </CardHeader>
          <CardContent>
            <KpiItemTable
              items={items}
              onEditItem={handleEditKpiItem}
              onDeleteItem={handleDeleteKpiItem}
            />
          </CardContent>
        </Card>

        {/* Dialogs */}
        <CreateEventDialog
          open={isEventDialogOpen}
          onOpenChange={handleCloseEventDialog}
          onSubmit={handleSubmitEvent}
          editingEvent={editingEvent}
        />
        <CreateKpiItemDialog
          open={isKpiItemDialogOpen}
          onOpenChange={handleCloseKpiItemDialog}
          onSubmit={handleSubmitKpiItem}
          departments={departments}
          employees={employees}
          subjects={subjects}
          kpiDefinitions={kpiDefinitions}
          metrics={metrics}
          parentKpiItems={items}
          editingItem={editingKpiItem}
        />
      </div>
    </div>
  )
}
