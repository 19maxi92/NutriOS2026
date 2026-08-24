import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function PatientsPage() {
  const supabase = createClient();
  const { data: patients } = await supabase
    .from("patients")
    .select("id, first_name, last_name, dni, birth_date")
    .order("last_name", { ascending: true });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h1 style={{ fontSize: 16, fontWeight: 500 }}>Pacientes</h1>
      </div>
      {!patients?.length && (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          No hay pacientes todavía. Corré <code>supabase/seed.sql</code> para
          cargar los de ejemplo.
        </p>
      )}
      {patients?.map((p) => (
        <Link key={p.id} href={`/patients/${p.id}`}>
          <div
            className="card"
            style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}
          >
            <span>
              {p.last_name}, {p.first_name}
            </span>
            <span style={{ color: "var(--text-muted)" }}>DNI {p.dni}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
