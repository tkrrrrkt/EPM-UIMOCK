'use client'

import { useEffect, useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui'
import type {
  BffAllocationEventResponse,
  BffAllocationDriverResponse,
  ScenarioType,
  DriverType,
} from '@epm/contracts/bff/allocation-master'
import { bffClient } from './api'
import { getErrorMessage } from './constants'
import {
  AllocationEventSearchPanel,
  AllocationEventList,
  CreateEventDialog,
  CopyEventDialog,
  AllocationEventDetailDialog,
  AllocationDriverSearchPanel,
  AllocationDriverList,
  AllocationDriverDialog,
} from './components'

export default function AllocationMasterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Events state
  const [events, setEvents] = useState<BffAllocationEventResponse[]>([])
  const [eventsTotalCount, setEventsTotalCount] = useState(0)
  const [eventsPage, setEventsPage] = useState(1)
  const [eventsPageSize] = useState(10)
  const [eventsSortBy, setEventsSortBy] = useState('eventCode')
  const [eventsSortOrder, setEventsSortOrder] = useState<'asc' | 'desc'>('asc')
  const [eventKeyword, setEventKeyword] = useState('')
  const [scenarioTypeFilter, setScenarioTypeFilter] = useState('all')
  const [isActiveFilter, setIsActiveFilter] = useState('all')

  // Drivers state
  const [drivers, setDrivers] = useState<BffAllocationDriverResponse[]>([])
  const [driversTotalCount, setDriversTotalCount] = useState(0)
  const [driversPage, setDriversPage] = useState(1)
  const [driversPageSize] = useState(10)
  const [driversSortBy, setDriversSortBy] = useState('driverCode')
  const [driversSortOrder, setDriversSortOrder] = useState<'asc' | 'desc'>('asc')
  const [driverKeyword, setDriverKeyword] = useState('')
  const [driverTypeFilter, setDriverTypeFilter] = useState('all')

  // Dialog state
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false)
  const [copyEventDialogOpen, setCopyEventDialogOpen] = useState(false)
  const [copyEventSource, setCopyEventSource] = useState<{ id: string; name: string } | null>(null)
  const [eventDetailDialogOpen, setEventDetailDialogOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [driverDialogOpen, setDriverDialogOpen] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)

  useEffect(() => {
    loadEvents()
  }, [eventsPage, eventsSortBy, eventsSortOrder, eventKeyword, scenarioTypeFilter, isActiveFilter])

  useEffect(() => {
    loadDrivers()
  }, [driversPage, driversSortBy, driversSortOrder, driverKeyword, driverTypeFilter])

  const loadEvents = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await bffClient.listEvents({
        page: eventsPage,
        pageSize: eventsPageSize,
        sortBy: eventsSortBy as 'eventCode' | 'eventName' | 'scenarioType' | 'isActive' | 'updatedAt',
        sortOrder: eventsSortOrder,
        keyword: eventKeyword || undefined,
        scenarioType: scenarioTypeFilter === 'all' ? undefined : (scenarioTypeFilter as ScenarioType),
        isActive: isActiveFilter === 'all' ? undefined : isActiveFilter === 'true',
      })
      setEvents(response.items)
      setEventsTotalCount(response.total)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(getErrorMessage(message))
    } finally {
      setLoading(false)
    }
  }

  const loadDrivers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await bffClient.listDrivers({
        page: driversPage,
        pageSize: driversPageSize,
        sortBy: driversSortBy as 'driverCode' | 'driverName' | 'driverType' | 'updatedAt',
        sortOrder: driversSortOrder,
        keyword: driverKeyword || undefined,
        driverType: driverTypeFilter === 'all' ? undefined : (driverTypeFilter as DriverType),
      })
      setDrivers(response.items)
      setDriversTotalCount(response.total)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(getErrorMessage(message))
    } finally {
      setLoading(false)
    }
  }

  const handleEventSort = (column: string) => {
    if (eventsSortBy === column) {
      setEventsSortOrder(eventsSortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setEventsSortBy(column)
      setEventsSortOrder('asc')
    }
    setEventsPage(1)
  }

  const handleDriverSort = (column: string) => {
    if (driversSortBy === column) {
      setDriversSortOrder(driversSortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setDriversSortBy(column)
      setDriversSortOrder('asc')
    }
    setDriversPage(1)
  }

  const handleSelectEvent = (id: string) => {
    setSelectedEventId(id)
    setEventDetailDialogOpen(true)
  }

  const handleCopyEvent = (id: string) => {
    const event = events.find((e) => e.id === id)
    if (event) {
      setCopyEventSource({ id: event.id, name: event.eventName })
      setCopyEventDialogOpen(true)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('この配賦イベントを削除しますか？')) return

    try {
      await bffClient.deleteEvent(id)
      loadEvents()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      alert(getErrorMessage(message))
    }
  }

  const handleSelectDriver = (id: string) => {
    setSelectedDriverId(id)
    setDriverDialogOpen(true)
  }

  const handleDeleteDriver = async (id: string) => {
    if (!confirm('この配賦ドライバを削除しますか？')) return

    try {
      await bffClient.deleteDriver(id)
      loadDrivers()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      alert(getErrorMessage(message))
    }
  }

  const handleCreateDriver = () => {
    setSelectedDriverId(null)
    setDriverDialogOpen(true)
  }

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">配賦マスタ</h1>
          <p className="text-muted-foreground mt-1">配賦イベント・ステップ・ドライバの管理</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              loadEvents()
              loadDrivers()
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="events">配賦イベント</TabsTrigger>
          <TabsTrigger value="drivers">配賦ドライバ</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4 mt-4">
          <div className="flex justify-between items-end gap-4">
            <div className="flex-1">
              <AllocationEventSearchPanel
                keyword={eventKeyword}
                onKeywordChange={(value) => {
                  setEventKeyword(value)
                  setEventsPage(1)
                }}
                scenarioTypeFilter={scenarioTypeFilter}
                onScenarioTypeFilterChange={(value) => {
                  setScenarioTypeFilter(value)
                  setEventsPage(1)
                }}
                isActiveFilter={isActiveFilter}
                onIsActiveFilterChange={(value) => {
                  setIsActiveFilter(value)
                  setEventsPage(1)
                }}
              />
            </div>
            <Button onClick={() => setCreateEventDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              新規作成
            </Button>
          </div>

          <AllocationEventList
            events={events}
            totalCount={eventsTotalCount}
            page={eventsPage}
            pageSize={eventsPageSize}
            sortBy={eventsSortBy}
            sortOrder={eventsSortOrder}
            onSort={handleEventSort}
            onPageChange={setEventsPage}
            onSelectEvent={handleSelectEvent}
            onCopyEvent={handleCopyEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4 mt-4">
          <div className="flex justify-between items-end gap-4">
            <div className="flex-1">
              <AllocationDriverSearchPanel
                keyword={driverKeyword}
                onKeywordChange={(value) => {
                  setDriverKeyword(value)
                  setDriversPage(1)
                }}
                driverTypeFilter={driverTypeFilter}
                onDriverTypeFilterChange={(value) => {
                  setDriverTypeFilter(value)
                  setDriversPage(1)
                }}
              />
            </div>
            <Button onClick={handleCreateDriver}>
              <Plus className="mr-2 h-4 w-4" />
              新規作成
            </Button>
          </div>

          <AllocationDriverList
            drivers={drivers}
            totalCount={driversTotalCount}
            page={driversPage}
            pageSize={driversPageSize}
            sortBy={driversSortBy}
            sortOrder={driversSortOrder}
            onSort={handleDriverSort}
            onPageChange={setDriversPage}
            onSelectDriver={handleSelectDriver}
            onDeleteDriver={handleDeleteDriver}
          />
        </TabsContent>
      </Tabs>

      {/* Event Dialogs */}
      <CreateEventDialog
        open={createEventDialogOpen}
        onOpenChange={setCreateEventDialogOpen}
        onSuccess={loadEvents}
      />

      <CopyEventDialog
        open={copyEventDialogOpen}
        onOpenChange={setCopyEventDialogOpen}
        sourceEventId={copyEventSource?.id || null}
        sourceEventName={copyEventSource?.name || ''}
        onSuccess={loadEvents}
      />

      <AllocationEventDetailDialog
        eventId={selectedEventId}
        open={eventDetailDialogOpen}
        onOpenChange={setEventDetailDialogOpen}
        onSuccess={loadEvents}
      />

      {/* Driver Dialog */}
      <AllocationDriverDialog
        open={driverDialogOpen}
        onOpenChange={setDriverDialogOpen}
        driverId={selectedDriverId}
        onSuccess={loadDrivers}
      />
    </div>
  )
}
