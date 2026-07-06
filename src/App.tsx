import { createContext, useContext, useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AlertTriangle,
  Apple,
  ArrowRight,
  Bell,
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Gauge,
  Landmark,
  LockKeyhole,
  Menu,
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
  pricingPlans,
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
  type Asset,
  type BudgetLine,
  type GoalLine,
  type Loan,
  type NavItem,
  type Reminder,
  type Tone,
  type Transaction,
} from "./data";

const publicPages = ["home", "features", "pricing", "about", "blog", "contact", "login", "signup", "forgot"];
const authPages = ["login", "signup", "forgot", "onboarding"];
const appPages = navItems.filter((item) => item.group === "App").map((item) => item.id);
const RESET_STORAGE_KEY = "netview:data-reset";
const DATA_STORAGE_KEY = "netview:financial-data";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
const authRedirectUrl =
  (import.meta.env.VITE_AUTH_REDIRECT_URL as string | undefined) ||
  "https://royalchariot.github.io/netview-planner/";
const pageTitleOverrides: Record<string, string> = {
  income: "Income",
  expenses: "Expenses",
  "cash-flow": "Cash Flow",
  debt: "Debt",
  "savings-rate": "Savings Rate",
  "financial-health": "Financial Health",
};

function readInitialPage() {
  const hash = window.location.hash.replace("#", "");
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
  goals: typeof goals;
  healthFactors: typeof healthFactors;
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
  reminders: typeof reminders;
  savingsRate: number;
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
  goals,
  healthFactors,
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
  reminders,
  savingsRate,
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
  goals: [],
  healthFactors: [],
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
  reminders: [],
  savingsRate: 0,
  totalAssets: 0,
  totalLiabilities: 0,
  transactions: [],
};

type FinancialDataUpdater = (current: FinancialData) => FinancialData;

function readInitialFinancialData(reset: boolean) {
  try {
    const stored = window.localStorage.getItem(DATA_STORAGE_KEY);
    if (stored) return deriveFinancialData({ ...emptyFinancialData, ...JSON.parse(stored) });
  } catch {
    // Fall back to the built-in dataset when stored data cannot be read.
  }

  return reset ? emptyFinancialData : demoFinancialData;
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
    if (/cash|bank|saving/.test(category)) add("Cash", asset.currentValue, "emerald");
    else if (/real|property|home/.test(category)) add("Property", asset.currentValue, "blue");
    else if (/vehicle|car|auto/.test(category)) add("Vehicles", asset.currentValue, "amber");
    else if (/crypto/.test(category)) add("Crypto", asset.currentValue, "red");
    else add("Investments", asset.currentValue, "violet");
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
  const income = sumAmounts(data.transactions, (row) => row.amount > 0);
  const expenses = Math.abs(sumAmounts(data.transactions, (row) => row.type === "Expense" && row.amount < 0));
  const totalAssetValue = data.assets.reduce((sum, asset) => sum + asset.currentValue, 0);
  const totalDebtValue = data.loans.reduce((sum, loan) => sum + loan.currentBalance, 0);
  const debtPayments = data.loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
  const cashFlow = income - expenses;
  const savingsPercent = income > 0 ? Math.round((cashFlow / income) * 100) : 0;
  const debtPercent = income > 0 ? Math.round((debtPayments / income) * 100) : 0;
  const liquidAssetValue = data.assets
    .filter((asset) => /cash|bank|saving|emergency/i.test(`${asset.name} ${asset.category}`))
    .reduce((sum, asset) => sum + asset.currentValue, 0);
  const essentialMonthlySpend = expenses > 0 ? Math.max(expenses * 0.65, 1) : 0;
  const runway = essentialMonthlySpend > 0 ? +(liquidAssetValue / essentialMonthlySpend).toFixed(1) : 0;
  const assetRows = buildAssetBreakdown(data.assets);
  const liabilityRows = buildLiabilityBreakdown(data.loans);
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
    { label: "Positive cash flow", weight: 20, score: cashFlow > 0 ? 18 : 4 },
    { label: "Emergency fund", weight: 20, score: Math.min(20, Math.round((runway / 6) * 20)) },
    { label: "Debt-to-income ratio", weight: 20, score: debtPercent ? Math.max(0, 20 - Math.round(debtPercent / 2)) : income > 0 ? 20 : 0 },
    { label: "Savings rate", weight: 15, score: Math.max(0, Math.min(15, Math.round((savingsPercent / 30) * 15))) },
    { label: "Budget control", weight: 10, score: data.budgetLines.length ? 7 : 0 },
    { label: "Net worth growth", weight: 10, score: totalAssetValue - totalDebtValue > 0 ? 8 : 0 },
    { label: "Insurance/documents readiness", weight: 5, score: data.documents.length ? 4 : 0 },
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
  resetWorkspace: () => void;
  restoreDemoData: () => void;
};

type FinancialDataActions = {
  updateFinancialData: (updater: FinancialDataUpdater) => void;
};

const FinancialDataContext = createContext<FinancialData>(demoFinancialData);
const FinancialDataActionsContext = createContext<FinancialDataActions>({
  updateFinancialData: () => undefined,
});
const ResetControlsContext = createContext<ResetControls>({
  dataReset: false,
  resetWorkspace: () => undefined,
  restoreDemoData: () => undefined,
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

export default function App() {
  const [page, setPageState] = useState(readInitialPage);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataReset, setDataReset] = useState(readInitialResetState);
  const [workspaceData, setWorkspaceData] = useState(() => readInitialFinancialData(readInitialResetState()));

  useEffect(() => {
    const onHashChange = () => setPageState(readInitialPage());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const setPage = (nextPage: string) => {
    setSidebarOpen(false);
    if (window.location.hash !== `#${nextPage}`) window.location.hash = nextPage;
    setPageState(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetWorkspace = () => {
    persistResetState(true);
    clearPersistedFinancialData();
    setWorkspaceData(emptyFinancialData);
    setDataReset(true);
    setPage("onboarding");
  };

  const restoreDemoData = () => {
    persistResetState(false);
    clearPersistedFinancialData();
    setWorkspaceData(demoFinancialData);
    setDataReset(false);
    setPage("dashboard");
  };

  const updateFinancialData = (updater: FinancialDataUpdater) => {
    setWorkspaceData((current) => {
      const next = deriveFinancialData(updater(current));
      persistFinancialData(next);
      return next;
    });
  };

  const isAppShell = appPages.includes(page) || page === "admin" || page in pageTitleOverrides;
  const financialData = workspaceData;
  const resetControls = { dataReset, resetWorkspace, restoreDemoData };

  return (
    <FinancialDataContext.Provider value={financialData}>
      <FinancialDataActionsContext.Provider value={{ updateFinancialData }}>
        <ResetControlsContext.Provider value={resetControls}>
          {isAppShell ? (
            <div className="app-frame">
              <Sidebar page={page} setPage={setPage} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
              <div className="app-main">
                <AppTopBar page={page} setPage={setPage} onMenu={() => setSidebarOpen(true)} />
                <main className="app-content">{renderPage(page, setPage)}</main>
                <MobileNav page={page} setPage={setPage} />
              </div>
            </div>
          ) : (
            <div className="site-shell">
              <MarketingNav page={page} setPage={setPage} />
              <main>{renderPage(page, setPage)}</main>
            </div>
          )}
        </ResetControlsContext.Provider>
      </FinancialDataActionsContext.Provider>
    </FinancialDataContext.Provider>
  );
}

function renderPage(page: string, setPage: (page: string) => void) {
  switch (page) {
    case "home":
      return <HomePage setPage={setPage} />;
    case "features":
      return <FeaturesPage setPage={setPage} />;
    case "pricing":
      return <PricingPage setPage={setPage} />;
    case "about":
      return <AboutPage setPage={setPage} />;
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
    case "onboarding":
      return <OnboardingPage setPage={setPage} />;
    case "dashboard":
      return <DashboardPage setPage={setPage} />;
    case "income":
      return <IncomeDetailPage />;
    case "expenses":
      return <ExpensesDetailPage />;
    case "cash-flow":
      return <CashFlowDetailPage />;
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
      return <BudgetPage />;
    case "goals":
      return <GoalsPage />;
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
        <button className="ghost-button" onClick={() => navigate("login")}>
          <LockKeyhole size={17} />
          Login
        </button>
        <button className="primary-button" onClick={() => navigate("signup")}>
          Start Free
          <ArrowRight size={17} />
        </button>
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
  const grouped = useMemo(() => {
    const groups = ["App", "Admin", "Public"] as const;
    return groups.map((group) => ({
      group,
      items:
        group === "Public"
          ? navItems.filter((item) => ["home", "features", "pricing"].includes(item.id))
          : navItems.filter((item) => item.group === group),
    }));
  }, []);

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
        <button className="ghost-button">
          <Bell size={17} />
          Jul 2026
        </button>
        <button className="primary-button" onClick={openAddEntry}>
          <Plus size={17} />
          Add Entry
        </button>
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
  return (
    <>
      <section className="hero" style={{ backgroundImage: `url("${assetUrl("assets/netview-hero.png")}")` }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">Not just an expense tracker</p>
          <h1>Your Complete Financial Life, Organized in One Dashboard.</h1>
          <p>
            Track income, expenses, assets, loans, net worth, budgets, and future financial goals with one simple
            planner.
          </p>
          <div className="hero-actions">
            <button className="primary-button large" onClick={() => setPage("signup")}>
              Start Free
              <ArrowRight size={18} />
            </button>
            <button className="ghost-button large" onClick={() => setPage("dashboard")}>
              View Demo
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
          <h2>Your money is scattered across accounts, loans, cards, spreadsheets, and apps.</h2>
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
          <h2>One command center for the full money picture.</h2>
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
          <h2>Dashboard clarity without losing financial detail.</h2>
          <p className="section-copy">
            NetView Planner surfaces totals, trends, debt alerts, budget pressure, upcoming payments, and next actions
            in a layout built for repeated monthly review.
          </p>
          <button className="primary-button" onClick={() => setPage("dashboard")}>
            Open demo dashboard
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
  return (
    <PublicPage title="Features" kicker="Complete financial planner" actionLabel="View dashboard" onAction={() => setPage("dashboard")}>
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

function PricingPage({ setPage }: { setPage: (page: string) => void }) {
  return (
    <PublicPage title="Pricing" kicker="Plans for every stage" actionLabel="Start Free" onAction={() => setPage("signup")}>
      <div className="pricing-grid">
        {pricingPlans.map((plan) => (
          <article className={plan.featured ? "pricing-card featured" : "pricing-card"} key={plan.name}>
            {plan.featured && <span className="badge success">Most popular</span>}
            <h3>{plan.name}</h3>
            <div className="price">
              <strong>{plan.price}</strong>
              <span>/month</span>
            </div>
            <p>{plan.note}</p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <Check size={17} />
                  {feature}
                </li>
              ))}
            </ul>
            <button className={plan.featured ? "primary-button full" : "ghost-button full"} onClick={() => setPage("signup")}>
              Choose {plan.name}
            </button>
          </article>
        ))}
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
  return (
    <PublicPage title="Contact" kicker="Support and inquiries">
      <section className="contact-layout">
        <form className="form-panel">
          <Field label="Name" placeholder="Full name" />
          <Field label="Email" placeholder="you@example.com" />
          <Field label="Subject" placeholder="How can we help?" />
          <label>
            <span>Support category</span>
            <select>
              <option>Product support</option>
              <option>Security contact</option>
              <option>Business inquiry</option>
              <option>Billing</option>
            </select>
          </label>
          <label>
            <span>Message</span>
            <textarea rows={6} placeholder="Share the details" />
          </label>
          <button className="primary-button" type="button">
            Submit
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
  return (
    <AuthLayout title="Welcome back" kicker="Login">
      <form className="auth-form">
        <Field label="Email" placeholder="you@example.com" />
        <Field label="Password" placeholder="Password" type="password" />
        <div className="form-row compact">
          <label className="check-label">
            <input type="checkbox" />
            Remember me
          </label>
          <button className="text-button" type="button" onClick={() => setPage("forgot")}>
            Forgot password?
          </button>
        </div>
        <button className="primary-button full" type="button" onClick={() => setPage("dashboard")}>
          Login
          <ArrowRight size={17} />
        </button>
        <div className="auth-divider">or</div>
        <button className="ghost-button full" type="button">
          <Search size={17} />
          Login with Google
        </button>
        <button className="ghost-button full" type="button">
          <Apple size={17} />
          Login with Apple
        </button>
      </form>
    </AuthLayout>
  );
}

function SignupPage({ setPage }: { setPage: (page: string) => void }) {
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
    setPhase("welcome");
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
          <button className="primary-button full" type="button" onClick={() => setPage("onboarding")}>
            Add my financial data
            <ArrowRight size={17} />
          </button>
          <button className="ghost-button full" type="button" onClick={() => setPage("dashboard")}>
            Skip and view demo dashboard
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
  return (
    <AuthLayout title="Reset password" kicker="Account recovery">
      <form className="auth-form">
        <p className="muted">Enter your email and NetView will send a reset link.</p>
        <Field label="Email" placeholder="you@example.com" />
        <button className="primary-button full" type="button">
          Send reset link
          <ArrowRight size={17} />
        </button>
        <button className="text-button centered" type="button" onClick={() => setPage("login")}>
          Back to login
        </button>
      </form>
    </AuthLayout>
  );
}

function OnboardingPage({ setPage }: { setPage: (page: string) => void }) {
  return (
    <section className="onboarding-page">
      <div className="section-heading">
        <p className="eyebrow">Guided setup</p>
        <h1>Build the dashboard before the first login lands empty.</h1>
        <p>NetView collects the minimum starting data needed for cash flow, assets, debt, and goals.</p>
      </div>
      <div className="onboarding-grid">
        {onboardingSteps.map((step, index) => (
          <article className="step-card" key={step.title}>
            <span className="step-number">{index + 1}</span>
            <h3>{step.title}</h3>
            <div className="chip-row">
              {step.fields.map((field) => (
                <span className="chip" key={field}>
                  {field}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
      <button className="primary-button large" onClick={() => setPage("dashboard")}>
        Your financial dashboard is ready
        <ArrowRight size={18} />
      </button>
    </section>
  );
}

function quickActionTarget(label: string) {
  const targets: Record<string, string> = {
    "Add Income": "income",
    "Add Expense": "expenses",
    "Add Asset": "assets",
    "Add Loan": "loans",
    "Add Goal": "goals",
    "Upload Document": "documents",
    "Run Forecast": "forecast",
  };

  return targets[label] ?? "transactions";
}

function DashboardPage({ setPage }: { setPage: (page: string) => void }) {
  const {
    alerts,
    assetBreakdown,
    liabilityBreakdown,
    monthlyCashFlow,
    monthlyExpenses,
    monthlyIncome,
    netWorth,
    netWorthSeries,
    reminders,
    savingsRate,
    totalAssets,
    totalLiabilities,
    financialHealthScore,
  } = useFinancialData();
  const summaryCards = [
    { label: "Net Worth", value: currency(netWorth), detail: "Assets minus liabilities", tone: netWorth >= 0 ? "success" as Tone : "danger" as Tone, page: "net-worth" },
    { label: "Monthly Income", value: currency(monthlyIncome), detail: "Expected this month", tone: "info" as Tone, page: "income" },
    { label: "Monthly Expenses", value: currency(monthlyExpenses), detail: "Projected outflow", tone: monthlyExpenses > 0 ? "warning" as Tone : "info" as Tone, page: "expenses" },
    { label: "Cash Flow", value: signedCurrency(monthlyCashFlow), detail: "Income minus expenses", tone: "success" as Tone, page: "cash-flow" },
    { label: "Total Assets", value: currency(totalAssets), detail: "Current value", tone: "success" as Tone, page: "assets" },
    { label: "Total Debt", value: currency(totalLiabilities), detail: "Remaining balances", tone: "danger" as Tone, page: "debt" },
    { label: "Savings Rate", value: percent(savingsRate), detail: "Saved amount / income", tone: "info" as Tone, page: "savings-rate" },
    { label: "Health Score", value: `${financialHealthScore}/100`, detail: financialHealthScore ? "Stable with debt pressure" : "Add data to score", tone: financialHealthScore ? "warning" as Tone : "info" as Tone, page: "financial-health" },
  ];

  return (
    <div className="page-stack">
      <div className="summary-grid">
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} {...card} onClick={() => setPage(card.page)} />
        ))}
      </div>

      <div className="dashboard-grid">
        <Panel title="Cash Flow" action={<Segmented labels={["Monthly", "Quarterly", "Yearly"]} />}>
          <CashFlowChart />
        </Panel>
        <Panel title="Net Worth Trend" action={<Segmented labels={["Past", "Current", "Projected"]} />}>
          <LineChart series={netWorthSeries} />
        </Panel>
      </div>

      <div className="dashboard-grid three">
        <Panel title="Assets vs Liabilities">
          <Breakdown title="Assets" rows={assetBreakdown} total={totalAssets} />
          <Breakdown title="Liabilities" rows={liabilityBreakdown} total={totalLiabilities} />
        </Panel>
        <Panel title="Upcoming Payments">
          <div className="list-stack">
            {reminders.length > 0 ? (
              reminders.map((reminder) => <ReminderRow key={reminder.title} reminder={reminder} />)
            ) : (
              <EmptyState title="No reminders yet." detail="Add a money date to track upcoming payments." />
            )}
          </div>
        </Panel>
        <Panel title="Alerts">
          <div className="list-stack">
            {alerts.length > 0 ? (
              alerts.map((alert) => <AlertRow key={alert.title} {...alert} />)
            ) : (
              <EmptyState title="No alerts yet." detail="Alerts will appear after you add financial records." />
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Quick Actions">
        <div className="quick-actions">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button className="action-tile" key={action.label} onClick={() => setPage(quickActionTarget(action.label))}>
                <Icon size={20} />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function TransactionsPage() {
  const { transactions } = useFinancialData();
  const { updateFinancialData } = useFinancialDataActions();
  const [transactionRows, setTransactionRows] = useState<Transaction[]>(transactions);
  const [activeTab, setActiveTab] = useState("All Transactions");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
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
    const openAddForm = () => setShowAddForm(true);

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

  const addTransaction = (event: FormEvent<HTMLFormElement>) => {
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

    setTransactionRows((current) => [record, ...current]);
    updateFinancialData((current) => ({ ...current, transactions: [record, ...current.transactions] }));
    setNewTransaction((current) => ({ ...current, source: "", amount: "" }));
    setShowAddForm(false);
    setNotice("Transaction added.");
  };

  const addSampleImport = () => {
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

    setTransactionRows((current) => [...imported, ...current]);
    updateFinancialData((current) => ({ ...current, transactions: [...imported, ...current.transactions] }));
    setShowBulkUpload(false);
    setNotice("Imported 2 sample CSV transactions.");
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
          <button className="primary-button" onClick={() => setShowAddForm((value) => !value)}>
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

      {notice && <p className={notice.includes("Enter") ? "form-message danger" : "form-message info"}>{notice}</p>}

      {showAddForm && (
        <Panel title="Add Manual Transaction" action={<button className="icon-button" onClick={() => setShowAddForm(false)} aria-label="Close add transaction form"><X size={16} /></button>}>
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
              Add transaction
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
            columns={["Date", "Type", "Account", "Category", "Merchant / Source", "Amount", "Payment Method", "Status"]}
            rows={filteredTransactions.map((transaction) => [
              transaction.date,
              <Badge tone={transaction.type === "Income" ? "success" : transaction.type === "Expense" ? "warning" : "info"}>{transaction.type}</Badge>,
              transaction.account,
              transaction.category,
              transaction.source,
              <span className={transaction.amount >= 0 ? "money-positive" : "money-negative"}>{signedCurrency(transaction.amount)}</span>,
              transaction.method,
              <Badge tone={transaction.status === "Cleared" ? "success" : "warning"}>{transaction.status}</Badge>,
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
  const { monthlyIncome, transactions } = useFinancialData();
  const incomeRows = transactions.filter((transaction) => transaction.type === "Income");
  const incomeBreakdown = Array.from(
    incomeRows.reduce((grouped, row) => {
      grouped.set(row.category, (grouped.get(row.category) ?? 0) + row.amount);
      return grouped;
    }, new Map<string, number>()),
  ).map(([label, value], index) => ({ label, value, color: ["emerald", "blue", "amber", "violet"][index % 4] }));

  return (
    <div className="page-stack">
      <PageToolbar title="Income Tracking" actions={["Add income", "Mark received", "Export income"]} />
      <div className="summary-grid four">
        <SummaryCard label="Monthly expected" value={currency(monthlyIncome)} detail="Salary and freelance forecast" tone="success" />
        <SummaryCard label="Received so far" value={currency(incomeRows.reduce((sum, row) => sum + row.amount, 0))} detail="Cleared deposits" tone="info" />
        <SummaryCard label="Stability score" value="82/100" detail="Two reliable income streams" tone="success" />
        <SummaryCard label="Projection" value={currency(monthlyIncome * 12)} detail="Current annual run rate" tone="info" />
      </div>
      <Panel title="Income Sources" action={<Segmented labels={["Monthly", "Quarterly", "Yearly"]} />}>
        <DataTable
          columns={["Date", "Source", "Category", "Account", "Amount", "Status"]}
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
      <Panel title="Income Breakdown">
        <Breakdown
          title="Sources"
          total={monthlyIncome}
          rows={incomeBreakdown}
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

function AssetsPage() {
  const { assets, loans } = useFinancialData();
  const house = assets[0];
  const linkedLoan = house ? loans.find((loan) => loan.name === house.linkedLoan) : undefined;
  const equity = house ? house.currentValue - (linkedLoan?.currentBalance ?? 0) : 0;

  return (
    <div className="page-stack">
      <PageToolbar title="Assets" actions={["Add asset", "Update value", "Upload document"]} />
      <Panel title="Asset Portfolio">
        <DataTable
          columns={["Asset name", "Category", "Purchase value", "Current value", "Appreciation", "Ownership", "Linked loan", "Last updated"]}
          rows={assets.map((asset) => [
            asset.name,
            asset.category,
            currency(asset.purchaseValue),
            currency(asset.currentValue),
            <span className={asset.currentValue - asset.purchaseValue >= 0 ? "money-positive" : "money-negative"}>
              {signedCurrency(asset.currentValue - asset.purchaseValue)}
            </span>,
            `${asset.ownership}%`,
            asset.linkedLoan ?? "None",
            asset.updated,
          ])}
        />
      </Panel>
      <div className="dashboard-grid">
        <Panel title="Asset Detail: Primary Home">
          {house ? (
            <>
              <div className="detail-grid">
                <MetricBlock label="Current value" value={currency(house.currentValue)} />
                <MetricBlock label="Purchase price" value={currency(house.purchaseValue)} />
                <MetricBlock label="Mortgage balance" value={currency(linkedLoan?.currentBalance ?? 0)} />
                <MetricBlock label="Equity" value={currency(equity)} />
              </div>
              <LineChart series={[{ label: "2024", value: 400000 }, { label: "2025", value: 418000 }, { label: "2026", value: 430000 }, { label: "2027", value: 442000 }]} />
            </>
          ) : (
            <EmptyState title="No assets yet." detail="Add an asset to start building your net worth view." />
          )}
        </Panel>
        <CategoryPanel title="Asset Categories" items={assetCategories} />
      </div>
    </div>
  );
}

function LoansPage() {
  const { assets, loanSchedule, loans } = useFinancialData();
  const autoLoan = loans[1] ?? loans[0];
  const carAsset = autoLoan ? assets.find((asset) => asset.name === autoLoan.linkedAsset) : undefined;
  const carEquity = autoLoan ? (carAsset?.currentValue ?? 0) - autoLoan.currentBalance : 0;
  const [extraMonthly, setExtraMonthly] = useState("200");
  const [oneTimePayment, setOneTimePayment] = useState("1000");
  const extra = Number(extraMonthly) || 0;
  const oneTime = Number(oneTimePayment) || 0;
  const monthsReduced = Math.max(1, Math.round((extra * 0.07 + oneTime / 1000) * 4));
  const interestSaved = Math.round(extra * 18 + oneTime * 0.35);

  return (
    <div className="page-stack">
      <PageToolbar title="Loans / Liabilities" actions={["Add loan", "Run simulator", "Export schedule"]} />
      <Panel title="Loan Portfolio">
        <DataTable
          columns={["Loan name", "Original amount", "Current balance", "Interest rate", "Monthly payment", "Remaining months", "Interest left", "Status"]}
          rows={loans.map((loan) => [
            loan.name,
            currency(loan.originalAmount),
            currency(loan.currentBalance),
            `${loan.rate}%`,
            currency(loan.monthlyPayment),
            loan.remainingMonths,
            currency(loan.interestLeft),
            <Badge tone="success">Active</Badge>,
          ])}
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
  const { updateFinancialData } = useFinancialDataActions();
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

  const submit = (event: FormEvent<HTMLFormElement>) => {
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

    updateFinancialData((current) => {
      const nextTransactions =
        createsTransaction
          ? [
              {
                date: formatInputDate(dateKey),
                type: transactionType,
                account: formString(data, "account", transactionType === "Income" ? "Checking" : "Credit card"),
                category,
                source,
                amount: transactionType === "Income" ? amount : -amount,
                method: formString(data, "method", transactionType === "Income" ? "ACH" : "Bank"),
                status: formString(data, "status", "Pending") as Transaction["status"],
              },
              ...current.transactions,
            ]
          : current.transactions;

      return {
        ...current,
        reminders: [reminder, ...current.reminders],
        transactions: nextTransactions,
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
  return (
    <div className="page-stack">
      <PageToolbar title="Reports & Analytics" actions={["Export PDF", "Export Excel", "Export CSV"]} />
      <div className="report-grid">
        {reportTypes.map((report) => (
          <article className="report-card" key={report}>
            <FileSpreadsheet size={22} />
            <h3>{report}</h3>
            <p>Professional report layout with filters, comparison periods, and download options.</p>
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
  const [editing, setEditing] = useState("");
  const [notice, setNotice] = useState("");
  const runReset = () => {
    const confirmed = window.confirm("Delete all NetView workspace data from this browser and start from scratch?");

    if (!confirmed) return;

    setEditing("");
    setNotice("");
    resetWorkspace();
  };

  return (
    <div className="page-stack">
      <PageToolbar title="Profile & Settings" actions={["Save changes", "Export data", "Security review"]} />
      {notice && <p className="form-message info">{notice}</p>}
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
      <Panel title="Reset Workspace">
        <div className="reset-panel">
          <div>
            <h3>Start From Scratch</h3>
            <p>This removes workspace records from this browser and returns you to onboarding.</p>
          </div>
          <div className="button-row">
            <button className="danger-button" onClick={runReset}>
              <Trash2 size={17} />
              Reset data
            </button>
            {dataReset && (
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
          <Badge tone="success">Live plan</Badge>
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
  if (["Add loan", "Add debt"].includes(action)) return <LoanActionForm action={action} onDone={onDone} />;
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
  const { updateFinancialData } = useFinancialDataActions();
  const fixedType = action === "Add income" ? "Income" : action === "Add expense" ? "Expense" : "";

  const submit = (event: FormEvent<HTMLFormElement>) => {
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

    updateFinancialData((current) => ({ ...current, transactions: [record, ...current.transactions] }));
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
  const { updateFinancialData } = useFinancialDataActions();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = formString(data, "name");
    const currentValue = formNumber(data, "currentValue");

    if (!name || currentValue <= 0) return;

    const record: Asset = {
      name,
      category: formString(data, "category", "Bank balances"),
      purchaseValue: formNumber(data, "purchaseValue", currentValue),
      currentValue,
      ownership: formNumber(data, "ownership", 100),
      linkedLoan: formString(data, "linkedLoan") || undefined,
      updated: "July 2026",
    };

    updateFinancialData((current) => ({ ...current, assets: [record, ...current.assets] }));
    onDone(`${action === "Update value" ? "Asset value" : "Asset"} saved.`);
  };

  return (
    <form className="feature-action-form" onSubmit={submit}>
      <label>
        <span>Asset name</span>
        <input name="name" placeholder="Emergency Fund" required />
      </label>
      <label>
        <span>Category</span>
        <select name="category" defaultValue="Bank balances">
          {assetCategories.map((category) => <option key={category}>{category}</option>)}
        </select>
      </label>
      <label>
        <span>Purchase value</span>
        <input name="purchaseValue" inputMode="decimal" placeholder="10000" />
      </label>
      <label>
        <span>Current value</span>
        <input name="currentValue" inputMode="decimal" placeholder="12000" required />
      </label>
      <label>
        <span>Ownership %</span>
        <input name="ownership" inputMode="decimal" defaultValue="100" />
      </label>
      <label>
        <span>Linked loan</span>
        <input name="linkedLoan" placeholder="Optional loan name" />
      </label>
      <button className="primary-button" type="submit">
        Save asset
        <ArrowRight size={17} />
      </button>
    </form>
  );
}

function LoanActionForm({ action, onDone }: { action: string; onDone: (message: string) => void }) {
  const { updateFinancialData } = useFinancialDataActions();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = formString(data, "name");
    const balance = formNumber(data, "currentBalance");

    if (!name || balance <= 0) return;

    const rate = formNumber(data, "rate");
    const monthlyPayment = formNumber(data, "monthlyPayment");
    const record: Loan = {
      name,
      type: formString(data, "type", "Personal loan"),
      originalAmount: formNumber(data, "originalAmount", balance),
      currentBalance: balance,
      rate,
      monthlyPayment,
      start: "Jul 2026",
      end: formString(data, "end", "Jul 2031"),
      remainingMonths: formNumber(data, "remainingMonths", 60),
      interestLeft: Math.round(balance * (rate / 100) * 1.5),
      linkedAsset: formString(data, "linkedAsset") || undefined,
    };

    updateFinancialData((current) => ({ ...current, loans: [record, ...current.loans] }));
    onDone(`${action === "Add debt" ? "Debt" : "Loan"} added.`);
  };

  return (
    <form className="feature-action-form" onSubmit={submit}>
      <label>
        <span>Loan name</span>
        <input name="name" placeholder="Personal loan" required />
      </label>
      <label>
        <span>Type</span>
        <select name="type" defaultValue="Personal loan">
          {loanTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
      </label>
      <label>
        <span>Original amount</span>
        <input name="originalAmount" inputMode="decimal" placeholder="10000" />
      </label>
      <label>
        <span>Current balance</span>
        <input name="currentBalance" inputMode="decimal" placeholder="8500" required />
      </label>
      <label>
        <span>Interest rate %</span>
        <input name="rate" inputMode="decimal" placeholder="7.5" />
      </label>
      <label>
        <span>Monthly payment</span>
        <input name="monthlyPayment" inputMode="decimal" placeholder="250" />
      </label>
      <label>
        <span>Remaining months</span>
        <input name="remainingMonths" inputMode="numeric" defaultValue="60" />
      </label>
      <label>
        <span>Payoff date</span>
        <input name="end" defaultValue="Jul 2031" />
      </label>
      <label>
        <span>Linked asset</span>
        <input name="linkedAsset" placeholder="Optional asset name" />
      </label>
      <button className="primary-button" type="submit">
        Save loan
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
