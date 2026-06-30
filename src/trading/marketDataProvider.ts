import type { MarketSnapshot } from "./types.js";

export interface MarketDataProvider {
  getMarketSnapshot(symbol: string): Promise<MarketSnapshot>;
}
