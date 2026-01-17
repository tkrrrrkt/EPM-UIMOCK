"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronRight, PanelLeftClose, PanelLeft, HelpCircle, User } from "lucide-react"

import { menu, type MenuItem } from "@/shared/navigation/menu"
import { HeaderNotificationIcon } from "@/features/workflow/approval/components/HeaderNotificationIcon"
import { cn } from "@/lib/utils"
import { Button } from "@/shared/ui/components/button"
import { ScrollArea } from "@/shared/ui/components/scroll-area"
import { Separator } from "@/shared/ui/components/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/components/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/components/collapsible"

type Props = {
  children: React.ReactNode
}

export function AppShell({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex h-screen">
          <AppSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex min-w-0 flex-1 flex-col">
            <Header sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <main className="min-w-0 flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

function Header({
  sidebarOpen,
  onToggleSidebar
}: {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}) {
  const router = useRouter()

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
                <PanelLeft className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">メニューを開く</TooltipContent>
          </Tooltip>
        )}
        <div className="flex items-center gap-2">
          <div className="text-lg font-bold text-primary">EPM</div>
          <div className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Trial</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <HeaderNotificationIcon onClick={() => router.push('/workflow/approval')} />
          </TooltipTrigger>
          <TooltipContent>承認待ち</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>ヘルプ</TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6" />
        <Button variant="ghost" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">ユーザー</span>
        </Button>
      </div>
    </header>
  )
}

function AppSidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out",
        open ? "w-64" : "w-0 overflow-hidden"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-border">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          メニュー
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle}>
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">メニューを閉じる</TooltipContent>
        </Tooltip>
      </div>

      {/* Sidebar Content */}
      <div className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <nav className="p-2 space-y-1">
            {menu.map((item) => (
              <NavItem key={item.id} item={item} pathname={pathname} />
            ))}
          </nav>
        </ScrollArea>
      </div>

      {/* Sidebar Footer */}
      <div className="border-t border-border p-3">
        <div className="text-xs text-muted-foreground text-center">
          EPM SaaS v0.1.0
        </div>
      </div>
    </aside>
  )
}

function NavItem({ item, pathname }: { item: MenuItem; pathname: string }) {
  const hasChildren = !!item.children?.length
  const Icon = item.icon
  const isActive = item.path ? pathname === item.path : false

  // 再帰的に子孫のアクティブ状態をチェック
  const checkDescendantActive = (menuItem: MenuItem): boolean => {
    if (menuItem.path === pathname) return true
    return menuItem.children?.some(checkDescendantActive) ?? false
  }
  const isDescendantActive = item.children?.some(checkDescendantActive) ?? false

  const [isOpen, setIsOpen] = React.useState(isDescendantActive)

  // グループノード（子あり）
  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              "hover:bg-muted",
              isDescendantActive && "bg-muted"
            )}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
            <span className="flex-1 text-left font-medium">{item.labelJa || item.label}</span>
            <ChevronRight
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-90"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 pt-1">
          <div className="space-y-1 border-l border-border pl-3">
            {item.children!.map((child) => (
              <NavItem key={child.id} item={child} pathname={pathname} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  // リーフノード
  const href = item.path ?? "#"

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted text-foreground"
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            isActive ? "text-primary-foreground" : "text-muted-foreground"
          )}
        />
      )}
      <span>{item.labelJa || item.label}</span>
    </Link>
  )
}
