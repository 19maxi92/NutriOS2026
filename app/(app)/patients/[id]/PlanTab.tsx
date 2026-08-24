"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MEAL_LABELS: Record<string, string> = {
  desayuno: "Desayuno",
  media_manana: "Media mañana",
  almuerzo: "Almuerzo",
  merienda: "Merienda",
  cena: "Cena",
};

const DAY_LABELS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function PlanTab({ patientId }: { patientId: string }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [planId, setPlanId] = useState<string | null>(null);
  const [activeDow, setActiveDow] = useState(0);
  const [daysByDow, setDaysByDow] = useState<Record<number, string>>({});
  const [meals, setMeals] = useState<Record<number, { id: string; meal_type: string }[]>>({});
  const [foods, setFoods] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [addingTo, setAddingTo] = useState<string | null>(null);

  const nutrientMap = (food: any) => {
    const m: Record<string, number> = {};
    (food.food_nutrients ?? []).forEach((fn: any) => {
      m[fn.nutrients?.name] = fn.value_per_100g;
    });
    return m;
  };

  const recipeNutrientsPerServing = (recipe: any) => {
    const totals = { Energía: 0, Proteínas: 0, Carbohidratos: 0, Grasas: 0 };
    (recipe.recipe_ingredients ?? []).forEach((ing: any) => {
      const n = nutrientMap(ing.foods ?? {});
      const factor = (ing.quantity || 0) / 100;
      totals.Energía += (n["Energía"] || 0) * factor;
      totals.Proteínas += (n["Proteínas"] || 0) * factor;
      totals.Carbohidratos += (n["Carbohidratos"] || 0) * factor;
      totals.Grasas += (n["Grasas"] || 0) * factor;
    });
    const servings = recipe.servings || 1;
    return {
      Energía: totals.Energía / servings,
      Proteínas: totals.Proteínas / servings,
      Carbohidratos: totals.Carbohidratos / servings,
      Grasas: totals.Grasas / servings,
    };
  };

  const load = async () => {
    setLoading(true);

    const { data: foodRows } = await supabase
      .from("foods")
      .select("id, name, food_sources(name), food_nutrients(value_per_100g, nutrients(name))");
    setFoods(foodRows ?? []);

    const { data: recipeRows } = await supabase
      .from("recipes")
      .select("id, name, servings, recipe_ingredients(quantity, foods(name, food_nutrients(value_per_100g, nutrients(name))))");
    setRecipes(recipeRows ?? []);

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

    // asegurar los 7 días
    const { data: existingDays } = await supabase
      .from("meal_plan_days")
      .select("id, day_of_week")
      .eq("meal_plan_id", plan.id);

    const existingDow = (existingDays ?? []).map((d) => d.day_of_week);
    const missingDow = [0, 1, 2, 3, 4, 5, 6].filter((d) => !existingDow.includes(d));
    if (missingDow.length) {
      await supabase
        .from("meal_plan_days")
        .insert(missingDow.map((day_of_week) => ({ meal_plan_id: plan!.id, day_of_week })));
    }

    const { data: allDays } = await supabase
      .from("meal_plan_days")
      .select("id, day_of_week")
      .eq("meal_plan_id", plan.id);

    const dowMap: Record<number, string> = {};
    (allDays ?? []).forEach((d) => (dowMap[d.day_of_week] = d.id));
    setDaysByDow(dowMap);

    const dayIds = Object.values(dowMap);

    // asegurar las 5 comidas por día
    const { data: existingMeals } = await supabase
      .from("meal_plan_meals")
      .select("id, meal_type, meal_plan_day_id")
      .in("meal_plan_day_id", dayIds.length ? dayIds : ["00000000-0000-0000-0000-000000000000"]);

    const missingInserts: { meal_plan_day_id: string; meal_type: string }[] = [];
    dayIds.forEach((dayId) => {
      const existingTypes = (existingMeals ?? [])
        .filter((m) => m.meal_plan_day_id === dayId)
        .map((m) => m.meal_type);
      Object.keys(MEAL_LABELS).forEach((t) => {
        if (!existingTypes.includes(t)) missingInserts.push({ meal_plan_day_id: dayId, meal_type: t });
      });
    });
    if (missingInserts.length) {
      await supabase.from("meal_plan_meals").insert(missingInserts);
    }

    const { data: allMeals } = await supabase
      .from("meal_plan_meals")
      .select("id, meal_type, meal_plan_day_id")
      .in("meal_plan_day_id", dayIds.length ? dayIds : ["00000000-0000-0000-0000-000000000000"]);

    const mealsByDow: Record<number, { id: string; meal_type: string }[]> = {};
    Object.entries(dowMap).forEach(([dow, dayId]) => {
      mealsByDow[Number(dow)] = (allMeals ?? []).filter((m) => m.meal_plan_day_id === dayId);
    });
    setMeals(mealsByDow);

    const mealIds = (allMeals ?? []).map((m) => m.id);
    const { data: itemRows } = await supabase
      .from("meal_plan_items")
      .select("id, meal_plan_meal_id, food_id, recipe_id, quantity, unit")
      .in("meal_plan_meal_id", mealIds.length ? mealIds : ["00000000-0000-0000-0000-000000000000"]);
    setItems(itemRows ?? []);

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const addFoodItem = async (mealId: string, foodId: string) => {
    await supabase.from("meal_plan_items").insert({ meal_plan_meal_id: mealId, food_id: foodId, quantity: 100, unit: "g" });
    setAddingTo(null);
    load();
  };

  const addRecipeItem = async (mealId: string, recipeId: string) => {
    await supabase.from("meal_plan_items").insert({ meal_plan_meal_id: mealId, recipe_id: recipeId, quantity: 1, unit: "porción" });
    setAddingTo(null);
    load();
  };

  const updateQty = async (itemId: string, qty: number) => {
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, quantity: qty } : it)));
    await supabase.from("meal_plan_items").update({ quantity: qty }).eq("id", itemId);
  };

  const removeItem = async (itemId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
    await supabase.from("meal_plan_items").delete().eq("id", itemId);
  };

  const itemNutrients = (it: any) => {
    if (it.food_id) {
      const food = foods.find((f) => f.id === it.food_id);
      const n = food ? nutrientMap(food) : {};
      const factor = (it.quantity || 0) / 100;
      return {
        kcal: (n["Energía"] || 0) * factor,
        prot: (n["Proteínas"] || 0) * factor,
        carb: (n["Carbohidratos"] || 0) * factor,
        fat: (n["Grasas"] || 0) * factor,
      };
    }
    if (it.recipe_id) {
      const recipe = recipes.find((r) => r.id === it.recipe_id);
      const perServing = recipe ? recipeNutrientsPerServing(recipe) : { Energía: 0, Proteínas: 0, Carbohidratos: 0, Grasas: 0 };
      const factor = it.quantity || 0;
      return {
        kcal: perServing.Energía * factor,
        prot: perServing.Proteínas * factor,
        carb: perServing.Carbohidratos * factor,
        fat: perServing.Grasas * factor,
      };
    }
    return { kcal: 0, prot: 0, carb: 0, fat: 0 };
  };

  const totalsFor = (mealId: string) =>
    items
      .filter((it) => it.meal_plan_meal_id === mealId)
      .reduce(
        (acc, it) => {
          const n = itemNutrients(it);
          acc.kcal += n.kcal;
          acc.prot += n.prot;
          acc.carb += n.carb;
          acc.fat += n.fat;
          return acc;
        },
        { kcal: 0, prot: 0, carb: 0, fat: 0 }
      );

  const dayMeals = meals[activeDow] ?? [];
  const dayTotal = dayMeals.reduce(
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Cada alimento indica su fuente (SARA 2 / USDA / LATINFOODS). Los platos guardados en{" "}
          <a href="/foods">Alimentos</a> también se pueden usar acá.
        </p>
        <a href={`/patients/${patientId}/plan-pdf`} target="_blank" rel="noreferrer">
          <button>Ver / generar PDF</button>
        </a>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>
        {DAY_LABELS.map((label, dow) => (
          <button
            key={dow}
            onClick={() => setActiveDow(dow)}
            style={{
              fontSize: 12,
              background: activeDow === dow ? "var(--text)" : "var(--surface)",
              color: activeDow === dow ? "#fff" : "var(--text)",
              border: "1px solid var(--border)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {dayMeals.map((m) => {
        const mealItems = items.filter((it) => it.meal_plan_meal_id === m.id);
        const t = totalsFor(m.id);
        return (
          <div key={m.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <strong style={{ fontSize: 13 }}>{MEAL_LABELS[m.meal_type]}</strong>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.kcal.toFixed(0)} kcal</span>
            </div>

            {mealItems.map((it) => {
              const label = it.food_id
                ? foods.find((f) => f.id === it.food_id)?.name
                : recipes.find((r) => r.id === it.recipe_id)?.name + " (plato)";
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
                  <span style={{ fontSize: 13 }}>{label}</span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      type="number"
                      value={it.quantity}
                      onChange={(e) => updateQty(it.id, parseFloat(e.target.value) || 0)}
                      style={{ width: 60 }}
                    />
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{it.unit}</span>
                    <button onClick={() => removeItem(it.id)} style={{ fontSize: 11, padding: "4px 6px" }}>
                      ×
                    </button>
                  </div>
                </div>
              );
            })}

            {addingTo === m.id ? (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 4px" }}>Alimentos</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {foods.map((f) => (
                    <button key={f.id} onClick={() => addFoodItem(m.id, f.id)} style={{ fontSize: 12 }}>
                      + {f.name}
                    </button>
                  ))}
                </div>
                {recipes.length > 0 && (
                  <>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 4px" }}>Platos</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      {recipes.map((r) => (
                        <button key={r.id} onClick={() => addRecipeItem(m.id, r.id)} style={{ fontSize: 12 }}>
                          + {r.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <button onClick={() => setAddingTo(null)} style={{ fontSize: 12 }}>
                  Cerrar
                </button>
              </div>
            ) : (
              <button onClick={() => setAddingTo(m.id)} style={{ fontSize: 12, marginTop: 8 }}>
                + Agregar alimento o plato
              </button>
            )}
          </div>
        );
      })}

      <div className="card">
        <strong style={{ fontSize: 13 }}>Total del día — {DAY_LABELS[activeDow]}</strong>
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
