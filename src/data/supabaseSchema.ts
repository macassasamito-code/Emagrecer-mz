export const SUPABASE_POSTGRES_SCHEMA_SQL = `-- ============================================================================
-- CORPOFIT MZ — ESQUEMA POSTGRESQL / SUPABASE (PRODUÇÃO)
-- Moeda: Meticais (MZN) | Pagamentos: M-Pesa (Vodacom) & e-Mola (Movitel)
-- ============================================================================

create extension if not exists "uuid-ossp";

-- 1. TABELA DE UTILIZADORES (Sincronizada com Supabase Auth)
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  phone_mz text not null, -- Ex: +258 84 123 4567 ou +258 86 987 6543
  full_name text not null,
  province text default 'Maputo Cidade',
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

-- 2. TABELA DE PERFIS BIOMÉTRICOS & METAS (Onboarding / Calculadora)
create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade unique,
  age int not null check (age between 16 and 95),
  gender text not null check (gender in ('female', 'male')),
  current_weight_kg numeric(5,2) not null,
  height_cm numeric(5,2) not null,
  target_weight_kg numeric(5,2) not null,
  activity_level text not null check (activity_level in ('sedentary', 'light', 'moderate', 'active')),
  focus_goal text not null check (focus_goal in ('abdomen', 'general', 'glutes_legs')),
  bmr_kcal int not null,
  safe_deficit_kcal int not null,
  daily_calories_kcal int not null,
  daily_protein_grams int not null,
  daily_water_glasses int not null default 10,
  updated_at timestamptz not null default now()
);

-- 3. TABELA DE PLANOS PERSONALIZADOS (Nutrição Moçambicana & Treino em Casa)
create table public.plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan_date date not null default current_date,
  meals_json jsonb not null, -- Pequeno-almoço, Almoço, Lanche, Jantar (Mandioca, Peixe, Nhemba, Matapa)
  workout_json jsonb not null, -- Exercícios funcionais sem equipamento
  completed_meal_ids text[] default '{}',
  completed_exercise_ids text[] default '{}',
  water_glasses_logged int not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, plan_date)
);

-- 4. TABELA DA COMUNIDADE ("Mural da Tribo")
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  author_name text not null,
  author_city text not null default 'Maputo',
  category text not null check (category in ('prato_saudavel', 'pesagem_semanal', 'treino_concluido', 'motivacao')),
  content text not null,
  weight_delta_kg numeric(4,1),
  dish_tag text,
  reactions_clap int not null default 0,
  reactions_fire int not null default 0,
  reactions_heart int not null default 0,
  comments_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- 5. TABELA DE ASSINATURAS & MENSALIDADES (M-Pesa / e-Mola)
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade unique,
  status text not null default 'active' check (status in ('active', 'pending', 'suspended', 'expired')),
  plan_name text not null default 'Plano Mensal Tribo Fit MZ',
  amount_mzn numeric(10,2) not null default 450.00,
  payment_method text not null check (payment_method in ('M-Pesa', 'e-Mola')),
  last_payment_reference text,
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default (now() + interval '30 days'),
  updated_at timestamptz not null default now()
);

-- Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.posts enable row level security;
alter table public.subscriptions enable row level security;
`;
