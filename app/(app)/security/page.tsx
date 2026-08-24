import ComingSoon from "../_components/ComingSoon";

export default function SecurityPage() {
  return (
    <ComingSoon
      title="Seguridad avanzada"
      phase="mvp2"
      summary="Lo básico (auth, RLS por rol, audit log) ya está en esta demo. Esto es lo que falta antes de manejar historias clínicas reales de pacientes."
      willDo={[
        "Autenticación de dos factores (2FA)",
        "Backups cifrados con pruebas periódicas de restauración, además del backup automático de Supabase",
        "Rate limiting y protección de uploads (antivirus/malware scanning, control de MIME, límites de tamaño)",
        "URLs de documentos no predecibles, con expiración",
        "Revisión legal profesional formal antes de producción (Ley 26.529 / 25.326)",
      ]}
    />
  );
}
