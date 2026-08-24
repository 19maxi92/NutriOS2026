import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 12,
          marginBottom: 16,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link href="/dashboard" style={{ color: "var(--text)" }}>
          <strong>Consultorio Nutricional</strong>
        </Link>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {profile?.full_name ?? user.email} · {profile?.role ?? "usuario"}
        </span>
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        <nav style={{ width: 168, flexShrink: 0 }}>
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/patients" label="Pacientes" />
          <NavLink href="/appointments" label="Agenda" />
          <NavLink href="/foods" label="Alimentos" />
          <NavLink href="/audit" label="Auditoría" />
          <NavLink href="/settings" label="Configuración" />

          <p
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: 0.4,
              margin: "16px 0 4px 10px",
            }}
          >
            En construcción
          </p>
          <NavLink href="/ai-assistant" label="Asistente IA" />
          <NavLink href="/photos" label="Análisis de fotos" />
          <NavLink href="/templates" label="Plantillas" />
          <NavLink href="/reports" label="Informes" />
          <NavLink href="/patient-portal" label="Portal paciente" />
          <NavLink href="/events" label="Eventos" />
          <NavLink href="/messages" label="Comunicación" />
          <NavLink href="/security" label="Seguridad avanzada" />
        </nav>
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </div>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "8px 10px",
        borderRadius: 8,
        color: "var(--text)",
        fontSize: 13,
        marginBottom: 2,
      }}
    >
      {label}
    </Link>
  );
}
