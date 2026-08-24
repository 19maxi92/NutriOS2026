"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LaboratoriosTab({ patientId }: { patientId: string }) {
  const supabase = createClient();
  const [results, setResults] = useState<any[]>([]);
  const [analyte, setAnalyte] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [refRange, setRefRange] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("lab_results")
      .select("id, analyte, raw_value, unit, reference_range, result_date, validated_at")
      .eq("patient_id", patientId)
      .order("result_date", { ascending: false });
    setResults(data ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const save = async () => {
    if (!analyte.trim() || !value.trim()) return;
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const normalized = parseFloat(value.replace(",", "."));

    await supabase.from("lab_results").insert({
      patient_id: patientId,
      analyte,
      raw_value: value,
      unit,
      reference_range: refRange,
      normalized_value: isNaN(normalized) ? null : normalized,
      result_date: date,
      // en la demo se guarda ya validado por el profesional (carga manual, no extracción por IA)
      validated_by: user?.id,
      validated_at: new Date().toISOString(),
    });

    setAnalyte("");
    setValue("");
    setUnit("");
    setRefRange("");
    setSaving(false);
    load();
  };

  return (
    <div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
        Carga manual de valores de laboratorio. El motor de documentos con extracción automática
        por IA (subir PDF → detectar tabla → confianza → confirmar) es MVP3 — esta tabla ya está
        preparada para eso (columna <code>confidence</code> en <code>lab_results</code>).
      </p>

      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.8fr 0.6fr 1fr 0.9fr", gap: 8, marginBottom: 8 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Analito</label>
            <br />
            <input value={analyte} onChange={(e) => setAnalyte(e.target.value)} placeholder="Glucosa" style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Valor</label>
            <br />
            <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="102" style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Unidad</label>
            <br />
            <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="mg/dL" style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Rango de referencia</label>
            <br />
            <input value={refRange} onChange={(e) => setRefRange(e.target.value)} placeholder="70-100" style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Fecha</label>
            <br />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%" }} />
          </div>
        </div>
        <button className="primary" onClick={save} disabled={saving}>
          {saving ? "Guardando…" : "Agregar valor"}
        </button>
      </div>

      {!results.length && (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Sin valores de laboratorio cargados.</p>
      )}
      {results.map((r) => (
        <div
          key={r.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 0",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: 13 }}>{r.analyte}</span>
          <span style={{ fontSize: 13 }}>
            {r.raw_value} {r.unit}{" "}
            <span style={{ color: "var(--text-muted)" }}>
              (ref. {r.reference_range || "—"}) · {new Date(r.result_date).toLocaleDateString("es-AR")}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
