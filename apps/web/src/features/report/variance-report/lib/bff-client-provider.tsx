"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import type { BffClient } from "../api/BffClient"
import { MockBffClient } from "../api/MockBffClient"

const BffClientContext = createContext<BffClient | null>(null)

interface BffClientProviderProps {
  children: ReactNode
  client?: BffClient
}

export function BffClientProvider({ children, client }: BffClientProviderProps) {
  const bffClient = useMemo(() => client ?? new MockBffClient(), [client])

  return <BffClientContext.Provider value={bffClient}>{children}</BffClientContext.Provider>
}

export function useBffClient(): BffClient {
  const client = useContext(BffClientContext)
  if (!client) {
    throw new Error("useBffClient must be used within a BffClientProvider")
  }
  return client
}
