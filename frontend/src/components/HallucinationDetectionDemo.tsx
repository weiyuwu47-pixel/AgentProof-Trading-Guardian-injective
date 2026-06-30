import { ScanSearch } from "lucide-react";
import type { ProofData } from "../types";

export function HallucinationDetectionDemo({ proof }: { proof: ProofData }) {
  return (
    <section className="panel wide">
      <div className="section-title">
        <ScanSearch size={20} />
        <h2>Hallucination Detection Demo</h2>
      </div>
      <div className="two-column">
        <div className="case-card normal">
          <h3>Normal Case</h3>
          <p><strong>Asset:</strong> {proof.strategy.asset} / {proof.strategy.assetName}</p>
          <p><strong>Decision:</strong> {proof.decision.action}</p>
          <p><strong>Verification:</strong> PASSED</p>
          <p><strong>Reason:</strong> Decision is consistent with recorded market data and strategy.</p>
        </div>
        <div className="case-card rejected">
          <h3>Hallucinated Case</h3>
          <p><strong>Asset:</strong> 600941 / 中国移动</p>
          <p><strong>Decision:</strong> BUY</p>
          <p><strong>Verification:</strong> REJECTED</p>
          <p><strong>Reason:</strong> Agent claimed price broke above 112.00, but recorded high was only 108.90.</p>
        </div>
      </div>
      <p className="note">
        AgentProof does not rely on the AI agent to self-report honesty. It verifies the output against recorded market data, user strategy, behavior log, and hashes.
      </p>
    </section>
  );
}
