"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AnthropometryForm({
  patientId,
  initial,
  onSaved,
}: {
  patientId: string;
  initial: { weight: number; height: number };
  onSaved?: () => void;
}) {
  const [weight, setWeight] = useState(initial.weight);
  const [height, setHeight] = useState(initial.height);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  const bmi = useMemo(() => {
    if (!height) return 0;
    return weight / Math.pow(height / 100, 2);
  }, [weight, height]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: record } = await supabase
      .from("anthropometry_records")
      .insert({
        patient_id: patientId,
        measured_by: user?.id,
        protocol: "ISAK1",
        source: "manual",
        raw_measurements_json: { weight, height },
      })
      .select()
      .single();

    if (record) {
      await supabase.from("anthropometry_calculations").insert({
        anthropometry_record_id: record.id,
        formula_name: "Índice de Masa Corporal (IMC)",
        formula_author: "Quetelet",
        formula_year: 1832,
        population: "adultos",
        result_value: Number(bmi.toFixed(1)),
        unit: "kg/m2",
      });
    }

    setSaving(false);
    setSaved(true);
    onSaved?.();
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Peso (kg)</label>
          <br />
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
            style={{ width: 100, marginTop: 4 }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Talla (cm)</label>
          <br />
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
            style={{ width: 100, marginTop: 4 }}
          />
        </div>
      </div>

      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
        IMC calculado (Quetelet, 1832)
      </p>
      <p style={{ fontSize: 22, fontWeight: 500, marginBottom: 12 }}>{bmi.toFixed(1)}</p>

      <button className="primary" onClick={handleSave} disabled={saving}>
        {saving ? "Guardando…" : "Guardar antropometría"}
      </button>
      {saved && (
        <span style={{ marginLeft: 10, fontSize: 13, color: "var(--ok-text)" }}>
          Guardado.
        </span>
      )}
    </div>
  );
}
