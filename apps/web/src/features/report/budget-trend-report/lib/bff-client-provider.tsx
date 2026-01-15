"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { BffClient } from "../api/BffClient"
import { MockBffClient } from "../api/MockBffClient"

const BffClientContext = createContext<BffClient | null>(null)

const defaultClient = new MockBffClient()

export function BffClientProvider({ children }: { children: ReactNode }) {
  return <BffClientContext.Provider value={defaultClient}>{children}</BffClientContext.Provider>
}

export function useBffClient(): BffClient {
  const client = useContext(BffClientContext)
  if (!client) {
    throw new Error("useBffClient must be used within BffClientProvider")
  }
  return client
}
