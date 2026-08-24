import ComingSoon from "../_components/ComingSoon";

export default function PatientPortalPage() {
  return (
    <ComingSoon
      title="Portal del paciente"
      phase="mvp3"
      summary="PWA responsive primero (no app nativa) para que el paciente vea su información sin depender del nutricionista para cada cosa."
      willDo={[
        "Ver próximo turno y confirmarlo",
        "Ver su plan alimentario actual",
        "Registrar comidas (con o sin foto)",
        "Ver su propia evolución (peso, medidas)",
        "Completar formularios de anamnesis o seguimiento que el profesional le asigne",
        "Subir documentos (laboratorio, estudios) para que el profesional los revise",
        "Recibir mensajes del consultorio",
      ]}
      wontDo={[
        "Interpretar sus propios resultados de laboratorio o antropometría",
        "Reemplazar la consulta con el profesional",
      ]}
    />
  );
}
