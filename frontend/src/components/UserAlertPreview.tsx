import { BellRing, X } from "lucide-react";
import { useState } from "react";
import type { AnchorReport, ProofData } from "../types";

export function UserAlertPreview({ proof, anchor }: { proof: ProofData; anchor: AnchorReport }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="panel">
      <div className="section-title">
        <BellRing size={20} />
        <h2>User Alert Preview</h2>
      </div>
      <p className="note">A verified trading alert is ready for the user.</p>
      <div className="detail-grid compact">
        <div><span>Asset</span><strong>{proof.strategy.asset} / {proof.strategy.assetName}</strong></div>
        <div><span>Decision</span><strong>{proof.decision.action}</strong></div>
        <div><span>Verification</span><strong>{proof.verification.status}</strong></div>
        <div><span>Proof</span><strong>Anchored on Injective Testnet</strong></div>
      </div>
      <button className="primary-action" type="button" onClick={() => setOpen(true)}>
        Show User Alert
      </button>

      {open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="verified-alert-title">
          <div className="modal">
            <button className="modal-close" type="button" aria-label="Close alert" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
            <div className="section-title">
              <BellRing size={20} />
              <h2 id="verified-alert-title">Verified Trading Alert</h2>
            </div>
            <p className="reason">AgentProof Trading Guardian has generated a verified trading decision.</p>
            <div className="alert-summary">
              <span>Asset: {proof.strategy.asset} / {proof.strategy.assetName}</span>
              <span>Decision: {proof.decision.action}</span>
              <span>Verification: {proof.verification.status}</span>
              <span>Proof: Anchored on Injective Testnet</span>
            </div>
            <p className="note">
              This is not just a trading reminder. It is a verified alert backed by a proof hash and an Injective testnet anchor.
            </p>
            <p className="note">
              In production, this verified alert can be pushed to WeChat, Telegram, email, or wallet notifications.
            </p>
            <a className="primary-link" href={anchor.explorerUrl} target="_blank" rel="noreferrer">
              Open proof anchor
            </a>
            <button className="primary-action secondary" type="button" onClick={() => setOpen(false)}>
              Close and continue demo
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
