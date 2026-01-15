// EPM Design System - Shared UI Components Barrel Export
// Source: design-system-definition-sample (67 components)
// DO NOT modify this file manually - it should be generated

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Tier 1 - Base Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Basic Inputs
export { Button, buttonVariants } from './components/button'
export { Input } from './components/input'
export { Textarea } from './components/textarea'
export { Label } from './components/label'
export { Checkbox } from './components/checkbox'
export { Switch } from './components/switch'
export { RadioGroup, RadioGroupItem } from './components/radio-group'
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './components/select'

// Display Components
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/card'
export { Alert, AlertTitle, AlertDescription } from './components/alert'
export { Badge, badgeVariants } from './components/badge'
export { Separator } from './components/separator'
export { Progress } from './components/progress'
export { Spinner } from './components/spinner'
export { Skeleton } from './components/skeleton'
export { Avatar, AvatarImage, AvatarFallback } from './components/avatar'
export { AspectRatio } from './components/aspect-ratio'

// Layout Components
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './components/table'
export { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from './components/pagination'
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/tabs'
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './components/accordion'
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from './components/collapsible'

// Overlay Components
export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from './components/sheet'
export { Dialog, DialogPortal, DialogOverlay, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './components/dialog'
export { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from './components/alert-dialog'
export { Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription } from './components/drawer'
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from './components/popover'
export { HoverCard, HoverCardTrigger, HoverCardContent } from './components/hover-card'
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './components/tooltip'

// Navigation Components
export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from './components/navigation-menu'
export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
} from './components/menubar'
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './components/breadcrumb'
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from './components/command'
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from './components/context-menu'
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './components/dropdown-menu'

// Advanced Components
export { Calendar } from './components/calendar'
export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from './components/carousel'
export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from './components/chart'
export { Sidebar, SidebarProvider, SidebarTrigger, SidebarInset, SidebarHeader, SidebarFooter, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupAction, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuAction, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarMenuBadge, SidebarSeparator, SidebarRail, useSidebar } from './components/sidebar'
export { ScrollArea, ScrollBar } from './components/scroll-area'
export { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './components/resizable'
export { Slider } from './components/slider'
export { Toggle, toggleVariants } from './components/toggle'
export { ToggleGroup, ToggleGroupItem } from './components/toggle-group'

// Form Components
export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from './components/form'
export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from './components/input-otp'

// Toast/Notification Components
export { Toaster } from './components/toaster'
export { useToast, toast } from './components/use-toast'
export { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from './components/toast'
export { Toaster as Sonner } from './components/sonner'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Tier 2 - Composite Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { ButtonGroup } from './components/button-group'
export { InputGroup } from './components/input-group'
export { Field } from './components/field'
export { Empty } from './components/empty'
export { Kbd } from './components/kbd'
export { Item } from './components/item'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EPM Custom Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export {
  DepartmentTreeSelector,
  expandSelection,
  type DepartmentNode,
  type DepartmentSelection,
  type DepartmentTreeSelectorProps,
} from './components/department-tree-selector'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Hooks
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { useIsMobile } from './components/use-mobile'
