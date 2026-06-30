import path from "node:path";
import { latestJsonFile, readJsonFile, writeJsonFile } from "../src/utils/fs.js";
import { verifyProofMetadata } from "../src/proof/verifyProof.js";
import type { ProofMetadata } from "../src/trading/types.js";

const reportsDir = path.join(process.cwd(), "reports");
const proofPath = await latestJsonFile(reportsDir, "trading-proof-");
const proof = await readJsonFile<ProofMetadata>(proofPath);
const verification = await verifyProofMetadata(proof, { verifyMockAnchor: true });

proof.verification = verification;
await writeJsonFile(proofPath, proof);

console.log("AgentProof Trading Guardian Verification");
console.log("");
console.log(`Proof Report: ${proofPath}`);
console.log(`Proof Hash: ${proof.proofHash}`);
console.log(`Status: ${verification.status}`);
console.log("");

if (verification.status === "PASSED") {
  console.log("Verification PASSED");
  console.log("");
  for (const check of verification.checks) {
    console.log(`- ${check}`);
  }
} else {
  console.log("Verification FAILED");
  console.log("");
  for (const failure of verification.failures ?? []) {
    console.log(`- ${failure}`);
  }
}
