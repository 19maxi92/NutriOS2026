-- ============================================================
-- SEED V3 — datos "de verdad" para poder mostrar la demo con
-- historial real. Correr DESPUÉS de seed.sql y seed_v2.sql.
-- Rellena a Juan Pérez y María Gómez con 8 semanas de evolución,
-- laboratorio, bioimpedancia, DEXA, anamnesis y un plan armado.
-- ============================================================

do $$
declare
  juan_id uuid;
  maria_id uuid;
  admin_id uuid;
  cr_id uuid;
  i int;
  w numeric;
  waist numeric;
  rec_id uuid;
  plan_id uuid;
  day_id uuid;
  meal_id uuid;
  f_pollo uuid; f_arroz uuid; f_huevo uuid; f_banana uuid; f_avena uuid; f_oliva uuid;
begin
  select id into juan_id from public.patients where dni = '32451221';
  select id into maria_id from public.patients where dni = '29884110';
  select id into admin_id from public.profiles where role = 'admin' limit 1;

  select id into f_pollo from public.foods where name = 'Pechuga de pollo grillada';
  select id into f_arroz from public.foods where name = 'Arroz blanco cocido';
  select id into f_huevo from public.foods where name = 'Huevo entero';
  select id into f_banana from public.foods where name = 'Banana';
  select id into f_avena from public.foods where name = 'Avena arrollada';
  select id into f_oliva from public.foods where name = 'Aceite de oliva';

  if juan_id is null or maria_id is null then
    raise notice 'No se encontraron los pacientes de ejemplo (¿corriste seed.sql?). Abortando.';
    return;
  end if;

  -- ---------- JUAN PÉREZ: 8 semanas de antropometría en descenso leve ----------
  w := 84.5;
  waist := 92;
  for i in 0..7 loop
    insert into public.anthropometry_records (patient_id, protocol, measured_by, measured_at, raw_measurements_json, source, is_closed)
    values (juan_id, 'ISAK1', admin_id, now() - ((7 - i) * interval '1 week'),
            jsonb_build_object('weight', round(w,1), 'height', 178, 'waist', waist), 'manual', true)
    returning id into rec_id;

    insert into public.anthropometry_calculations (anthropometry_record_id, formula_name, formula_author, formula_year, population, result_value, unit)
    values (rec_id, 'Índice de Masa Corporal (IMC)', 'Quetelet', 1832, 'adultos', round(w / power(1.78,2), 1), 'kg/m2');

    insert into public.follow_up_snapshots (patient_id, date, weight, waist, body_fat_pct, muscle_mass, source_ref)
    values (juan_id, (now() - ((7 - i) * interval '1 week'))::date, round(w,1), waist, round(22 - i*0.3,1), round(36 + i*0.1,1), 'antropometria');

    w := w - 0.35;
    waist := waist - 0.4;
  end loop;

  -- laboratorio de Juan
  insert into public.lab_results (patient_id, analyte, raw_value, unit, reference_range, normalized_value, result_date, validated_by, validated_at) values
    (juan_id, 'Glucosa', '96', 'mg/dL', '70-100', 96, current_date - 10, admin_id, now()),
    (juan_id, 'Colesterol total', '188', 'mg/dL', '<200', 188, current_date - 10, admin_id, now()),
    (juan_id, 'HDL', '48', 'mg/dL', '>40', 48, current_date - 10, admin_id, now()),
    (juan_id, 'Triglicéridos', '110', 'mg/dL', '<150', 110, current_date - 10, admin_id, now()),
    (juan_id, 'Vitamina D', '27', 'ng/mL', '30-100', 27, current_date - 10, admin_id, now());

  -- bioimpedancia y DEXA de Juan
  insert into public.bioimpedance_records (patient_id, device, source, raw_data_json)
  values (juan_id, 'InBody', 'manual', jsonb_build_object('weight', 82.4, 'body_fat_pct', 19.8, 'muscle_mass', 37.1, 'visceral_fat', 9));

  insert into public.dexa_records (patient_id, center, measured_at, fat_mass, lean_mass, bone_mass, t_score, visceral_fat)
  values (juan_id, 'Centro de Diagnóstico Rossi', now() - interval '3 months', 16.2, 62.8, 3.1, 0.4, 88);

  -- anamnesis de Juan
  insert into public.anamnesis_responses (patient_id, answers_json, completed_at)
  values (juan_id, jsonb_build_object(
    'Motivo de consulta', 'Bajar % graso manteniendo masa muscular, entrena 4 veces por semana.',
    'Antecedentes patológicos', 'Sin antecedentes relevantes.',
    'Antecedentes familiares', 'Padre hipertenso.',
    'Medicación / suplementos', 'Whey protein, creatina.',
    'Alergias e intolerancias', 'Ninguna reportada.',
    'Hábitos y actividad física', 'Entrenamiento de fuerza 4x/semana, oficinista, buen descanso.',
    'Objetivos', 'Recomposición corporal en 4 meses.'
  ), now() - interval '2 months');

  -- historia clínica de Juan
  insert into public.clinical_records (patient_id, created_by, created_at)
  values (juan_id, admin_id, now() - interval '2 months')
  returning id into cr_id;

  insert into public.clinical_record_entries (clinical_record_id, author_id, entry_type, content_json, created_at) values
    (cr_id, admin_id, 'apertura', jsonb_build_object('texto', 'Apertura de historia clínica'), now() - interval '2 months'),
    (cr_id, admin_id, 'nota', jsonb_build_object('texto', 'Primera consulta: buen estado general, objetivo de recomposición corporal.'), now() - interval '2 months'),
    (cr_id, admin_id, 'nota', jsonb_build_object('texto', 'Control mensual: buena adherencia al plan, ajuste de porciones de carbohidrato post-entreno.'), now() - interval '3 weeks');

  -- plan alimentario completo para Juan (Lunes)
  insert into public.meal_plans (patient_id, created_by, name, status)
  values (juan_id, admin_id, 'Plan recomposición corporal', 'borrador')
  returning id into plan_id;

  insert into public.meal_plan_days (meal_plan_id, day_of_week) values (plan_id, 0) returning id into day_id;

  insert into public.meal_plan_meals (meal_plan_day_id, meal_type) values (day_id, 'desayuno') returning id into meal_id;
  insert into public.meal_plan_items (meal_plan_meal_id, food_id, quantity, unit) values
    (meal_id, f_avena, 60, 'g'), (meal_id, f_banana, 100, 'g');

  insert into public.meal_plan_meals (meal_plan_day_id, meal_type) values (day_id, 'almuerzo') returning id into meal_id;
  insert into public.meal_plan_items (meal_plan_meal_id, food_id, quantity, unit) values
    (meal_id, f_pollo, 180, 'g'), (meal_id, f_arroz, 200, 'g'), (meal_id, f_oliva, 10, 'g');

  insert into public.meal_plan_meals (meal_plan_day_id, meal_type) values (day_id, 'merienda') returning id into meal_id;
  insert into public.meal_plan_items (meal_plan_meal_id, food_id, quantity, unit) values (meal_id, f_huevo, 100, 'g');

  insert into public.meal_plan_meals (meal_plan_day_id, meal_type) values (day_id, 'cena') returning id into meal_id;
  insert into public.meal_plan_items (meal_plan_meal_id, food_id, quantity, unit) values
    (meal_id, f_pollo, 150, 'g'), (meal_id, f_arroz, 150, 'g');

  -- registro alimentario de Juan
  insert into public.food_diary_entries (patient_id, logged_at, meal_type, description, hunger, satiety) values
    (juan_id, now() - interval '1 day', 'desayuno', 'Avena con banana y whey', 6, 8),
    (juan_id, now() - interval '1 day' + interval '5 hours', 'almuerzo', 'Pollo con arroz y ensalada', 7, 9);

  -- documento de ejemplo
  insert into public.documents (patient_id, type, origin, uploaded_by) values
    (juan_id, 'laboratorio', 'Laboratorio Stamboulian - control trimestral', admin_id);

  -- ---------- MARÍA GÓMEZ: seguimiento con foco en laboratorio y bioimpedancia ----------
  w := 70.2;
  waist := 80;
  for i in 0..5 loop
    insert into public.anthropometry_records (patient_id, protocol, measured_by, measured_at, raw_measurements_json, source, is_closed)
    values (maria_id, 'ISAK1', admin_id, now() - ((5 - i) * interval '2 weeks'),
            jsonb_build_object('weight', round(w,1), 'height', 165, 'waist', waist), 'manual', true)
    returning id into rec_id;

    insert into public.anthropometry_calculations (anthropometry_record_id, formula_name, formula_author, formula_year, population, result_value, unit)
    values (rec_id, 'Índice de Masa Corporal (IMC)', 'Quetelet', 1832, 'adultos', round(w / power(1.65,2), 1), 'kg/m2');

    insert into public.follow_up_snapshots (patient_id, date, weight, waist, body_fat_pct, muscle_mass, source_ref)
    values (maria_id, (now() - ((5 - i) * interval '2 weeks'))::date, round(w,1), waist, round(28 - i*0.4,1), round(24 + i*0.1,1), 'antropometria');

    w := w - 0.5;
    waist := waist - 0.5;
  end loop;

  insert into public.lab_results (patient_id, analyte, raw_value, unit, reference_range, normalized_value, result_date, validated_by, validated_at) values
    (maria_id, 'TSH', '2.1', 'uUI/mL', '0.4-4.0', 2.1, current_date - 20, admin_id, now()),
    (maria_id, 'Ferritina', '32', 'ng/mL', '20-200', 32, current_date - 20, admin_id, now()),
    (maria_id, 'Vitamina B12', '410', 'pg/mL', '200-900', 410, current_date - 20, admin_id, now()),
    (maria_id, 'HbA1c', '5.4', '%', '<5.7', 5.4, current_date - 20, admin_id, now());

  insert into public.bioimpedance_records (patient_id, device, source, raw_data_json)
  values (maria_id, 'SECA mBCA', 'manual', jsonb_build_object('weight', 68.1, 'body_fat_pct', 26.5, 'muscle_mass', 24.8, 'visceral_fat', 6));

  insert into public.anamnesis_responses (patient_id, answers_json, completed_at)
  values (maria_id, jsonb_build_object(
    'Motivo de consulta', 'Mejorar hábitos alimentarios y energía diaria, sedentaria.',
    'Antecedentes patológicos', 'Hipotiroidismo tratado, en seguimiento con endocrinólogo.',
    'Medicación / suplementos', 'Levotiroxina 50mcg.',
    'Hábitos y actividad física', 'Camina 3 veces por semana, trabajo de oficina.',
    'Objetivos', 'Mejorar energía y ordenar las comidas del día.'
  ), now() - interval '5 weeks');

  insert into public.clinical_records (patient_id, created_by, created_at)
  values (maria_id, admin_id, now() - interval '5 weeks')
  returning id into cr_id;

  insert into public.clinical_record_entries (clinical_record_id, author_id, entry_type, content_json, created_at) values
    (cr_id, admin_id, 'apertura', jsonb_build_object('texto', 'Apertura de historia clínica'), now() - interval '5 weeks'),
    (cr_id, admin_id, 'nota', jsonb_build_object('texto', 'Buena adherencia, se ajusta plan por controles de tiroides estables.'), now() - interval '2 weeks');

end $$;
