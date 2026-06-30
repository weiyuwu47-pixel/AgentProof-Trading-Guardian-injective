import type { MarketDataProvider } from "./marketDataProvider.js";
import type { MarketSnapshot } from "./types.js";

interface EastMoneyResponse {
  data?: {
    f43?: number;
    f44?: number;
    f45?: number;
    f46?: number;
    f47?: number;
    f57?: string;
    f58?: string;
    f60?: number;
  };
}

function marketPrefix(symbol: string): "0" | "1" {
  return symbol.startsWith("6") ? "1" : "0";
}

function scaledPrice(value: number | undefined): number | undefined {
  if (value === undefined || value <= 0) {
    return undefined;
  }

  return Number((value / 100).toFixed(2));
}

function estimateMovingAverages(price: number, previousClose?: number): {
  ma5: number;
  ma10: number;
  ma20: number;
} {
  const anchor = previousClose && previousClose > 0 ? previousClose : price;
  return {
    ma5: Number(((price * 2 + anchor * 3) / 5).toFixed(2)),
    ma10: Number(((price * 3 + anchor * 7) / 10).toFixed(2)),
    ma20: Number(((price * 4 + anchor * 16) / 20).toFixed(2))
  };
}

export class StockMarketDataProvider implements MarketDataProvider {
  async getMarketSnapshot(symbol: string): Promise<MarketSnapshot> {
    const secid = `${marketPrefix(symbol)}.${symbol}`;
    const fields = ["f43", "f44", "f45", "f46", "f47", "f57", "f58", "f60"].join(",");
    const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=${fields}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "AgentProof-Trading-Guardian/0.1"
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`Market data request failed with HTTP ${response.status}`);
    }

    const payload = (await response.json()) as EastMoneyResponse;
    if (!payload.data) {
      throw new Error("Market data response did not include data");
    }

    const price = scaledPrice(payload.data.f43);
    if (!price) {
      throw new Error("Market data response did not include a valid price");
    }

    const previousClose = scaledPrice(payload.data.f60);
    const averages = estimateMovingAverages(price, previousClose);

    return {
      symbol: payload.data.f57 ?? symbol,
      assetName: payload.data.f58,
      market: "A_SHARE",
      price,
      open: scaledPrice(payload.data.f46),
      high: scaledPrice(payload.data.f44),
      low: scaledPrice(payload.data.f45),
      previousClose,
      volume: payload.data.f47,
      ...averages,
      timestamp: new Date().toISOString(),
      source: "real"
    };
  }
}
