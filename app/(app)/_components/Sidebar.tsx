"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MAIN_LINKS = [
  ["/dashboard", "Dashboard"],
  ["/patients", "Pacientes"],
  ["/appointments", "Agenda"],
  ["/foods", "Alimentos"],
  ["/audit", "Auditoría"],
  ["/settings", "Configuración"],
];

const SOON_LINKS = [
  ["/ai-assistant", "Asistente IA"],
  ["/photos", "Análisis de fotos"],
  ["/templates", "Plantillas"],
  ["/reports", "Informes"],
  ["/patient-portal", "Portal paciente"],
  ["/events", "Eventos"],
  ["/messages", "Comunicación"],
  ["/security", "Seguridad avanzada"],
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav style={{ width: 172, flexShrink: 0 }}>
      {MAIN_LINKS.map(([href, label]) => (
        <NavLink key={href} href={href} label={label} active={pathname.startsWith(href)} />
      ))}

      <p
        style={{
          fontSize: 11,
          color: "var(--text-faint)",
          textTransform: "uppercase",
          letterSpacing: 0.4,
          margin: "18px 0 6px 10px",
        }}
      >
        En construcción
      </p>
      {SOON_LINKS.map(([href, label]) => (
        <NavLink key={href} href={href} label={label} active={pathname.startsWith(href)} muted />
      ))}
    </nav>
  );
}

function NavLink({
  href,
  label,
  active,
  muted,
}: {
  href: string;
  label: string;
  active: boolean;
  muted?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "8px 10px",
        borderRadius: 8,
        fontSize: 13,
        marginBottom: 2,
        fontWeight: active ? 600 : 400,
        color: active ? "var(--accent-strong)" : muted ? "var(--text-muted)" : "var(--text)",
        background: active ? "var(--accent-bg)" : "transparent",
      }}
    >
      {label}
    </Link>
  );
}
