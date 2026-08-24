"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ROLES = ["admin", "nutricionista", "recepcion"];

export default function RoleManager({ profiles }: { profiles: any[] }) {
  const [saving, setSaving] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const changeRole = async (userId: string, role: string) => {
    setSaving(userId);
    await supabase.from("profiles").update({ role }).eq("id", userId);
    setSaving(null);
    router.refresh();
  };

  if (!profiles.length) {
    return (
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
        Todavía no hay perfiles cargados en <code>profiles</code>.
      </p>
    );
  }

  return (
    <div>
      {profiles.map((p) => (
        <div
          key={p.id}
          className="card"
          style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 13 }}>{p.full_name}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
              {p.license_number ?? "sin matrícula"}
            </p>
          </div>
          <select
            value={p.role}
            onChange={(e) => changeRole(p.id, e.target.value)}
            disabled={saving === p.id}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
