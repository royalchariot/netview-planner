import { createContext, useContext, useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { createClient, type Session, type User } from "@supabase/supabase-js";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Bell,
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Gauge,
  Goal,
  CreditCard,
  Landmark,
  LogOut,
  LockKeyhole,
  Menu,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  adminCards,
  adminSections,
  aiPrompts,
  alerts,
  assetBreakdown,
  assetCategories,
  assets,
  blogIdeas,
  budgetLines,
  cashFlowSeries,
  currency,
  debtToIncome,
  documents,
  emergencyMonths,
  expenseCategories,
  featureBlocks,
  featureHighlights,
  financialHealthScore,
  forecastScenarios,
  goals,
  healthFactors,
  incomeTypes,
  investments,
  liabilityBreakdown,
  liquidSavings,
  loanSchedule,
  loanTypes,
  loans,
  mobileTabs,
  monthlyCashFlow,
  monthlyDebtPayments,
  monthlyExpenses,
  monthlyIncome,
  monthsToGoal,
  navItems,
  netWorth,
  netWorthSeries,
  onboardingSteps,
  percent,
  problemItems,
  progress,
  quickActions,
  reminders,
  reportTypes,
  savingsRate,
  settingsGroups,
  signedCurrency,
  solutionItems,
  statusForBudget,
  totalAssets,
  totalLiabilities,
  transactions,
  trustItems,
  futurePlans,
  incomeRules,
  receivables,
  survivalBudgets,
  type Asset,
  type BudgetLine,
  type FuturePlan,
  type GoalLine,
  type IncomeRule,
  type Loan,
  type NavItem,
  type Receivable,
  type Reminder,
  type SurvivalBudgetPlan,
  type Tone,
  type Transaction,
} from "./data";

const publicPages = ["home", "features", "about", "security", "blog", "contact", "login", "signup", "forgot", "reset-password"];
const authPages = ["login", "signup", "forgot", "reset-password", "onboarding"];
const appPages = navItems.filter((item) => item.group === "App").map((item) => item.id);
const RESET_STORAGE_KEY = "netview:data-reset";
const DATA_STORAGE_KEY = "netview:financial-data";
const DEMO_MODE_STORAGE_KEY = "netview:demo-mode";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
const authRedirectUrl =
  (import.meta.env.VITE_AUTH_REDIRECT_URL as string | undefined) ||
  "https://royalchariot.github.io/netview-planner/";
const passwordResetRedirectUrl = `${authRedirectUrl.replace(/\/?$/, "/")}#reset-password`;
const adminEmails = ((import.meta.env.VITE_ADMIN_EMAILS as string | undefined) || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const pageTitleOverrides: Record<string, string> = {
  transactions: "All Transactions",
  income: "Income / Pay Received",
  expenses: "Expenses",
  "cash-flow": "Cash Flow",
  debt: "Debt",
  budget: "Survival Budget",
  goals: "Future Plans",
  "savings-rate": "Savings Rate",
  "financial-health": "Financial Health",
};

function isSingleUserMode() {
  const configured = (import.meta.env.VITE_SINGLE_USER_MODE as string | undefined)?.toLowerCase();
  if (configured === "true") return true;
  if (configured === "false") return false;

  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function readInitialPage() {
  const hash = window.location.hash.replace("#", "");
  if (hash.includes("type=recovery") || hash.includes("access_token=")) return "reset-password";
  if (isSingleUserMode() && (!hash || publicPages.includes(hash) || authPages.includes(hash))) return "dashboard";
  return hash || "home";
}

function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path}`;
}

function readInitialResetState() {
  try {
    return window.localStorage.getItem(RESET_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function persistResetState(reset: boolean) {
  try {
    if (reset) {
      window.localStorage.setItem(RESET_STORAGE_KEY, "true");
      return;
    }

    window.localStorage.removeItem(RESET_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private browsing; the in-memory state still resets the app.
  }
}

function readInitialDemoMode() {
  try {
    return window.localStorage.getItem(DEMO_MODE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function persistDemoMode(enabled: boolean) {
  try {
    if (enabled) {
      window.localStorage.setItem(DEMO_MODE_STORAGE_KEY, "true");
      return;
    }

    window.localStorage.removeItem(DEMO_MODE_STORAGE_KEY);
  } catch {
    // Demo mode still works for the current runtime when storage is unavailable.
  }
}

type FinancialData = {
  alerts: typeof alerts;
  assetBreakdown: typeof assetBreakdown;
  assets: typeof assets;
  budgetLines: typeof budgetLines;
  cashFlowSeries: typeof cashFlowSeries;
  debtToIncome: number;
  documents: typeof documents;
  emergencyMonths: number;
  financialHealthScore: number;
  forecastScenarios: typeof forecastScenarios;
  futurePlans: FuturePlan[];
  goals: typeof goals;
  healthFactors: typeof healthFactors;
  incomeRules: IncomeRule[];
  investments: typeof investments;
  liabilityBreakdown: typeof liabilityBreakdown;
  liquidSavings: number;
  loanSchedule: typeof loanSchedule;
  loans: typeof loans;
  monthlyCashFlow: number;
  monthlyDebtPayments: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  netWorth: number;
  netWorthSeries: typeof netWorthSeries;
  receivables: Receivable[];
  reminders: typeof reminders;
  savingsRate: number;
  survivalBudgets: SurvivalBudgetPlan[];
  totalAssets: number;
  totalLiabilities: number;
  transactions: Transaction[];
};

const demoFinancialData: FinancialData = {
  alerts,
  assetBreakdown,
  assets,
  budgetLines,
  cashFlowSeries,
  debtToIncome,
  documents,
  emergencyMonths,
  financialHealthScore,
  forecastScenarios,
  futurePlans,
  goals,
  healthFactors,
  incomeRules,
  investments,
  liabilityBreakdown,
  liquidSavings,
  loanSchedule,
  loans,
  monthlyCashFlow,
  monthlyDebtPayments,
  monthlyExpenses,
  monthlyIncome,
  netWorth,
  netWorthSeries,
  receivables,
  reminders,
  savingsRate,
  survivalBudgets,
  totalAssets,
  totalLiabilities,
  transactions,
};

const emptyFinancialData: FinancialData = {
  alerts: [],
  assetBreakdown: [],
  assets: [],
  budgetLines: [],
  cashFlowSeries: [],
  debtToIncome: 0,
  documents: [],
  emergencyMonths: 0,
  financialHealthScore: 0,
  forecastScenarios: [],
  futurePlans: [],
  goals: [],
  healthFactors: [],
  incomeRules: [],
  investments: [],
  liabilityBreakdown: [],
  liquidSavings: 0,
  loanSchedule: [],
  loans: [],
  monthlyCashFlow: 0,
  monthlyDebtPayments: 0,
  monthlyExpenses: 0,
  monthlyIncome: 0,
  netWorth: 0,
  netWorthSeries: [],
  receivables: [],
  reminders: [],
  savingsRate: 0,
  survivalBudgets: [],
  totalAssets: 0,
  totalLiabilities: 0,
  transactions: [],
};

function financialRecordKey(...parts: Array<string | number | boolean | undefined | null>) {
  return parts.map((part) => String(part ?? "").trim().toLowerCase()).join("::");
}

function removeSeedRows<T>(rows: T[], seedRows: T[], keyFor: (row: T) => string) {
  const seedKeys = new Set(seedRows.map(keyFor));
  return rows.filter((row) => !seedKeys.has(keyFor(row)));
}

function stripDemoSeedData(data: FinancialData): FinancialData {
  const cleaned: FinancialData = {
    ...data,
    alerts: [],
    assetBreakdown: [],
    assets: removeSeedRows(data.assets, assets, (row) =>
      financialRecordKey(row.name, row.category, row.purchaseValue, row.currentValue, row.linkedLoan),
    ),
    budgetLines: removeSeedRows(data.budgetLines, budgetLines, (row) => financialRecordKey(row.category, row.budget, row.spent)),
    cashFlowSeries: removeSeedRows(data.cashFlowSeries, cashFlowSeries, (row) =>
      financialRecordKey(row.label, row.income, row.expenses, row.savings, row.debt),
    ),
    documents: removeSeedRows(data.documents, documents, (row) => financialRecordKey(row.name, row.type, row.linked)),
    forecastScenarios: removeSeedRows(data.forecastScenarios, forecastScenarios, (row) =>
      financialRecordKey(row.scenario, row.netWorth, row.debtLeft),
    ),
    futurePlans: removeSeedRows(data.futurePlans, futurePlans, (row) =>
      financialRecordKey(row.name, row.category, row.targetAmount, row.currentSaved, row.targetDate),
    ),
    goals: removeSeedRows(data.goals, goals, (row) => financialRecordKey(row.name, row.target, row.current, row.date)),
    healthFactors: [],
    incomeRules: removeSeedRows(data.incomeRules, incomeRules, (row) =>
      financialRecordKey(row.name, row.source, row.amount, row.startDate, row.frequency),
    ),
    investments: removeSeedRows(data.investments, investments, (row) => financialRecordKey(row.name, row.symbol, row.currentValue)),
    liabilityBreakdown: [],
    loanSchedule: removeSeedRows(data.loanSchedule, loanSchedule, (row) => financialRecordKey(row.month, row.opening, row.payment)),
    loans: removeSeedRows(data.loans, loans, (row) =>
      financialRecordKey(row.name, row.type, row.originalAmount, row.currentBalance, row.monthlyPayment),
    ),
    netWorthSeries: removeSeedRows(data.netWorthSeries, netWorthSeries, (row) => financialRecordKey(row.label, row.value)),
    receivables: removeSeedRows(data.receivables, receivables, (row) => financialRecordKey(row.person, row.reason, row.amountOwed)),
    reminders: removeSeedRows(data.reminders, reminders, (row) => financialRecordKey(row.day, row.title, row.amount)),
    survivalBudgets: removeSeedRows(data.survivalBudgets, survivalBudgets, (row) =>
      financialRecordKey(row.name, row.expenseGroup, row.totalAmount, row.tenureMonths),
    ),
    transactions: removeSeedRows(data.transactions, transactions, (row) =>
      financialRecordKey(row.date, row.type, row.account, row.category, row.source, row.amount),
    ),
  };

  return deriveFinancialData({ ...emptyFinancialData, ...cleaned });
}

function hasPersonalFinancialRecords(data: FinancialData) {
  return [
    data.assets,
    data.budgetLines,
    data.documents,
    data.forecastScenarios,
    data.futurePlans,
    data.goals,
    data.incomeRules,
    data.investments,
    data.loanSchedule,
    data.loans,
    data.receivables,
    data.reminders,
    data.survivalBudgets,
    data.transactions,
  ].some((rows) => rows.length > 0);
}

type FinancialDataUpdater = (current: FinancialData) => FinancialData;
type DataOperationResult = { ok: true } | { ok: false; message: string };

type DatabaseTransactionType = "income" | "expense" | "transfer";
type DatabaseTransactionStatus = "cleared" | "pending" | "review";
type DatabaseAssetCategory =
  | "cash"
  | "real_estate"
  | "vehicle"
  | "stocks"
  | "etf"
  | "crypto"
  | "retirement"
  | "gold"
  | "business"
  | "collectibles"
  | "other";
type DatabaseLoanType =
  | "mortgage"
  | "auto"
  | "student"
  | "credit_card"
  | "personal"
  | "business"
  | "medical"
  | "family"
  | "tax_debt"
  | "other";

type DatabaseTransactionRow = {
  id: string;
  date: string | null;
  type: DatabaseTransactionType | string | null;
  merchant_or_source: string | null;
  amount: number | string | null;
  payment_method: string | null;
  status: DatabaseTransactionStatus | string | null;
  tags: string[] | null;
};

type DatabaseAssetRow = {
  id: string;
  name: string | null;
  category: DatabaseAssetCategory | string | null;
  purchase_value: number | string | null;
  current_value: number | string | null;
  ownership_percent: number | string | null;
  last_updated: string | null;
  notes: string | null;
  updated_at?: string | null;
};

type DatabaseLoanRow = {
  id: string;
  name: string | null;
  type: DatabaseLoanType | string | null;
  original_amount: number | string | null;
  current_balance: number | string | null;
  interest_rate: number | string | null;
  monthly_payment: number | string | null;
  start_date: string | null;
  expected_end_date: string | null;
  remaining_months: number | string | null;
  notes: string | null;
};

const transactionTypeToDatabase: Record<Transaction["type"], DatabaseTransactionType> = {
  Expense: "expense",
  Income: "income",
  Transfer: "transfer",
};

const databaseAssetCategoryLabels: Record<DatabaseAssetCategory, string> = {
  business: "Business",
  cash: "Cash",
  collectibles: "Collectibles",
  crypto: "Crypto",
  etf: "ETF",
  gold: "Gold",
  other: "Other",
  real_estate: "Real estate",
  retirement: "Retirement",
  stocks: "Stocks",
  vehicle: "Vehicle",
};

const databaseLoanTypeLabels: Record<DatabaseLoanType, string> = {
  auto: "Auto loan",
  business: "Business loan",
  credit_card: "Credit card",
  family: "Family loan",
  medical: "Medical debt",
  mortgage: "Mortgage",
  other: "Other debt",
  personal: "Personal loan",
  student: "Student loan",
  tax_debt: "Tax debt",
};

function toNumber(value: number | string | null | undefined, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatIsoDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toIsoDate(value: string) {
  const trimmed = value.trim();
  const isoMatch = trimmed.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) return formatIsoDateValue(parsed);

  return formatIsoDateValue(new Date());
}

function formatStoredDate(value: string | null | undefined) {
  if (!value) return formatInputDate(formatIsoDateValue(new Date()));

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return formatInputDate(`${year}-${month}-${day}`);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(parsed);
}

function formatStoredMonth(value: string | null | undefined) {
  if (!value) return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date());

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const parsed = isoMatch
    ? new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]))
    : new Date(value);

  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(parsed);
}

function localRecordId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readTaggedValue(tags: string[] | null | undefined, prefix: string, fallback: string) {
  const tag = tags?.find((value) => value.startsWith(prefix));
  return tag ? tag.slice(prefix.length) : fallback;
}

function metadataNotes(values: Record<string, string | undefined>) {
  const entries = Object.entries(values).filter(([, value]) => value && value.trim());
  return entries.length ? JSON.stringify(Object.fromEntries(entries)) : null;
}

function parseMetadataNotes(notes: string | null | undefined) {
  if (!notes) return {};

  try {
    const parsed: unknown = JSON.parse(notes);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    );
  } catch {
    return {};
  }
}

function databaseTransactionType(type: string | null | undefined): Transaction["type"] {
  if (type === "income") return "Income";
  if (type === "transfer") return "Transfer";
  return "Expense";
}

function databaseAssetCategory(category: string | null | undefined): DatabaseAssetCategory {
  const value = (category ?? "").toLowerCase();
  if (/cash|bank|checking|saving|money|emergency/.test(value)) return "cash";
  if (/real|property|home|house/.test(value)) return "real_estate";
  if (/vehicle|car|auto/.test(value)) return "vehicle";
  if (/etf/.test(value)) return "etf";
  if (/crypto|bitcoin|ethereum/.test(value)) return "crypto";
  if (/retirement|401|ira/.test(value)) return "retirement";
  if (/gold|metal/.test(value)) return "gold";
  if (/business/.test(value)) return "business";
  if (/collect/.test(value)) return "collectibles";
  if (/stock|brokerage|investment/.test(value)) return "stocks";
  return "other";
}

function databaseLoanType(type: string | null | undefined): DatabaseLoanType {
  const value = (type ?? "").toLowerCase();
  if (/mortgage|home/.test(value)) return "mortgage";
  if (/auto|vehicle|car/.test(value)) return "auto";
  if (/student/.test(value)) return "student";
  if (/credit|card/.test(value)) return "credit_card";
  if (/business/.test(value)) return "business";
  if (/medical/.test(value)) return "medical";
  if (/family/.test(value)) return "family";
  if (/tax/.test(value)) return "tax_debt";
  if (/personal/.test(value)) return "personal";
  return "other";
}

function mapTransactionRow(row: DatabaseTransactionRow): Transaction {
  const type = databaseTransactionType(row.type);
  const rawAmount = toNumber(row.amount);

  return {
    id: row.id,
    account: readTaggedValue(row.tags, "account:", "Checking"),
    amount: type === "Income" ? rawAmount : -Math.abs(rawAmount),
    category: readTaggedValue(row.tags, "category:", type === "Income" ? "Income" : type === "Transfer" ? "Transfer" : "Uncategorized"),
    date: formatStoredDate(row.date),
    method: row.payment_method || (type === "Income" ? "ACH" : "Card"),
    source: row.merchant_or_source || "Untitled transaction",
    status: row.status === "cleared" ? "Cleared" : "Pending",
    type,
  };
}

function mapAssetRow(row: DatabaseAssetRow): Asset {
  const meta = parseMetadataNotes(row.notes);
  const fallbackCategory = databaseAssetCategoryLabels[databaseAssetCategory(row.category)];

  return {
    id: row.id,
    category: meta.categoryLabel || fallbackCategory,
    currentValue: toNumber(row.current_value),
    linkedLoan: meta.linkedLoan || undefined,
    name: row.name || "Untitled asset",
    ownership: toNumber(row.ownership_percent, 100),
    purchaseValue: toNumber(row.purchase_value),
    updated: formatStoredMonth(row.last_updated || row.updated_at),
  };
}

function mapLoanRow(row: DatabaseLoanRow): Loan {
  const meta = parseMetadataNotes(row.notes);
  const balance = toNumber(row.current_balance);
  const rate = toNumber(row.interest_rate);
  const remainingMonths = Math.round(toNumber(row.remaining_months, 0));

  return {
    id: row.id,
    currentBalance: balance,
    end: formatStoredMonth(row.expected_end_date),
    interestLeft: Math.round(balance * (rate / 100) * Math.max(remainingMonths, 12) / 24),
    linkedAsset: meta.linkedAsset || undefined,
    monthlyPayment: toNumber(row.monthly_payment),
    name: row.name || "Untitled loan",
    originalAmount: toNumber(row.original_amount, balance),
    rate,
    remainingMonths,
    start: formatStoredMonth(row.start_date),
    type: meta.typeLabel || databaseLoanTypeLabels[databaseLoanType(row.type)],
  };
}

function transactionInsertPayload(record: Transaction, userId: string) {
  return {
    amount: Math.abs(record.amount),
    currency: "USD",
    date: toIsoDate(record.date),
    is_recurring: false,
    merchant_or_source: record.source,
    payment_method: record.method,
    status: record.status === "Cleared" ? "cleared" : "pending",
    tags: [`account:${record.account}`, `category:${record.category}`],
    type: transactionTypeToDatabase[record.type],
    user_id: userId,
  };
}

function assetInsertPayload(record: Asset, userId: string) {
  return {
    category: databaseAssetCategory(record.category),
    current_value: record.currentValue,
    include_in_net_worth: true,
    last_updated: formatIsoDateValue(new Date()),
    name: record.name,
    notes: metadataNotes({ categoryLabel: record.category, linkedLoan: record.linkedLoan }),
    ownership_percent: record.ownership,
    purchase_value: record.purchaseValue,
    user_id: userId,
    valuation_method: "manual",
  };
}

function loanInsertPayload(record: Loan, userId: string) {
  return {
    current_balance: record.currentBalance,
    expected_end_date: toIsoDate(record.end),
    interest_rate: record.rate,
    is_active: true,
    monthly_payment: record.monthlyPayment,
    name: record.name,
    notes: metadataNotes({ linkedAsset: record.linkedAsset, typeLabel: record.type }),
    original_amount: record.originalAmount,
    payoff_strategy: "manual",
    remaining_months: record.remainingMonths,
    start_date: toIsoDate(record.start),
    type: databaseLoanType(record.type),
    user_id: userId,
  };
}

function removeFirstRecord<T>(rows: T[], predicate: (row: T) => boolean) {
  const index = rows.findIndex(predicate);
  return index === -1 ? rows : rows.filter((_, rowIndex) => rowIndex !== index);
}

function replaceFirstRecord<T>(rows: T[], predicate: (row: T) => boolean, replacement: T) {
  const index = rows.findIndex(predicate);
  return index === -1 ? [replacement, ...rows] : rows.map((row, rowIndex) => (rowIndex === index ? replacement : row));
}

function sameTransaction(left: Transaction, right: Transaction) {
  return (
    left.date === right.date &&
    left.type === right.type &&
    left.account === right.account &&
    left.category === right.category &&
    left.source === right.source &&
    left.amount === right.amount &&
    left.method === right.method &&
    left.status === right.status
  );
}

function sameAsset(left: Asset, right: Asset) {
  return left.name === right.name && left.category === right.category && left.currentValue === right.currentValue;
}

function sameLoan(left: Loan, right: Loan) {
  return left.name === right.name && left.type === right.type && left.currentBalance === right.currentBalance;
}

type IncomeForecastEntry = {
  rule: IncomeRule;
  date: Date;
  status: "Posted income" | "Expected income" | "Missed income";
};

type MonthlyPlannerSummary = {
  actualExpenses: number;
  cashAvailable: number;
  expectedIncome: number;
  freeMoneyAvailable: number;
  futurePlanSavingsRequired: number;
  incomeReceived: number;
  loanRepaymentsDue: number;
  moneyOwedToMe: number;
  monthlyKeepAside: number;
  netWorthWithReceivables: number;
  openingCash: number;
  postedIncome: number;
  receivablesExpected: number;
  safeToSpend: number;
  shortageOrSurplus: number;
  survivalAllocation: number;
  totalAssets: number;
  totalDebts: number;
};

function parsePlannerDate(value: string | undefined, fallback = new Date()) {
  if (!value) return fallback;
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function monthStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthEnd(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function isSameMonth(date: Date, reference = new Date()) {
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth();
}

function formatPlannerDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function addFrequencyDate(date: Date, frequency: string) {
  const next = new Date(date);
  const normalized = frequency.toLowerCase();

  if (normalized === "daily") next.setDate(next.getDate() + 1);
  else if (normalized === "weekly") next.setDate(next.getDate() + 7);
  else if (normalized === "every 2 weeks") next.setDate(next.getDate() + 14);
  else if (normalized === "twice a month") next.setDate(next.getDate() + 15);
  else if (normalized === "quarterly") next.setMonth(next.getMonth() + 3);
  else if (normalized === "yearly") next.setFullYear(next.getFullYear() + 1);
  else next.setMonth(next.getMonth() + 1);

  return next;
}

function buildIncomeForecastEntries(rules: IncomeRule[], transactions: Transaction[], reference = new Date()) {
  const start = monthStart(reference);
  const end = monthEnd(reference);
  const postedMatches = new Set<string>();
  const postedRows = transactions.filter((row) => row.type === "Income" && row.status === "Cleared" && isSameMonth(parsePlannerDate(row.date), reference));
  const entries: IncomeForecastEntry[] = [];

  rules.forEach((rule) => {
    let occurrence = parsePlannerDate(rule.startDate, start);
    const stopDate = rule.endDate ? parsePlannerDate(rule.endDate, end) : end;
    let guard = 0;

    while (occurrence < start && guard < 120) {
      if (rule.frequency.toLowerCase() === "one time") break;
      occurrence = addFrequencyDate(occurrence, rule.frequency);
      guard += 1;
    }

    while (occurrence <= end && occurrence <= stopDate && guard < 180) {
      if (occurrence >= start) {
        const postedIndex = postedRows.findIndex((row, index) => {
          if (postedMatches.has(`${rule.name}-${index}`)) return false;
          return row.source.toLowerCase() === rule.source.toLowerCase() && Math.abs(row.amount - rule.amount) < 1;
        });
        const posted = postedIndex >= 0;

        if (posted) postedMatches.add(`${rule.name}-${postedIndex}`);

        entries.push({
          date: new Date(occurrence),
          rule,
          status: posted ? "Posted income" : occurrence < reference ? "Missed income" : "Expected income",
        });
      }

      if (rule.frequency.toLowerCase() === "one time") break;
      occurrence = addFrequencyDate(occurrence, rule.frequency);
      guard += 1;
    }
  });

  return entries.sort((left, right) => left.date.getTime() - right.date.getTime());
}

function receivableRemaining(row: Receivable) {
  return Math.max(row.amountOwed - row.amountReceived, 0);
}

function survivalMonthlyAllocation(row: SurvivalBudgetPlan) {
  return row.tenureMonths > 0 ? row.totalAmount / row.tenureMonths : row.totalAmount;
}

function monthsUntil(targetDate: string, reference = new Date()) {
  const target = parsePlannerDate(targetDate, reference);
  const months = (target.getFullYear() - reference.getFullYear()) * 12 + target.getMonth() - reference.getMonth();
  return Math.max(months, 1);
}

function futurePlanMonthlyRequired(plan: FuturePlan, reference = new Date()) {
  const remaining = Math.max(plan.targetAmount - plan.currentSaved, 0);
  return remaining / monthsUntil(plan.targetDate, reference);
}

function futurePlanStatus(plan: FuturePlan, reference = new Date()) {
  if (plan.currentSaved >= plan.targetAmount) return { label: "Ahead", tone: "success" as Tone };
  const target = parsePlannerDate(plan.targetDate, reference);
  const totalMonths = Math.max(monthsUntil(plan.targetDate, parsePlannerDate("Jan 1, 2026")), 1);
  const elapsedMonths = Math.max(totalMonths - monthsUntil(plan.targetDate, reference), 0);
  const expectedSaved = target > reference ? (plan.targetAmount / totalMonths) * elapsedMonths : plan.targetAmount;
  if (plan.currentSaved + futurePlanMonthlyRequired(plan, reference) >= expectedSaved) return { label: "On track", tone: "success" as Tone };
  return { label: "Behind", tone: "warning" as Tone };
}

function calculateMonthlyPlannerSummary(data: FinancialData, reference = new Date()): MonthlyPlannerSummary {
  const incomeForecast = buildIncomeForecastEntries(data.incomeRules, data.transactions, reference);
  const openingCash = data.assets
    .filter((asset) => /cash|bank|checking|saving|wallet|money/i.test(`${asset.name} ${asset.category}`))
    .reduce((sum, asset) => sum + asset.currentValue * (asset.ownership / 100), 0);
  const postedIncome = data.transactions
    .filter((row) => row.type === "Income" && row.status === "Cleared" && isSameMonth(parsePlannerDate(row.date), reference))
    .reduce((sum, row) => sum + row.amount, 0);
  const expectedIncome = incomeForecast
    .filter((entry) => entry.status === "Expected income")
    .reduce((sum, entry) => sum + entry.rule.amount, 0);
  const receivablesExpected = data.receivables
    .filter((row) => row.status !== "Paid" && isSameMonth(parsePlannerDate(row.dueDate), reference))
    .reduce((sum, row) => sum + receivableRemaining(row), 0);
  const actualExpenses = data.transactions
    .filter((row) => row.type === "Expense" && row.status === "Cleared" && isSameMonth(parsePlannerDate(row.date), reference))
    .reduce((sum, row) => sum + Math.abs(row.amount), 0);
  const loanRepaymentsDue = data.loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
  const survivalAllocation = data.survivalBudgets.reduce((sum, row) => sum + survivalMonthlyAllocation(row), 0);
  const futurePlanSavingsRequired = data.futurePlans.reduce((sum, plan) => sum + futurePlanMonthlyRequired(plan, reference), 0);
  const moneyOwedToMe = data.receivables.reduce((sum, row) => sum + receivableRemaining(row), 0);
  const totalAssetsValue = data.assets.reduce((sum, asset) => sum + asset.currentValue * (asset.ownership / 100), 0);
  const totalDebts = data.loans.reduce((sum, loan) => sum + loan.currentBalance, 0);
  const cashAvailable = openingCash + postedIncome + expectedIncome + receivablesExpected;
  const monthlyKeepAside = survivalAllocation + futurePlanSavingsRequired + loanRepaymentsDue;
  const safeToSpend = cashAvailable - monthlyKeepAside - actualExpenses;

  return {
    actualExpenses,
    cashAvailable,
    expectedIncome,
    freeMoneyAvailable: safeToSpend,
    futurePlanSavingsRequired,
    incomeReceived: postedIncome,
    loanRepaymentsDue,
    moneyOwedToMe,
    monthlyKeepAside,
    netWorthWithReceivables: totalAssetsValue + moneyOwedToMe - totalDebts,
    openingCash,
    postedIncome,
    receivablesExpected,
    safeToSpend,
    shortageOrSurplus: safeToSpend,
    survivalAllocation,
    totalAssets: totalAssetsValue,
    totalDebts,
  };
}

function readInitialFinancialData(reset: boolean, singleUserMode = false) {
  try {
    const stored = window.localStorage.getItem(DATA_STORAGE_KEY);
    if (stored) {
      const storedData = deriveFinancialData({ ...emptyFinancialData, ...JSON.parse(stored) });
      return singleUserMode ? stripDemoSeedData(storedData) : storedData;
    }
  } catch {
    // Fall back to a clean workspace or built-in dataset when stored data cannot be read.
  }

  return reset || singleUserMode ? emptyFinancialData : demoFinancialData;
}

function persistFinancialData(data: FinancialData) {
  try {
    window.localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Runtime state still updates when browser storage is unavailable.
  }
}

function clearPersistedFinancialData() {
  try {
    window.localStorage.removeItem(DATA_STORAGE_KEY);
  } catch {
    // Runtime state still resets when browser storage is unavailable.
  }
}

function sumAmounts<T extends { amount: number }>(rows: T[], predicate: (row: T) => boolean) {
  return rows.filter(predicate).reduce((sum, row) => sum + row.amount, 0);
}

function buildAssetBreakdown(assetRows: Asset[]) {
  const groups = new Map<string, { label: string; value: number; color: string }>();
  const add = (label: string, value: number, color: string) => {
    groups.set(label, { label, value: (groups.get(label)?.value ?? 0) + value, color });
  };

  assetRows.forEach((asset) => {
    const category = asset.category.toLowerCase();
    const ownedValue = asset.currentValue * (asset.ownership / 100);
    if (/cash|checking|saving|money|bank|emergency/.test(category)) add("Cash", ownedValue, "emerald");
    else if (/real|property|home/.test(category)) add("Property", ownedValue, "blue");
    else if (/vehicle|car|auto/.test(category)) add("Vehicles", ownedValue, "amber");
    else if (/crypto/.test(category)) add("Crypto", ownedValue, "red");
    else add("Investments", ownedValue, "violet");
  });

  return Array.from(groups.values()).filter((row) => row.value > 0);
}

function buildLiabilityBreakdown(loanRows: Loan[]) {
  const groups = new Map<string, { label: string; value: number; color: string }>();
  const add = (label: string, value: number, color: string) => {
    groups.set(label, { label, value: (groups.get(label)?.value ?? 0) + value, color });
  };

  loanRows.forEach((loan) => {
    const type = loan.type.toLowerCase();
    if (/mortgage|home/.test(type)) add("Mortgage", loan.currentBalance, "blue");
    else if (/auto|vehicle|car/.test(type)) add("Auto loan", loan.currentBalance, "amber");
    else if (/student/.test(type)) add("Student loan", loan.currentBalance, "violet");
    else if (/card|credit/.test(type)) add("Credit card", loan.currentBalance, "red");
    else add(loan.type || "Other debt", loan.currentBalance, "red");
  });

  return Array.from(groups.values()).filter((row) => row.value > 0);
}

function deriveFinancialData(data: FinancialData): FinancialData {
  const income = sumAmounts(data.transactions, (row) => row.type === "Income" && row.status === "Cleared");
  const expenses = data.transactions
    .filter((row) => row.type === "Expense" && row.status === "Cleared")
    .reduce((sum, row) => sum + Math.abs(row.amount), 0);
  const totalAssetValue = data.assets.reduce((sum, asset) => sum + asset.currentValue * (asset.ownership / 100), 0);
  const totalDebtValue = data.loans.reduce((sum, loan) => sum + loan.currentBalance, 0);
  const debtPayments = data.loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
  const cashFlow = income - expenses;
  const savingsPercent = income > 0 ? Math.round((cashFlow / income) * 100) : 0;
  const debtPercent = income > 0 ? Math.round((debtPayments / income) * 100) : 0;
  const liquidAssetValue = data.assets
    .filter((asset) => /cash|checking|saving|money_market|bank|emergency/i.test(`${asset.name} ${asset.category}`))
    .reduce((sum, asset) => sum + asset.currentValue * (asset.ownership / 100), 0);
  const fixedBudgetSpend = data.budgetLines
    .filter((line) => line.kind === "fixed")
    .reduce((sum, line) => sum + line.spent, 0);
  const essentialMonthlySpend = fixedBudgetSpend > 0 ? fixedBudgetSpend : expenses > 0 ? expenses * 0.65 : 0;
  const runway = essentialMonthlySpend > 0 ? +(liquidAssetValue / essentialMonthlySpend).toFixed(1) : 0;
  const assetRows = buildAssetBreakdown(data.assets);
  const liabilityRows = buildLiabilityBreakdown(data.loans);
  const overBudgetCount = data.budgetLines.filter((line) => line.spent > line.budget).length;
  const overBudgetPercent = data.budgetLines.length > 0 ? (overBudgetCount / data.budgetLines.length) * 100 : null;
  const netWorthValues = data.netWorthSeries.map((row) => row.value);
  const lastThreeNetWorth = netWorthValues.slice(-3);
  const highInterestDebt = data.loans.some((loan) => loan.rate > 20 && loan.currentBalance > 0);
  const allLoansCurrent = data.reminders.every((reminder) => reminder.tone !== "danger");
  const fundedGoals = data.goals.filter((goal) => goal.current > 0);
  const onTrackGoals = data.goals.filter((goal) => {
    const months = monthsToGoal(goal);
    return goal.current >= goal.target || (months > 0 && goal.monthly >= (goal.target - goal.current) / months);
  });
  const cashFlowScore = income <= 0 ? 0 : cashFlow < 0 ? 2 : cashFlow <= income * 0.05 ? 6 : cashFlow <= income * 0.15 ? 10 : 15;
  const savingsScore = savingsPercent < 0 ? 0 : savingsPercent < 5 ? 4 : savingsPercent < 10 ? 7 : savingsPercent < 20 ? 11 : 15;
  const emergencyScore = runway <= 0 ? 0 : runway < 1 ? 3 : runway < 3 ? 7 : runway < 6 ? 12 : 15;
  const dtiScore = income <= 0 ? 0 : debtPercent < 20 ? 15 : debtPercent < 35 ? 11 : debtPercent < 45 ? 7 : debtPercent < 55 ? 3 : 0;
  const budgetScore = overBudgetPercent === null ? 2 : overBudgetPercent === 0 ? 10 : overBudgetPercent < 10 ? 8 : overBudgetPercent <= 30 ? 6 : 3;
  const debtRiskScore = data.loans.length === 0 ? 10 : highInterestDebt ? 3 : allLoansCurrent ? 9 : 6;
  const netWorthTrendScore =
    lastThreeNetWorth.length < 3
      ? totalAssetValue - totalDebtValue > 0
        ? 7
        : 5
      : lastThreeNetWorth[2] < lastThreeNetWorth[0]
        ? 2
        : lastThreeNetWorth[2] === lastThreeNetWorth[0]
          ? 5
          : lastThreeNetWorth[0] < lastThreeNetWorth[1] && lastThreeNetWorth[1] < lastThreeNetWorth[2]
            ? 10
            : 7;
  const goalScore = data.goals.length === 0 ? 1 : fundedGoals.length === 0 ? 2 : onTrackGoals.length >= Math.ceil(data.goals.length / 2) ? 5 : 4;
  const recordsScore = data.documents.length === 0 && data.reminders.length === 0 ? 1 : data.documents.length === 0 ? 2 : data.reminders.some((reminder) => reminder.tone === "danger") ? 4 : 5;
  const nextCashFlowSeries =
    income > 0 || expenses > 0 || debtPayments > 0
      ? [
          ...data.cashFlowSeries.filter((row) => row.label !== "Jul"),
          { label: "Jul", income, expenses, savings: Math.max(cashFlow - debtPayments, 0), debt: debtPayments },
        ]
      : [];
  const nextNetWorthSeries =
    totalAssetValue > 0 || totalDebtValue > 0
      ? [...data.netWorthSeries.filter((row) => row.label !== "Jul"), { label: "Jul", value: totalAssetValue - totalDebtValue }]
      : [];
  const nextHealthFactors = [
    { label: "Cash flow stability", weight: 15, score: cashFlowScore },
    { label: "Savings rate", weight: 15, score: savingsScore },
    { label: "Emergency fund", weight: 15, score: emergencyScore },
    { label: "Debt-to-income", weight: 15, score: dtiScore },
    { label: "Budget control", weight: 10, score: budgetScore },
    { label: "Debt risk", weight: 10, score: debtRiskScore },
    { label: "Net worth trend", weight: 10, score: netWorthTrendScore },
    { label: "Goal progress", weight: 5, score: goalScore },
    { label: "Records and readiness", weight: 5, score: recordsScore },
  ];

  return {
    ...data,
    assetBreakdown: assetRows,
    cashFlowSeries: nextCashFlowSeries,
    debtToIncome: debtPercent,
    emergencyMonths: runway,
    financialHealthScore: nextHealthFactors.reduce((sum, factor) => sum + factor.score, 0),
    healthFactors: nextHealthFactors,
    liabilityBreakdown: liabilityRows,
    liquidSavings: liquidAssetValue,
    monthlyCashFlow: cashFlow,
    monthlyDebtPayments: debtPayments,
    monthlyExpenses: expenses,
    monthlyIncome: income,
    netWorth: totalAssetValue - totalDebtValue,
    netWorthSeries: nextNetWorthSeries,
    savingsRate: savingsPercent,
    totalAssets: totalAssetValue,
    totalLiabilities: totalDebtValue,
  };
}

type ResetControls = {
  dataReset: boolean;
  demoMode: boolean;
  openDemoWorkspace: () => void;
  resetWorkspace: () => Promise<void>;
  restoreDemoData: () => void;
};

type FinancialDataActions = {
  deleteAsset: (record: Asset) => Promise<DataOperationResult>;
  deleteLoan: (record: Loan) => Promise<DataOperationResult>;
  deleteTransaction: (record: Transaction) => Promise<DataOperationResult>;
  saveAsset: (record: Asset) => Promise<DataOperationResult>;
  saveLoan: (record: Loan) => Promise<DataOperationResult>;
  saveTransaction: (record: Transaction) => Promise<DataOperationResult>;
  updateAsset: (record: Asset, previous?: Asset) => Promise<DataOperationResult>;
  updateFinancialData: (updater: FinancialDataUpdater) => void;
  updateLoan: (record: Loan, previous?: Loan) => Promise<DataOperationResult>;
  updateTransaction: (record: Transaction, previous?: Transaction) => Promise<DataOperationResult>;
};

type AuthContextValue = {
  authLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  session: Session | null;
  signOut: () => Promise<void>;
  user: User | null;
};

const FinancialDataContext = createContext<FinancialData>(demoFinancialData);
const FinancialDataActionsContext = createContext<FinancialDataActions>({
  deleteAsset: async () => ({ ok: true }),
  deleteLoan: async () => ({ ok: true }),
  deleteTransaction: async () => ({ ok: true }),
  saveAsset: async () => ({ ok: true }),
  saveLoan: async () => ({ ok: true }),
  saveTransaction: async () => ({ ok: true }),
  updateAsset: async () => ({ ok: true }),
  updateFinancialData: () => undefined,
  updateLoan: async () => ({ ok: true }),
  updateTransaction: async () => ({ ok: true }),
});
const ResetControlsContext = createContext<ResetControls>({
  dataReset: false,
  demoMode: false,
  openDemoWorkspace: () => undefined,
  resetWorkspace: async () => undefined,
  restoreDemoData: () => undefined,
});
const AuthContext = createContext<AuthContextValue>({
  authLoading: false,
  isAdmin: false,
  isAuthenticated: false,
  session: null,
  signOut: async () => undefined,
  user: null,
});

function useFinancialData() {
  return useContext(FinancialDataContext);
}

function useFinancialDataActions() {
  return useContext(FinancialDataActionsContext);
}

function useResetControls() {
  return useContext(ResetControlsContext);
}

function useAuth() {
  return useContext(AuthContext);
}

function isProtectedPage(page: string) {
  return appPages.includes(page) || page === "admin" || page === "onboarding" || page in pageTitleOverrides;
}

function isWorkspaceShellPage(page: string) {
  return appPages.includes(page) || page === "admin" || page in pageTitleOverrides;
}

function isAdminUser(user: User | null) {
  if (!user) return false;
  const metadataRole = user.app_metadata?.role || user.user_metadata?.role;
  return metadataRole === "admin" || adminEmails.includes(user.email?.toLowerCase() ?? "");
}

function userDisplayName(user: User | null) {
  if (!user) return "Account";
  return user.user_metadata?.full_name || user.email || "Account";
}

export default function App() {
  const singleUserMode = isSingleUserMode();
  const [page, setPageState] = useState(readInitialPage);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataReset, setDataReset] = useState(readInitialResetState);
  const [demoMode, setDemoMode] = useState(() => (singleUserMode ? false : readInitialDemoMode()));
  const [workspaceData, setWorkspaceData] = useState(() => readInitialFinancialData(readInitialResetState(), singleUserMode));
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(Boolean(supabase) && !singleUserMode);

  useEffect(() => {
    if (!singleUserMode) return;

    const cleanedData = stripDemoSeedData(workspaceData);
    const isEmpty = !hasPersonalFinancialRecords(cleanedData);

    persistDemoMode(false);
    persistFinancialData(cleanedData);
    persistResetState(isEmpty);
    setDemoMode(false);
    setWorkspaceData(cleanedData);
    setDataReset(isEmpty);
  }, [singleUserMode]);

  useEffect(() => {
    const onHashChange = () => setPageState(readInitialPage());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const setPage = (nextPage: string) => {
    const resolvedPage = singleUserMode && (publicPages.includes(nextPage) || authPages.includes(nextPage)) ? "dashboard" : nextPage;
    setSidebarOpen(false);
    if (window.location.hash !== `#${resolvedPage}`) window.location.hash = resolvedPage;
    setPageState(resolvedPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exitDemoModeForSession = () => {
    persistDemoMode(false);
    setDemoMode((wasDemo) => {
      if (wasDemo) {
        persistResetState(true);
        clearPersistedFinancialData();
        setWorkspaceData(emptyFinancialData);
        setDataReset(true);
      }

      return false;
    });
  };

  useEffect(() => {
    if (singleUserMode || !supabase) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        if (data.session) exitDemoModeForSession();
      })
      .finally(() => {
        if (mounted) setAuthLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);

      if (nextSession) {
        exitDemoModeForSession();
      }

      if (event === "PASSWORD_RECOVERY") setPage("reset-password");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [singleUserMode]);

  useEffect(() => {
    if (singleUserMode || !supabase || !session || demoMode) return;

    let mounted = true;

    const loadWorkspaceData = async () => {
      const [transactionResult, assetResult, loanResult] = await Promise.all([
        supabase.from("transactions").select("*").eq("user_id", session.user.id).order("date", { ascending: false }),
        supabase.from("assets").select("*").eq("user_id", session.user.id).order("updated_at", { ascending: false }),
        supabase.from("loans").select("*").eq("user_id", session.user.id).order("updated_at", { ascending: false }),
      ]);

      if (!mounted) return;

      const error = transactionResult.error || assetResult.error || loanResult.error;
      if (error) {
        console.error("Unable to load Supabase workspace data:", error.message);
        return;
      }

      const localPlannerData = readInitialFinancialData(readInitialResetState());
      const nextData = deriveFinancialData({
        ...emptyFinancialData,
        budgetLines: localPlannerData.budgetLines,
        forecastScenarios: localPlannerData.forecastScenarios,
        futurePlans: localPlannerData.futurePlans,
        goals: localPlannerData.goals,
        incomeRules: localPlannerData.incomeRules,
        investments: localPlannerData.investments,
        receivables: localPlannerData.receivables,
        reminders: localPlannerData.reminders,
        survivalBudgets: localPlannerData.survivalBudgets,
        assets: (assetResult.data ?? []).map((row) => mapAssetRow(row as DatabaseAssetRow)),
        loans: (loanResult.data ?? []).map((row) => mapLoanRow(row as DatabaseLoanRow)),
        transactions: (transactionResult.data ?? []).map((row) => mapTransactionRow(row as DatabaseTransactionRow)),
      });

      persistFinancialData(nextData);
      persistResetState(false);
      setWorkspaceData(nextData);
      setDataReset(false);
    };

    void loadWorkspaceData();

    return () => {
      mounted = false;
    };
  }, [session, demoMode, singleUserMode]);

  const updateFinancialData = (updater: FinancialDataUpdater) => {
    setWorkspaceData((current) => {
      const next = deriveFinancialData(updater(current));

      persistFinancialData(next);

      return next;
    });
  };

  const saveTransaction = async (record: Transaction): Promise<DataOperationResult> => {
    if (!supabase || !session || demoMode) {
      const saved = { ...record, id: record.id ?? localRecordId("transaction") };
      updateFinancialData((current) => ({ ...current, transactions: [saved, ...current.transactions] }));
      return { ok: true };
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert(transactionInsertPayload(record, session.user.id))
      .select("*")
      .single();

    if (error) return { ok: false, message: error.message };

    const saved = mapTransactionRow(data as DatabaseTransactionRow);
    updateFinancialData((current) => ({ ...current, transactions: [saved, ...current.transactions] }));
    return { ok: true };
  };

  const updateTransaction = async (record: Transaction, previous?: Transaction): Promise<DataOperationResult> => {
    if (supabase && session && !demoMode && !record.id) return saveTransaction(record);

    if (supabase && session && !demoMode && record.id) {
      const { data, error } = await supabase
        .from("transactions")
        .update(transactionInsertPayload(record, session.user.id))
        .eq("id", record.id)
        .eq("user_id", session.user.id)
        .select("*")
        .single();

      if (error) return { ok: false, message: error.message };

      const saved = mapTransactionRow(data as DatabaseTransactionRow);
      updateFinancialData((current) => ({
        ...current,
        transactions: replaceFirstRecord(current.transactions, (row) => row.id === saved.id, saved),
      }));
      return { ok: true };
    }

    const targetId = record.id ?? previous?.id;
    const saved = { ...record, id: targetId ?? localRecordId("transaction") };
    updateFinancialData((current) => ({
      ...current,
      transactions: replaceFirstRecord(
        current.transactions,
        (row) => (targetId ? row.id === targetId : previous ? sameTransaction(row, previous) : sameTransaction(row, record)),
        saved,
      ),
    }));
    return { ok: true };
  };

  const deleteTransaction = async (record: Transaction): Promise<DataOperationResult> => {
    if (supabase && session && !demoMode && record.id) {
      const { error } = await supabase.from("transactions").delete().eq("id", record.id).eq("user_id", session.user.id);
      if (error) return { ok: false, message: error.message };
    }

    updateFinancialData((current) => ({
      ...current,
      transactions: removeFirstRecord(current.transactions, (row) => (record.id ? row.id === record.id : sameTransaction(row, record))),
    }));
    return { ok: true };
  };

  const saveAsset = async (record: Asset): Promise<DataOperationResult> => {
    if (!supabase || !session || demoMode) {
      const saved = { ...record, id: record.id ?? localRecordId("asset") };
      updateFinancialData((current) => ({ ...current, assets: [saved, ...current.assets] }));
      return { ok: true };
    }

    const { data, error } = await supabase
      .from("assets")
      .insert(assetInsertPayload(record, session.user.id))
      .select("*")
      .single();

    if (error) return { ok: false, message: error.message };

    const saved = mapAssetRow(data as DatabaseAssetRow);
    updateFinancialData((current) => ({ ...current, assets: [saved, ...current.assets] }));
    return { ok: true };
  };

  const updateAsset = async (record: Asset, previous?: Asset): Promise<DataOperationResult> => {
    if (supabase && session && !demoMode && !record.id) return saveAsset(record);

    if (supabase && session && !demoMode && record.id) {
      const { data, error } = await supabase
        .from("assets")
        .update(assetInsertPayload(record, session.user.id))
        .eq("id", record.id)
        .eq("user_id", session.user.id)
        .select("*")
        .single();

      if (error) return { ok: false, message: error.message };

      const saved = mapAssetRow(data as DatabaseAssetRow);
      updateFinancialData((current) => ({
        ...current,
        assets: replaceFirstRecord(current.assets, (row) => row.id === saved.id, saved),
      }));
      return { ok: true };
    }

    const targetId = record.id ?? previous?.id;
    const saved = { ...record, id: targetId ?? localRecordId("asset") };
    updateFinancialData((current) => ({
      ...current,
      assets: replaceFirstRecord(
        current.assets,
        (row) => (targetId ? row.id === targetId : previous ? sameAsset(row, previous) : sameAsset(row, record)),
        saved,
      ),
    }));
    return { ok: true };
  };

  const deleteAsset = async (record: Asset): Promise<DataOperationResult> => {
    if (supabase && session && !demoMode && record.id) {
      const { error } = await supabase.from("assets").delete().eq("id", record.id).eq("user_id", session.user.id);
      if (error) return { ok: false, message: error.message };
    }

    updateFinancialData((current) => ({
      ...current,
      assets: removeFirstRecord(current.assets, (row) => (record.id ? row.id === record.id : sameAsset(row, record))),
    }));
    return { ok: true };
  };

  const saveLoan = async (record: Loan): Promise<DataOperationResult> => {
    if (!supabase || !session || demoMode) {
      const saved = { ...record, id: record.id ?? localRecordId("loan") };
      updateFinancialData((current) => ({ ...current, loans: [saved, ...current.loans] }));
      return { ok: true };
    }

    const { data, error } = await supabase
      .from("loans")
      .insert(loanInsertPayload(record, session.user.id))
      .select("*")
      .single();

    if (error) return { ok: false, message: error.message };

    const saved = mapLoanRow(data as DatabaseLoanRow);
    updateFinancialData((current) => ({ ...current, loans: [saved, ...current.loans] }));
    return { ok: true };
  };

  const updateLoan = async (record: Loan, previous?: Loan): Promise<DataOperationResult> => {
    if (supabase && session && !demoMode && !record.id) return saveLoan(record);

    if (supabase && session && !demoMode && record.id) {
      const { data, error } = await supabase
        .from("loans")
        .update(loanInsertPayload(record, session.user.id))
        .eq("id", record.id)
        .eq("user_id", session.user.id)
        .select("*")
        .single();

      if (error) return { ok: false, message: error.message };

      const saved = mapLoanRow(data as DatabaseLoanRow);
      updateFinancialData((current) => ({
        ...current,
        loans: replaceFirstRecord(current.loans, (row) => row.id === saved.id, saved),
      }));
      return { ok: true };
    }

    const targetId = record.id ?? previous?.id;
    const saved = { ...record, id: targetId ?? localRecordId("loan") };
    updateFinancialData((current) => ({
      ...current,
      loans: replaceFirstRecord(
        current.loans,
        (row) => (targetId ? row.id === targetId : previous ? sameLoan(row, previous) : sameLoan(row, record)),
        saved,
      ),
    }));
    return { ok: true };
  };

  const deleteLoan = async (record: Loan): Promise<DataOperationResult> => {
    if (supabase && session && !demoMode && record.id) {
      const { error } = await supabase.from("loans").delete().eq("id", record.id).eq("user_id", session.user.id);
      if (error) return { ok: false, message: error.message };
    }

    updateFinancialData((current) => ({
      ...current,
      loans: removeFirstRecord(current.loans, (row) => (record.id ? row.id === record.id : sameLoan(row, record))),
    }));
    return { ok: true };
  };

  const resetWorkspace = async () => {
    if (!singleUserMode && supabase && session && !demoMode) {
      const [transactionResult, assetResult, loanResult] = await Promise.all([
        supabase.from("transactions").delete().eq("user_id", session.user.id),
        supabase.from("assets").delete().eq("user_id", session.user.id),
        supabase.from("loans").delete().eq("user_id", session.user.id),
      ]);
      const error = transactionResult.error || assetResult.error || loanResult.error;

      if (error) {
        window.alert(`Could not reset Supabase workspace data: ${error.message}`);
        return;
      }
    }

    persistDemoMode(false);
    persistResetState(true);
    clearPersistedFinancialData();
    setDemoMode(false);
    setWorkspaceData(emptyFinancialData);
    setDataReset(true);
    setPage("onboarding");
  };

  const restoreDemoData = () => {
    if (singleUserMode) {
      persistDemoMode(false);
      persistResetState(true);
      clearPersistedFinancialData();
      setDemoMode(false);
      setWorkspaceData(emptyFinancialData);
      setDataReset(true);
      setPage("dashboard");
      return;
    }

    persistResetState(false);
    clearPersistedFinancialData();
    setWorkspaceData(demoFinancialData);
    setDataReset(false);
    setPage("dashboard");
  };

  const openDemoWorkspace = () => {
    if (singleUserMode) {
      persistDemoMode(false);
      persistResetState(true);
      clearPersistedFinancialData();
      setDemoMode(false);
      setWorkspaceData(emptyFinancialData);
      setDataReset(true);
      setPage("dashboard");
      return;
    }

    persistDemoMode(true);
    persistResetState(false);
    clearPersistedFinancialData();
    setDemoMode(true);
    setWorkspaceData(demoFinancialData);
    setDataReset(false);
    setPage("dashboard");
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    persistDemoMode(false);
    setDemoMode(false);
    setPage(singleUserMode ? "dashboard" : "login");
  };

  const isAuthenticated = singleUserMode || Boolean(session);
  const isAdmin = isAdminUser(session?.user ?? null);
  const routeBlocked = !singleUserMode && isProtectedPage(page) && !authLoading && !isAuthenticated && !demoMode;
  const adminBlocked = page === "admin" && !authLoading && isAuthenticated && !isAdmin;
  const visiblePage = routeBlocked ? "login" : adminBlocked ? "dashboard" : page;
  const isAppShell = isWorkspaceShellPage(visiblePage) && (isAuthenticated || demoMode);
  const financialData = workspaceData;
  const resetControls = { dataReset, demoMode, openDemoWorkspace, resetWorkspace, restoreDemoData };
  const financialDataActions = {
    deleteAsset,
    deleteLoan,
    deleteTransaction,
    saveAsset,
    saveLoan,
    saveTransaction,
    updateAsset,
    updateFinancialData,
    updateLoan,
    updateTransaction,
  };
  const authValue = {
    authLoading,
    isAdmin,
    isAuthenticated,
    session,
    signOut,
    user: session?.user ?? null,
  };

  useEffect(() => {
    if (routeBlocked) setPage("login");
    if (adminBlocked) setPage("dashboard");
  }, [routeBlocked, adminBlocked]);

  return (
    <AuthContext.Provider value={authValue}>
      <FinancialDataContext.Provider value={financialData}>
        <FinancialDataActionsContext.Provider value={financialDataActions}>
          <ResetControlsContext.Provider value={resetControls}>
            {isAppShell ? (
              <div className="app-frame">
                <Sidebar page={visiblePage} setPage={setPage} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="app-main">
                  <AppTopBar page={visiblePage} setPage={setPage} onMenu={() => setSidebarOpen(true)} />
                  <main className="app-content">{renderPage(visiblePage, setPage)}</main>
                  <MobileNav page={visiblePage} setPage={setPage} />
                </div>
              </div>
            ) : (
              <div className="site-shell">
                <MarketingNav page={visiblePage} setPage={setPage} />
                <main>
                  {authLoading && isProtectedPage(page) ? <LoadingPage /> : renderPage(visiblePage, setPage)}
                </main>
              </div>
            )}
          </ResetControlsContext.Provider>
        </FinancialDataActionsContext.Provider>
      </FinancialDataContext.Provider>
    </AuthContext.Provider>
  );
}

function renderPage(page: string, setPage: (page: string) => void) {
  switch (page) {
    case "home":
      return <HomePage setPage={setPage} />;
    case "features":
      return <FeaturesPage setPage={setPage} />;
    case "about":
      return <AboutPage setPage={setPage} />;
    case "security":
      return <SecurityPage setPage={setPage} />;
    case "blog":
      return <BlogPage setPage={setPage} />;
    case "contact":
      return <ContactPage />;
    case "login":
      return <LoginPage setPage={setPage} />;
    case "signup":
      return <SignupPage setPage={setPage} />;
    case "forgot":
      return <ForgotPasswordPage setPage={setPage} />;
    case "reset-password":
      return <ResetPasswordPage setPage={setPage} />;
    case "onboarding":
      return <OnboardingPage setPage={setPage} />;
    case "dashboard":
      return <DashboardPage setPage={setPage} />;
    case "income":
      return <IncomeDetailPage />;
    case "receivables":
      return <ReceivablesPage />;
    case "expenses":
      return <ExpensesDetailPage />;
    case "monthly-cash-flow":
      return <MonthlyCashFlowPage />;
    case "cash-flow":
      return <MonthlyCashFlowPage />;
    case "debt":
      return <DebtDetailPage />;
    case "savings-rate":
      return <SavingsRatePage />;
    case "financial-health":
      return <FinancialHealthPage />;
    case "transactions":
      return <TransactionsPage />;
    case "assets":
      return <AssetsPage />;
    case "loans":
      return <LoansPage />;
    case "net-worth":
      return <NetWorthPage />;
    case "budget":
      return <SurvivalBudgetPage />;
    case "survival-budget":
      return <SurvivalBudgetPage />;
    case "goals":
      return <FuturePlansPage />;
    case "future-plans":
      return <FuturePlansPage />;
    case "forecast":
      return <ForecastPage />;
    case "investments":
      return <InvestmentsPage />;
    case "calendar":
      return <CalendarPage />;
    case "reports":
      return <ReportsPage />;
    case "documents":
      return <DocumentsPage />;
    case "ai-advisor":
      return <AiAdvisorPage />;
    case "settings":
      return <SettingsPage />;
    case "admin":
      return <AdminPage />;
    default:
      return <HomePage setPage={setPage} />;
  }
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "brand compact" : "brand"}>
      <img
        className="brand-logo"
        src={compact ? assetUrl("assets/netview-mark.png") : assetUrl("assets/netview-logo.png")}
        alt="NetView"
      />
    </div>
  );
}

function MarketingNav({ page, setPage }: { page: string; setPage: (page: string) => void }) {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, signOut, user } = useAuth();
  const singleUserMode = isSingleUserMode();
  const links = navItems.filter((item) => item.group === "Public");
  const navigate = (nextPage: string) => {
    setOpen(false);
    setPage(nextPage);
  };

  return (
    <header className="marketing-nav">
      <button className="brand-button" onClick={() => navigate("home")} aria-label="NetView Planner home">
        <Brand />
      </button>
      <nav className={open ? "marketing-links open" : "marketing-links"} aria-label="Public navigation">
        {links.map((item) => (
          <button
            key={item.id}
            className={page === item.id ? "nav-link active" : "nav-link"}
            onClick={() => navigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button
        className="icon-button public-menu-button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open site navigation"
      >
        <Menu size={20} />
      </button>
      <div className="marketing-actions">
        {singleUserMode ? (
          <button className="primary-button" onClick={() => navigate("dashboard")}>
            Open Planner
            <ArrowRight size={17} />
          </button>
        ) : isAuthenticated ? (
          <>
            <button className="ghost-button" onClick={() => navigate("dashboard")}>
              {userDisplayName(user)}
            </button>
            <button className="primary-button" onClick={() => void signOut()}>
              <LogOut size={17} />
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="ghost-button" onClick={() => navigate("login")}>
              <LockKeyhole size={17} />
              Login
            </button>
            <button className="primary-button" onClick={() => navigate("signup")}>
              Start Free
              <ArrowRight size={17} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}

function Sidebar({
  page,
  setPage,
  open,
  onClose,
}: {
  page: string;
  setPage: (page: string) => void;
  open: boolean;
  onClose: () => void;
}) {
  const { isAdmin, signOut, user } = useAuth();
  const { demoMode } = useResetControls();
  const singleUserMode = isSingleUserMode();
  const grouped = useMemo(() => {
    const byId = (ids: string[]) => ids.map((id) => navItems.find((item) => item.id === id)).filter(Boolean) as NavItem[];
    return [
      { group: "Overview", items: byId(["dashboard", "monthly-cash-flow"]) },
      { group: "What I Own", items: byId(["assets", "receivables"]) },
      { group: "What I Owe", items: byId(["loans"]) },
      { group: "Money In", items: byId(["income"]) },
      { group: "Keep Aside", items: byId(["survival-budget", "future-plans"]) },
      { group: "Records", items: byId(["reports"]) },
      { group: "System", items: byId(["settings", ...(isAdmin ? ["admin"] : [])]) },
    ];
  }, [isAdmin]);

  return (
    <>
      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="sidebar-head">
          <button className="brand-button" onClick={() => setPage("dashboard")} aria-label="NetView dashboard">
            <Brand />
          </button>
          <button className="icon-button sidebar-close" onClick={onClose} aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>
        <div className="sidebar-search">
          <Search size={16} />
          <span>Search workspace</span>
        </div>
        <nav className="sidebar-nav" aria-label="Application navigation">
          {grouped.map(({ group, items }) => (
            <div className="nav-group" key={group}>
              <p>{group}</p>
              {items.map((item) => (
                <NavButton key={item.id} item={item} active={page === item.id} onClick={() => setPage(item.id)} />
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-account">
          <div>
            <span>{singleUserMode ? "Local workspace" : demoMode ? "Demo workspace" : "Signed in"}</span>
            <strong>{singleUserMode ? "Single user" : demoMode ? "Sample data" : userDisplayName(user)}</strong>
          </div>
          {!singleUserMode && !demoMode && (
            <button className="ghost-button full" onClick={() => void signOut()}>
              <LogOut size={17} />
              Logout
            </button>
          )}
        </div>
      </aside>
      {open && <button className="sidebar-scrim" onClick={onClose} aria-label="Close navigation overlay" />}
    </>
  );
}

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button className={active ? "side-link active" : "side-link"} onClick={onClick}>
      <Icon size={18} />
      <span>{item.label}</span>
    </button>
  );
}

function AppTopBar({
  page,
  setPage,
  onMenu,
}: {
  page: string;
  setPage: (page: string) => void;
  onMenu: () => void;
}) {
  const { signOut, user } = useAuth();
  const { demoMode } = useResetControls();
  const singleUserMode = isSingleUserMode();
  const current = navItems.find((item) => item.id === page);
  const title = current?.label ?? pageTitleOverrides[page] ?? "Workspace";
  const openAddEntry = () => {
    setPage("transactions");
    window.setTimeout(() => window.dispatchEvent(new CustomEvent("netview:open-add-transaction")), 0);
  };

  return (
    <header className="app-topbar">
      <button className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation">
        <Menu size={21} />
      </button>
      <div>
        <p className="eyebrow">NetView Planner</p>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <label className="topbar-search" aria-label="Search NetView records">
          <Search size={16} />
          <input placeholder="Search records" />
        </label>
        <button className="ghost-button" onClick={() => setPage("settings")}>
          {singleUserMode ? "Local mode" : demoMode ? "Demo mode" : userDisplayName(user)}
        </button>
        <button className="ghost-button">
          <Bell size={17} />
          Jul 2026
        </button>
        <button className="primary-button" onClick={openAddEntry}>
          <Plus size={17} />
          Add Entry
        </button>
        {!singleUserMode && !demoMode && (
          <button className="ghost-button" onClick={() => void signOut()}>
            <LogOut size={17} />
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

function MobileNav({ page, setPage }: { page: string; setPage: (page: string) => void }) {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {mobileTabs.map((item) => {
        const Icon = item.icon;
        return (
          <button key={item.label} className={page === item.page ? "active" : ""} onClick={() => setPage(item.page)}>
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function HomePage({ setPage }: { setPage: (page: string) => void }) {
  const { openDemoWorkspace } = useResetControls();

  return (
    <>
      <section className="hero" style={{ backgroundImage: `url("${assetUrl("assets/netview-hero.png")}")` }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">Personal financial command center</p>
          <h1>See your complete financial life in one clean dashboard.</h1>
          <p>
            Track income, expenses, assets, loans, goals, and net worth, then understand what to do next.
          </p>
          <div className="hero-actions">
            <button className="primary-button large" onClick={() => setPage("signup")}>
              Start Free
              <ArrowRight size={18} />
            </button>
            <button className="ghost-button large" onClick={openDemoWorkspace}>
              View Demo Dashboard
              <Gauge size={18} />
            </button>
          </div>
          <div className="hero-metrics" aria-label="Demo financial summary">
            <MetricPill label="Net worth" value={currency(netWorth)} />
            <MetricPill label="Cash flow" value={signedCurrency(monthlyCashFlow)} />
            <MetricPill label="Health score" value={`${financialHealthScore}/100`} />
          </div>
        </div>
      </section>

      <section className="section-grid two-col">
        <div>
          <p className="eyebrow">The problem</p>
          <h2>Most people track pieces of money, not the full picture.</h2>
          <p className="section-copy">
            It is hard to know whether you are moving forward when income, bills, asset values, and debt balances live
            in different places.
          </p>
        </div>
        <div className="check-grid">
          {problemItems.map((item) => (
            <CheckItem key={item} label={item} tone="warning" />
          ))}
        </div>
      </section>

      <section className="section-band">
        <div className="section-heading">
          <p className="eyebrow">The solution</p>
          <h2>One command center for your money.</h2>
        </div>
        <div className="module-grid">
          {solutionItems.map((item) => (
            <div className="module-tile" key={item}>
              <span>{item.slice(0, 2).toUpperCase()}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-grid feature-strip">
        {featureHighlights.map((item, index) => {
          const Icon = featureBlocks[index % featureBlocks.length].icon;
          return (
            <article className="feature-mini" key={item}>
              <Icon size={22} />
              <strong>{item}</strong>
            </article>
          );
        })}
      </section>

      <section className="section-grid two-col align-center">
        <ProductPreview />
        <div>
          <p className="eyebrow">Visual preview</p>
          <h2>Review cash flow, debt, assets, goals, and risks in one place.</h2>
          <p className="section-copy">
            NetView Planner surfaces totals, trends, debt alerts, budget pressure, upcoming payments, and next actions
            in a layout built for repeated monthly review.
          </p>
          <button className="primary-button" onClick={openDemoWorkspace}>
            View demo dashboard
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      <section className="section-band">
        <div className="trust-row">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div className="trust-item" key={item.title}>
                <Icon size={22} />
                <span>{item.title}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="cta-band">
        <div>
          <p className="eyebrow">Start planning</p>
          <h2>Start Planning Your Financial Future</h2>
        </div>
        <button className="primary-button large" onClick={() => setPage("signup")}>
          Get Started
          <ArrowRight size={18} />
        </button>
      </section>
    </>
  );
}

function FeaturesPage({ setPage }: { setPage: (page: string) => void }) {
  const { openDemoWorkspace } = useResetControls();

  return (
    <PublicPage title="Features" kicker="Complete financial planner" actionLabel="View demo dashboard" onAction={openDemoWorkspace}>
      <div className="feature-page-grid">
        {featureBlocks.map((feature) => {
          const Icon = feature.icon;
          return (
            <article className="feature-card" key={feature.title}>
              <div className="icon-box">
                <Icon size={23} />
              </div>
              <h3>{feature.title}</h3>
              <p>
                <strong>What it does:</strong> {feature.what}
              </p>
              <p>
                <strong>Why it matters:</strong> {feature.why}
              </p>
              <p className="example">
                <strong>Example:</strong> {feature.example}
              </p>
            </article>
          );
        })}
      </div>
    </PublicPage>
  );
}

function AboutPage({ setPage }: { setPage: (page: string) => void }) {
  return (
    <PublicPage title="About" kicker="Mission" actionLabel="See features" onAction={() => setPage("features")}>
      <section className="section-grid two-col plain-section">
        <div>
          <h2>Built to help people understand money clearly.</h2>
          <p className="section-copy">
            Instead of guessing where money goes or how loans affect the future, users get a complete financial
            picture: what comes in, what goes out, what they own, what they owe, and what their next financial choices
            may change.
          </p>
        </div>
        <div className="statement-list">
          {[
            "Where is my money going?",
            "What do I own?",
            "What do I owe?",
            "What is my real net worth?",
            "How will my money look in 1, 5, or 10 years?",
            "Which loan should I pay faster?",
          ].map((item) => (
            <CheckItem label={item} key={item} tone="success" />
          ))}
        </div>
      </section>
    </PublicPage>
  );
}

function SecurityPage({ setPage }: { setPage: (page: string) => void }) {
  const sections = [
    {
      title: "Authentication",
      detail: "NetView uses Supabase Auth for verified email signup, password login, persistent sessions, logout, and password recovery.",
    },
    {
      title: "User data separation",
      detail: "The database schema is prepared with row-level security policies so each signed-in user can only access records tied to their own user id.",
    },
    {
      title: "Document handling",
      detail: "The document vault is designed for Supabase Storage with linked records, expiry dates, metadata, and delete controls.",
    },
    {
      title: "Export and delete controls",
      detail: "Users can export records, reset the workspace, and the schema supports account-level data deletion through cascading user ownership.",
    },
    {
      title: "AI safety",
      detail: "AI Advisor responses must show assumptions, numbers used, risk factors, next steps, and a clear educational-use disclaimer.",
    },
    {
      title: "Financial advice disclaimer",
      detail: "NetView explains financial data entered by the user. It does not guarantee outcomes or replace professional financial advice.",
    },
  ];

  return (
    <PublicPage title="Security" kicker="Trust and data control" actionLabel="Contact security" onAction={() => setPage("contact")}>
      <section className="section-grid plain-section">
        <div className="feature-page-grid compact">
          {sections.map((section) => (
            <article className="feature-card" key={section.title}>
              <div className="icon-box">
                <ShieldCheck size={23} />
              </div>
              <h3>{section.title}</h3>
              <p>{section.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicPage>
  );
}

function BlogPage({ setPage }: { setPage: (page: string) => void }) {
  return (
    <PublicPage title="Education" kicker="Financial clarity" actionLabel="Ask AI Advisor" onAction={() => setPage("ai-advisor")}>
      <div className="blog-grid">
        {blogIdeas.map((idea, index) => (
          <article className="blog-card" key={idea}>
            <span className="badge neutral">Guide {String(index + 1).padStart(2, "0")}</span>
            <h3>{idea}</h3>
            <p>
              Practical explainers with formulas, examples, common mistakes, and planning actions users can save into
              their NetView dashboard.
            </p>
            <button className="text-button">
              Read guide
              <ArrowRight size={16} />
            </button>
          </article>
        ))}
      </div>
    </PublicPage>
  );
}

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "Product question",
    message: "",
  });
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setNotice("");
  };

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.includes("@") || !form.subject.trim() || !form.message.trim()) {
      setNotice("Complete your name, email, subject, and message.");
      return;
    }

    if (!supabase) {
      setNotice("Support submission is not configured yet. Add Supabase environment variables and redeploy.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      category: form.category,
      message: form.message.trim(),
    });
    setSubmitting(false);

    if (error) {
      setNotice(error.message);
      return;
    }

    setForm({ name: "", email: "", subject: "", category: "Product question", message: "" });
    setNotice("Message sent. We will review it and follow up by email.");
  };

  return (
    <PublicPage title="Contact" kicker="Support and inquiries">
      <section className="contact-layout">
        <form className="form-panel" onSubmit={submitContact}>
          <label>
            <span>Name</span>
            <input placeholder="Full name" value={form.name} onChange={(event) => updateForm("name", event.target.value)} />
          </label>
          <label>
            <span>Email</span>
            <input placeholder="you@example.com" type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} />
          </label>
          <label>
            <span>Subject</span>
            <input placeholder="How can we help?" value={form.subject} onChange={(event) => updateForm("subject", event.target.value)} />
          </label>
          <label>
            <span>Support category</span>
            <select value={form.category} onChange={(event) => updateForm("category", event.target.value)}>
              <option>Product question</option>
              <option>Support</option>
              <option>Security</option>
              <option>Feedback</option>
              <option>Business inquiry</option>
            </select>
          </label>
          <label>
            <span>Message</span>
            <textarea rows={6} placeholder="Share the details" value={form.message} onChange={(event) => updateForm("message", event.target.value)} />
          </label>
          {notice && <p className={notice.includes("sent") ? "form-message info" : "form-message danger"}>{notice}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Sending message..." : "Send message"}
            <ArrowRight size={17} />
          </button>
        </form>
        <aside className="contact-aside">
          <InfoLine icon={FileText} title="Help center" detail="Browse guides for importing, tracking, and reporting." />
          <InfoLine icon={ShieldCheck} title="Security contact" detail="Report privacy, vulnerability, or account safety concerns." />
          <InfoLine icon={Landmark} title="Business inquiry" detail="Discuss freelancer, advisor, and family account needs." />
        </aside>
      </section>
    </PublicPage>
  );
}

function LoginPage({ setPage }: { setPage: (page: string) => void }) {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) setPage("dashboard");
  }, [isAuthenticated]);

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
  };

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      setMessage("Enter your email and password.");
      return;
    }

    if (!supabase) {
      setMessage("Authentication is not configured yet. Add Supabase environment variables and redeploy.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });
    setSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setPage("dashboard");
  };

  return (
    <AuthLayout title="Welcome back" kicker="Login">
      <form className="auth-form" onSubmit={submitLogin}>
        <label>
          <span>Email</span>
          <input
            autoComplete="email"
            placeholder="you@example.com"
            type="email"
            value={form.email}
            onChange={(event) => updateForm("email", event.target.value)}
          />
        </label>
        <label>
          <span>Password</span>
          <input
            autoComplete="current-password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) => updateForm("password", event.target.value)}
          />
        </label>
        <div className="form-row compact">
          <label className="check-label">
            <input type="checkbox" defaultChecked />
            Remember me
          </label>
          <button className="text-button" type="button" onClick={() => setPage("forgot")}>
            Forgot password?
          </button>
        </div>
        {message && <p className="form-message danger">{message}</p>}
        <button className="primary-button full" type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
          <ArrowRight size={17} />
        </button>
        <button className="text-button centered" type="button" onClick={() => setPage("signup")}>
          Need an account? Create one
        </button>
      </form>
    </AuthLayout>
  );
}

function SignupPage({ setPage }: { setPage: (page: string) => void }) {
  const { resetWorkspace, openDemoWorkspace } = useResetControls();
  const [phase, setPhase] = useState<"details" | "otp" | "welcome">("details");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "United States",
    currency: "USD",
    trackingFocus: "All",
    agree: false,
  });
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const firstName = form.name.trim().split(/\s+/)[0] || "there";

  const updateForm = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
  };

  const submitDetails = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      setMessage("Please complete your name, email, password, and password confirmation.");
      return;
    }

    if (!form.email.includes("@")) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!form.agree) {
      setMessage("Please agree to the terms before continuing.");
      return;
    }

    if (!supabase) {
      setMessage("Email OTP is not configured yet. Add Supabase environment variables and redeploy.");
      return;
    }

    setSubmitting(true);
    setOtp("");
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          full_name: form.name.trim(),
          country: form.country,
          currency: form.currency,
          tracking_focus: form.trackingFocus,
        },
        emailRedirectTo: authRedirectUrl,
      },
    });

    setSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(`OTP sent to ${form.email}. Check that inbox and enter the 6-digit code.`);
    setPhase("otp");
  };

  const verifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setMessage("Email OTP is not configured yet. Add Supabase environment variables and redeploy.");
      return;
    }

    if (otp.trim().length !== 6) {
      setMessage("Enter the 6-digit OTP from your email.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.verifyOtp({
      email: form.email.trim(),
      token: otp.trim(),
      type: "email",
    });
    setSubmitting(false);

    if (error) {
      setMessage(error.message || "That OTP is not correct.");
      return;
    }

    setMessage("");
    await resetWorkspace();
  };

  const resendOtp = async () => {
    if (!supabase) {
      setMessage("Email OTP is not configured yet. Add Supabase environment variables and redeploy.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: form.email.trim(),
      options: {
        emailRedirectTo: authRedirectUrl,
      },
    });
    setSubmitting(false);
    setMessage(error ? error.message : `New OTP sent to ${form.email}.`);
  };

  if (phase === "otp") {
    return (
      <AuthLayout title="Verify your email" kicker="OTP verification">
        <form className="auth-form" onSubmit={verifyOtp}>
          <div className="auth-status success">
            <ShieldCheck size={20} />
            <span>We sent a one-time password to {form.email}.</span>
          </div>
          <label>
            <span>Enter OTP</span>
            <input
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit code"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
            />
          </label>
          {message && <p className={message.includes("sent") ? "form-message info" : "form-message danger"}>{message}</p>}
          <button className="primary-button full" type="submit" disabled={submitting}>
            {submitting ? "Verifying..." : "Verify and create account"}
            <ArrowRight size={17} />
          </button>
          <div className="form-row compact">
            <button className="text-button" type="button" onClick={() => setPhase("details")}>
              Edit details
            </button>
            <button className="text-button" type="button" onClick={resendOtp} disabled={submitting}>
              {submitting ? "Sending..." : "Resend OTP"}
            </button>
          </div>
        </form>
      </AuthLayout>
    );
  }

  if (phase === "welcome") {
    return (
      <AuthLayout title={`Welcome to NetView, ${firstName}.`} kicker="Account created">
        <div className="auth-form">
          <div className="welcome-check">
            <Check size={32} />
          </div>
          <p className="muted">
            Your account is verified. Next, add income, expenses, assets, loans, and goals so NetView can build your
            personal dashboard.
          </p>
          <div className="setup-preview">
            {["Income", "Expenses", "Assets", "Loans", "Goals"].map((item, index) => (
              <div className="setup-step" key={item}>
                <span>{index + 1}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
          <button className="primary-button full" type="button" onClick={resetWorkspace}>
            Add my financial data
            <ArrowRight size={17} />
          </button>
          <button className="ghost-button full" type="button" onClick={openDemoWorkspace}>
            View demo workspace
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your planner" kicker="Signup">
      <form className="auth-form" onSubmit={submitDetails}>
        <label>
          <span>Full name</span>
          <input
            placeholder="Full name"
            value={form.name}
            onChange={(event) => updateForm("name", event.target.value)}
          />
        </label>
        <label>
          <span>Email</span>
          <input
            placeholder="you@example.com"
            type="email"
            value={form.email}
            onChange={(event) => updateForm("email", event.target.value)}
          />
        </label>
        <label>
          <span>Password</span>
          <input
            placeholder="At least 8 characters"
            type="password"
            value={form.password}
            onChange={(event) => updateForm("password", event.target.value)}
          />
        </label>
        <label>
          <span>Confirm password</span>
          <input
            placeholder="Confirm password"
            type="password"
            value={form.confirmPassword}
            onChange={(event) => updateForm("confirmPassword", event.target.value)}
          />
        </label>
        <div className="form-grid two">
          <label>
            <span>Country</span>
            <input
              placeholder="United States"
              value={form.country}
              onChange={(event) => updateForm("country", event.target.value)}
            />
          </label>
          <label>
            <span>Currency</span>
            <select value={form.currency} onChange={(event) => updateForm("currency", event.target.value)}>
              <option>USD</option>
              <option>INR</option>
              <option>CAD</option>
              <option>GBP</option>
              <option>EUR</option>
            </select>
          </label>
        </div>
        <label>
          <span>What do you want to track first?</span>
          <select value={form.trackingFocus} onChange={(event) => updateForm("trackingFocus", event.target.value)}>
            <option>All</option>
            <option>Expenses</option>
            <option>Loans</option>
            <option>Assets</option>
            <option>Budget</option>
            <option>Net worth</option>
            <option>Investments</option>
          </select>
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={form.agree}
            onChange={(event) => updateForm("agree", event.target.checked)}
          />
          Agree to terms
        </label>
        {message && <p className={message.includes("sent") ? "form-message info" : "form-message danger"}>{message}</p>}
        <button className="primary-button full" type="submit" disabled={submitting}>
          {submitting ? "Sending OTP..." : "Send OTP"}
          <ArrowRight size={17} />
        </button>
        <button className="text-button centered" type="button" onClick={() => setPage("login")}>
          Already have an account? Login
        </button>
      </form>
    </AuthLayout>
  );
}

function ForgotPasswordPage({ setPage }: { setPage: (page: string) => void }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      setMessage("Enter the email address on your NetView account.");
      return;
    }

    if (!supabase) {
      setMessage("Password reset is not configured yet. Add Supabase environment variables and redeploy.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: passwordResetRedirectUrl,
    });
    setSubmitting(false);

    setMessage(error ? error.message : "Password reset email sent. Check your inbox for the reset link.");
  };

  return (
    <AuthLayout title="Reset password" kicker="Account recovery">
      <form className="auth-form" onSubmit={submitReset}>
        <p className="muted">Enter your email and NetView will send a reset link.</p>
        <label>
          <span>Email</span>
          <input
            autoComplete="email"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setMessage("");
            }}
          />
        </label>
        {message && (
          <p className={message.includes("sent") ? "form-message info" : "form-message danger"}>{message}</p>
        )}
        <button className="primary-button full" type="submit" disabled={submitting}>
          {submitting ? "Sending..." : "Send reset link"}
          <ArrowRight size={17} />
        </button>
        <button className="text-button centered" type="button" onClick={() => setPage("login")}>
          Back to login
        </button>
      </form>
    </AuthLayout>
  );
}

function ResetPasswordPage({ setPage }: { setPage: (page: string) => void }) {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
  };

  const submitPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!supabase) {
      setMessage("Password reset is not configured yet. Add Supabase environment variables and redeploy.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: form.password });
    setSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated. You can continue to your dashboard.");
  };

  return (
    <AuthLayout title="Create a new password" kicker="Account recovery">
      <form className="auth-form" onSubmit={submitPassword}>
        {!isAuthenticated && (
          <p className="form-message danger">Open this page from the password reset email so NetView can verify your reset session.</p>
        )}
        <label>
          <span>New password</span>
          <input
            autoComplete="new-password"
            placeholder="At least 8 characters"
            type="password"
            value={form.password}
            onChange={(event) => updateForm("password", event.target.value)}
          />
        </label>
        <label>
          <span>Confirm new password</span>
          <input
            autoComplete="new-password"
            placeholder="Confirm new password"
            type="password"
            value={form.confirmPassword}
            onChange={(event) => updateForm("confirmPassword", event.target.value)}
          />
        </label>
        {message && (
          <p className={message.includes("updated") ? "form-message info" : "form-message danger"}>{message}</p>
        )}
        <button className="primary-button full" type="submit" disabled={submitting || !isAuthenticated}>
          {submitting ? "Updating..." : "Update password"}
          <ArrowRight size={17} />
        </button>
        <button className="text-button centered" type="button" onClick={() => setPage(isAuthenticated ? "dashboard" : "login")}>
          {isAuthenticated ? "Continue to dashboard" : "Back to login"}
        </button>
      </form>
    </AuthLayout>
  );
}

function LoadingPage() {
  return (
    <AuthLayout title="Checking your session" kicker="Secure access">
      <div className="auth-form">
        <p className="form-message info">Loading your NetView session...</p>
      </div>
    </AuthLayout>
  );
}

function OnboardingPage({ setPage }: { setPage: (page: string) => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = onboardingSteps[stepIndex];
  const percentComplete = Math.round(((stepIndex + 1) / onboardingSteps.length) * 100);
  const isLastStep = stepIndex === onboardingSteps.length - 1;

  return (
    <section className="onboarding-page">
      <div className="section-heading compact-heading">
        <p className="eyebrow">Guided setup</p>
        <h1>Build your first financial dashboard.</h1>
        <p>Complete the essentials now, or skip any step and add details later from the workspace.</p>
      </div>
      <div className="onboarding-wizard">
        <div className="wizard-progress" aria-label={`Onboarding progress ${percentComplete}%`}>
          <span style={{ width: `${percentComplete}%` }} />
        </div>
        <div className="wizard-step">
          <span className="step-number">{stepIndex + 1}</span>
          <div>
            <p className="eyebrow">Step {stepIndex + 1} of {onboardingSteps.length}</p>
            <h2>{step.title}</h2>
            <p>These fields connect directly to dashboard calculations and can be edited later.</p>
          </div>
        </div>
        <div className="onboarding-grid single">
          {step.fields.map((field) => (
            <label key={field}>
              <span>{field}</span>
              <input placeholder={field} />
            </label>
          ))}
        </div>
        <div className="button-row wizard-actions">
          <button className="ghost-button" type="button" onClick={() => setStepIndex((value) => Math.max(0, value - 1))} disabled={stepIndex === 0}>
            Back
          </button>
          <button className="ghost-button" type="button" onClick={() => (isLastStep ? setPage("dashboard") : setStepIndex((value) => value + 1))}>
            Skip this step
          </button>
          <button className="primary-button" type="button" onClick={() => (isLastStep ? setPage("dashboard") : setStepIndex((value) => value + 1))}>
            {isLastStep ? "Open dashboard" : "Save and continue"}
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}

function quickActionTarget(label: string) {
  const targets: Record<string, string> = {
    "Add Income": "income",
    "Add Expense": "expenses",
    "Add Asset": "assets",
    "Add Loan": "loans",
    "Add Goal": "future-plans",
    "Upload Document": "documents",
    "Run Forecast": "monthly-cash-flow",
  };

  return targets[label] ?? "transactions";
}

function healthScoreLabel(score: number) {
  if (score < 40) return "Needs attention";
  if (score < 60) return "At risk";
  if (score < 75) return "Stable";
  if (score < 90) return "Strong";
  return "Excellent";
}

function DashboardPage({ setPage }: { setPage: (page: string) => void }) {
  const data = useFinancialData();
  const { demoMode, openDemoWorkspace } = useResetControls();
  const singleUserMode = isSingleUserMode();
  const summary = calculateMonthlyPlannerSummary(data);
  const incomeForecast = buildIncomeForecastEntries(data.incomeRules, data.transactions);
  const hasFinancialData =
    data.transactions.length > 0 ||
    summary.totalAssets > 0 ||
    summary.totalDebts > 0 ||
    data.receivables.length > 0 ||
    data.futurePlans.length > 0 ||
    data.survivalBudgets.length > 0;
  const upcomingPayments = data.loans.slice(0, 4);
  const upcomingIncome = incomeForecast.filter((entry) => entry.status === "Expected income").slice(0, 4);
  const summaryCards = [
    { label: "Total Cash in Hand", value: currency(summary.openingCash), detail: "Cash, bank, savings, wallet assets", tone: "success" as Tone, page: "assets" },
    { label: "Total Assets", value: currency(summary.totalAssets), detail: "Owned assets only", tone: "info" as Tone, page: "assets" },
    { label: "Total Money Owed to Me", value: currency(summary.moneyOwedToMe), detail: "Receivables remaining", tone: "info" as Tone, page: "receivables" },
    { label: "Total Loans / Debts", value: currency(summary.totalDebts), detail: "Current balances owed", tone: summary.totalDebts > 0 ? "danger" as Tone : "success" as Tone, page: "loans" },
    { label: "Net Worth", value: currency(summary.netWorthWithReceivables), detail: "Assets + receivables - debts", tone: summary.netWorthWithReceivables >= 0 ? "success" as Tone : "danger" as Tone, page: "monthly-cash-flow" },
    { label: "This Month Income", value: currency(summary.postedIncome + summary.expectedIncome), detail: `${currency(summary.postedIncome)} posted · ${currency(summary.expectedIncome)} expected`, tone: "success" as Tone, page: "income" },
    { label: "Required Keep-Aside", value: currency(summary.monthlyKeepAside), detail: "Survival + future plans + debt due", tone: "warning" as Tone, page: "monthly-cash-flow" },
    { label: "Safe-to-Spend", value: currency(summary.safeToSpend), detail: summary.safeToSpend < 0 ? "Shortage warning" : "Free money after required reserves", tone: summary.safeToSpend < 0 ? "danger" as Tone : "success" as Tone, page: "monthly-cash-flow" },
  ];

  if (!hasFinancialData && !demoMode) {
    return (
      <div className="page-stack">
        <section className="dashboard-empty">
          <div>
            <p className="eyebrow">Empty dashboard</p>
            <h2>Build your monthly money plan.</h2>
            <p>Add assets, receivables, loans, income, survival budget, and future plans to calculate what is safe to spend this month.</p>
          </div>
          <div className="quick-actions">
            {["Add Income", "Add Asset", "Add Loan", "Add Goal"].map((label) => (
              <button className="action-tile" key={label} onClick={() => setPage(quickActionTarget(label))}>
                <Plus size={20} />
                <span>{label}</span>
              </button>
            ))}
            {!singleUserMode && (
              <button className="action-tile" onClick={openDemoWorkspace}>
                <Gauge size={20} />
                <span>View demo dashboard</span>
              </button>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="page-intro">
        <div>
          <p className="eyebrow">{demoMode ? "Demo Mode" : "Monthly finance plan"}</p>
          <h2>Dashboard</h2>
          <p>For this month: what you have, what must be kept aside, and what is freely available.</p>
        </div>
        <div className="button-row">
          {demoMode && (
            <button className="ghost-button" onClick={() => setPage("onboarding")}>
              Use my data
            </button>
          )}
          <button className="primary-button" onClick={() => setPage("transactions")}>
            <Plus size={17} />
            Add Transaction
          </button>
        </div>
      </div>

      <Panel title="This Month Answer">
        <div className="cash-answer-grid">
          <MetricBlock label="Cash available this month" value={currency(summary.cashAvailable)} />
          <MetricBlock label="Must keep aside" value={currency(summary.monthlyKeepAside)} />
          <MetricBlock label="Actual expenses paid" value={currency(summary.actualExpenses)} />
          <MetricBlock label="Safe-to-spend" value={currency(summary.safeToSpend)} />
        </div>
        <p className={summary.safeToSpend < 0 ? "insight danger" : "insight success"}>
          {summary.safeToSpend < 0
            ? `Warning: safe-to-spend is negative by ${currency(Math.abs(summary.safeToSpend))}. Reduce spending, delay a plan, or collect receivables before committing more cash.`
            : `${currency(summary.safeToSpend)} is freely available after survival reserves, future plan savings, debt repayments, and paid expenses.`}
        </p>
      </Panel>

      <div className="summary-grid">
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} {...card} onClick={() => setPage(card.page)} />
        ))}
      </div>

      <div className="dashboard-grid three">
        <Panel title="Required Keep-Aside">
          <DataTable
            columns={["Need", "This month amount", "Where it comes from"]}
            rows={[
              ["Survival money", currency(summary.survivalAllocation), "Survival budget allocation"],
              ["Future plans", currency(summary.futurePlanSavingsRequired), "Monthly goal savings required"],
              ["Debt repayment", currency(summary.loanRepaymentsDue), "Loan and credit payments due"],
            ]}
          />
        </Panel>
        <Panel title="Upcoming Payments">
          <div className="list-stack">
            {upcomingPayments.length > 0 ? (
              upcomingPayments.map((loan) => (
                <InfoLine
                  key={loan.name}
                  icon={CreditCard}
                  title={`${loan.name}: ${currency(loan.monthlyPayment)}`}
                  detail={`${loan.type} · ${currency(loan.currentBalance)} balance`}
                />
              ))
            ) : (
              <EmptyState title="No payments due." detail="Loan and repayment schedules will appear here." />
            )}
          </div>
        </Panel>
        <Panel title="Upcoming Income">
          <div className="list-stack">
            {upcomingIncome.length > 0 ? (
              upcomingIncome.map((entry) => (
                <InfoLine
                  key={`${entry.rule.name}-${entry.date.toISOString()}`}
                  icon={Banknote}
                  title={`${entry.rule.name}: ${currency(entry.rule.amount)}`}
                  detail={`${formatPlannerDate(entry.date)} · ${entry.rule.frequency}`}
                />
              ))
            ) : (
              <EmptyState title="No expected income." detail="Recurring income rules create future expected entries." />
            )}
          </div>
        </Panel>
      </div>

      <div className="dashboard-grid">
        <Panel title="Monthly Cash Flow Formula">
          <DataTable
            columns={["Formula line", "Amount"]}
            rows={[
              ["Opening cash", currency(summary.openingCash)],
              ["Posted income this month", currency(summary.postedIncome)],
              ["Expected income remaining", currency(summary.expectedIncome)],
              ["Receivables expected this month", currency(summary.receivablesExpected)],
              ["Actual expenses paid", `-${currency(summary.actualExpenses)}`],
              ["Loan repayments due", `-${currency(summary.loanRepaymentsDue)}`],
              ["Survival budget allocation", `-${currency(summary.survivalAllocation)}`],
              ["Future plan savings required", `-${currency(summary.futurePlanSavingsRequired)}`],
              ["Safe-to-spend result", currency(summary.safeToSpend)],
            ]}
          />
        </Panel>
        <Panel title="Module Structure">
          <HierarchyList
            rows={[
              ["Assets", "Asset type", "Subtype", "Asset item"],
              ["Money Owed to Me", "Ower type", "Reason", "Person / entity"],
              ["Loans / Debts", "Loan type", "Subtype", "Lender"],
              ["Income", "Income type", "Source", "Recurring entries"],
              ["Future Plans", "Category", "Plan type", "Goal"],
            ]}
          />
        </Panel>
      </div>

      <div className="dashboard-grid">
        <Panel title="Monthly Insight">
          <p className="insight info">
            Net worth uses the requested formula: assets + money owed to you - debts = {currency(summary.netWorthWithReceivables)}.
          </p>
          <p className="muted">Safe-to-spend is cash available minus required keep-aside and actual expenses.</p>
        </Panel>
        <Panel title="Quick Actions">
          <div className="quick-actions">
            {[
              { label: "Add Asset", page: "assets", icon: Landmark },
              { label: "Add Receivable", page: "receivables", icon: CircleDollarSign },
              { label: "Add Loan", page: "loans", icon: CreditCard },
              { label: "Add Income", page: "income", icon: Banknote },
              { label: "Set Survival Budget", page: "survival-budget", icon: WalletCards },
              { label: "Add Future Plan", page: "future-plans", icon: Goal },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button className="action-tile" key={action.label} onClick={() => setPage(action.page)}>
                  <Icon size={20} />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function TransactionsPage() {
  const { transactions } = useFinancialData();
  const { deleteTransaction, saveTransaction, updateTransaction } = useFinancialDataActions();
  const [transactionRows, setTransactionRows] = useState<Transaction[]>(transactions);
  const [activeTab, setActiveTab] = useState("All Transactions");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [notice, setNotice] = useState("");
  const [newTransaction, setNewTransaction] = useState({
    date: "Jul 6, 2026",
    type: "Expense" as Transaction["type"],
    account: "Checking",
    category: "Groceries",
    source: "",
    amount: "",
    method: "Card",
    status: "Cleared" as Transaction["status"],
  });

  useEffect(() => {
    const openAddForm = () => {
      setEditingTransaction(null);
      setShowAddForm(true);
    };

    window.addEventListener("netview:open-add-transaction", openAddForm);
    return () => window.removeEventListener("netview:open-add-transaction", openAddForm);
  }, []);

  useEffect(() => {
    setTransactionRows(transactions);
    setActiveTab("All Transactions");
    setQuery("");
    setStatusFilter("All");
  }, [transactions]);

  const tabs = ["All Transactions", "Income", "Expenses", "Transfers", "Recurring", "Pending Review"];
  const filteredTransactions = transactionRows.filter((transaction) => {
    const tabMatch =
      activeTab === "All Transactions" ||
      (activeTab === "Income" && transaction.type === "Income") ||
      (activeTab === "Expenses" && transaction.type === "Expense") ||
      (activeTab === "Transfers" && transaction.type === "Transfer") ||
      (activeTab === "Pending Review" && transaction.status === "Pending") ||
      (activeTab === "Recurring" && ["Mortgage servicer", "Northstar Analytics", "Emergency fund"].includes(transaction.source));
    const statusMatch = statusFilter === "All" || transaction.status === statusFilter;
    const searchMatch = [transaction.date, transaction.type, transaction.account, transaction.category, transaction.source, transaction.method]
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase());

    return tabMatch && statusMatch && searchMatch;
  });

  const updateNewTransaction = <K extends keyof typeof newTransaction>(field: K, value: (typeof newTransaction)[K]) => {
    setNewTransaction((current) => ({ ...current, [field]: value }));
    setNotice("");
  };

  const startEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setNewTransaction({
      account: transaction.account,
      amount: String(Math.abs(transaction.amount)),
      category: transaction.category,
      date: transaction.date,
      method: transaction.method,
      source: transaction.source,
      status: transaction.status,
      type: transaction.type,
    });
    setShowAddForm(true);
    setShowBulkUpload(false);
    setNotice("");
  };

  const addTransaction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = Number(newTransaction.amount);

    if (!newTransaction.source.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setNotice("Enter a merchant/source and a positive amount before adding the transaction.");
      return;
    }

    const signedAmount = newTransaction.type === "Income" ? parsedAmount : -parsedAmount;
    const record: Transaction = {
      date: newTransaction.date,
      type: newTransaction.type,
      account: newTransaction.account,
      category: newTransaction.category,
      source: newTransaction.source,
      amount: signedAmount,
      method: newTransaction.method,
      status: newTransaction.status,
    };

    const result = editingTransaction
      ? await updateTransaction({ ...record, id: editingTransaction.id }, editingTransaction)
      : await saveTransaction(record);
    if (!result.ok) {
      setNotice(`Could not save transaction: ${result.message}`);
      return;
    }

    setNewTransaction((current) => ({ ...current, source: "", amount: "" }));
    setEditingTransaction(null);
    setShowAddForm(false);
    setNotice(editingTransaction ? "Transaction updated." : "Transaction added.");
  };

  const addSampleImport = async () => {
    const imported: Transaction[] = [
      {
        date: "Jul 6, 2026",
        type: "Expense",
        account: "Credit card",
        category: "Subscriptions",
        source: "Cloud Suite",
        amount: -29,
        method: "Card",
        status: "Pending",
      },
      {
        date: "Jul 6, 2026",
        type: "Income",
        account: "Checking",
        category: "Refunds",
        source: "Utility refund",
        amount: 42.18,
        method: "ACH",
        status: "Cleared",
      },
    ];

    const results = await Promise.all(imported.map((record) => saveTransaction(record)));
    const failed = results.find((result) => !result.ok);
    if (failed && !failed.ok) {
      setNotice(`Could not import transactions: ${failed.message}`);
      return;
    }

    setShowBulkUpload(false);
    setNotice("Imported 2 sample CSV transactions.");
  };

  const removeTransaction = async (transaction: Transaction) => {
    const result = await deleteTransaction(transaction);
    setNotice(result.ok ? "Transaction deleted." : `Could not delete transaction: ${result.message}`);
  };

  const exportCsv = () => {
    const headers = ["Date", "Type", "Account", "Category", "Merchant / Source", "Amount", "Payment Method", "Status"];
    const lines = filteredTransactions.map((transaction) =>
      [
        transaction.date,
        transaction.type,
        transaction.account,
        transaction.category,
        transaction.source,
        transaction.amount,
        transaction.method,
        transaction.status,
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "netview-transactions.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotice(`Exported ${filteredTransactions.length} transaction${filteredTransactions.length === 1 ? "" : "s"}.`);
  };

  return (
    <div className="page-stack">
      <div className="page-toolbar">
        <div>
          <p className="eyebrow">Workspace</p>
          <h2>All Transactions</h2>
        </div>
        <div className="button-row">
          <button
            className="primary-button"
            onClick={() => {
              setEditingTransaction(null);
              setShowAddForm((value) => !value);
            }}
          >
            <Plus size={17} />
            Add manual transaction
          </button>
          <button className="ghost-button" onClick={() => setShowBulkUpload((value) => !value)}>
            <Upload size={17} />
            Bulk upload CSV
          </button>
          <button className="ghost-button" onClick={exportCsv}>
            <Download size={17} />
            Export
          </button>
        </div>
      </div>

      {notice && <p className={/enter|could not/i.test(notice) ? "form-message danger" : "form-message info"}>{notice}</p>}

      {showAddForm && (
        <Panel
          title={editingTransaction ? "Edit Transaction" : "Add Manual Transaction"}
          action={<button className="icon-button" onClick={() => {
            setEditingTransaction(null);
            setShowAddForm(false);
          }} aria-label="Close transaction form"><X size={16} /></button>}
        >
          <form className="transaction-form" onSubmit={addTransaction}>
            <label>
              <span>Date</span>
              <input value={newTransaction.date} onChange={(event) => updateNewTransaction("date", event.target.value)} />
            </label>
            <label>
              <span>Type</span>
              <select value={newTransaction.type} onChange={(event) => updateNewTransaction("type", event.target.value as Transaction["type"])}>
                <option>Income</option>
                <option>Expense</option>
                <option>Transfer</option>
              </select>
            </label>
            <label>
              <span>Account</span>
              <input value={newTransaction.account} onChange={(event) => updateNewTransaction("account", event.target.value)} />
            </label>
            <label>
              <span>Category</span>
              <input value={newTransaction.category} onChange={(event) => updateNewTransaction("category", event.target.value)} />
            </label>
            <label>
              <span>Merchant / Source</span>
              <input value={newTransaction.source} onChange={(event) => updateNewTransaction("source", event.target.value)} placeholder="Merchant or source" />
            </label>
            <label>
              <span>Amount</span>
              <input value={newTransaction.amount} onChange={(event) => updateNewTransaction("amount", event.target.value)} inputMode="decimal" placeholder="125.00" />
            </label>
            <label>
              <span>Payment Method</span>
              <select value={newTransaction.method} onChange={(event) => updateNewTransaction("method", event.target.value)}>
                <option>Card</option>
                <option>Bank</option>
                <option>ACH</option>
                <option>Cash</option>
              </select>
            </label>
            <label>
              <span>Status</span>
              <select value={newTransaction.status} onChange={(event) => updateNewTransaction("status", event.target.value as Transaction["status"])}>
                <option>Cleared</option>
                <option>Pending</option>
              </select>
            </label>
            <button className="primary-button" type="submit">
              {editingTransaction ? "Update transaction" : "Add transaction"}
              <ArrowRight size={17} />
            </button>
          </form>
        </Panel>
      )}

      {showBulkUpload && (
        <Panel title="Bulk Upload CSV" action={<button className="icon-button" onClick={() => setShowBulkUpload(false)} aria-label="Close bulk upload"><X size={16} /></button>}>
          <div className="upload-panel">
            <label>
              <span>CSV file</span>
              <input type="file" accept=".csv,text/csv" onChange={() => setNotice("CSV selected. This prototype uses sample import data.")} />
            </label>
            <p className="muted">Expected columns: date, type, account, category, source, amount, method, status.</p>
            <button className="primary-button" type="button" onClick={addSampleImport}>
              Import sample CSV rows
              <ArrowRight size={17} />
            </button>
          </div>
        </Panel>
      )}

      <Panel
        title="Transaction Filters"
        action={
          <button className="ghost-button" onClick={() => setShowFilters((value) => !value)}>
            <SlidersHorizontal size={17} />
            Filters
          </button>
        }
      >
        <div className="tab-row">
          {tabs.map((tab) => (
            <button key={tab} className={activeTab === tab ? "tab active" : "tab"} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
        {showFilters && (
          <div className="filter-grid">
            <label>
              <span>Search</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Merchant, category, account" />
            </label>
            <label>
              <span>Status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option>All</option>
                <option>Cleared</option>
                <option>Pending</option>
              </select>
            </label>
            <button
              className="ghost-button"
              type="button"
              onClick={() => {
                setQuery("");
                setStatusFilter("All");
                setActiveTab("All Transactions");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </Panel>
      <Panel title={`July Activity (${filteredTransactions.length})`}>
        {filteredTransactions.length > 0 ? (
          <DataTable
            columns={["Date", "Type", "Account", "Category", "Merchant / Source", "Amount", "Payment Method", "Status", "Actions"]}
            rows={filteredTransactions.map((transaction) => [
              transaction.date,
              <Badge tone={transaction.type === "Income" ? "success" : transaction.type === "Expense" ? "warning" : "info"}>{transaction.type}</Badge>,
              transaction.account,
              transaction.category,
              transaction.source,
              <span className={transaction.amount >= 0 ? "money-positive" : "money-negative"}>{signedCurrency(transaction.amount)}</span>,
              transaction.method,
              <Badge tone={transaction.status === "Cleared" ? "success" : "warning"}>{transaction.status}</Badge>,
              <div className="table-actions">
                <button className="icon-button" type="button" aria-label={`Edit ${transaction.source}`} onClick={() => startEditTransaction(transaction)}>
                  <Pencil size={16} />
                </button>
                <button className="icon-button" type="button" aria-label={`Delete ${transaction.source}`} onClick={() => removeTransaction(transaction)}>
                  <Trash2 size={16} />
                </button>
              </div>,
            ])}
          />
        ) : (
          <div className="empty-state">
            <strong>No transactions match this view.</strong>
            <span>Change the tab, clear filters, or add a manual transaction.</span>
          </div>
        )}
      </Panel>
      <div className="dashboard-grid">
        <CategoryPanel title="Income Types" items={incomeTypes} />
        <CategoryPanel title="Expense Categories" items={expenseCategories} />
      </div>
    </div>
  );
}

function IncomeDetailPage() {
  const { incomeRules, transactions } = useFinancialData();
  const { updateFinancialData } = useFinancialDataActions();
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<IncomeRule | null>(null);
  const [notice, setNotice] = useState("");
  const incomeRows = transactions.filter((transaction) => transaction.type === "Income");
  const forecast = buildIncomeForecastEntries(incomeRules, transactions);
  const postedTotal = incomeRows.filter((row) => row.status === "Cleared").reduce((sum, row) => sum + row.amount, 0);
  const expectedTotal = forecast.filter((entry) => entry.status === "Expected income").reduce((sum, entry) => sum + entry.rule.amount, 0);
  const missedTotal = forecast.filter((entry) => entry.status === "Missed income").reduce((sum, entry) => sum + entry.rule.amount, 0);

  const submitRule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = formString(data, "name");
    const amount = formNumber(data, "amount");

    if (!name || amount <= 0) return;

    const record: IncomeRule = {
      id: editingRule?.id ?? localRecordId("income-rule"),
      account: formString(data, "account", "Checking"),
      amount,
      endDate: formString(data, "endDate") ? formatInputDate(formString(data, "endDate")) : undefined,
      frequency: formString(data, "frequency", "Monthly"),
      incomeType: formString(data, "incomeType", "Salary"),
      name,
      notes: formString(data, "notes"),
      source: formString(data, "source", name),
      startDate: formatInputDate(formString(data, "startDate", formatIsoDateValue(new Date()))),
      taxable: formString(data, "taxable", "Yes") === "Yes",
    };

    updateFinancialData((current) => ({
      ...current,
      incomeRules: editingRule
        ? replaceFirstRecord(
            current.incomeRules,
            (row) => (editingRule.id ? row.id === editingRule.id : row.name === editingRule.name && row.source === editingRule.source),
            record,
          )
        : [record, ...current.incomeRules],
    }));
    setShowForm(false);
    setEditingRule(null);
    setNotice(editingRule ? "Income schedule updated." : "Income schedule saved.");
  };

  const openIncomeForm = () => {
    setEditingRule(null);
    setShowForm((value) => !value);
    setNotice("");
  };

  const startEditRule = (rule: IncomeRule) => {
    setEditingRule(rule);
    setShowForm(true);
    setNotice("");
  };

  const closeIncomeForm = () => {
    setEditingRule(null);
    setShowForm(false);
  };

  const removeRule = (rule: IncomeRule) => {
    updateFinancialData((current) => ({
      ...current,
      incomeRules: removeFirstRecord(
        current.incomeRules,
        (row) => (rule.id ? row.id === rule.id : row.name === rule.name && row.source === rule.source && row.amount === rule.amount),
      ),
    }));
    setNotice("Income schedule deleted.");
  };

  return (
    <div className="page-stack">
      <div className="page-toolbar">
        <div>
          <p className="eyebrow">Income → Income Type → Source → Recurring Rule → Entries</p>
          <h2>Income / Pay Received</h2>
        </div>
        <div className="button-row">
          <button className="primary-button" onClick={openIncomeForm}>
            <Plus size={17} />
            Add income schedule
          </button>
          <button
            className="ghost-button"
            onClick={() => {
              window.location.hash = "transactions";
              window.setTimeout(() => window.dispatchEvent(new CustomEvent("netview:open-add-transaction")), 50);
            }}
          >
            <Check size={17} />
            Mark received
          </button>
        </div>
      </div>
      {notice && <p className="form-message info">{notice}</p>}
      {showForm && (
        <Panel title={editingRule ? "Edit Income Rule" : "Add Income Rule"} action={<button className="icon-button" onClick={closeIncomeForm} aria-label="Close income form"><X size={16} /></button>}>
          <form className="feature-action-form" onSubmit={submitRule}>
            <label>
              <span>Income name</span>
              <input key={`income-name-${editingRule?.id ?? "new"}`} name="name" defaultValue={editingRule?.name ?? ""} placeholder="Salary, rent, dividend..." required />
            </label>
            <label>
              <span>Income type</span>
              <select key={`income-type-${editingRule?.id ?? "new"}`} name="incomeType" defaultValue={editingRule?.incomeType ?? "Salary"}>
                {["Salary", "Rental income", "Business income", "Investment income", "Dividend income", "Interest income", "Freelance income", "Money received back from someone", "Gift", "Other"].map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label>
              <span>Source</span>
              <input key={`income-source-${editingRule?.id ?? "new"}`} name="source" defaultValue={editingRule?.source ?? ""} placeholder="Employer, tenant, client" required />
            </label>
            <label>
              <span>Amount</span>
              <input key={`income-amount-${editingRule?.id ?? "new"}`} name="amount" inputMode="decimal" defaultValue={editingRule?.amount ?? ""} placeholder="5000" required />
            </label>
            <label>
              <span>Start date</span>
              <input key={`income-start-${editingRule?.id ?? "new"}`} name="startDate" type="date" defaultValue={editingRule ? toIsoDate(editingRule.startDate) : formatIsoDateValue(new Date())} />
            </label>
            <label>
              <span>Frequency</span>
              <select key={`income-frequency-${editingRule?.id ?? "new"}`} name="frequency" defaultValue={editingRule?.frequency ?? "Monthly"}>
                {["One time", "Daily", "Weekly", "Every 2 weeks", "Twice a month", "Monthly", "Quarterly", "Yearly", "Custom"].map((frequency) => <option key={frequency}>{frequency}</option>)}
              </select>
            </label>
            <label>
              <span>End date optional</span>
              <input key={`income-end-${editingRule?.id ?? "new"}`} name="endDate" type="date" defaultValue={editingRule?.endDate ? toIsoDate(editingRule.endDate) : ""} />
            </label>
            <label>
              <span>Receive account</span>
              <input key={`income-account-${editingRule?.id ?? "new"}`} name="account" defaultValue={editingRule?.account ?? "Checking"} />
            </label>
            <label>
              <span>Taxable</span>
              <select key={`income-tax-${editingRule?.id ?? "new"}`} name="taxable" defaultValue={editingRule?.taxable === false ? "No" : "Yes"}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </label>
            <label>
              <span>Notes</span>
              <input key={`income-notes-${editingRule?.id ?? "new"}`} name="notes" defaultValue={editingRule?.notes ?? ""} placeholder="Optional" />
            </label>
            <button className="primary-button" type="submit">
              {editingRule ? "Update income rule" : "Save income rule"}
              <ArrowRight size={17} />
            </button>
          </form>
        </Panel>
      )}
      <div className="summary-grid four">
        <SummaryCard label="Posted income" value={currency(postedTotal)} detail="Received this month" tone="success" />
        <SummaryCard label="Expected income" value={currency(expectedTotal)} detail="Remaining forecast this month" tone="info" />
        <SummaryCard label="Missed income" value={currency(missedTotal)} detail="Past scheduled income not posted" tone={missedTotal > 0 ? "danger" : "success"} />
        <SummaryCard label="Income rules" value={`${incomeRules.length}`} detail="Recurring schedules" tone="info" />
      </div>
      <Panel title="Income Hierarchy">
        <HierarchyList rows={incomeRules.map((rule) => ["Income", rule.incomeType, rule.source, `${rule.frequency} · ${currency(rule.amount)}`])} />
      </Panel>
      <Panel title="Income Schedules">
        <DataTable
          columns={["Name", "Type", "Source", "Amount", "Frequency", "Start", "End", "Account", "Taxable", "Actions"]}
          rows={incomeRules.map((rule) => [
            rule.name,
            rule.incomeType,
            rule.source,
            <span className="money-positive">{currency(rule.amount)}</span>,
            rule.frequency,
            rule.startDate,
            rule.endDate ?? "No end",
            rule.account,
            rule.taxable ? "Yes" : "No",
            <div className="table-actions">
              <button className="icon-button" type="button" aria-label={`Edit ${rule.name}`} onClick={() => startEditRule(rule)}>
                <Pencil size={16} />
              </button>
              <button className="icon-button" type="button" aria-label={`Delete ${rule.name}`} onClick={() => removeRule(rule)}>
                <Trash2 size={16} />
              </button>
            </div>,
          ])}
        />
      </Panel>
      <Panel title="Income Forecast Entries">
        <DataTable
          columns={["Date", "Income name", "Type", "Source", "Amount", "Status"]}
          rows={forecast.map((entry) => [
            formatPlannerDate(entry.date),
            entry.rule.name,
            entry.rule.incomeType,
            entry.rule.source,
            <span className="money-positive">{currency(entry.rule.amount)}</span>,
            <Badge tone={entry.status === "Posted income" ? "success" : entry.status === "Expected income" ? "info" : "danger"}>{entry.status}</Badge>,
          ])}
        />
      </Panel>
      <Panel title="Posted Income Transactions">
        <DataTable
          columns={["Date", "Source", "Type", "Account", "Amount", "Status"]}
          rows={incomeRows.map((row) => [
            row.date,
            row.source,
            row.category,
            row.account,
            <span className="money-positive">{signedCurrency(row.amount)}</span>,
            <Badge tone={row.status === "Cleared" ? "success" : "warning"}>{row.status}</Badge>,
          ])}
        />
      </Panel>
    </div>
  );
}

function ExpensesDetailPage() {
  const { monthlyExpenses, transactions } = useFinancialData();
  const expenseRows = transactions.filter((transaction) => transaction.type === "Expense");

  return (
    <div className="page-stack">
      <PageToolbar title="Expense Tracking" actions={["Add expense", "Detect subscriptions", "Export expenses"]} />
      <div className="summary-grid four">
        <SummaryCard label="Monthly expenses" value={currency(monthlyExpenses)} detail="Projected outflow" tone="warning" />
        <SummaryCard label="Fixed expense ratio" value="58%" detail="Housing, insurance, debt" tone="warning" />
        <SummaryCard label="Subscriptions" value="$186/mo" detail="Recurring card charges" tone="info" />
        <SummaryCard label="Dining status" value="Over" detail="$410 against $320" tone="danger" />
      </div>
      <Panel title="Expense Transactions" action={<Segmented labels={["Category", "Merchant", "Trend"]} />}>
        <DataTable
          columns={["Date", "Merchant", "Category", "Account", "Amount", "Status"]}
          rows={expenseRows.map((row) => [
            row.date,
            row.source,
            row.category,
            row.account,
            <span className="money-negative">{signedCurrency(row.amount)}</span>,
            <Badge tone={row.status === "Cleared" ? "success" : "warning"}>{row.status}</Badge>,
          ])}
        />
      </Panel>
      <Panel title="Important Insights">
        <InsightList
          tone="warning"
          items={[
            "You spent $410 on dining against a $320 monthly budget.",
            "Subscriptions total $186/month.",
            "Rent and mortgage costs are 32% of income.",
            "Total fixed expenses are 58% of income.",
          ]}
        />
      </Panel>
    </div>
  );
}

function CashFlowDetailPage() {
  const { cashFlowSeries, emergencyMonths, monthlyCashFlow, monthlyExpenses, monthlyIncome } = useFinancialData();

  return (
    <div className="page-stack">
      <PageToolbar title="Cash Flow Analysis" actions={["Add cash event", "Run cash forecast", "Export cash flow"]} />
      <div className="summary-grid four">
        <SummaryCard label="Income" value={currency(monthlyIncome)} detail="Monthly expected" tone="success" />
        <SummaryCard label="Expenses" value={currency(monthlyExpenses)} detail="Monthly projected" tone="warning" />
        <SummaryCard label="Cash flow" value={signedCurrency(monthlyCashFlow)} detail="Income minus expenses" tone="success" />
        <SummaryCard label="Emergency runway" value={`${emergencyMonths} mo`} detail="Liquid savings coverage" tone="info" />
      </div>
      <Panel title="Cash Flow Chart" action={<Segmented labels={["Monthly", "Quarterly", "Yearly"]} />}>
        <CashFlowChart />
      </Panel>
      <Panel title="Cash Flow Drivers">
        <DataTable
          columns={["Month", "Income", "Expenses", "Savings", "Debt Payments"]}
          rows={cashFlowSeries.map((row) => [
            row.label,
            currency(row.income),
            currency(row.expenses),
            currency(row.savings),
            currency(row.debt),
          ])}
        />
      </Panel>
    </div>
  );
}

function DebtDetailPage() {
  const { debtToIncome, loans, monthlyDebtPayments, totalLiabilities } = useFinancialData();

  return (
    <div className="page-stack">
      <PageToolbar title="Debt Overview" actions={["Add debt", "Prioritize payoff", "Export debt"]} />
      <div className="summary-grid four">
        <SummaryCard label="Total debt" value={currency(totalLiabilities)} detail="Remaining loan balances" tone="danger" />
        <SummaryCard label="Monthly payments" value={currency(monthlyDebtPayments)} detail="Required minimums" tone="warning" />
        <SummaryCard label="Debt-to-income" value={`${debtToIncome}%`} detail="Payments / income" tone="warning" />
        <SummaryCard label="Highest APR" value="21.9%" detail="Rewards Credit Card" tone="danger" />
      </div>
      <Panel title="Debt Accounts">
        <DataTable
          columns={["Loan", "Type", "Balance", "APR", "Payment", "Remaining", "Interest Left"]}
          rows={loans.map((loan) => [
            loan.name,
            loan.type,
            currency(loan.currentBalance),
            `${loan.rate}%`,
            currency(loan.monthlyPayment),
            `${loan.remainingMonths} months`,
            currency(loan.interestLeft),
          ])}
        />
      </Panel>
      <Panel title="Payoff Strategy">
        <InsightList
          tone="info"
          items={[
            "Debt avalanche prioritizes the 21.9% credit card first.",
            "The auto loan is a good extra-payment target after credit card payoff.",
            "Mortgage payoff improves equity but has a lower interest priority.",
          ]}
        />
      </Panel>
    </div>
  );
}

function SavingsRatePage() {
  const { monthlyCashFlow, savingsRate } = useFinancialData();

  return (
    <div className="page-stack">
      <PageToolbar title="Savings Rate" actions={["Set target rate", "Adjust budget", "Export savings"]} />
      <div className="summary-grid four">
        <SummaryCard label="Current savings rate" value={`${savingsRate}%`} detail="Cash flow / income" tone="success" />
        <SummaryCard label="Monthly savings" value={currency(monthlyCashFlow)} detail="After expenses" tone="success" />
        <SummaryCard label="Target rate" value="35%" detail="Suggested next milestone" tone="info" />
        <SummaryCard label="Gap" value="$394/mo" detail="Needed to reach 35%" tone="warning" />
      </div>
      <Panel title="Savings Trend" action={<Segmented labels={["Monthly", "Quarterly", "Yearly"]} />}>
        <CashFlowChart />
      </Panel>
      <Panel title="Savings Levers">
        <InsightList
          tone="success"
          items={[
            "Reducing dining overspend brings the rate near 32%.",
            "A $200 auto-loan extra payment trades short-term savings for lower interest.",
            "Moving unused travel budget can close half the target-rate gap.",
          ]}
        />
      </Panel>
    </div>
  );
}

function FinancialHealthPage() {
  const { debtToIncome, emergencyMonths, financialHealthScore, healthFactors, savingsRate } = useFinancialData();

  return (
    <div className="page-stack">
      <PageToolbar title="Financial Health Score" actions={["Review risks", "Improve score", "Export score"]} />
      <div className="summary-grid four">
        <SummaryCard label="Health score" value={`${financialHealthScore}/100`} detail="Stable with debt pressure" tone="warning" />
        <SummaryCard label="Emergency fund" value={`${emergencyMonths} mo`} detail="Target: 6 months" tone="warning" />
        <SummaryCard label="Savings rate" value={`${savingsRate}%`} detail="Healthy but improvable" tone="success" />
        <SummaryCard label="Debt pressure" value={`${debtToIncome}%`} detail="Payment-to-income" tone="danger" />
      </div>
      <Panel title="Score Factors">
        <DataTable
          columns={["Factor", "Weight", "Score"]}
          rows={healthFactors.map((factor) => [factor.label, `${factor.weight}%`, `${factor.score}/${factor.weight}`])}
        />
      </Panel>
      <Panel title="Recommended Actions">
        <InsightList
          tone="warning"
          items={[
            "Pay down the credit card first because it has the highest APR.",
            "Grow emergency savings from 4.1 months toward 6 months.",
            "Keep fixed expenses below 60% of income.",
          ]}
        />
      </Panel>
    </div>
  );
}

function SurvivalBudgetPage() {
  const { survivalBudgets } = useFinancialData();
  const { updateFinancialData } = useFinancialDataActions();
  const [showForm, setShowForm] = useState(false);
  const [editingSurvival, setEditingSurvival] = useState<SurvivalBudgetPlan | null>(null);
  const [notice, setNotice] = useState("");
  const totalSurvival = survivalBudgets.reduce((sum, row) => sum + row.totalAmount, 0);
  const monthlyNeed = survivalBudgets.reduce((sum, row) => sum + survivalMonthlyAllocation(row), 0);
  const remainingFutureReserve = survivalBudgets.reduce((sum, row) => sum + Math.max(row.totalAmount - survivalMonthlyAllocation(row), 0), 0);

  const submitSurvival = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = formString(data, "name");
    const totalAmount = formNumber(data, "totalAmount");
    const tenureMonths = formNumber(data, "tenureMonths");

    if (!name || totalAmount <= 0 || tenureMonths <= 0) return;

    const record: SurvivalBudgetPlan = {
      id: editingSurvival?.id ?? localRecordId("survival"),
      expenseGroup: formString(data, "expenseGroup", "Housing"),
      expenseType: formString(data, "expenseType", "Rent"),
      name,
      notes: formString(data, "notes"),
      tenureMonths,
      totalAmount,
    };

    updateFinancialData((current) => ({
      ...current,
      survivalBudgets: editingSurvival
        ? replaceFirstRecord(
            current.survivalBudgets,
            (row) => (editingSurvival.id ? row.id === editingSurvival.id : row.name === editingSurvival.name && row.totalAmount === editingSurvival.totalAmount),
            record,
          )
        : [record, ...current.survivalBudgets],
    }));
    setShowForm(false);
    setEditingSurvival(null);
    setNotice(editingSurvival ? "Survival budget updated." : "Survival budget saved.");
  };

  const openSurvivalForm = () => {
    setEditingSurvival(null);
    setShowForm((value) => !value);
    setNotice("");
  };

  const startEditSurvival = (record: SurvivalBudgetPlan) => {
    setEditingSurvival(record);
    setShowForm(true);
    setNotice("");
  };

  const closeSurvivalForm = () => {
    setEditingSurvival(null);
    setShowForm(false);
  };

  const removeSurvival = (record: SurvivalBudgetPlan) => {
    updateFinancialData((current) => ({
      ...current,
      survivalBudgets: removeFirstRecord(
        current.survivalBudgets,
        (row) => (record.id ? row.id === record.id : row.name === record.name && row.totalAmount === record.totalAmount),
      ),
    }));
    setNotice("Survival budget deleted.");
  };

  return (
    <div className="page-stack">
      <div className="page-toolbar">
        <div>
          <p className="eyebrow">Survival Budget → Expense Group → Expense Type → Monthly Allocation</p>
          <h2>Survival Budget</h2>
        </div>
        <button className="primary-button" onClick={openSurvivalForm}>
          <Plus size={17} />
          Add survival budget
        </button>
      </div>
      {notice && <p className="form-message info">{notice}</p>}
      {showForm && (
        <Panel title={editingSurvival ? "Edit Survival Reserve" : "Add Survival Reserve"} action={<button className="icon-button" onClick={closeSurvivalForm} aria-label="Close survival budget form"><X size={16} /></button>}>
          <form className="feature-action-form" onSubmit={submitSurvival}>
            <label>
              <span>Plan name</span>
              <input key={`survival-name-${editingSurvival?.id ?? "new"}`} name="name" defaultValue={editingSurvival?.name ?? ""} placeholder="Six month survival reserve" required />
            </label>
            <label>
              <span>Expense group</span>
              <select key={`survival-group-${editingSurvival?.id ?? "new"}`} name="expenseGroup" defaultValue={editingSurvival?.expenseGroup ?? "Housing"}>
                {["Housing", "Food", "Travel / Transport", "Health", "Communication", "Personal Basics", "Emergency Buffer"].map((group) => <option key={group}>{group}</option>)}
              </select>
            </label>
            <label>
              <span>Expense type</span>
              <input key={`survival-type-${editingSurvival?.id ?? "new"}`} name="expenseType" defaultValue={editingSurvival?.expenseType ?? ""} placeholder="Rent, groceries, medical emergency..." required />
            </label>
            <label>
              <span>Total survival amount</span>
              <input key={`survival-amount-${editingSurvival?.id ?? "new"}`} name="totalAmount" inputMode="decimal" defaultValue={editingSurvival?.totalAmount ?? ""} placeholder="9000" required />
            </label>
            <label>
              <span>Tenure in months</span>
              <input key={`survival-tenure-${editingSurvival?.id ?? "new"}`} name="tenureMonths" inputMode="numeric" defaultValue={editingSurvival?.tenureMonths ?? ""} placeholder="6" required />
            </label>
            <label>
              <span>Notes</span>
              <input key={`survival-notes-${editingSurvival?.id ?? "new"}`} name="notes" defaultValue={editingSurvival?.notes ?? ""} placeholder="Optional" />
            </label>
            <button className="primary-button" type="submit">
              {editingSurvival ? "Update survival budget" : "Save survival budget"}
              <ArrowRight size={17} />
            </button>
          </form>
        </Panel>
      )}
      <div className="summary-grid four">
        <SummaryCard label="Total survival amount" value={currency(totalSurvival)} detail="Total reserve target" tone="info" />
        <SummaryCard label="Monthly survival need" value={currency(monthlyNeed)} detail="Total budget divided by tenure" tone="warning" />
        <SummaryCard label="This month reserve" value={currency(monthlyNeed)} detail="Included in keep-aside" tone="warning" />
        <SummaryCard label="Remaining future reserve" value={currency(remainingFutureReserve)} detail="Reserve after this month" tone="info" />
      </div>
      <Panel title="Survival Budget Formula">
        <p className="insight info">Monthly Survival Need = Total Survival Budget / Tenure in Months.</p>
        <DataTable
          columns={["Expense group", "Expense type", "Total amount", "Tenure", "Monthly allocation", "Future reserve", "Actions"]}
          rows={survivalBudgets.map((row) => [
            row.expenseGroup,
            row.expenseType,
            currency(row.totalAmount),
            `${row.tenureMonths} months`,
            currency(survivalMonthlyAllocation(row)),
            currency(Math.max(row.totalAmount - survivalMonthlyAllocation(row), 0)),
            <div className="table-actions">
              <button className="icon-button" type="button" aria-label={`Edit ${row.name}`} onClick={() => startEditSurvival(row)}>
                <Pencil size={16} />
              </button>
              <button className="icon-button" type="button" aria-label={`Delete ${row.name}`} onClick={() => removeSurvival(row)}>
                <Trash2 size={16} />
              </button>
            </div>,
          ])}
        />
      </Panel>
      <Panel title="Survival Hierarchy">
        <HierarchyList rows={survivalBudgets.map((row) => ["Survival Budget", row.expenseGroup, row.expenseType, `${currency(survivalMonthlyAllocation(row))} / month`])} />
      </Panel>
    </div>
  );
}

function FuturePlansPage() {
  const { futurePlans } = useFinancialData();
  const { updateFinancialData } = useFinancialDataActions();
  const [showForm, setShowForm] = useState(false);
  const [editingFuturePlan, setEditingFuturePlan] = useState<FuturePlan | null>(null);
  const [notice, setNotice] = useState("");
  const totalTarget = futurePlans.reduce((sum, plan) => sum + plan.targetAmount, 0);
  const totalSaved = futurePlans.reduce((sum, plan) => sum + plan.currentSaved, 0);
  const monthlyRequired = futurePlans.reduce((sum, plan) => sum + futurePlanMonthlyRequired(plan), 0);
  const behindCount = futurePlans.filter((plan) => futurePlanStatus(plan).label === "Behind").length;

  const submitFuturePlan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = formString(data, "name");
    const targetAmount = formNumber(data, "targetAmount");

    if (!name || targetAmount <= 0) return;

    const record: FuturePlan = {
      id: editingFuturePlan?.id ?? localRecordId("future-plan"),
      category: formString(data, "category", "Emergency Fund"),
      currentSaved: formNumber(data, "currentSaved"),
      name,
      notes: formString(data, "notes"),
      planType: formString(data, "planType", "6-month fund"),
      priority: formString(data, "priority", "High") as FuturePlan["priority"],
      targetAmount,
      targetDate: formatInputDate(formString(data, "targetDate", formatIsoDateValue(new Date()))),
    };

    updateFinancialData((current) => ({
      ...current,
      futurePlans: editingFuturePlan
        ? replaceFirstRecord(
            current.futurePlans,
            (row) => (editingFuturePlan.id ? row.id === editingFuturePlan.id : row.name === editingFuturePlan.name && row.targetAmount === editingFuturePlan.targetAmount),
            record,
          )
        : [record, ...current.futurePlans],
    }));
    setShowForm(false);
    setEditingFuturePlan(null);
    setNotice(editingFuturePlan ? "Future plan updated." : "Future plan saved.");
  };

  const openFuturePlanForm = () => {
    setEditingFuturePlan(null);
    setShowForm((value) => !value);
    setNotice("");
  };

  const startEditFuturePlan = (plan: FuturePlan) => {
    setEditingFuturePlan(plan);
    setShowForm(true);
    setNotice("");
  };

  const closeFuturePlanForm = () => {
    setEditingFuturePlan(null);
    setShowForm(false);
  };

  const removeFuturePlan = (plan: FuturePlan) => {
    updateFinancialData((current) => ({
      ...current,
      futurePlans: removeFirstRecord(
        current.futurePlans,
        (row) => (plan.id ? row.id === plan.id : row.name === plan.name && row.targetAmount === plan.targetAmount),
      ),
    }));
    setNotice("Future plan deleted.");
  };

  return (
    <div className="page-stack">
      <div className="page-toolbar">
        <div>
          <p className="eyebrow">Future Plans → Plan Category → Plan Type → Goal → Monthly Saving Requirement</p>
          <h2>Future Plans</h2>
        </div>
        <button className="primary-button" onClick={openFuturePlanForm}>
          <Plus size={17} />
          Add future plan
        </button>
      </div>
      {notice && <p className="form-message info">{notice}</p>}
      {showForm && (
        <Panel title={editingFuturePlan ? "Edit Future Plan" : "Add Future Plan"} action={<button className="icon-button" onClick={closeFuturePlanForm} aria-label="Close future plan form"><X size={16} /></button>}>
          <form className="feature-action-form" onSubmit={submitFuturePlan}>
            <label>
              <span>Plan name</span>
              <input key={`future-name-${editingFuturePlan?.id ?? "new"}`} name="name" defaultValue={editingFuturePlan?.name ?? ""} placeholder="Emergency fund, car down payment..." required />
            </label>
            <label>
              <span>Plan category</span>
              <select key={`future-category-${editingFuturePlan?.id ?? "new"}`} name="category" defaultValue={editingFuturePlan?.category ?? "Emergency Fund"}>
                {["Education", "Vehicle", "House / Real Estate", "Business", "Travel", "Emergency Fund", "Personal Goals"].map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label>
              <span>Plan type</span>
              <input key={`future-type-${editingFuturePlan?.id ?? "new"}`} name="planType" defaultValue={editingFuturePlan?.planType ?? ""} placeholder="6-month fund, down payment, course..." required />
            </label>
            <label>
              <span>Target amount</span>
              <input key={`future-target-${editingFuturePlan?.id ?? "new"}`} name="targetAmount" inputMode="decimal" defaultValue={editingFuturePlan?.targetAmount ?? ""} placeholder="12000" required />
            </label>
            <label>
              <span>Current saved</span>
              <input key={`future-saved-${editingFuturePlan?.id ?? "new"}`} name="currentSaved" inputMode="decimal" defaultValue={editingFuturePlan?.currentSaved ?? 0} />
            </label>
            <label>
              <span>Target date</span>
              <input key={`future-date-${editingFuturePlan?.id ?? "new"}`} name="targetDate" type="date" defaultValue={editingFuturePlan ? toIsoDate(editingFuturePlan.targetDate) : formatIsoDateValue(new Date())} />
            </label>
            <label>
              <span>Priority</span>
              <select key={`future-priority-${editingFuturePlan?.id ?? "new"}`} name="priority" defaultValue={editingFuturePlan?.priority ?? "High"}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
            <label>
              <span>Notes</span>
              <input key={`future-notes-${editingFuturePlan?.id ?? "new"}`} name="notes" defaultValue={editingFuturePlan?.notes ?? ""} placeholder="Optional" />
            </label>
            <button className="primary-button" type="submit">
              {editingFuturePlan ? "Update future plan" : "Save future plan"}
              <ArrowRight size={17} />
            </button>
          </form>
        </Panel>
      )}
      <div className="summary-grid four">
        <SummaryCard label="Total plan targets" value={currency(totalTarget)} detail="All future goal targets" tone="info" />
        <SummaryCard label="Current saved" value={currency(totalSaved)} detail="Already saved toward plans" tone="success" />
        <SummaryCard label="Monthly required saving" value={currency(monthlyRequired)} detail="Remaining amount divided by remaining months" tone="warning" />
        <SummaryCard label="Behind plans" value={`${behindCount}`} detail="Needs attention" tone={behindCount > 0 ? "danger" : "success"} />
      </div>
      <Panel title="Future Plan Hierarchy">
        <HierarchyList rows={futurePlans.map((plan) => [plan.category, plan.planType, plan.name, `${currency(futurePlanMonthlyRequired(plan))} / month`])} />
      </Panel>
      <Panel title="Future Plan Requirements">
        <DataTable
          columns={["Plan", "Category", "Type", "Target", "Saved", "Remaining", "Target date", "Monthly required", "Priority", "Status", "Actions"]}
          rows={futurePlans.map((plan) => {
            const status = futurePlanStatus(plan);
            return [
              plan.name,
              plan.category,
              plan.planType,
              currency(plan.targetAmount),
              currency(plan.currentSaved),
              currency(Math.max(plan.targetAmount - plan.currentSaved, 0)),
              plan.targetDate,
              currency(futurePlanMonthlyRequired(plan)),
              plan.priority,
              <Badge tone={status.tone}>{status.label}</Badge>,
              <div className="table-actions">
                <button className="icon-button" type="button" aria-label={`Edit ${plan.name}`} onClick={() => startEditFuturePlan(plan)}>
                  <Pencil size={16} />
                </button>
                <button className="icon-button" type="button" aria-label={`Delete ${plan.name}`} onClick={() => removeFuturePlan(plan)}>
                  <Trash2 size={16} />
                </button>
              </div>,
            ];
          })}
        />
      </Panel>
    </div>
  );
}

function MonthlyCashFlowPage() {
  const data = useFinancialData();
  const summary = calculateMonthlyPlannerSummary(data);
  const formulaRows = [
    ["Opening cash", currency(summary.openingCash)],
    ["Posted income this month", currency(summary.postedIncome)],
    ["Expected income this month", currency(summary.expectedIncome)],
    ["Receivables expected this month", currency(summary.receivablesExpected)],
    ["Actual expenses", `-${currency(summary.actualExpenses)}`],
    ["Loan repayments due", `-${currency(summary.loanRepaymentsDue)}`],
    ["Survival allocation", `-${currency(summary.survivalAllocation)}`],
    ["Future plan savings required", `-${currency(summary.futurePlanSavingsRequired)}`],
    ["Safe-to-spend", currency(summary.safeToSpend)],
  ];

  return (
    <div className="page-stack">
      <PageToolbar title="Monthly Cash Flow" actions={["Add cash event", "Run cash forecast", "Export cash flow"]} />
      <div className="summary-grid four">
        <SummaryCard label="Total money in hand" value={currency(summary.cashAvailable)} detail="Opening cash + income + receivables" tone="success" />
        <SummaryCard label="Money needed for survival" value={currency(summary.survivalAllocation)} detail="This month reserve" tone="warning" />
        <SummaryCard label="Money needed for future plans" value={currency(summary.futurePlanSavingsRequired)} detail="Monthly goal saving" tone="warning" />
        <SummaryCard label="Safe-to-spend amount" value={currency(summary.safeToSpend)} detail={summary.safeToSpend < 0 ? "Shortage" : "Surplus"} tone={summary.safeToSpend < 0 ? "danger" : "success"} />
      </div>
      <Panel title="Money Available This Month Formula">
        <DataTable columns={["Line item", "Amount"]} rows={formulaRows} />
      </Panel>
      <Panel title="Cash Flow Decision">
        <p className={summary.safeToSpend < 0 ? "insight danger" : "insight success"}>
          {summary.safeToSpend < 0
            ? `Shortage: you need ${currency(Math.abs(summary.safeToSpend))} more to cover required keep-aside and actual expenses.`
            : `Surplus: ${currency(summary.safeToSpend)} is available after required reserves and expenses.`}
        </p>
      </Panel>
    </div>
  );
}

function AssetsPage() {
  const { assets, loans } = useFinancialData();
  const { deleteAsset, updateAsset } = useFinancialDataActions();
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [notice, setNotice] = useState("");
  const assetValue = assets.reduce((sum, asset) => sum + asset.currentValue * (asset.ownership / 100), 0);
  const purchaseValue = assets.reduce((sum, asset) => sum + asset.purchaseValue * (asset.ownership / 100), 0);
  const linkedAssetDebt = assets.reduce((sum, asset) => {
    const linkedLoan = loans.find((loan) => loan.name === asset.linkedLoan);
    return sum + (linkedLoan?.currentBalance ?? 0);
  }, 0);
  const classifyAsset = (asset: Asset) => {
    const label = `${asset.name} ${asset.category}`.toLowerCase();
    if (/cash|bank|checking|saving|wallet|emergency/.test(label)) return { type: "Cash & Bank", subtype: /wallet/.test(label) ? "Digital wallet" : /cash/.test(label) ? "Cash in hand" : /saving|emergency/.test(label) ? "Savings account" : "Checking account" };
    if (/real|home|house|land|property|apartment|rental|commercial/.test(label)) return { type: "Land / Real Estate", subtype: /land/.test(label) ? "Land" : /apartment/.test(label) ? "Apartment" : /rental/.test(label) ? "Rental property" : /commercial/.test(label) ? "Commercial property" : "House" };
    if (/stock|fund|etf|crypto|gold|retirement|brokerage|deposit/.test(label)) return { type: "Investments", subtype: /crypto/.test(label) ? "Crypto" : /gold/.test(label) ? "Gold" : /retirement/.test(label) ? "Retirement accounts" : /fund/.test(label) ? "Mutual funds" : /etf|stock|brokerage/.test(label) ? "Stocks / ETFs" : "Fixed deposits" };
    if (/vehicle|car|bike|truck|tesla|auto/.test(label)) return { type: "Vehicles", subtype: /bike/.test(label) ? "Bike" : /truck/.test(label) ? "Truck" : "Car" };
    if (/business|inventory|equipment|company|website|app/.test(label)) return { type: "Business Assets", subtype: /inventory/.test(label) ? "Inventory" : /share|company/.test(label) ? "Company shares" : /website|app/.test(label) ? "Website/app/business value" : "Business equipment" };
    return { type: "Personal Valuable Assets", subtype: /jewel/.test(label) ? "Jewelry" : /electronic/.test(label) ? "Electronics" : /furniture/.test(label) ? "Furniture" : "Collectibles" };
  };

  const removeAsset = async (asset: Asset) => {
    const result = await deleteAsset(asset);
    setNotice(result.ok ? "Asset deleted." : `Could not delete asset: ${result.message}`);
  };

  const startEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setNotice("");
  };

  const submitAssetEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingAsset) return;

    const data = new FormData(event.currentTarget);
    const name = formString(data, "name");
    const currentValue = formNumber(data, "currentValue");

    if (!name || currentValue < 0) {
      setNotice("Enter an asset name and current value before saving.");
      return;
    }

    const record: Asset = {
      id: editingAsset.id,
      category: formString(data, "category", editingAsset.category),
      currentValue,
      linkedLoan: formString(data, "linkedLoan") || undefined,
      name,
      ownership: formNumber(data, "ownership", editingAsset.ownership),
      purchaseValue: formNumber(data, "purchaseValue", editingAsset.purchaseValue),
      updated: "July 2026",
    };

    const result = await updateAsset(record, editingAsset);
    if (!result.ok) {
      setNotice(`Could not update asset: ${result.message}`);
      return;
    }

    setEditingAsset(null);
    setNotice("Asset updated.");
  };

  return (
    <div className="page-stack">
      <PageToolbar title="Assets" actions={["Add asset", "Update value", "Upload document"]} />
      {notice && <p className={/could not/i.test(notice) ? "form-message danger" : "form-message info"}>{notice}</p>}
      {editingAsset && (
        <Panel title={`Edit Asset: ${editingAsset.name}`} action={<button className="icon-button" onClick={() => setEditingAsset(null)} aria-label="Close asset edit form"><X size={16} /></button>}>
          <form className="feature-action-form" onSubmit={submitAssetEdit}>
            <label>
              <span>Asset name</span>
              <input name="name" defaultValue={editingAsset.name} required />
            </label>
            <label>
              <span>Category</span>
              <input name="category" defaultValue={editingAsset.category} required />
            </label>
            <label>
              <span>Purchase value</span>
              <input name="purchaseValue" inputMode="decimal" defaultValue={editingAsset.purchaseValue} />
            </label>
            <label>
              <span>Current value</span>
              <input name="currentValue" inputMode="decimal" defaultValue={editingAsset.currentValue} required />
            </label>
            <label>
              <span>Ownership %</span>
              <input name="ownership" inputMode="decimal" defaultValue={editingAsset.ownership} />
            </label>
            <label>
              <span>Linked loan</span>
              <input name="linkedLoan" defaultValue={editingAsset.linkedLoan ?? ""} placeholder="Optional loan name" />
            </label>
            <button className="primary-button" type="submit">
              Update asset
              <ArrowRight size={17} />
            </button>
          </form>
        </Panel>
      )}
      <div className="summary-grid four">
        <SummaryCard label="Current asset value" value={currency(assetValue)} detail="Owned value after ownership percentage" tone="success" />
        <SummaryCard label="Purchase value" value={currency(purchaseValue)} detail="Original acquisition value" tone="info" />
        <SummaryCard label="Appreciation" value={signedCurrency(assetValue - purchaseValue)} detail="Current minus purchase value" tone={assetValue >= purchaseValue ? "success" : "warning"} />
        <SummaryCard label="Linked asset debt" value={currency(linkedAssetDebt)} detail="Shown only when attached to an asset" tone={linkedAssetDebt > 0 ? "warning" : "success"} />
      </div>
      <Panel title="Asset Hierarchy">
        <HierarchyList rows={assets.map((asset) => {
          const group = classifyAsset(asset);
          return [group.type, group.subtype, asset.name, currency(asset.currentValue)];
        })} />
      </Panel>
      <Panel title="Asset Items">
        <DataTable
          columns={["Asset name", "Asset type", "Subtype", "Purchase value", "Current value", "Appreciation / depreciation", "Ownership", "Linked loan", "Notes / updated", "Actions"]}
          rows={assets.map((asset) => {
            const group = classifyAsset(asset);
            return [
              asset.name,
              group.type,
              group.subtype,
              currency(asset.purchaseValue),
              currency(asset.currentValue),
              <span className={asset.currentValue - asset.purchaseValue >= 0 ? "money-positive" : "money-negative"}>
                {signedCurrency(asset.currentValue - asset.purchaseValue)}
              </span>,
              `${asset.ownership}%`,
              asset.linkedLoan ?? "None",
              asset.updated,
              <div className="table-actions">
                <button className="icon-button" type="button" aria-label={`Edit ${asset.name}`} onClick={() => startEditAsset(asset)}>
                  <Pencil size={16} />
                </button>
                <button className="icon-button" type="button" aria-label={`Delete ${asset.name}`} onClick={() => removeAsset(asset)}>
                  <Trash2 size={16} />
                </button>
              </div>,
            ];
          })}
        />
      </Panel>
      <Panel title="Asset Rules">
        <InsightList
          tone="info"
          items={[
            "Assets show only asset type, subtype, and asset item details.",
            "Loans and repayments stay in Loans / Debts unless linked to an asset.",
            "Linked loan values are metadata for equity context, not repayment records.",
          ]}
        />
      </Panel>
    </div>
  );
}

function ReceivablesPage() {
  const { receivables } = useFinancialData();
  const { updateFinancialData } = useFinancialDataActions();
  const [showForm, setShowForm] = useState(false);
  const [editingReceivable, setEditingReceivable] = useState<Receivable | null>(null);
  const [notice, setNotice] = useState("");
  const totalOwed = receivables.reduce((sum, row) => sum + row.amountOwed, 0);
  const totalReceived = receivables.reduce((sum, row) => sum + row.amountReceived, 0);
  const totalRemaining = receivables.reduce((sum, row) => sum + receivableRemaining(row), 0);
  const overdue = receivables.filter((row) => row.status === "Overdue").reduce((sum, row) => sum + receivableRemaining(row), 0);

  const submitReceivable = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const person = formString(data, "person");
    const amountOwed = formNumber(data, "amountOwed");

    if (!person || amountOwed <= 0) return;

    const record: Receivable = {
      id: editingReceivable?.id ?? localRecordId("receivable"),
      amountOwed,
      amountReceived: formNumber(data, "amountReceived"),
      dueDate: formatInputDate(formString(data, "dueDate", formatIsoDateValue(new Date()))),
      frequency: formString(data, "frequency", "One time"),
      notes: formString(data, "notes"),
      owerType: formString(data, "owerType", "Other"),
      person,
      reason: formString(data, "reason", "Other"),
      status: formString(data, "status", "Pending") as Receivable["status"],
    };

    updateFinancialData((current) => ({
      ...current,
      receivables: editingReceivable
        ? replaceFirstRecord(
            current.receivables,
            (row) => (editingReceivable.id ? row.id === editingReceivable.id : row.person === editingReceivable.person && row.amountOwed === editingReceivable.amountOwed),
            record,
          )
        : [record, ...current.receivables],
    }));
    setShowForm(false);
    setEditingReceivable(null);
    setNotice(editingReceivable ? "Receivable updated." : "Receivable saved.");
  };

  const openReceivableForm = () => {
    setEditingReceivable(null);
    setShowForm((value) => !value);
    setNotice("");
  };

  const startEditReceivable = (record: Receivable) => {
    setEditingReceivable(record);
    setShowForm(true);
    setNotice("");
  };

  const closeReceivableForm = () => {
    setEditingReceivable(null);
    setShowForm(false);
  };

  const removeReceivable = (record: Receivable) => {
    updateFinancialData((current) => ({
      ...current,
      receivables: removeFirstRecord(current.receivables, (row) => (record.id ? row.id === record.id : row.person === record.person && row.amountOwed === record.amountOwed)),
    }));
    setNotice("Receivable deleted.");
  };

  return (
    <div className="page-stack">
      <div className="page-toolbar">
        <div>
          <p className="eyebrow">Money Owed to Me → Ower Type → Reason → Person / Entity → Payment Schedule</p>
          <h2>Money Owed to Me</h2>
        </div>
        <button className="primary-button" onClick={openReceivableForm}>
          <Plus size={17} />
          Add receivable
        </button>
      </div>
      {notice && <p className="form-message info">{notice}</p>}
      {showForm && (
        <Panel title={editingReceivable ? "Edit Money Owed to Me" : "Add Money Owed to Me"} action={<button className="icon-button" onClick={closeReceivableForm} aria-label="Close receivable form"><X size={16} /></button>}>
          <form className="feature-action-form" onSubmit={submitReceivable}>
            <label>
              <span>Ower type</span>
              <select key={`receivable-ower-${editingReceivable?.id ?? "new"}`} name="owerType" defaultValue={editingReceivable?.owerType ?? "Friend"}>
                {["Friend", "Family", "Tenant", "Business client", "Employer", "Third party", "Other"].map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label>
              <span>Reason</span>
              <select key={`receivable-reason-${editingReceivable?.id ?? "new"}`} name="reason" defaultValue={editingReceivable?.reason ?? "Personal loan given"}>
                {["Personal loan given", "Rent receivable", "Business invoice", "Shared expense", "Deposit refund", "Reimbursement", "Other"].map((reason) => <option key={reason}>{reason}</option>)}
              </select>
            </label>
            <label>
              <span>Person / entity</span>
              <input key={`receivable-person-${editingReceivable?.id ?? "new"}`} name="person" defaultValue={editingReceivable?.person ?? ""} placeholder="Name" required />
            </label>
            <label>
              <span>Amount owed</span>
              <input key={`receivable-owed-${editingReceivable?.id ?? "new"}`} name="amountOwed" inputMode="decimal" defaultValue={editingReceivable?.amountOwed ?? ""} placeholder="1000" required />
            </label>
            <label>
              <span>Amount received</span>
              <input key={`receivable-received-${editingReceivable?.id ?? "new"}`} name="amountReceived" inputMode="decimal" defaultValue={editingReceivable?.amountReceived ?? 0} />
            </label>
            <label>
              <span>Due date</span>
              <input key={`receivable-due-${editingReceivable?.id ?? "new"}`} name="dueDate" type="date" defaultValue={editingReceivable ? toIsoDate(editingReceivable.dueDate) : formatIsoDateValue(new Date())} />
            </label>
            <label>
              <span>Frequency</span>
              <select key={`receivable-frequency-${editingReceivable?.id ?? "new"}`} name="frequency" defaultValue={editingReceivable?.frequency ?? "One time"}>
                {["One time", "Weekly", "Every 2 weeks", "Monthly", "Quarterly", "Yearly"].map((frequency) => <option key={frequency}>{frequency}</option>)}
              </select>
            </label>
            <label>
              <span>Status</span>
              <select key={`receivable-status-${editingReceivable?.id ?? "new"}`} name="status" defaultValue={editingReceivable?.status ?? "Pending"}>
                {["Pending", "Partially Paid", "Paid", "Overdue"].map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label>
              <span>Notes</span>
              <input key={`receivable-notes-${editingReceivable?.id ?? "new"}`} name="notes" defaultValue={editingReceivable?.notes ?? ""} placeholder="Optional" />
            </label>
            <button className="primary-button" type="submit">
              {editingReceivable ? "Update receivable" : "Save receivable"}
              <ArrowRight size={17} />
            </button>
          </form>
        </Panel>
      )}
      <div className="summary-grid four">
        <SummaryCard label="Total owed" value={currency(totalOwed)} detail="Original receivable amount" tone="info" />
        <SummaryCard label="Received" value={currency(totalReceived)} detail="Cash collected so far" tone="success" />
        <SummaryCard label="Remaining balance" value={currency(totalRemaining)} detail="Counts as receivable asset" tone="warning" />
        <SummaryCard label="Overdue" value={currency(overdue)} detail="Past due receivables" tone={overdue > 0 ? "danger" : "success"} />
      </div>
      <Panel title="Receivable Hierarchy">
        <HierarchyList rows={receivables.map((row) => [row.owerType, row.reason, row.person, `${row.frequency} · ${row.dueDate}`])} />
      </Panel>
      <Panel title="People and Entities Who Owe Me">
        <DataTable
          columns={["Person / entity", "Ower type", "Reason", "Amount owed", "Received", "Remaining", "Due date", "Frequency", "Status", "Actions"]}
          rows={receivables.map((row) => [
            row.person,
            row.owerType,
            row.reason,
            currency(row.amountOwed),
            currency(row.amountReceived),
            currency(receivableRemaining(row)),
            row.dueDate,
            row.frequency,
            <Badge tone={row.status === "Paid" ? "success" : row.status === "Overdue" ? "danger" : row.status === "Partially Paid" ? "warning" : "info"}>{row.status}</Badge>,
            <div className="table-actions">
              <button className="icon-button" type="button" aria-label={`Edit ${row.person}`} onClick={() => startEditReceivable(row)}>
                <Pencil size={16} />
              </button>
              <button className="icon-button" type="button" aria-label={`Delete ${row.person}`} onClick={() => removeReceivable(row)}>
                <Trash2 size={16} />
              </button>
            </div>,
          ])}
        />
      </Panel>
    </div>
  );
}

function LoansPage() {
  const { assets, loanSchedule, loans } = useFinancialData();
  const { deleteLoan, updateLoan } = useFinancialDataActions();
  const autoLoan = loans[1] ?? loans[0];
  const carAsset = autoLoan ? assets.find((asset) => asset.name === autoLoan.linkedAsset) : undefined;
  const carEquity = autoLoan ? (carAsset?.currentValue ?? 0) - autoLoan.currentBalance : 0;
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [extraMonthly, setExtraMonthly] = useState("200");
  const [oneTimePayment, setOneTimePayment] = useState("1000");
  const [notice, setNotice] = useState("");
  const extra = Number(extraMonthly) || 0;
  const oneTime = Number(oneTimePayment) || 0;
  const monthsReduced = Math.max(1, Math.round((extra * 0.07 + oneTime / 1000) * 4));
  const interestSaved = Math.round(extra * 18 + oneTime * 0.35);
  const totalDebt = loans.reduce((sum, loan) => sum + loan.currentBalance, 0);
  const monthlyRequired = loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
  const linkedDebt = loans.filter((loan) => loan.linkedAsset).reduce((sum, loan) => sum + loan.currentBalance, 0);
  const overduePayments = loans.filter((loan) => loan.rate > 20).reduce((sum, loan) => sum + loan.monthlyPayment, 0);
  const classifyLoan = (loan: Loan) => {
    const label = `${loan.name} ${loan.type}`.toLowerCase();
    if (/card|credit|statement|balance transfer/.test(label)) return { type: "Credit Card Repayments", subtype: /emi/.test(label) ? "EMI on credit card" : "Credit card balance", lender: loan.name };
    if (/mortgage|personal|car|auto|home|education|student|business|bank/.test(label)) return { type: "Bank Loans", subtype: loan.type, lender: loan.name };
    if (/friend|family|private|employer/.test(label)) return { type: "Third-Party Loans", subtype: loan.type, lender: loan.name };
    if (/emi|bnpl|store|financing|product/.test(label)) return { type: "Buy Now Pay Later / EMI", subtype: loan.type, lender: loan.name };
    return { type: "Other Debt", subtype: loan.type, lender: loan.name };
  };
  const removeLoan = async (loan: Loan) => {
    const result = await deleteLoan(loan);
    setNotice(result.ok ? "Loan deleted." : `Could not delete loan: ${result.message}`);
  };

  const startEditLoan = (loan: Loan) => {
    setEditingLoan(loan);
    setNotice("");
  };

  const submitLoanEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingLoan) return;

    const data = new FormData(event.currentTarget);
    const name = formString(data, "name");
    const currentBalance = formNumber(data, "currentBalance");

    if (!name || currentBalance < 0) {
      setNotice("Enter a loan name and current balance before saving.");
      return;
    }

    const rate = formNumber(data, "rate", editingLoan.rate);
    const record: Loan = {
      id: editingLoan.id,
      currentBalance,
      end: formString(data, "end", editingLoan.end),
      interestLeft: formNumber(data, "interestLeft", Math.round(currentBalance * (rate / 100) * 1.5)),
      linkedAsset: formString(data, "linkedAsset") || undefined,
      monthlyPayment: formNumber(data, "monthlyPayment", editingLoan.monthlyPayment),
      name,
      originalAmount: formNumber(data, "originalAmount", editingLoan.originalAmount),
      rate,
      remainingMonths: formNumber(data, "remainingMonths", editingLoan.remainingMonths),
      start: formString(data, "start", editingLoan.start),
      type: formString(data, "type", editingLoan.type),
    };

    const result = await updateLoan(record, editingLoan);
    if (!result.ok) {
      setNotice(`Could not update loan: ${result.message}`);
      return;
    }

    setEditingLoan(null);
    setNotice("Loan updated.");
  };

  return (
    <div className="page-stack">
      <PageToolbar title="Loans / Liabilities" actions={["Add loan", "Update loan", "Run simulator", "Export schedule"]} />
      {notice && <p className={/could not/i.test(notice) ? "form-message danger" : "form-message info"}>{notice}</p>}
      {editingLoan && (
        <Panel title={`Edit Loan: ${editingLoan.name}`} action={<button className="icon-button" onClick={() => setEditingLoan(null)} aria-label="Close loan edit form"><X size={16} /></button>}>
          <form className="feature-action-form" onSubmit={submitLoanEdit}>
            <label>
              <span>Loan name</span>
              <input name="name" defaultValue={editingLoan.name} required />
            </label>
            <label>
              <span>Type</span>
              <input name="type" defaultValue={editingLoan.type} required />
            </label>
            <label>
              <span>Original amount</span>
              <input name="originalAmount" inputMode="decimal" defaultValue={editingLoan.originalAmount} />
            </label>
            <label>
              <span>Current balance</span>
              <input name="currentBalance" inputMode="decimal" defaultValue={editingLoan.currentBalance} required />
            </label>
            <label>
              <span>Interest rate %</span>
              <input name="rate" inputMode="decimal" defaultValue={editingLoan.rate} />
            </label>
            <label>
              <span>Monthly payment</span>
              <input name="monthlyPayment" inputMode="decimal" defaultValue={editingLoan.monthlyPayment} />
            </label>
            <label>
              <span>Remaining months</span>
              <input name="remainingMonths" inputMode="numeric" defaultValue={editingLoan.remainingMonths} />
            </label>
            <label>
              <span>Interest left</span>
              <input name="interestLeft" inputMode="decimal" defaultValue={editingLoan.interestLeft} />
            </label>
            <label>
              <span>Start</span>
              <input name="start" defaultValue={editingLoan.start} />
            </label>
            <label>
              <span>Payoff date</span>
              <input name="end" defaultValue={editingLoan.end} />
            </label>
            <label>
              <span>Linked asset</span>
              <input name="linkedAsset" defaultValue={editingLoan.linkedAsset ?? ""} placeholder="Optional asset name" />
            </label>
            <button className="primary-button" type="submit">
              Update loan
              <ArrowRight size={17} />
            </button>
          </form>
        </Panel>
      )}
      <div className="summary-grid four">
        <SummaryCard label="Total debt" value={currency(totalDebt)} detail="Current balances owed" tone={totalDebt > 0 ? "danger" : "success"} />
        <SummaryCard label="Monthly repayment required" value={currency(monthlyRequired)} detail="Minimum and EMI payments" tone="warning" />
        <SummaryCard label="Debt linked to assets" value={currency(linkedDebt)} detail="Mortgage, auto, or secured debts" tone="info" />
        <SummaryCard label="High-risk monthly due" value={currency(overduePayments)} detail="High APR / urgent repayment bucket" tone={overduePayments > 0 ? "danger" : "success"} />
      </div>
      <Panel title="Debt Hierarchy">
        <HierarchyList rows={loans.map((loan) => {
          const group = classifyLoan(loan);
          return [group.type, group.subtype, group.lender, `${currency(loan.monthlyPayment)} monthly`];
        })} />
      </Panel>
      <Panel title="Loan Portfolio">
        <DataTable
          columns={["Loan type", "Loan subtype", "Lender / loan", "Original amount", "Current balance", "Interest rate", "Monthly payment", "Due frequency", "Linked asset", "Status", "Actions"]}
          rows={loans.map((loan) => {
            const group = classifyLoan(loan);
            return [
              group.type,
              group.subtype,
              loan.name,
              currency(loan.originalAmount),
              currency(loan.currentBalance),
              `${loan.rate}%`,
              currency(loan.monthlyPayment),
              "Monthly",
              loan.linkedAsset ?? "Not linked",
              <Badge tone={loan.rate > 20 ? "danger" : "success"}>{loan.rate > 20 ? "High APR" : "Active"}</Badge>,
              <div className="table-actions">
                <button className="icon-button" type="button" aria-label={`Edit ${loan.name}`} onClick={() => startEditLoan(loan)}>
                  <Pencil size={16} />
                </button>
                <button className="icon-button" type="button" aria-label={`Delete ${loan.name}`} onClick={() => removeLoan(loan)}>
                  <Trash2 size={16} />
                </button>
              </div>,
            ];
          })}
        />
      </Panel>
      <div className="dashboard-grid">
        <Panel title={autoLoan ? `Loan Detail: ${autoLoan.name}` : "Loan Detail"}>
          {autoLoan ? (
            <>
              <div className="detail-grid">
                <MetricBlock label="Remaining balance" value={currency(autoLoan.currentBalance)} />
                <MetricBlock label="Interest rate" value={`${autoLoan.rate}%`} />
                <MetricBlock label="Monthly payment" value={currency(autoLoan.monthlyPayment)} />
                <MetricBlock label="Payoff date" value={autoLoan.end} />
              </div>
              <p className="insight success">Paying $200 extra per month saves about $3,850 interest and closes the loan 14 months earlier.</p>
              <DataTable
                columns={["Month", "Opening Balance", "Payment", "Principal", "Interest", "Closing Balance"]}
                rows={loanSchedule.map((row) => [
                  row.month,
                  currency(row.opening),
                  currency(row.payment),
                  currency(row.principal),
                  currency(row.interest),
                  currency(row.closing),
                ])}
              />
            </>
          ) : (
            <EmptyState title="No loans yet." detail="Add a loan to start planning payoff scenarios." />
          )}
        </Panel>
        <Panel title="Extra Payment Simulator">
          <form className="form-panel compact-panel">
            <label>
              <span>Extra monthly payment</span>
              <input value={extraMonthly} onChange={(event) => setExtraMonthly(event.target.value)} inputMode="decimal" />
            </label>
            <label>
              <span>One-time payment</span>
              <input value={oneTimePayment} onChange={(event) => setOneTimePayment(event.target.value)} inputMode="decimal" />
            </label>
            <Field label="New interest rate" placeholder="6.4%" />
            <label>
              <span>Refinance option</span>
              <select>
                <option>Compare only</option>
                <option>Apply to scenario</option>
              </select>
            </label>
          </form>
          <p className="insight success">
            Estimated result: save about {currency(interestSaved)} and reduce the payoff by {monthsReduced} months.
          </p>
          <div className="linked-asset">
            <h4>Linked Asset</h4>
            <MetricBlock label="Vehicle value" value={currency(carAsset?.currentValue ?? 0)} />
            <MetricBlock label="Loan balance" value={currency(autoLoan?.currentBalance ?? 0)} />
            <MetricBlock label="Equity" value={currency(carEquity)} />
          </div>
        </Panel>
      </div>
      <CategoryPanel title="Loan Types" items={loanTypes} />
    </div>
  );
}

function NetWorthPage() {
  const { netWorth, netWorthSeries, totalAssets, totalLiabilities } = useFinancialData();

  return (
    <div className="page-stack">
      <PageToolbar title="Net Worth" actions={["Add asset", "Add loan", "Export net worth"]} />
      <div className="summary-grid four">
        <SummaryCard label="Current net worth" value={currency(netWorth)} detail="Total assets - total liabilities" tone="success" />
        <SummaryCard label="Asset total" value={currency(totalAssets)} detail="Current value" tone="info" />
        <SummaryCard label="Debt total" value={currency(totalLiabilities)} detail="Remaining balances" tone="danger" />
        <SummaryCard label="Monthly change" value="+$7,650" detail="Investments and debt payoff" tone="success" />
      </div>
      <Panel title="Net Worth Timeline" action={<Segmented labels={["1M", "6M", "1Y", "5Y", "10Y"]} />}>
        <LineChart series={netWorthSeries} tall />
      </Panel>
      <div className="dashboard-grid">
        <Panel title="Positive Contributors">
          <InsightList items={["Mortgage payoff added $850 to equity.", "Investment portfolio increased by 3.2%.", "Cash savings grew by $1,670."]} tone="success" />
        </Panel>
        <Panel title="Negative Contributors">
          <InsightList items={["Car depreciation reduced asset value by $400.", "Credit card balance increased by $850.", "Dining overspend reduced cash flow."]} tone="warning" />
        </Panel>
      </div>
    </div>
  );
}

function BudgetPage() {
  const { budgetLines } = useFinancialData();
  const spentTotal = budgetLines.reduce((sum, line) => sum + line.spent, 0);
  const budgetTotal = budgetLines.reduce((sum, line) => sum + line.budget, 0);
  const [selectedMethod, setSelectedMethod] = useState("50/30/20 rule");

  return (
    <div className="page-stack">
      <PageToolbar title="Budget Planner" actions={["Set monthly budget", "Apply 50/30/20", "Compare actual"]} />
      <div className="summary-grid four">
        <SummaryCard label="Budgeted" value={currency(budgetTotal)} detail="Monthly category limits" tone="info" />
        <SummaryCard label="Spent" value={currency(spentTotal)} detail="Tracked so far" tone="warning" />
        <SummaryCard label="Remaining" value={currency(budgetTotal - spentTotal)} detail="Available this month" tone="success" />
        <SummaryCard label="Fixed expenses" value="58%" detail="Of monthly income" tone="warning" />
      </div>
      <Panel title="Category Budget">
        <DataTable
          columns={["Category", "Budget", "Spent", "Remaining", "Status"]}
          rows={budgetLines.map((line) => {
            const status = statusForBudget(line);
            return [
              line.category,
              currency(line.budget),
              currency(line.spent),
              <span className={line.budget - line.spent >= 0 ? "money-positive" : "money-negative"}>
                {signedCurrency(line.budget - line.spent)}
              </span>,
              <Badge tone={status.tone}>{status.label}</Badge>,
            ];
          })}
        />
      </Panel>
      <Panel title="Budget Methods">
        <p className="insight info">Selected method: {selectedMethod}</p>
        <div className="method-grid">
          {["50/30/20 rule", "Zero-based budgeting", "Category budgeting", "Custom monthly budget", "Envelope method"].map((method) => (
            <button className={selectedMethod === method ? "method-card active" : "method-card"} key={method} onClick={() => setSelectedMethod(method)}>
              <WalletCards size={20} />
              <span>{method}</span>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function GoalsPage() {
  const { goals } = useFinancialData();

  return (
    <div className="page-stack">
      <PageToolbar title="Financial Goals" actions={["Add goal", "Adjust contribution", "Link account"]} />
      {goals.length > 0 ? (
        <div className="goal-grid">
          {goals.map((goal) => (
            <GoalCard key={goal.name} goal={goal} />
          ))}
        </div>
      ) : (
        <Panel title="Goals">
          <EmptyState title="No goals yet." detail="Add a goal to track target dates and monthly contributions." />
        </Panel>
      )}
    </div>
  );
}

function ForecastPage() {
  const { forecastScenarios } = useFinancialData();

  return (
    <div className="page-stack">
      <PageToolbar title="Cash Flow Forecast" actions={["New scenario", "Compare", "Run forecast"]} />
      <div className="dashboard-grid">
        <Panel title="Forecast Inputs">
          <div className="input-grid">
            {[
              "Current income",
              "Income growth %",
              "Expense inflation %",
              "Asset growth %",
              "Loan interest rates",
              "Extra payments",
              "Investment returns",
              "Large purchases",
              "Retirement contributions",
            ].map((input) => (
              <Field key={input} label={input} placeholder="Set assumption" />
            ))}
          </div>
        </Panel>
        <Panel title="Forecast Outputs">
          <InsightList
            tone="info"
            items={[
              "Future net worth and cash balance after 1, 5, and 10 years.",
              "Loan payoff timeline and debt reduction curve.",
              "Goal achievement dates and retirement readiness signals.",
              "Risk warnings for tight cash flow or high debt.",
            ]}
          />
        </Panel>
      </div>
      <Panel title="Scenario Comparison">
        <DataTable
          columns={["Scenario", "Net Worth in 5 Years", "Debt Left", "Cash Flow", "Risk"]}
          rows={forecastScenarios.map((scenario) => [
            scenario.scenario,
            currency(scenario.netWorth),
            currency(scenario.debtLeft),
            scenario.cashFlow,
            <Badge tone={scenario.risk === "Low" ? "success" : scenario.risk === "Medium" ? "warning" : "danger"}>{scenario.risk}</Badge>,
          ])}
        />
      </Panel>
    </div>
  );
}

function InvestmentsPage() {
  const { investments } = useFinancialData();
  const portfolioValue = investments.reduce((sum, item) => sum + item.currentValue, 0);
  const dividendTotal = investments.reduce((sum, item) => sum + item.dividends, 0);

  return (
    <div className="page-stack">
      <PageToolbar title="Investment Tracker" actions={["Add investment", "Update prices", "Map to goal"]} />
      <div className="summary-grid four">
        <SummaryCard label="Portfolio value" value={currency(portfolioValue)} detail="Manual snapshot" tone="success" />
        <SummaryCard label="Average gain" value={investments.length ? "+13.3%" : "0%"} detail="Weighted simple view" tone="success" />
        <SummaryCard label="Dividends" value={currency(dividendTotal)} detail="Trailing 12 months" tone="info" />
        <SummaryCard label="Risk level" value={investments.length ? "Medium" : "Not set"} detail="Equity-heavy allocation" tone="warning" />
      </div>
      <Panel title="Holdings">
        <DataTable
          columns={["Investment", "Ticker", "Account", "Quantity", "Current value", "Gain / loss", "Dividends", "Risk"]}
          rows={investments.map((investment) => [
            investment.name,
            investment.symbol,
            investment.account,
            investment.quantity,
            currency(investment.currentValue),
            <span className="money-positive">+{investment.gain}%</span>,
            currency(investment.dividends),
            <Badge tone={investment.risk === "High" ? "danger" : "warning"}>{investment.risk}</Badge>,
          ])}
        />
      </Panel>
    </div>
  );
}

function formatDateKey(year: number, monthIndex: number, day: number) {
  const date = new Date(year, monthIndex, day);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const calendarToday = new Date(2026, 6, 6);
const monthIndexes: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { day, monthIndex: month - 1, year };
}

function addCalendarMonths(year: number, monthIndex: number, offset: number) {
  const next = new Date(year, monthIndex + offset, 1);
  return { monthIndex: next.getMonth(), year: next.getFullYear() };
}

function formatMonthTitle(year: number, monthIndex: number) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(year, monthIndex, 1));
}

function formatCalendarDate(year: number, monthIndex: number, day: number) {
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric" }).format(new Date(year, monthIndex, day));
}

function weekdayName(year: number, monthIndex: number, day: number) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date(year, monthIndex, day));
}

function parseReminderDateKey(reminder: FinancialData["reminders"][number]) {
  const match = reminder.day.match(/^([A-Za-z]{3})\s+(\d{1,2})$/);
  if (!match) return "";

  const monthIndex = monthIndexes[match[1]];
  const day = Number(match[2]);
  if (monthIndex === undefined || !Number.isFinite(day)) return "";

  return formatDateKey(2026, monthIndex, day);
}

function CalendarPage() {
  const { reminders } = useFinancialData();
  const todayKey = formatDateKey(calendarToday.getFullYear(), calendarToday.getMonth(), calendarToday.getDate());
  const [visibleMonth, setVisibleMonth] = useState(() => ({
    monthIndex: calendarToday.getMonth(),
    year: calendarToday.getFullYear(),
  }));
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [showDateEntryForm, setShowDateEntryForm] = useState(false);
  const [calendarNotice, setCalendarNotice] = useState("");
  const remindersByDate = useMemo(() => {
    const grouped = new Map<string, FinancialData["reminders"]>();

    reminders.forEach((reminder) => {
      const dateKey = parseReminderDateKey(reminder);
      if (!dateKey) return;
      grouped.set(dateKey, [...(grouped.get(dateKey) ?? []), reminder]);
    });

    return grouped;
  }, [reminders]);
  const calendarCells = useMemo(() => {
    const firstWeekday = new Date(visibleMonth.year, visibleMonth.monthIndex, 1).getDay();
    const daysInMonth = new Date(visibleMonth.year, visibleMonth.monthIndex + 1, 0).getDate();
    const previousMonthDays = new Date(visibleMonth.year, visibleMonth.monthIndex, 0).getDate();
    const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, index) => {
      const monthDay = index - firstWeekday + 1;
      let year = visibleMonth.year;
      let monthIndex = visibleMonth.monthIndex;
      let day = monthDay;
      let isCurrentMonth = true;

      if (monthDay < 1) {
        monthIndex -= 1;
        day = previousMonthDays + monthDay;
        isCurrentMonth = false;
      } else if (monthDay > daysInMonth) {
        monthIndex += 1;
        day = monthDay - daysInMonth;
        isCurrentMonth = false;
      }

      const dateKey = formatDateKey(year, monthIndex, day);

      return {
        dateKey,
        day,
        events: isCurrentMonth ? remindersByDate.get(dateKey) ?? [] : [],
        isCurrentMonth,
        isToday: dateKey === todayKey,
        monthIndex,
        year,
      };
    });
  }, [remindersByDate, todayKey, visibleMonth]);
  const selectedCell = calendarCells.find((cell) => cell.dateKey === selectedDateKey) ?? calendarCells.find((cell) => cell.isToday) ?? calendarCells[0];
  const selectedEvents = selectedCell?.events ?? [];
  const selectedParts = selectedCell ? { day: selectedCell.day, monthIndex: selectedCell.monthIndex, year: selectedCell.year } : parseDateKey(todayKey);
  const selectedDate = new Date(selectedParts.year, selectedParts.monthIndex, selectedParts.day);
  const weekStart = new Date(selectedDate);
  weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  const upcomingWeekReminders = reminders.filter((reminder) => {
    const dateKey = parseReminderDateKey(reminder);
    if (!dateKey) return false;
    const parts = parseDateKey(dateKey);
    const reminderDate = new Date(parts.year, parts.monthIndex, parts.day);
    return reminderDate >= weekStart && reminderDate <= weekEnd;
  });
  const selectDate = (dateKey: string, year: number, monthIndex: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) setVisibleMonth({ monthIndex, year });
    setSelectedDateKey(dateKey);
    setShowDateEntryForm(true);
    setCalendarNotice("");
  };
  const moveMonth = (offset: number) => {
    const nextMonth = addCalendarMonths(visibleMonth.year, visibleMonth.monthIndex, offset);
    const selectedParts = parseDateKey(selectedDateKey);
    const daysInNextMonth = new Date(nextMonth.year, nextMonth.monthIndex + 1, 0).getDate();
    const nextDay = Math.min(selectedParts.day, daysInNextMonth);

    setVisibleMonth(nextMonth);
    setSelectedDateKey(formatDateKey(nextMonth.year, nextMonth.monthIndex, nextDay));
  };
  const goToToday = () => {
    setVisibleMonth({ monthIndex: calendarToday.getMonth(), year: calendarToday.getFullYear() });
    setSelectedDateKey(todayKey);
    setShowDateEntryForm(true);
    setCalendarNotice("");
  };

  return (
    <div className="page-stack">
      <PageToolbar title="Calendar / Reminders" actions={["Add reminder", "Email alerts", "Mark as paid"]} />
      <Panel
        title={formatMonthTitle(visibleMonth.year, visibleMonth.monthIndex)}
        action={
          <div className="calendar-panel-actions">
            <div className="calendar-nav" aria-label="Calendar month navigation">
              <button className="icon-button" type="button" onClick={() => moveMonth(-1)} aria-label="Previous month">
                <ChevronLeft size={18} />
              </button>
              <button className="ghost-button" type="button" onClick={goToToday}>
                <CalendarDays size={17} />
                Today
              </button>
              <button className="icon-button" type="button" onClick={() => moveMonth(1)} aria-label="Next month">
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="calendar-legend" aria-label="Calendar legend">
              <span><i className="legend-dot today" /> Today</span>
              <span><i className="legend-dot danger" /> Due</span>
              <span><i className="legend-dot success" /> Income</span>
            </div>
          </div>
        }
      >
        <div className="calendar-weekdays">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((weekday) => (
            <span key={weekday}>{weekday}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {calendarCells.map((cell) => {
            const primaryTone = cell.events[0]?.tone;
            const className = [
              "calendar-day",
              cell.isCurrentMonth ? "current-month" : "outside-month",
              cell.isToday ? "today" : "",
              cell.dateKey === selectedCell?.dateKey ? "selected" : "",
              cell.events.length ? "has" : "",
              primaryTone ?? "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button className={className} key={cell.dateKey} onClick={() => selectDate(cell.dateKey, cell.year, cell.monthIndex, cell.isCurrentMonth)}>
                <span className="calendar-date-row">
                  <span className="calendar-day-number">{cell.day}</span>
                  {cell.isToday && <strong>Today</strong>}
                </span>
                {cell.events.slice(0, 2).map((event) => (
                  <small className={`calendar-event ${event.tone}`} key={event.title}>{event.title}</small>
                ))}
                {cell.isToday && cell.events.length === 0 && <small className="calendar-event info">Daily review</small>}
                {cell.events.length > 2 && <small className="calendar-more">+{cell.events.length - 2} more</small>}
              </button>
            );
          })}
        </div>
      </Panel>
      <div className="dashboard-grid">
        <Panel title={selectedCell ? formatCalendarDate(selectedCell.year, selectedCell.monthIndex, selectedCell.day) : "Selected Day"}>
          {calendarNotice && <p className="form-message info">{calendarNotice}</p>}
          <div className="selected-day-detail">
            <div className="selected-date-card">
              <span>{selectedCell ? weekdayName(selectedCell.year, selectedCell.monthIndex, selectedCell.day) : "Mon"}</span>
              <strong>{selectedCell?.day ?? 6}</strong>
            </div>
            <div className="selected-day-copy">
              <div className="selected-day-actions">
                {selectedCell?.isToday && <Badge tone="info">Today</Badge>}
                <button className="primary-button" type="button" onClick={() => setShowDateEntryForm((value) => !value)}>
                  <Plus size={17} />
                  Add data for this date
                </button>
              </div>
              {showDateEntryForm && selectedCell && (
                <CalendarDateEntryForm
                  dateKey={selectedCell.dateKey}
                  onDone={(message) => {
                    setCalendarNotice(message);
                    setShowDateEntryForm(false);
                  }}
                />
              )}
              {selectedEvents.length > 0 ? (
                <div className="calendar-detail-list">
                  {selectedEvents.map((event) => (
                    <div className={`calendar-detail-row ${event.tone}`} key={event.title}>
                      <div>
                        <strong>{event.title}</strong>
                        <span>{event.detail}</span>
                      </div>
                      <strong>{currency(event.amount)}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No money events scheduled." detail={selectedCell?.isToday ? "Review spending, cash flow, and upcoming payments today." : "No reminders are scheduled for this date."} />
              )}
            </div>
          </div>
        </Panel>
        <Panel title="This Week">
          <div className="calendar-detail-list">
            {upcomingWeekReminders.length > 0 ? (
              upcomingWeekReminders.map((reminder) => (
                <div className={`calendar-detail-row ${reminder.tone}`} key={reminder.title}>
                  <div>
                    <strong>{reminder.title}</strong>
                    <span>{reminder.day} · {reminder.detail}</span>
                  </div>
                  <strong>{currency(reminder.amount)}</strong>
                </div>
              ))
            ) : (
              <EmptyState title="No events this week." detail="Upcoming bills and income will appear here." />
            )}
          </div>
        </Panel>
      </div>
      <Panel title="Upcoming Reminders">
        <div className="list-stack">
          {reminders.length > 0 ? (
            reminders.map((reminder) => <ReminderRow key={reminder.title} reminder={reminder} />)
          ) : (
            <EmptyState title="No reminders yet." detail="Add a reminder to fill this list." />
          )}
        </div>
      </Panel>
    </div>
  );
}

function CalendarDateEntryForm({ dateKey, onDone }: { dateKey: string; onDone: (message: string) => void }) {
  const { loans } = useFinancialData();
  const { saveTransaction, updateFinancialData } = useFinancialDataActions();
  const [entryType, setEntryType] = useState("Reminder");
  const selectedDate = parseDateKey(dateKey);
  const dateLabel = formatCalendarDate(selectedDate.year, selectedDate.monthIndex, selectedDate.day);
  const createsTransaction = ["Income", "Expense", "Transfer", "Loan repayment"].includes(entryType);
  const isLoanPayment = entryType === "Loan repayment";
  const defaultCategory =
    entryType === "Income"
      ? "Salary"
      : entryType === "Loan repayment"
        ? "Loan payment"
        : entryType === "Transfer"
          ? "Transfer"
          : "Bill";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = formString(data, "title", entryType);
    const amount = formNumber(data, "amount");
    const category = formString(data, "category", defaultCategory);
    const linkedLoan = formString(data, "linkedLoan");
    const detail = formString(data, "detail", category);

    if (!title || (createsTransaction && amount <= 0)) return;

    const transactionType: Transaction["type"] = entryType === "Income" ? "Income" : entryType === "Transfer" ? "Transfer" : "Expense";
    const tone: Tone =
      entryType === "Income" || entryType === "Pay date"
        ? "success"
        : entryType === "Expense" || entryType === "Loan repayment"
          ? "danger"
          : "info";
    const source = isLoanPayment ? linkedLoan || title : title;
    const reminder: Reminder = {
      day: formatReminderDate(dateKey),
      title: isLoanPayment ? `${source} payment` : title,
      amount,
      detail,
      tone,
    };
    const transaction: Transaction | null = createsTransaction
      ? {
          date: formatInputDate(dateKey),
          type: transactionType,
          account: formString(data, "account", transactionType === "Income" ? "Checking" : "Credit card"),
          category,
          source,
          amount: transactionType === "Income" ? amount : -amount,
          method: formString(data, "method", transactionType === "Income" ? "ACH" : "Bank"),
          status: formString(data, "status", "Pending") as Transaction["status"],
        }
      : null;

    if (transaction) {
      const result = await saveTransaction(transaction);
      if (!result.ok) {
        onDone(`Could not add ${entryType.toLowerCase()} for ${dateLabel}: ${result.message}`);
        return;
      }
    }

    updateFinancialData((current) => {
      return {
        ...current,
        reminders: [reminder, ...current.reminders],
      };
    });
    onDone(`${entryType} added for ${dateLabel}.`);
  };

  return (
    <form className="feature-action-form calendar-date-entry-form" onSubmit={submit}>
      <div className="calendar-form-head">
        <strong>Add data</strong>
        <span>{dateLabel}</span>
      </div>
      <label>
        <span>Data type</span>
        <select value={entryType} onChange={(event) => setEntryType(event.target.value)}>
          <option>Reminder</option>
          <option>Income</option>
          <option>Expense</option>
          <option>Transfer</option>
          <option>Loan repayment</option>
          <option>Pay date</option>
        </select>
      </label>
      <label>
        <span>{isLoanPayment ? "Payment title" : "Title / source"}</span>
        <input name="title" placeholder={isLoanPayment ? "Auto loan EMI" : "Paycheck, rent, transfer..."} required />
      </label>
      {isLoanPayment && (
        <label>
          <span>Linked loan</span>
          <select name="linkedLoan" defaultValue={loans[0]?.name ?? ""}>
            <option value="">Choose loan</option>
            {loans.map((loan) => (
              <option key={loan.name}>{loan.name}</option>
            ))}
          </select>
        </label>
      )}
      <label>
        <span>Amount</span>
        <input name="amount" inputMode="decimal" placeholder={createsTransaction ? "250.00" : "Optional"} required={createsTransaction} />
      </label>
      <label>
        <span>Category</span>
        <input key={entryType} name="category" defaultValue={defaultCategory} />
      </label>
      {createsTransaction && (
        <>
          <label>
            <span>Account</span>
            <input name="account" defaultValue={entryType === "Income" ? "Checking" : "Credit card"} />
          </label>
          <label>
            <span>Method</span>
            <select name="method" defaultValue={entryType === "Income" ? "ACH" : "Bank"}>
              <option>ACH</option>
              <option>Bank</option>
              <option>Card</option>
              <option>Cash</option>
            </select>
          </label>
          <label>
            <span>Status</span>
            <select name="status" defaultValue="Pending">
              <option>Pending</option>
              <option>Cleared</option>
            </select>
          </label>
        </>
      )}
      <label>
        <span>Note</span>
        <input name="detail" placeholder="Optional detail for the calendar" />
      </label>
      <div className="calendar-form-actions">
        <button className="primary-button" type="submit">
          Save to date
          <ArrowRight size={17} />
        </button>
      </div>
    </form>
  );
}

function ReportsPage() {
  const filters = ["Month", "Year", "Category", "Type", "Status", "Account", "Person/entity"];

  return (
    <div className="page-stack">
      <PageToolbar title="Reports & Analytics" actions={["Export PDF", "Export Excel", "Export CSV"]} />
      <Panel title="Report Filters">
        <div className="filter-grid">
          {filters.map((filter) => (
            <label key={filter}>
              <span>{filter}</span>
              <input placeholder={`Filter by ${filter.toLowerCase()}`} />
            </label>
          ))}
        </div>
      </Panel>
      <div className="report-grid">
        {reportTypes.map((report) => (
          <article className="report-card" key={report}>
            <FileSpreadsheet size={22} />
            <h3>{report}</h3>
            <p>Filterable by month, year, category, type, status, account, and person/entity.</p>
            <div className="button-row">
              <button
                className="ghost-button"
                onClick={() => downloadTextFile(`${report.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf.txt`, `${report}\nGenerated by NetView Planner\n`)}
              >
                <Download size={16} />
                PDF
              </button>
              <button
                className="ghost-button"
                onClick={() => downloadTextFile(`${report.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`, `Report,Generated\n"${report}","July 2026"\n`, "text/csv;charset=utf-8")}
              >
                <Download size={16} />
                CSV
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function DocumentsPage() {
  const { documents } = useFinancialData();
  const [searchOpen, setSearchOpen] = useState(false);
  const [documentQuery, setDocumentQuery] = useState("");
  const visibleDocuments = documents.filter((document) =>
    [document.name, document.type, document.linked, document.expires].join(" ").toLowerCase().includes(documentQuery.toLowerCase()),
  );

  return (
    <div className="page-stack">
      <PageToolbar title="Documents Vault" actions={["Upload file", "Tag file", "Download"]} />
      <Panel title="Stored Documents" action={<button className="ghost-button" onClick={() => setSearchOpen((value) => !value)}><Search size={17} /> Search</button>}>
        {searchOpen && (
          <div className="filter-grid single">
            <label>
              <span>Search documents</span>
              <input value={documentQuery} onChange={(event) => setDocumentQuery(event.target.value)} placeholder="Policy, statement, tax..." />
            </label>
          </div>
        )}
        <DataTable
          columns={["File name", "Type", "Linked record", "Expiry reminder"]}
          rows={visibleDocuments.map((document) => [document.name, document.type, document.linked, document.expires])}
        />
      </Panel>
      <Panel title="Secure Storage">
        <div className="trust-row inside">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div className="trust-item" key={item.title}>
                <Icon size={22} />
                <span>{item.title}</span>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function AiAdvisorPage() {
  const { emergencyMonths, monthlyCashFlow, totalLiabilities } = useFinancialData();
  const hasFinancialData = monthlyCashFlow !== 0 || totalLiabilities !== 0 || emergencyMonths !== 0;
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(
    hasFinancialData
      ? "Based on your current cash flow, a $40,000 car would create pressure unless the monthly payment stays below $620 and the emergency fund remains above four months. This is a scenario explanation, not guaranteed investment or borrowing advice."
      : "Add income, expenses, assets, and loans first so NetView can compare scenarios against your own numbers.",
  );

  return (
    <div className="page-stack">
      <PageToolbar title="AI Finance Assistant" actions={["Ask question", "Review risks", "Run scenario"]} />
      <div className="ai-layout">
        <Panel title="Ask NetView AI">
          <div className="prompt-grid">
            {aiPrompts.map((prompt) => (
              <button className={question === prompt ? "prompt-chip active" : "prompt-chip"} key={prompt} onClick={() => setQuestion(prompt)}>
                <Sparkles size={16} />
                {prompt}
              </button>
            ))}
          </div>
          <label className="chat-input">
            <span>Question</span>
            <textarea rows={5} placeholder="Ask a question based on your financial data" value={question} onChange={(event) => setQuestion(event.target.value)} />
          </label>
          <button
            className="primary-button"
            onClick={() =>
              setResponse(
                question.trim()
                  ? `Scenario review for: "${question.trim()}". NetView would compare this against ${currency(monthlyCashFlow)} monthly cash flow, ${currency(totalLiabilities)} total debt, and ${emergencyMonths} months of emergency coverage before suggesting next steps.`
                  : "Choose a prompt or enter a question first.",
              )
            }
          >
            Generate scenario answer
            <ArrowRight size={17} />
          </button>
        </Panel>
        <Panel title="Sample Answer">
          <p className="insight info">{response}</p>
          <InsightList
            tone="warning"
            items={[
              "High APR credit card debt should likely be prioritized before new borrowing.",
              "Auto loan rate assumptions materially change total interest.",
              "Keep insurance and maintenance in the affordability check.",
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}

function SettingsPage() {
  const { dataReset, resetWorkspace, restoreDemoData } = useResetControls();
  const singleUserMode = isSingleUserMode();
  const [editing, setEditing] = useState("");
  const [notice, setNotice] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [categoryRows, setCategoryRows] = useState<string[][]>([
    ["Assets", "Cash & Bank", "Savings account", "Account name"],
    ["Loans / Debts", "Bank Loans", "Vehicle loan", "Lender name"],
    ["Future Plans", "Vehicle", "Down payment", "Plan name"],
    ["Survival Budget", "Housing", "Rent / Mortgage", "Budget name"],
  ]);
  const runReset = async () => {
    const confirmed = window.confirm("Delete all NetView workspace data from this account and browser, then start from scratch?");

    if (!confirmed) return;

    setEditing("");
    setNotice("");
    await resetWorkspace();
  };

  return (
    <div className="page-stack">
      <PageToolbar title="Profile & Settings" actions={["Save changes", "Export data", "Security review"]} />
      {notice && <p className={/could not|enter/i.test(notice) ? "form-message danger" : "form-message info"}>{notice}</p>}
      {editing && (
        <Panel title={`Edit ${editing}`} action={<button className="icon-button" onClick={() => setEditing("")} aria-label={`Close ${editing}`}><X size={16} /></button>}>
          <div className="action-workspace">
            <Field label={editing} placeholder={`Update ${editing.toLowerCase()}`} />
            <button
              className="primary-button"
              onClick={() => {
                setNotice(`${editing} updated in this prototype.`);
                setEditing("");
              }}
            >
              Save setting
              <ArrowRight size={17} />
            </button>
          </div>
        </Panel>
      )}
      <div className="settings-grid">
        {settingsGroups.map((group) => (
          <Panel title={group.title} key={group.title}>
            <div className="settings-list">
              {group.items.map((item) => (
                <div className="setting-row" key={item}>
                  <span>{item}</span>
                  <button className="icon-button" aria-label={`Edit ${item}`} onClick={() => setEditing(item)}>
                    <ChevronDown size={17} />
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
      <Panel title="Category Management">
        <div className="category-manager">
          <HierarchyList rows={categoryRows} />
          <form
            className="category-add-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!customCategory.trim()) return;
              setCategoryRows((rows) => [["Custom", "Group", "Subgroup", customCategory.trim()], ...rows]);
              setCustomCategory("");
              setNotice("Custom category added.");
            }}
          >
            <label>
              <span>Add custom item/category</span>
              <input value={customCategory} onChange={(event) => setCustomCategory(event.target.value)} placeholder="Example: Texas Land, Medical bill, Course fee" />
            </label>
            <button className="primary-button" type="submit">
              Add category
              <Plus size={17} />
            </button>
          </form>
          <p className="muted">Default categories are provided, and custom groups can be added without mixing module data.</p>
        </div>
      </Panel>
      <Panel title="Reset Workspace">
        <div className="reset-panel">
          <div>
            <h3>Start From Scratch</h3>
            <p>This removes workspace records from this account and browser, then returns you to onboarding.</p>
          </div>
          <div className="button-row">
            <button className="danger-button" onClick={runReset}>
              <Trash2 size={17} />
              Reset data
            </button>
            {dataReset && !singleUserMode && (
              <button className="ghost-button" onClick={restoreDemoData}>
                Load sample data
              </button>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}

function AdminPage() {
  return (
    <div className="page-stack">
      <PageToolbar title="Admin Panel" actions={["Review alerts", "Manage users", "View logs"]} />
      <div className="summary-grid">
        {adminCards.map((card) => (
          <SummaryCard key={card.label} label={card.label} value={card.value} detail={card.change} tone={card.change.includes("critical") ? "danger" : "info"} />
        ))}
      </div>
      <Panel title="Admin Areas">
        <div className="module-grid">
          {adminSections.map((section) => (
            <div className="module-tile" key={section}>
              <span>{section.slice(0, 2).toUpperCase()}</span>
              <strong>{section}</strong>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function PublicPage({
  title,
  kicker,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  kicker: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <section className="public-hero">
        <div>
          <p className="eyebrow">{kicker}</p>
          <h1>{title}</h1>
          <p>A complete personal finance planner for income, expenses, assets, loans, net worth, goals, and scenarios.</p>
        </div>
        {actionLabel && (
          <button className="primary-button large" onClick={onAction}>
            {actionLabel}
            <ArrowRight size={18} />
          </button>
        )}
      </section>
      {children}
    </>
  );
}

function AuthLayout({ title, kicker, children }: { title: string; kicker: string; children: ReactNode }) {
  return (
    <section className="auth-page">
      <div className="auth-copy">
        <p className="eyebrow">{kicker}</p>
        <h1>{title}</h1>
        <p>
          Start with guided setup for income, expenses, assets, loans, and goals so your dashboard is useful from day
          one.
        </p>
        <ProductPreview compact />
      </div>
      <div className="auth-card">{children}</div>
    </section>
  );
}

function ProductPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "product-preview compact" : "product-preview"} aria-label="NetView dashboard preview">
      <div className="preview-sidebar">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="preview-main">
        <div className="preview-header">
          <strong>Overview</strong>
          <Badge tone="success">Live dashboard</Badge>
        </div>
        <div className="preview-cards">
          <MetricBlock label="Net worth" value={currency(netWorth)} />
          <MetricBlock label="Cash flow" value={signedCurrency(monthlyCashFlow)} />
          <MetricBlock label="Debt" value={currency(totalLiabilities)} />
        </div>
        <LineChart series={netWorthSeries.slice(0, 7)} />
        {!compact && (
          <div className="preview-footer">
            <Breakdown title="Budget" rows={[{ label: "Housing", value: 2350, color: "blue" }, { label: "Food", value: 932, color: "emerald" }, { label: "Debt", value: 1400, color: "red" }]} total={4682} />
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  tone,
  onClick,
}: {
  label: string;
  value: string;
  detail: string;
  tone: Tone;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
      {onClick && <em>Open details</em>}
    </>
  );

  if (onClick) {
    return (
      <button className={`summary-card ${tone} clickable`} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <article className={`summary-card ${tone}`}>{content}</article>;
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function downloadTextFile(filename: string, text: string, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function PageToolbar({ title, actions }: { title: string; actions: string[] }) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const runAction = (action: string) => {
    if (/export|download/i.test(action)) {
      downloadTextFile(
        `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.csv`,
        `Action,Page,Created\n"${action}","${title}","July 2026"\n`,
        "text/csv;charset=utf-8",
      );
      setActiveAction(null);
      setNotice(`${action} downloaded.`);
      return;
    }

    setActiveAction((current) => (current === action ? null : action));
    setNotice("");
  };

  const saveAction = () => {
    setNotice(`${activeAction} saved in this prototype.`);
    setActiveAction(null);
  };

  return (
    <>
      <div className="page-toolbar">
        <div>
          <p className="eyebrow">Workspace</p>
          <h2>{title}</h2>
        </div>
        <div className="button-row">
          {actions.map((action, index) => (
            <button className={index === 0 ? "primary-button" : "ghost-button"} key={action} onClick={() => runAction(action)}>
              {index === 0 ? <Plus size={17} /> : /export|download/i.test(action) ? <Download size={17} /> : <Filter size={17} />}
              {action}
            </button>
          ))}
        </div>
      </div>

      {notice && <p className="form-message info">{notice}</p>}

      {activeAction && (
        <section className="toolbar-action-panel">
          <div className="panel-head">
            <h2>{activeAction}</h2>
            <button className="icon-button" onClick={() => setActiveAction(null)} aria-label={`Close ${activeAction}`}>
              <X size={16} />
            </button>
          </div>
          <FeatureActionForm
            action={activeAction}
            pageTitle={title}
            onCancel={() => setActiveAction(null)}
            onDone={(message) => {
              setNotice(message);
              setActiveAction(null);
            }}
            onFallbackSave={saveAction}
          />
        </section>
      )}
    </>
  );
}

function formString(data: FormData, key: string, fallback = "") {
  return String(data.get(key) ?? fallback).trim();
}

function formNumber(data: FormData, key: string, fallback = 0) {
  const value = Number(data.get(key));
  return Number.isFinite(value) ? value : fallback;
}

function formatInputDate(value: string) {
  if (!value) return "Jul 6, 2026";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(new Date(year, month - 1, day));
}

function formatReminderDate(value: string) {
  if (!value) return "Jul 06";
  const [year, month, day] = value.split("-").map(Number);
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(year, month - 1, day));
  return `${monthLabel} ${String(day).padStart(2, "0")}`;
}

function FeatureActionForm({
  action,
  pageTitle,
  onCancel,
  onDone,
  onFallbackSave,
}: {
  action: string;
  pageTitle: string;
  onCancel: () => void;
  onDone: (message: string) => void;
  onFallbackSave: () => void;
}) {
  if (["Add income", "Add expense", "Add cash event"].includes(action)) {
    return <TransactionActionForm action={action} onDone={onDone} />;
  }

  if (["Add asset", "Update value"].includes(action)) return <AssetActionForm action={action} onDone={onDone} />;
  if (["Add loan", "Add debt", "Update loan"].includes(action)) return <LoanActionForm action={action} onDone={onDone} />;
  if (action === "Set monthly budget") return <BudgetActionForm onDone={onDone} />;
  if (action === "Add goal") return <GoalActionForm onDone={onDone} />;
  if (action === "New scenario") return <ScenarioActionForm onDone={onDone} />;
  if (action === "Add investment") return <InvestmentActionForm onDone={onDone} />;
  if (action === "Add reminder") return <ReminderActionForm onDone={onDone} />;
  if (action === "Upload file") return <DocumentActionForm onDone={onDone} />;

  return (
    <div className="action-workspace">
      {/upload/i.test(action) ? (
        <label>
          <span>File</span>
          <input type="file" />
        </label>
      ) : (
        <Field label={`${pageTitle} detail`} placeholder={`Enter details for ${action.toLowerCase()}`} />
      )}
      <label>
        <span>Priority</span>
        <select>
          <option>Normal</option>
          <option>High</option>
          <option>Low</option>
        </select>
      </label>
      <div className="button-row">
        <button className="primary-button" onClick={onFallbackSave}>
          Save action
          <ArrowRight size={17} />
        </button>
        <button className="ghost-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function TransactionActionForm({ action, onDone }: { action: string; onDone: (message: string) => void }) {
  const { saveTransaction } = useFinancialDataActions();
  const fixedType = action === "Add income" ? "Income" : action === "Add expense" ? "Expense" : "";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const type = (fixedType || formString(data, "type", "Expense")) as Transaction["type"];
    const amount = formNumber(data, "amount");
    const source = formString(data, "source");

    if (!source || amount <= 0) return;

    const record: Transaction = {
      date: formatInputDate(formString(data, "date", "2026-07-06")),
      type,
      account: formString(data, "account", "Checking"),
      category: formString(data, "category", type === "Income" ? "Salary" : "Groceries"),
      source,
      amount: type === "Income" ? amount : -amount,
      method: formString(data, "method", type === "Income" ? "ACH" : "Card"),
      status: formString(data, "status", "Cleared") as Transaction["status"],
    };

    const result = await saveTransaction(record);
    if (!result.ok) {
      onDone(`Could not save ${type.toLowerCase()}: ${result.message}`);
      return;
    }

    onDone(`${type} added.`);
  };

  return (
    <form className="feature-action-form" onSubmit={submit}>
      <label>
        <span>Date</span>
        <input name="date" type="date" defaultValue="2026-07-06" />
      </label>
      {!fixedType && (
        <label>
          <span>Type</span>
          <select name="type" defaultValue="Expense">
            <option>Income</option>
            <option>Expense</option>
            <option>Transfer</option>
          </select>
        </label>
      )}
      <label>
        <span>{fixedType === "Income" ? "Source" : "Merchant / Source"}</span>
        <input name="source" placeholder={fixedType === "Income" ? "Employer or client" : "Merchant or source"} required />
      </label>
      <label>
        <span>Category</span>
        <input name="category" defaultValue={fixedType === "Income" ? "Salary" : "Groceries"} />
      </label>
      <label>
        <span>Amount</span>
        <input name="amount" inputMode="decimal" placeholder="125.00" required />
      </label>
      <label>
        <span>Account</span>
        <input name="account" defaultValue="Checking" />
      </label>
      <label>
        <span>Method</span>
        <select name="method" defaultValue={fixedType === "Income" ? "ACH" : "Card"}>
          <option>ACH</option>
          <option>Bank</option>
          <option>Card</option>
          <option>Cash</option>
        </select>
      </label>
      <label>
        <span>Status</span>
        <select name="status" defaultValue="Cleared">
          <option>Cleared</option>
          <option>Pending</option>
        </select>
      </label>
      <button className="primary-button" type="submit">
        Save {fixedType ? fixedType.toLowerCase() : "event"}
        <ArrowRight size={17} />
      </button>
    </form>
  );
}

function AssetActionForm({ action, onDone }: { action: string; onDone: (message: string) => void }) {
  const { assets } = useFinancialData();
  const { saveAsset, updateAsset } = useFinancialDataActions();
  const [selectedAssetName, setSelectedAssetName] = useState(assets[0]?.name ?? "");
  const isUpdate = action === "Update value";
  const selectedAsset = isUpdate ? assets.find((asset) => asset.name === selectedAssetName) : undefined;

  useEffect(() => {
    if (isUpdate && !selectedAssetName && assets[0]) setSelectedAssetName(assets[0].name);
  }, [assets, isUpdate, selectedAssetName]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const existing = isUpdate ? assets.find((asset) => asset.name === formString(data, "existingAsset", selectedAssetName)) : undefined;
    const name = formString(data, "name") || existing?.name || "";
    const currentValue = formNumber(data, "currentValue", existing?.currentValue ?? 0);

    if (!name || currentValue <= 0) return;

    const record: Asset = {
      id: existing?.id,
      name,
      category: formString(data, "category", existing?.category ?? "Bank balances"),
      purchaseValue: formNumber(data, "purchaseValue", existing?.purchaseValue ?? currentValue),
      currentValue,
      ownership: formNumber(data, "ownership", existing?.ownership ?? 100),
      linkedLoan: formString(data, "linkedLoan") || existing?.linkedLoan || undefined,
      updated: "July 2026",
    };

    const result = existing ? await updateAsset(record, existing) : await saveAsset(record);
    if (!result.ok) {
      onDone(`Could not save asset: ${result.message}`);
      return;
    }

    onDone(`${action === "Update value" ? "Asset value" : "Asset"} saved.`);
  };

  return (
    <form className="feature-action-form" onSubmit={submit}>
      {isUpdate && assets.length > 0 && (
        <label>
          <span>Existing asset</span>
          <select name="existingAsset" value={selectedAssetName} onChange={(event) => setSelectedAssetName(event.target.value)}>
            {assets.map((asset) => <option key={asset.id ?? asset.name}>{asset.name}</option>)}
          </select>
        </label>
      )}
      <label>
        <span>Asset name</span>
        <input key={`asset-name-${selectedAsset?.id ?? selectedAsset?.name ?? "new"}`} name="name" defaultValue={selectedAsset?.name ?? ""} placeholder="Emergency Fund" required />
      </label>
      <label>
        <span>Category</span>
        <select key={`asset-category-${selectedAsset?.id ?? selectedAsset?.name ?? "new"}`} name="category" defaultValue={selectedAsset?.category ?? "Bank balances"}>
          {assetCategories.map((category) => <option key={category}>{category}</option>)}
        </select>
      </label>
      <label>
        <span>Purchase value</span>
        <input key={`asset-purchase-${selectedAsset?.id ?? selectedAsset?.name ?? "new"}`} name="purchaseValue" inputMode="decimal" defaultValue={selectedAsset?.purchaseValue ?? ""} placeholder="10000" />
      </label>
      <label>
        <span>Current value</span>
        <input key={`asset-current-${selectedAsset?.id ?? selectedAsset?.name ?? "new"}`} name="currentValue" inputMode="decimal" defaultValue={selectedAsset?.currentValue ?? ""} placeholder="12000" required />
      </label>
      <label>
        <span>Ownership %</span>
        <input key={`asset-ownership-${selectedAsset?.id ?? selectedAsset?.name ?? "new"}`} name="ownership" inputMode="decimal" defaultValue={selectedAsset?.ownership ?? 100} />
      </label>
      <label>
        <span>Linked loan</span>
        <input key={`asset-loan-${selectedAsset?.id ?? selectedAsset?.name ?? "new"}`} name="linkedLoan" defaultValue={selectedAsset?.linkedLoan ?? ""} placeholder="Optional loan name" />
      </label>
      <button className="primary-button" type="submit">
        {isUpdate ? "Update asset" : "Save asset"}
        <ArrowRight size={17} />
      </button>
    </form>
  );
}

function LoanActionForm({ action, onDone }: { action: string; onDone: (message: string) => void }) {
  const { loans } = useFinancialData();
  const { saveLoan, updateLoan } = useFinancialDataActions();
  const [selectedLoanName, setSelectedLoanName] = useState(loans[0]?.name ?? "");
  const isUpdate = action === "Update loan";
  const selectedLoan = isUpdate ? loans.find((loan) => loan.name === selectedLoanName) : undefined;

  useEffect(() => {
    if (isUpdate && !selectedLoanName && loans[0]) setSelectedLoanName(loans[0].name);
  }, [isUpdate, loans, selectedLoanName]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const existing = isUpdate ? loans.find((loan) => loan.name === formString(data, "existingLoan", selectedLoanName)) : undefined;
    const name = formString(data, "name") || existing?.name || "";
    const balance = formNumber(data, "currentBalance", existing?.currentBalance ?? 0);

    if (!name || balance <= 0) return;

    const rate = formNumber(data, "rate", existing?.rate ?? 0);
    const monthlyPayment = formNumber(data, "monthlyPayment", existing?.monthlyPayment ?? 0);
    const record: Loan = {
      id: existing?.id,
      name,
      type: formString(data, "type", existing?.type ?? "Personal loan"),
      originalAmount: formNumber(data, "originalAmount", existing?.originalAmount ?? balance),
      currentBalance: balance,
      rate,
      monthlyPayment,
      start: existing?.start ?? "Jul 2026",
      end: formString(data, "end", existing?.end ?? "Jul 2031"),
      remainingMonths: formNumber(data, "remainingMonths", existing?.remainingMonths ?? 60),
      interestLeft: Math.round(balance * (rate / 100) * 1.5),
      linkedAsset: formString(data, "linkedAsset") || existing?.linkedAsset || undefined,
    };

    const result = existing ? await updateLoan(record, existing) : await saveLoan(record);
    if (!result.ok) {
      onDone(`Could not save loan: ${result.message}`);
      return;
    }

    onDone(action === "Update loan" ? "Loan updated." : `${action === "Add debt" ? "Debt" : "Loan"} added.`);
  };

  return (
    <form className="feature-action-form" onSubmit={submit}>
      {isUpdate && loans.length > 0 && (
        <label>
          <span>Existing loan</span>
          <select name="existingLoan" value={selectedLoanName} onChange={(event) => setSelectedLoanName(event.target.value)}>
            {loans.map((loan) => <option key={loan.id ?? loan.name}>{loan.name}</option>)}
          </select>
        </label>
      )}
      <label>
        <span>Loan name</span>
        <input key={`loan-name-${selectedLoan?.id ?? selectedLoan?.name ?? "new"}`} name="name" defaultValue={selectedLoan?.name ?? ""} placeholder="Personal loan" required />
      </label>
      <label>
        <span>Type</span>
        <select key={`loan-type-${selectedLoan?.id ?? selectedLoan?.name ?? "new"}`} name="type" defaultValue={selectedLoan?.type ?? "Personal loan"}>
          {loanTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
      </label>
      <label>
        <span>Original amount</span>
        <input key={`loan-original-${selectedLoan?.id ?? selectedLoan?.name ?? "new"}`} name="originalAmount" inputMode="decimal" defaultValue={selectedLoan?.originalAmount ?? ""} placeholder="10000" />
      </label>
      <label>
        <span>Current balance</span>
        <input key={`loan-balance-${selectedLoan?.id ?? selectedLoan?.name ?? "new"}`} name="currentBalance" inputMode="decimal" defaultValue={selectedLoan?.currentBalance ?? ""} placeholder="8500" required />
      </label>
      <label>
        <span>Interest rate %</span>
        <input key={`loan-rate-${selectedLoan?.id ?? selectedLoan?.name ?? "new"}`} name="rate" inputMode="decimal" defaultValue={selectedLoan?.rate ?? ""} placeholder="7.5" />
      </label>
      <label>
        <span>Monthly payment</span>
        <input key={`loan-payment-${selectedLoan?.id ?? selectedLoan?.name ?? "new"}`} name="monthlyPayment" inputMode="decimal" defaultValue={selectedLoan?.monthlyPayment ?? ""} placeholder="250" />
      </label>
      <label>
        <span>Remaining months</span>
        <input key={`loan-months-${selectedLoan?.id ?? selectedLoan?.name ?? "new"}`} name="remainingMonths" inputMode="numeric" defaultValue={selectedLoan?.remainingMonths ?? 60} />
      </label>
      <label>
        <span>Payoff date</span>
        <input key={`loan-end-${selectedLoan?.id ?? selectedLoan?.name ?? "new"}`} name="end" defaultValue={selectedLoan?.end ?? "Jul 2031"} />
      </label>
      <label>
        <span>Linked asset</span>
        <input key={`loan-asset-${selectedLoan?.id ?? selectedLoan?.name ?? "new"}`} name="linkedAsset" defaultValue={selectedLoan?.linkedAsset ?? ""} placeholder="Optional asset name" />
      </label>
      <button className="primary-button" type="submit">
        {isUpdate ? "Update loan" : "Save loan"}
        <ArrowRight size={17} />
      </button>
    </form>
  );
}

function BudgetActionForm({ onDone }: { onDone: (message: string) => void }) {
  const { updateFinancialData } = useFinancialDataActions();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const category = formString(data, "category");
    const budget = formNumber(data, "budget");

    if (!category || budget <= 0) return;

    const record: BudgetLine = {
      category,
      budget,
      spent: formNumber(data, "spent"),
      kind: formString(data, "kind", "flexible") as BudgetLine["kind"],
    };

    updateFinancialData((current) => ({ ...current, budgetLines: [record, ...current.budgetLines] }));
    onDone("Budget category saved.");
  };

  return (
    <form className="feature-action-form" onSubmit={submit}>
      <label>
        <span>Category</span>
        <input name="category" placeholder="Groceries" required />
      </label>
      <label>
        <span>Monthly budget</span>
        <input name="budget" inputMode="decimal" placeholder="650" required />
      </label>
      <label>
        <span>Spent so far</span>
        <input name="spent" inputMode="decimal" defaultValue="0" />
      </label>
      <label>
        <span>Type</span>
        <select name="kind" defaultValue="flexible">
          <option value="fixed">Fixed</option>
          <option value="flexible">Flexible</option>
        </select>
      </label>
      <button className="primary-button" type="submit">
        Save budget
        <ArrowRight size={17} />
      </button>
    </form>
  );
}

function GoalActionForm({ onDone }: { onDone: (message: string) => void }) {
  const { updateFinancialData } = useFinancialDataActions();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = formString(data, "name");
    const target = formNumber(data, "target");

    if (!name || target <= 0) return;

    const record: GoalLine = {
      name,
      target,
      current: formNumber(data, "current"),
      monthly: Math.max(1, formNumber(data, "monthly", 100)),
      date: formString(data, "date", "Dec 2026"),
      priority: formString(data, "priority", "Medium") as GoalLine["priority"],
    };

    updateFinancialData((current) => ({ ...current, goals: [record, ...current.goals] }));
    onDone("Goal added.");
  };

  return (
    <form className="feature-action-form" onSubmit={submit}>
      <label>
        <span>Goal name</span>
        <input name="name" placeholder="Emergency fund" required />
      </label>
      <label>
        <span>Target amount</span>
        <input name="target" inputMode="decimal" placeholder="15000" required />
      </label>
      <label>
        <span>Current amount</span>
        <input name="current" inputMode="decimal" defaultValue="0" />
      </label>
      <label>
        <span>Monthly contribution</span>
        <input name="monthly" inputMode="decimal" placeholder="500" />
      </label>
      <label>
        <span>Target date</span>
        <input name="date" defaultValue="Dec 2026" />
      </label>
      <label>
        <span>Priority</span>
        <select name="priority" defaultValue="Medium">
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </label>
      <button className="primary-button" type="submit">
        Save goal
        <ArrowRight size={17} />
      </button>
    </form>
  );
}

function ScenarioActionForm({ onDone }: { onDone: (message: string) => void }) {
  const { updateFinancialData } = useFinancialDataActions();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const scenario = formString(data, "scenario");

    if (!scenario) return;

    const record: FinancialData["forecastScenarios"][number] = {
      scenario,
      netWorth: formNumber(data, "netWorth"),
      debtLeft: formNumber(data, "debtLeft"),
      cashFlow: formString(data, "cashFlow", "Medium"),
      risk: formString(data, "risk", "Medium"),
    };

    updateFinancialData((current) => ({ ...current, forecastScenarios: [record, ...current.forecastScenarios] }));
    onDone("Forecast scenario added.");
  };

  return (
    <form className="feature-action-form" onSubmit={submit}>
      <label>
        <span>Scenario name</span>
        <input name="scenario" placeholder="Buy house" required />
      </label>
      <label>
        <span>Net worth in 5 years</span>
        <input name="netWorth" inputMode="decimal" placeholder="225000" />
      </label>
      <label>
        <span>Debt left</span>
        <input name="debtLeft" inputMode="decimal" placeholder="12000" />
      </label>
      <label>
        <span>Cash flow</span>
        <select name="cashFlow" defaultValue="Medium">
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
          <option>Tight</option>
        </select>
      </label>
      <label>
        <span>Risk</span>
        <select name="risk" defaultValue="Medium">
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </label>
      <button className="primary-button" type="submit">
        Save scenario
        <ArrowRight size={17} />
      </button>
    </form>
  );
}

function InvestmentActionForm({ onDone }: { onDone: (message: string) => void }) {
  const { updateFinancialData } = useFinancialDataActions();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = formString(data, "name");
    const currentValue = formNumber(data, "currentValue");

    if (!name || currentValue <= 0) return;

    const record: FinancialData["investments"][number] = {
      name,
      symbol: formString(data, "symbol", "ETF"),
      account: formString(data, "account", "Brokerage"),
      quantity: formNumber(data, "quantity"),
      currentValue,
      gain: formNumber(data, "gain"),
      dividends: formNumber(data, "dividends"),
      risk: formString(data, "risk", "Medium"),
    };

    updateFinancialData((current) => ({ ...current, investments: [record, ...current.investments] }));
    onDone("Investment added.");
  };

  return (
    <form className="feature-action-form" onSubmit={submit}>
      <label>
        <span>Investment name</span>
        <input name="name" placeholder="Total Market ETF" required />
      </label>
      <label>
        <span>Ticker</span>
        <input name="symbol" placeholder="VTI" />
      </label>
      <label>
        <span>Account</span>
        <input name="account" defaultValue="Brokerage" />
      </label>
      <label>
        <span>Quantity</span>
        <input name="quantity" inputMode="decimal" placeholder="10" />
      </label>
      <label>
        <span>Current value</span>
        <input name="currentValue" inputMode="decimal" placeholder="2500" required />
      </label>
      <label>
        <span>Gain %</span>
        <input name="gain" inputMode="decimal" defaultValue="0" />
      </label>
      <label>
        <span>Dividends</span>
        <input name="dividends" inputMode="decimal" defaultValue="0" />
      </label>
      <label>
        <span>Risk</span>
        <select name="risk" defaultValue="Medium">
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </label>
      <button className="primary-button" type="submit">
        Save investment
        <ArrowRight size={17} />
      </button>
    </form>
  );
}

function ReminderActionForm({ onDone }: { onDone: (message: string) => void }) {
  const { updateFinancialData } = useFinancialDataActions();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = formString(data, "title");

    if (!title) return;

    const record: Reminder = {
      day: formatReminderDate(formString(data, "date", "2026-07-06")),
      title,
      amount: formNumber(data, "amount"),
      detail: formString(data, "detail", "Reminder"),
      tone: formString(data, "tone", "info") as Tone,
    };

    updateFinancialData((current) => ({ ...current, reminders: [record, ...current.reminders] }));
    onDone("Reminder added.");
  };

  return (
    <form className="feature-action-form" onSubmit={submit}>
      <label>
        <span>Date</span>
        <input name="date" type="date" defaultValue="2026-07-06" />
      </label>
      <label>
        <span>Title</span>
        <input name="title" placeholder="Credit card payment" required />
      </label>
      <label>
        <span>Amount</span>
        <input name="amount" inputMode="decimal" placeholder="420" />
      </label>
      <label>
        <span>Detail</span>
        <input name="detail" placeholder="Avoid late fee" />
      </label>
      <label>
        <span>Type</span>
        <select name="tone" defaultValue="info">
          <option value="danger">Due</option>
          <option value="warning">Warning</option>
          <option value="success">Income</option>
          <option value="info">Info</option>
        </select>
      </label>
      <button className="primary-button" type="submit">
        Save reminder
        <ArrowRight size={17} />
      </button>
    </form>
  );
}

function DocumentActionForm({ onDone }: { onDone: (message: string) => void }) {
  const { updateFinancialData } = useFinancialDataActions();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = formString(data, "name");

    if (!name) return;

    const record: FinancialData["documents"][number] = {
      name,
      type: formString(data, "type", "Statement"),
      linked: formString(data, "linked", "General"),
      expires: formString(data, "expires", "No expiry"),
    };

    updateFinancialData((current) => ({ ...current, documents: [record, ...current.documents] }));
    onDone("Document saved.");
  };

  return (
    <form className="feature-action-form" onSubmit={submit}>
      <label>
        <span>File</span>
        <input type="file" />
      </label>
      <label>
        <span>Document name</span>
        <input name="name" placeholder="July statement" required />
      </label>
      <label>
        <span>Type</span>
        <input name="type" placeholder="Bank statement" />
      </label>
      <label>
        <span>Linked record</span>
        <input name="linked" placeholder="Checking" />
      </label>
      <label>
        <span>Expiry reminder</span>
        <input name="expires" defaultValue="No expiry" />
      </label>
      <button className="primary-button" type="submit">
        Save document
        <ArrowRight size={17} />
      </button>
    </form>
  );
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <label>
      <span>{label}</span>
      <input type={type} placeholder={placeholder} />
    </label>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-block">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function CheckItem({ label, tone }: { label: string; tone: Tone }) {
  return (
    <div className={`check-item ${tone}`}>
      <Check size={18} />
      <span>{label}</span>
    </div>
  );
}

function InfoLine({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return (
    <div className="info-line">
      <Icon size={22} />
      <div>
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
    </div>
  );
}

function Segmented({ labels }: { labels: string[] }) {
  const [active, setActive] = useState(labels[0] ?? "");

  return (
    <div className="segmented">
      {labels.map((label) => (
        <button key={label} className={active === label ? "active" : ""} onClick={() => setActive(label)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function CashFlowChart() {
  const { cashFlowSeries } = useFinancialData();

  if (cashFlowSeries.length === 0) {
    return <EmptyState title="No cash flow history yet." detail="Add income and expenses to build this chart." />;
  }

  const max = Math.max(...cashFlowSeries.map((item) => item.income), 1);
  return (
    <div className="bar-chart" aria-label="Cash flow chart">
      {cashFlowSeries.map((item) => (
        <div className="bar-group" key={item.label}>
          <div className="bars">
            <span className="bar income" style={{ height: `${(item.income / max) * 100}%` }} title={`Income ${currency(item.income)}`} />
            <span className="bar expenses" style={{ height: `${(item.expenses / max) * 100}%` }} title={`Expenses ${currency(item.expenses)}`} />
            <span className="bar savings" style={{ height: `${(item.savings / max) * 100}%` }} title={`Savings ${currency(item.savings)}`} />
            <span className="bar debt" style={{ height: `${(item.debt / max) * 100}%` }} title={`Debt ${currency(item.debt)}`} />
          </div>
          <small>{item.label}</small>
        </div>
      ))}
    </div>
  );
}

function LineChart({ series, tall = false }: { series: { label: string; value: number }[]; tall?: boolean }) {
  if (series.length === 0) {
    return <EmptyState title="No trend data yet." detail="Add records to build a timeline." />;
  }

  const min = Math.min(...series.map((item) => item.value));
  const max = Math.max(...series.map((item) => item.value));
  const range = max - min || 1;
  const points = series
    .map((item, index) => {
      const x = (index / Math.max(series.length - 1, 1)) * 100;
      const y = 88 - ((item.value - min) / range) * 72;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className={tall ? "line-chart tall" : "line-chart"}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Line chart">
        <defs>
          <linearGradient id={`line-fill-${tall ? "tall" : "base"}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={`0,92 ${points} 100,92`} fill={`url(#line-fill-${tall ? "tall" : "base"})`} stroke="none" />
        <polyline points={points} fill="none" stroke="#0f766e" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="line-labels">
        {series.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

function Breakdown({
  title,
  rows,
  total,
}: {
  title: string;
  rows: { label: string; value: number; color: string }[];
  total: number;
}) {
  if (rows.length === 0 || total <= 0) {
    return <EmptyState title={`No ${title.toLowerCase()} yet.`} detail="Add records to build this breakdown." />;
  }

  return (
    <div className="breakdown">
      <div className="breakdown-head">
        <strong>{title}</strong>
        <span>{currency(total)}</span>
      </div>
      {rows.map((row) => (
        <div className="breakdown-row" key={row.label}>
          <div className="breakdown-label">
            <span className={`dot ${row.color}`} />
            <span>{row.label}</span>
          </div>
          <div className="track">
            <span className={`fill ${row.color}`} style={{ width: `${Math.max(5, (row.value / total) * 100)}%` }} />
          </div>
          <strong>{currency(row.value)}</strong>
        </div>
      ))}
    </div>
  );
}

function ReminderRow({ reminder }: { reminder: { day: string; title: string; amount: number; detail: string; tone: Tone } }) {
  const [state, setState] = useState<"open" | "paid" | "snoozed">("open");
  const effectiveTone = state === "paid" ? "success" : state === "snoozed" ? "warning" : reminder.tone;

  return (
    <div className="reminder-row">
      <span className={`date-chip ${effectiveTone}`}>{state === "paid" ? "Paid" : state === "snoozed" ? "Later" : reminder.day}</span>
      <div>
        <strong>{reminder.title}</strong>
        <small>{state === "paid" ? "Marked as paid" : state === "snoozed" ? "Snoozed for later" : reminder.detail}</small>
      </div>
      <strong>{currency(reminder.amount)}</strong>
      <div className="row-actions">
        <button className="icon-button" aria-label={`Mark ${reminder.title} as paid`} onClick={() => setState("paid")}>
          <Check size={16} />
        </button>
        <button className="icon-button" aria-label={`Snooze ${reminder.title}`} onClick={() => setState("snoozed")}>
          <Bell size={16} />
        </button>
      </div>
    </div>
  );
}

function AlertRow({ title, detail, tone }: { title: string; detail: string; tone: Tone }) {
  return (
    <div className={`alert-row ${tone}`}>
      <AlertTriangle size={18} />
      <div>
        <strong>{title}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  if (rows.length === 0) {
    return <EmptyState title="No records yet." detail="Add data to populate this table." />;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HierarchyList({ rows }: { rows: string[][] }) {
  if (rows.length === 0) {
    return <EmptyState title="No hierarchy yet." detail="Add records to build this module tree." />;
  }

  return (
    <div className="hierarchy-list">
      {rows.map((row, index) => (
        <div className="hierarchy-row" key={`${row.join("-")}-${index}`}>
          {row.map((item, itemIndex) => (
            <span key={`${item}-${itemIndex}`} className={`hierarchy-level level-${Math.min(itemIndex + 1, 4)}`}>
              {item}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}

function CategoryPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <Panel title={title}>
      <div className="chip-row">
        {items.map((item) => (
          <span className="chip" key={item}>
            {item}
          </span>
        ))}
      </div>
    </Panel>
  );
}

function InsightList({ items, tone }: { items: string[]; tone: Tone }) {
  return (
    <div className="insight-list">
      {items.map((item) => (
        <p className={`insight ${tone}`} key={item}>
          {item}
        </p>
      ))}
    </div>
  );
}

function GoalCard({ goal }: { goal: GoalLine }) {
  const goalProgress = progress(goal.current, goal.target);
  return (
    <article className="goal-card">
      <div className="goal-top">
        <div>
          <h3>{goal.name}</h3>
          <span className="muted">{goal.priority} priority</span>
        </div>
        <Badge tone={goalProgress >= 70 ? "success" : goalProgress >= 40 ? "warning" : "info"}>{goalProgress}%</Badge>
      </div>
      <div className="progress-ring" style={{ "--progress": `${goalProgress}%` } as CSSProperties}>
        <span>{goalProgress}%</span>
      </div>
      <div className="goal-stats">
        <MetricBlock label="Saved" value={currency(goal.current)} />
        <MetricBlock label="Target" value={currency(goal.target)} />
        <MetricBlock label="Monthly required" value={currency(goal.monthly)} />
        <MetricBlock label="Completion" value={`${monthsToGoal(goal)} months`} />
      </div>
      <p className="insight info">
        At {currency(goal.monthly)}/month, expected completion is {goal.date}.
      </p>
    </article>
  );
}
