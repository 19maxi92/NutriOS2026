"use client";

import { useState } from "react";

type Item = {
  id: string;
  name: string;
  source: string;
  kind: string;
  nutrients: Record<string, number>;
};

export default function CompareTool({ items }: { items: Item[] }) {
  const [aId, setAId] = useState(items[0]?.id ?? "");
  const [bId, setBId] = useState(items[1]?.id ?? "");

  const a = items.find((i) => i.id === aId);
  const b = items.find((i) => i.id === bId);

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Comparar sustitución</p>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
        El sistema compara datos, no decide clínicamente qué reemplazar — esa parte queda siempre
        en manos del profesional.
      </p>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <select value={aId} onChange={(e) => setAId(e.target.value)} style={{ flex: 1 }}>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
        <select value={bId} onChange={(e) => setBId(e.target.value)} style={{ flex: 1 }}>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
      </div>

      {a && b && (
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: 12 }}>
              <th></th>
              <th>{a.name}</th>
              <th>{b.name}</th>
            </tr>
          </thead>
          <tbody>
            {["Energía", "Proteínas", "Carbohidratos", "Grasas"].map((n) => (
              <tr key={n} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "4px 0", color: "var(--text-muted)" }}>{n}</td>
                <td>{a.nutrients[n]?.toFixed(1)}</td>
                <td>{b.nutrients[n]?.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
