"use client"

import { useState } from "react"
import { Button } from "@/shared/ui/components/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/components/popover"
import { MoreVertical, BarChart3, Kanban } from "lucide-react"
import Link from "next/link"

interface DrilldownMenuProps {
  planId: string
}

export function DrilldownMenu({ planId }: DrilldownMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="end">
        <div className="space-y-1">
          <Link href={`/kpi/action-plan-gantt?planId=${planId}`}>
            <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => setOpen(false)}>
              <BarChart3 className="h-4 w-4 mr-2" />
              ガントチャート
            </Button>
          </Link>
          <Link href={`/kpi/action-plan-kanban?planId=${planId}`}>
            <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => setOpen(false)}>
              <Kanban className="h-4 w-4 mr-2" />
              カンバンボード
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
