import type { AgentProfile } from "../identity/agentIdentity.js";
import type { BehaviorLog, TradingDecision, UserTradingStrategy } from "../trading/types.js";

const REQUIRED_INPUTS = [
  "user_trading_strategy",
  "market_price",
  "volume",
  "moving_average",
  "position_data"
];

export function createBehaviorLog(params: {
  agentProfile: AgentProfile;
  strategy: UserTradingStrategy;
  decision: TradingDecision;
  timestamp: string;
}): BehaviorLog {
  return {
    agentProfileId: params.agentProfile.id,
    task: "trading_decision_verification",
    authorizedInputs: params.strategy.authorizedInputs,
    forbiddenInputs: params.strategy.forbiddenInputs,
    inputsUsed: REQUIRED_INPUTS,
    policyResult: params.decision.riskCheck,
    decision: params.decision.action,
    timestamp: params.timestamp
  };
}
