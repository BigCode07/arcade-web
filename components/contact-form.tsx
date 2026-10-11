"use client";

import { useEffect, useRef, useState } from "react";
import { addMessage } from "@/lib/contact";

type Field = "name" | "email" | "msg";
type Errors = Partial<Record<Field, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SHAKE_MS = 400;
const FIELD_ORDER: Field[] = ["name", "email", "msg"];
const EMPTY = { name: "", email: "", msg: "" };

export function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const refs = useRef<Record<Field, HTMLInputElement | HTMLTextAreaElement | null>>({
    name: null,
    email: null,
    msg: null,
  });
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
    };
  }, []);

  const set = (field: Field, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const msg = form.msg.trim();

    const next: Errors = {};
    if (!name) next.name = "Ingresa tu nombre.";
    if (!email) next.email = "Ingresa tu correo.";
    else if (!EMAIL_RE.test(email)) next.email = "Ingresa un correo válido.";
    if (!msg) next.msg = "Escribe un mensaje.";
    setErrors(next);

    const firstInvalid = FIELD_ORDER.find((f) => next[f]);
    if (firstInvalid) {
      refs.current[firstInvalid]?.focus();
      setShake(true);
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
      shakeTimer.current = setTimeout(() => setShake(false), SHAKE_MS);
      return;
    }

    addMessage({ name, email, msg });
    setSent(name);
  };

  const reset = () => {
    setSent(null);
    setForm(EMPTY);
    setErrors({});
  };

  return (
    <form
      className={"contact-form" + (shake ? " shake" : "")}
      onSubmit={submit}
      noValidate
    >
      {sent === null ? (
        <>
          <div className="field">
            <label htmlFor="contact-name">NOMBRE</label>
            <input
              id="contact-name"
              ref={(el) => {
                refs.current.name = el;
              }}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="px_kai"
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
            />
            {errors.name && (
              <div id="contact-name-error" className="field-error" role="alert">
                {errors.name}
              </div>
            )}
          </div>
          <div className="field">
            <label htmlFor="contact-email">CORREO ELECTRÓNICO</label>
            <input
              id="contact-email"
              ref={(el) => {
                refs.current.email = el;
              }}
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="jugador@vault.gg"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
            />
            {errors.email && (
              <div id="contact-email-error" className="field-error" role="alert">
                {errors.email}
              </div>
            )}
          </div>
          <div className="field">
            <label htmlFor="contact-msg">MENSAJE</label>
            <textarea
              id="contact-msg"
              ref={(el) => {
                refs.current.msg = el;
              }}
              rows={5}
              value={form.msg}
              onChange={(e) => set("msg", e.target.value)}
              placeholder="Cuéntanos qué tienes en mente…"
              aria-invalid={!!errors.msg}
              aria-describedby={errors.msg ? "contact-msg-error" : undefined}
            />
            {errors.msg && (
              <div id="contact-msg-error" className="field-error" role="alert">
                {errors.msg}
              </div>
            )}
          </div>
          <button className="btn xl press" type="submit" style={{ width: "100%" }}>
            ▶ ENVIAR MENSAJE
          </button>
        </>
      ) : (
        <div className="terminal-success" role="status">
          <div className="term-bar">
            <span className="dot r" />
            <span className="dot y" />
            <span className="dot g" />
            <span className="term-title">VAULT-OS // TERMINAL</span>
          </div>
          <div className="term-body">
            <div className="line">
              <span className="prompt">vault@arcade:~$</span> ./send_message --to=team
            </div>
            <div className="line dim">[OK] Conectando con servidor…</div>
            <div className="line dim">[OK] Validando contenido…</div>
            <div className="line dim">[OK] Transmitiendo paquete…</div>
            <div className="line success">
              &gt; MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS, {sent.toUpperCase()}.
              <span className="caret">_</span>
            </div>
            <div style={{ marginTop: 18 }}>
              <button className="btn ghost" type="button" onClick={reset}>
                ENVIAR OTRO MENSAJE
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
