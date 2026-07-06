import {
  Banknote,
  BarChart3,
  Bell,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Car,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  FileText,
  Flag,
  Gauge,
  Goal,
  Home,
  Landmark,
  LineChart,
  LockKeyhole,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Upload,
  WalletCards,
} from "lucide-react";

export type Tone = "success" | "warning" | "danger" | "neutral" | "info";

export type NavItem = {
  id: string;
  label: string;
  group: "Public" | "Auth" | "App" | "Admin";
  icon: typeof Home;
};

export type Asset = {
  name: string;
  category: string;
  purchaseValue: number;
  currentValue: number;
  ownership: number;
  linkedLoan?: string;
  updated: string;
};

export type Loan = {
  name: string;
  type: string;
  originalAmount: number;
  currentBalance: number;
  rate: number;
  monthlyPayment: number;
  start: string;
  end: string;
  remainingMonths: number;
  interestLeft: number;
  linkedAsset?: string;
};

export type Transaction = {
  date: string;
  type: "Income" | "Expense" | "Transfer";
  account: string;
  category: string;
  source: string;
  amount: number;
  method: string;
  status: "Cleared" | "Pending";
};

export type BudgetLine = {
  category: string;
  budget: number;
  spent: number;
  kind: "fixed" | "flexible";
};

export type GoalLine = {
  name: string;
  target: number;
  current: number;
  monthly: number;
  date: string;
  priority: "High" | "Medium" | "Low";
};

export type Reminder = {
  day: string;
  title: string;
  amount: number;
  detail: string;
  tone: Tone;
};

export type FeatureBlock = {
  title: string;
  what: string;
  why: string;
  example: string;
  icon: typeof Home;
};

export const navItems: NavItem[] = [
  { id: "home", label: "Home", group: "Public", icon: Home },
  { id: "features", label: "Features", group: "Public", icon: ClipboardList },
  { id: "about", label: "About", group: "Public", icon: Building2 },
  { id: "security", label: "Security", group: "Public", icon: ShieldCheck },
  { id: "blog", label: "Education", group: "Public", icon: FileText },
  { id: "contact", label: "Contact", group: "Public", icon: Bell },
  { id: "login", label: "Login", group: "Auth", icon: LockKeyhole },
  { id: "signup", label: "Signup", group: "Auth", icon: Upload },
  { id: "onboarding", label: "Onboarding", group: "Auth", icon: Flag },
  { id: "dashboard", label: "Dashboard", group: "App", icon: Gauge },
  { id: "calendar", label: "Calendar", group: "App", icon: CalendarDays },
  { id: "transactions", label: "Transactions", group: "App", icon: ReceiptText },
  { id: "income", label: "Income", group: "App", icon: Banknote },
  { id: "expenses", label: "Expenses", group: "App", icon: ReceiptText },
  { id: "budget", label: "Budget", group: "App", icon: WalletCards },
  { id: "goals", label: "Goals", group: "App", icon: Goal },
  { id: "forecast", label: "Forecast", group: "App", icon: TrendingUp },
  { id: "assets", label: "Assets", group: "App", icon: Landmark },
  { id: "loans", label: "Loans", group: "App", icon: CreditCard },
  { id: "net-worth", label: "Net Worth", group: "App", icon: LineChart },
  { id: "investments", label: "Investments", group: "App", icon: BarChart3 },
  { id: "reports", label: "Reports", group: "App", icon: FileText },
  { id: "documents", label: "Documents", group: "App", icon: ShieldCheck },
  { id: "ai-advisor", label: "AI Advisor", group: "App", icon: Bot },
  { id: "settings", label: "Settings", group: "App", icon: LockKeyhole },
  { id: "admin", label: "Admin", group: "Admin", icon: BriefcaseBusiness },
];

export const assets: Asset[] = [
  {
    name: "Primary Home",
    category: "Real estate",
    purchaseValue: 400000,
    currentValue: 430000,
    ownership: 100,
    linkedLoan: "First Federal Mortgage",
    updated: "July 2026",
  },
  {
    name: "Retirement Portfolio",
    category: "Retirement account",
    purchaseValue: 46500,
    currentValue: 53800,
    ownership: 100,
    updated: "July 2026",
  },
  {
    name: "Taxable Brokerage",
    category: "Stocks / ETFs",
    purchaseValue: 28200,
    currentValue: 31400,
    ownership: 100,
    updated: "July 2026",
  },
  {
    name: "Emergency Fund",
    category: "Bank balances",
    purchaseValue: 18000,
    currentValue: 18000,
    ownership: 100,
    updated: "July 2026",
  },
  {
    name: "Tesla Model Y",
    category: "Vehicle",
    purchaseValue: 45000,
    currentValue: 38000,
    ownership: 100,
    linkedLoan: "Chase Auto Loan",
    updated: "June 2026",
  },
  {
    name: "Crypto Sleeve",
    category: "Crypto",
    purchaseValue: 7800,
    currentValue: 9100,
    ownership: 100,
    updated: "July 2026",
  },
];

export const loans: Loan[] = [
  {
    name: "First Federal Mortgage",
    type: "Mortgage",
    originalAmount: 340000,
    currentBalance: 310000,
    rate: 5.25,
    monthlyPayment: 2350,
    start: "Jan 2024",
    end: "Dec 2053",
    remainingMonths: 330,
    interestLeft: 258900,
    linkedAsset: "Primary Home",
  },
  {
    name: "Chase Auto Loan",
    type: "Auto loan",
    originalAmount: 35000,
    currentBalance: 27200,
    rate: 7.2,
    monthlyPayment: 650,
    start: "Jan 2025",
    end: "Dec 2030",
    remainingMonths: 53,
    interestLeft: 5800,
    linkedAsset: "Tesla Model Y",
  },
  {
    name: "Student Loan",
    type: "Student loan",
    originalAmount: 24000,
    currentBalance: 18800,
    rate: 4.9,
    monthlyPayment: 315,
    start: "Aug 2022",
    end: "Jul 2032",
    remainingMonths: 72,
    interestLeft: 3200,
  },
  {
    name: "Rewards Credit Card",
    type: "Credit card",
    originalAmount: 6500,
    currentBalance: 4550,
    rate: 21.9,
    monthlyPayment: 420,
    start: "Apr 2026",
    end: "Feb 2027",
    remainingMonths: 8,
    interestLeft: 690,
  },
];

export const transactions: Transaction[] = [
  {
    date: "Jul 1, 2026",
    type: "Income",
    account: "Checking",
    category: "Salary",
    source: "Northstar Analytics",
    amount: 7200,
    method: "ACH",
    status: "Cleared",
  },
  {
    date: "Jul 1, 2026",
    type: "Expense",
    account: "Checking",
    category: "Housing",
    source: "Mortgage servicer",
    amount: -2350,
    method: "Bank",
    status: "Cleared",
  },
  {
    date: "Jul 2, 2026",
    type: "Expense",
    account: "Credit card",
    category: "Groceries",
    source: "Fresh Market",
    amount: -186.42,
    method: "Card",
    status: "Cleared",
  },
  {
    date: "Jul 3, 2026",
    type: "Expense",
    account: "Credit card",
    category: "Dining",
    source: "Oak Table",
    amount: -94.8,
    method: "Card",
    status: "Pending",
  },
  {
    date: "Jul 5, 2026",
    type: "Income",
    account: "Checking",
    category: "Freelance",
    source: "Studio retainer",
    amount: 1850,
    method: "ACH",
    status: "Cleared",
  },
  {
    date: "Jul 5, 2026",
    type: "Transfer",
    account: "Savings",
    category: "Goal contribution",
    source: "Emergency fund",
    amount: -800,
    method: "Bank",
    status: "Cleared",
  },
];

export const budgetLines: BudgetLine[] = [
  { category: "Rent / mortgage", budget: 2350, spent: 2350, kind: "fixed" },
  { category: "Groceries", budget: 650, spent: 522, kind: "flexible" },
  { category: "Utilities", budget: 340, spent: 288, kind: "fixed" },
  { category: "Transportation", budget: 540, spent: 498, kind: "fixed" },
  { category: "Insurance", budget: 420, spent: 420, kind: "fixed" },
  { category: "Subscriptions", budget: 180, spent: 186, kind: "fixed" },
  { category: "Dining", budget: 320, spent: 410, kind: "flexible" },
  { category: "Travel", budget: 450, spent: 120, kind: "flexible" },
  { category: "Healthcare", budget: 260, spent: 95, kind: "flexible" },
];

export const goals: GoalLine[] = [
  {
    name: "Emergency Fund",
    target: 15000,
    current: 7500,
    monthly: 800,
    date: "May 2027",
    priority: "High",
  },
  {
    name: "Pay Off Credit Card",
    target: 4550,
    current: 1800,
    monthly: 650,
    date: "Nov 2026",
    priority: "High",
  },
  {
    name: "House Upgrade Fund",
    target: 32000,
    current: 9800,
    monthly: 900,
    date: "Dec 2028",
    priority: "Medium",
  },
  {
    name: "Vacation",
    target: 5200,
    current: 2250,
    monthly: 350,
    date: "Mar 2027",
    priority: "Low",
  },
];

export const reminders: Reminder[] = [
  {
    day: "Jul 07",
    title: "Credit card payment",
    amount: 420,
    detail: "Avoid 21.9% APR interest",
    tone: "danger",
  },
  {
    day: "Jul 10",
    title: "Auto loan EMI",
    amount: 650,
    detail: "Chase Auto Loan",
    tone: "warning",
  },
  {
    day: "Jul 15",
    title: "Salary expected",
    amount: 7200,
    detail: "Northstar Analytics",
    tone: "success",
  },
  {
    day: "Jul 18",
    title: "Insurance renewal",
    amount: 220,
    detail: "Auto policy",
    tone: "info",
  },
];

export const cashFlowSeries = [
  { label: "Jan", income: 9200, expenses: 6410, savings: 1390, debt: 1400 },
  { label: "Feb", income: 9200, expenses: 6760, savings: 1040, debt: 1400 },
  { label: "Mar", income: 9850, expenses: 7110, savings: 1340, debt: 1400 },
  { label: "Apr", income: 9850, expenses: 6680, savings: 1770, debt: 1400 },
  { label: "May", income: 9850, expenses: 7240, savings: 1210, debt: 1400 },
  { label: "Jun", income: 9850, expenses: 6820, savings: 1630, debt: 1400 },
  { label: "Jul", income: 9850, expenses: 6780, savings: 1670, debt: 1400 },
];

export const netWorthSeries = [
  { label: "Jan", value: 177800 },
  { label: "Feb", value: 181200 },
  { label: "Mar", value: 184700 },
  { label: "Apr", value: 190400 },
  { label: "May", value: 195600 },
  { label: "Jun", value: 201100 },
  { label: "Jul", value: 208750 },
  { label: "2027", value: 234500 },
  { label: "2028", value: 268100 },
];

export const investments = [
  {
    name: "Total Market ETF",
    symbol: "VTI",
    account: "Brokerage",
    quantity: 82,
    currentValue: 22550,
    gain: 13.4,
    dividends: 420,
    risk: "Medium",
  },
  {
    name: "S&P 500 Index",
    symbol: "FXAIX",
    account: "401(k)",
    quantity: 118,
    currentValue: 31250,
    gain: 9.8,
    dividends: 690,
    risk: "Medium",
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
    account: "Crypto",
    quantity: 0.08,
    currentValue: 9100,
    gain: 16.7,
    dividends: 0,
    risk: "High",
  },
];

export const documents = [
  { name: "Mortgage closing packet", type: "Loan agreement", linked: "Primary Home", expires: "No expiry" },
  { name: "2025 tax return", type: "Tax document", linked: "Taxes", expires: "Apr 15, 2032" },
  { name: "Auto insurance policy", type: "Insurance", linked: "Tesla Model Y", expires: "Jul 18, 2026" },
  { name: "June brokerage statement", type: "Investment statement", linked: "Brokerage", expires: "No expiry" },
];

export const reportTypes = [
  "Monthly cash flow report",
  "Income report",
  "Expense report",
  "Asset report",
  "Loan report",
  "Net worth report",
  "Budget vs actual report",
  "Goal progress report",
  "Tax category report",
  "Year-end summary",
];

export const featureBlocks: FeatureBlock[] = [
  {
    title: "Income Tracking",
    what: "Capture salary, freelance, rental, dividend, and business income with expected versus received status.",
    why: "Reliable income inputs make every budget, goal, and forecast more accurate.",
    example: "Flag a missing July paycheck before it creates a cash-flow gap.",
    icon: Banknote,
  },
  {
    title: "Expense Categorization",
    what: "Organize spending by housing, food, utilities, transportation, subscriptions, healthcare, and custom categories.",
    why: "Users can see fixed commitments separately from flexible spending.",
    example: "Spot that restaurant spend is 22% higher than last month.",
    icon: ReceiptText,
  },
  {
    title: "Asset Value Tracker",
    what: "Track cash, property, vehicles, investments, crypto, retirement accounts, and ownership percentages.",
    why: "Assets are the other half of the money picture, not a side note.",
    example: "Update home value and see equity change after mortgage payoff.",
    icon: Landmark,
  },
  {
    title: "Loan Payoff Planner",
    what: "Model mortgages, auto loans, credit cards, student loans, and extra payments.",
    why: "Debt strategy becomes measurable instead of emotional.",
    example: "Paying $200 extra on the car loan saves $3,850 and closes it 14 months earlier.",
    icon: TrendingDown,
  },
  {
    title: "Net Worth Timeline",
    what: "Calculate assets minus liabilities and show past, current, and projected net worth.",
    why: "Net worth shows whether the user is truly improving over time.",
    example: "See how investment gains and debt reduction changed the month.",
    icon: LineChart,
  },
  {
    title: "Budget Control",
    what: "Use 50/30/20, zero-based, category, envelope, or custom budgeting.",
    why: "Different households need different budgeting systems.",
    example: "Rollover unused travel budget while stopping dining overspend.",
    icon: WalletCards,
  },
  {
    title: "Future Forecast",
    what: "Compare scenarios for income growth, inflation, asset returns, loans, and planned purchases.",
    why: "Users can weigh debt payoff against investing or large purchases.",
    example: "Compare Pay Debt First versus Invest More over five years.",
    icon: TrendingUp,
  },
  {
    title: "AI Insights",
    what: "Ask scenario questions based on the user's own data with risk-aware explanations.",
    why: "AI helps translate numbers into next actions without guaranteeing outcomes.",
    example: "Ask whether a $40,000 car fits the current cash-flow plan.",
    icon: Bot,
  },
  {
    title: "Reports and Reminders",
    what: "Create PDF, CSV, and Excel-ready views for cash flow, taxes, loans, assets, goals, and due dates.",
    why: "Monthly review needs reliable records and upcoming obligations.",
    example: "Export a year-end report and mark insurance renewal as paid.",
    icon: FileText,
  },
];

export const blogIdeas = [
  "How to calculate net worth",
  "How to pay off loans faster",
  "How much emergency fund is enough",
  "Budgeting methods compared",
  "Asset vs liability explained",
  "Cash flow basics",
  "Mortgage payoff strategies",
  "Debt snowball vs debt avalanche",
];

export const monthlyIncome = 9850;
export const monthlyExpenses = 6780;
export const liquidSavings = 18000;
export const essentialExpenses = 4350;

export const totalAssets = assets.reduce((sum, asset) => sum + asset.currentValue * (asset.ownership / 100), 0);
export const totalLiabilities = loans.reduce((sum, loan) => sum + loan.currentBalance, 0);
export const netWorth = totalAssets - totalLiabilities;
export const monthlyCashFlow = monthlyIncome - monthlyExpenses;
export const monthlyDebtPayments = loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
export const savingsRate = Math.round((monthlyCashFlow / monthlyIncome) * 100);
export const debtToIncome = Math.round((monthlyDebtPayments / monthlyIncome) * 100);
export const emergencyMonths = +(liquidSavings / essentialExpenses).toFixed(1);

export const healthFactors = [
  { label: "Cash flow stability", weight: 15, score: 15 },
  { label: "Savings rate", weight: 15, score: 15 },
  { label: "Emergency fund", weight: 15, score: 12 },
  { label: "Debt-to-income", weight: 15, score: 11 },
  { label: "Budget control", weight: 10, score: 6 },
  { label: "Debt risk", weight: 10, score: 3 },
  { label: "Net worth trend", weight: 10, score: 10 },
  { label: "Goal progress", weight: 5, score: 4 },
  { label: "Records and readiness", weight: 5, score: 4 },
];

export const financialHealthScore = healthFactors.reduce((sum, factor) => sum + factor.score, 0);

export const adminCards = [
  { label: "Total users", value: "18,420", change: "+11.4%" },
  { label: "Active users", value: "9,805", change: "+6.2%" },
  { label: "Contact messages", value: "47", change: "+5 new" },
  { label: "Feedback items", value: "31", change: "+8 new" },
  { label: "AI usage events", value: "1,284", change: "+14.2%" },
  { label: "Security alerts", value: "6", change: "2 high" },
  { label: "Error logs", value: "18", change: "4 critical" },
  { label: "Document storage", value: "4.8 TB", change: "62%" },
];

export function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function signedCurrency(value: number) {
  const formatted = currency(Math.abs(value));
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function percent(value: number) {
  return `${Math.round(value)}%`;
}

export function statusForBudget(line: BudgetLine): { label: string; tone: Tone } {
  if (line.spent > line.budget) return { label: "Over", tone: "danger" };
  if (line.spent / line.budget > 0.9) return { label: "Watch", tone: "warning" };
  return { label: "Good", tone: "success" };
}

export function progress(current: number, target: number) {
  return Math.min(100, Math.round((current / target) * 100));
}

export function monthsToGoal(goal: GoalLine) {
  const remaining = Math.max(goal.target - goal.current, 0);
  return Math.ceil(remaining / goal.monthly);
}

export const quickActions = [
  { label: "Add Income", icon: Banknote },
  { label: "Add Expense", icon: ReceiptText },
  { label: "Add Asset", icon: Landmark },
  { label: "Add Loan", icon: CreditCard },
  { label: "Add Goal", icon: Goal },
  { label: "Upload Document", icon: Upload },
  { label: "Run Forecast", icon: TrendingUp },
];

export const alerts = [
  {
    title: "Dining is 28% over budget",
    detail: "You spent $410 against a $320 dining limit.",
    tone: "danger" as Tone,
  },
  {
    title: "Credit card balance increased",
    detail: "Rewards Credit Card is up $850 since last statement close.",
    tone: "warning" as Tone,
  },
  {
    title: "Car loan payoff opportunity",
    detail: "Adding $200/month could save about $3,850 in interest.",
    tone: "success" as Tone,
  },
  {
    title: "Emergency fund needs work",
    detail: "You cover 4.1 months. Recommended target: 6 months.",
    tone: "info" as Tone,
  },
];

export const assetBreakdown = [
  { label: "Cash", value: 18000, color: "emerald" },
  { label: "Property", value: 430000, color: "blue" },
  { label: "Investments", value: 94300, color: "violet" },
  { label: "Vehicles", value: 38000, color: "amber" },
  { label: "Crypto", value: 9100, color: "red" },
];

export const liabilityBreakdown = [
  { label: "Mortgage", value: 310000, color: "blue" },
  { label: "Auto loan", value: 27200, color: "amber" },
  { label: "Student loan", value: 18800, color: "violet" },
  { label: "Credit card", value: 4550, color: "red" },
];

export const mobileTabs = [
  { label: "Dashboard", icon: Home, page: "dashboard" },
  { label: "Transactions", icon: ReceiptText, page: "transactions" },
  { label: "Add", icon: CircleDollarSign, page: "transactions" },
  { label: "Goals", icon: PiggyBank, page: "goals" },
  { label: "Settings", icon: ClipboardList, page: "settings" },
];

export const onboardingSteps = [
  {
    title: "Choose currency",
    fields: ["USD", "INR", "CAD", "GBP", "EUR"],
  },
  {
    title: "Add monthly income",
    fields: ["Source name", "Type", "Amount", "Frequency", "Tax deducted"],
  },
  {
    title: "Add monthly expenses",
    fields: ["Rent / mortgage", "Groceries", "Utilities", "Insurance", "Debt payments"],
  },
  {
    title: "Add assets",
    fields: ["Bank account", "Property", "Vehicle", "Stocks", "Retirement account"],
  },
  {
    title: "Add loans",
    fields: ["Mortgage", "Car loan", "Student loan", "Credit card", "Business loan"],
  },
  {
    title: "Set goals",
    fields: ["Emergency fund", "Buy a house", "Pay off debt", "Retirement", "Education"],
  },
  {
    title: "Dashboard created",
    fields: ["Your financial dashboard is ready."],
  },
];

export const forecastScenarios = [
  { scenario: "Pay Debt First", netWorth: 185000, debtLeft: 12000, cashFlow: "Medium", risk: "Low" },
  { scenario: "Invest More", netWorth: 210000, debtLeft: 38000, cashFlow: "Low", risk: "Medium" },
  { scenario: "Buy House", netWorth: 172000, debtLeft: 392000, cashFlow: "Tight", risk: "High" },
  { scenario: "Aggressive Saving", netWorth: 228000, debtLeft: 24500, cashFlow: "High", risk: "Low" },
];

export const adminSections = [
  "Users",
  "Contact Messages",
  "Support Tickets",
  "Feedback",
  "Error Logs",
  "Data Storage Summary",
  "Security Alerts",
  "AI Usage",
];

export const loanSchedule = [
  { month: "Aug 2026", opening: 27200, payment: 650, principal: 487, interest: 163, closing: 26713 },
  { month: "Sep 2026", opening: 26713, payment: 650, principal: 490, interest: 160, closing: 26223 },
  { month: "Oct 2026", opening: 26223, payment: 650, principal: 493, interest: 157, closing: 25730 },
  { month: "Nov 2026", opening: 25730, payment: 650, principal: 496, interest: 154, closing: 25234 },
  { month: "Dec 2026", opening: 25234, payment: 650, principal: 499, interest: 151, closing: 24735 },
];

export const settingsGroups = [
  {
    title: "Profile",
    items: ["Name", "Email", "Phone", "Country", "Currency", "Time zone", "Date format"],
  },
  {
    title: "Financial",
    items: ["Default currency", "Fiscal year start", "Budget method", "Tax assumptions", "Inflation assumption", "Investment return assumption"],
  },
  {
    title: "Security",
    items: ["Password change", "Two-factor authentication", "Login history", "Device management", "Data export", "Delete account"],
  },
  {
    title: "Categories",
    items: ["Income categories", "Expense categories", "Asset categories", "Loan types", "Tags"],
  },
];

export const trustItems = [
  { title: "Secure authentication", icon: ShieldCheck },
  { title: "Private workspace", icon: LockKeyhole },
  { title: "No selling user data", icon: ShieldCheck },
  { title: "Export and delete anytime", icon: Upload },
];

export const solutionItems = [
  "Income",
  "Expenses",
  "Assets",
  "Loans",
  "Net worth",
  "Future projections",
];

export const problemItems = [
  "Salary comes in",
  "Bills go out",
  "Loans grow or reduce",
  "Assets change value",
  "Net worth is unclear",
];

export const featureHighlights = [
  "Track cash flow",
  "Manage loans",
  "Forecast wealth",
  "Plan goals",
  "Analyze spending",
  "Monitor asset value",
];

export const aiPrompts = [
  "Can I afford a $40,000 car?",
  "How long to pay off my credit card?",
  "Why did my expenses increase this month?",
  "What happens if I pay $500 extra on my mortgage?",
  "Which loan should I pay first?",
  "Show my financial risks.",
];

export const incomeTypes = ["Salary", "Bonus", "Freelance", "Business", "Rental", "Dividends", "Interest", "Capital gains", "Gifts", "Refunds"];
export const expenseCategories = ["Housing", "Food", "Utilities", "Transportation", "Insurance", "Healthcare", "Entertainment", "Shopping", "Travel", "Subscriptions", "Taxes"];
export const assetCategories = ["Cash", "Bank balances", "Real estate", "Vehicles", "Stocks", "Mutual funds / ETFs", "Crypto", "Retirement accounts", "Gold", "Business ownership"];
export const loanTypes = ["Mortgage", "Auto loan", "Student loan", "Personal loan", "Credit card", "Business loan", "Medical loan", "Family loan", "Tax debt"];
