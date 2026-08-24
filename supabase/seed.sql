-- ============================================================
-- SEED DE DATOS DEMO
-- Ejecutar después de schema.sql y después de crear el usuario admin
-- en Authentication > Users (ver README). Reemplazar <ADMIN_USER_ID>
-- por el UUID real de ese usuario antes de correr este script.
-- ============================================================

-- 1) Perfil del usuario admin (el usuario ya debe existir en auth.users)
insert into public.profiles (id, full_name, role, license_number)
values ('<1bbc729b-5fa0-4e80-a26f-caebbeca9245>', 'Lic. Demo', 'admin', 'MN-00000')
on conflict (id) do nothing;

-- 2) Fuentes de composición de alimentos
insert into public.food_sources (id, name, version, url, license_note) values
  ('11111111-1111-1111-1111-111111111111', 'SARA 2', '2022', 'https://bancos.salud.gob.ar', 'Uso libre y gratuito, Ministerio de Salud de la Nación'),
  ('22222222-2222-2222-2222-222222222222', 'USDA FoodData Central', '2025', 'https://fdc.nal.usda.gov', 'Dominio público'),
  ('33333333-3333-3333-3333-333333333333', 'LATINFOODS', '2024', 'https://www.latinfoodsportal.net', 'Citar fuente obligatorio, no comercializable sin autorización');

-- 3) Nutrientes base
insert into public.nutrients (id, name, unit) values
  ('a1111111-0000-0000-0000-000000000001', 'Energía', 'kcal'),
  ('a1111111-0000-0000-0000-000000000002', 'Proteínas', 'g'),
  ('a1111111-0000-0000-0000-000000000003', 'Carbohidratos', 'g'),
  ('a1111111-0000-0000-0000-000000000004', 'Grasas', 'g');

-- 4) Alimentos de ejemplo (SARA 2)
insert into public.foods (id, name, food_source_id) values
  ('b1111111-0000-0000-0000-000000000001', 'Arroz blanco cocido', '11111111-1111-1111-1111-111111111111'),
  ('b1111111-0000-0000-0000-000000000002', 'Pechuga de pollo grillada', '11111111-1111-1111-1111-111111111111'),
  ('b1111111-0000-0000-0000-000000000003', 'Banana', '11111111-1111-1111-1111-111111111111'),
  ('b1111111-0000-0000-0000-000000000004', 'Huevo entero', '11111111-1111-1111-1111-111111111111');

insert into public.food_nutrients (food_id, nutrient_id, value_per_100g) values
  ('b1111111-0000-0000-0000-000000000001','a1111111-0000-0000-0000-000000000001', 130),
  ('b1111111-0000-0000-0000-000000000001','a1111111-0000-0000-0000-000000000002', 2.4),
  ('b1111111-0000-0000-0000-000000000001','a1111111-0000-0000-0000-000000000003', 28.2),
  ('b1111111-0000-0000-0000-000000000001','a1111111-0000-0000-0000-000000000004', 0.3),
  ('b1111111-0000-0000-0000-000000000002','a1111111-0000-0000-0000-000000000001', 165),
  ('b1111111-0000-0000-0000-000000000002','a1111111-0000-0000-0000-000000000002', 31.0),
  ('b1111111-0000-0000-0000-000000000002','a1111111-0000-0000-0000-000000000003', 0),
  ('b1111111-0000-0000-0000-000000000002','a1111111-0000-0000-0000-000000000004', 3.6);

-- 5) Pacientes de ejemplo
insert into public.patients (first_name, last_name, dni, birth_date, sex, phone, health_insurance) values
  ('Juan', 'Pérez', '32451221', '1992-03-14', 'M', '+54 11 5555-0001', 'OSDE'),
  ('María', 'Gómez', '29884110', '1985-07-02', 'F', '+54 11 5555-0002', 'Swiss Medical'),
  ('Pedro', 'López', '38221904', '1999-11-20', 'M', '+54 11 5555-0003', 'IOMA'),
  ('Lucía', 'Fernández', '41002774', '2003-01-09', 'F', '+54 11 5555-0004', 'Particular');
