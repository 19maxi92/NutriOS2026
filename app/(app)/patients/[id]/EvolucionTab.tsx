"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EvolucionTab({ patientId }: { patientId: string }) {
  const supabase = createClient();
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("follow_up_snapshots")
      .select("id, date, weight, waist, body_fat_pct")
      .eq("patient_id", patientId)
      .order("date", { ascending: false });
    setSnapshots(data ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const add = async () => {
    if (!weight) return;
    setSaving(true);
    await supabase.from("follow_up_snapshots").insert({
      patient_id: patientId,
      weight: parseFloat(weight),
      waist: waist ? parseFloat(waist) : null,
      date: new Date().toISOString().slice(0, 10),
    });
    setWeight("");
    setWaist("");
    setSaving(false);
    load();
  };

  const maxWeight = Math.max(...snapshots.map((s) => s.weight || 0), 1);

  return (
    <div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Peso (kg)</label>
            <br />
            <input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" style={{ width: 90 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Cintura (cm)</label>
            <br />
            <input value={waist} onChange={(e) => setWaist(e.target.value)} type="number" style={{ width: 90 }} />
          </div>
          <button className="primary" onClick={add} disabled={saving}>
            {saving ? "Guardando…" : "Registrar snapshot"}
          </button>
        </div>
      </div>

      {!snapshots.length && (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Sin registros de evolución todavía.</p>
      )}

      {snapshots.map((s) => (
        <div
          key={s.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 0",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--text-muted)", width: 90 }}>
            {new Date(s.date).toLocaleDateString("es-AR")}
          </span>
          <div
            style={{
              height: 8,
              background: "var(--accent)",
              borderRadius: 4,
              width: `${((s.weight || 0) / maxWeight) * 100}%`,
              minWidth: 4,
            }}
          />
          <span style={{ fontSize: 13 }}>
            {s.weight} kg{s.waist ? ` · cintura ${s.waist} cm` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}
