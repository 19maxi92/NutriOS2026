import { createClient } from "@/lib/supabase/server";
import PrintButton from "./PrintButton";

const MEAL_LABELS: Record<string, string> = {
  desayuno: "Desayuno",
  media_manana: "Media mañana",
  almuerzo: "Almuerzo",
  merienda: "Merienda",
  cena: "Cena",
};

export default async function PlanPdfPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("first_name, last_name, dni")
    .eq("id", params.id)
    .single();

  const { data: plan } = await supabase
    .from("meal_plans")
    .select("id, name, start_date")
    .eq("patient_id", params.id)
    .eq("status", "borrador")
    .maybeSingle();

  if (!plan) {
    return <p style={{ padding: 24 }}>Todavía no hay un plan armado para este paciente.</p>;
  }

  const { data: days } = await supabase
    .from("meal_plan_days")
    .select("id")
    .eq("meal_plan_id", plan.id);

  const dayIds = (days ?? []).map((d) => d.id);

  const { data: meals } = await supabase
    .from("meal_plan_meals")
    .select("id, meal_type")
    .in("meal_plan_day_id", dayIds.length ? dayIds : ["00000000-0000-0000-0000-000000000000"]);

  const mealIds = (meals ?? []).map((m) => m.id);

  const { data: items } = await supabase
    .from("meal_plan_items")
    .select("meal_plan_meal_id, quantity, unit, foods(name, food_sources(name))")
    .in("meal_plan_meal_id", mealIds.length ? mealIds : ["00000000-0000-0000-0000-000000000000"]);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 24, fontFamily: "sans-serif" }}>
      <style>{`
        @media print {
          .no-print { display: none; }
          body { background: white; }
        }
      `}</style>

      <div className="no-print" style={{ marginBottom: 20 }}>
        <PrintButton />
      </div>

      <h1 style={{ fontSize: 20, marginBottom: 4 }}>{plan.name}</h1>
      <p style={{ fontSize: 13, color: "#555", marginBottom: 20 }}>
        {patient?.first_name} {patient?.last_name} · DNI {patient?.dni ?? "—"} · Fecha de inicio:{" "}
        {plan.start_date}
      </p>

      {(meals ?? []).map((m) => {
        const mealItems = (items ?? []).filter((it: any) => it.meal_plan_meal_id === m.id);
        return (
          <div key={m.id} style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, borderBottom: "1px solid #ddd", paddingBottom: 4 }}>
              {MEAL_LABELS[m.meal_type] ?? m.meal_type}
            </h2>
            {!mealItems.length && (
              <p style={{ fontSize: 12, color: "#999" }}>Sin alimentos cargados.</p>
            )}
            <ul style={{ fontSize: 13, paddingLeft: 18 }}>
              {mealItems.map((it: any, i: number) => (
                <li key={i}>
                  {it.foods?.name} — {it.quantity} {it.unit}{" "}
                  <span style={{ color: "#999" }}>({it.foods?.food_sources?.name})</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <p style={{ fontSize: 11, color: "#999", marginTop: 24, borderTop: "1px solid #eee", paddingTop: 10 }}>
        Plan elaborado por un profesional de nutrición matriculado. No reemplaza indicación médica.
        Fuentes de composición: SARA 2 (Ministerio de Salud de la Nación), USDA FoodData Central,
        LATINFOODS.
      </p>
    </div>
  );
}
