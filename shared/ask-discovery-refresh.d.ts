export const DISCOVERY_REFRESH_MS: number;
type Card = { public_id: string; revision: number; question: string; summary?: string; share_url?: string; similar?: Card[] };
export function changedDiscoveryIds(shown: Card[], lists: { recent: Card[]; frequent: Card[] }): Set<string>;
export function watchDiscoveryLists<T>(options: {
  read: (signal: AbortSignal) => Promise<T | null>;
  onLists: (lists: T, context: { manual: boolean }) => void;
  onUnavailable?: () => void;
  window?: Window;
  document?: Document;
}): { refresh(): void; stop(): void };
