import "./globals.css";

export const metadata = {
  title: "Consultorio Nutricional — Demo",
  description: "Demo funcional: gestión clínica y de consultorio para nutricionistas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
