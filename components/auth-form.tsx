"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "./session-provider";

type Tab = "in" | "up";
type Errors = { user?: string; email?: string; pass?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASS = 4;

export function AuthForm() {
  const router = useRouter();
  const { login, signOut } = useSession();
  const [tab, setTab] = useState<Tab>("in");
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const switchTab = (next: Tab) => {
    setTab(next);
    setErrors({});
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!user.trim()) next.user = "Ingresa un usuario.";
    if (tab === "up" && !EMAIL_RE.test(email.trim())) {
      next.email = "Ingresa un correo válido.";
    }
    if (pass.length < MIN_PASS) {
      next.pass = `La contraseña debe tener al menos ${MIN_PASS} caracteres.`;
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // La contraseña nunca sale de este estado: solo se guarda el nombre.
    login(user);
    setPass("");
    router.push("/");
  };

  const guest = () => {
    signOut();
    router.push("/");
  };

  return (
    <div className="av-auth-wrap fade-in">
      <div className="auth-card">
        <div className="auth-header">
          <div className="mark" />
          <h2 className="neon-cyan">ARCADE VAULT</h2>
          <div
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--ink-faint)",
              letterSpacing: "0.16em",
              marginTop: 6,
            }}
          >
            ACCESO AL SISTEMA · v2.6
          </div>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={tab === "in" ? "on" : ""}
            aria-pressed={tab === "in"}
            onClick={() => switchTab("in")}
          >
            INICIAR SESIÓN
          </button>
          <button
            type="button"
            className={tab === "up" ? "on" : ""}
            aria-pressed={tab === "up"}
            onClick={() => switchTab("up")}
          >
            CREAR CUENTA
          </button>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="auth-user">Usuario</label>
            <input
              id="auth-user"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="px_kai"
              autoComplete="username"
              aria-invalid={!!errors.user}
              aria-describedby={errors.user ? "auth-user-error" : undefined}
            />
            {errors.user && (
              <div id="auth-user-error" className="field-error" role="alert">
                {errors.user}
              </div>
            )}
          </div>
          {tab === "up" && (
            <div className="field slide-in">
              <label htmlFor="auth-email">Correo electrónico</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jugador@vault.gg"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "auth-email-error" : undefined}
              />
              {errors.email && (
                <div id="auth-email-error" className="field-error" role="alert">
                  {errors.email}
                </div>
              )}
            </div>
          )}
          <div className="field">
            <label htmlFor="auth-pass">Contraseña</label>
            <input
              id="auth-pass"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              autoComplete={tab === "in" ? "current-password" : "new-password"}
              aria-invalid={!!errors.pass}
              aria-describedby={errors.pass ? "auth-pass-error" : undefined}
            />
            {errors.pass && (
              <div id="auth-pass-error" className="field-error" role="alert">
                {errors.pass}
              </div>
            )}
          </div>

          <button className="btn lg" type="submit" style={{ width: "100%", marginTop: 8 }}>
            {tab === "in" ? "ENTRAR AL VAULT" : "CREAR Y JUGAR"}
          </button>
        </form>

        <button
          type="button"
          className="btn ghost"
          style={{ width: "100%", marginTop: 10 }}
          onClick={guest}
        >
          JUGAR COMO INVITADO
        </button>

        <div className="auth-divider">O CONTINÚA CON</div>
        <div className="social">
          <button className="btn ghost" type="button" disabled title="PRÓXIMAMENTE">
            ◆ GOOGLE
          </button>
          <button className="btn ghost" type="button" disabled title="PRÓXIMAMENTE">
            ▣ GITHUB
          </button>
        </div>
        <div
          style={{
            marginTop: 10,
            textAlign: "center",
            fontSize: 10,
            color: "var(--ink-faint)",
            letterSpacing: "0.16em",
          }}
        >
          PRÓXIMAMENTE
        </div>

        <div
          style={{
            marginTop: 18,
            textAlign: "center",
            fontSize: 11,
            color: "var(--ink-faint)",
            letterSpacing: "0.1em",
          }}
        >
          AL ENTRAR ACEPTAS LOS TÉRMINOS DEL SALÓN ARCADE
        </div>
      </div>
    </div>
  );
}
