import { CheckCircle2 } from "lucide-react";
import type { AnchorReport, ProofData } from "../types";

const requiredChecks = [
  "strategy_hash_matched",
  "market_data_hash_matched",
  "behavior_log_hash_matched",
  "output_hash_matched",
  "final_proof_hash_matched",
  "risk_rules_passed",
  "forbidden_inputs_not_used"
];

export function VerificationChecklist({
  proof,
  decisionAnchor,
  agentAnchor
}: {
  proof: ProofData;
  decisionAnchor: AnchorReport;
  agentAnchor: AnchorReport;
}) {
  const checks = [
    ...requiredChecks.map((check) => ({
      label: check.replace(/_/g, " "),
      passed: proof.verification.checks.includes(check)
    })),
    {
      label: "proof hash anchored on Injective testnet",
      passed: Boolean(decisionAnchor.txHash)
    },
    {
      label: "agent profile anchored on Injective testnet",
      passed: Boolean(agentAnchor.txHash)
    }
  ];

  return (
    <section className="panel">
      <div className="section-title">
        <CheckCircle2 size={20} />
        <h2>Verification Checklist</h2>
      </div>
      <ul className="verification-list">
        {checks.map((check) => (
          <li key={check.label} className={check.passed ? "passed" : "pending"}>
            <CheckCircle2 size={16} />
            <span>{check.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
