-- ============================================================
-- RLS HARDENING — correr DESPUÉS de schema.sql y seed.sql.
-- Reemplaza las políticas permisivas ("cualquier autenticado ve todo")
-- por reglas por rol: recepción puede ver pacientes y agenda, pero
-- NO historia clínica, laboratorios, antropometría ni diagnósticos
-- (Master Planner, sección 34).
-- ============================================================

-- Función helper: ¿el usuario actual es admin o nutricionista?
create or replace function public.is_clinical_staff()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'nutricionista')
  );
$$;

-- ---------- historia clínica: solo staff clínico ----------
drop policy if exists "clinical_records: authenticated all" on public.clinical_records;
create policy "clinical_records: clinical staff only" on public.clinical_records
  for all using (public.is_clinical_staff()) with check (public.is_clinical_staff());

drop policy if exists "clinical_record_entries: authenticated all" on public.clinical_record_entries;
create policy "clinical_record_entries: clinical staff only" on public.clinical_record_entries
  for all using (public.is_clinical_staff()) with check (public.is_clinical_staff());

-- ---------- antropometría, laboratorios, bioimpedancia, DEXA, documentos ----------
alter table public.lab_results enable row level security;
alter table public.bioimpedance_records enable row level security;
alter table public.dexa_records enable row level security;
alter table public.documents enable row level security;
alter table public.anamnesis_responses enable row level security;
alter table public.meal_plans enable row level security;

drop policy if exists "anthropometry: authenticated all" on public.anthropometry_records;
create policy "anthropometry: clinical staff only" on public.anthropometry_records
  for all using (public.is_clinical_staff()) with check (public.is_clinical_staff());

create policy "lab_results: clinical staff only" on public.lab_results
  for all using (public.is_clinical_staff()) with check (public.is_clinical_staff());

create policy "bioimpedance: clinical staff only" on public.bioimpedance_records
  for all using (public.is_clinical_staff()) with check (public.is_clinical_staff());

create policy "dexa: clinical staff only" on public.dexa_records
  for all using (public.is_clinical_staff()) with check (public.is_clinical_staff());

create policy "documents: clinical staff only" on public.documents
  for all using (public.is_clinical_staff()) with check (public.is_clinical_staff());

create policy "anamnesis: clinical staff only" on public.anamnesis_responses
  for all using (public.is_clinical_staff()) with check (public.is_clinical_staff());

drop policy if exists "meal_plans: authenticated all" on public.meal_plans;
create policy "meal_plans: clinical staff only" on public.meal_plans
  for all using (public.is_clinical_staff()) with check (public.is_clinical_staff());

-- ---------- pacientes y agenda: siguen visibles para todo el staff autenticado ----------
-- (recepción necesita ver nombre/teléfono para gestionar turnos; el campo "notes" de
-- patients queda expuesto por ahora — en un endurecimiento futuro conviene separarlo
-- a una tabla aparte solo accesible por staff clínico).
-- patients: authenticated all  -> sin cambios
-- appointments: authenticated all -> sin cambios

-- ---------- auditoría: todos pueden ver, nadie puede borrar ----------
-- ya estaba así (solo insert + select), se mantiene.

-- NOTA: para probar esto de verdad hace falta un segundo usuario con role='recepcion'
-- en la tabla profiles. Crear el usuario en Authentication > Users, y luego:
--   update public.profiles set role = 'recepcion' where id = '<UUID del usuario>';
