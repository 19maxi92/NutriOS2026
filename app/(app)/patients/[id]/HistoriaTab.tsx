"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Entry = {
  id: string;
  entry_type: string;
  content_json: any;
  created_at: string;
};

export default function HistoriaTab({ patientId }: { patientId: string }) {
  const supabase = createClient();
  const [recordId, setRecordId] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    let { data: record } = await supabase
      .from("clinical_records")
      .select("id")
      .eq("patient_id", patientId)
      .maybeSingle();

    if (!record) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: created } = await supabase
        .from("clinical_records")
        .insert({ patient_id: patientId, created_by: user?.id })
        .select()
        .single();
      record = created;
      if (created) {
        await supabase.from("clinical_record_entries").insert({
          clinical_record_id: created.id,
          author_id: user?.id,
          entry_type: "apertura",
          content_json: { texto: "Apertura de historia clínica" },
        });
      }
    }

    if (record) {
      setRecordId(record.id);
      const { data: rows } = await supabase
        .from("clinical_record_entries")
        .select("id, entry_type, content_json, created_at")
        .eq("clinical_record_id", record.id)
        .order("created_at", { ascending: false });
      setEntries(rows ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const addNote = async () => {
    if (!note.trim() || !recordId) return;
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("clinical_record_entries").insert({
      clinical_record_id: recordId,
      author_id: user?.id,
      entry_type: "nota",
      content_json: { texto: note },
    });
    setNote("");
    setSaving(false);
    load();
  };

  if (loading) return <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Cargando…</p>;

  return (
    <div>
      <div
        style={{
          background: "var(--accent-bg)",
          color: "var(--accent)",
          fontSize: 12,
          padding: "8px 10px",
          borderRadius: 8,
          marginBottom: 14,
        }}
      >
        Historia clínica foliada y cronológica (Ley 26.529). Nunca se sobrescribe: cada entrada es un
        nuevo registro, con autor y fecha.
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Agregar nota clínica…"
          style={{ flex: 1 }}
        />
        <button className="primary" onClick={addNote} disabled={saving}>
          {saving ? "Guardando…" : "Agregar"}
        </button>
      </div>

      {entries.map((en) => (
        <div key={en.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
            {new Date(en.created_at).toLocaleString("es-AR")} · {en.entry_type}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 13 }}>
            {en.content_json?.texto ?? JSON.stringify(en.content_json)}
          </p>
        </div>
      ))}
    </div>
  );
}
