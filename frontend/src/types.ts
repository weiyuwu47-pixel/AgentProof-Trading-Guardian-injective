export interface AgentProfile {
  agentProfileId: string;
  agentName: string;
  agentType: string;
  chain: string;
  version: string;
  ownerAddress?: string;
  capabilities: string[];
  authorizedInputs: string[];
  forbiddenInputs: string[];
}

export interface AnchorReport {
  type?: string;
  agentProfileId?: string;
  agentProfileHash?: string;
  memo: string;
  chain: string;
  provider: string;
  txHash: string;
  explorerUrl?: string;
  proofHash?: string;
  timestamp: string;
}

export interface ProofData {
  project: string;
  agentProfileId: string;
  agentProfile: AgentProfile;
  agentProfileHash: string;
  agentIdentity: {
    agentProfileId: string;
    agentProfileHash: string;
    profileAnchorTxHash?: string;
    profileAnchorMemo?: string;
    chain: string;
  };
  strategyHash: string;
  marketDataHash: string;
  behaviorLogHash: string;
  outputHash: string;
  proofHash: string;
  decision: {
    action: "BUY" | "SELL" | "HOLD";
    quantity?: number;
    reason: string;
    evidence: string[];
    riskCheck: "PASSED" | "FAILED";
    policyChecks: Array<{
      rule: string;
      status: string;
      explanation: string;
    }>;
  };
  strategy: {
    asset: string;
    assetName: string;
    market: string;
    riskLevel: string;
    maxPositionShares: number;
    minBasePositionShares: number;
    currentPositionShares: number;
    rules: string[];
    authorizedInputs: string[];
    forbiddenInputs: string[];
  };
  marketSnapshot: Record<string, string | number | undefined>;
  behaviorLog: {
    agentProfileId: string;
    task: string;
    authorizedInputs: string[];
    forbiddenInputs: string[];
    inputsUsed: string[];
    policyResult: string;
    decision: string;
    timestamp: string;
  };
  chain: {
    name: string;
    provider: string;
    txHash: string;
    explorerUrl?: string;
  };
  verification: {
    status: "PASSED" | "FAILED";
    checks: string[];
  };
  timestamp: string;
}
