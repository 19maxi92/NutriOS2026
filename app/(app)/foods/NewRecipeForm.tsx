"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewRecipeForm({ foods }: { foods: any[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [servings, setServings] = useState(1);
  const [ingredients, setIngredients] = useState<{ foodId: string; quantity: number }[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const addIngredient = () => {
    if (!foods.length) return;
    setIngredients([...ingredients, { foodId: foods[0].id, quantity: 100 }]);
  };

  const save = async () => {
    if (!name.trim() || !ingredients.length) {
      setError("Poné un nombre y agregá al menos un ingrediente.");
      return;
    }
    setError("");
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: recipe, error: insertError } = await supabase
      .from("recipes")
      .insert({ name, servings, created_by: user?.id })
      .select()
      .single();

    if (insertError || !recipe) {
      setError("No pudimos guardar el plato.");
      setSaving(false);
      return;
    }

    await supabase.from("recipe_ingredients").insert(
      ingredients.map((ing) => ({
        recipe_id: recipe.id,
        food_id: ing.foodId,
        quantity: ing.quantity,
        unit: "g",
      }))
    );

    setSaving(false);
    setOpen(false);
    setName("");
    setIngredients([]);
    router.refresh();
  };

  if (!open) {
    return (
      <button className="primary" onClick={() => setOpen(true)}>
        + Nuevo plato
      </button>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Nombre del plato</label>
      <br />
      <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", marginTop: 4, marginBottom: 10 }} />

      <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Porciones</label>
      <br />
      <input
        type="number"
        value={servings}
        onChange={(e) => setServings(parseInt(e.target.value) || 1)}
        style={{ width: 80, marginTop: 4, marginBottom: 10 }}
      />

      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Ingredientes</p>
      {ingredients.map((ing, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
          <select
            value={ing.foodId}
            onChange={(e) => {
              const copy = [...ingredients];
              copy[i] = { ...ing, foodId: e.target.value };
              setIngredients(copy);
            }}
            style={{ flex: 1 }}
          >
            {foods.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={ing.quantity}
            onChange={(e) => {
              const copy = [...ingredients];
              copy[i] = { ...ing, quantity: parseFloat(e.target.value) || 0 };
              setIngredients(copy);
            }}
            style={{ width: 80 }}
          />
          <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>g</span>
        </div>
      ))}
      <button onClick={addIngredient} style={{ marginBottom: 10 }}>
        + Agregar ingrediente
      </button>

      {error && <p style={{ color: "#a32d2d", fontSize: 13, marginBottom: 8 }}>{error}</p>}
      <div>
        <button className="primary" onClick={save} disabled={saving} style={{ marginRight: 8 }}>
          {saving ? "Guardando…" : "Guardar plato"}
        </button>
        <button onClick={() => setOpen(false)}>Cancelar</button>
      </div>
    </div>
  );
}
