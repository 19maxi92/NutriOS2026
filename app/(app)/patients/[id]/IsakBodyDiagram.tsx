const SKINFOLDS = [
  { n: 1, label: "Tríceps", x: 152, y: 128 },
  { n: 2, label: "Subescapular", x: 100, y: 118 },
  { n: 3, label: "Bíceps", x: 88, y: 128 },
  { n: 4, label: "Cresta ilíaca", x: 150, y: 178 },
  { n: 5, label: "Supraespinal", x: 138, y: 168 },
  { n: 6, label: "Abdominal", x: 120, y: 185 },
  { n: 7, label: "Muslo frontal", x: 112, y: 260 },
  { n: 8, label: "Pierna medial", x: 108, y: 340 },
];

const PERIMETERS = [
  { n: 9, label: "Brazo relajado", x: 84, y: 122 },
  { n: 10, label: "Cintura", x: 120, y: 175 },
  { n: 11, label: "Cadera", x: 120, y: 200 },
];

export default function IsakBodyDiagram() {
  const allPoints = [...SKINFOLDS, ...PERIMETERS];

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Sitios de medición — perfil ISAK</p>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
        Referencia esquemática, vista anterior. Herramienta de registro basada en protocolos ISAK
        — no es software oficial ISAK ni reemplaza la formación específica del antropometrista.
      </p>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
        <svg viewBox="0 0 240 400" width="180" height="300" role="img" aria-label="Silueta corporal con puntos de medición ISAK">
          <g fill="none" stroke="var(--border-strong)" strokeWidth="2">
            <circle cx="120" cy="30" r="18" />
            <line x1="120" y1="48" x2="120" y2="60" />
            <path d="M85,60 L155,60 L150,150 L90,150 Z" />
            <path d="M90,150 L150,150 L155,180 L85,180 Z" />
            <line x1="85" y1="180" x2="95" y2="330" />
            <line x1="155" y1="180" x2="145" y2="330" />
            <line x1="95" y1="330" x2="93" y2="380" />
            <line x1="145" y1="330" x2="147" y2="380" />
            <line x1="85" y1="65" x2="55" y2="150" />
            <line x1="155" y1="65" x2="185" y2="150" />
            <line x1="55" y1="150" x2="50" y2="200" />
            <line x1="185" y1="150" x2="190" y2="200" />
          </g>
          {allPoints.map((p) => (
            <g key={p.n}>
              <circle cx={p.x} cy={p.y} r="7" fill="var(--accent)" stroke="var(--surface)" strokeWidth="1.5" />
              <text x={p.x} y={p.y + 3.5} fontSize="8" textAnchor="middle" fill="#fff" fontWeight="600">
                {p.n}
              </text>
            </g>
          ))}
        </svg>

        <div style={{ flex: 1, minWidth: 160 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", margin: "0 0 4px", textTransform: "uppercase" }}>
            Pliegues cutáneos
          </p>
          {SKINFOLDS.map((p) => (
            <p key={p.n} style={{ fontSize: 12, margin: "2px 0" }}>
              <strong>{p.n}.</strong> {p.label}
            </p>
          ))}
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", margin: "10px 0 4px", textTransform: "uppercase" }}>
            Perímetros
          </p>
          {PERIMETERS.map((p) => (
            <p key={p.n} style={{ fontSize: 12, margin: "2px 0" }}>
              <strong>{p.n}.</strong> {p.label}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
