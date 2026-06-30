import { Network } from "lucide-react";

export function MultiAgentRoadmap() {
  const agents = [
    "Market Data Agent provides market snapshots",
    "Strategy Agent provides user policy",
    "Risk Guardian Agent checks position and exposure limits",
    "Portfolio Agent allocates assets",
    "Execution Agent submits on-chain transactions",
    "Audit Agent verifies the full decision chain"
  ];

  return (
    <section className="panel wide">
      <div className="section-title">
        <Network size={20} />
        <h2>From Single Agent Proof to Multi-Agent Financial Workflows</h2>
      </div>
      <p className="note">Today, AgentProof verifies one Trading Guardian Agent.</p>
      <ul className="check-list">
        {agents.map((agent) => <li key={agent}>{agent}</li>)}
      </ul>
      <p className="note">Each agent can have an on-chain identity. Each handoff can be hashed. The final proof can be anchored on Injective.</p>
      <div className="flow-row">
        <span>Market Data Agent<br /><code>marketDataHash</code></span>
        <span>Strategy Agent<br /><code>strategyHash</code></span>
        <span>Risk Guardian<br /><code>riskCheckHash</code></span>
        <span>Trading Guardian<br /><code>outputHash</code></span>
        <strong>Final AgentProof Hash</strong>
        <strong>Injective</strong>
      </div>
    </section>
  );
}
