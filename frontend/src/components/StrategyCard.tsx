import { ListChecks } from "lucide-react";
import type { ProofData } from "../types";

const strategyHighlights = [
  "MA5 / MA10 下方不追涨",
  "只有放量突破 112.00 才允许 BUY",
  "跌破 106.00 才允许 SELL",
  "保留底仓，不允许清仓",
  "没有明确信号时 HOLD"
];

export function StrategyCard({ proof }: { proof: ProofData }) {
  return (
    <section className="panel">
      <div className="section-title">
        <ListChecks size={20} />
        <h2>User Strategy</h2>
      </div>
      <ul className="check-list">
        {strategyHighlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="detail-grid compact">
        <div><span>Max Position</span><strong>{proof.strategy.maxPositionShares}</strong></div>
        <div><span>Minimum Base Position</span><strong>{proof.strategy.minBasePositionShares}</strong></div>
        <div><span>Current Position</span><strong>{proof.strategy.currentPositionShares}</strong></div>
        <div><span>Risk Level</span><strong>{proof.strategy.riskLevel}</strong></div>
      </div>
    </section>
  );
}
