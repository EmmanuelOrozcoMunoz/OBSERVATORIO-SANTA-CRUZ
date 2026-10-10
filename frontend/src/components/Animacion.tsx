import { useEffect, useRef, useState, type ReactNode } from "react";

/** Avisa la primera vez que el elemento entra en pantalla. */
export function useVisto<T extends HTMLElement>(umbral = 0.2) {
  const ref = useRef<T>(null);
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visto) return;
    if (!("IntersectionObserver" in window)) {
      setVisto(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisto(true);
          io.disconnect();
        }
      },
      { threshold: umbral, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visto, umbral]);
  return [ref, visto] as const;
}

/** Aparece subiendo suavemente cuando llega a la pantalla. */
export function Revelar({ children, retraso = 0, className = "" }: { children: ReactNode; retraso?: number; className?: string }) {
  const [ref, visto] = useVisto<HTMLDivElement>(0.12);
  return (
    <div ref={ref} className={`revelar ${visto ? "visto" : ""} ${className}`} style={{ transitionDelay: `${retraso}ms` }}>
      {children}
    </div>
  );
}

/** Número que cuenta desde 0 hasta su valor cuando `activo` pasa a verdadero. */
export function Cuenta({ hasta, decimales = 0, activo, duracion = 1700 }: { hasta: number; decimales?: number; activo: boolean; duracion?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!activo) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setV(hasta);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const paso = (t: number) => {
      const p = Math.min(1, (t - t0) / duracion);
      setV(hasta * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [activo, hasta, duracion]);
  const f = new Intl.NumberFormat("es-CO", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
  return (
    <>
      <span aria-hidden="true">{f.format(v)}</span>
      <span className="sr-only">{f.format(hasta)}</span>
    </>
  );
}

