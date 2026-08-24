import { createClient } from "@/lib/supabase/server";
import NewRecipeForm from "./NewRecipeForm";
import CompareTool from "./CompareTool";

export default async function FoodsPage() {
  const supabase = createClient();

  const { data: foods } = await supabase
    .from("foods")
    .select("id, name, food_sources(name), food_nutrients(value_per_100g, nutrients(name))")
    .order("name");

  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, name, servings, recipe_ingredients(quantity, foods(name, food_nutrients(value_per_100g, nutrients(name))))")
    .order("name");

  const withTotals = (nutrientRows: any[]) => {
    const m: Record<string, number> = { Energía: 0, Proteínas: 0, Carbohidratos: 0, Grasas: 0 };
    nutrientRows.forEach((fn: any) => {
      const key = fn.nutrients?.name;
      if (key && key in m) m[key] = fn.value_per_100g;
    });
    return m;
  };

  const foodItems = (foods ?? []).map((f: any) => ({
    id: f.id,
    name: f.name,
    source: f.food_sources?.name ?? "—",
    kind: "Alimento",
    nutrients: withTotals(f.food_nutrients ?? []),
  }));

  const recipeItems = (recipes ?? []).map((r: any) => {
    const totals = { Energía: 0, Proteínas: 0, Carbohidratos: 0, Grasas: 0 };
    (r.recipe_ingredients ?? []).forEach((ing: any) => {
      const n = withTotals(ing.foods?.food_nutrients ?? []);
      const factor = (ing.quantity || 0) / 100;
      totals.Energía += n.Energía * factor;
      totals.Proteínas += n.Proteínas * factor;
      totals.Carbohidratos += n.Carbohidratos * factor;
      totals.Grasas += n.Grasas * factor;
    });
    return {
      id: r.id,
      name: r.name + ` (${r.servings} porc.)`,
      source: "Receta propia",
      kind: "Plato",
      // normalizado "por porción completa" para que se pueda comparar contra un alimento por 100g
      nutrients: totals,
    };
  });

  const allItems = [...foodItems, ...recipeItems];

  return (
    <div>
      <h1 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Base de alimentos y platos</h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
        Cada alimento indica su fuente (SARA 2 / USDA / LATINFOODS). Los platos se calculan a
        partir de sus ingredientes y quedan disponibles para usar en cualquier plan.
      </p>

      <div style={{ marginBottom: 16 }}>
        <NewRecipeForm foods={foods ?? []} />
      </div>

      <CompareTool items={allItems} />

      <h2 style={{ fontSize: 14, fontWeight: 500, margin: "24px 0 8px" }}>Alimentos</h2>
      <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: 12 }}>
            <th style={{ padding: "4px 0" }}>Nombre</th>
            <th>Fuente</th>
            <th>Kcal/100g</th>
            <th>Prot.</th>
            <th>Carb.</th>
            <th>Grasas</th>
          </tr>
        </thead>
        <tbody>
          {foodItems.map((f) => (
            <tr key={f.id} style={{ borderTop: "1px solid var(--border)" }}>
              <td style={{ padding: "6px 0" }}>{f.name}</td>
              <td>{f.source}</td>
              <td>{f.nutrients.Energía.toFixed(0)}</td>
              <td>{f.nutrients.Proteínas.toFixed(1)}</td>
              <td>{f.nutrients.Carbohidratos.toFixed(1)}</td>
              <td>{f.nutrients.Grasas.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontSize: 14, fontWeight: 500, margin: "24px 0 8px" }}>Platos guardados</h2>
      {!recipeItems.length && (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Todavía no armaste ningún plato.</p>
      )}
      <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
        <tbody>
          {recipeItems.map((r) => (
            <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
              <td style={{ padding: "6px 0" }}>{r.name}</td>
              <td>{r.nutrients.Energía.toFixed(0)} kcal totales</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
