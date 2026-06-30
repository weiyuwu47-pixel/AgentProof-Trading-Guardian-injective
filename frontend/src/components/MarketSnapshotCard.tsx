import { Activity } from "lucide-react";
import type { ProofData } from "../types";

const fields = ["price", "open", "high", "low", "previousClose", "volume", "ma5", "ma10", "ma20", "source", "timestamp"];

export function MarketSnapshotCard({ proof }: { proof: ProofData }) {
  return (
    <section className="panel">
      <div className="section-title">
        <Activity size={20} />
        <h2>Market Snapshot</h2>
      </div>
      <div className="metric-grid">
        {fields.map((field) => (
          <div key={field}>
            <span>{field}</span>
            <strong>{String(proof.marketSnapshot[field] ?? "N/A")}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
