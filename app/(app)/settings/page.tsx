import { createClient } from "@/lib/supabase/server";
import RoleManager from "./RoleManager";

export default async function SettingsPage() {
  const supabase = createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, license_number")
    .order("full_name");

  return (
    <div>
      <h1 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Configuración</h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>
        Roles del equipo. Hoy: <code>admin</code> y <code>nutricionista</code> ven todo lo
        clínico; <code>recepcion</code> solo ve pacientes y agenda (ver{" "}
        <code>supabase/rls_hardening.sql</code>).
      </p>

      <RoleManager profiles={profiles ?? []} />

      <div className="card" style={{ marginTop: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
          Lo que falta acá (fuera del alcance de esta demo)
        </p>
        <ul style={{ fontSize: 13, color: "var(--text-muted)", paddingLeft: 18, margin: 0 }}>
          <li>Configuración de horarios de agenda, feriados y vacaciones</li>
          <li>Marca/branding del consultorio (logo, colores del PDF)</li>
          <li>Política de retención de datos e integraciones (Google Calendar, Mercado Pago)</li>
        </ul>
      </div>
    </div>
  );
}
