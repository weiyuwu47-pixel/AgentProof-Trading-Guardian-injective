import { Fingerprint } from "lucide-react";
import type { AnchorReport, ProofData } from "../types";
import { HashLine } from "./HashLine";

export function AgentIdentityCard({ proof, anchor }: { proof: ProofData; anchor: AnchorReport }) {
  const profile = proof.agentProfile;

  return (
    <section className="panel">
      <div className="section-title">
        <Fingerprint size={20} />
        <h2>Agent Identity</h2>
      </div>
      <div className="detail-grid">
        <div><span>Agent ID</span><strong>{profile.agentProfileId}</strong></div>
        <div><span>Agent Name</span><strong>{profile.agentName}</strong></div>
        <div><span>Agent Type</span><strong>{profile.agentType}</strong></div>
        <div><span>Chain</span><strong>{profile.chain}</strong></div>
      </div>
      <HashLine label="Agent Profile Hash" value={proof.agentProfileHash} />
      <HashLine label="Profile Anchor Tx Hash" value={anchor.txHash} />
      <p className="note">Agent identity answers who this agent is. AgentProof verifies what this agent did.</p>
      <div className="tag-cloud">
        {profile.capabilities.map((capability) => (
          <span key={capability}>{capability}</span>
        ))}
      </div>
    </section>
  );
}
