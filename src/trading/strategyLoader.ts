import path from "node:path";
import { readJsonFile } from "../utils/fs.js";
import type { Portfolio, UserTradingStrategy } from "./types.js";

export async function loadUserStrategy(
  filePath = path.join(process.cwd(), "data", "trading", "user-strategy.sample.json")
): Promise<UserTradingStrategy> {
  return readJsonFile<UserTradingStrategy>(filePath);
}

export async function loadPortfolio(
  filePath = path.join(process.cwd(), "data", "trading", "portfolio.sample.json")
): Promise<Portfolio> {
  return readJsonFile<Portfolio>(filePath);
}
