import ComingSoon from "../_components/ComingSoon";

export default function PhotosPage() {
  return (
    <ComingSoon
      title="Análisis de fotografías"
      phase="mvp3"
      summary="El paciente saca una foto de su comida; el sistema propone candidatos de alimento y cantidad, siempre con incertidumbre visible, para que el paciente o el profesional confirmen."
      willDo={[
        "Detectar posibles alimentos en la foto (candidatos, no certezas)",
        "Estimar porciones con un rango de incertidumbre, nunca un número exacto sin aclarar",
        "Mostrar los candidatos para que el paciente o el profesional confirmen antes de registrar",
        "Quedar integrado al registro alimentario una vez confirmado",
      ]}
      wontDo={[
        "Asumir automáticamente \"esto contiene 250 g de pollo\" sin confirmación",
        "Registrar nada en el historial sin paso de validación humana",
      ]}
    />
  );
}
