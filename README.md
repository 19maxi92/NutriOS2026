# Consultorio Nutricional — demo (Next.js + Supabase + Vercel)

Esta es la demo funcional del **MVP 1** definido en el Sprint 0: login, pacientes, ficha del
paciente, y antropometría con cálculo automático de IMC guardado en base de datos real.
No usa Hostinger ni Laravel todavía — eso, según el propio plan, es la última etapa.

## Qué incluye (Sprint 2)

- **Login real** con Supabase Auth (email + contraseña).
- **Dashboard** con contadores reales: pacientes, planes en borrador, laboratorios sin validar,
  antropometrías sin cerrar.
- **Pacientes**: listado, alta de paciente nuevo, ficha individual con pestañas.
- **Agenda**: alta de turnos (paciente, tipo, modalidad, estado).
- **Historia clínica**: timeline append-only real — cada nota es una fila nueva, nunca se
  sobrescribe (Ley 26.529).
- **Anamnesis** por secciones configurables.
- **Antropometría** con formulario + historial completo, IMC calculado y citado (Quetelet, 1832).
- **Bioimpedancia**: carga de InBody/SECA, separando dato crudo de interpretación.
- **Laboratorios**: carga manual de analitos con unidad, rango de referencia y fecha.
- **Plan alimentario**: constructor real contra la base de alimentos (SARA 2 / USDA / LATINFOODS),
  con cálculo de kcal/macros en vivo, guardado en Supabase.
- **PDF del plan**: vista imprimible dedicada (`/patients/[id]/plan-pdf`) con botón "Imprimir /
  guardar como PDF" (usa el diálogo de impresión del navegador — sin dependencias extra).
- **Evolución**: registro de peso/cintura con mini-gráfico.
- **Documentos**: registro de metadata (tipo, origen, fecha) — la extracción real por IA es MVP3.
- **Auditoría global**: todos los eventos `VIEW`/`CREATE`/etc. en un solo lugar.
- **RLS por rol**: `supabase/rls_hardening.sql` separa qué puede ver `recepcion` (pacientes,
  agenda) de qué puede ver `admin`/`nutricionista` (historia clínica, laboratorios, antropometría,
  bioimpedancia, DEXA, documentos, planes).
- Esquema completo (`supabase/schema.sql`) con todas las tablas del modelo de datos del Sprint 0.

## Paso a paso — Supabase

1. Crear cuenta/proyecto en [supabase.com](https://supabase.com) (plan gratuito alcanza para la demo).
2. En **SQL Editor**, pegar y ejecutar `supabase/schema.sql` completo.
3. En **Authentication → Users → Add user**, crear el usuario admin (email + contraseña) que vas
   a usar para entrar a la demo. Copiar su UUID.
4. Abrir `supabase/seed.sql`, reemplazar `<ADMIN_USER_ID>` por ese UUID, y ejecutarlo en el SQL
   Editor (crea el perfil admin, fuentes de alimentos SARA 2/USDA/LATINFOODS, alimentos de
   ejemplo y 4 pacientes de prueba).
5. Correr `supabase/seed_v2.sql` (alimentos adicionales + turnos de ejemplo para hoy).
6. Opcional pero recomendado antes de mostrarle esto a un tercero: correr
   `supabase/rls_hardening.sql` para separar permisos por rol.
7. En **Project Settings → API**, copiar `Project URL` y `anon public key`.

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
