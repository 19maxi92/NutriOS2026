"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MEAL_TYPES = ["desayuno", "media_manana", "almuerzo", "merienda", "cena"];

export default function RegistroAlimentarioTab({ patientId }: { patientId: string }) {
  const supabase = createClient();
  const [entries, setEntries] = useState<any[]>([]);
  const [mealType, setMealType] = useState(MEAL_TYPES[0]);
  const [description, setDescription] = useState("");
  const [hunger, setHunger] = useState(5);
  const [satiety, setSatiety] = useState(5);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("food_diary_entries")
      .select("id, logged_at, meal_type, description, hunger, satiety")
      .eq("patient_id", patientId)
      .order("logged_at", { ascending: false });
    setEntries(data ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const save = async () => {
    if (!description.trim()) return;
    setSaving(true);
    await supabase.from("food_diary_entries").insert({
      patient_id: patientId,
      meal_type: mealType,
      description,
      hunger,
      satiety,
    });
    setDescription("");
    setSaving(false);
    load();
  };

  return (
    <div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
        En producción esto lo carga el paciente desde su portal (PWA, MVP4). Acá el profesional
        puede cargarlo manualmente para revisarlo en la consulta.
      </p>

      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
          <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
            {MEAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Qué comió…"
            style={{ flex: 1, minWidth: 160 }}
          />
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 8 }}>
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Hambre previa: {hunger}
            <input type="range" min={0} max={10} value={hunger} onChange={(e) => setHunger(parseInt(e.target.value))} />
          </label>
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Saciedad posterior: {satiety}
            <input type="range" min={0} max={10} value={satiety} onChange={(e) => setSatiety(parseInt(e.target.value))} />
          </label>
        </div>
        <button className="primary" onClick={save} disabled={saving}>
          {saving ? "Guardando…" : "Registrar comida"}
        </button>
      </div>

      {!entries.length && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Sin registros todavía.</p>}
      {entries.map((e) => (
        <div key={e.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
            {new Date(e.logged_at).toLocaleString("es-AR")} · {e.meal_type}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 13 }}>
            {e.description} <span style={{ color: "var(--text-muted)" }}>(hambre {e.hunger}, saciedad {e.satiety})</span>
          </p>
        </div>
      ))}
    </div>
  );
}
