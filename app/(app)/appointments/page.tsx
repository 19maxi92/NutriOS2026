import { createClient } from "@/lib/supabase/server";
import NewAppointmentForm from "./NewAppointmentForm";

const STATUS_LABEL: Record<string, string> = {
  solicitado: "Solicitado",
  confirmado: "Confirmado",
  asistio: "Asistió",
  cancelado: "Cancelado",
  ausente: "Ausente",
  reprogramado: "Reprogramado",
};

export default async function AppointmentsPage() {
  const supabase = createClient();

  const { data: patients } = await supabase
    .from("patients")
    .select("id, first_name, last_name")
    .order("last_name");

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, starts_at, type, modality, status, patients(first_name, last_name)")
    .order("starts_at", { ascending: true });

  return (
    <div>
      <h1 style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>Agenda</h1>
      <div style={{ marginBottom: 12 }}>
        <NewAppointmentForm patients={patients ?? []} />
      </div>

      {!appointments?.length && (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          No hay turnos cargados todavía. Creá uno con el botón de arriba.
        </p>
      )}

      {appointments?.map((a: any) => (
        <div
          key={a.id}
          className="card"
          style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 13 }}>
              {a.patients?.first_name} {a.patients?.last_name}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
              {new Date(a.starts_at).toLocaleString("es-AR")} · {a.type} · {a.modality}
            </p>
          </div>
          <span className={a.status === "cancelado" || a.status === "ausente" ? "badge warn" : "badge ok"}>
            {STATUS_LABEL[a.status] ?? a.status}
          </span>
        </div>
      ))}
    </div>
  );
}
