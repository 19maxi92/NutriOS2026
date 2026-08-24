"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const TYPES = ["laboratorio", "antropometria", "inbody", "dexa", "informe", "receta", "estudio"];

export default function DocumentosTab({ patientId }: { patientId: string }) {
  const supabase = createClient();
  const [docs, setDocs] = useState<any[]>([]);
  const [type, setType] = useState(TYPES[0]);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("documents")
      .select("id, type, origin, uploaded_at, validated_at")
      .eq("patient_id", patientId)
      .order("uploaded_at", { ascending: false });
    setDocs(data ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const register = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("documents").insert({
      patient_id: patientId,
      type,
      origin: name,
      uploaded_by: user?.id,
      extracted_json: {},
    });
    setName("");
    setSaving(false);
    load();
  };

  return (
    <div>
      <div
        style={{
          background: "var(--warn-bg)",
          color: "var(--warn-text)",
          fontSize: 12,
          padding: "8px 10px",
          borderRadius: 8,
          marginBottom: 14,
        }}
      >
        MVP1: acá solo se registra metadata del documento (tipo, origen, fecha). La subida de
        archivo real + extracción por IA con confidence score es MVP3, según el roadmap del Sprint
        0 — la tabla <code>documents</code> ya está preparada para eso.
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Tipo</label>
            <br />
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Origen / nombre</label>
            <br />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Laboratorio Stamboulian 20/08"
              style={{ width: "100%" }}
            />
          </div>
          <button className="primary" onClick={register} disabled={saving}>
            {saving ? "Guardando…" : "Registrar"}
          </button>
        </div>
      </div>

      {!docs.length && (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Sin documentos registrados.</p>
      )}
      {docs.map((d) => (
        <div key={d.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
            {new Date(d.uploaded_at).toLocaleString("es-AR")} · {d.type}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 13 }}>{d.origin}</p>
        </div>
      ))}
    </div>
  );
}
