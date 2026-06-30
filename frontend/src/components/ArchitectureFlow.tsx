import { Workflow } from "lucide-react";

const steps = [
  "User Strategy",
  "Market Data Provider",
  "Trading Guardian Agent",
  "Policy Evaluator",
  "Trading Decision",
  "Behavior Log",
  "Proof Metadata",
  "Proof Hash",
  "Injective Anchor",
  "Verifier"
];

export function ArchitectureFlow() {
  return (
    <section className="panel wide">
      <div className="section-title">
        <Workflow size={20} />
        <h2>Architecture Flow</h2>
      </div>
      <div className="architecture-flow">
        {steps.map((step) => <span key={step}>{step}</span>)}
      </div>
    </section>
  );
}
