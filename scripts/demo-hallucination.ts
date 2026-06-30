import path from "node:path";
import { loadAgentProfile } from "../src/identity/agentIdentity.js";
import {
  hashAgentIdentityProfile,
  loadAgentIdentityProfile,
  loadLatestAgentProfileAnchor
} from "../src/identity/agentProfile.js";
import { createBehaviorLog } from "../src/proof/behaviorLog.js";
import { createProofMetadata } from "../src/proof/proofMetadata.js";
import { verifyProofMetadata } from "../src/proof/verifyProof.js";
import { loadUserStrategy } from "../src/trading/strategyLoader.js";
import type { MarketSnapshot, TradingDecision } from "../src/trading/types.js";
import { readJsonFile, timestampForFile, writeJsonFile } from "../src/utils/fs.js";

const timestamp = new Date().toISOString();
const suffix = timestampForFile(new Date(timestamp));
const agentProfile = loadAgentProfile();
const agentIdentityProfile = await loadAgentIdentityProfile();
const agentProfileHash = hashAgentIdentityProfile(agentIdentityProfile);
const agentIdentityAnchor = await loadLatestAgentProfileAnchor();
const strategy = await loadUserStrategy();
const marketSnapshot = {
  ...(await readJsonFile<MarketSnapshot>(
    path.join(process.cwd(), "data", "trading", "market-snapshot.sample.json")
  )),
  timestamp,
  source: "sample" as const
};
const decision = await readJsonFile<TradingDecision>(
  path.join(process.cwd(), "data", "trading", "hallucinated-decision.sample.json")
);
const behaviorLog = createBehaviorLog({
  agentProfile,
  strategy,
  decision,
  timestamp
});

const behaviorLogPath = path.join(process.cwd(), "logs", `hallucination-behavior-log-${suffix}.json`);
await writeJsonFile(behaviorLogPath, behaviorLog);

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
    provider: "HallucinationNegativeCase",
    txHash: "not-anchored-negative-demo"
  },
  timestamp
});

const verification = await verifyProofMetadata(proofMetadata);
proofMetadata.verification = verification;

const reportPath = path.join(process.cwd(), "reports", `hallucination-proof-${suffix}.json`);
await writeJsonFile(reportPath, proofMetadata);

console.log("AgentProof Hallucination Demo");
console.log("");
console.log(`Asset: ${strategy.asset} / ${strategy.assetName}`);
console.log(`Recorded Market Price: ${marketSnapshot.price.toFixed(2)}`);
console.log(`Recorded Market High: ${(marketSnapshot.high ?? marketSnapshot.price).toFixed(2)}`);
console.log("Agent Claimed: price broke above 112.00 with strong volume");
console.log(`Decision: ${decision.action}`);
console.log("");
console.log(`Verification: ${verification.status}`);
console.log("Failure Reasons:");
for (const failure of verification.failures ?? []) {
  console.log(`- ${failure}`);
}
console.log("");
console.log("Expected Result: Verification FAILED");

const expectedFailures = [
  "hallucinated_market_data_detected",
  "claimed_breakout_not_supported_by_market_snapshot",
  "decision_violates_user_strategy"
];
const detected = expectedFailures.every((failure) => verification.failures?.includes(failure));

if (verification.status === "FAILED" && detected) {
  console.log("Demo Status: PASSED because hallucination was detected");
  console.log(`Proof Report: ${reportPath}`);
  console.log(`Behavior Log: ${behaviorLogPath}`);
} else {
  console.log("Demo Status: FAILED because hallucination was not detected as expected");
  process.exitCode = 1;
}
