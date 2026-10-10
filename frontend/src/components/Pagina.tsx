import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import IconoNav from "./IconosNav";
import { Revelar } from "./Animacion";

/** Banda de arriba de cada módulo: mismo look en todas las páginas, con curvas de nivel de fondo. */
export function Cabecera({
  etiqueta, titulo, texto, icono, children, className = "",
}: { etiqueta: string; titulo: string; texto: ReactNode; icono?: string; children?: ReactNode; className?: string }) {
  return (
    <header className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#143d24] via-[#1a4d2e] to-[#2d6a4f] px-6 py-7 text-white shadow-lg sm:px-9 sm:py-9 ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 400 200" preserveAspectRatio="xMaxYMid slice" className="pointer-events-none absolute inset-y-0 right-0 h-full w-3/4 opacity-[0.16]">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <path key={i} d={`M-20 ${190 - i * 22} C80 ${150 - i * 22} 140 ${210 - i * 24} 240 ${120 - i * 20} S360 ${70 - i * 12} 430 ${40 - i * 8}`} fill="none" stroke="#fff" strokeWidth="1.3" />
        ))}
      </svg>
      <div className="relative flex items-start gap-4">
        {icono && (
          <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/12 ring-1 ring-white/25 sm:grid">
            <IconoNav nombre={icono} className="h-7 w-7" trazo={1.8} />
          </span>
        )}
        <div className="min-w-0 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a8cbb6]">{etiqueta}</p>
          <h1 className="mt-1.5 text-[1.9rem] font-bold leading-tight tracking-tight [text-wrap:balance] sm:text-[2.4rem]">{titulo}</h1>
          <div className="mt-3 text-base leading-relaxed text-white/85 sm:text-[1.05rem]">{texto}</div>
          {children && <div className="mt-5 flex flex-wrap gap-2.5">{children}</div>}
        </div>
      </div>
    </header>
  );
}

/** Botón dentro de la Cabecera. */
export function BotonCabecera({ to, children, claro = false }: { to: string; children: ReactNode; claro?: boolean }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 ${claro ? "bg-white/12 text-white ring-1 ring-white/30 hover:bg-white/20" : "bg-white text-[#1a4d2e] shadow hover:shadow-md"}`}>
      {children}
    </Link>
  );
}

/** Sección con título pequeño y una línea de ayuda. */
export function Seccion({ id, titulo, texto, derecha, children }: { id: string; titulo: string; texto?: ReactNode; derecha?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 id={id} className="text-xl font-bold tracking-tight text-[#1a4d2e]">{titulo}</h2>
          {texto && <p className="mt-0.5 max-w-3xl text-sm text-tinta-suave">{texto}</p>}
        </div>
        {derecha}
      </div>
      {children}
    </section>
  );
}

/** Dato grande y compacto. */
export function Kpi({ valor, texto, nota, tono = "verde" }: { valor: ReactNode; texto: ReactNode; nota?: ReactNode; tono?: "verde" | "ambar" | "rojo" }) {
  const barra = tono === "rojo" ? "bg-[#c0583a]" : tono === "ambar" ? "bg-[#e0a526]" : "bg-[#2d6a4f]";
  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-nivel bg-white p-4 pl-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span className={`absolute inset-y-0 left-0 w-1.5 ${barra}`} aria-hidden="true" />
      <p className="text-[1.7rem] font-bold leading-none tabular-nums text-tinta">{valor}</p>
      <p className="mt-1.5 text-sm leading-snug">{texto}</p>
      {nota && <p className="mt-1 text-xs text-tinta-tenue">{nota}</p>}
    </div>
  );
}

const RELACIONES: Record<string, { ruta: string; icono: string; nombre: string; texto: string }> = {
  mapa: { ruta: "/mapa", icono: "mapa", nombre: "Mapa territorial", texto: "Ver todo sobre la comuna en el mapa" },
  problematicas: { ruta: "/problematicas", icono: "alerta", nombre: "Problemáticas", texto: "Los ocho problemas, con su número" },
  corredor: { ruta: "/corredor-49", icono: "corredor", nombre: "Corredor Carrera 49", texto: "¿Conviene ir por la 49?" },
  indicadores: { ruta: "/indicadores", icono: "indicadores", nombre: "Indicadores", texto: "Cifras por barrio" },
  accesibilidad: { ruta: "/accesibilidad", icono: "accesibilidad", nombre: "Accesibilidad", texto: "Minutos caminando a lo básico" },
  prioridades: { ruta: "/prioridades", icono: "prioridades", nombre: "Prioridad de obras", texto: "Dónde intervenir primero" },
  datos: { ruta: "/datos", icono: "subir", nombre: "Mis datos", texto: "Sube y mira tus propios datos" },
  fuentes: { ruta: "/fuentes", icono: "fuentes", nombre: "Fuentes y calidad", texto: "De dónde sale cada dato" },
};

/** Cierre de cada página: tres enlaces a módulos que se conectan con lo que acabas de ver. */
export function Relacionados({ ids, className = "" }: { ids: (keyof typeof RELACIONES)[]; className?: string }) {
  return (
    <Revelar className={className}>
      <section aria-label="Sigue por aquí" className="rounded-3xl border border-nivel bg-white/70 p-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-ladera">Sigue por aquí</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {ids.map((id) => {
            const r = RELACIONES[id];
            return (
              <Link key={id} to={r.ruta} className="fila-modulo group flex items-center gap-3 rounded-2xl border border-nivel bg-white p-3.5">
                <span className="fila-modulo-icono grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e3f1e6] text-[#1a4d2e]">
                  <IconoNav nombre={r.icono} className="h-6 w-6" trazo={1.8} />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold leading-tight">{r.nombre}</span>
                  <span className="block text-sm text-tinta-suave">{r.texto}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </Revelar>
  );
}
