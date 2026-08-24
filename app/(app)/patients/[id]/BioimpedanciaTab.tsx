"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BioimpedanciaTab({ patientId }: { patientId: string }) {
  const supabase = createClient();
  const [records, setRecords] = useState<any[]>([]);
  const [device, setDevice] = useState("InBody");
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [muscleMass, setMuscleMass] = useState("");
  const [visceralFat, setVisceralFat] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("bioimpedance_records")
      .select("id, device, measured_at, raw_data_json, source")
      .eq("patient_id", patientId)
      .order("measured_at", { ascending: false });
    setRecords(data ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const save = async () => {
    if (!weight) return;
    setSaving(true);
    await supabase.from("bioimpedance_records").insert({
      patient_id: patientId,
      device,
      source: "manual",
      raw_data_json: {
        weight: parseFloat(weight),
        body_fat_pct: bodyFat ? parseFloat(bodyFat) : null,
        muscle_mass: muscleMass ? parseFloat(muscleMass) : null,
        visceral_fat: visceralFat ? parseFloat(visceralFat) : null,
      },
    });
    setWeight("");
    setBodyFat("");
    setMuscleMass("");
    setVisceralFat("");
    setSaving(false);
    load();
  };

  return (
    <div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
        Módulo independiente de la antropometría manual (DEXA ≠ antropometría, InBody ≠
        antropometría). El dato crudo se guarda separado de cualquier interpretación.
      </p>

      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 8 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Equipo</label>
            <br />
            <select value={device} onChange={(e) => setDevice(e.target.value)} style={{ width: "100%" }}>
              <option value="InBody">InBody</option>
              <option value="SECA mBCA">SECA mBCA</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Peso (kg)</label>
            <br />
            <input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>% graso</label>
            <br />
            <input value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} type="number" style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Masa muscular (kg)</label>
            <br />
            <input value={muscleMass} onChange={(e) => setMuscleMass(e.target.value)} type="number" style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Grasa visceral</label>
            <br />
            <input value={visceralFat} onChange={(e) => setVisceralFat(e.target.value)} type="number" style={{ width: "100%" }} />
          </div>
        </div>
        <button className="primary" onClick={save} disabled={saving}>
          {saving ? "Guardando…" : "Registrar medición"}
        </button>
      </div>

      {!records.length && (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Sin mediciones de bioimpedancia.</p>
      )}
      {records.map((r) => (
        <div key={r.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
            {new Date(r.measured_at).toLocaleString("es-AR")} · {r.device}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 13 }}>
            Peso {r.raw_data_json?.weight} kg
            {r.raw_data_json?.body_fat_pct ? ` · % graso ${r.raw_data_json.body_fat_pct}` : ""}
            {r.raw_data_json?.muscle_mass ? ` · masa muscular ${r.raw_data_json.muscle_mass} kg` : ""}
            {r.raw_data_json?.visceral_fat ? ` · grasa visceral ${r.raw_data_json.visceral_fat}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
