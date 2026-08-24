import ComingSoon from "../_components/ComingSoon";

export default function EventsPage() {
  return (
    <ComingSoon
      title="Eventos"
      phase="mvp4"
      summary="Talleres, charlas, webinars y desafíos que el nutricionista organiza más allá de la consulta individual."
      willDo={[
        "Crear talleres, charlas, webinars, desafíos o cursos",
        "Definir cupos e inscripción",
        "Integrar con el calendario del consultorio",
        "Cobros y recordatorios asociados al evento",
      ]}
    />
  );
}
