import Link from "next/link";

const MODULES = [
  ["Pacientes", "Ficha única por paciente, hub de todo lo clínico y administrativo."],
  ["Historia clínica", "Timeline cronológico y foliado. Nunca se sobrescribe (Ley 26.529)."],
  ["Antropometría", "Protocolo ISAK, cálculos citados (fórmula, autor, fuente)."],
  ["Plan alimentario", "Constructor visual contra SARA 2 / USDA / LATINFOODS, con macros en vivo."],
  ["Laboratorios y bioimpedancia", "Carga de valores con trazabilidad y separación dato/interpretación."],
  ["Agenda", "Turnos por tipo, modalidad y estado."],
];

export default function LandingPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: "var(--accent-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 500,
            color: "var(--accent)",
          }}
        >
          N
        </div>
        <strong style={{ fontSize: 15 }}>Consultorio Nutricional</strong>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.3, margin: "16px 0 10px" }}>
        Todo tu consultorio, en un solo lugar.
      </h1>
      <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 28, maxWidth: 480 }}>
        Historia clínica, antropometría, laboratorios, planes alimentarios y agenda — sin Excel,
        sin Word, sin WhatsApp y sin planillas sueltas. Demo funcional en desarrollo.
      </p>

      <Link href="/login">
        <button className="primary" style={{ fontSize: 14, padding: "10px 20px" }}>
          Iniciar sesión
        </button>
      </Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0,1fr))",
          gap: 12,
          marginTop: 48,
        }}
      >
        {MODULES.map(([title, desc]) => (
          <div className="card" key={title}>
            <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 4px" }}>{title}</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>{desc}</p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 40 }}>
        La IA de este sistema no diagnostica ni prescribe: extrae, ordena y compara datos, y
        siempre pide confirmación del profesional antes de guardar algo en la historia clínica.
      </p>
    </div>
  );
}
