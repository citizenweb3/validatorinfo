export interface SyncResult {
  success: boolean;
  totalEvents: number;
  newEvents: number;
  skippedEvents: number;
  failedRanges?: Array<{ start: string; end: string }>;
  error?: string;
}
