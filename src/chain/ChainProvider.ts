export interface ChainProvider {
  anchorProof(
    proofHash: string,
    metadata?: Record<string, unknown>
  ): Promise<{
    chain: string;
    txHash: string;
    explorerUrl?: string;
  }>;

  readProof(txHash: string): Promise<{
    proofHash: string;
    metadata?: Record<string, unknown>;
  }>;
}
