/**
 * BFF Client Instance (Multidim Analysis Feature)
 *
 * Purpose:
 * - Export single BFF client instance for use across UI components
 * - Phase UI-MOCK: Use mockBffClient
 * - Phase UI-BFF: Switch to createHttpBffClient()
 *
 * Reference: .kiro/specs/reporting/multidim-analysis/design.md
 */
import { mockBffClient } from './MockBffClient';
// import { createHttpBffClient } from './HttpBffClient';

// Phase UI-MOCK: Use mock client
export const bffClient = mockBffClient;

// Phase UI-BFF: Use real HTTP client
// export const bffClient = createHttpBffClient();
