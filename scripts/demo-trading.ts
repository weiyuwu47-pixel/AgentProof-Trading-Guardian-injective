import "dotenv/config";
import { runTradingGuardianDemo } from "../src/trading/tradingGuardian.js";

function line(label: string, value: string | number | undefined): void {
  if (value !== undefined) {
    console.log(`${label}: ${value}`);
  }
}

console.log("AgentProof Trading Guardian Demo");
console.log("");
console.log("[1] Load Agent Profile");
console.log("[2] Load User Trading Strategy");
console.log("[3] Fetch Real Market Data");
console.log("[4] Build Market Snapshot");
console.log("[5] Evaluate Strategy and Risk Rules");
console.log("[6] Generate Trading Recommendation");
console.log("[7] Create Behavior Log");
console.log("[8] Generate Proof Metadata");
console.log("[9] Anchor Proof Hash using MockInjectiveProvider");
console.log("[10] Verify Proof");
console.log("[11] Print Final Result");
console.log("");

const result = await runTradingGuardianDemo();

line("Agent", result.agentProfileId);
line("Asset", `${result.strategy.asset} / ${result.strategy.assetName}`);
line("Market Data Source", result.marketSnapshot.source);
line("Decision", result.decision.action);
line("Quantity", result.decision.quantity);
line("Reason", result.decision.reason);
console.log("");
line("Proof Hash", result.proofMetadata.proofHash);
line("Mock Injective Tx Hash", result.proofMetadata.chain.txHash);
line("Verification", result.proofMetadata.verification.status);
console.log("");
line("Behavior Log", result.behaviorLogPath);
line("Proof Report", result.reportPath);
console.log("");
console.log(
  "The agent used authorized market data, followed the user strategy, respected risk limits, and generated a verifiable trading decision."
);
console.log(
  "Current demo uses MockInjectiveProvider by default. Set USE_REAL_INJECTIVE=true for real Injective testnet memo anchoring."
);
