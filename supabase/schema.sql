create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  country text default 'United States',
  currency text default 'USD',
  timezone text default 'America/Chicago',
  date_format text default 'MMM d, yyyy',
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('checking', 'savings', 'cash', 'credit_card', 'investment', 'loan', 'wallet', 'other')),
  institution_name text,
  currency text not null default 'USD',
  opening_balance numeric(14, 2) not null default 0,
  current_balance numeric(14, 2) not null default 0,
  include_in_net_worth boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('income', 'expense')),
  parent_category_id uuid references public.categories(id) on delete set null,
  color_key text default 'emerald',
  icon_key text default 'circle',
  is_system_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, kind, name)
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('tax', 'loan_agreement', 'insurance', 'mortgage', 'investment_statement', 'receipt', 'legal', 'other')),
  file_url text not null,
  file_size bigint,
  mime_type text,
  linked_record_type text,
  linked_record_id uuid,
  expiry_date date,
  notes text,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  transfer_account_id uuid references public.accounts(id) on delete set null,
  date date not null default current_date,
  type text not null check (type in ('income', 'expense', 'transfer')),
  category_id uuid references public.categories(id) on delete set null,
  merchant_or_source text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  currency text not null default 'USD',
  payment_method text,
  status text not null default 'cleared' check (status in ('cleared', 'pending', 'review')),
  notes text,
  tags text[] not null default '{}',
  is_recurring boolean not null default false,
  recurring_rule_id uuid,
  document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.income_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('salary', 'bonus', 'freelance', 'business', 'rental', 'dividends', 'interest', 'refund', 'other')),
  expected_amount numeric(14, 2) not null default 0,
  frequency text not null check (frequency in ('weekly', 'biweekly', 'monthly', 'yearly', 'one_time')),
  next_expected_date date,
  account_id uuid references public.accounts(id) on delete set null,
  tax_withheld_estimate numeric(14, 2),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null check (category in ('cash', 'real_estate', 'vehicle', 'stocks', 'etf', 'crypto', 'retirement', 'gold', 'business', 'collectibles', 'other')),
  purchase_value numeric(14, 2) not null default 0,
  current_value numeric(14, 2) not null default 0,
  ownership_percent numeric(6, 3) not null default 100,
  acquisition_date date,
  linked_loan_id uuid,
  linked_account_id uuid references public.accounts(id) on delete set null,
  valuation_method text not null default 'manual' check (valuation_method in ('manual', 'account_balance', 'market_estimate')),
  last_updated date not null default current_date,
  notes text,
  include_in_net_worth boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('mortgage', 'auto', 'student', 'credit_card', 'personal', 'business', 'medical', 'family', 'tax_debt', 'other')),
  lender text,
  original_amount numeric(14, 2) not null default 0,
  current_balance numeric(14, 2) not null default 0,
  interest_rate numeric(7, 4) not null default 0,
  monthly_payment numeric(14, 2) not null default 0,
  minimum_payment numeric(14, 2) not null default 0,
  start_date date,
  expected_end_date date,
  remaining_months integer,
  linked_asset_id uuid references public.assets(id) on delete set null,
  payment_account_id uuid references public.accounts(id) on delete set null,
  next_payment_date date,
  payoff_strategy text not null default 'minimum' check (payoff_strategy in ('minimum', 'avalanche', 'snowball', 'custom')),
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'assets_linked_loan_id_fkey'
  ) then
    alter table public.assets
      add constraint assets_linked_loan_id_fkey foreign key (linked_loan_id) references public.loans(id) on delete set null;
  end if;
end;
$$;

create table if not exists public.loan_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  loan_id uuid not null references public.loans(id) on delete cascade,
  transaction_id uuid references public.transactions(id) on delete set null,
  payment_date date not null,
  payment_amount numeric(14, 2) not null default 0,
  principal_amount numeric(14, 2) not null default 0,
  interest_amount numeric(14, 2) not null default 0,
  extra_payment_amount numeric(14, 2) not null default 0,
  remaining_balance_after_payment numeric(14, 2) not null default 0
);

create table if not exists public.receivables (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ower_type text not null check (ower_type in ('friend', 'family', 'tenant', 'business_client', 'employer', 'third_party', 'other')),
  reason text not null check (reason in ('personal_loan_given', 'rent_receivable', 'business_invoice', 'shared_expense', 'deposit_refund', 'reimbursement', 'other')),
  person_or_entity text not null,
  amount_owed numeric(14, 2) not null default 0,
  amount_received numeric(14, 2) not null default 0,
  due_date date,
  payment_frequency text not null default 'one_time',
  notes text,
  status text not null default 'pending' check (status in ('pending', 'partially_paid', 'paid', 'overdue')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.income_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  income_type text not null,
  source text not null,
  amount numeric(14, 2) not null default 0,
  start_date date not null default current_date,
  end_date date,
  frequency text not null check (frequency in ('one_time', 'daily', 'weekly', 'every_2_weeks', 'twice_a_month', 'monthly', 'quarterly', 'yearly', 'custom')),
  receive_account_id uuid references public.accounts(id) on delete set null,
  receive_account_name text,
  taxable boolean not null default true,
  auto_create_forecast_entries boolean not null default true,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.survival_budget_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  expense_group text not null,
  expense_type text not null,
  total_amount numeric(14, 2) not null default 0,
  tenure_months integer not null check (tenure_months > 0),
  monthly_allocation numeric(14, 2) generated always as (round(total_amount / tenure_months, 2)) stored,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.future_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  plan_type text not null,
  target_amount numeric(14, 2) not null default 0,
  current_saved_amount numeric(14, 2) not null default 0,
  target_date date,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.category_nodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module text not null,
  group_name text not null,
  subgroup_name text,
  sub_subgroup_name text,
  item_name text,
  sort_order integer not null default 0,
  is_system_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null,
  method text not null default 'category' check (method in ('category', 'zero_based', 'fifty_thirty_twenty', 'envelope')),
  total_budget numeric(14, 2) not null default 0,
  total_actual numeric(14, 2) not null default 0,
  rollover_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month)
);

create table if not exists public.budget_lines (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  planned_amount numeric(14, 2) not null default 0,
  actual_amount numeric(14, 2) not null default 0,
  remaining_amount numeric(14, 2) not null default 0,
  kind text not null check (kind in ('fixed', 'flexible', 'debt', 'savings')),
  status text not null default 'good' check (status in ('good', 'watch', 'over')),
  rollover_amount numeric(14, 2) not null default 0
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('emergency_fund', 'debt_payoff', 'house', 'car', 'vacation', 'retirement', 'education', 'investment', 'custom')),
  target_amount numeric(14, 2) not null default 0,
  current_amount numeric(14, 2) not null default 0,
  monthly_contribution numeric(14, 2) not null default 0,
  target_date date,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  linked_account_id uuid references public.accounts(id) on delete set null,
  linked_loan_id uuid references public.loans(id) on delete set null,
  status text not null default 'on_track' check (status in ('on_track', 'behind', 'completed', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  transaction_id uuid references public.transactions(id) on delete set null,
  contribution_date date not null default current_date,
  amount numeric(14, 2) not null default 0,
  notes text
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type text not null check (type in ('bill', 'loan_payment', 'income_expected', 'insurance_renewal', 'subscription', 'goal_contribution', 'custom')),
  due_date date not null,
  amount numeric(14, 2),
  linked_transaction_id uuid references public.transactions(id) on delete set null,
  linked_loan_id uuid references public.loans(id) on delete set null,
  linked_goal_id uuid references public.goals(id) on delete set null,
  linked_document_id uuid references public.documents(id) on delete set null,
  recurrence text,
  status text not null default 'upcoming' check (status in ('upcoming', 'paid', 'missed', 'dismissed')),
  alert_level text not null default 'info' check (alert_level in ('info', 'warning', 'danger'))
);

create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  name text not null,
  symbol text,
  asset_class text not null check (asset_class in ('stock', 'etf', 'mutual_fund', 'crypto', 'bond', 'retirement', 'other')),
  quantity numeric(18, 8) not null default 0,
  average_cost numeric(14, 4) not null default 0,
  current_price numeric(14, 4) not null default 0,
  current_value numeric(14, 2) not null default 0,
  gain_loss_amount numeric(14, 2) not null default 0,
  gain_loss_percent numeric(8, 4) not null default 0,
  dividend_income_ytd numeric(14, 2) not null default 0,
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high')),
  last_updated date not null default current_date
);

create table if not exists public.forecast_scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  scenario_type text not null check (scenario_type in ('base_case', 'pay_debt_faster', 'invest_more', 'buy_house', 'reduce_expenses', 'increase_income', 'custom')),
  monthly_income_change numeric(14, 2) not null default 0,
  monthly_expense_change numeric(14, 2) not null default 0,
  extra_debt_payment numeric(14, 2) not null default 0,
  extra_investment numeric(14, 2) not null default 0,
  one_time_purchase numeric(14, 2) not null default 0,
  assumed_return_percent numeric(7, 4) not null default 0,
  inflation_percent numeric(7, 4) not null default 0,
  years integer not null default 5,
  projected_net_worth numeric(14, 2) not null default 0,
  projected_debt_left numeric(14, 2) not null default 0,
  projected_cash_flow numeric(14, 2) not null default 0,
  risk_level text not null default 'medium',
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_type text not null,
  date_range_start date not null,
  date_range_end date not null,
  format text not null check (format in ('pdf', 'csv', 'excel')),
  file_url text,
  status text not null default 'generated' check (status in ('generated', 'failed', 'processing')),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  answer text not null,
  data_snapshot_json jsonb not null default '{}',
  assumptions_json jsonb not null default '{}',
  disclaimer_shown boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_value_json jsonb,
  new_value_json jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  category text not null,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_review', 'resolved')),
  created_at timestamptz not null default now()
);

create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists accounts_user_id_idx on public.accounts(user_id);
create index if not exists transactions_user_date_idx on public.transactions(user_id, date desc);
create index if not exists income_sources_user_id_idx on public.income_sources(user_id);
create index if not exists categories_user_kind_idx on public.categories(user_id, kind);
create index if not exists assets_user_id_idx on public.assets(user_id);
create index if not exists loans_user_id_idx on public.loans(user_id);
create index if not exists loan_payments_user_loan_idx on public.loan_payments(user_id, loan_id);
create index if not exists receivables_user_due_idx on public.receivables(user_id, due_date);
create index if not exists income_rules_user_start_idx on public.income_rules(user_id, start_date);
create index if not exists survival_budget_plans_user_id_idx on public.survival_budget_plans(user_id);
create index if not exists future_plans_user_target_idx on public.future_plans(user_id, target_date);
create index if not exists category_nodes_user_module_idx on public.category_nodes(user_id, module);
create index if not exists budgets_user_month_idx on public.budgets(user_id, month);
create index if not exists budget_lines_user_budget_idx on public.budget_lines(user_id, budget_id);
create index if not exists goals_user_id_idx on public.goals(user_id);
create index if not exists reminders_user_due_date_idx on public.reminders(user_id, due_date);
create index if not exists investments_user_id_idx on public.investments(user_id);
create index if not exists documents_user_id_idx on public.documents(user_id);
create index if not exists reports_user_created_idx on public.reports(user_id, created_at desc);
create index if not exists ai_conversations_user_created_idx on public.ai_conversations(user_id, created_at desc);
create index if not exists audit_logs_user_created_idx on public.audit_logs(user_id, created_at desc);
create index if not exists contact_messages_created_idx on public.contact_messages(created_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'accounts',
    'categories',
    'transactions',
    'income_sources',
    'assets',
    'loans',
    'loan_payments',
    'receivables',
    'income_rules',
    'survival_budget_plans',
    'future_plans',
    'category_nodes',
    'budgets',
    'budget_lines',
    'goals',
    'goal_contributions',
    'reminders',
    'investments',
    'forecast_scenarios',
    'documents',
    'reports',
    'ai_conversations',
    'audit_logs'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_select_own', table_name);
    execute format('create policy %I on public.%I for select using (user_id = auth.uid())', table_name || '_select_own', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_insert_own', table_name);
    execute format('create policy %I on public.%I for insert with check (user_id = auth.uid())', table_name || '_insert_own', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_update_own', table_name);
    execute format('create policy %I on public.%I for update using (user_id = auth.uid()) with check (user_id = auth.uid())', table_name || '_update_own', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_delete_own', table_name);
    execute format('create policy %I on public.%I for delete using (user_id = auth.uid())', table_name || '_delete_own', table_name);
  end loop;
end;
$$;

alter table public.contact_messages enable row level security;

drop policy if exists contact_messages_insert_public on public.contact_messages;
create policy contact_messages_insert_public on public.contact_messages
for insert with check (true);

drop policy if exists contact_messages_select_own on public.contact_messages;
create policy contact_messages_select_own on public.contact_messages
for select using (user_id = auth.uid());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'accounts',
    'categories',
    'transactions',
    'income_sources',
    'assets',
    'loans',
    'receivables',
    'income_rules',
    'survival_budget_plans',
    'future_plans',
    'category_nodes',
    'budgets',
    'budget_lines',
    'goals'
  ]
  loop
    execute format('drop trigger if exists %I on public.%I', 'set_' || table_name || '_updated_at', table_name);
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', 'set_' || table_name || '_updated_at', table_name);
  end loop;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, email, country, currency)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    coalesce(new.raw_user_meta_data ->> 'country', 'United States'),
    coalesce(new.raw_user_meta_data ->> 'currency', 'USD')
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
