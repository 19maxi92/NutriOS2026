import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();

  const { count: patientsCount } = await supabase
    .from("patients")
    .select("*", { count: "exact", head: true });

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, starts_at, status, patients(first_name, last_name)")
    .order("starts_at", { ascending: true })
    .limit(5);

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0,1fr))",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <div className="card">
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 6px" }}>
            Pacientes totales
          </p>
          <p style={{ fontSize: 24, fontWeight: 500, margin: 0 }}>{patientsCount ?? 0}</p>
        </div>
        <div className="card">
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 6px" }}>
            Próximos turnos
          </p>
          <p style={{ fontSize: 24, fontWeight: 500, margin: 0 }}>
            {appointments?.length ?? 0}
          </p>
        </div>
        <div className="card">
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 6px" }}>
            Estado
          </p>
          <p style={{ fontSize: 24, fontWeight: 500, margin: 0 }}>MVP 1</p>
        </div>
      </div>

      <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Próximos turnos</h2>
      {!appointments?.length && (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Todavía no cargaste turnos. Cargalos en Supabase (tabla{" "}
          <code>appointments</code>) o construí la pantalla de agenda en el
          siguiente sprint.
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
