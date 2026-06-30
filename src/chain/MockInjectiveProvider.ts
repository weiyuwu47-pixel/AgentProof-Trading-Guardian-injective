import { randomBytes } from "node:crypto";
import path from "node:path";
import type { ChainProvider } from "./ChainProvider.js";
import { readJsonFile, writeJsonFile } from "../utils/fs.js";

interface AnchorRecord {
  chain: "Injective";
  txHash: string;
  proofHash: string;
  metadata?: Record<string, unknown>;
  anchoredAt: string;
}

interface AnchorStore {
  provider: "MockInjectiveProvider";
  records: AnchorRecord[];
}

export class MockInjectiveProvider implements ChainProvider {
  constructor(
    private readonly anchorPath = path.join(process.cwd(), "reports", "mock-injective-anchor.json")
  ) {}

  async anchorProof(
    proofHash: string,
    metadata?: Record<string, unknown>
  ): Promise<{ chain: string; txHash: string; explorerUrl?: string }> {
    const txHash = `mockinj_${randomBytes(16).toString("hex")}`;
    const store = await this.readStore();
    store.records.push({
      chain: "Injective",
      txHash,
      proofHash,
      metadata,
      anchoredAt: new Date().toISOString()
    });
    await writeJsonFile(this.anchorPath, store);

    return {
      chain: "Injective",
      txHash
    };
  }

  async readProof(txHash: string): Promise<{
    proofHash: string;
    metadata?: Record<string, unknown>;
  }> {
    const store = await this.readStore();
    const record = store.records.find((item) => item.txHash === txHash);
    if (!record) {
      throw new Error(`Mock Injective anchor not found for txHash ${txHash}`);
    }

    return {
      proofHash: record.proofHash,
      metadata: record.metadata
    };
  }

  private async readStore(): Promise<AnchorStore> {
    try {
      return await readJsonFile<AnchorStore>(this.anchorPath);
    } catch {
      return {
        provider: "MockInjectiveProvider",
        records: []
      };
    }
  }
}
