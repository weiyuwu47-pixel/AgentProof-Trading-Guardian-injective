# Frontend Context for ChatGPT

Use this file as a compact briefing when asking ChatGPT to modify the frontend dashboard.

## Project

AgentProof Trading Guardian is a static Vite + React + TypeScript dashboard for an AI Agent Audit / On-chain Proof Explorer demo.

The frontend does not call a backend. It imports static JSON proof artifacts:

- `frontend/src/data/latest-proof.json`
- `frontend/src/data/latest-anchor.json`
- `frontend/src/data/latest-agent-profile-anchor.json`

Current demo asset:

```text
600941 / 中国移动
```

Current verified decision:

```text
Decision: HOLD
Verification: PASSED
Proof: Anchored on Injective Testnet
```

Current important hashes:

```text
Agent Profile Hash:
4a0d71a304a71566a36844a8a20f314033aeabcd4c503646794bf6f814e9965c

Agent Profile Anchor Tx:
91011BC2497453685F0922D86C4E2556E6965BFC414827D43901A24C7052A712

Latest Decision Proof Hash:
f46be157256efd7c9a3b39a78a76136d751926d9f717d6d66d12ba15c77cf09c

Latest Decision Anchor Tx:
50D4073FA73ACCB8B8FA8ADA90C4C1B92A0FF20612AC35562F6BE781E01F2FBE
```

## How to Run

```bash
cd frontend
npm install
npm run dev
```

Build:

```bash
cd frontend
npm run build
```

## Frontend File Tree

```text
frontend/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── styles.css
    ├── types.ts
    ├── data/
    │   ├── latest-agent-profile-anchor.json
    │   ├── latest-anchor.json
    │   └── latest-proof.json
    └── components/
        ├── AgentIdentityCard.tsx
        ├── ArchitectureFlow.tsx
        ├── BehaviorLogCard.tsx
        ├── CopyButton.tsx
        ├── HallucinationDetectionDemo.tsx
        ├── HashLine.tsx
        ├── Hero.tsx
        ├── InjectiveAnchorCard.tsx
        ├── MarketSnapshotCard.tsx
        ├── MultiAgentRoadmap.tsx
        ├── ProofBoundary.tsx
        ├── ProofPackageCard.tsx
        ├── ProofSummary.tsx
        ├── StrategyCard.tsx
        ├── TradingDecisionCard.tsx
        ├── UserAlertPreview.tsx
        └── VerificationChecklist.tsx
```

## Data Model

`frontend/src/types.ts` defines:

- `AgentProfile`
- `AnchorReport`
- `ProofData`

The main proof object contains:

- `agentProfile`
- `agentProfileHash`
- `agentIdentity`
- `strategyHash`
- `marketDataHash`
- `behaviorLogHash`
- `outputHash`
- `proofHash`
- `decision`
- `strategy`
- `marketSnapshot`
- `behaviorLog`
- `chain`
- `verification`

## App Composition

`frontend/src/App.tsx` imports the three static JSON files, casts them to `ProofData` and `AnchorReport`, then renders:

```tsx
<Hero />
<AgentIdentityCard />
<ProofSummary />
<TradingDecisionCard />
<UserAlertPreview />
<StrategyCard />
<MarketSnapshotCard />
<BehaviorLogCard />
<ProofPackageCard />
<VerificationChecklist />
<InjectiveAnchorCard />
<HallucinationDetectionDemo />
<MultiAgentRoadmap />
<ArchitectureFlow />
<ProofBoundary />
```

## Component Responsibilities

`Hero.tsx`

Shows the first-screen dashboard headline, badges, verification status, agent profile tx, proof hash, and decision tx. This is the most important visual area for demo recording.

`AgentIdentityCard.tsx`

Shows agent ID, name, type, chain, profile hash, profile anchor tx, and capabilities. It carries the narrative:

```text
Agent identity answers who this agent is. AgentProof verifies what this agent did.
```

`ProofSummary.tsx`

Shows proof status, chain, proof hash, memo, tx hash, and an Injective explorer link.

`TradingDecisionCard.tsx`

Shows asset, market, decision, quantity, reason, risk check, market data source, and timestamp.

`UserAlertPreview.tsx`

Manual demo module. It shows a `Show User Alert` button. The modal does not open automatically. After clicking, it displays:

```text
Verified Trading Alert
AgentProof Trading Guardian has generated a verified trading decision.
Asset: 600941 / 中国移动
Decision: HOLD
Verification: PASSED
Proof: Anchored on Injective Testnet
```

It can be closed with `Close and continue demo`.

`StrategyCard.tsx`

Shows the China Mobile strategy:

```text
MA5 / MA10 下方不追涨
只有放量突破 112.00 才允许 BUY
跌破 106.00 才允许 SELL
保留底仓，不允许清仓
没有明确信号时 HOLD
```

`MarketSnapshotCard.tsx`

Shows price, open, high, low, previousClose, volume, MA5, MA10, MA20, source, and timestamp.

`BehaviorLogCard.tsx`

Shows behavior log fields: agent ID, task, policy result, decision, inputs used, forbidden inputs, timestamp.

`ProofPackageCard.tsx`

Shows agent profile hash, strategy hash, market data hash, behavior log hash, output hash, and final proof hash.

`VerificationChecklist.tsx`

Shows hash and policy verification checklist, plus proof anchor and agent profile anchor checks.

`InjectiveAnchorCard.tsx`

Shows two anchors:

- Agent Profile Anchor
- Decision Proof Anchor

Each includes memo, tx hash, and explorer link.

`HallucinationDetectionDemo.tsx`

Shows normal vs hallucinated case:

```text
Normal: HOLD / PASSED
Hallucinated: BUY / REJECTED
Reason: agent claimed price broke above 112.00, but recorded high was only 108.90.
```

`MultiAgentRoadmap.tsx`

Explains future multi-agent financial workflows:

- Market Data Agent
- Strategy Agent
- Risk Guardian Agent
- Portfolio Agent
- Execution Agent
- Audit Agent

`ArchitectureFlow.tsx`

Shows the pipeline:

```text
User Strategy → Market Data Provider → Trading Guardian Agent → Policy Evaluator
→ Trading Decision → Behavior Log → Proof Metadata → Proof Hash → Injective Anchor → Verifier
```

`ProofBoundary.tsx`

Shows what AgentProof proves and does not prove.

## Styling

All styles are in:

```text
frontend/src/styles.css
```

Design direction:

- dark AI audit dashboard
- card dashboard
- green verification accents
- blue/cyan Injective accents
- monospace hash display
- 8px border radius
- no landing-page fluff
- first screen should show verification, agent identity anchor, proof hash, and tx hash

Important CSS classes:

- `.hero`
- `.hero-proof`
- `.dashboard-grid`
- `.panel`
- `.hash-line`
- `.status-pill`
- `.decision-banner`
- `.primary-action`
- `.modal-backdrop`
- `.modal`
- `.case-card`
- `.architecture-flow`

## Prompt Template for ChatGPT

```text
You are editing the frontend for AgentProof Trading Guardian.

It is a Vite + React + TypeScript static dashboard under frontend/.
Do not add a backend, wallet login, or heavy UI framework.
Data comes from frontend/src/data/latest-proof.json, latest-anchor.json, and latest-agent-profile-anchor.json.

The page is an AI Agent Audit Dashboard / On-chain Proof Explorer for:
Asset: 600941 / 中国移动
Decision: HOLD
Verification: PASSED
Proof anchored on Injective testnet.

Keep the core narrative:
AgentProof does not prove profit. It proves the agent followed the declared strategy, used authorized data, respected risk constraints, and anchored the proof hash on Injective.

Current key components are listed in docs/frontend-context-for-chatgpt.md.
Please preserve the static demo stability and run `cd frontend && npm run build` after changes.
```

