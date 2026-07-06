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

create table if not exists public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  country text default 'United States',
  currency text default 'USD',
  timezone text default 'America/Chicago',
  focus_area text default 'All',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('bank', 'credit_card', 'cash', 'wallet', 'investment', 'loan', 'other')),
  institution text,
  currency text not null default 'USD',
  opening_balance numeric(14, 2) not null default 0,
  current_balance numeric(14, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  parent_name text,
  monthly_target numeric(14, 2),
  color text default 'emerald',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.income_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'salary',
  expected_amount numeric(14, 2) not null default 0,
  frequency text not null default 'monthly',
  next_pay_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  transfer_account_id uuid references public.accounts(id) on delete set null,
  occurred_on date not null default current_date,
  type text not null check (type in ('income', 'expense', 'transfer')),
  category text,
  merchant text,
  source text,
  amount numeric(14, 2) not null,
  method text,
  status text not null default 'cleared' check (status in ('cleared', 'pending')),
  notes text,
  tags text[] not null default '{}',
  recurring_rule text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  purchase_value numeric(14, 2) not null default 0,
  current_value numeric(14, 2) not null default 0,
  annual_growth_rate numeric(6, 3) not null default 0,
  as_of_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  original_balance numeric(14, 2) not null default 0,
  current_balance numeric(14, 2) not null default 0,
  interest_rate numeric(7, 4) not null default 0,
  monthly_payment numeric(14, 2) not null default 0,
  due_day integer check (due_day between 1 and 31),
  start_date date,
  payoff_target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null,
  category text not null,
  planned_amount numeric(14, 2) not null default 0,
  actual_amount numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month, category)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'savings',
  target_amount numeric(14, 2) not null default 0,
  current_amount numeric(14, 2) not null default 0,
  monthly_contribution numeric(14, 2) not null default 0,
  target_date date,
  priority text not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type text not null default 'bill',
  due_date date not null,
  amount numeric(14, 2),
  linked_table text,
  linked_id uuid,
  is_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  document_type text not null default 'other',
  storage_path text not null,
  linked_table text,
  linked_id uuid,
  expires_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forecasts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  scenario_type text not null default 'custom',
  assumptions jsonb not null default '{}',
  result jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  table_name text not null,
  record_id uuid,
  changes jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.support_inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  subject text not null,
  category text not null default 'Product support',
  message text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists accounts_user_id_idx on public.accounts(user_id);
create index if not exists expense_categories_user_id_idx on public.expense_categories(user_id);
create index if not exists income_sources_user_id_idx on public.income_sources(user_id);
create index if not exists transactions_user_date_idx on public.transactions(user_id, occurred_on desc);
create index if not exists transactions_account_id_idx on public.transactions(account_id);
create index if not exists assets_user_id_idx on public.assets(user_id);
create index if not exists loans_user_id_idx on public.loans(user_id);
create index if not exists budgets_user_month_idx on public.budgets(user_id, month);
create index if not exists goals_user_id_idx on public.goals(user_id);
create index if not exists reminders_user_due_date_idx on public.reminders(user_id, due_date);
create index if not exists documents_user_id_idx on public.documents(user_id);
create index if not exists forecasts_user_id_idx on public.forecasts(user_id);
create index if not exists audit_logs_user_created_idx on public.audit_logs(user_id, created_at desc);
create index if not exists support_inquiries_created_idx on public.support_inquiries(created_at desc);

alter table public.users_profile enable row level security;

drop policy if exists "profiles_select_own" on public.users_profile;
create policy "profiles_select_own" on public.users_profile
for select using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.users_profile;
create policy "profiles_insert_own" on public.users_profile
for insert with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.users_profile;
create policy "profiles_update_own" on public.users_profile
for update using (id = auth.uid()) with check (id = auth.uid());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'accounts',
    'expense_categories',
    'income_sources',
    'transactions',
    'assets',
    'loans',
    'budgets',
    'goals',
    'reminders',
    'documents',
    'forecasts',
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

alter table public.support_inquiries enable row level security;

drop policy if exists "support_insert_public" on public.support_inquiries;
create policy "support_insert_public" on public.support_inquiries
for insert with check (true);

drop policy if exists "support_select_own" on public.support_inquiries;
create policy "support_select_own" on public.support_inquiries
for select using (user_id = auth.uid());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'users_profile',
    'accounts',
    'expense_categories',
    'income_sources',
    'transactions',
    'assets',
    'loans',
    'budgets',
    'goals',
    'reminders',
    'documents',
    'forecasts'
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
  insert into public.users_profile (id, full_name, country, currency, focus_area)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'country', 'United States'),
    coalesce(new.raw_user_meta_data ->> 'currency', 'USD'),
    coalesce(new.raw_user_meta_data ->> 'tracking_focus', 'All')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
