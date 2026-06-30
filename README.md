# AgentProof Trading Guardian

Verifiable Decision Layer for AI Financial Agents on Injective.

AI trading agents can already monitor markets, analyze strategies, and generate trading recommendations. But many users still hesitate to trust AI agents with financial decisions because AI can hallucinate market data, ignore user-defined strategies, or violate risk limits.

AgentProof Trading Guardian turns every AI trading decision into a verifiable proof package. It records the agent identity, user strategy, market data, behavior log, and final output, then anchors the proof hash on Injective testnet.

AgentProof does not prove that a trading recommendation will be profitable. It proves that the agent followed the declared strategy, used authorized data, and respected risk constraints.

## Problem

Trading agents are becoming powerful enough to monitor markets, compare strategy rules, and generate BUY / SELL / HOLD recommendations. But a confident AI output is not enough in a financial context.

AI hallucination is dangerous when money is involved. An agent might fabricate market data, ignore a user-defined strategy, violate position limits, or produce reasoning that cannot be audited later.

A transaction hash alone also cannot prove that the agent followed the strategy before making a decision. Financial agents need verifiable decision traces: what identity made the decision, what data was used, what rules were checked, and what output was produced.

## Solution

AgentProof creates behavior logs and proof metadata for AI trading decisions.

The system uses stable JSON hashing so every important object can be recomputed deterministically:

- Agent profile
- User strategy
- Market snapshot
- Behavior log
- Trading decision output

The final proof hash commits to identity + strategy + market data + behavior log + output + timestamp. The verifier recomputes all hashes, checks risk constraints, checks forbidden inputs, and confirms that the proof package still matches the anchored proof hash.

## Why Injective

Injective is built for on-chain financial applications and AI financial agents. Trading, wallet, portfolio, and execution agents need verifiable behavior before users can trust them with money.

AgentProof complements Injective by adding a trust and verification layer. Injective can provide execution and identity. AgentProof provides behavior verification.

Injective can answer where financial actions happen on-chain. AgentProof answers whether the AI agent followed the rules before making the decision.

## Agent Identity

This repository includes a minimal Agent Identity module:

- Agent profile: `data/agent/agent-profile.json`
- Agent profile hash: stable JSON hash of the public profile
- Agent profile anchor: Injective testnet memo anchor with `AgentProfile:<agentProfileId>:<agentProfileHash>`

Identity answers:

```text
Who is this agent?
```

Proof answers:

```text
What did this agent do?
What data did it use?
Did it follow the rules?
```

Official Injective Agent Registry integration is roadmap. The current implementation anchors the agent profile hash using Injective testnet transaction memos.

## How It Works

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

The CLI demo loads a user strategy, fetches real market data when available, falls back to sample data when needed, evaluates strategy and risk rules, generates a decision, creates proof metadata, anchors the proof hash, and verifies the result locally.

The main demo scenario uses China Mobile:

```text
Asset: 600941 / 中国移动
Strategy: only allow BUY after a recorded volume breakout above 112.00
Default decision without a clear signal: HOLD
```

## Demo

Install dependencies:

```bash
npm install
```

Run the trading decision demo:

```bash
npm run demo:trading
```

Run the hallucination detection demo:

```bash
npm run demo:hallucination
```

Verify the latest proof:

```bash
npm run verify:trading
```

Register the agent profile:

```bash
npm run register:agent
```

Anchor the latest proof on real Injective testnet:

```bash
USE_REAL_INJECTIVE=true npm run anchor:injective
```

Type-check and build:

```bash
npm run typecheck
npm run build
```

## Real Injective Testnet Anchoring

Latest China Mobile Decision Proof Tx Hash:

```text
50D4073FA73ACCB8B8FA8ADA90C4C1B92A0FF20612AC35562F6BE781E01F2FBE
```

Latest China Mobile Memo:

```text
AgentProof:f46be157256efd7c9a3b39a78a76136d751926d9f717d6d66d12ba15c77cf09c
```

Earlier Decision Proof Tx Hash:

```text
E9C6573410F089553A2C57689AA25E42265D7684DF16CC3D7D1EE83E7B5C94CF
```

Earlier Memo:

```text
AgentProof:2e69121e0671e930f1095b36ddce77d621b2fd1d2c1057da8675e3414341efae
```

The latest run can also anchor a new decision proof hash. Real anchoring uses a minimal Injective testnet self-transfer with the proof hash in the transaction memo. Private keys are read only from local environment variables and are never written into proof reports, logs, README, or console output.

## Hallucination Detection Demo

AgentProof can also reject invalid AI decisions. In the hallucination demo, the agent claims that China Mobile broke above 112.00 and recommends BUY. However, the recorded market snapshot shows that the high price was only 108.90. The verifier detects that the claimed evidence does not exist in the recorded data and rejects the decision.

This command is expected to produce a failed verification result. The demo succeeds when the hallucinated decision is rejected.

```bash
npm run demo:hallucination
```

## Verified User Alert

In a production system, the verified decision can be delivered through WeChat, Telegram, email, or wallet notifications. The important part is that the user does not only receive a trading reminder. The user receives a verified alert backed by a proof hash and an Injective testnet anchor.

The frontend dashboard includes a manual `Show User Alert` button for demo presentations. The alert is not shown automatically on page load.

## Demo Dashboard

The frontend is a static AI Agent Audit Dashboard that reads copied proof and anchor JSON files.

Run it:

```bash
cd frontend
npm install
npm run dev
```

Build it:

```bash
cd frontend
npm run build
```

The dashboard shows agent identity, profile anchor, decision proof anchor, market data, strategy constraints, behavior log, proof package hashes, verification checks, hallucination detection, a user alert preview, and the multi-agent roadmap.

## Multi-Agent Roadmap

Today, the demo verifies one Trading Guardian Agent.

Future financial workflows will involve multiple agents:

- Market Data Agent
- Strategy Agent
- Risk Guardian Agent
- Portfolio Agent
- Execution Agent
- Audit Agent

Each agent can have an on-chain identity. Each handoff can be hashed. AgentProof can combine those hashes into one final proof anchored on Injective.

See [docs/multi-agent-roadmap.md](docs/multi-agent-roadmap.md).

## Current Status

- Trading Guardian CLI demo: implemented
- Agent profile: implemented
- Agent profile hash: implemented
- Agent identity anchoring: implemented if `register:agent` succeeds
- Real stock market data provider: implemented with sample fallback
- Proof package generation: implemented
- Local verification: implemented
- Hallucination detection demo: implemented
- Mock Injective anchoring: implemented as fallback
- Real Injective testnet memo anchoring: implemented
- Frontend demo dashboard: implemented
- Proof registry contract: roadmap
- Multi-agent proof network: roadmap

## What It Proves

- The agent used the declared strategy.
- The agent used recorded market data.
- The agent respected max position and minimum base position constraints.
- The agent did not use forbidden inputs.
- The decision output matches the proof hash.
- The agent profile hash can be anchored on Injective testnet.
- The decision proof hash can be anchored on Injective testnet.

## What It Does Not Prove

- It does not prove the trade will be profitable.
- It does not predict future market movement.
- It does not replace human investment judgment.
- It does not require exposing private keys or sensitive data.
- It does not yet implement an official Injective Agent Registry integration.

## Relation to Health Guardian

AgentProof was first tested in a Health Guardian scenario, where the agent reads authorized health data, generates a privacy-preserving summary, records its behavior, and creates an on-chain proof. Trading Guardian extends the same verifiable agent architecture to financial agents, where the core risk is not only privacy leakage but also financial loss from hallucinated or policy-violating decisions.

## Repository Structure

```text
data/agent/agent-profile.json          Public agent identity profile
data/trading/                          Strategy, portfolio, and sample market data
src/identity/                          Agent identity and profile hashing
src/trading/                           Market data, strategy, risk, and decision logic
src/proof/                             Stable hashing, proof metadata, and verification
src/chain/                             Mock and real Injective chain providers
scripts/                               CLI demo, verification, anchoring, registration
frontend/                              Static React dashboard
docs/                                  Architecture and Injective integration notes
```
