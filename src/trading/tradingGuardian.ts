import path from "node:path";
import { loadAgentProfile } from "../identity/agentIdentity.js";
import {
  hashAgentIdentityProfile,
  loadAgentIdentityProfile,
  loadLatestAgentProfileAnchor
} from "../identity/agentProfile.js";
import { createBehaviorLog } from "../proof/behaviorLog.js";
import { createProofMetadata } from "../proof/proofMetadata.js";
import { writeJsonFile, timestampForFile } from "../utils/fs.js";
import { MockInjectiveProvider } from "../chain/MockInjectiveProvider.js";
import type { ChainProvider } from "../chain/ChainProvider.js";
import { SampleMarketDataProvider } from "./sampleMarketDataProvider.js";
import { StockMarketDataProvider } from "./stockMarketDataProvider.js";
import { loadPortfolio, loadUserStrategy } from "./strategyLoader.js";
import { generateTradingDecision } from "./tradingDecision.js";
import type { MarketSnapshot, ProofMetadata, TradingDecision, UserTradingStrategy } from "./types.js";
import { verifyProofMetadata } from "../proof/verifyProof.js";

export interface TradingGuardianResult {
  agentProfileId: string;
  strategy: UserTradingStrategy;
  marketSnapshot: MarketSnapshot;
  decision: TradingDecision;
  proofMetadata: ProofMetadata;
  reportPath: string;
  behaviorLogPath: string;
}

export async function runTradingGuardianDemo(
  chainProvider: ChainProvider = new MockInjectiveProvider()
): Promise<TradingGuardianResult> {
  const timestamp = new Date().toISOString();
  const suffix = timestampForFile(new Date(timestamp));

  const agentProfile = loadAgentProfile();
  const agentIdentityProfile = await loadAgentIdentityProfile();
  const agentProfileHash = hashAgentIdentityProfile(agentIdentityProfile);
  const agentIdentityAnchor = await loadLatestAgentProfileAnchor();
  const strategy = await loadUserStrategy();
  const portfolio = await loadPortfolio();
  const sampleProvider = new SampleMarketDataProvider();
  const stockProvider = new StockMarketDataProvider();

  let marketSnapshot: MarketSnapshot;
  try {
    marketSnapshot = await stockProvider.getMarketSnapshot(strategy.asset);
  } catch {
    marketSnapshot = await sampleProvider.getMarketSnapshot(strategy.asset);
  }

  marketSnapshot = {
    ...marketSnapshot,
    assetName: marketSnapshot.assetName ?? strategy.assetName,
    market: marketSnapshot.market || strategy.market
  };

  const decision = generateTradingDecision({
    strategy,
    portfolio: {
      ...portfolio,
      currentPositionShares: strategy.currentPositionShares
    },
    snapshot: marketSnapshot
  });

  const behaviorLog = createBehaviorLog({
    agentProfile,
    strategy,
    decision,
    timestamp
  });

  const behaviorLogPath = path.join(process.cwd(), "logs", `behavior-log-${suffix}.json`);
  await writeJsonFile(behaviorLogPath, behaviorLog);

  const preliminaryProof = createProofMetadata({
    agentProfileId: agentProfile.id,
    agentProfile: agentIdentityProfile,
    agentProfileHash,
    agentIdentityAnchor,
    strategy,
    marketSnapshot,
    behaviorLog,
    decision,
    chain: {
      name: "Injective",
      provider: chainProvider.constructor.name,
      txHash: "pending"
    },
    timestamp
  });

  const anchor = await chainProvider.anchorProof(preliminaryProof.proofHash, {
    agentProfileId: agentProfile.id,
    strategyId: strategy.strategyId,
    asset: strategy.asset,
    marketDataSource: marketSnapshot.source
  });

  const proofMetadata = createProofMetadata({
    agentProfileId: agentProfile.id,
    agentProfile: agentIdentityProfile,
    agentProfileHash,
    agentIdentityAnchor,
    strategy,
    marketSnapshot,
    behaviorLog,
    decision,
    chain: {
      name: "Injective",
      provider: chainProvider.constructor.name,
      txHash: anchor.txHash,
      explorerUrl: anchor.explorerUrl
    },
    timestamp
  });

  const verification = await verifyProofMetadata(proofMetadata);
  proofMetadata.verification = verification;

  const reportPath = path.join(process.cwd(), "reports", `trading-proof-${suffix}.json`);
  await writeJsonFile(reportPath, proofMetadata);

  return {
    agentProfileId: agentProfile.id,
    strategy,
    marketSnapshot,
    decision,
    proofMetadata,
    reportPath,
    behaviorLogPath
  };
}
