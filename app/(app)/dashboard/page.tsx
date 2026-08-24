import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();

  const { count: patientsCount } = await supabase
    .from("patients")
    .select("*", { count: "exact", head: true });

  const { count: draftPlans } = await supabase
    .from("meal_plans")
    .select("*", { count: "exact", head: true })
    .eq("status", "borrador");

  const { count: unvalidatedLabs } = await supabase
    .from("lab_results")
    .select("*", { count: "exact", head: true })
    .is("validated_at", null);

  const { count: openAnthro } = await supabase
    .from("anthropometry_records")
    .select("*", { count: "exact", head: true })
    .eq("is_closed", false);

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, starts_at, status, patients(first_name, last_name)")
    .order("starts_at", { ascending: true })
    .limit(5);

  const stats = [
    ["Pacientes totales", patientsCount ?? 0],
    ["Planes en borrador", draftPlans ?? 0],
    ["Laboratorios por revisar", unvalidatedLabs ?? 0],
    ["Antropometrías sin cerrar", openAnthro ?? 0],
  ];

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {stats.map(([label, value]) => (
          <div className="card" key={label as string}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 6px" }}>
              {label}
            </p>
            <p style={{ fontSize: 24, fontWeight: 500, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Próximos turnos</h2>
      {!appointments?.length && (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Todavía no cargaste turnos. Creá uno desde la sección Agenda.
        </p>
      )}
      {appointments?.map((a: any) => (
        <div
          key={a.id}
          className="card"
          style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}
        >
          <span>
            {a.patients?.first_name} {a.patients?.last_name}
          </span>
          <span style={{ color: "var(--text-muted)" }}>
            {new Date(a.starts_at).toLocaleString("es-AR")}
          </span>
        </div>
      ))}
    </div>
  );
}
