// KPI管理マスタ Feature Barrel Export
// v0-workflow.md準拠: UI → BFF → Domain API

// Components
export * from './components'

// API Client
export { getBffClient, createBffClient, MockBffClient, HttpBffClient } from './api/client'
export type { BffClient } from './api/client'

// Types
export * from './lib/types'
