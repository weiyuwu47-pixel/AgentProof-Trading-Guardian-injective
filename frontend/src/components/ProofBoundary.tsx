import { Shield, AlertTriangle } from "lucide-react";

export function ProofBoundary() {
  return (
    <section className="two-panel">
      <div className="panel">
        <div className="section-title">
          <Shield size={20} />
          <h2>What AgentProof Proves</h2>
        </div>
        <ul className="check-list">
          <li>The agent used the declared strategy</li>
          <li>The agent used recorded market data</li>
          <li>The agent respected position constraints</li>
          <li>The agent did not use forbidden inputs</li>
          <li>The decision output matches the proof hash</li>
          <li>The proof hash was anchored on Injective</li>
        </ul>
      </div>
      <div className="panel">
        <div className="section-title">
          <AlertTriangle size={20} />
          <h2>What It Does Not Prove</h2>
        </div>
        <ul className="check-list muted-list">
          <li>It does not prove the trade will be profitable</li>
          <li>It does not predict future market movement</li>
          <li>It does not replace human investment judgment</li>
          <li>It does not require exposing private keys or sensitive data</li>
        </ul>
      </div>
    </section>
  );
}
