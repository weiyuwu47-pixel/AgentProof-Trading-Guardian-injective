import { Copy } from "lucide-react";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  return (
    <button
      className="icon-button"
      type="button"
      aria-label={label}
      title={label}
      onClick={() => navigator.clipboard.writeText(value)}
    >
      <Copy size={16} />
    </button>
  );
}
