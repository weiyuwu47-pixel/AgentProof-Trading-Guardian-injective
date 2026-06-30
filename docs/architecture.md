# Architecture

AgentProof Trading Guardian verifies the AI trading decision process, not trading profitability.

```text
User Strategy
     ↓
Market Data Provider
     ↓
Trading Guardian Agent
     ↓
Policy Evaluator
     ↓
Trading Decision
     ↓
Behavior Log
     ↓
Proof Metadata
     ↓
Proof Hash
     ↓
Injective Anchor
     ↓
Verifier
```

AgentProof does not prove that a trading recommendation will be profitable. It proves that the agent followed the declared strategy, used authorized data, and respected risk constraints.

## Components

`User Strategy` defines the asset, risk level, position constraints, rules, authorized inputs, and forbidden inputs.

`Market Data Provider` fetches a real market snapshot through `StockMarketDataProvider`. If the live request fails, `SampleMarketDataProvider` provides a deterministic fallback for stable demos.

`Trading Guardian Agent` coordinates strategy loading, market data loading, policy evaluation, behavior logging, proof generation, anchoring, and verification.

`Policy Evaluator` turns market data and strategy rules into a candidate BUY / SELL / HOLD decision.

`Trading Decision` applies risk constraints to the candidate decision. BUY cannot exceed `maxPositionShares`; SELL cannot reduce the position below `minBasePositionShares`.

`Behavior Log` records the agent profile, authorized inputs, forbidden inputs, inputs used, policy result, final decision, and timestamp.

`Proof Metadata` stores all hashes and enough source data for the verifier to recompute the proof.

`Proof Hash` commits to the agent ID, strategy hash, market data hash, behavior log hash, output hash, and timestamp.

`Injective Anchor` uses `MockInjectiveProvider` by default for stable demos. When `USE_REAL_INJECTIVE=true`, `InjectiveProvider` anchors the proof hash in a real Injective testnet transaction memo.

`Verifier` recomputes all hashes and validates risk and input constraints.

## What It Can Prove

- The agent used the declared user strategy.
- The agent used recorded market data.
- The agent used authorized inputs.
- The agent did not use forbidden inputs recorded in the policy.
- The recommendation contains market-data-based reasoning.
- The final recommendation did not violate max position or min base position constraints.
- The final proof hash matches the proof metadata.

## What It Cannot Prove

- It cannot prove that the recommendation will be profitable.
- It cannot prove that a future market move will match the recommendation.
- It cannot prove that a third-party market data endpoint is globally complete.
- The local verifier does not yet require fetching the real Injective tx memo; that is a future verifier extension.

## Hashing Model

The system uses stable JSON hashing. Object keys are sorted before hashing so the same semantic payload produces the same hash.

The final proof hash is generated from:

```text
agentProfileId
strategyHash
marketDataHash
behaviorLogHash
outputHash
timestamp
```

This makes the final proof a compact commitment to the decision process.
