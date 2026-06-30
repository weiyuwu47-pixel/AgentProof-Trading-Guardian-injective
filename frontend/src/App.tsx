import proof from "./data/latest-proof.json";
import decisionAnchor from "./data/latest-anchor.json";
import agentAnchor from "./data/latest-agent-profile-anchor.json";
import type { AnchorReport, ProofData } from "./types";
import { AgentIdentityCard } from "./components/AgentIdentityCard";
import { ArchitectureFlow } from "./components/ArchitectureFlow";
import { BehaviorLogCard } from "./components/BehaviorLogCard";
import { Hero } from "./components/Hero";
import { HallucinationDetectionDemo } from "./components/HallucinationDetectionDemo";
import { InjectiveAnchorCard } from "./components/InjectiveAnchorCard";
import { MarketSnapshotCard } from "./components/MarketSnapshotCard";
import { MultiAgentRoadmap } from "./components/MultiAgentRoadmap";
import { ProofBoundary } from "./components/ProofBoundary";
import { ProofPackageCard } from "./components/ProofPackageCard";
import { ProofSummary } from "./components/ProofSummary";
import { StrategyCard } from "./components/StrategyCard";
import { TradingDecisionCard } from "./components/TradingDecisionCard";
import { UserAlertPreview } from "./components/UserAlertPreview";
import { VerificationChecklist } from "./components/VerificationChecklist";

function App() {
  const proofData = proof as ProofData;
  const decisionAnchorData = decisionAnchor as AnchorReport;
  const agentAnchorData = agentAnchor as AnchorReport;

  return (
    <main>
      <Hero proof={proofData} decisionAnchor={decisionAnchorData} agentAnchor={agentAnchorData} />
      <div className="dashboard-grid">
        <AgentIdentityCard proof={proofData} anchor={agentAnchorData} />
        <ProofSummary proof={proofData} anchor={decisionAnchorData} />
        <TradingDecisionCard proof={proofData} />
        <UserAlertPreview proof={proofData} anchor={decisionAnchorData} />
        <StrategyCard proof={proofData} />
        <MarketSnapshotCard proof={proofData} />
        <BehaviorLogCard proof={proofData} />
        <ProofPackageCard proof={proofData} />
        <VerificationChecklist proof={proofData} decisionAnchor={decisionAnchorData} agentAnchor={agentAnchorData} />
        <InjectiveAnchorCard decisionAnchor={decisionAnchorData} agentAnchor={agentAnchorData} />
        <HallucinationDetectionDemo proof={proofData} />
        <MultiAgentRoadmap />
        <ArchitectureFlow />
      </div>
      <ProofBoundary />
    </main>
  );
}

export default App;
