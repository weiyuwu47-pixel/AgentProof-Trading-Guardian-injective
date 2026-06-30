# Multi-Agent Roadmap

Current demo verifies one Trading Guardian Agent.

Injective Agent Identity answers:

```text
Who is this agent?
```

AgentProof answers:

```text
What did this agent do, what data did it use, and did it follow the rules?
```

Injective can provide on-chain execution and agent identity. AgentProof adds the verifiable behavior layer: once agents have identities, users also need proof of what those agents did and whether they followed the rules.

## Future Financial Agent Workflow

```text
Market Data Agent ── marketDataHash ┐
Strategy Agent ───── strategyHash ───┤
Risk Guardian ────── riskCheckHash ──┤
Trading Agent ───── outputHash ──────┘
        ↓
Final AgentProof Hash
        ↓
Injective Testnet Memo Anchor
        ↓
Verification Passed
```

## Agent Roles

- Market Data Agent provides market snapshots.
- Strategy Agent provides user policy.
- Risk Guardian Agent checks position and exposure limits.
- Portfolio Agent allocates assets.
- Treasury / Finance Agent manages capital movement.
- Execution Agent submits on-chain transactions.
- Audit Agent verifies the full decision chain.

Each agent can have an on-chain identity. Each handoff can be hashed. AgentProof can combine those hashes into one final proof anchored on Injective.

## Current Scope

The current implementation verifies one Trading Guardian Agent. It does not yet implement a full multi-agent proof network or an official Injective Agent Registry integration.

## Roadmap

- Add official Injective Agent Registry integration if a stable SDK or registry interface is available.
- Create typed handoff payloads between agents.
- Hash every agent handoff.
- Add a proof registry contract for long-term indexed verification.
- Build a verifier that fetches Injective tx memos and compares them with local proof metadata.
