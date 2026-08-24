"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const SECTIONS = [
  "Motivo de consulta",
  "Antecedentes patológicos",
  "Antecedentes familiares",
  "Medicación / suplementos",
  "Alergias e intolerancias",
  "Hábitos y actividad física",
  "Objetivos",
];

export default function AnamnesisTab({ patientId }: { patientId: string }) {
  const supabase = createClient();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("anamnesis_responses")
        .select("answers_json, completed_at")
        .eq("patient_id", patientId)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setAnswers(data.answers_json ?? {});
        setSavedAt(data.completed_at);
      }
      setLoading(false);
    })();
  }, [patientId]);

  const save = async () => {
    setSaving(true);
    await supabase.from("anamnesis_responses").insert({
      patient_id: patientId,
      answers_json: answers,
      completed_at: new Date().toISOString(),
    });
    setSaving(false);
    setSavedAt(new Date().toISOString());
  };

  if (loading) return <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Cargando…</p>;

  return (
    <div>
      {SECTIONS.map((s) => (
        <div key={s} style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>{s}</label>
          <textarea
            rows={2}
            value={answers[s] ?? ""}
            onChange={(e) => setAnswers({ ...answers, [s]: e.target.value })}
            style={{ width: "100%", marginTop: 4, resize: "vertical" }}
          />
        </div>
      ))}
      <button className="primary" onClick={save} disabled={saving}>
        {saving ? "Guardando…" : "Guardar anamnesis"}
      </button>
      {savedAt && (
        <span style={{ marginLeft: 10, fontSize: 12, color: "var(--text-muted)" }}>
          Última actualización: {new Date(savedAt).toLocaleString("es-AR")}
        </span>
      )}
    </div>
  );
}
