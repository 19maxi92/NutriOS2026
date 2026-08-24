import { createClient } from "@/lib/supabase/server";
import NewAppointmentForm from "./NewAppointmentForm";
import AppointmentRow from "./AppointmentRow";

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
        <AppointmentRow key={a.id} appointment={a} />
      ))}
    </div>
  );
}
