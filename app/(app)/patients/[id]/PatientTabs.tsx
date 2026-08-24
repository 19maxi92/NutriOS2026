"use client";

import { useState } from "react";
import HistoriaTab from "./HistoriaTab";
import AnamnesisTab from "./AnamnesisTab";
import AntropometriaTab from "./AntropometriaTab";
import BioimpedanciaTab from "./BioimpedanciaTab";
import LaboratoriosTab from "./LaboratoriosTab";
import PlanTab from "./PlanTab";
import EvolucionTab from "./EvolucionTab";
import DocumentosTab from "./DocumentosTab";

const TABS = [
  { key: "historia", label: "Historia clínica" },
  { key: "anamnesis", label: "Anamnesis" },
  { key: "antropometria", label: "Antropometría" },
  { key: "bioimpedancia", label: "Bioimpedancia" },
  { key: "laboratorios", label: "Laboratorios" },
  { key: "plan", label: "Plan alimentario" },
  { key: "evolucion", label: "Evolución" },
  { key: "documentos", label: "Documentos" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function PatientTabs({
  patientId,
  initialAnthro,
}: {
  patientId: string;
  initialAnthro: { weight: number; height: number };
}) {
  const [tab, setTab] = useState<TabKey>("historia");

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid var(--border)",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              border: "none",
              borderBottom: tab === t.key ? "2px solid var(--text)" : "2px solid transparent",
              borderRadius: 0,
              background: "transparent",
              padding: "8px 10px",
              fontWeight: tab === t.key ? 500 : 400,
              color: tab === t.key ? "var(--text)" : "var(--text-muted)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "historia" && <HistoriaTab patientId={patientId} />}
      {tab === "anamnesis" && <AnamnesisTab patientId={patientId} />}
      {tab === "antropometria" && (
        <AntropometriaTab patientId={patientId} initial={initialAnthro} />
      )}
      {tab === "bioimpedancia" && <BioimpedanciaTab patientId={patientId} />}
      {tab === "laboratorios" && <LaboratoriosTab patientId={patientId} />}
      {tab === "plan" && <PlanTab patientId={patientId} />}
      {tab === "evolucion" && <EvolucionTab patientId={patientId} />}
      {tab === "documentos" && <DocumentosTab patientId={patientId} />}
    </div>
  );
}
