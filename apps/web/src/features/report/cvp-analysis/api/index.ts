export type { BffClient } from './BffClient';
export { MockBffClient } from './MockBffClient';
export { HttpBffClient } from './HttpBffClient';

import { MockBffClient } from './MockBffClient';
import { HttpBffClient } from './HttpBffClient';
import type { BffClient } from './BffClient';

const USE_MOCK = true;

export function createBffClient(): BffClient {
  if (USE_MOCK) {
    return new MockBffClient();
  }
  return new HttpBffClient();
}
