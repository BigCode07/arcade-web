"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "./session-provider";

export function Nav() {
  const pathname = usePathname();
  const { user, signOut } = useSession();
  const [open, setOpen] = useState(false);

  const isLibrary = pathname === "/" || pathname.startsWith("/juegos");
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <nav className="av-nav" aria-label="Principal">
        <Link href="/" className="logo">
          <div className="logo-mark" />
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>
        <div className="links">
          <Link href="/" className={isLibrary ? "active" : ""}>
            Biblioteca
          </Link>
          <Link href="/salon" className={pathname === "/salon" ? "active" : ""}>
            Salón de la Fama
          </Link>
        </div>
        <div className="spacer" />
        <div className="coin-counter">
          <span className="coin" />
          <span>CRÉDITOS · 03</span>
        </div>
        {user ? (
          <button type="button" className="btn ghost auth-btn" onClick={signOut}>
            {user.name} ▾
          </button>
        ) : (
          <Link href="/auth" className="btn auth-btn">
            Iniciar Sesión
          </Link>
        )}
        <button
          type="button"
          className="btn ghost hamburger"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          ≡
        </button>
      </nav>

      <div className={"av-mobile-backdrop" + (open ? " open" : "")} onClick={close} />
      <aside className={"av-mobile-panel" + (open ? " open" : "")} inert={!open}>
        <div className="pixel neon-cyan" style={{ fontSize: 11, marginBottom: 16 }}>
          MENÚ
        </div>
        <Link href="/" className={isLibrary ? "active" : ""} onClick={close}>
          Biblioteca
        </Link>
        <Link
          href="/salon"
          className={pathname === "/salon" ? "active" : ""}
          onClick={close}
        >
          Salón de la Fama
        </Link>
        <Link
          href="/auth"
          className={pathname === "/auth" ? "active" : ""}
          onClick={close}
        >
          {user ? "Cuenta" : "Iniciar Sesión"}
        </Link>
        <div style={{ flex: 1 }} />
        <div
          className="pixel"
          style={{ fontSize: 9, color: "var(--ink-faint)", letterSpacing: "0.16em" }}
        >
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}
