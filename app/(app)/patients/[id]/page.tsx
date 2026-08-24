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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="avatar" style={{ width: 46, height: 46, fontSize: 16 }}>
            {(patient.first_name?.[0] ?? "") + (patient.last_name?.[0] ?? "")}
          </span>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
              {patient.first_name} {patient.last_name}
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "2px 0 0" }}>
              DNI {patient.dni ?? "—"} · Obra social: {patient.health_insurance ?? "—"} · Tel:{" "}
              {patient.phone ?? "—"}
            </p>
          </div>
        </div>
        <EditPatientForm patient={patient} />
      </div>

      <div style={{ marginBottom: 16 }} />

      <PatientTabs
        patientId={patient.id}
        initialAnthro={anthro?.[0]?.raw_measurements_json ?? { weight: 70, height: 170 }}
      />
    </div>
  );
}
