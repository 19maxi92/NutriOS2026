import ComingSoon from "../_components/ComingSoon";

export default function ReportsPage() {
  return (
    <ComingSoon
      title="Informes"
      phase="mvp2"
      summary="Informes exportables además del plan alimentario: evolución antropométrica, resumen de consulta, informe para derivar a otro profesional."
      willDo={[
        "Informe de evolución con gráficos de peso, %graso, perímetros a lo largo del tiempo",
        "Resumen de consulta para entregar al paciente o derivar a otro profesional",
        "Exportación en PDF, con la misma lógica de armado que ya tiene el plan alimentario",
      ]}
    />
  );
}
