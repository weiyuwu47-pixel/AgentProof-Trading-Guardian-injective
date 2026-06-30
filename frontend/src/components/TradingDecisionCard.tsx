import { LineChart } from "lucide-react";
import type { ProofData } from "../types";

export function TradingDecisionCard({ proof }: { proof: ProofData }) {
  return (
    <section className="panel">
      <div className="section-title">
        <LineChart size={20} />
        <h2>Trading Decision</h2>
      </div>
      <div className="decision-banner">
        <span>{proof.decision.action}</span>
        <strong>{proof.decision.riskCheck}</strong>
      </div>
      <div className="detail-grid">
        <div><span>Asset</span><strong>{proof.strategy.asset} / {proof.strategy.assetName}</strong></div>
        <div><span>Market</span><strong>{proof.strategy.market}</strong></div>
        <div><span>Quantity</span><strong>{proof.decision.quantity ?? "N/A"}</strong></div>
        <div><span>Market Data Source</span><strong>{String(proof.marketSnapshot.source)}</strong></div>
        <div><span>Timestamp</span><strong>{proof.timestamp}</strong></div>
      </div>
      <p className="reason">{proof.decision.reason}</p>
      <p className="note">
        This demo uses a stock monitoring scenario as the real-world decision case. The same proof layer can be applied to Injective-native trading agents, wallet agents, portfolio agents, and execution agents.
      </p>
    </section>
  );
}
