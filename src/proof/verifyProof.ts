import { MockInjectiveProvider } from "../chain/MockInjectiveProvider.js";
import { hashStableJson } from "./hash.js";
import { createOutputForHash, createProofHash } from "./proofMetadata.js";
import type { ProofMetadata, TradingAction } from "../trading/types.js";

export interface VerificationResult {
  status: "PASSED" | "FAILED";
  checks: string[];
  failures?: string[];
}

function actionQuantity(action: TradingAction, quantity?: number): number {
  return action === "HOLD" ? 0 : quantity ?? 0;
}

function includesForbiddenInput(metadata: ProofMetadata): boolean {
  return metadata.behaviorLog.inputsUsed.some((input) =>
    metadata.forbiddenInputs.includes(input)
  );
}

function hasMarketDataReasoning(metadata: ProofMetadata): boolean {
  const reason = metadata.decision.reason.toLowerCase();
  const evidenceText = metadata.decision.evidence.join(" ").toLowerCase();
  const hasEvidence = metadata.decision.evidence.length > 0;
  const mentionsMarketData =
    reason.includes("price") ||
    reason.includes("volume") ||
    reason.includes("market data") ||
    evidenceText.includes("price=") ||
    evidenceText.includes("volume=");

  return hasEvidence && mentionsMarketData;
}

function extractClaimedBreakoutThreshold(metadata: ProofMetadata): number | undefined {
  const text = `${metadata.decision.reason} ${metadata.decision.evidence.join(" ")}`.toLowerCase();
  const match = text.match(/(?:above|breakout_above_|broke above|突破)\s*(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : undefined;
}

function hasRecordedVolumeEvidence(metadata: ProofMetadata): boolean {
  return metadata.decision.evidence.some((item) => item.toLowerCase().startsWith("volume="));
}

function detectMarketDataContradictions(metadata: ProofMetadata): string[] {
  const failures: string[] = [];
  const threshold = extractClaimedBreakoutThreshold(metadata);
  const recordedHigh = metadata.marketSnapshot.high ?? metadata.marketSnapshot.price;
  const text = `${metadata.decision.reason} ${metadata.decision.evidence.join(" ")}`.toLowerCase();

  if (metadata.decision.action === "BUY" && threshold !== undefined && recordedHigh < threshold) {
    failures.push("hallucinated_market_data_detected");
    failures.push("claimed_breakout_not_supported_by_market_snapshot");
  }

  if (metadata.decision.action === "BUY" && text.includes("strong volume") && !hasRecordedVolumeEvidence(metadata)) {
    failures.push("claimed_volume_not_supported_by_recorded_evidence");
  }

  if (
    metadata.decision.action === "BUY" &&
    metadata.strategy.rules.some((rule) => rule.includes("112.00")) &&
    recordedHigh < 112
  ) {
    failures.push("decision_violates_user_strategy");
  }

  return [...new Set(failures)];
}

export async function verifyProofMetadata(
  metadata: ProofMetadata,
  options: { verifyMockAnchor?: boolean } = {}
): Promise<VerificationResult> {
  const checks: string[] = [];
  const failures: string[] = [];

  const strategyHash = hashStableJson(metadata.strategy);
  const agentProfileHash = metadata.agentProfile ? hashStableJson(metadata.agentProfile) : "";
  if (agentProfileHash && agentProfileHash === metadata.agentProfileHash) {
    checks.push("agent_profile_hash_matched");
  } else {
    failures.push("agent_profile_hash_mismatch");
  }

  if (strategyHash === metadata.strategyHash) {
    checks.push("strategy_hash_matched");
  } else {
    failures.push("strategy_hash_mismatch");
  }

  const marketDataHash = hashStableJson(metadata.marketSnapshot);
  if (marketDataHash === metadata.marketDataHash) {
    checks.push("market_data_hash_matched");
  } else {
    failures.push("market_data_hash_mismatch");
  }

  const behaviorLogHash = hashStableJson(metadata.behaviorLog);
  if (behaviorLogHash === metadata.behaviorLogHash) {
    checks.push("behavior_log_hash_matched");
  } else {
    failures.push("behavior_log_hash_mismatch");
  }

  const outputHash = hashStableJson(
    createOutputForHash({
      action: metadata.decision.action,
      quantity: metadata.decision.quantity,
      reason: metadata.decision.reason,
      evidence: metadata.decision.evidence,
      riskCheck: metadata.decision.riskCheck,
      policyChecks: metadata.decision.policyChecks
    })
  );
  if (outputHash === metadata.outputHash) {
    checks.push("output_hash_matched");
  } else {
    failures.push("output_hash_mismatch");
  }

  const proofHash = createProofHash({
    agentProfileId: metadata.agentProfileId,
    agentProfileHash: metadata.agentProfileHash,
    strategyHash,
    marketDataHash,
    behaviorLogHash,
    outputHash,
    timestamp: metadata.timestamp
  });
  if (proofHash === metadata.proofHash) {
    checks.push("final_proof_hash_matched");
  } else {
    failures.push("final_proof_hash_mismatch");
  }

  const quantity = actionQuantity(metadata.decision.action, metadata.decision.quantity);
  const currentPosition = metadata.strategy.currentPositionShares;
  const projectedPosition =
    metadata.decision.action === "BUY"
      ? currentPosition + quantity
      : metadata.decision.action === "SELL"
        ? currentPosition - quantity
        : currentPosition;

  if (projectedPosition <= metadata.strategy.maxPositionShares) {
    checks.push("max_position_constraint_respected");
  } else {
    failures.push("max_position_constraint_violated");
  }

  if (projectedPosition >= metadata.strategy.minBasePositionShares) {
    checks.push("min_base_position_constraint_respected");
  } else {
    failures.push("min_base_position_constraint_violated");
  }

  if (!includesForbiddenInput(metadata)) {
    checks.push("forbidden_inputs_not_used");
  } else {
    failures.push("forbidden_inputs_used");
  }

  if (hasMarketDataReasoning(metadata)) {
    checks.push("recommendation_contains_market_data_reasoning");
  } else {
    failures.push("missing_market_data_reasoning");
  }

  if (metadata.marketSnapshot.source === "real" || metadata.marketSnapshot.source === "sample") {
    checks.push("market_data_source_recorded");
  } else {
    failures.push("market_data_source_missing");
  }

  if (metadata.agentProfileId && metadata.behaviorLog.agentProfileId === metadata.agentProfileId) {
    checks.push("agent_profile_id_recorded");
  } else {
    failures.push("agent_profile_id_missing_or_mismatched");
  }

  if (metadata.agentIdentity?.agentProfileHash === metadata.agentProfileHash) {
    checks.push("agent_identity_recorded");
  } else {
    failures.push("agent_identity_missing_or_mismatched");
  }

  if (metadata.decision.riskCheck === "PASSED") {
    checks.push("risk_rules_passed");
  } else {
    failures.push("risk_check_failed");
  }

  const contradictionFailures = detectMarketDataContradictions(metadata);
  if (contradictionFailures.length === 0) {
    checks.push("market_claims_consistent_with_snapshot");
  } else {
    failures.push(...contradictionFailures);
  }

  if (options.verifyMockAnchor && metadata.chain.provider === "MockInjectiveProvider") {
    try {
      const anchor = await new MockInjectiveProvider().readProof(metadata.chain.txHash);
      if (anchor.proofHash === metadata.proofHash) {
        checks.push("mock_injective_anchor_matched");
      } else {
        failures.push("mock_injective_anchor_mismatch");
      }
    } catch (error) {
      failures.push(
        `mock_injective_anchor_read_failed:${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return failures.length === 0
    ? { status: "PASSED", checks }
    : { status: "FAILED", checks, failures };
}
