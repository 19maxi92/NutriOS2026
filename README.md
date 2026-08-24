# Consultorio Nutricional — demo (Next.js + Supabase + Vercel)

Esta es la demo funcional del **MVP 1** definido en el Sprint 0: login, pacientes, ficha del
paciente, y antropometría con cálculo automático de IMC guardado en base de datos real.
No usa Hostinger ni Laravel todavía — eso, según el propio plan, es la última etapa.

## Qué incluye

- **Login real** con Supabase Auth (email + contraseña).
- **Dashboard** con conteo de pacientes y próximos turnos.
- **Pacientes**: listado + ficha individual.
- **Antropometría**: carga peso/talla, calcula IMC en el momento (fórmula citada: Quetelet, 1832),
  y guarda el registro + el cálculo como filas separadas (medición vs. cálculo, tal como pide el
  Master Planner).
- **Audit log automático**: cada vez que se abre la ficha de un paciente, queda un registro `VIEW`
  en `audit_log` (Ley 26.529 / 25.326).
- Esquema completo (`supabase/schema.sql`) con **todas** las tablas del modelo de datos del Sprint 0
  (historia clínica, laboratorios, bioimpedancia, DEXA, base de alimentos con trazabilidad de
  fuente, plan alimentario, agenda, seguimiento) — aunque el frontend de esta demo todavía solo
  usa una parte. Así se ve de entrada la dimensión completa del proyecto en la base de datos.

## Paso a paso — Supabase

1. Crear cuenta/proyecto en [supabase.com](https://supabase.com) (plan gratuito alcanza para la demo).
2. En **SQL Editor**, pegar y ejecutar `supabase/schema.sql` completo.
3. En **Authentication → Users → Add user**, crear el usuario admin (email + contraseña) que vas
   a usar para entrar a la demo. Copiar su UUID.
4. Abrir `supabase/seed.sql`, reemplazar `<ADMIN_USER_ID>` por ese UUID, y ejecutarlo en el SQL
   Editor (crea el perfil admin, fuentes de alimentos SARA 2/USDA/LATINFOODS, alimentos de
   ejemplo y 4 pacientes de prueba).
5. En **Project Settings → API**, copiar `Project URL` y `anon public key`.

## Paso a paso — local

```bash
npm install
cp .env.example .env.local   # completar con la URL y anon key de Supabase
npm run dev
```

Abrir `http://localhost:3000/login` y entrar con el usuario admin creado en el paso 3.

## Paso a paso — Vercel

1. Subir esta carpeta a un repo de GitHub.
2. En [vercel.com](https://vercel.com) → **Add New Project** → importar el repo.
3. En **Environment Variables**, cargar `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (las mismas del `.env.local`).
4. Deploy. Vercel detecta Next.js automáticamente, no hace falta configuración extra.

## Qué falta para ser el MVP 1 completo (ver `docs/00-SPRINT-0.md`)

- Agenda con calendario visual y estados de turno.
- Anamnesis por plantillas configurables.
- Constructor de plan alimentario (versión de referencia ya armada como prototipo interactivo
  en el chat — portarla a página real con Supabase).
- Generación de PDF del plan.
- Historia clínica como timeline append-only real (hoy el esquema ya lo soporta, falta el
  frontend).
- Endurecer las políticas RLS por rol (`recepcion` no debe poder leer historia clínica ni
  laboratorios, según Master Planner §34) — las políticas actuales son permisivas a propósito
  para que la demo funcione rápido con un solo usuario admin.

## Importante

Esto es una demo para dimensionar el proyecto, **no** un sistema listo para manejar historias
clínicas reales de pacientes. Antes de eso: revisión legal profesional (Ley 26.529 / 25.326),
RLS endurecida, backups, y todo lo que ya señala la sección 33 del Master Planner (seguridad).


