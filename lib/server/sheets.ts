import crypto from "node:crypto";
import { optionalEnv } from "./env";
import { setSession, type NudgeSession } from "./auth";
import type { Budget, DailyCheckIn, Goal, Investment, JournalEntry, RewardEvent, SettingsMap, Split, Transaction } from "../core/types";

export const SHEET_TITLE = "Nudge Finance";
export const SHEETS = {
  Settings: ["key", "value"],
  Transactions: ["id", "date", "time", "type", "amount", "currency", "category", "subcategory", "description", "payment_method", "merchant", "need_or_want", "event_tag", "goal_id", "personal_amount", "split_amount", "notes", "created_at"],
  Splits: ["id", "transaction_id", "person", "total_bill", "my_share", "their_share", "status", "settled_amount", "settled_date", "created_at"],
  Investments: ["id", "date", "asset_name", "asset_type", "transaction_type", "quantity", "amount_invested", "purchase_price", "current_value", "goal_id", "risk_bucket", "investment_horizon", "notes", "created_at"],
  Goals: ["id", "goal", "goal_type", "target_amount", "current_amount", "target_date", "monthly_target", "priority", "status", "created_at"],
  Budgets: ["id", "month", "category", "budget_amount"],
  Daily_CheckIns: ["id", "date", "mood", "energy", "movement_minutes", "movement_type", "food_feeling", "today_intention", "something_enjoyed", "proud_of_today", "reflection", "created_at"],
  Journal: ["id", "date", "entry_type", "content", "mood", "created_at"],
  Rewards: ["id", "date", "action", "xp", "coins", "badge", "created_at"],
  Wrapped: ["year", "json", "generated_at"],
  Monthly_Summary: ["Month", "Income", "Personal Spending", "Invested", "Saved"],
  Yearly_Summary: ["Year", "Income", "Personal Spending", "Invested", "Saved"]
} as const;

export type SheetName = keyof typeof SHEETS;

const numericFields = new Set([
  "amount", "personal_amount", "split_amount", "total_bill", "my_share", "their_share", "settled_amount",
  "quantity", "amount_invested", "purchase_price", "current_value", "target_amount", "current_amount", "monthly_target",
  "budget_amount", "mood", "energy", "movement_minutes", "xp", "coins"
]);

function authHeaders(token: string, json = false) {
  return {
    authorization: `Bearer ${token}`,
    ...(json ? { "content-type": "application/json" } : {})
  };
}

async function googleFetch<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { ...authHeaders(token, Boolean(init?.body)), ...(init?.headers || {}) },
    cache: "no-store"
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google API ${response.status}: ${text.slice(0, 500)}`);
  }
  return response.json() as Promise<T>;
}

function rowToObject(headers: readonly string[], row: unknown[]) {
  const obj: Record<string, unknown> = {};
  headers.forEach((header, index) => {
    const value = row[index] ?? "";
    obj[header] = numericFields.has(header) ? Number(value || 0) : String(value ?? "");
  });
  return obj;
}

function objectToRow(name: SheetName, record: Record<string, unknown>) {
  return SHEETS[name].map((key) => record[key] ?? "");
}

function colLetter(index: number) {
  let n = index;
  let result = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

export async function ensureNudgeSheet(session: NudgeSession): Promise<NudgeSession> {
  if (session.spreadsheetId) return session;
  const q = encodeURIComponent("trashed = false and properties has { key='nudge' and value='finance-v1' }");
  const found = await googleFetch<{ files?: Array<{ id: string; name: string; webViewLink?: string }> }>(
    `https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&fields=files(id,name,webViewLink)&pageSize=10`,
    session.accessToken
  );
  let file = found.files?.[0];
  if (!file) {
    const sheets = Object.keys(SHEETS).map((title) => ({ properties: { title } }));
    const created = await googleFetch<{ spreadsheetId: string; spreadsheetUrl: string; sheets?: Array<{ properties?: { sheetId?: number; title?: string } }> }>(
      "https://sheets.googleapis.com/v4/spreadsheets?fields=spreadsheetId,spreadsheetUrl,sheets.properties(sheetId,title)",
      session.accessToken,
      { method: "POST", body: JSON.stringify({ properties: { title: SHEET_TITLE }, sheets }) }
    );
    file = { id: created.spreadsheetId, name: SHEET_TITLE, webViewLink: created.spreadsheetUrl };
    await googleFetch(
      `https://www.googleapis.com/drive/v3/files/${created.spreadsheetId}?fields=id,properties`,
      session.accessToken,
      { method: "PATCH", body: JSON.stringify({ properties: { nudge: "finance-v1" } }) }
    );
    const now = new Date().toISOString();
    const data: Array<{ range: string; values: unknown[][] }> = Object.entries(SHEETS).map(([range, headers]) => ({ range: `${range}!A1`, values: [[...headers]] }));
    data.push({
      range: "Settings!A2",
      values: [
        ["schema_version", "1"],
        ["currency", "INR"],
        ["onboarding_complete", "false"],
        ["created_at", now],
        ["spreadsheet_url", created.spreadsheetUrl]
      ]
    });
    data.push({ range: "Monthly_Summary!A2", values: [[`=QUERY({ARRAYFORMULA(IF(Transactions!B2:B5000="","",TEXT(Transactions!B2:B5000,"yyyy-mm"))),ARRAYFORMULA(IF(Transactions!D2:D5000="income",Transactions!E2:E5000,0)),ARRAYFORMULA(IF(Transactions!D2:D5000="expense",IF(Transactions!O2:O5000="",Transactions!E2:E5000,Transactions!O2:O5000),IF(Transactions!D2:D5000="refund",-Transactions!E2:E5000,0))),ARRAYFORMULA(IF(Transactions!D2:D5000="investment",Transactions!E2:E5000,0)),ARRAYFORMULA(IF(Transactions!D2:D5000="saving",Transactions!E2:E5000,0))},"select Col1,sum(Col2),sum(Col3),sum(Col4),sum(Col5) where Col1 <> '' group by Col1 order by Col1 desc label Col1 'Month',sum(Col2) 'Income',sum(Col3) 'Personal Spending',sum(Col4) 'Invested',sum(Col5) 'Saved'",0)`]] });
    data.push({ range: "Yearly_Summary!A2", values: [[`=QUERY({ARRAYFORMULA(IF(Transactions!B2:B5000="","",TEXT(Transactions!B2:B5000,"yyyy"))),ARRAYFORMULA(IF(Transactions!D2:D5000="income",Transactions!E2:E5000,0)),ARRAYFORMULA(IF(Transactions!D2:D5000="expense",IF(Transactions!O2:O5000="",Transactions!E2:E5000,Transactions!O2:O5000),IF(Transactions!D2:D5000="refund",-Transactions!E2:E5000,0))),ARRAYFORMULA(IF(Transactions!D2:D5000="investment",Transactions!E2:E5000,0)),ARRAYFORMULA(IF(Transactions!D2:D5000="saving",Transactions!E2:E5000,0))},"select Col1,sum(Col2),sum(Col3),sum(Col4),sum(Col5) where Col1 <> '' group by Col1 order by Col1 desc label Col1 'Year',sum(Col2) 'Income',sum(Col3) 'Personal Spending',sum(Col4) 'Invested',sum(Col5) 'Saved'",0)`]] });
    await googleFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${created.spreadsheetId}/values:batchUpdate`,
      session.accessToken,
      { method: "POST", body: JSON.stringify({ valueInputOption: "USER_ENTERED", data }) }
    );
    await formatNewSpreadsheet(session.accessToken, created.spreadsheetId, created.sheets || []);
    await shareWithServiceAccountIfConfigured(session.accessToken, created.spreadsheetId);
  }
  const next = { ...session, spreadsheetId: file.id, spreadsheetUrl: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit` };
  await setSession(next);
  return next;
}

async function formatNewSpreadsheet(token: string, spreadsheetId: string, sheets: Array<{ properties?: { sheetId?: number; title?: string } }>) {
  const requests: Array<Record<string, unknown>> = [];
  for (const sheet of sheets) {
    const sheetId = sheet.properties?.sheetId;
    if (sheetId == null) continue;
    requests.push({
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
        fields: "gridProperties.frozenRowCount"
      }
    });
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
        cell: { userEnteredFormat: { backgroundColor: { red: 0.88, green: 0.95, blue: 0.90 }, textFormat: { bold: true, foregroundColor: { red: 0.08, green: 0.33, blue: 0.26 } } } },
        fields: "userEnteredFormat(backgroundColor,textFormat)"
      }
    });
    requests.push({ autoResizeDimensions: { dimensions: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: 20 } } });
  }
  if (!requests.length) return;
  await googleFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    token,
    { method: "POST", body: JSON.stringify({ requests }) }
  );
}

export async function shareWithServiceAccountIfConfigured(userToken: string, spreadsheetId: string) {
  const service = readServiceAccount();
  if (!service) return;
  try {
    await googleFetch(
      `https://www.googleapis.com/drive/v3/files/${spreadsheetId}/permissions?sendNotificationEmail=false&fields=id`,
      userToken,
      { method: "POST", body: JSON.stringify({ type: "user", role: "writer", emailAddress: service.client_email }) }
    );
  } catch (error) {
    console.warn("Nudge: service-account sharing could not be completed", error);
  }
}

export async function batchRead(token: string, spreadsheetId: string, names: SheetName[]) {
  const params = new URLSearchParams();
  names.forEach((n) => params.append("ranges", `${n}!A:Z`));
  params.set("majorDimension", "ROWS");
  const data = await googleFetch<{ valueRanges?: Array<{ range: string; values?: unknown[][] }> }>(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${params.toString()}`,
    token
  );
  const result: Partial<Record<SheetName, unknown[]>> = {};
  for (const range of data.valueRanges || []) {
    const match = range.range.match(/^'?([^'!]+)'?!/);
    const name = match?.[1] as SheetName | undefined;
    if (!name || !(name in SHEETS)) continue;
    const values = range.values || [];
    const headers = SHEETS[name];
    result[name] = values.slice(1).filter((r) => r.some((v) => String(v).trim() !== "")).map((row) => rowToObject(headers, row));
  }
  return result;
}

export async function appendRecord(token: string, spreadsheetId: string, name: SheetName, record: Record<string, unknown>) {
  const row = objectToRow(name, record);
  const end = colLetter(SHEETS[name].length);
  await googleFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`${name}!A:${end}`)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    token,
    { method: "POST", body: JSON.stringify({ values: [row] }) }
  );
}

export async function updateRecordById(token: string, spreadsheetId: string, name: SheetName, id: string, record: Record<string, unknown>) {
  const rows = await batchRead(token, spreadsheetId, [name]);
  const list = (rows[name] || []) as Array<Record<string, unknown>>;
  const idx = list.findIndex((r) => String(r.id ?? r.year ?? "") === id);
  if (idx < 0) throw new Error(`${name} record not found: ${id}`);
  const rowNumber = idx + 2;
  const end = colLetter(SHEETS[name].length);
  await googleFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`${name}!A${rowNumber}:${end}${rowNumber}`)}?valueInputOption=USER_ENTERED`,
    token,
    { method: "PUT", body: JSON.stringify({ values: [objectToRow(name, record)] }) }
  );
}

export async function upsertSetting(token: string, spreadsheetId: string, key: string, value: string) {
  const raw = await googleFetch<{ values?: unknown[][] }>(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent("Settings!A:B")}`,
    token
  );
  const rows = raw.values || [];
  const idx = rows.findIndex((row, index) => index > 0 && String(row[0]) === key);
  if (idx >= 0) {
    const rowNumber = idx + 1;
    await googleFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`Settings!A${rowNumber}:B${rowNumber}`)}?valueInputOption=USER_ENTERED`,
      token,
      { method: "PUT", body: JSON.stringify({ values: [[key, value]] }) }
    );
  } else {
    await googleFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent("Settings!A:B")}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      token,
      { method: "POST", body: JSON.stringify({ values: [[key, value]] }) }
    );
  }
}

export interface SheetData {
  settings: SettingsMap;
  transactions: Transaction[];
  splits: Split[];
  investments: Investment[];
  goals: Goal[];
  budgets: Budget[];
  checkIns: DailyCheckIn[];
  journal: JournalEntry[];
  rewards: RewardEvent[];
  wrapped: Array<{ year: string; json: string; generated_at: string }>;
}

export async function loadSheetData(token: string, spreadsheetId: string): Promise<SheetData> {
  const raw = await batchRead(token, spreadsheetId, ["Settings", "Transactions", "Splits", "Investments", "Goals", "Budgets", "Daily_CheckIns", "Journal", "Rewards", "Wrapped"]);
  const settingRows = (raw.Settings || []) as Array<{ key: string; value: string }>;
  const settings: SettingsMap = Object.fromEntries(settingRows.map((r) => [r.key, r.value]));
  return {
    settings,
    transactions: (raw.Transactions || []) as Transaction[],
    splits: (raw.Splits || []) as Split[],
    investments: (raw.Investments || []) as Investment[],
    goals: (raw.Goals || []) as Goal[],
    budgets: (raw.Budgets || []) as Budget[],
    checkIns: (raw.Daily_CheckIns || []) as DailyCheckIn[],
    journal: (raw.Journal || []) as JournalEntry[],
    rewards: (raw.Rewards || []) as RewardEvent[],
    wrapped: (raw.Wrapped || []) as Array<{ year: string; json: string; generated_at: string }>
  };
}

interface ServiceAccount { client_email: string; private_key: string; token_uri?: string }

export function readServiceAccount(): ServiceAccount | null {
  const encoded = optionalEnv("GOOGLE_SERVICE_ACCOUNT_JSON_B64");
  if (!encoded) return null;
  try {
    return JSON.parse(Buffer.from(encoded, "base64").toString("utf8")) as ServiceAccount;
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON_B64 is not valid Base64 JSON.");
  }
}

function base64urlJson(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export async function getServiceAccountToken() {
  const service = readServiceAccount();
  if (!service) return null;
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${base64urlJson({ alg: "RS256", typ: "JWT" })}.${base64urlJson({
    iss: service.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly",
    aud: service.token_uri || "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  })}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${signer.sign(service.private_key).toString("base64url")}`;
  const response = await fetch(service.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Service account token request failed (${response.status}).`);
  const json = await response.json() as { access_token: string };
  return json.access_token;
}

export async function findNudgeSheetForServiceAccount(token: string) {
  const q = encodeURIComponent("trashed = false and properties has { key='nudge' and value='finance-v1' }");
  const result = await googleFetch<{ files?: Array<{ id: string; name: string }> }>(
    `https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&fields=files(id,name)&pageSize=10`,
    token
  );
  return result.files?.[0]?.id || null;
}
