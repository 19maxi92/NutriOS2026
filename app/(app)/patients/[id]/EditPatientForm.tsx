"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditPatientForm({ patient }: { patient: any }) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(patient.phone ?? "");
  const [email, setEmail] = useState(patient.email ?? "");
  const [healthInsurance, setHealthInsurance] = useState(patient.health_insurance ?? "");
  const [notes, setNotes] = useState(patient.notes ?? "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const save = async () => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase
      .from("patients")
      .update({
        phone,
        email,
        health_insurance: healthInsurance,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", patient.id);

    await supabase.from("audit_log").insert({
      actor_id: user?.id,
      action: "UPDATE",
      entity_type: "patient",
      entity_id: patient.id,
      field_changed: "datos de contacto",
    });

    setSaving(false);
    setOpen(false);
    router.refresh();
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ fontSize: 12 }}>
        Editar datos
      </button>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Teléfono</label>
          <br />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Email</label>
          <br />
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Obra social</label>
          <br />
          <input value={healthInsurance} onChange={(e) => setHealthInsurance(e.target.value)} style={{ width: "100%" }} />
        </div>
      </div>
      <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Notas</label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ width: "100%", marginTop: 4, marginBottom: 10 }} />
      <button className="primary" onClick={save} disabled={saving} style={{ marginRight: 8 }}>
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
      <button onClick={() => setOpen(false)}>Cancelar</button>
    </div>
  );
}
