"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewPatientForm({ onDone }: { onDone?: () => void }) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("Nombre y apellido son obligatorios.");
      return;
    }
    setError("");
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: patient, error: insertError } = await supabase
      .from("patients")
      .insert({
        first_name: firstName,
        last_name: lastName,
        dni,
        phone,
        owner_user_id: user?.id,
      })
      .select()
      .single();

    setSaving(false);

    if (insertError || !patient) {
      setError("No pudimos guardar el paciente.");
      return;
    }

    await supabase.from("audit_log").insert({
      actor_id: user?.id,
      action: "CREATE",
      entity_type: "patient",
      entity_id: patient.id,
    });

    setOpen(false);
    setFirstName("");
    setLastName("");
    setDni("");
    setPhone("");
    router.refresh();
    onDone?.();
  };

  if (!open) {
    return (
      <button className="primary" onClick={() => setOpen(true)}>
        + Nuevo paciente
      </button>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Nombre</label>
          <br />
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ width: "100%" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Apellido</label>
          <br />
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ width: "100%" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>DNI</label>
          <br />
          <input value={dni} onChange={(e) => setDni(e.target.value)} style={{ width: "100%" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Teléfono</label>
          <br />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%" }} />
        </div>
      </div>
      {error && <p style={{ color: "#a32d2d", fontSize: 13, marginBottom: 8 }}>{error}</p>}
      <button className="primary" onClick={handleSave} disabled={saving} style={{ marginRight: 8 }}>
        {saving ? "Guardando…" : "Guardar paciente"}
      </button>
      <button onClick={() => setOpen(false)}>Cancelar</button>
    </div>
  );
}
