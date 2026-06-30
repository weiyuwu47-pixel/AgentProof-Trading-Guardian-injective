export type MarketDataSource = "real" | "sample";
export type TradingAction = "BUY" | "SELL" | "HOLD";
export type CheckStatus = "PASSED" | "FAILED" | "NOT_TRIGGERED";

export interface MarketSnapshot {
  symbol: string;
  assetName?: string;
  market: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  previousClose?: number;
  volume?: number;
  ma5?: number;
  ma10?: number;
  ma20?: number;
  timestamp: string;
  source: MarketDataSource;
}

export interface UserTradingStrategy {
  strategyId: string;
  asset: string;
  assetName: string;
  market: string;
  language: string;
  riskLevel: string;
  maxPositionShares: number;
  minBasePositionShares: number;
  currentPositionShares: number;
  rules: string[];
  forbiddenActions: string[];
  authorizedInputs: string[];
  forbiddenInputs: string[];
}

export interface Portfolio {
  asset: string;
  assetName?: string;
  currentPositionShares: number;
  cashAvailableCny?: number;
  updatedAt?: string;
}

export interface PolicyCheck {
  rule: string;
  status: CheckStatus;
  explanation: string;
}

export interface TradingDecision {
  action: TradingAction;
  quantity?: number;
  reason: string;
  evidence: string[];
  riskCheck: "PASSED" | "FAILED";
  policyChecks: PolicyCheck[];
}

export interface BehaviorLog {
  agentProfileId: string;
  task: "trading_decision_verification";
  authorizedInputs: string[];
  forbiddenInputs: string[];
  inputsUsed: string[];
  policyResult: "PASSED" | "FAILED";
  decision: TradingAction;
  timestamp: string;
}

export interface AgentIdentityProfile {
  agentProfileId: string;
  agentName: string;
  agentType: string;
  chain: string;
  version: string;
  ownerAddress: string;
  capabilities: string[];
  authorizedInputs: string[];
  forbiddenInputs: string[];
  serviceEndpoints: {
    demo: string;
    proofMetadata: string;
  };
  createdAt: string;
}

export interface AgentProfileAnchor {
  type: "AgentProfileAnchor";
  agentProfileId: string;
  agentProfileHash: string;
  memo: string;
  chain: string;
  provider: string;
  txHash: string;
  explorerUrl?: string;
  timestamp: string;
}

export interface AgentIdentitySummary {
  agentProfileId: string;
  agentProfileHash: string;
  profileAnchorTxHash?: string;
  profileAnchorMemo?: string;
  chain: string;
}

export interface ProofMetadata {
  project: "AgentProof Trading Guardian";
  agentProfileId: string;
  agentProfile: AgentIdentityProfile;
  agentProfileHash: string;
  agentIdentity: AgentIdentitySummary;
  agentIdentityAnchor?: AgentProfileAnchor;
  strategyHash: string;
  marketDataHash: string;
  behaviorLogHash: string;
  outputHash: string;
  proofHash: string;
  decision: Pick<TradingDecision, "action" | "reason" | "riskCheck"> & {
    quantity?: number;
    evidence: string[];
    policyChecks: PolicyCheck[];
  };
  strategy: UserTradingStrategy;
  marketSnapshot: MarketSnapshot;
  behaviorLog: BehaviorLog;
  authorizedInputs: string[];
  forbiddenInputs: string[];
  chain: {
    name: "Injective";
    provider: string;
    txHash: string;
    explorerUrl?: string;
  };
  verification: {
    status: "PASSED" | "FAILED";
    checks: string[];
    failures?: string[];
  };
  timestamp: string;
}
