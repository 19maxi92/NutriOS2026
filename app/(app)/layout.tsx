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
        <strong>Consultorio Nutricional</strong>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {profile?.full_name ?? user.email} · {profile?.role ?? "usuario"}
        </span>
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        <nav style={{ width: 160, flexShrink: 0 }}>
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/patients" label="Pacientes" />
          <NavLink href="/appointments" label="Agenda" />
          <NavLink href="/audit" label="Auditoría" />
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
