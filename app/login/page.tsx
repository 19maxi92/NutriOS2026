"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Completá email y contraseña.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("No pudimos iniciar sesión. Revisá las credenciales.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div style={{ maxWidth: 360, margin: "10vh auto", padding: "0 16px" }}>
      <div className="card">
        <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>
          Consultorio Nutricional
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
          Ingresá con tu cuenta de administrador o nutricionista.
        </p>
        <form onSubmit={handleLogin}>
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@tuconsultorio.com"
            style={{ width: "100%", marginTop: 4, marginBottom: 12 }}
          />
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", marginTop: 4 }}
          />
          {error && (
            <p style={{ color: "#a32d2d", fontSize: 13, marginTop: 10 }}>{error}</p>
          )}
          <button
            type="submit"
            className="primary"
            disabled={loading}
            style={{ width: "100%", marginTop: 16 }}
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
