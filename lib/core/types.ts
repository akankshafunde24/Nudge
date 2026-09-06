export type TransactionType = "expense" | "income" | "investment" | "saving" | "transfer" | "refund" | "investment_withdrawal";
export type NeedWant = "need" | "want" | "neutral";
export type SplitStatus = "pending" | "partial" | "settled";
export type GoalStatus = "active" | "completed" | "paused";
export type FoodFeeling = "mindful" | "okay" | "indulgent" | "not_sure";
export type PlantStage = "seed" | "sprout" | "seedling" | "plant";
export type MomentumState = "resting" | "rebuilding" | "steady" | "strong";
export interface Transaction{id:string;date:string;time?:string;type:TransactionType;amount:number;currency?:string;category:string;subcategory?:string;description?:string;payment_method?:string;merchant?:string;need_or_want?:NeedWant;event_tag?:string;goal_id?:string;personal_amount?:number;split_amount?:number;notes?:string;created_at?:string}
export interface Split{id:string;transaction_id:string;person:string;total_bill:number;my_share:number;their_share:number;status:SplitStatus;settled_amount:number;settled_date?:string;created_at?:string}
export interface Investment{id:string;date:string;asset_name:string;asset_type:string;transaction_type:"buy"|"sip"|"deposit"|"sell"|"withdrawal"|"valuation";quantity?:number;amount_invested:number;purchase_price?:number;current_value?:number;goal_id?:string;risk_bucket?:string;investment_horizon?:string;notes?:string;created_at?:string}
export interface Goal{id:string;goal:string;goal_type:string;target_amount:number;current_amount:number;target_date?:string;monthly_target?:number;priority?:string;status:GoalStatus;created_at?:string}
export interface Budget{id:string;month:string;category:string;budget_amount:number}
export interface DailyCheckIn{id:string;date:string;mood:number;energy:number;movement_minutes:number;movement_type?:string;food_feeling:FoodFeeling;today_intention?:string;something_enjoyed?:string;proud_of_today?:string;reflection?:string;created_at?:string}
export interface JournalEntry{id:string;date:string;entry_type:"journal"|"gratitude"|"moment"|"quick_memory";content:string;mood?:number;created_at?:string}
export interface RewardEvent{id:string;date:string;action:string;xp:number;coins:number;badge?:string;created_at?:string}
export interface SettingsMap{[key:string]:string}
export interface FinanceSummary{period:string;income:number;personalSpending:number;cashOutflow:number;invested:number;saved:number;futureAllocation:number;cashLeft:number;savingsRate:number;investmentRate:number;futureRate:number;receivable:number;topCategory:string|null;topCategoryAmount:number;categoryTotals:Record<string,number>;needTotal:number;wantTotal:number;noSpendDays:number;transactionCount:number}
export interface GrowthState{totalXp:number;level:number;plantStage:PlantStage;stageProgress:number;momentum:MomentumState;checkInDaysLast14:number;daysSinceLastCheckIn:number|null;isComebackWindow:boolean}
export interface BudgetProgress extends Budget{spent:number;remaining:number;progress:number;status:"within"|"near"|"over"}
export interface InvestmentAssetSummary{name:string;type:string;invested:number;currentValue:number;gainLoss:number;lastUpdated:string}
export interface NudgeSnapshot{settings:SettingsMap;transactions:Transaction[];splits:Split[];investments:Investment[];goals:Goal[];budgets:Budget[];budgetProgress:BudgetProgress[];checkIns:DailyCheckIn[];journal:JournalEntry[];rewards:RewardEvent[];finance:FinanceSummary;openReceivable:number;previousFinance:FinanceSummary;growth:GrowthState;investment:{investedTotal:number;currentValue:number;gainLoss:number;allocation:Record<string,number>;activeAssets:number;assets:InvestmentAssetSummary[]};goalProgress:Array<Goal&{progress:number;remaining:number;monthsRemaining:number|null}>}
