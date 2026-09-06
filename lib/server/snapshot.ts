import { buildFinanceSummary, buildInvestmentSummary, previousMonthKey } from "../core/finance";
import { buildGrowthState } from "../core/growth";
import { enrichGoals } from "../core/goals";
import { buildBudgetProgress } from "../core/budgets";
import { totalOpenReceivable } from "../core/splits";
import { demoData } from "../core/demo";
import { indiaDateParts, logicalIndiaDate } from "../core/date";
import type { NudgeSnapshot } from "../core/types";
import { devBypassEnabled } from "./env";
import { ensureNudgeSheet, loadSheetData, type SheetData } from "./sheets";
import { requireSession } from "./auth";
export { indiaDateParts } from "../core/date";
export function buildSnapshot(data:SheetData,month:string,today=new Date()):NudgeSnapshot{const logicalToday=logicalIndiaDate(today),finance=buildFinanceSummary(month,data.transactions,data.splits,logicalToday),previousFinance=buildFinanceSummary(previousMonthKey(month),data.transactions,data.splits,logicalToday),growth=buildGrowthState(data.rewards,data.checkIns,logicalToday);return{settings:data.settings,transactions:[...data.transactions].sort((a,b)=>`${b.date}${b.time||""}`.localeCompare(`${a.date}${a.time||""}`)),splits:data.splits,investments:data.investments,goals:data.goals,budgets:data.budgets,budgetProgress:buildBudgetProgress(month,data.budgets,finance.categoryTotals),checkIns:data.checkIns,journal:[...data.journal].sort((a,b)=>b.date.localeCompare(a.date)),rewards:data.rewards,finance,openReceivable:totalOpenReceivable(data.splits),previousFinance,growth,investment:buildInvestmentSummary(data.investments),goalProgress:enrichGoals(data.goals,logicalToday)}}
export async function loadSnapshot(month?:string){const selected=month||indiaDateParts().month;let session=await requireSession();if(devBypassEnabled()||session.accessToken==="demo")return{snapshot:buildSnapshot(demoData,selected),spreadsheetUrl:"#",demo:true,wrapped:demoData.wrapped};session=await ensureNudgeSheet(session);const data=await loadSheetData(session.accessToken,session.spreadsheetId!);return{snapshot:buildSnapshot(data,selected),spreadsheetUrl:session.spreadsheetUrl,demo:false,wrapped:data.wrapped}}
