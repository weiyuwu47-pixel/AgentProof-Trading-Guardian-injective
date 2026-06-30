import { RadioTower } from "lucide-react";
import type { AnchorReport } from "../types";
import { HashLine } from "./HashLine";

export function InjectiveAnchorCard({
  decisionAnchor,
  agentAnchor
}: {
  decisionAnchor: AnchorReport;
  agentAnchor: AnchorReport;
}) {
  return (
    <section className="panel wide">
      <div className="section-title">
        <RadioTower size={20} />
        <h2>Injective Anchors</h2>
      </div>
      <div className="two-column">
        <div>
          <h3>Agent Profile Anchor</h3>
          <HashLine label="Memo" value={agentAnchor.memo} />
          <HashLine label="Tx Hash" value={agentAnchor.txHash} />
          {agentAnchor.explorerUrl ? <a className="primary-link" href={agentAnchor.explorerUrl} target="_blank" rel="noreferrer">Open Agent Anchor</a> : null}
        </div>
        <div>
          <h3>Decision Proof Anchor</h3>
          <HashLine label="Memo" value={decisionAnchor.memo} />
          <HashLine label="Tx Hash" value={decisionAnchor.txHash} />
          {decisionAnchor.explorerUrl ? <a className="primary-link" href={decisionAnchor.explorerUrl} target="_blank" rel="noreferrer">Open Decision Anchor</a> : null}
        </div>
      </div>
    </section>
  );
}
