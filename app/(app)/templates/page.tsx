import ComingSoon from "../_components/ComingSoon";

export default function TemplatesPage() {
  return (
    <ComingSoon
      title="Plantillas"
      phase="mvp2"
      summary="Plantillas reutilizables de anamnesis y de plan alimentario, siempre editables por el profesional antes de aplicarlas a un paciente."
      willDo={[
        "Plantillas de anamnesis por especialidad (deportiva, clínica, pediátrica, etc.)",
        "Plantillas de plan: desayuno tipo, almuerzo tipo, plantilla vegetariana, plantilla deportiva",
        "Aplicar una plantilla a un paciente y editarla libremente después — nunca queda fija",
      ]}
    />
  );
}
