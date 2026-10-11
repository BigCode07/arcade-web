"use client";

import { useEffect } from "react";

/**
 * Revela con animación los `.reveal` al entrar en el viewport.
 * Marca `<html>` con `reveal-ready` solo tras hidratar, así sin JS el contenido queda visible.
 */
export function Reveal() {
  useEffect(() => {
    const root = document.documentElement;
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    root.classList.add("reveal-ready");
    return () => {
      io.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);

  return null;
}
