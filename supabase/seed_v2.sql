-- ============================================================
-- SEED V2 — correr DESPUÉS de seed.sql, no lo reemplaza.
-- Agrega más alimentos (para que el constructor de plan tenga variedad)
-- y turnos de ejemplo para los pacientes ya cargados.
-- ============================================================

-- Nutrientes ya existen (Energía/Proteínas/Carbohidratos/Grasas) — reutilizamos sus ids
-- consultando por nombre en vez de hardcodear UUIDs.

do $$
declare
  usda_id uuid;
  latinfoods_id uuid;
  n_kcal uuid; n_prot uuid; n_carb uuid; n_fat uuid;
  f_banana uuid; f_oliva uuid; f_avena uuid;
begin
  select id into usda_id from public.food_sources where name = 'USDA FoodData Central';
  select id into latinfoods_id from public.food_sources where name = 'LATINFOODS';
  select id into n_kcal from public.nutrients where name = 'Energía';
  select id into n_prot from public.nutrients where name = 'Proteínas';
  select id into n_carb from public.nutrients where name = 'Carbohidratos';
  select id into n_fat  from public.nutrients where name = 'Grasas';

  insert into public.foods (id, name, food_source_id) values
    (uuid_generate_v4(), 'Banana', usda_id),
    (uuid_generate_v4(), 'Aceite de oliva', usda_id),
    (uuid_generate_v4(), 'Avena arrollada', latinfoods_id);

  select id into f_banana from public.foods where name = 'Banana' and food_source_id = usda_id;
  select id into f_oliva  from public.foods where name = 'Aceite de oliva' and food_source_id = usda_id;
  select id into f_avena  from public.foods where name = 'Avena arrollada' and food_source_id = latinfoods_id;

  insert into public.food_nutrients (food_id, nutrient_id, value_per_100g) values
    (f_banana, n_kcal, 89), (f_banana, n_prot, 1.1), (f_banana, n_carb, 22.8), (f_banana, n_fat, 0.3),
    (f_oliva, n_kcal, 884), (f_oliva, n_prot, 0),   (f_oliva, n_carb, 0),    (f_oliva, n_fat, 100),
    (f_avena, n_kcal, 389), (f_avena, n_prot, 16.9), (f_avena, n_carb, 66.3), (f_avena, n_fat, 6.9);
end $$;

-- Turnos de ejemplo para hoy, usando los pacientes cargados en seed.sql
insert into public.appointments (patient_id, starts_at, ends_at, type, modality, status)
select id, (current_date + time '09:00')::timestamptz, (current_date + time '09:30')::timestamptz,
       'control', 'presencial', 'confirmado'
from public.patients where dni = '32451221'
union all
select id, (current_date + time '11:00')::timestamptz, (current_date + time '11:30')::timestamptz,
       'seguimiento', 'virtual', 'confirmado'
from public.patients where dni = '29884110'
union all
select id, (current_date + time '15:30')::timestamptz, (current_date + time '16:00')::timestamptz,
       'primera', 'presencial', 'solicitado'
from public.patients where dni = '38221904';
