"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const STATUS_OPTIONS = ["solicitado", "confirmado", "asistio", "cancelado", "ausente", "reprogramado"];

const STATUS_LABEL: Record<string, string> = {
  solicitado: "Solicitado",
  confirmado: "Confirmado",
  asistio: "Asistió",
  cancelado: "Cancelado",
  ausente: "Ausente",
  reprogramado: "Reprogramado",
};

export default function AppointmentRow({ appointment }: { appointment: any }) {
  const [status, setStatus] = useState(appointment.status);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const updateStatus = async (newStatus: string) => {
    setStatus(newStatus);
    setSaving(true);
    await supabase.from("appointments").update({ status: newStatus }).eq("id", appointment.id);
    setSaving(false);
    router.refresh();
  };

  const tone = status === "cancelado" || status === "ausente" ? "warn" : status === "asistio" ? "ok" : "";

  return (
    <div
      className="card"
      style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}
    >
      <div>
        <p style={{ margin: 0, fontSize: 13 }}>
          {appointment.patients?.first_name} {appointment.patients?.last_name}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
          {new Date(appointment.starts_at).toLocaleString("es-AR")} · {appointment.type} ·{" "}
          {appointment.modality}
        </p>
      </div>
      <select
        value={status}
        onChange={(e) => updateStatus(e.target.value)}
        disabled={saving}
        className={tone ? `badge ${tone}` : "badge"}
        style={{ border: "none" }}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
