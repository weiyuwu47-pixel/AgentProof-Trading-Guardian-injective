import { ShieldCheck } from "lucide-react";
import type { AnchorReport, ProofData } from "../types";
import { HashLine } from "./HashLine";

export function ProofSummary({ proof, anchor }: { proof: ProofData; anchor: AnchorReport }) {
  return (
    <section className="panel proof-summary">
      <div className="section-title">
        <ShieldCheck size={20} />
        <h2>Live Proof Summary</h2>
      </div>
      <div className="status-strip">
        <span>Proof Status: VERIFIED</span>
        <span>Chain: Injective Testnet</span>
        <span>Verification: {proof.verification.status}</span>
      </div>
      <HashLine label="Proof Hash" value={proof.proofHash} />
      <HashLine label="Memo" value={anchor.memo} />
      <HashLine label="Tx Hash" value={anchor.txHash} />
      {anchor.explorerUrl ? (
        <a className="primary-link" href={anchor.explorerUrl} target="_blank" rel="noreferrer">
          Open Injective Explorer
        </a>
      ) : null}
    </section>
  );
}
