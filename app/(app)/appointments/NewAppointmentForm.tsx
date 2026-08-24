"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewAppointmentForm({
  patients,
}: {
  patients: { id: string; first_name: string; last_name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [type, setType] = useState("control");
  const [modality, setModality] = useState("presencial");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    if (!patientId || !date) {
      setError("Elegí paciente y fecha.");
      return;
    }
    setError("");
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const startsAt = new Date(`${date}T${time}:00`);
    const endsAt = new Date(startsAt.getTime() + 30 * 60000);

    const { error: insertError } = await supabase.from("appointments").insert({
      patient_id: patientId,
      nutricionista_id: user?.id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      type,
      modality,
      status: "confirmado",
    });

    setSaving(false);
    if (insertError) {
      setError("No pudimos guardar el turno.");
      return;
    }
    setOpen(false);
    router.refresh();
  };

  if (!open) {
    return (
      <button className="primary" onClick={() => setOpen(true)}>
        + Nuevo turno
      </button>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Paciente</label>
          <br />
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)} style={{ width: "100%" }}>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.last_name}, {p.first_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Tipo</label>
          <br />
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: "100%" }}>
            <option value="primera">Primera consulta</option>
            <option value="control">Control</option>
            <option value="seguimiento">Seguimiento</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Fecha</label>
          <br />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Hora</label>
          <br />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: "100%" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Modalidad</label>
          <br />
          <select value={modality} onChange={(e) => setModality(e.target.value)} style={{ width: "100%" }}>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
          </select>
        </div>
      </div>
      {error && <p style={{ color: "#a32d2d", fontSize: 13, marginBottom: 8 }}>{error}</p>}
      <button className="primary" onClick={handleSave} disabled={saving} style={{ marginRight: 8 }}>
        {saving ? "Guardando…" : "Guardar turno"}
      </button>
      <button onClick={() => setOpen(false)}>Cancelar</button>
    </div>
  );
}
