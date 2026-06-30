import dotenv from "dotenv";
import path from "node:path";
import { InjectiveProvider } from "../src/chain/InjectiveProvider.js";
import { MockInjectiveProvider } from "../src/chain/MockInjectiveProvider.js";
import {
  buildAgentProfileMemo,
  hashAgentIdentityProfile,
  loadAgentIdentityProfile,
  type AgentProfileAnchor
} from "../src/identity/agentProfile.js";
import { timestampForFile, writeJsonFile } from "../src/utils/fs.js";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config({ path: path.join(process.cwd(), ".env") });

const profile = await loadAgentIdentityProfile();
const agentProfileHash = hashAgentIdentityProfile(profile);
const memo = buildAgentProfileMemo(profile.agentProfileId, agentProfileHash);
const useRealInjective = process.env.USE_REAL_INJECTIVE?.toLowerCase() === "true";
const provider = useRealInjective ? new InjectiveProvider() : new MockInjectiveProvider();

const anchor = await provider.anchorProof(agentProfileHash, {
  anchorType: "AgentProfileAnchor",
  agentProfileId: profile.agentProfileId,
  memo
});

const timestamp = new Date().toISOString();
const report: AgentProfileAnchor = {
  type: "AgentProfileAnchor",
  agentProfileId: profile.agentProfileId,
  agentProfileHash,
  memo,
  chain: useRealInjective ? "Injective Testnet" : "Injective Testnet",
  provider: provider.constructor.name,
  txHash: anchor.txHash,
  explorerUrl: anchor.explorerUrl,
  timestamp
};

const reportPath = path.join(
  process.cwd(),
  "reports",
  `agent-profile-anchor-${timestampForFile(new Date(timestamp))}.json`
);
await writeJsonFile(reportPath, report);

console.log("AgentProof Agent Identity Registration");
console.log("");
console.log(useRealInjective ? "Using InjectiveProvider: real testnet memo anchoring" : "Using MockInjectiveProvider");
console.log(`Agent ID: ${profile.agentProfileId}`);
console.log(`Agent Profile Hash: ${agentProfileHash}`);
console.log(`Memo: ${memo}`);
console.log(useRealInjective ? `Real Injective Tx Hash: ${anchor.txHash}` : `Mock Injective Tx Hash: ${anchor.txHash}`);
if (anchor.explorerUrl) {
  console.log(`Explorer URL: ${anchor.explorerUrl}`);
}
console.log(`Report: ${reportPath}`);
console.log("Registration Status: PASSED");
