const PHASE_LABEL: Record<string, string> = {
  mvp2: "Planeado — MVP 2",
  mvp3: "Planeado — MVP 3",
  mvp4: "Planeado — MVP 4",
};

export default function ComingSoon({
  title,
  phase,
  summary,
  willDo,
  wontDo,
}: {
  title: string;
  phase: "mvp2" | "mvp3" | "mvp4";
  summary: string;
  willDo: string[];
  wontDo?: string[];
}) {
  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <h1 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>{title}</h1>
        <span className="badge warn">{PHASE_LABEL[phase]}</span>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>{summary}</p>

      <div className="card" style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Qué va a hacer</p>
        <ul style={{ fontSize: 13, color: "var(--text-muted)", paddingLeft: 18, margin: 0 }}>
          {willDo.map((w) => (
            <li key={w} style={{ marginBottom: 4 }}>
              {w}
            </li>
          ))}
        </ul>
      </div>

      {wontDo && wontDo.length > 0 && (
        <div
          className="card"
          style={{ background: "var(--warn-bg)", borderColor: "transparent", marginBottom: 14 }}
        >
          <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--warn-text)" }}>
            Lo que esto nunca va a hacer solo
          </p>
          <ul style={{ fontSize: 13, color: "var(--warn-text)", paddingLeft: 18, margin: 0 }}>
            {wontDo.map((w) => (
              <li key={w} style={{ marginBottom: 4 }}>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
        No implementado en esta demo — se muestra para tener dimensión completa del producto antes
        de decidir el orden de construcción real.
      </p>
    </div>
  );
}
