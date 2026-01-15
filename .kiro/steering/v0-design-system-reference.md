# v0 Design System Reference

> **用途**: v0 が Design System の詳細を必要とする場合の補足資料
> **通常のプロンプト作成**: `.kiro/steering/v0-prompt-template.md` を使用

---

## EPM Design System Source of Truth

完全な定義: `.kiro/steering/epm-design-system.md`

---

## Color Palette

### Primary - Deep Teal

```css
--primary-50:  oklch(0.95 0.03 195);
--primary-100: oklch(0.90 0.06 195);
--primary-200: oklch(0.80 0.09 195);
--primary-300: oklch(0.70 0.11 195);
--primary-400: oklch(0.60 0.12 195);
--primary-500: oklch(0.52 0.13 195); /* Main Deep Teal */
--primary-600: oklch(0.45 0.12 195);
--primary-700: oklch(0.38 0.10 195);
--primary-800: oklch(0.30 0.08 195);
--primary-900: oklch(0.22 0.06 195);
```

### Secondary - Royal Indigo

```css
--secondary-50:  oklch(0.95 0.03 280);
--secondary-100: oklch(0.90 0.06 280);
--secondary-200: oklch(0.80 0.09 280);
--secondary-300: oklch(0.70 0.11 280);
--secondary-400: oklch(0.58 0.13 280);
--secondary-500: oklch(0.48 0.15 280); /* Main Royal Indigo */
--secondary-600: oklch(0.40 0.14 280);
--secondary-700: oklch(0.33 0.12 280);
--secondary-800: oklch(0.26 0.10 280);
--secondary-900: oklch(0.20 0.08 280);
```

### Semantic Colors

```css
--success: oklch(0.65 0.18 150);  /* Green */
--warning: oklch(0.75 0.15 70);   /* Amber */
--error:   oklch(0.6 0.22 25);    /* Red */
--info:    oklch(0.6 0.15 240);   /* Blue */
```

### Color Usage

```typescript
// ✅ CORRECT
<div className="bg-primary text-primary-foreground">
<div className="bg-background text-foreground border-border">
<Alert className="border-warning bg-warning/10">

// ❌ PROHIBITED
<div className="bg-[#14b8a6]">           // raw hex
<div className="bg-teal-500">            // arbitrary Tailwind
<div className="text-[oklch(0.52 0.13 195)]">  // raw oklch
```

---

## Typography

### Font Family

- Sans: `Geist`, `Geist Fallback`
- Mono: `Geist Mono`, `Geist Mono Fallback`

### Type Scale

| Level | Classes |
|-------|---------|
| Heading 1 | `text-4xl font-bold tracking-tight` |
| Heading 2 | `text-3xl font-bold tracking-tight` |
| Heading 3 | `text-2xl font-semibold tracking-tight` |
| Heading 4 | `text-xl font-semibold` |
| Body | `text-base leading-relaxed` |
| Small | `text-sm leading-relaxed` |
| Muted | `text-sm text-muted-foreground` |

---

## Spacing System

### Base Unit: 0.25rem (4px)

| Token | Value | Usage |
|-------|-------|-------|
| `gap-2` | 8px | tight spacing |
| `gap-4` | 16px | default spacing |
| `gap-6` | 24px | section spacing |
| `gap-8` | 32px | major section |
| `p-2` | 8px | compact padding |
| `p-4` | 16px | default padding |
| `p-6` | 24px | comfortable padding |

```typescript
// ✅ CORRECT
<div className="p-4 gap-4 rounded-lg">

// ❌ PROHIBITED
<div className="p-[16px] gap-[20px] rounded-[12px]">
```

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 0.125rem | subtle corners |
| `rounded-md` | 0.375rem | default |
| `rounded-lg` | 0.5rem | cards, panels |
| `rounded-xl` | 0.75rem | hero sections |

---

## Component Tiers

### Tier 1 (Standard - MUST Prefer)

Button, Input, Textarea, Label, Checkbox, Switch, Radio Group, Select,
Card, Alert, Badge, Separator, Spinner, Skeleton,
Table, Pagination, Tabs, Dialog, Alert Dialog,
Toast/Toaster/Sonner, Popover, Tooltip,
Dropdown Menu, Scroll Area, Breadcrumb

### Tier 2 (Allowed - Use When Needed)

Calendar, Sheet, Drawer, Command, Sidebar, Progress,
Accordion, Collapsible, Navigation Menu, Menubar, Context Menu,
Resizable, Slider, Hover Card, Avatar, Input OTP,
Chart, Button Group, Input Group, Field, Empty State, KBD, Item,
Form (react-hook-form)

### Tier 3 (Avoid by Default)

Carousel, Aspect Ratio

---

## Import Rules

```typescript
// ✅ CORRECT - barrel export
import { Button, Table, Card, Dialog } from '@/shared/ui'

// ❌ WRONG - direct imports
import { Button } from '@/shared/ui/components/button'
import Button from '../../../shared/ui/components/button'
```

---

## Dark Mode

自動対応（semantic tokens 使用時）:

```typescript
// Tailwind classes automatically adapt
<div className="bg-background text-foreground border-border">
  <Button className="bg-primary text-primary-foreground">
    Primary Action
  </Button>
</div>
```

**手動の dark: バリアント指定は不要。**
