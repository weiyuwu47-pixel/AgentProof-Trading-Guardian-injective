import { ScrollText } from "lucide-react";
import type { ProofData } from "../types";

export function BehaviorLogCard({ proof }: { proof: ProofData }) {
  return (
    <section className="panel">
      <div className="section-title">
        <ScrollText size={20} />
        <h2>Behavior Log</h2>
      </div>
      <div className="detail-grid">
        <div><span>Agent ID</span><strong>{proof.behaviorLog.agentProfileId}</strong></div>
        <div><span>Task</span><strong>{proof.behaviorLog.task}</strong></div>
        <div><span>Policy Result</span><strong>{proof.behaviorLog.policyResult}</strong></div>
        <div><span>Decision</span><strong>{proof.behaviorLog.decision}</strong></div>
        <div><span>Timestamp</span><strong>{proof.behaviorLog.timestamp}</strong></div>
      </div>
      <h3>Inputs Used</h3>
      <div className="tag-cloud">{proof.behaviorLog.inputsUsed.map((item) => <span key={item}>{item}</span>)}</div>
      <h3>Forbidden Inputs</h3>
      <div className="tag-cloud muted">{proof.behaviorLog.forbiddenInputs.map((item) => <span key={item}>{item}</span>)}</div>
    </section>
  );
}
