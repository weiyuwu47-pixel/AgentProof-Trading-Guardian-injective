export interface AgentProfile {
  id: string;
  name: string;
  version: string;
  purpose: string;
  operator: string;
  authorizedInputTypes: string[];
  forbiddenInputTypes: string[];
}

export function loadAgentProfile(): AgentProfile {
  return {
    id: "agentproof-trading-guardian-v1",
    name: "AgentProof Trading Guardian",
    version: "0.1.0",
    purpose:
      "Generate verifiable AI trading decisions from authorized market data, user strategy, and risk constraints.",
    operator: "hackathon-demo",
    authorizedInputTypes: [
      "user_trading_strategy",
      "market_price",
      "volume",
      "moving_average",
      "position_data"
    ],
    forbiddenInputTypes: [
      "private_key",
      "unauthorized_exchange_account",
      "unverified_news",
      "fabricated_market_data"
    ]
  };
}
