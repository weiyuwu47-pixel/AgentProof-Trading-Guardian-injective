import path from "node:path";
import { readJsonFile } from "../utils/fs.js";
import type { MarketDataProvider } from "./marketDataProvider.js";
import type { MarketSnapshot } from "./types.js";

export class SampleMarketDataProvider implements MarketDataProvider {
  constructor(
    private readonly samplePath = path.join(
      process.cwd(),
      "data",
      "trading",
      "market-snapshot.sample.json"
    )
  ) {}

  async getMarketSnapshot(symbol: string): Promise<MarketSnapshot> {
    const snapshot = await readJsonFile<MarketSnapshot>(this.samplePath);
    return {
      ...snapshot,
      symbol,
      timestamp: new Date().toISOString(),
      source: "sample"
    };
  }
}
