import { ShieldCheck, RadioTower, Fingerprint, CheckCircle2 } from "lucide-react";
import type { AnchorReport, ProofData } from "../types";
import { CopyButton } from "./CopyButton";

export function Hero({
  proof,
  decisionAnchor,
  agentAnchor
}: {
  proof: ProofData;
  decisionAnchor: AnchorReport;
  agentAnchor: AnchorReport;
}) {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="eyebrow">
          <ShieldCheck size={18} />
          AI Agent Audit Dashboard
        </div>
        <h1>AgentProof Trading Guardian</h1>
        <p className="subtitle">Verifiable Decision Layer for AI Financial Agents on Injective</p>
        <p className="hero-copy">
          AI trading agents can monitor markets and generate recommendations, but users need proof that the agent followed their strategy, used authorized market data, respected risk limits, and anchored the decision proof on Injective.
        </p>
        <div className="badge-row">
          <span><Fingerprint size={14} /> Agent Identity Anchored</span>
          <span><RadioTower size={14} /> Real Market Data</span>
          <span><CheckCircle2 size={14} /> Policy Checked</span>
          <span><ShieldCheck size={14} /> Proof Verified</span>
          <span><RadioTower size={14} /> Anchored on Injective Testnet</span>
        </div>
      </div>
      <div className="hero-proof">
        <div className="status-pill">Verification Passed</div>
        <div className="hero-metric">
          <span>Agent Profile Tx</span>
          <code>{agentAnchor.txHash}</code>
          <CopyButton value={agentAnchor.txHash} label="Copy agent profile tx hash" />
        </div>
        <div className="hero-metric">
          <span>Proof Hash</span>
          <code>{proof.proofHash}</code>
          <CopyButton value={proof.proofHash} label="Copy proof hash" />
        </div>
        <div className="hero-metric">
          <span>Decision Tx</span>
          <code>{decisionAnchor.txHash}</code>
          <CopyButton value={decisionAnchor.txHash} label="Copy decision tx hash" />
        </div>
      </div>
    </section>
  );
}
