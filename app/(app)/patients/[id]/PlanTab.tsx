"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MEAL_LABELS: Record<string, string> = {
  desayuno: "Desayuno",
  media_manana: "Media mañana",
  almuerzo: "Almuerzo",
  merienda: "Merienda",
  cena: "Cena",
};

export default function PlanTab({ patientId }: { patientId: string }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [planId, setPlanId] = useState<string | null>(null);
  const [meals, setMeals] = useState<{ id: string; meal_type: string }[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [addingTo, setAddingTo] = useState<string | null>(null);

  const nutrientMap = (food: any) => {
    const m: Record<string, number> = {};
    (food.food_nutrients ?? []).forEach((fn: any) => {
      m[fn.nutrients?.name] = fn.value_per_100g;
    });
    return m;
  };

  const load = async () => {
    setLoading(true);

    // 1) alimentos con nutrientes y fuente
    const { data: foodRows } = await supabase
      .from("foods")
      .select("id, name, food_sources(name, version), food_nutrients(value_per_100g, nutrients(name, unit))");
    setFoods(foodRows ?? []);

    // 2) plan en borrador (o creación)
    let { data: plan } = await supabase
      .from("meal_plans")
      .select("id")
      .eq("patient_id", patientId)
      .eq("status", "borrador")
      .maybeSingle();

    if (!plan) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: created } = await supabase
        .from("meal_plans")
        .insert({ patient_id: patientId, created_by: user?.id, name: "Plan alimentario" })
        .select()
        .single();
      plan = created;
    }
    if (!plan) {
      setLoading(false);
      return;
    }
    setPlanId(plan.id);

    // 3) día único de referencia (day_of_week = 1, "día tipo")
    let { data: day } = await supabase
      .from("meal_plan_days")
      .select("id")
      .eq("meal_plan_id", plan.id)
      .eq("day_of_week", 1)
      .maybeSingle();

    if (!day) {
      const { data: createdDay } = await supabase
        .from("meal_plan_days")
        .insert({ meal_plan_id: plan.id, day_of_week: 1 })
        .select()
        .single();
      day = createdDay;
    }
    if (!day) {
      setLoading(false);
      return;
    }

    // 4) comidas del día (crear las que falten)
    const { data: existingMeals } = await supabase
      .from("meal_plan_meals")
      .select("id, meal_type")
      .eq("meal_plan_day_id", day.id);

    const existingTypes = (existingMeals ?? []).map((m) => m.meal_type);
    const missing = Object.keys(MEAL_LABELS).filter((t) => !existingTypes.includes(t));
    if (missing.length) {
      await supabase
        .from("meal_plan_meals")
        .insert(missing.map((meal_type) => ({ meal_plan_day_id: day!.id, meal_type })));
    }

    const { data: allMeals } = await supabase
      .from("meal_plan_meals")
      .select("id, meal_type")
      .eq("meal_plan_day_id", day.id);
    setMeals(allMeals ?? []);

    // 5) items de todas las comidas
    const mealIds = (allMeals ?? []).map((m) => m.id);
    const { data: itemRows } = await supabase
      .from("meal_plan_items")
      .select("id, meal_plan_meal_id, food_id, quantity, unit")
      .in("meal_plan_meal_id", mealIds.length ? mealIds : ["00000000-0000-0000-0000-000000000000"]);
    setItems(itemRows ?? []);

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const addItem = async (mealId: string, foodId: string) => {
    await supabase.from("meal_plan_items").insert({
      meal_plan_meal_id: mealId,
      food_id: foodId,
      quantity: 100,
      unit: "g",
    });
    setAddingTo(null);
    load();
  };

  const updateQty = async (itemId: string, qty: number) => {
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, quantity: qty } : it)));
    await supabase.from("meal_plan_items").update({ quantity: qty }).eq("id", itemId);
  };

  const totalsFor = (mealId: string) => {
    const mealItems = items.filter((it) => it.meal_plan_meal_id === mealId);
    return mealItems.reduce(
      (acc, it) => {
        const food = foods.find((f) => f.id === it.food_id);
        const n = food ? nutrientMap(food) : {};
        const factor = (it.quantity || 0) / 100;
        acc.kcal += (n["Energía"] || 0) * factor;
        acc.prot += (n["Proteínas"] || 0) * factor;
        acc.carb += (n["Carbohidratos"] || 0) * factor;
        acc.fat += (n["Grasas"] || 0) * factor;
        return acc;
      },
      { kcal: 0, prot: 0, carb: 0, fat: 0 }
    );
  };

  const dayTotal = meals.reduce(
    (acc, m) => {
      const t = totalsFor(m.id);
      acc.kcal += t.kcal;
      acc.prot += t.prot;
      acc.carb += t.carb;
      acc.fat += t.fat;
      return acc;
    },
    { kcal: 0, prot: 0, carb: 0, fat: 0 }
  );

  if (loading) return <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Cargando…</p>;

  return (
    <div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
        Cada alimento indica su fuente (SARA 2 / USDA / LATINFOODS). Día de referencia — en el MVP
        completo se repite por cada día de la semana.
      </p>

      {meals.map((m) => {
        const mealItems = items.filter((it) => it.meal_plan_meal_id === m.id);
        const t = totalsFor(m.id);
        return (
          <div key={m.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <strong style={{ fontSize: 13 }}>{MEAL_LABELS[m.meal_type]}</strong>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {t.kcal.toFixed(0)} kcal
              </span>
            </div>

            {mealItems.map((it) => {
              const food = foods.find((f) => f.id === it.food_id);
              return (
                <div
                  key={it.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "4px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span style={{ fontSize: 13 }}>
                    {food?.name} <span style={{ color: "var(--text-muted)" }}>({food?.food_sources?.name})</span>
                  </span>
                  <input
                    type="number"
                    value={it.quantity}
                    onChange={(e) => updateQty(it.id, parseFloat(e.target.value) || 0)}
                    style={{ width: 70 }}
                  />
                </div>
              );
            })}

            {addingTo === m.id ? (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                {foods.map((f) => (
                  <button key={f.id} onClick={() => addItem(m.id, f.id)} style={{ fontSize: 12 }}>
                    + {f.name}
                  </button>
                ))}
                <button onClick={() => setAddingTo(null)} style={{ fontSize: 12 }}>
                  Cerrar
                </button>
              </div>
            ) : (
              <button onClick={() => setAddingTo(m.id)} style={{ fontSize: 12, marginTop: 8 }}>
                + Agregar alimento
              </button>
            )}
          </div>
        );
      })}

      <div className="card">
        <strong style={{ fontSize: 13 }}>Total del día</strong>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 8 }}>
          {[
            ["Kcal", dayTotal.kcal.toFixed(0)],
            ["Proteínas", dayTotal.prot.toFixed(1) + "g"],
            ["Carbohidratos", dayTotal.carb.toFixed(1) + "g"],
            ["Grasas", dayTotal.fat.toFixed(1) + "g"],
          ].map(([l, v]) => (
            <div key={l as string}>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 2px" }}>{l}</p>
              <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
