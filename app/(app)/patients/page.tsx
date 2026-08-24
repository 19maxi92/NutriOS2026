import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NewPatientForm from "./NewPatientForm";

export default async function PatientsPage() {
  const supabase = createClient();
  const { data: patients } = await supabase
    .from("patients")
    .select("id, first_name, last_name, dni, birth_date, health_insurance")
    .order("last_name", { ascending: true });

  return (
    <div>
      <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>Pacientes</h1>
      <div style={{ marginBottom: 14 }}>
        <NewPatientForm />
      </div>

      {!patients?.length && (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          No hay pacientes todavía. Corré <code>supabase/seed.sql</code> para cargar los de
          ejemplo.
        </p>
      )}

      {patients?.map((p) => {
        const initials = (p.first_name?.[0] ?? "") + (p.last_name?.[0] ?? "");
        const age = p.birth_date
          ? Math.floor((Date.now() - new Date(p.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000))
          : null;
        return (
          <Link key={p.id} href={`/patients/${p.id}`} className="card-link">
            <div
              className="card"
              style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="avatar">{initials}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                    {p.last_name}, {p.first_name}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
                    DNI {p.dni ?? "—"}
                    {age ? ` · ${age} años` : ""} · {p.health_insurance ?? "sin obra social"}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
