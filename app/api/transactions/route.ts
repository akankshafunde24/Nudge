import { NextResponse } from "next/server";
import type { NeedWant, TransactionType } from "@/lib/core/types";
import { dataContext } from "@/lib/server/context";
import { apiError, assertPositiveNumber, assertString, id, nowIso, readJson } from "@/lib/server/http";
import { appendRecord } from "@/lib/server/sheets";
import { maybeWriteReward } from "@/lib/server/reward-write";
import { indiaDateParts, indiaTime } from "@/lib/core/date";

interface SplitInput { person: string; amount: number }
interface Body {
  client_id?: string;
  date?: string;
  type?: TransactionType;
  amount: number;
  category?: string;
  subcategory?: string;
  description?: string;
  payment_method?: string;
  merchant?: string;
  need_or_want?: NeedWant;
  event_tag?: string;
  goal_id?: string;
  notes?: string;
  splits?: SplitInput[];
}

const allowedTypes = new Set<TransactionType>(["expense", "income", "saving", "transfer", "refund"]);
const safeClientId = (value?: string) => value && /^[a-zA-Z0-9_-]{8,80}$/.test(value) ? value : undefined;

export async function POST(request: Request) {
  try {
    const body = await readJson<Body>(request);
    const ctx = await dataContext();
    const requestedId = safeClientId(body.client_id);
    if (requestedId) {
      const existing = ctx.data.transactions.find((t) => t.id === requestedId);
      if (existing) {
        return NextResponse.json({ ok: true, transaction: existing, splits: ctx.data.splits.filter((s) => s.transaction_id === requestedId), reward: null, duplicate: true });
      }
    }

    const type = body.type || "expense";
    if (!allowedTypes.has(type)) throw new Error("Unsupported transaction type.");
    const amount = assertPositiveNumber(body.amount, "Amount");
    const date = body.date || indiaDateParts().date;
    const splits = type === "expense"
      ? (body.splits || []).map((s) => ({ person: assertString(s.person, "Split person"), amount: assertPositiveNumber(s.amount, "Split amount") }))
      : [];
    const splitAmount = type === "expense" ? splits.reduce((sum, s) => sum + s.amount, 0) : 0;
    if (splitAmount > amount + 0.001) throw new Error("Split shares cannot be greater than the amount paid.");
    const personalAmount = type === "expense" ? amount - splitAmount : amount;
    const txId = requestedId || id();
    const now = nowIso();
    const record = {
      id: txId,
      date,
      time: indiaTime(),
      type,
      amount,
      currency: "INR",
      category: body.category || (type === "expense" || type === "refund" ? "Other" : type === "income" ? "Income" : "Money Move"),
      subcategory: body.subcategory || "",
      description: body.description || "",
      payment_method: body.payment_method || "",
      merchant: body.merchant || "",
      need_or_want: body.need_or_want || "neutral",
      event_tag: body.event_tag || "",
      goal_id: body.goal_id || "",
      personal_amount: personalAmount,
      split_amount: splitAmount,
      notes: body.notes || "",
      created_at: now
    };
    if (!ctx.demo) await appendRecord(ctx.session.accessToken, ctx.sheetId, "Transactions", record);
    const splitRecords = splits.map((s) => ({
      id: id(),
      transaction_id: txId,
      person: s.person,
      total_bill: amount,
      my_share: personalAmount,
      their_share: s.amount,
      status: "pending",
      settled_amount: 0,
      settled_date: "",
      created_at: now
    }));
    if (!ctx.demo) for (const split of splitRecords) await appendRecord(ctx.session.accessToken, ctx.sheetId, "Splits", split);
    const reward = type === "expense"
      ? await maybeWriteReward(ctx.session.accessToken, ctx.sheetId, "expense_logged", date, ctx.data.rewards, ctx.demo)
      : null;
    return NextResponse.json({ ok: true, transaction: record, splits: splitRecords, reward, duplicate: false });
  } catch (error) {
    return apiError(error);
  }
}
