-- ============================================================
-- CONSULTORIO NUTRICIONAL — ESQUEMA SUPABASE (MVP 1 demo)
-- Basado en el modelo de datos definido en Sprint 0 (00-SPRINT-0.md)
-- Ejecutar en el SQL Editor de Supabase, en orden.
-- ============================================================

-- ---------- extensiones ----------
create extension if not exists "uuid-ossp";

-- ---------- roles y usuarios ----------
-- Supabase Auth ya maneja auth.users. Extendemos con perfil + rol.
create type user_role as enum ('admin', 'nutricionista', 'recepcion');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'nutricionista',
  license_number text,
  created_at timestamptz not null default now()
);

-- ---------- pacientes ----------
create table public.patients (
  id uuid primary key default uuid_generate_v4(),
  owner_user_id uuid references public.profiles(id),
  first_name text not null,
  last_name text not null,
  dni text,
  birth_date date,
  sex text check (sex in ('M','F','X')),
  phone text,
  email text,
  address text,
  emergency_contact text,
  health_insurance text,
  occupation text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- historia clínica (append-only) ----------
create table public.clinical_records (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.clinical_record_entries (
  id uuid primary key default uuid_generate_v4(),
  clinical_record_id uuid not null references public.clinical_records(id) on delete cascade,
  author_id uuid references public.profiles(id),
  entry_type text not null, -- 'nota' | 'cambio' | 'apertura' | 'documento'
  content_json jsonb not null default '{}',
  is_locked boolean not null default false,
  is_voided boolean not null default false,
  void_reason text,
  created_at timestamptz not null default now()
);

-- ---------- auditoría (obligatoria, Ley 26.529 / 25.326) ----------
create table public.audit_log (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.profiles(id),
  action text not null check (action in ('VIEW','CREATE','UPDATE','DELETE','EXPORT','DOWNLOAD','LOGIN','LOGOUT')),
  entity_type text not null,
  entity_id uuid,
  field_changed text,
  old_value text,
  new_value text,
  at timestamptz not null default now(),
  ip text
);

-- ---------- anamnesis ----------
create table public.anamnesis_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  sections_json jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table public.anamnesis_responses (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  template_id uuid references public.anamnesis_templates(id),
  answers_json jsonb not null default '{}',
  completed_at timestamptz
);

-- ---------- antropometría ----------
create table public.anthropometry_records (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  protocol text not null default 'ISAK', -- ISAK1 | ISAK2 | ISAK3 | otro
  measured_by uuid references public.profiles(id),
  measured_at timestamptz not null default now(),
  raw_measurements_json jsonb not null default '{}', -- peso, talla, pliegues, perimetros, diametros
  source text not null default 'manual' check (source in ('manual','documento')),
  is_closed boolean not null default false
);

create table public.anthropometry_calculations (
  id uuid primary key default uuid_generate_v4(),
  anthropometry_record_id uuid not null references public.anthropometry_records(id) on delete cascade,
  formula_name text not null,
  formula_author text,
  formula_year int,
  population text,
  result_value numeric,
  unit text
);

-- ---------- bioimpedancia / DEXA ----------
create table public.bioimpedance_records (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  device text, -- InBody | SECA | otro
  measured_at timestamptz not null default now(),
  raw_data_json jsonb not null default '{}',
  source text not null default 'manual' check (source in ('manual','pdf','csv','api'))
);

create table public.dexa_records (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  center text,
  equipment text,
  measured_at timestamptz not null default now(),
  fat_mass numeric, lean_mass numeric, bone_mass numeric,
  bmd numeric, t_score numeric, z_score numeric,
  visceral_fat numeric,
  regional_json jsonb default '{}'
);

-- ---------- laboratorios y documentos (motor genérico) ----------
create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  type text not null, -- laboratorio | dexa | inbody | antropometria | informe | receta | estudio
  origin text,
  file_url text,
  ocr_text text,
  extracted_json jsonb default '{}',
  uploaded_by uuid references public.profiles(id),
  uploaded_at timestamptz not null default now(),
  validated_by uuid references public.profiles(id),
  validated_at timestamptz
);

create table public.lab_results (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid references public.documents(id) on delete set null,
  patient_id uuid not null references public.patients(id) on delete cascade,
  analyte text not null,
  raw_value text,
  unit text,
  reference_range text,
  normalized_value numeric,
  result_date date,
  confidence numeric, -- 0..1, score de extracción por IA
  validated_by uuid references public.profiles(id),
  validated_at timestamptz
);

-- ---------- base de alimentos (con trazabilidad de fuente) ----------
create table public.food_sources (
  id uuid primary key default uuid_generate_v4(),
  name text not null,        -- 'SARA 2' | 'USDA FoodData Central' | 'LATINFOODS' | ...
  version text,
  url text,
  license_note text
);

create table public.foods (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  food_source_id uuid references public.food_sources(id),
  external_code text
);

create table public.nutrients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  unit text not null
);

create table public.food_nutrients (
  id uuid primary key default uuid_generate_v4(),
  food_id uuid not null references public.foods(id) on delete cascade,
  nutrient_id uuid not null references public.nutrients(id) on delete cascade,
  value_per_100g numeric not null
);

create table public.household_measures (
  id uuid primary key default uuid_generate_v4(),
  food_id uuid not null references public.foods(id) on delete cascade,
  description text not null, -- 'banana mediana'
  grams_equivalent numeric not null
);

create table public.recipes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_by uuid references public.profiles(id),
  servings int default 1
);

create table public.recipe_ingredients (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  food_id uuid not null references public.foods(id),
  quantity numeric not null,
  unit text not null
);

-- ---------- plan alimentario ----------
create table public.meal_plans (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  created_by uuid references public.profiles(id),
  name text not null default 'Plan alimentario',
  start_date date default current_date,
  status text not null default 'borrador' check (status in ('borrador','activo','archivado')),
  created_at timestamptz not null default now()
);

create table public.meal_plan_days (
  id uuid primary key default uuid_generate_v4(),
  meal_plan_id uuid not null references public.meal_plans(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6)
);

create table public.meal_plan_meals (
  id uuid primary key default uuid_generate_v4(),
  meal_plan_day_id uuid not null references public.meal_plan_days(id) on delete cascade,
  meal_type text not null check (meal_type in ('desayuno','media_manana','almuerzo','merienda','cena'))
);

create table public.meal_plan_items (
  id uuid primary key default uuid_generate_v4(),
  meal_plan_meal_id uuid not null references public.meal_plan_meals(id) on delete cascade,
  food_id uuid references public.foods(id),
  recipe_id uuid references public.recipes(id),
  quantity numeric not null,
  unit text not null default 'g',
  household_measure_id uuid references public.household_measures(id),
  notes text,
  check (food_id is not null or recipe_id is not null)
);

-- ---------- agenda ----------
create table public.appointments (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  nutricionista_id uuid references public.profiles(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  type text not null default 'control' check (type in ('primera','control','seguimiento')),
  modality text not null default 'presencial' check (modality in ('presencial','virtual')),
  status text not null default 'solicitado'
    check (status in ('solicitado','confirmado','asistio','cancelado','ausente','reprogramado'))
);

-- ---------- registro alimentario y seguimiento ----------
create table public.food_diary_entries (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  logged_at timestamptz not null default now(),
  meal_type text,
  description text,
  photo_url text,
  hunger int,
  satiety int,
  notes text
);

create table public.follow_up_snapshots (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  date date not null default current_date,
  weight numeric,
  waist numeric,
  body_fat_pct numeric,
  muscle_mass numeric,
  source_ref text
);

-- ============================================================
-- ROW LEVEL SECURITY — mínimo indispensable para la demo
-- ============================================================
alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.clinical_records enable row level security;
alter table public.clinical_record_entries enable row level security;
alter table public.audit_log enable row level security;
alter table public.anthropometry_records enable row level security;
alter table public.meal_plans enable row level security;
alter table public.appointments enable row level security;

-- Un usuario autenticado puede ver/editar su propio perfil
create policy "profiles: self read" on public.profiles for select using (auth.uid() = id);
create policy "profiles: self update" on public.profiles for update using (auth.uid() = id);

-- Cualquier usuario autenticado del consultorio puede operar sobre pacientes
-- (en producción esto se restringe por owner_user_id / rol; simplificado para la demo)
create policy "patients: authenticated all" on public.patients
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "clinical_records: authenticated all" on public.clinical_records
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "clinical_record_entries: authenticated all" on public.clinical_record_entries
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "audit_log: authenticated read" on public.audit_log
  for select using (auth.role() = 'authenticated');
create policy "audit_log: authenticated insert" on public.audit_log
  for insert with check (auth.role() = 'authenticated');

create policy "anthropometry: authenticated all" on public.anthropometry_records
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "meal_plans: authenticated all" on public.meal_plans
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "appointments: authenticated all" on public.appointments
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- NOTA IMPORTANTE: estas políticas son deliberadamente permisivas (cualquier usuario
-- autenticado ve todo) para que la demo funcione rápido con un único usuario admin.
-- Antes de manejar pacientes reales, hay que endurecer esto por owner_user_id y rol
-- (recepción no debe poder leer historia clínica / laboratorios / diagnósticos, según
-- Master Planner sección 34).
