import type { MarketSnapshot, PolicyCheck, TradingAction, UserTradingStrategy } from "./types.js";

export interface CandidateDecision {
  action: TradingAction;
  quantity?: number;
  reason: string;
  evidence: string[];
  policyChecks: PolicyCheck[];
}

function evidenceFromMarket(snapshot: MarketSnapshot): string[] {
  const evidence = [
    `price=${snapshot.price}`,
    snapshot.volume !== undefined ? `volume=${snapshot.volume}` : undefined,
    snapshot.ma5 !== undefined ? `ma5=${snapshot.ma5}` : undefined,
    snapshot.ma10 !== undefined ? `ma10=${snapshot.ma10}` : undefined,
    snapshot.previousClose !== undefined ? `previousClose=${snapshot.previousClose}` : undefined,
    `marketDataSource=${snapshot.source}`
  ];

  return evidence.filter((item): item is string => Boolean(item));
}

function passed(rule: string, explanation: string): PolicyCheck {
  return { rule, status: "PASSED", explanation };
}

function notTriggered(rule: string, explanation: string): PolicyCheck {
  return { rule, status: "NOT_TRIGGERED", explanation };
}

export function evaluatePolicy(
  strategy: UserTradingStrategy,
  snapshot: MarketSnapshot
): CandidateDecision {
  const checks: PolicyCheck[] = [];
  const evidence = evidenceFromMarket(snapshot);
  const price = snapshot.price;
  const high = snapshot.high ?? snapshot.price;
  const ma5 = snapshot.ma5;
  const ma10 = snapshot.ma10;
  const volume = snapshot.volume ?? 0;
  const hasVolume = volume > 0;
  const isAboveShortAverages =
    ma5 !== undefined && ma10 !== undefined ? price >= ma5 && price >= ma10 : true;

  if (strategy.asset === "600941") {
    if (!isAboveShortAverages) {
      checks.push(
        passed(
          "MA5/MA10 下方不追涨",
          `Price ${price} is below MA5 ${ma5} or MA10 ${ma10}; chasing a BUY is blocked.`
        )
      );
    } else {
      checks.push(
        notTriggered(
          "MA5/MA10 下方不追涨",
          `Price ${price} is not below both short moving averages.`
        )
      );
    }

    if (price < 106) {
      checks.push(passed("跌破 106.00 才允许 SELL", `Price ${price} is below 106.00.`));
      return {
        action: "SELL",
        quantity: 100,
        reason: `Price ${price} broke below 106.00, triggering the strategy sell rule.`,
        evidence,
        policyChecks: checks
      };
    }

    checks.push(notTriggered("跌破 106.00 才允许 SELL", `Price ${price} is not below 106.00.`));

    if (isAboveShortAverages && high >= 112 && hasVolume) {
      checks.push(
        passed(
          "只有放量突破 112.00 才允许 BUY",
          `Recorded high ${high} is above 112.00 with recorded volume ${volume}.`
        )
      );
      return {
        action: "BUY",
        quantity: 100,
        reason: `Recorded high ${high} broke above 112.00 with recorded volume, so BUY is allowed by the user strategy.`,
        evidence,
        policyChecks: checks
      };
    }

    checks.push(
      notTriggered(
        "只有放量突破 112.00 才允许 BUY",
        `Recorded high ${high} did not break above 112.00.`
      )
    );
    checks.push(passed("没有明确信号时 HOLD", "No explicit buy or sell signal was triggered."));

    return {
      action: "HOLD",
      reason:
        "Price did not break above 112.00, and selling is not triggered by the user strategy. HOLD preserves the base position.",
      evidence,
      policyChecks: checks
    };
  }

  if (!isAboveShortAverages) {
    checks.push(
      passed(
        "MA5/MA10 下方不买",
        `Price ${price} is below MA5 ${ma5} or MA10 ${ma10}; BUY signals are blocked.`
      )
    );
  } else {
    checks.push(
      notTriggered(
        "MA5/MA10 下方不买",
        `Price ${price} is not below both short moving averages.`
      )
    );
  }

  if (price < 15.6) {
    checks.push(
      passed("跌破 15.60 止损 1000 股", `Price ${price} is below 15.60.`)
    );
    return {
      action: "SELL",
      quantity: 1000,
      reason: `Price ${price} broke below 15.60, triggering the stop-loss sell rule.`,
      evidence,
      policyChecks: checks
    };
  }

  checks.push(notTriggered("跌破 15.60 止损 1000 股", `Price ${price} is not below 15.60.`));

  if (price < 15.85) {
    checks.push(passed("跌破 15.85 减仓 500 股", `Price ${price} is below 15.85.`));
    return {
      action: "SELL",
      quantity: 500,
      reason: `Price ${price} broke below 15.85, triggering the risk-reduction sell rule.`,
      evidence,
      policyChecks: checks
    };
  }

  checks.push(notTriggered("跌破 15.85 减仓 500 股", `Price ${price} is not below 15.85.`));

  if (isAboveShortAverages && price >= 16.5 && hasVolume) {
    checks.push(
      passed(
        "放量突破 16.50 可以买入 1000 股",
        `Price ${price} is above 16.50 and volume ${volume} is available.`
      )
    );
    return {
      action: "BUY",
      quantity: 1000,
      reason: `Price ${price} is above 16.50 with recorded volume, triggering the breakout buy rule.`,
      evidence,
      policyChecks: checks
    };
  }

  checks.push(
    notTriggered(
      "放量突破 16.50 可以买入 1000 股",
      `Price ${price} did not trigger a volume breakout above 16.50.`
    )
  );

  if (isAboveShortAverages && price >= 16.25 && price <= 16.3 && hasVolume) {
    checks.push(
      passed(
        "站回 16.25–16.30 且放量可以买入 1000 股",
        `Price ${price} is inside 16.25-16.30 with recorded volume ${volume}.`
      )
    );
    return {
      action: "BUY",
      quantity: 1000,
      reason: `Price ${price} returned to the 16.25-16.30 zone with recorded volume, triggering the buy rule.`,
      evidence,
      policyChecks: checks
    };
  }

  checks.push(
    notTriggered(
      "站回 16.25–16.30 且放量可以买入 1000 股",
      `Price ${price} did not match the 16.25-16.30 volume buy condition.`
    )
  );

  if (price >= 16.8 && price <= 16.9 && hasVolume) {
    checks.push(
      passed(
        "上冲 16.80–16.90 放量滞涨减仓 500 股",
        `Price ${price} is inside the 16.80-16.90 risk-reduction zone with recorded volume.`
      )
    );
    return {
      action: "SELL",
      quantity: 500,
      reason: `Price ${price} reached the 16.80-16.90 risk-reduction zone with recorded volume.`,
      evidence,
      policyChecks: checks
    };
  }

  checks.push(
    notTriggered(
      "上冲 16.80–16.90 放量滞涨减仓 500 股",
      `Price ${price} did not enter the 16.80-16.90 risk-reduction zone.`
    )
  );

  checks.push(passed("没有明确信号时 HOLD", "No explicit buy or sell signal was triggered."));

  return {
    action: "HOLD",
    reason: `No explicit signal was triggered from price ${price}, volume, and moving averages; defaulting to HOLD.`,
    evidence,
    policyChecks: checks
  };
}
