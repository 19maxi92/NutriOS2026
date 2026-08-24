-- ============================================================
-- RLS HARDENING V2 — correr DESPUÉS de rls_hardening.sql.
-- Cubre las tablas sumadas en este batch: recetas, registro
-- alimentario y base de alimentos (que hasta ahora no tenían RLS
-- habilitado en absoluto).
-- ============================================================

-- ---------- registro alimentario: solo staff clínico ----------
alter table public.food_diary_entries enable row level security;
create policy "food_diary: clinical staff only" on public.food_diary_entries
  for all using (public.is_clinical_staff()) with check (public.is_clinical_staff());

-- ---------- recetas: cualquier autenticado lee, solo staff clínico escribe ----------
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;

create policy "recipes: authenticated read" on public.recipes
  for select using (auth.role() = 'authenticated');
create policy "recipes: clinical staff write" on public.recipes
  for insert with check (public.is_clinical_staff());
create policy "recipes: clinical staff update" on public.recipes
  for update using (public.is_clinical_staff());
create policy "recipes: clinical staff delete" on public.recipes
  for delete using (public.is_clinical_staff());

create policy "recipe_ingredients: authenticated read" on public.recipe_ingredients
  for select using (auth.role() = 'authenticated');
create policy "recipe_ingredients: clinical staff write" on public.recipe_ingredients
  for insert with check (public.is_clinical_staff());

-- ---------- base de alimentos: lectura abierta a cualquier autenticado ----------
-- (referencia científica compartida, no dato de paciente — no necesita restricción por rol)
alter table public.foods enable row level security;
alter table public.food_nutrients enable row level security;
alter table public.food_sources enable row level security;
alter table public.nutrients enable row level security;
alter table public.household_measures enable row level security;

create policy "foods: authenticated read" on public.foods for select using (auth.role() = 'authenticated');
create policy "food_nutrients: authenticated read" on public.food_nutrients for select using (auth.role() = 'authenticated');
create policy "food_sources: authenticated read" on public.food_sources for select using (auth.role() = 'authenticated');
create policy "nutrients: authenticated read" on public.nutrients for select using (auth.role() = 'authenticated');
create policy "household_measures: authenticated read" on public.household_measures for select using (auth.role() = 'authenticated');

-- ---------- permitir que un admin gestione el rol de cualquier perfil ----------
-- (antes, "profiles: self update" solo dejaba a cada usuario editar su propio perfil;
-- la pantalla de Configuración necesita que un admin pueda cambiar el rol de otros)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles: admin update any" on public.profiles
  for update using (public.is_admin());
