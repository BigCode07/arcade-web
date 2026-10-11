import Link from "next/link";

export default function GameNotFound() {
  return (
    <div className="fade-in" style={{ textAlign: "center", padding: "96px 32px" }}>
      <div className="pixel neon-magenta" style={{ fontSize: 18, marginBottom: 16 }}>
        404 · JUEGO NO ENCONTRADO
      </div>
      <p style={{ color: "var(--ink-dim)", marginBottom: 28 }}>
        Ese juego no existe en el Vault. Elige otro desde la biblioteca.
      </p>
      <Link href="/biblioteca" className="btn lg">
        VOLVER AL VAULT
      </Link>
    </div>
  );
}
