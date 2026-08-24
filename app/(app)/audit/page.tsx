import { createClient } from "@/lib/supabase/server";

export default async function AuditPage() {
  const supabase = createClient();

  const { data: logs } = await supabase
    .from("audit_log")
    .select("id, action, entity_type, entity_id, field_changed, old_value, new_value, at")
    .order("at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Auditoría</h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
        Registro de accesos y cambios sobre datos clínicos (Ley 26.529 / 25.326). Últimos 100 eventos.
      </p>
      {!logs?.length && (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Todavía no hay eventos registrados.</p>
      )}
      {logs?.map((l) => (
        <div key={l.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
            {new Date(l.at).toLocaleString("es-AR")} · {l.action}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 13 }}>
            {l.entity_type}
            {l.entity_id ? ` #${String(l.entity_id).slice(0, 8)}` : ""}
            {l.field_changed ? ` · ${l.field_changed}: ${l.old_value} → ${l.new_value}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
