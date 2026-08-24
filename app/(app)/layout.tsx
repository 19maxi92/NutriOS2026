import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "./_components/Sidebar";

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
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "20px 20px 60px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 14,
          marginBottom: 20,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link href="/dashboard" style={{ color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "var(--accent)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            N
          </span>
          <strong style={{ fontSize: 14 }}>Consultorio Nutricional</strong>
        </Link>
        <span
          className="badge accent"
          style={{ fontSize: 12, padding: "4px 10px" }}
        >
          {profile?.full_name ?? user.email} · {profile?.role ?? "usuario"}
        </span>
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        <Sidebar />
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </div>
    </div>
  );
}
