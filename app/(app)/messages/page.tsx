import ComingSoon from "../_components/ComingSoon";

export default function MessagesPage() {
  return (
    <ComingSoon
      title="Comunicación"
      phase="mvp4"
      summary="Mensajería integrada con el paciente y recordatorios automáticos, sin depender de WhatsApp personal del profesional."
      willDo={[
        "Mensajes directos con el paciente dentro de la plataforma",
        "Recordatorios automáticos de turnos y de seguimiento",
        "Integración futura con WhatsApp, email y videollamada",
      ]}
    />
  );
}
