import { PackageCheck } from "lucide-react";
import type { ProofData } from "../types";
import { HashLine } from "./HashLine";

export function ProofPackageCard({ proof }: { proof: ProofData }) {
  return (
    <section className="panel">
      <div className="section-title">
        <PackageCheck size={20} />
        <h2>Proof Package</h2>
      </div>
      <HashLine label="Agent Profile Hash" value={proof.agentProfileHash} />
      <HashLine label="Strategy Hash" value={proof.strategyHash} />
      <HashLine label="Market Data Hash" value={proof.marketDataHash} />
      <HashLine label="Behavior Log Hash" value={proof.behaviorLogHash} />
      <HashLine label="Output Hash" value={proof.outputHash} />
      <HashLine label="Final Proof Hash" value={proof.proofHash} />
      <p className="note">The final proof hash commits to the agent identity, strategy, market data, behavior log, output, and timestamp.</p>
    </section>
  );
}
