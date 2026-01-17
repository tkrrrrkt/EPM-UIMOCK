'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { bffClient } from '../api'

interface HeaderNotificationIconProps {
  onClick?: () => void
  className?: string
}

export function HeaderNotificationIcon({ onClick, className }: HeaderNotificationIconProps) {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await bffClient.getApprovalCount()
        setCount(response.count)
      } catch (error) {
        console.error('Failed to fetch approval count:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCount()

    // Refresh count every 60 seconds
    const interval = setInterval(fetchCount, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center rounded-md p-2 hover:bg-muted transition-colors',
        className
      )}
      aria-label={`承認待ち ${count} 件`}
    >
      <Bell className="h-5 w-5" />
      {!loading && count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            {count > 99 ? '99+' : count}
          </span>
        </span>
      )}
    </button>
  )
}
