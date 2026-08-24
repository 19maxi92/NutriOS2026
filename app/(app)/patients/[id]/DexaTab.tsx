"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DexaTab({ patientId }: { patientId: string }) {
  const supabase = createClient();
  const [records, setRecords] = useState<any[]>([]);
  const [center, setCenter] = useState("");
  const [fatMass, setFatMass] = useState("");
  const [leanMass, setLeanMass] = useState("");
  const [boneMass, setBoneMass] = useState("");
  const [tScore, setTScore] = useState("");
  const [visceralFat, setVisceralFat] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("dexa_records")
      .select("id, center, measured_at, fat_mass, lean_mass, bone_mass, t_score, visceral_fat")
      .eq("patient_id", patientId)
      .order("measured_at", { ascending: false });
    setRecords(data ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const save = async () => {
    if (!fatMass && !leanMass) return;
    setSaving(true);
    await supabase.from("dexa_records").insert({
      patient_id: patientId,
      center,
      fat_mass: fatMass ? parseFloat(fatMass) : null,
      lean_mass: leanMass ? parseFloat(leanMass) : null,
      bone_mass: boneMass ? parseFloat(boneMass) : null,
      t_score: tScore ? parseFloat(tScore) : null,
      visceral_fat: visceralFat ? parseFloat(visceralFat) : null,
    });
    setCenter("");
    setFatMass("");
    setLeanMass("");
    setBoneMass("");
    setTScore("");
    setVisceralFat("");
    setSaving(false);
    load();
  };

  return (
    <div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
        DEXA no es lo mismo que antropometría ni bioimpedancia — módulo independiente, tal como
        pide el Master Planner.
      </p>

      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 8 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Centro</label>
            <br />
            <input value={center} onChange={(e) => setCenter(e.target.value)} style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Masa grasa (kg)</label>
            <br />
            <input value={fatMass} onChange={(e) => setFatMass(e.target.value)} type="number" style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Masa magra (kg)</label>
            <br />
            <input value={leanMass} onChange={(e) => setLeanMass(e.target.value)} type="number" style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Masa ósea (kg)</label>
            <br />
            <input value={boneMass} onChange={(e) => setBoneMass(e.target.value)} type="number" style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>T-score</label>
            <br />
            <input value={tScore} onChange={(e) => setTScore(e.target.value)} type="number" style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Grasa visceral</label>
            <br />
            <input value={visceralFat} onChange={(e) => setVisceralFat(e.target.value)} type="number" style={{ width: "100%" }} />
          </div>
        </div>
        <button className="primary" onClick={save} disabled={saving}>
          {saving ? "Guardando…" : "Registrar estudio DEXA"}
        </button>
      </div>

      {!records.length && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Sin estudios DEXA cargados.</p>}
      {records.map((r) => (
        <div key={r.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
            {new Date(r.measured_at).toLocaleString("es-AR")} · {r.center || "—"}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 13 }}>
            Grasa {r.fat_mass ?? "—"} kg · Magra {r.lean_mass ?? "—"} kg · Ósea {r.bone_mass ?? "—"} kg
            {r.t_score ? ` · T-score ${r.t_score}` : ""}
            {r.visceral_fat ? ` · visceral ${r.visceral_fat}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
