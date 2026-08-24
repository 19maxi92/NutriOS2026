"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EvolucionTab({ patientId }: { patientId: string }) {
  const supabase = createClient();
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [saving, setSaving] = useState(false);
  const [metric, setMetric] = useState<"weight" | "body_fat_pct">("weight");

  const load = async () => {
    const { data } = await supabase
      .from("follow_up_snapshots")
      .select("id, date, weight, waist, body_fat_pct, muscle_mass")
      .eq("patient_id", patientId)
      .order("date", { ascending: true });
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
      body_fat_pct: bodyFat ? parseFloat(bodyFat) : null,
      date: new Date().toISOString().slice(0, 10),
    });
    setWeight("");
    setWaist("");
    setBodyFat("");
    setSaving(false);
    load();
  };

  const hasBodyFat = snapshots.some((s) => s.body_fat_pct != null);
  const values = snapshots.map((s) => (metric === "weight" ? s.weight : s.body_fat_pct) || 0);
  const max = Math.max(...values, 1);
  const min = Math.min(...values.filter((v) => v > 0), max);
  const range = Math.max(max - min, 1);

  return (
    <div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
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
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>% graso</label>
            <br />
            <input value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} type="number" style={{ width: 90 }} />
          </div>
          <button className="primary" onClick={add} disabled={saving}>
            {saving ? "Guardando…" : "Registrar snapshot"}
          </button>
        </div>
      </div>

      {!snapshots.length && (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Sin registros de evolución todavía.</p>
      )}

      {snapshots.length > 1 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            <button
              onClick={() => setMetric("weight")}
              style={{
                fontSize: 12,
                background: metric === "weight" ? "var(--text)" : "var(--surface)",
                color: metric === "weight" ? "#fff" : "var(--text)",
              }}
            >
              Peso
            </button>
            {hasBodyFat && (
              <button
                onClick={() => setMetric("body_fat_pct")}
                style={{
                  fontSize: 12,
                  background: metric === "body_fat_pct" ? "var(--text)" : "var(--surface)",
                  color: metric === "body_fat_pct" ? "#fff" : "var(--text)",
                }}
              >
                % graso
              </button>
            )}
          </div>
          <svg viewBox="0 0 300 90" width="100%" height="90" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              points={snapshots
                .map((s, i) => {
                  const v = (metric === "weight" ? s.weight : s.body_fat_pct) || 0;
                  const x = (i / Math.max(snapshots.length - 1, 1)) * 290 + 5;
                  const y = 80 - ((v - min) / range) * 65;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
            {snapshots.map((s, i) => {
              const v = (metric === "weight" ? s.weight : s.body_fat_pct) || 0;
              const x = (i / Math.max(snapshots.length - 1, 1)) * 290 + 5;
              const y = 80 - ((v - min) / range) * 65;
              return <circle key={s.id} cx={x} cy={y} r="2.5" fill="var(--accent-strong)" />;
            })}
          </svg>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            {new Date(snapshots[0].date).toLocaleDateString("es-AR")} →{" "}
            {new Date(snapshots[snapshots.length - 1].date).toLocaleDateString("es-AR")}
          </p>
        </div>
      )}

      {[...snapshots].reverse().map((s) => (
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
          <span style={{ fontSize: 13 }}>
            {s.weight} kg
            {s.waist ? ` · cintura ${s.waist} cm` : ""}
            {s.body_fat_pct ? ` · % graso ${s.body_fat_pct}` : ""}
            {s.muscle_mass ? ` · masa muscular ${s.muscle_mass} kg` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}
