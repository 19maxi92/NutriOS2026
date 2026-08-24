# SPRINT 0 — Desarmar el consultorio nutricional argentino

**Proyecto:** Master Planner — Plataforma clínica y de gestión para nutricionistas (Argentina, 2026)
**Etapa:** Product Discovery / Investigación previa a programar
**Fecha:** 24/08/2026

Este documento consolida el Sprint 0 completo pedido: desarme de competidores, revisión de ISAK/ISAK Metry,
análisis de SARA 2 / USDA / LATINFOODS, modelo de datos, flujo exacto de una consulta, límites de automatización
con IA, y revisión legal de historia clínica. Todo esto **antes** de tocar Laravel/MySQL/Hostinger, tal como pide
el Master Planner (secciones 49, 56 y 59: "Investigación obligatoria antes de programar" y "Primero validar,
después diseñar, después modelar datos, después programar").

---

## 1. DESARME DE COMPETIDORES

### 1.1 Matriz comparativa

| Función | **Nosotros (propuesto)** | Nutreando | NutriDesk | SoloNutris | NutriPass | Nutrium | ISAK Metry |
|---|---|---|---|---|---|---|---|
| Origen/foco | AR, clínico-integral | AR, todo-en-uno | AR, todo-en-uno | No se encontró presencia digital verificable propia (posible confusión con "siscon"/otros) | Marca ambigua: existe una corp. brasileña de nutrición (planes/telesalud) y apps de escaneo de código de barras no relacionadas con gestión clínica | Global, 120k+ profesionales en 120+ países | Software oficial ISAK (mediciones, no gestión de consultorio) |
| Historia clínica | Sí, con auditoría y versionado (foco del proyecto) | Sí | Sí | — | No (no es gestión de consultorio) | Sí (EHR), cumple HIPAA/GDPR (no adaptado a Ley 26.529/25.326 AR) | No |
| Agenda/turnos + cobro | Sí | Sí, con autogestión de turnos por el paciente | Sí ("se llena y cobra sola", integración Mercado Pago) | — | — | Sí, con recordatorios automáticos | No |
| IA para extraer PDFs (labs/antropometría/InBody) | Sí, con confirmación humana obligatoria (principio rector) | **Sí — es su diferencial fuerte**: testimonios confirman que suben PDF de laboratorio/ISAK/bioimpedancia y "la IA lo acomoda" y compara con métricas anteriores | Sí, mencionan "IA para planes y laboratorios" (asistente "Lía") | — | — | IA para "asesoramiento personalizado basado en datos" (no queda claro nivel de auto-extracción) | No |
| Antropometría/ISAK | Sí, con separación medición/cálculo/protocolo | Mencionada por usuarias ISAK Nivel 2 como parte del flujo | Mencionada explícitamente | — | — | No especializado en ISAK | Es el estándar: da de alta sujeto, mide según perfil ISAK, genera informe individual y de población, guarda datos de referencia |
| Bioimpedancia/InBody | Módulo propio, separando dato crudo/calculado/interpretación | Integrado (comparativas automáticas) | Mencionado | — | — | No específico | No aplica |
| Base de alimentos AR (SARA 2, etc.) | Sí, con trazabilidad de fuente/versión | No verificado si usan SARA 2 específicamente | No verificado | — | — | Base propia global, no localizada a fuentes argentinas oficiales | No aplica |
| Portal/app del paciente | PWA (MVP 3-4) | Sí (ven plan, evolución) | Sí | — | — | Sí, app propia, referente mundial | No |
| Cumplimiento legal AR explícito (Ley 26.529 / 25.326) | Objetivo explícito del proyecto | No comunicado públicamente | No comunicado | — | — | Comunican HIPAA/GDPR, **no** marco argentino | No aplica (no gestiona HC) |
| Auditoría / trazabilidad de cambios en HC | Sí, principio no negociable (audit log) | No comunicado | No comunicado | — | — | No comunicado explícitamente | No aplica |

**Notas de investigación:**
- **SoloNutris** y **Nutri.AR** no tienen presencia pública verificable como productos independientes de gestión de consultorio en la búsqueda actual; puede tratarse de nombres muy nuevos, de uso interno/regional muy acotado, o de una confusión de nombre. Recomiendo que la nutricionista del equipo confirme si los usó o los vio usar en algún consultorio real — dato de campo vale más que búsqueda web acá.
- **NutriPass** como término está ocupado por al menos 3 productos distintos no relacionados entre sí (una corp brasileña de nutrición corporativa, una app de escaneo de código de barras francesa, y un bot de WhatsApp de análisis de fotos de comida). Ninguno parece ser el "NutriPass argentino" al que refiere el Master Planner — mismo comentario que arriba, conviene confirmar con fuente primaria.
- **AntropoApp**: no apareció como producto propio; lo que sí aparece con fuerza es **ISAK Metry**, que es la referencia real del rubro.

### 1.2 Nutreando — el competidor más peligroso

<cite index="6-1,21-1,39-1">Nutreando se posiciona como historia clínica, planes de alimentación con IA, agenda online y cobros, hecho específicamente para licenciados en nutrición de Argentina, reemplazando Excel, Word y WhatsApp; reportan más de 2.000 turnos agendados por mes entre consultorios de todo el país.</cite> Un testimonio de una antropometrista ISAK Nivel 2 describe exactamente el flujo que el Master Planner define como objetivo: <cite index="39-1">antes cargaba manualmente laboratorio, informe de antropometría ISAK e informe de bioimpedancia, y ahora sube el archivo y la IA lo acomoda, además de generar comparativas automáticas con métricas anteriores.</cite>

**Lectura:** Nutreando ya resolvió razonablemente bien "documento → IA → dato estructurado → comparación". Esto no es un espacio vacío. La oportunidad real no es "hacer lo mismo", es:
1. Ser más explícitos y auditables en el límite IA/decisión clínica (ellos no comunican esto públicamente; nosotros lo hacemos principio de diseño visible).
2. Trazabilidad de fuente de datos nutricionales (SARA 2 vs. USDA vs. LATINFOODS) — nadie en el mercado argentino comunica esto.
3. Cumplimiento legal argentino explícito (Ley 26.529/25.326) como diferencial de confianza, no solo feature.

### 1.3 NutriDesk

<cite index="12-1">NutriDesk se presenta como hecha para nutricionistas de Argentina: historias clínicas, planes y recetas, antropometría y bioimpedancia, agenda que reserva y cobra sola, recordatorios, laboratorios, un asistente con IA y portal del paciente.</cite> Es prácticamente el mismo alcance que pide el Master Planner. Existe también una app iOS homónima de otro desarrollador (gestión de clientes/planes, sin relación con el producto argentino) — cuidado al buscar referencias, hay ambigüedad de nombre en el mercado internacional.

### 1.4 ISAK Metry (referencia obligatoria, no competidor de gestión)

<cite index="41-1">ISAK Metry permite dar de alta sujetos, programar citas, registrar mediciones según el perfil antropométrico y nivel ISAK seleccionado, generar informes individuales y estudios de población, y almacenar datos de referencia.</cite> Es el software oficial de ISAK. **No certifica software de terceros** (confirmado en el Master Planner) — por eso nuestro módulo de antropometría debe presentarse como "herramienta de registro/cálculo basada en protocolos ISAK", nunca como "software oficial ISAK".

### 1.5 Nutrium (referencia global)

<cite index="5-1,8-1">Nutrium ofrece asesoramiento nutricional personalizado basado en datos, seguimiento de hábitos en tiempo real, agenda con recordatorios automáticos, plantillas y calculadoras, app propia para el paciente, y cumplimiento de HIPAA y GDPR.</cite> Es el estándar internacional de referencia en UX, pero **no está adaptado al marco legal argentino** (comunican HIPAA/GDPR, no Ley 26.529/25.326) ni a fuentes de composición de alimentos locales (SARA 2). Ahí hay espacio real.

### 1.6 Dónde está la oportunidad real

No es "más funciones". El Master Planner ya lo dice en la sección 43. La oportunidad concreta, cruzando lo investigado:

1. **Confianza legal explícita** — ningún competidor argentino comunica públicamente cómo cumple Ley 26.529 (historia clínica) y Ley 25.326 (datos sensibles). Nosotros sí, desde el día 1, con audit log visible y política de retención clara.
2. **Trazabilidad de fuente nutricional** — nadie separa "SARA 2 v2022" de "USDA" de "LATINFOODS 2024" a nivel de dato. Es una promesa de rigor científico que un nutricionista exigente valora.
3. **Límite IA/criterio profesional como feature, no como letra chica** — Nutreando y NutriDesk ya usan IA para extracción, pero no comunican el principio "la IA no prescribe" como valor de marca. Nosotros lo hacemos visible en cada pantalla ("Verificar antes de incorporar").

---

## 2. ISAK — investigación específica

**Niveles:**
- **ISAK Nivel 1**: <cite index="47-1">diseñado para antropometristas que necesitan medir altura, peso, pliegues cutáneos, un pequeño número de perímetros y dos diámetros óseos — perfil restringido.</cite>
- **ISAK Nivel 2/3**: perfiles más completos (perfil completo, longitudes, diámetros adicionales); Nivel 3 habilita a formar y evaluar a Nivel 1/2.
- **Re-acreditación**: <cite index="47-1">exige verificación práctica con tres sujetos ante un evaluador Nivel 3/4, con error técnico de medición (ETM) objetivo del 10% para pliegues y 2% para el resto de las medidas, más 20 sujetos con perfil restringido.</cite>

**Variables típicas:** peso, talla, 8 pliegues cutáneos (tríceps, subescapular, bíceps, cresta ilíaca, supraespinal, abdominal, muslo, pierna), perímetros (brazo relajado/contraído, cintura, cadera, pierna), diámetros óseos (biepicondíleo húmero, biestiloideo, biepicondíleo fémur), longitudes.

**Cálculos derivados que el módulo debe soportar (siempre citando fórmula/autor/año/fuente, nunca "inventadas"):**
- Somatotipo de Heath-Carter (endomorfia/mesomorfia/ectomorfia).
- Fraccionamiento de Kerr (5 componentes: masa adiposa, muscular, ósea, residual, piel).
- % graso por ecuaciones específicas (Faulkner, Yuhasz, etc., según población y nivel de evidencia).
- Medianas técnico-metodológicas para reducir error de medición (ISAK exige tomar 2-3 mediciones por sitio y usar la mediana si hay variación > umbral).

**Regla de diseño (ya en el Master Planner, confirmada por la investigación):** ISAK Metry es el software oficial y **no certifica terceros**. Nuestro texto legal de producto debe decir explícitamente: *"Herramienta de registro y cálculo basada en protocolos y fuentes antropométricas reconocidas (ISAK y otros), sujeta siempre a validación por el profesional. No somos software oficial ISAK ni estamos certificados por ISAK."*

---

## 3. COMPOSICIÓN QUÍMICA DE ALIMENTOS — SARA 2, USDA, LATINFOODS

### 3.1 SARA 2 (fuente prioritaria para Argentina)

<cite index="49-1">SARA 2 es la tabla de composición química de alimentos para Argentina compilada para la ENNyS 2, publicada por el Ministerio de Salud de la Nación en 2022 (autores: Elorriaga, Figueroa, Mangialavori, Romero, Rovirosa, Tenisi).</cite> <cite index="49-1">Nace porque Argentina no contaba con una tabla completa de datos analíticos para todos los alimentos de interés; se usó la tabla del software SARA original (ENNyS 1, 2005) como base y se expandió la cantidad de nutrientes y alimentos.</cite> <cite index="49-1">El Ministerio sostiene el compromiso de difundir esta herramienta en forma libre y gratuita para la comunidad científica y académica</cite> — buena noticia para nosotros: es una fuente citable, gratuita y con respaldo oficial.

### 3.2 LATINFOODS / INFOODS / ARGENFOODS

<cite index="61-1">Argentina, a través de ARGENFOODS, compila datos de composición de alimentos argentinos para aportar al Portal LATINFOODS, incluyendo alimentos nativos latinoamericanos.</cite> <cite index="60-1">El objetivo de LATINFOODS es desarrollar, fortalecer y difundir información regional sobre composición de alimentos, promoviendo redes nacionales activas y capacitación de profesionales.</cite> Importante para licencia de uso: <cite index="61-1">el portal exige citar la fuente si se usa el material y no permite su comercialización directa ni reproducción total/parcial sin autorización.</cite> Esto afecta directamente el diseño de `food_sources`: cada alimento debe guardar de qué fuente/versión viene, y el uso comercial de LATINFOODS específicamente requiere revisión de licencia antes de integrarlo en un producto pago.

### 3.3 USDA FoodData Central

Base masiva, internacional, gratuita vía API pública, útil para alimentos no contemplados en tablas argentinas (productos importados, ultraprocesados con etiquetado US, suplementos). No reemplaza a SARA 2 como fuente prioritaria para población argentina, pero es buen fallback.

### 3.4 Decisión de arquitectura confirmada por la investigación

No mezclar automáticamente las bases (como ya indica el Master Planner). Cada fila de `food_nutrients` debe llevar `food_source_id` + `source_version`. Cuando dos fuentes tengan el mismo alimento con valores distintos, el sistema debe **mostrar ambas, nunca promediar silenciosamente**, y dejar que el profesional elija cuál usar como predeterminada para ese paciente/plan.

---

## 4. MODELO DE DATOS (núcleo, primera versión)

Entidades principales agrupadas por dominio. Este es el modelo que se traduce 1:1 a las tablas Supabase de la demo.

```
users (id, email, role[admin|nutricionista|recepcion*], full_name, license_number, created_at)
patients (id, owner_user_id, first_name, last_name, dni, birth_date, sex, phone, email,
          address, emergency_contact, health_insurance, occupation, notes, created_at, updated_at)

clinical_records (id, patient_id, created_by, created_at)          -- historia clínica (hub, foliada)
clinical_record_entries (id, clinical_record_id, author_id, entry_type, content_json,
                          created_at, is_locked)                    -- cronológico, nunca se borra
audit_log (id, actor_id, action[VIEW|CREATE|UPDATE|DELETE|EXPORT], entity_type, entity_id,
           field_changed, old_value, new_value, at, ip)

anamnesis_templates (id, name, sections_json)
anamnesis_responses (id, patient_id, template_id, answers_json, completed_at)

anthropometry_records (id, patient_id, protocol[ISAK1|ISAK2|otro], measured_by, measured_at,
                        raw_measurements_json, source[manual|documento])
anthropometry_calculations (id, anthropometry_record_id, formula_name, formula_author,
                             formula_year, population, result_value, unit)

bioimpedance_records (id, patient_id, device[InBody|SECA|otro], measured_at,
                       raw_data_json, source[manual|pdf|csv|api])
dexa_records (id, patient_id, center, equipment, measured_at, fat_mass, lean_mass, bone_mass,
              bmd, t_score, z_score, visceral_fat, regional_json)

lab_documents (id, patient_id, uploaded_at, file_url, ocr_status, extracted_json, confidence_avg)
lab_results (id, lab_document_id, patient_id, analyte, raw_value, unit, reference_range,
             normalized_value, result_date, validated_by, validated_at)

documents (id, patient_id, type, origin, file_url, ocr_text, extracted_json, uploaded_by,
           uploaded_at, validated_at)                                -- motor genérico reutilizable

food_sources (id, name, version, url, license_note)                  -- SARA2 / USDA / LATINFOODS
foods (id, name, food_source_id, external_code)
nutrients (id, name, unit)
food_nutrients (id, food_id, nutrient_id, value_per_100g)
household_measures (id, food_id, description, grams_equivalent)
recipes (id, name, created_by, servings)
recipe_ingredients (id, recipe_id, food_id, quantity, unit)

meal_plans (id, patient_id, created_by, name, start_date, status[borrador|activo|archivado])
meal_plan_days (id, meal_plan_id, day_of_week)
meal_plan_meals (id, meal_plan_day_id, meal_type[desayuno|media_manana|almuerzo|merienda|cena])
meal_plan_items (id, meal_plan_meal_id, food_id OR recipe_id, quantity, unit, household_measure_id, notes)

appointments (id, patient_id, nutricionista_id, starts_at, ends_at, type[primera|control|seguimiento],
              modality[presencial|virtual], status[solicitado|confirmado|asistio|cancelado|ausente|reprogramado])

food_diary_entries (id, patient_id, logged_at, meal_type, description, photo_url, hunger, satiety, notes)
follow_up_snapshots (id, patient_id, date, weight, waist, body_fat_pct, muscle_mass, source_ref)
```

**Reglas de diseño no negociables (heredadas del Master Planner + reforzadas por la investigación legal):**
- `clinical_record_entries` es **append-only**: un `UPDATE` clínico no pisa el valor anterior, crea una nueva entrada y el `audit_log` registra el cambio (ej. "Peso: 82 → 81.5 kg"). Nunca `DELETE` físico de datos clínicos — a lo sumo un `is_voided` con motivo.
- Cada tabla clínica sensible dispara un registro en `audit_log` en cada `VIEW`, no solo en escritura (exigido para trazabilidad de acceso a datos de salud).
- `food_nutrients` nunca se sobrescribe entre fuentes: es una tabla de hechos por fuente/versión, no un valor único "de consenso".

---

## 5. FLUJO EXACTO DE UNA CONSULTA (validado contra el Master Planner §60)

```
LOGIN (nutricionista o admin)
  → DASHBOARD (turnos de hoy, pendientes: labs sin revisar, planes en borrador, antropometrías sin cerrar)
    → click turno de hoy → FICHA DEL PACIENTE (hub)
      → si es primera consulta: ABRIR HISTORIA CLÍNICA → CARGAR ANAMNESIS (formulario por secciones)
      → CARGAR ANTROPOMETRÍA (mediciones directas → sistema calcula IMC/composición → protocolo queda registrado)
      → (opcional) SUBIR DOCUMENTO (lab/InBody/DEXA) → IA extrae → [CONFIRMAR DATOS] → se guarda validado
      → ARMAR PLAN ALIMENTARIO (constructor visual por día/comida → alimentos con fuente/versión →
         cálculo automático de kcal/macros → sustituciones opcionales)
      → GENERAR PDF del plan
      → GUARDAR EVOLUCIÓN (snapshot de seguimiento: peso, cintura, %graso, etc. para el timeline)
    → cierre de turno → estado del appointment pasa a "asistió"
```

Este es el flujo que define el **MVP 1** (Master Planner §45 y §60), y es exactamente lo que la demo debe mostrar de punta a punta.

---

## 6. QUÉ PUEDE AUTOMATIZARSE

- Cálculos con fórmula fija, citada y con fuente (IMC, %graso, somatotipo, TMB, macros de un plan).
- Extracción de texto/tablas de PDF/imagen a datos estructurados **con confidence score visible**.
- Detección de tipo de documento, unidades, fecha, metodología mencionada en el documento.
- Comparación numérica entre mediciones/estudios de distintas fechas (deltas, gráficos).
- Recordatorios, confirmaciones de turno, generación de PDF, armado de resúmenes administrativos.
- Sustituciones **propuestas** dentro de un set ya validado por el profesional (nunca decide clínicamente qué reemplazar).

## 7. QUÉ LA IA JAMÁS DEBE AUTOMATIZAR

- Ningún diagnóstico ("tenés diabetes", "tenés deficiencia de vitamina D") a partir de datos extraídos.
- Ninguna escritura directa en la historia clínica sin paso de confirmación humana explícito.
- Ninguna decisión de qué alimento sustituye a otro por "criterio clínico propio" — solo comparar datos.
- Ninguna estimación de porción/alimento en fotos tratada como dato exacto (siempre con incertidumbre visible).
- Ningún envío de la historia clínica completa a un LLM externo — principio de minimización de datos: solo el
  dato mínimo necesario para la tarea puntual.

---

## 8. REVISIÓN LEGAL — historia clínica y datos sensibles (Argentina, estado a agosto 2026)

- **Ley 26.529** (Derechos del Paciente, Historia Clínica y Consentimiento Informado): exige que la historia
  clínica sea documento obligatorio, cronológico, foliado y completo; admite historia clínica informatizada
  siempre que se garanticen integridad, autenticidad, inalterabilidad, perdurabilidad y recuperabilidad, con
  controles de acceso adecuados. Esto se traduce directamente en: `clinical_record_entries` append-only,
  `audit_log` obligatorio, backups verificables, exportación disponible para el paciente.
- **Ley 25.326** (Protección de Datos Personales): sigue vigente y es la norma aplicable hoy. Trata los datos
  de salud como **datos sensibles**, con exigencia reforzada de seguridad y confidencialidad, y sustenta la
  acción de habeas data (art. 43 CN).
- **Importante para el roadmap**: <cite index="65-1">hay un proyecto de ley (1751-D-2026) presentado en el Congreso que busca reemplazar íntegramente la Ley 25.326</cite>, inspirado en RGPD/estándares internacionales, con conceptos nuevos como evaluación de impacto, privacidad por diseño y nuevas categorías de datos sensibles (biométricos, genéticos). <cite index="64-1">Aun así, el objetivo declarado no es reemplazar sino actualizar la estructura de la 25.326, y la ley actual sigue operando de forma efectiva.</cite> **Conclusión práctica: diseñar ya con estándares tipo RGPD (consentimiento explícito, minimización de datos, derecho de acceso/rectificación/portabilidad, evaluación de impacto para IA) deja el producto mejor posicionado si la reforma avanza, sin violar la ley vigente hoy.**
- Esto **no es asesoramiento jurídico definitivo** (así lo exige el propio Master Planner en la sección del rol "IA 3 — Legal"): antes de manejar historias clínicas reales de pacientes, corresponde una revisión por un abogado especializado en salud/datos personales.

---

## 9. MVP — alcance confirmado para la demo

Igual al Master Planner §45 (MVP 1): Login, Pacientes, Agenda, Historia clínica básica, Anamnesis, Antropometría,
Base de alimentos, Constructor de plan, PDF, Dashboard. **Sin** IA avanzada de producción, DEXA automático,
reconocimiento de comida por foto, marketplace ni pagos — eso es MVP 2/3/4.

La demo que sigue implementa este alcance en modo funcional/visual, para poder dimensionar el proyecto real
antes de invertir en Laravel + MySQL + Hostinger (que, según el propio plan, es la última etapa, no la primera).
