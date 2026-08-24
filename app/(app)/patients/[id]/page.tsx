import { createClient } from "@/lib/supabase/server";
import PatientTabs from "./PatientTabs";
import EditPatientForm from "./EditPatientForm";

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!patient) {
    return <p>Paciente no encontrado.</p>;
  }

  const { data: anthro } = await supabase
    .from("anthropometry_records")
    .select("raw_measurements_json")
    .eq("patient_id", params.id)
    .order("measured_at", { ascending: false })
    .limit(1);

  // Registrar el acceso en el audit log — Ley 26.529 / 25.326
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.from("audit_log").insert({
    actor_id: user?.id,
    action: "VIEW",
    entity_type: "patient",
    entity_id: patient.id,
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
            {patient.first_name} {patient.last_name}
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
            DNI {patient.dni ?? "—"} · Obra social: {patient.health_insurance ?? "—"} · Tel:{" "}
            {patient.phone ?? "—"}
          </p>
        </div>
        <EditPatientForm patient={patient} />
      </div>

      <div style={{ marginBottom: 8 }} />

      <PatientTabs
        patientId={patient.id}
        initialAnthro={anthro?.[0]?.raw_measurements_json ?? { weight: 70, height: 170 }}
      />
    </div>
  );
}
