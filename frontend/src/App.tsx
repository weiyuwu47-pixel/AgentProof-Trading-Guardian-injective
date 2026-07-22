import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BellRing,
  BookOpen,
  CheckCircle2,
  Circle,
  Code2,
  Fingerprint,
  Github,
  Play,
  RadioTower,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  X
} from "lucide-react";
import proof from "./data/latest-proof.json";
import decisionAnchor from "./data/latest-anchor.json";
import agentAnchor from "./data/latest-agent-profile-anchor.json";
import type { AnchorReport, ProofData } from "./types";
import { AgentIdentityCard } from "./components/AgentIdentityCard";
import { ArchitectureFlow } from "./components/ArchitectureFlow";
import { BehaviorLogCard } from "./components/BehaviorLogCard";
import { CopyButton } from "./components/CopyButton";
import { InjectiveAnchorCard } from "./components/InjectiveAnchorCard";
import { MarketSnapshotCard } from "./components/MarketSnapshotCard";
import { MultiAgentRoadmap } from "./components/MultiAgentRoadmap";
import { ProofBoundary } from "./components/ProofBoundary";
import { ProofPackageCard } from "./components/ProofPackageCard";
import { ProofSummary } from "./components/ProofSummary";
import { StrategyCard } from "./components/StrategyCard";
import { TradingDecisionCard } from "./components/TradingDecisionCard";
import { VerificationChecklist } from "./components/VerificationChecklist";

type Route = "/" | "/user-demo" | "/hallucination-demo" | "/developer";
type DemoStatus = "idle" | "running" | "passed";

interface DemoForm {
  market: string;
  stockCode: string;
  stockName: string;
  strategyText: string;
  currentPositionShares: number;
  maxPositionShares: number;
  minBasePositionShares: number;
  riskLevel: string;
}

const proofData = proof as ProofData;
const decisionAnchorData = decisionAnchor as AnchorReport;
const agentAnchorData = agentAnchor as AnchorReport;

const routes: Route[] = ["/", "/user-demo", "/hallucination-demo", "/developer"];

const userDemoSteps = [
  "读取用户策略",
  "模拟读取市场数据",
  "Agent 生成交易决策",
  "执行策略检查",
  "执行风控检查",
  "记录行为日志",
  "生成 proof package",
  "生成 proof hash",
  "展示 Injective anchor",
  "Verifier 重新计算并验证",
  "生成 verified alert"
];

const defaultForm: DemoForm = {
  market: "A_SHARE",
  stockCode: proofData.strategy.asset,
  stockName: proofData.strategy.assetName,
  strategyText: proofData.strategy.rules.join("；"),
  currentPositionShares: proofData.strategy.currentPositionShares,
  maxPositionShares: proofData.strategy.maxPositionShares,
  minBasePositionShares: proofData.strategy.minBasePositionShares,
  riskLevel: proofData.strategy.riskLevel
};

const developerCommands = [
  { label: "Install dependencies", value: "npm install" },
  { label: "Run trading demo", value: "npm run demo:trading" },
  { label: "Run verifier", value: "npm run verify:trading" },
  { label: "Run hallucination demo", value: "npm run demo:hallucination" },
  { label: "Register agent identity", value: "npm run register:agent" },
  { label: "Anchor on Injective testnet", value: "USE_REAL_INJECTIVE=true npm run anchor:injective" }
];

function getInitialRoute(): Route {
  if (typeof window === "undefined") return "/";
  return routes.includes(window.location.pathname as Route) ? (window.location.pathname as Route) : "/";
}

function App() {
  const [route, setRoute] = useState<Route>(getInitialRoute);

  useEffect(() => {
    const handlePopState = () => setRoute(getInitialRoute());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (nextRoute: Route) => {
    window.history.pushState({}, "", nextRoute);
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="app-shell">
      <TopNav route={route} navigate={navigate} />
      {route === "/" ? <HomePage navigate={navigate} /> : null}
      {route === "/user-demo" ? <UserDemoPage navigate={navigate} /> : null}
      {route === "/hallucination-demo" ? <HallucinationPage navigate={navigate} /> : null}
      {route === "/developer" ? <DeveloperPage navigate={navigate} /> : null}
    </main>
  );
}

function TopNav({ route, navigate }: { route: Route; navigate: (route: Route) => void }) {
  return (
    <header className="top-nav">
      <button className="brand-button" type="button" onClick={() => navigate("/")}>
        <ShieldCheck size={18} />
        <span>芙副官</span>
      </button>
      <nav aria-label="Primary navigation">
        <button className={route === "/user-demo" ? "active" : ""} type="button" onClick={() => navigate("/user-demo")}>
          用户体验
        </button>
        <button
          className={route === "/hallucination-demo" ? "active" : ""}
          type="button"
          onClick={() => navigate("/hallucination-demo")}
        >
          幻觉演示
        </button>
        <button className={route === "/developer" ? "active" : ""} type="button" onClick={() => navigate("/developer")}>
          开发者
        </button>
      </nav>
    </header>
  );
}

function HomePage({ navigate }: { navigate: (route: Route) => void }) {
  return (
    <>
      <section className="product-hero">
        <div className="hero-copy-block">
          <div className="eyebrow">
            <Fingerprint size={18} />
            Verifiable Decision Layer
          </div>
          <h1>芙副官</h1>
          <p className="subtitle">AI 金融 Agent 的可验证决策层</p>
          <p className="hero-copy">
            输入股票代码和自然语言策略，体验 AI 盯盘 Agent 如何生成决策、记录行为、生成 proof，并验证是否遵守规则。
          </p>
          <div className="hero-actions">
            <button className="primary-action" type="button" onClick={() => navigate("/user-demo")}>
              <Play size={18} />
              普通用户，体验虚拟运算流程
            </button>
            <button className="primary-action secondary" type="button" onClick={() => navigate("/developer")}>
              <Terminal size={18} />
              我是开发者，部署到本地自行接入真实 API 体验全流程
            </button>
          </div>
        </div>
        <div className="proof-console" aria-label="Current proof status">
          <div className="status-pill">v0.1.0 baseline frozen</div>
          <ProofMetric label="Agent Identity" value={proofData.agentProfileHash} />
          <ProofMetric label="Proof Hash" value={proofData.proofHash} />
          <ProofMetric label="Decision Anchor" value={decisionAnchorData.txHash} />
        </div>
      </section>

      <section className="panel wide">
        <div className="section-title">
          <ShieldCheck size={20} />
          <h2>产品定位</h2>
        </div>
        <div className="value-grid">
          <ValueCard title="不是自动交易 Bot" text="AgentProof 不托管资金、不承诺收益，聚焦验证 AI 决策是否按策略产生。" />
          <ValueCard title="普通提醒升级为 Verified Alert" text="用户看到的不只是交易提醒，而是带 proof、行为日志和 Injective anchor 的验证结果。" />
          <ValueCard title="AI financial agent trust layer" text="为 trading agents、wallet agents、portfolio agents 和 DeFi automation 提供可信边界。" />
        </div>
      </section>
    </>
  );
}

function UserDemoPage({ navigate }: { navigate: (route: Route) => void }) {
  const [form, setForm] = useState<DemoForm>(defaultForm);
  const [demoStatus, setDemoStatus] = useState<DemoStatus>("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [hasRun, setHasRun] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const timers = useRef<number[]>([]);

  const demoProof = useMemo(() => {
    const rules = form.strategyText
      .split(/[;；\n]/)
      .map((rule) => rule.trim())
      .filter(Boolean);

    return {
      ...proofData,
      strategy: {
        ...proofData.strategy,
        asset: form.stockCode,
        assetName: form.stockName,
        market: form.market,
        riskLevel: form.riskLevel,
        currentPositionShares: form.currentPositionShares,
        maxPositionShares: form.maxPositionShares,
        minBasePositionShares: form.minBasePositionShares,
        rules: rules.length > 0 ? rules : proofData.strategy.rules
      },
      decision: {
        ...proofData.decision,
        reason: "当前价格未满足买入条件，且卖出会违反最低底仓限制，因此保持 HOLD。"
      },
      behaviorLog: {
        ...proofData.behaviorLog,
        task: `Verify ${form.stockCode} against user strategy and position limits.`
      }
    } satisfies ProofData;
  }, [form]);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const updateForm = <Key extends keyof DemoForm>(key: Key, value: DemoForm[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFormError("");
  };

  const resetDemo = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setForm(defaultForm);
    setDemoStatus("idle");
    setActiveStep(0);
    setHasRun(false);
    setAlertOpen(false);
    setFormError("");
  };

  const startDemo = () => {
    if (!form.stockCode.trim()) {
      setFormError("请输入股票代码。");
      return;
    }
    if (!form.strategyText.trim()) {
      setFormError("请输入自然语言交易策略。");
      return;
    }
    if (form.minBasePositionShares > form.maxPositionShares || form.currentPositionShares > form.maxPositionShares) {
      setFormError("请检查仓位设置：最低底仓和当前持仓不能超过最大仓位。");
      return;
    }

    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setDemoStatus("running");
    setActiveStep(0);
    setHasRun(false);

    userDemoSteps.forEach((_, index) => {
      const timer = window.setTimeout(() => setActiveStep(index), index * 280);
      timers.current.push(timer);
    });
    const doneTimer = window.setTimeout(() => {
      setActiveStep(userDemoSteps.length - 1);
      setDemoStatus("passed");
      setHasRun(true);
    }, userDemoSteps.length * 280 + 120);
    timers.current.push(doneTimer);
  };

  return (
    <>
      <section className="page-heading">
        <button className="text-action" type="button" onClick={() => navigate("/")}>
          <ArrowLeft size={16} />
          返回开始页
        </button>
        <button className="text-action danger" type="button" onClick={() => navigate("/hallucination-demo")}>
          <ShieldAlert size={16} />
          幻觉演示
        </button>
        <h1>普通用户虚拟运算流程</h1>
        <p className="hero-copy">当前为虚拟运算体验，用于演示验证流程；真实 API 与 Injective testnet 接入请查看开发者页面。</p>
      </section>

      <section className="workspace-layout">
        <form className="panel input-panel" onSubmit={(event) => event.preventDefault()}>
          <div className="section-title">
            <BookOpen size={20} />
            <h2>输入股票与策略</h2>
          </div>
          <div className="form-grid">
            <label>
              <span>市场</span>
              <select value={form.market} onChange={(event) => updateForm("market", event.target.value)}>
                <option value="A_SHARE">A股</option>
                <option value="HK_STOCK">港股</option>
                <option value="US_STOCK">美股</option>
              </select>
            </label>
            <label>
              <span>股票代码</span>
              <input value={form.stockCode} onChange={(event) => updateForm("stockCode", event.target.value)} />
            </label>
            <label>
              <span>股票名称</span>
              <input value={form.stockName} onChange={(event) => updateForm("stockName", event.target.value)} />
            </label>
            <label>
              <span>风险等级</span>
              <select value={form.riskLevel} onChange={(event) => updateForm("riskLevel", event.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
          <label className="full-field">
            <span>自然语言策略</span>
            <textarea value={form.strategyText} onChange={(event) => updateForm("strategyText", event.target.value)} />
          </label>
          <div className="form-grid">
            <label>
              <span>当前持仓</span>
              <input
                type="number"
                min="0"
                value={form.currentPositionShares}
                onChange={(event) => updateForm("currentPositionShares", Number(event.target.value))}
              />
            </label>
            <label>
              <span>最大仓位</span>
              <input
                type="number"
                min="0"
                value={form.maxPositionShares}
                onChange={(event) => updateForm("maxPositionShares", Number(event.target.value))}
              />
            </label>
            <label>
              <span>最低底仓</span>
              <input
                type="number"
                min="0"
                value={form.minBasePositionShares}
                onChange={(event) => updateForm("minBasePositionShares", Number(event.target.value))}
              />
            </label>
          </div>
          {formError ? <p className="form-error">{formError}</p> : null}
          <div className="button-row">
            <button className="primary-action" type="button" onClick={startDemo}>
              <Play size={18} />
              开始验证 Agent 决策
            </button>
            <button className="primary-action secondary" type="button" onClick={resetDemo}>
              <RotateCcw size={18} />
              重新开始体验
            </button>
          </div>
        </form>

        <section className="panel">
          <div className="section-title">
            <RadioTower size={20} />
            <h2>验证进度</h2>
          </div>
          <ol className="step-list">
            {userDemoSteps.map((step, index) => {
              const state = getStepState(index, activeStep, demoStatus);
              return (
                <li className={state} key={step}>
                  {state === "passed" ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  <span>{step}</span>
                </li>
              );
            })}
          </ol>
        </section>
      </section>

      <section className={`result-band ${hasRun ? "ready" : ""}`}>
        <div className="panel wide">
          <div className="section-title">
            <BellRing size={20} />
            <h2>验证结果</h2>
          </div>
          <div className="result-grid">
            <ResultMetric label="Asset" value={`${demoProof.strategy.asset} / ${demoProof.strategy.assetName}`} />
            <ResultMetric label="Decision" value={demoProof.decision.action} tone="success" />
            <ResultMetric label="Verification" value={demoProof.verification.status} tone="success" />
            <ResultMetric label="Proof Status" value="Anchored / Mock Anchored" />
            <ResultMetric label="Alert Type" value="Verified Alert" />
          </div>
          <p className="reason">{demoProof.decision.reason}</p>
          <button className="primary-action" type="button" disabled={!hasRun} onClick={() => setAlertOpen(true)}>
            <BellRing size={18} />
            查看用户收到的可验证提醒
          </button>
        </div>
      </section>

      {hasRun ? (
        <section className="dashboard-grid">
          <AgentIdentityCard proof={demoProof} anchor={agentAnchorData} />
          <TradingDecisionCard proof={demoProof} />
          <StrategyCard proof={demoProof} />
          <MarketSnapshotCard proof={demoProof} />
          <BehaviorLogCard proof={demoProof} />
          <ProofPackageCard proof={demoProof} />
          <VerificationChecklist proof={demoProof} decisionAnchor={decisionAnchorData} agentAnchor={agentAnchorData} />
          <ProofSummary proof={demoProof} anchor={decisionAnchorData} />
          <InjectiveAnchorCard decisionAnchor={decisionAnchorData} agentAnchor={agentAnchorData} />
          <MultiAgentRoadmap />
          <ArchitectureFlow />
        </section>
      ) : null}

      <ProofBoundary />

      {alertOpen ? <VerifiedAlertModal proof={demoProof} anchor={decisionAnchorData} onClose={() => setAlertOpen(false)} /> : null}
    </>
  );
}

function HallucinationPage({ navigate }: { navigate: (route: Route) => void }) {
  return (
    <>
      <section className="page-heading danger-heading">
        <button className="text-action" type="button" onClick={() => navigate("/user-demo")}>
          <ArrowLeft size={16} />
          返回用户体验
        </button>
        <h1>幻觉演示</h1>
        <p className="hero-copy">当 AI Agent 编造行情或违反用户策略时，AgentProof 会用记录中的数据、策略、行为日志和 hash 重新验证并拒绝该决策。</p>
      </section>

      <section className="hallucination-grid">
        <CasePanel
          tone="normal"
          title="真实记录数据"
          rows={[
            ["股票", "600941 / 中国移动"],
            ["记录最高价", "108.90"],
            ["用户策略", "只有放量突破 112.00 才允许 BUY"]
          ]}
        />
        <CasePanel
          tone="rejected"
          title="Agent 幻觉输出"
          rows={[
            ["Agent 声称", "价格已突破 112.00，建议 BUY。"],
            ["决策", "BUY"],
            ["问题", "声称的突破信号不存在"]
          ]}
        />
      </section>

      <section className="panel wide">
        <div className="section-title">
          <ShieldAlert size={20} />
          <h2>Verifier 检查过程</h2>
        </div>
        <ol className="verifier-path">
          <li>
            <CheckCircle2 size={18} />
            <span>读取 recorded market snapshot：最高价 108.90。</span>
          </li>
          <li>
            <CheckCircle2 size={18} />
            <span>解析用户策略：突破 112.00 才允许 BUY。</span>
          </li>
          <li>
            <AlertTriangle size={18} />
            <span>对比 Agent 输出：BUY 的依据与记录数据不一致。</span>
          </li>
          <li>
            <ShieldAlert size={18} />
            <span>Verification: REJECTED；Reason: hallucinated market data detected。</span>
          </li>
        </ol>
      </section>

      <section className="panel wide rejection-summary">
        <div className="status-pill rejected">Verification Rejected</div>
        <h2>AgentProof 不依赖 AI 自己声称诚实</h2>
        <p className="reason">
          系统会用记录中的市场数据、用户策略、行为日志和 stable JSON hash 重新验证。只要输出与记录不一致，BUY / SELL 决策就会被拒绝。
        </p>
        <button className="primary-action" type="button" onClick={() => navigate("/user-demo")}>
          <Play size={18} />
          回到正常案例
        </button>
      </section>
    </>
  );
}

function DeveloperPage({ navigate }: { navigate: (route: Route) => void }) {
  return (
    <>
      <section className="page-heading">
        <button className="text-action" type="button" onClick={() => navigate("/")}>
          <ArrowLeft size={16} />
          返回开始页
        </button>
        <h1>开发者本地接入</h1>
        <p className="hero-copy">Clone repo、配置本地 `.env`，即可运行 CLI demo、verifier、hallucination detection 和 Injective testnet anchoring。</p>
      </section>

      <section className="developer-layout">
        <div className="panel">
          <div className="section-title">
            <Github size={20} />
            <h2>项目仓库</h2>
          </div>
          <a
            className="repo-link"
            href="https://github.com/weiyuwu47-pixel/AgentProof-Trading-Guardian-injective"
            target="_blank"
            rel="noreferrer"
          >
            github.com/weiyuwu47-pixel/AgentProof-Trading-Guardian-injective
          </a>
          <p className="note">v0.1.0 has been frozen as the baseline before this frontend product refactor.</p>
        </div>

        <div className="panel">
          <div className="section-title">
            <Code2 size={20} />
            <h2>环境变量</h2>
          </div>
          <p className="note">请在本地创建 .env，不要提交私钥或助记词。</p>
          <pre className="code-block">{`USE_REAL_INJECTIVE=true
INJECTIVE_NETWORK=testnet
INJECTIVE_PRIVATE_KEY=
INJECTIVE_ADDRESS=
INJECTIVE_MEMO_PREFIX=AgentProof`}</pre>
        </div>
      </section>

      <section className="panel wide">
        <div className="section-title">
          <Terminal size={20} />
          <h2>CLI Demo Commands</h2>
        </div>
        <div className="command-grid">
          {developerCommands.map((command) => (
            <div className="command-row" key={command.value}>
              <span>{command.label}</span>
              <code>{command.value}</code>
              <CopyButton value={command.value} label={`Copy ${command.label}`} />
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-grid">
        <AgentIdentityCard proof={proofData} anchor={agentAnchorData} />
        <ProofSummary proof={proofData} anchor={decisionAnchorData} />
        <VerificationChecklist proof={proofData} decisionAnchor={decisionAnchorData} agentAnchor={agentAnchorData} />
        <InjectiveAnchorCard decisionAnchor={decisionAnchorData} agentAnchor={agentAnchorData} />
        <ProofPackageCard proof={proofData} />
        <ArchitectureFlow />
      </section>
    </>
  );
}

function VerifiedAlertModal({
  proof,
  anchor,
  onClose
}: {
  proof: ProofData;
  anchor: AnchorReport;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="verified-alert-title">
      <div className="modal">
        <button className="modal-close" type="button" aria-label="Close alert" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="section-title">
          <BellRing size={20} />
          <h2 id="verified-alert-title">Verified Trading Alert</h2>
        </div>
        <p className="reason">芙副官已生成一条经过验证的盯盘提醒。</p>
        <div className="alert-summary">
          <span>股票：{proof.strategy.asset} / {proof.strategy.assetName}</span>
          <span>决策：{proof.decision.action}</span>
          <span>验证结果：{proof.verification.status}</span>
          <span>Proof：已锚定到 Injective testnet / 已完成模拟锚定</span>
        </div>
        <p className="note">这不是普通交易提醒，而是一条带有 proof 的 verified alert。</p>
        {anchor.explorerUrl ? (
          <a className="primary-link" href={anchor.explorerUrl} target="_blank" rel="noreferrer">
            Open proof anchor
          </a>
        ) : null}
        <button className="primary-action secondary" type="button" onClick={onClose}>
          关闭并继续查看验证详情
        </button>
      </div>
    </div>
  );
}

function ProofMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="hero-metric">
      <span>{label}</span>
      <code>{value}</code>
      <CopyButton value={value} label={`Copy ${label}`} />
    </div>
  );
}

function ValueCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="value-card">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function ResultMetric({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div className={tone === "success" ? "result-metric success" : "result-metric"}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CasePanel({ title, rows, tone }: { title: string; rows: string[][]; tone: "normal" | "rejected" }) {
  return (
    <section className={`case-card ${tone}`}>
      <h2>{title}</h2>
      {rows.map(([label, value]) => (
        <p key={label}>
          <strong>{label}：</strong>
          {value}
        </p>
      ))}
    </section>
  );
}

function getStepState(index: number, activeStep: number, demoStatus: DemoStatus) {
  if (demoStatus === "passed") return "passed";
  if (demoStatus === "running" && index < activeStep) return "passed";
  if (demoStatus === "running" && index === activeStep) return "running";
  return "pending";
}

export default App;
