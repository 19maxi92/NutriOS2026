"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AnthropometryForm from "./AnthropometryForm";

export default function AntropometriaTab({
  patientId,
  initial,
}: {
  patientId: string;
  initial: { weight: number; height: number };
}) {
  const supabase = createClient();
  const [history, setHistory] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("anthropometry_records")
        .select("id, measured_at, protocol, raw_measurements_json, anthropometry_calculations(formula_name, result_value, unit)")
        .eq("patient_id", patientId)
        .order("measured_at", { ascending: false });
      setHistory(data ?? []);
    })();
  }, [patientId, refreshKey]);

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <AnthropometryForm
          patientId={patientId}
          initial={initial}
          onSaved={() => setRefreshKey((k) => k + 1)}
        />
      </div>

      <h3 style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Historial</h3>
      {!history.length && (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Sin mediciones cargadas todavía.</p>
      )}
      {history.map((h) => (
        <div key={h.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
            {new Date(h.measured_at).toLocaleString("es-AR")} · protocolo {h.protocol}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 13 }}>
            Peso {h.raw_measurements_json?.weight} kg · Talla {h.raw_measurements_json?.height} cm
            {h.anthropometry_calculations?.[0] &&
              ` · IMC ${h.anthropometry_calculations[0].result_value} ${h.anthropometry_calculations[0].unit}`}
          </p>
        </div>
      ))}
    </div>
  );
}
