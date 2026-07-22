import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  CheckCircle2,
  ChevronDown,
  Circle,
  ClipboardCheck,
  Code2,
  Copy,
  Database,
  FileJson,
  Github,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  X
} from "lucide-react";
import guardianImage from "./assets/guardian-officer.png";
import proof from "./data/latest-proof.json";
import decisionAnchor from "./data/latest-anchor.json";
import type { AnchorReport, ProofData } from "./types";

type Route = "/" | "/user-demo" | "/hallucination-demo" | "/developer";
type DemoStatus = "idle" | "running" | "passed";
type StepState = "pending" | "running" | "passed";

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
const routes: Route[] = ["/", "/user-demo", "/hallucination-demo", "/developer"];

const defaultForm: DemoForm = {
  market: "A股",
  stockCode: proofData.strategy.asset,
  stockName: proofData.strategy.assetName,
  strategyText: "以5日均线为支撑，10日均线为压力；若价格站稳112且成交量放大，则继续持有；若跌破106且风险上升，则减仓；保持底仓，不允许清仓。",
  currentPositionShares: proofData.strategy.currentPositionShares,
  maxPositionShares: proofData.strategy.maxPositionShares,
  minBasePositionShares: proofData.strategy.minBasePositionShares,
  riskLevel: "中等"
};

const demoSteps = [
  "读取用户策略",
  "模拟读取市场数据",
  "Agent 生成交易决策",
  "执行风控检查",
  "生成 proof hash",
  "Verifier 验证"
];

const developerCommands = [
  { label: "安装依赖", hint: "安装项目所需依赖包", command: "npm install" },
  { label: "运行普通 demo", hint: "体验普通用户虚拟交易流程", command: "npm run demo:trading" },
  { label: "运行 verifier", hint: "启动可信验证服务（本地）", command: "npm run verify:trading" },
  { label: "运行幻觉检测 demo", hint: "体验 AI 编造检测与决策拦截", command: "npm run demo:hallucination" },
  { label: "注册 Agent 身份", hint: "生成并上链注册 Agent 身份", command: "npm run register:agent" },
  { label: "真实 Injective testnet anchoring", hint: "将行为日志真实锚定至 Injective 测试网", command: "USE_REAL_INJECTIVE=true npm run anchor:injective" }
];

const techFlow = [
  { title: "Agent Identity", text: "身份注册与签名" },
  { title: "Stable JSON Hashing", text: "标准化与哈希" },
  { title: "Behavior Log", text: "行为日志记录" },
  { title: "Injective Anchor", text: "测试网链上锚定" },
  { title: "Local Verifier", text: "本地验证与审计" }
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
      {route === "/" ? <LandingPage navigate={navigate} /> : null}
      {route === "/user-demo" ? <UserDemoPage navigate={navigate} /> : null}
      {route === "/hallucination-demo" ? <HallucinationPage navigate={navigate} /> : null}
      {route === "/developer" ? <DeveloperPage /> : null}
    </main>
  );
}

function TopNav({ route, navigate }: { route: Route; navigate: (route: Route) => void }) {
  return (
    <header className="top-nav">
      <button className="brand-lockup" type="button" onClick={() => navigate("/")}>
        <span className="brand-mark">
          <ShieldCheck size={24} />
        </span>
        <span>
          <strong>芙副官</strong>
          <small>AgentProof Trading Guardian</small>
        </span>
      </button>
      <nav aria-label="主导航">
        <button className={route === "/user-demo" ? "active" : ""} type="button" onClick={() => navigate("/user-demo")}>
          普通用户体验
        </button>
        <button className={route === "/developer" ? "active" : ""} type="button" onClick={() => navigate("/developer")}>
          开发者体验
        </button>
        <button
          className={route === "/hallucination-demo" ? "active" : ""}
          type="button"
          onClick={() => navigate("/hallucination-demo")}
        >
          幻觉演示
        </button>
      </nav>
    </header>
  );
}

function LandingPage({ navigate }: { navigate: (route: Route) => void }) {
  return (
    <section className="landing-hero">
      <div className="hero-content">
        <div className="brand-kicker">
          <ShieldCheck size={18} />
          AI 金融 Agent 的信任层
        </div>
        <h1>芙副官</h1>
        <p className="english-name">AgentProof Trading Guardian</p>
        <h2>AI 金融 Agent 的可验证决策层</h2>
        <p className="hero-summary">验证 AI 是否读取真实数据、遵守策略、通过风控，并将 proof 锚定到 Injective。</p>

        <div className="hero-actions">
          <button className="primary-action" type="button" onClick={() => navigate("/user-demo")}>
            <ShieldCheck size={20} />
            普通用户，体验虚拟运算流程
            <ArrowRight size={20} />
          </button>
          <button className="secondary-action" type="button" onClick={() => navigate("/developer")}>
            <Terminal size={20} />
            我是开发者，部署到本地自行接入真实 API
            <ArrowRight size={20} />
          </button>
        </div>

        <div className="value-strip" aria-label="核心价值">
          <ValuePill icon={<ShieldCheck size={22} />} title="可验证" />
          <ValuePill icon={<Database size={22} />} title="可追溯" />
          <ValuePill icon={<ClipboardCheck size={22} />} title="可信任" />
        </div>
      </div>

      <GuardianPanel size="large" />
    </section>
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

  const decisionReason = useMemo(() => {
    return "价格位于关键策略区间内，未满足放量突破条件；当前仓位符合底仓要求，建议继续持有。";
  }, []);

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

    demoSteps.forEach((_, index) => {
      const timer = window.setTimeout(() => setActiveStep(index), index * 320);
      timers.current.push(timer);
    });

    const doneTimer = window.setTimeout(() => {
      setActiveStep(demoSteps.length - 1);
      setDemoStatus("passed");
      setHasRun(true);
    }, demoSteps.length * 320 + 180);
    timers.current.push(doneTimer);
  };

  return (
    <>
      <PageIntro
        icon={<Play size={26} />}
        title="普通用户体验"
        subtitle="输入股票与策略，体验 AI 决策如何被验证。"
        action={
          <button className="ghost-action" type="button" onClick={() => navigate("/hallucination-demo")}>
            <ShieldAlert size={18} />
            幻觉演示
          </button>
        }
      />

      <section className="user-workspace">
        <form className="glass-card input-card" onSubmit={(event) => event.preventDefault()}>
          <div className="card-heading">
            <h2>输入股票与策略</h2>
            <span>当前为虚拟运算体验</span>
          </div>

          <div className="form-grid">
            <FormField label="市场">
              <select value={form.market} onChange={(event) => updateForm("market", event.target.value)}>
                <option>A股</option>
                <option>港股</option>
                <option>美股</option>
              </select>
            </FormField>
            <FormField label="股票代码">
              <input value={form.stockCode} onChange={(event) => updateForm("stockCode", event.target.value)} />
            </FormField>
            <FormField label="股票名称">
              <input value={form.stockName} onChange={(event) => updateForm("stockName", event.target.value)} />
            </FormField>
          </div>

          <FormField label="自然语言策略">
            <textarea value={form.strategyText} onChange={(event) => updateForm("strategyText", event.target.value)} />
          </FormField>

          <div className="form-grid">
            <FormField label="当前持仓">
              <input
                type="number"
                min="0"
                value={form.currentPositionShares}
                onChange={(event) => updateForm("currentPositionShares", Number(event.target.value))}
              />
            </FormField>
            <FormField label="最大仓位">
              <input
                type="number"
                min="0"
                value={form.maxPositionShares}
                onChange={(event) => updateForm("maxPositionShares", Number(event.target.value))}
              />
            </FormField>
            <FormField label="最低底仓">
              <input
                type="number"
                min="0"
                value={form.minBasePositionShares}
                onChange={(event) => updateForm("minBasePositionShares", Number(event.target.value))}
              />
            </FormField>
          </div>

          {formError ? <p className="form-error">{formError}</p> : null}

          <div className="button-row">
            <button className="primary-action" type="button" onClick={startDemo}>
              <ShieldCheck size={20} />
              开始验证 Agent 决策
              <ArrowRight size={20} />
            </button>
            <button className="secondary-action compact" type="button" onClick={resetDemo}>
              <RotateCcw size={18} />
              重新开始体验
            </button>
          </div>
        </form>

        <section className="glass-card progress-card">
          <div className="card-heading">
            <h2>验证进度</h2>
            <span>{demoStatus === "passed" ? "验证通过" : demoStatus === "running" ? "运行中" : "等待开始"}</span>
          </div>
          <ol className="step-list">
            {demoSteps.map((step, index) => {
              const state = getStepState(index, activeStep, demoStatus);
              return (
                <li className={state} key={step}>
                  <span className="step-icon">
                    {state === "passed" ? <CheckCircle2 size={19} /> : state === "running" ? <RefreshCw size={19} /> : <Circle size={19} />}
                  </span>
                  <span>
                    {step}
                    <small>{state === "passed" ? "已完成" : state === "running" ? "正在执行" : "待验证"}</small>
                  </span>
                </li>
              );
            })}
          </ol>
          <GuardianPanel size="small" />
        </section>
      </section>

      <section className={`glass-card result-card ${hasRun ? "ready" : ""}`}>
        <div className="card-heading">
          <h2>验证结果</h2>
          <span>本页面为虚拟运算体验，所有数据均为模拟生成，不构成任何投资建议。</span>
        </div>
        <div className="result-grid">
          <ResultBlock label="股票" value={`${form.stockCode} / ${form.stockName}`} />
          <ResultBlock label="Agent 决策" value="HOLD" helper="持有" strong />
          <ResultBlock label="验证状态" value={hasRun ? "PASSED" : "待验证"} helper={hasRun ? "验证通过" : "等待运行"} success={hasRun} />
          <div className="result-reason">
            <span>决策理由（摘要）</span>
            <p>{decisionReason}</p>
          </div>
          <button className="primary-action alert-button" type="button" disabled={!hasRun} onClick={() => setAlertOpen(true)}>
            <BellRing size={20} />
            查看用户收到的可验证提醒
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {hasRun ? (
        <section className="detail-drawer">
          <SummaryChip icon={<FileJson size={18} />} title="Proof Hash" value={proofData.proofHash} />
          <SummaryChip icon={<Database size={18} />} title="Injective Anchor" value={decisionAnchorData.txHash} />
          <SummaryChip icon={<ClipboardCheck size={18} />} title="Behavior Log" value="已记录策略、行情、风控与输出" />
        </section>
      ) : null}

      {alertOpen ? (
        <VerifiedAlertModal
          asset={`${form.stockCode} / ${form.stockName}`}
          decision="HOLD"
          verification="PASSED"
          onClose={() => setAlertOpen(false)}
        />
      ) : null}
    </>
  );
}

function HallucinationPage({ navigate }: { navigate: (route: Route) => void }) {
  return (
    <>
      <PageIntro
        icon={<ShieldAlert size={26} />}
        title="幻觉演示"
        subtitle="当 AI Agent 编造行情时，系统如何拒绝错误决策。"
        action={
          <button className="ghost-action" type="button" onClick={() => navigate("/user-demo")}>
            <ArrowRight size={18} />
            返回正常案例
          </button>
        }
      />

      <section className="hallucination-flow">
        <FlowCard
          tone="blue"
          icon={<Database size={24} />}
          title="真实记录数据"
          items={["股票：600941 / 中国移动", "记录最高价：108.90", "用户策略：只有放量突破 112.00 才允许 BUY"]}
        />
        <div className="flow-arrow">
          <ArrowRight size={30} />
        </div>
        <FlowCard
          tone="warn"
          icon={<AlertTriangle size={24} />}
          title="Agent 幻觉输出"
          items={["声称价格已突破 112.00，建议 BUY", "该输出与记录行情不一致"]}
        />
        <div className="flow-arrow">
          <ArrowRight size={30} />
        </div>
        <FlowCard
          tone="green"
          icon={<ClipboardCheck size={24} />}
          title="Verifier 检查"
          items={["记录最高价未达到 112.00", "突破信号不存在", "BUY 决策不符合用户策略"]}
        />
      </section>

      <section className="glass-card rejection-card">
        <div className="rejection-mark">
          <ShieldAlert size={54} />
        </div>
        <div>
          <span>最终结果</span>
          <strong>REJECTED</strong>
          <p>检测到幻觉市场数据。Agent 输出与真实记录不符，且违反用户策略，系统已拒绝该决策。</p>
        </div>
        <button className="secondary-action compact" type="button" onClick={() => navigate("/user-demo")}>
          返回正常案例
        </button>
      </section>

      <GuardianWatermark />
    </>
  );
}

function DeveloperPage() {
  return (
    <>
      <PageIntro icon={<Code2 size={26} />} title="开发者体验" subtitle="本地部署并接入真实 API，运行 verifier 与 Injective testnet anchoring。" />

      <section className="developer-grid">
        <aside className="developer-side">
          <section className="glass-card repo-card">
            <div className="card-heading">
              <h2>项目仓库</h2>
            </div>
            <p>开源代码，欢迎提交 Issue 与 PR，共建可信 AI 交易生态。</p>
            <a className="repo-link" href="https://github.com/weiyuwu47-pixel/AgentProof-Trading-Guardian-injective" target="_blank" rel="noreferrer">
              <Github size={18} />
              github.com/weiyuwu47-pixel/AgentProof-Trading-Guardian-injective
            </a>
          </section>

          <section className="glass-card env-card">
            <div className="card-heading">
              <h2>环境变量</h2>
            </div>
            <p>请在本地创建 .env，不要提交私钥或助记词。</p>
            <pre>{`USE_REAL_INJECTIVE=true
INJECTIVE_NETWORK=testnet
INJECTIVE_PRIVATE_KEY=
INJECTIVE_ADDRESS=
INJECTIVE_MEMO_PREFIX=AgentProof`}</pre>
          </section>
        </aside>

        <section className="glass-card command-card">
          <div className="card-heading">
            <h2>运行命令</h2>
            <span>复制后在项目根目录执行</span>
          </div>
          <div className="command-list">
            {developerCommands.map((item, index) => (
              <CommandRow key={item.command} index={index + 1} {...item} />
            ))}
          </div>
        </section>
      </section>

      <section className="glass-card tech-chain">
        <div className="card-heading">
          <h2>技术链路</h2>
          <span>从身份到本地验证的最小可信闭环</span>
        </div>
        <div className="tech-flow">
          {techFlow.map((node, index) => (
            <div className="tech-node" key={node.title}>
              <span>{index + 1}</span>
              <strong>{node.title}</strong>
              <small>{node.text}</small>
            </div>
          ))}
        </div>
      </section>

      <GuardianWatermark />
    </>
  );
}

function PageIntro({
  icon,
  title,
  subtitle,
  action
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="page-intro">
      <div className="intro-icon">{icon}</div>
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action ? <div className="intro-action">{action}</div> : null}
    </section>
  );
}

function GuardianPanel({ size }: { size: "large" | "small" }) {
  return (
    <div className={`guardian-panel ${size}`}>
      <div className="holo-ring" />
      <img src={guardianImage} alt="芙副官 AI 金融验证守护者" />
    </div>
  );
}

function GuardianWatermark() {
  return (
    <div className="guardian-watermark" aria-hidden="true">
      <img src={guardianImage} alt="" />
    </div>
  );
}

function ValuePill({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="value-pill">
      <span>{icon}</span>
      <strong>{title}</strong>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ResultBlock({
  label,
  value,
  helper,
  strong,
  success
}: {
  label: string;
  value: string;
  helper?: string;
  strong?: boolean;
  success?: boolean;
}) {
  return (
    <div className={`result-block ${strong ? "strong" : ""} ${success ? "success" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {helper ? <small>{helper}</small> : null}
    </div>
  );
}

function SummaryChip({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="summary-chip">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <code>{value}</code>
      </div>
    </div>
  );
}

function FlowCard({
  tone,
  icon,
  title,
  items
}: {
  tone: "blue" | "warn" | "green";
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <section className={`glass-card flow-card ${tone}`}>
      <div className="flow-icon">{icon}</div>
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function CommandRow({
  index,
  label,
  hint,
  command
}: {
  index: number;
  label: string;
  hint: string;
  command: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="command-row">
      <span className="command-index">{index}</span>
      <div className="command-meta">
        <strong>{label}</strong>
        <small>{hint}</small>
      </div>
      <code>{command}</code>
      <button className="copy-action" type="button" aria-label={`复制 ${label}`} onClick={copy}>
        {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
      </button>
    </div>
  );
}

function VerifiedAlertModal({
  asset,
  decision,
  verification,
  onClose
}: {
  asset: string;
  decision: string;
  verification: string;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="verified-alert-title">
      <section className="modal">
        <button className="modal-close" type="button" aria-label="关闭提醒" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="modal-icon">
          <BellRing size={30} />
        </div>
        <h2 id="verified-alert-title">可验证提醒</h2>
        <p>芙副官已生成一条经过验证的盯盘提醒。</p>
        <div className="alert-summary">
          <span>股票：{asset}</span>
          <span>决策：{decision}</span>
          <span>验证结果：{verification}</span>
          <span>Proof：已锚定到 Injective testnet / 已完成模拟锚定</span>
        </div>
        <button className="primary-action" type="button" onClick={onClose}>
          关闭并继续查看验证详情
        </button>
      </section>
    </div>
  );
}

function getStepState(index: number, activeStep: number, status: DemoStatus): StepState {
  if (status === "passed") return "passed";
  if (status === "running" && index < activeStep) return "passed";
  if (status === "running" && index === activeStep) return "running";
  return "pending";
}

export default App;
