import { MockBffClient } from "./MockBffClient"
import { HttpBffClient } from "./HttpBffClient"

export type { BffClient } from "./BffClient"
export { MockBffClient } from "./MockBffClient"
export { HttpBffClient } from "./HttpBffClient"

// Re-export types from BffClient that are needed by consumers
export type {
  BffKanbanBoard,
  BffKanbanColumn,
  BffTaskCard,
  BffTaskLabelBrief,
  BffAssigneeBrief,
  BffTaskDetail,
  BffChecklistItem,
  BffTaskComment,
  BffTaskStatus,
  BffTaskLabel,
} from "../types"

// Factory function for production use
// Currently defaults to mock for development
export function createBffClient(useMock = true) {
  if (useMock) {
    return new MockBffClient()
  }
  return new HttpBffClient()
}
