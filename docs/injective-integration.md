# Injective Integration

Current status: MockInjectiveProvider is implemented for the default hackathon demo. InjectiveProvider is implemented for real Injective testnet transaction memo anchoring behind `USE_REAL_INJECTIVE=true`.

The default CLI demo does not pretend to submit a real Injective transaction. It writes the proof hash to `reports/mock-injective-anchor.json` and returns a mock tx hash so the proof flow can be recorded reliably.

When `USE_REAL_INJECTIVE=true`, `npm run anchor:injective` reads the latest proof report, builds a memo in the form `AgentProof:<proofHash>`, sends a minimal Injective testnet self-transfer with that memo, and writes `reports/injective-anchor-<timestamp>.json`.

## Option A: Injective Transaction Memo Anchoring

Put `proofHash` in an Injective transaction memo.

Flow:

1. Generate local proof metadata.
2. Compute the final `proofHash`.
3. Submit a small Injective testnet transaction with the `proofHash` in the transaction memo.
4. Use the Injective tx hash as the proof anchor.
5. Verifier reads the transaction memo and compares the on-chain `proofHash` with local proof metadata.

Verification:

- Read the transaction by tx hash.
- Extract the memo field.
- Compare memo proof hash with `reports/trading-proof-*.json`.
- Recompute local hashes for strategy, market data, behavior log, output, and final proof.

This path is implemented for testnet memo anchoring and does not require a custom contract.

## Option B: Proof Registry Contract

Deploy a proof registry contract later.

The registry can store:

- Proof hash.
- Agent ID.
- Timestamp.
- Metadata URI.
- Optional market or asset identifier.

Flow:

1. Generate local proof metadata.
2. Upload metadata to a storage provider.
3. Call the proof registry contract with `proofHash`, `agentId`, `timestamp`, and `metadataURI`.
4. Verifier queries the registry and checks all local hashes.

This path is better for a production-grade proof network because it supports richer indexing and agent-level history.

## Provider Abstraction

The code uses:

```ts
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
```

`MockInjectiveProvider` implements the default local anchor. `InjectiveProvider` implements real Injective testnet memo anchoring behind environment variables such as:

```text
USE_REAL_INJECTIVE=true
INJECTIVE_PRIVATE_KEY=
INJECTIVE_ADDRESS=
INJECTIVE_NETWORK=testnet
INJECTIVE_MEMO_PREFIX=AgentProof
```

Default demo behavior remains mock-based so the project is stable for judges and video recording.

## Verification Boundary

`npm run verify:trading` verifies the local proof package by recomputing hashes and checking risk constraints.

For real testnet anchors:

- The proof metadata records the real Injective tx hash.
- The Injective anchor report records `memo` and `proofHash`.
- The real Injective tx memo anchors `proofHash` on testnet.
- A future verifier can fetch the tx memo from Injective explorer/RPC and compare it against local proof metadata.
