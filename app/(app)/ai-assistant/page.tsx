import ComingSoon from "../_components/ComingSoon";

export default function AiAssistantPage() {
  return (
    <ComingSoon
      title="Asistente IA"
      phase="mvp3"
      summary="Un copiloto que lee, ordena y compara datos ya cargados en el sistema — nunca decide ni diagnostica."
      willDo={[
        "Resumir la historia clínica y la evolución de un paciente",
        "Extraer datos de PDFs (laboratorio, InBody, DEXA, antropometría) con confidence score visible",
        "Detectar cambios entre las últimas mediciones y señalar qué conviene revisar",
        "Comparar estudios de distintas fechas",
        "Generar borradores administrativos (resúmenes, mensajes) para que el profesional los revise",
        "Enviar siempre el mínimo de datos necesario al modelo — nunca la historia clínica completa",
      ]}
      wontDo={[
        "Diagnosticar (\"tenés diabetes\")",
        "Escribir directamente en la historia clínica sin confirmación humana",
        "Decidir qué alimento sustituye a otro por criterio clínico propio",
        "Guardar nada automáticamente sin que el profesional confirme",
      ]}
    />
  );
}
