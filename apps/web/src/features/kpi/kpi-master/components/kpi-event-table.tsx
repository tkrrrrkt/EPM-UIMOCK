'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui'
import { MoreHorizontal, Pencil, Copy } from 'lucide-react'
import type { BffKpiEvent } from '../lib/types'
import { cn } from '@/lib/utils'

interface KpiEventTableProps {
  events: BffKpiEvent[]
  selectedEventId: string
  onSelectEvent: (eventId: string) => void
  onEditEvent: (event: BffKpiEvent) => void
  onDuplicateEvent: (event: BffKpiEvent) => void
}

export function KpiEventTable({
  events,
  selectedEventId,
  onSelectEvent,
  onEditEvent,
  onDuplicateEvent,
}: KpiEventTableProps) {
  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-32">イベントコード</TableHead>
            <TableHead>イベント名</TableHead>
            <TableHead className="w-24 text-center">年度</TableHead>
            <TableHead className="w-24 text-center">ステータス</TableHead>
            <TableHead className="w-20 text-center">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow
              key={event.id}
              className={cn(
                'cursor-pointer transition-colors',
                selectedEventId === event.id
                  ? 'bg-primary/10 hover:bg-primary/15'
                  : 'hover:bg-muted/30'
              )}
              onClick={() => onSelectEvent(event.id)}
            >
              <TableCell className="font-medium">{event.eventCode}</TableCell>
              <TableCell>{event.eventName}</TableCell>
              <TableCell className="text-center">{event.fiscalYear}</TableCell>
              <TableCell className="text-center">
                <Badge
                  className={cn(
                    'text-xs',
                    event.status === 'CONFIRMED'
                      ? 'bg-success/20 text-success border-success/30'
                      : 'bg-warning/20 text-warning border-warning/30'
                  )}
                  variant="outline"
                >
                  {event.status === 'CONFIRMED' ? '確定' : '下書き'}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditEvent(event)
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      編集
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onDuplicateEvent(event)
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      次年度複製
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
