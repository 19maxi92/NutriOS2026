-- ============================================================
-- CREAR USUARIOS DEL EQUIPO
-- Paso 1 (hacer en el Dashboard, no acá): Authentication > Users > Add user
--   - Creá cada usuario con su email + contraseña.
--   - Marcá "Auto Confirm User" para que no tenga que confirmar el email.
-- Paso 2 (acá en el SQL Editor): correr este script COMPLETO.
-- No hace falta copiar ningún UUID a mano: busca al usuario por email.
-- ============================================================

-- Tami — nutricionista real del equipo
insert into public.profiles (id, full_name, role, license_number)
select id, 'Tamara Annecchini', 'nutricionista', null
from auth.users
where email = 'tamaraannecchini2000@gmail.com'
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;

-- Recepción — usuario de prueba para ver esa vista limitada
-- (creá primero este usuario en el Dashboard con el email/contraseña que quieras,
-- por ejemplo recepcion@demo.local / recepcion1234, y después corré este bloque)
insert into public.profiles (id, full_name, role, license_number)
select id, 'Recepción (demo)', 'recepcion', null
from auth.users
where email = 'recepcion@demo.local'
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;

-- Verificación: esto te tiene que devolver 3 filas (admin, Tami=nutricionista, recepcion)
select full_name, role from public.profiles order by role;
