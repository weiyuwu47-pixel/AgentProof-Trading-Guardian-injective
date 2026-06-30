import type { ChainProvider } from "./ChainProvider.js";
import { MsgBroadcasterWithPk, MsgSend } from "@injectivelabs/sdk-ts";
import {
  Network,
  getNetworkEndpoints,
  type Network as InjectiveNetwork,
  type NetworkEndpoints
} from "@injectivelabs/networks";
import type { Coin } from "@injectivelabs/ts-types";
import path from "node:path";
import { timestampForFile, writeJsonFile } from "../utils/fs.js";

interface InjectiveAnchorReport {
  chain: "Injective Testnet";
  provider: "InjectiveProvider";
  txHash: string;
  explorerUrl?: string;
  memo: string;
  proofHash: string;
  timestamp: string;
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for real Injective anchoring.`);
  }

  return value;
}

function resolveNetwork(value = process.env.INJECTIVE_NETWORK ?? "testnet"): InjectiveNetwork {
  const normalized = value.trim().toLowerCase();

  if (normalized === "testnet") {
    return Network.Testnet;
  }

  if (normalized === "testnetk8s" || normalized === "testnet-k8s") {
    return Network.TestnetK8s;
  }

  if (normalized === "testnetsentry" || normalized === "testnet-sentry") {
    return Network.TestnetSentry;
  }

  throw new Error(`Unsupported Injective network "${value}". This demo only supports testnet networks.`);
}

function explorerUrl(txHash: string): string {
  return `https://testnet.explorer.injective.network/transaction/${txHash}`;
}

function sanitizeError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);
  const privateKey = process.env.INJECTIVE_PRIVATE_KEY?.trim();
  return new Error(privateKey ? message.replaceAll(privateKey, "[redacted]") : message);
}

function resolveEndpoints(network: InjectiveNetwork): NetworkEndpoints {
  const endpoints = getNetworkEndpoints(network);

  return {
    ...endpoints,
    grpc: process.env.INJECTIVE_GRPC_URL?.trim() || endpoints.grpc,
    rest: process.env.INJECTIVE_REST_URL?.trim() || endpoints.rest,
    rpc: process.env.INJECTIVE_RPC_URL?.trim() || endpoints.rpc
  };
}

function extractMemoFromTxResponse(payload: unknown): string | undefined {
  const txBody = (payload as { tx?: { body?: { memo?: unknown } } }).tx?.body;
  return typeof txBody?.memo === "string" ? txBody.memo : undefined;
}

export function buildInjectiveMemo(proofHash: string): string {
  const prefix = process.env.INJECTIVE_MEMO_PREFIX?.trim() || "AgentProof";
  return `${prefix}:${proofHash}`;
}

function resolveMemo(proofHash: string, metadata?: Record<string, unknown>): string {
  return typeof metadata?.memo === "string" ? metadata.memo : buildInjectiveMemo(proofHash);
}

export class InjectiveProvider implements ChainProvider {
  private readonly network = resolveNetwork();
  private readonly endpoints = resolveEndpoints(this.network);

  async anchorProof(
    proofHash: string,
    metadata?: Record<string, unknown>
  ): Promise<{ chain: string; txHash: string; explorerUrl?: string }> {
    try {
      const privateKey = requiredEnv("INJECTIVE_PRIVATE_KEY");
      const address = requiredEnv("INJECTIVE_ADDRESS");
      const memo = resolveMemo(proofHash, metadata);
      const amount: Coin = {
        denom: "inj",
        amount: process.env.INJECTIVE_ANCHOR_AMOUNT?.trim() || "1"
      };

      const msg = MsgSend.fromJSON({
        amount,
        srcInjectiveAddress: address,
        dstInjectiveAddress: address
      });

      const broadcaster = new MsgBroadcasterWithPk({
        privateKey,
        network: this.network,
        endpoints: this.endpoints,
        useRest: true
      });

      const response = await broadcaster.broadcast({
        msgs: msg,
        memo,
        gas: {
          gas: Number(process.env.INJECTIVE_ANCHOR_GAS_LIMIT?.trim() || "300000")
        }
      });

      if (response.code !== 0) {
        throw new Error(`Injective tx failed with code ${response.code}: ${response.rawLog}`);
      }

      const txHash = response.txHash;
      const timestamp = new Date().toISOString();
      await this.writeAnchorReport({
        chain: "Injective Testnet",
        provider: "InjectiveProvider",
        txHash,
        explorerUrl: explorerUrl(txHash),
        memo,
        proofHash,
        timestamp
      });

      return {
        chain: "Injective Testnet",
        txHash,
        explorerUrl: explorerUrl(txHash)
      };
    } catch (error) {
      throw sanitizeError(error);
    }
  }

  async readProof(txHash: string): Promise<{
    proofHash: string;
    metadata?: Record<string, unknown>;
  }> {
    try {
      const response = await fetch(`${this.endpoints.rest}/cosmos/tx/v1beta1/txs/${txHash}`);
      if (!response.ok) {
        throw new Error(`Injective tx lookup failed with HTTP ${response.status}`);
      }

      const payload = (await response.json()) as unknown;
      const memo = extractMemoFromTxResponse(payload);
      if (!memo || !memo.includes(":")) {
        throw new Error(`No AgentProof memo found for tx ${txHash}`);
      }

      const proofHash = memo.slice(memo.indexOf(":") + 1);
      return {
        proofHash,
        metadata: {
          memo,
          txHash,
          explorerUrl: explorerUrl(txHash)
        }
      };
    } catch (error) {
      throw sanitizeError(error);
    }
  }

  private async writeAnchorReport(report: InjectiveAnchorReport): Promise<void> {
    const filePath = path.join(
      process.cwd(),
      "reports",
      `injective-anchor-${timestampForFile(new Date(report.timestamp))}.json`
    );
    await writeJsonFile(filePath, report);
  }
}
