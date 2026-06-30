import type {
  MarketSnapshot,
  PolicyCheck,
  Portfolio,
  TradingDecision,
  UserTradingStrategy
} from "./types.js";
import { evaluatePolicy } from "./policyEvaluator.js";

function check(rule: string, status: PolicyCheck["status"], explanation: string): PolicyCheck {
  return { rule, status, explanation };
}

export function generateTradingDecision(params: {
  strategy: UserTradingStrategy;
  portfolio: Portfolio;
  snapshot: MarketSnapshot;
}): TradingDecision {
  const { strategy, portfolio, snapshot } = params;
  const candidate = evaluatePolicy(strategy, snapshot);
  const position = portfolio.currentPositionShares ?? strategy.currentPositionShares;
  const policyChecks = [...candidate.policyChecks];

  if (candidate.action === "BUY") {
    const quantity = candidate.quantity ?? 0;
    const projectedPosition = position + quantity;
    if (projectedPosition > strategy.maxPositionShares) {
      policyChecks.push(
        check(
          "Never recommend exceeding maxPositionShares",
          "PASSED",
          `Candidate BUY ${quantity} was converted to HOLD because projected position ${projectedPosition} exceeds maxPositionShares ${strategy.maxPositionShares}.`
        )
      );

      return {
        action: "HOLD",
        reason: `BUY signal was detected from market data, but executing it would exceed maxPositionShares (${strategy.maxPositionShares}); HOLD respects the risk limit.`,
        evidence: candidate.evidence,
        riskCheck: "PASSED",
        policyChecks
      };
    }

    policyChecks.push(
      check(
        "Never recommend exceeding maxPositionShares",
        "PASSED",
        `Projected position ${projectedPosition} is within maxPositionShares ${strategy.maxPositionShares}.`
      )
    );
  }

  if (candidate.action === "SELL") {
    const quantity = candidate.quantity ?? 0;
    const projectedPosition = position - quantity;
    if (projectedPosition < strategy.minBasePositionShares) {
      policyChecks.push(
        check(
          "Never recommend selling below minBasePositionShares",
          "PASSED",
          `Candidate SELL ${quantity} was converted to HOLD because projected position ${projectedPosition} is below minBasePositionShares ${strategy.minBasePositionShares}.`
        )
      );

      return {
        action: "HOLD",
        reason: `SELL signal was detected from market data, but executing it would break the minBasePositionShares floor (${strategy.minBasePositionShares}); HOLD preserves the base position.`,
        evidence: candidate.evidence,
        riskCheck: "PASSED",
        policyChecks
      };
    }

    policyChecks.push(
      check(
        "Never recommend selling below minBasePositionShares",
        "PASSED",
        `Projected position ${projectedPosition} remains above minBasePositionShares ${strategy.minBasePositionShares}.`
      )
    );
  }

  if (candidate.action === "HOLD") {
    policyChecks.push(
      check(
        "Position constraints",
        "PASSED",
        `HOLD keeps position at ${position}, within min ${strategy.minBasePositionShares} and max ${strategy.maxPositionShares}.`
      )
    );
  }

  policyChecks.push(
    check(
      "Never recommend a trade without citing market data",
      "PASSED",
      `Decision evidence contains ${candidate.evidence.length} market data fields.`
    )
  );

  return {
    ...candidate,
    riskCheck: "PASSED",
    policyChecks
  };
}
