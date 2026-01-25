import { BffClient } from "./BffClient";

// Real HTTP adapter. Keep fetch usage ONLY here (UI components must not call fetch directly)
export function createHttpBffClient(_baseUrl = "/bff"): BffClient {
  return {
    // TODO: implement HTTP calls to BFF endpoints
  };
}
