import { NextResponse } from "next/server";
import { dataContext } from "@/lib/server/context";
import { apiError, assertPositiveNumber, assertString, id, nowIso, readJson } from "@/lib/server/http";
import { appendRecord } from "@/lib/server/sheets";
import { maybeWriteReward } from "@/lib/server/reward-write";
import { indiaDateParts } from "@/lib/core/date";

interface Body {
  date?: string;
  asset_name: string;
  asset_type: string;
  transaction_type?: "buy"|"sip"|"deposit"|"sell"|"withdrawal"|"valuation";
  amount_invested?: number;
  quantity?: number;
  purchase_price?: number;
  current_value?: number;
  goal_id?: string;
  risk_bucket?: string;
  investment_horizon?: string;
  notes?: string;
}

export async function POST(request: Request) {
  try {
    const body = await readJson<Body>(request);
    const ctx = await dataContext();
    const date = body.date || indiaDateParts().date;
    const transactionType = body.transaction_type || "buy";
    const isValuation = transactionType === "valuation";
    const amount = isValuation ? 0 : assertPositiveNumber(body.amount_invested, "Investment amount");
    const currentValue = body.current_value == null || body.current_value === 0
      ? 0
      : assertPositiveNumber(body.current_value, "Current value");
    if (isValuation && currentValue <= 0) throw new Error("Current value is required for a valuation update.");

    const inv = {
      id: id(),
      date,
      asset_name: assertString(body.asset_name, "Asset name"),
      asset_type: assertString(body.asset_type, "Asset type"),
      transaction_type: transactionType,
      quantity: Math.max(0, Number(body.quantity || 0)),
      amount_invested: amount,
      purchase_price: Math.max(0, Number(body.purchase_price || 0)),
      current_value: currentValue,
      goal_id: body.goal_id || "",
      risk_bucket: body.risk_bucket || "",
      investment_horizon: body.investment_horizon || "",
      notes: body.notes || "",
      created_at: nowIso()
    };

    const isOut = transactionType === "sell" || transactionType === "withdrawal";
    const tx = isValuation ? null : {
      id: id(),
      date,
      time: "",
      type: isOut ? "investment_withdrawal" : "investment",
      amount,
      currency: "INR",
      category: "Investment",
      subcategory: body.asset_type,
      description: `${transactionType.toUpperCase()} · ${body.asset_name}`,
      payment_method: "",
      merchant: "",
      need_or_want: "neutral",
      event_tag: "",
      goal_id: body.goal_id || "",
      personal_amount: amount,
      split_amount: 0,
      notes: body.notes || "",
      created_at: nowIso()
    };

    if (!ctx.demo) {
      await appendRecord(ctx.session.accessToken, ctx.sheetId, "Investments", inv);
      if (tx) await appendRecord(ctx.session.accessToken, ctx.sheetId, "Transactions", tx);
    }
    const reward = !isOut && !isValuation
      ? await maybeWriteReward(ctx.session.accessToken, ctx.sheetId, "investment_added", date, ctx.data.rewards, ctx.demo)
      : null;
    return NextResponse.json({ ok: true, investment: inv, transaction: tx, reward });
  } catch (error) {
    return apiError(error);
  }
}
