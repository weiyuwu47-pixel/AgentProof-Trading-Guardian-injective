import { CopyButton } from "./CopyButton";

export function HashLine({ label, value }: { label: string; value?: string }) {
  return (
    <div className="hash-line">
      <span>{label}</span>
      <code>{value ?? "not recorded"}</code>
      {value ? <CopyButton value={value} label={`Copy ${label}`} /> : null}
    </div>
  );
}
