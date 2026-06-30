import path from "node:path";
import dotenv from "dotenv";
import { latestJsonFile, readJsonFile, writeJsonFile } from "../src/utils/fs.js";
import { MockInjectiveProvider } from "../src/chain/MockInjectiveProvider.js";
import { InjectiveProvider, buildInjectiveMemo } from "../src/chain/InjectiveProvider.js";
import type { ProofMetadata } from "../src/trading/types.js";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config({ path: path.join(process.cwd(), ".env") });

const proofPath = await latestJsonFile(path.join(process.cwd(), "reports"), "trading-proof-");
const proof = await readJsonFile<ProofMetadata>(proofPath);
const useRealInjective = process.env.USE_REAL_INJECTIVE?.toLowerCase() === "true";
const provider = useRealInjective ? new InjectiveProvider() : new MockInjectiveProvider();
const anchor = await provider.anchorProof(proof.proofHash, {
  agentProfileId: proof.agentProfileId,
  strategyId: proof.strategy.strategyId,
  asset: proof.strategy.asset,
  sourceReport: proofPath
});

proof.chain = {
  name: "Injective",
  provider: provider.constructor.name,
  txHash: anchor.txHash,
  explorerUrl: anchor.explorerUrl
};
await writeJsonFile(proofPath, proof);

console.log("AgentProof Trading Guardian Anchor");
console.log("");

if (useRealInjective) {
  console.log("Using InjectiveProvider: real testnet memo anchoring");
  console.log(`Proof Hash: ${proof.proofHash}`);
  console.log(`Memo: ${buildInjectiveMemo(proof.proofHash)}`);
  console.log(`Real Injective Tx Hash: ${anchor.txHash}`);
  console.log(`Explorer URL: ${anchor.explorerUrl ?? "unavailable"}`);
  console.log("Anchor Status: PASSED");
} else {
  console.log("Using MockInjectiveProvider");
  console.log(`Proof Hash: ${proof.proofHash}`);
  console.log(`Mock Injective Tx Hash: ${anchor.txHash}`);
  console.log("Anchor Status: PASSED");
}
