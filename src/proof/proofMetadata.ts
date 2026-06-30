import { hashStableJson } from "./hash.js";
import type {
  BehaviorLog,
  AgentIdentityProfile,
  AgentProfileAnchor,
  MarketSnapshot,
  ProofMetadata,
  TradingDecision,
  UserTradingStrategy
} from "../trading/types.js";

export function createOutputForHash(decision: TradingDecision): unknown {
  return {
    action: decision.action,
    quantity: decision.quantity,
    reason: decision.reason,
    evidence: decision.evidence,
    riskCheck: decision.riskCheck,
    policyChecks: decision.policyChecks
  };
}

export function createProofHash(params: {
  agentProfileId: string;
  agentProfileHash?: string;
  strategyHash: string;
  marketDataHash: string;
  behaviorLogHash: string;
  outputHash: string;
  timestamp: string;
}): string {
  return hashStableJson({
    agentProfileId: params.agentProfileId,
    agentProfileHash: params.agentProfileHash,
    strategyHash: params.strategyHash,
    marketDataHash: params.marketDataHash,
    behaviorLogHash: params.behaviorLogHash,
    outputHash: params.outputHash,
    timestamp: params.timestamp
  });
}

export function createProofMetadata(params: {
  agentProfileId: string;
  agentProfile: AgentIdentityProfile;
  agentProfileHash: string;
  agentIdentityAnchor?: AgentProfileAnchor;
  strategy: UserTradingStrategy;
  marketSnapshot: MarketSnapshot;
  behaviorLog: BehaviorLog;
  decision: TradingDecision;
  chain: ProofMetadata["chain"];
  timestamp: string;
}): ProofMetadata {
  const strategyHash = hashStableJson(params.strategy);
  const marketDataHash = hashStableJson(params.marketSnapshot);
  const behaviorLogHash = hashStableJson(params.behaviorLog);
  const outputHash = hashStableJson(createOutputForHash(params.decision));
  const proofHash = createProofHash({
    agentProfileId: params.agentProfileId,
    agentProfileHash: params.agentProfileHash,
    strategyHash,
    marketDataHash,
    behaviorLogHash,
    outputHash,
    timestamp: params.timestamp
  });

  return {
    project: "AgentProof Trading Guardian",
    agentProfileId: params.agentProfileId,
    agentProfile: params.agentProfile,
    agentProfileHash: params.agentProfileHash,
    agentIdentity: {
      agentProfileId: params.agentProfile.agentProfileId,
      agentProfileHash: params.agentProfileHash,
      profileAnchorTxHash: params.agentIdentityAnchor?.txHash,
      profileAnchorMemo: params.agentIdentityAnchor?.memo,
      chain: params.agentIdentityAnchor?.chain ?? params.agentProfile.chain
    },
    agentIdentityAnchor: params.agentIdentityAnchor,
    strategyHash,
    marketDataHash,
    behaviorLogHash,
    outputHash,
    proofHash,
    decision: {
      action: params.decision.action,
      quantity: params.decision.quantity,
      reason: params.decision.reason,
      evidence: params.decision.evidence,
      riskCheck: params.decision.riskCheck,
      policyChecks: params.decision.policyChecks
    },
    strategy: params.strategy,
    marketSnapshot: params.marketSnapshot,
    behaviorLog: params.behaviorLog,
    authorizedInputs: params.strategy.authorizedInputs,
    forbiddenInputs: params.strategy.forbiddenInputs,
    chain: params.chain,
    verification: {
      status: "FAILED",
      checks: [],
      failures: ["verification_not_run"]
    },
    timestamp: params.timestamp
  };
}
