"use client";

export default function PrintButton() {
  return (
    <button className="primary" onClick={() => window.print()}>
      Imprimir / guardar como PDF
    </button>
  );
}
