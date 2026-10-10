import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import IconoNav from "./IconosNav";
import { Revelar } from "./Animacion";
import { acentoDeRuta } from "../lib/marca";

/** Banda de arriba de cada módulo. Toma el color del módulo y lleva curvas de nivel de fondo. */
export function Cabecera({
  etiqueta, titulo, texto, icono, children, className = "",
}: { etiqueta: string; titulo: string; texto: ReactNode; icono?: string; children?: ReactNode; className?: string }) {
  const a = acentoDeRuta(useLocation().pathname);
  return (
    <header
      className={`relative overflow-hidden rounded-3xl px-6 py-7 text-white shadow-lg ring-1 ring-white/10 sm:px-9 sm:py-9 ${className}`}
      style={{ backgroundImage: `radial-gradient(120% 140% at 100% 0%, ${a.vivo} 0%, ${a.medio} 45%, ${a.oscuro} 100%)` }}
    >
      <svg aria-hidden="true" viewBox="0 0 400 200" preserveAspectRatio="xMaxYMid slice" className="pointer-events-none absolute inset-y-0 right-0 h-full w-3/4 opacity-[0.17]">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <path key={i} d={`M-20 ${190 - i * 22} C80 ${150 - i * 22} 140 ${210 - i * 24} 240 ${120 - i * 20} S360 ${70 - i * 12} 430 ${40 - i * 8}`} fill="none" stroke="#fff" strokeWidth="1.3" />
        ))}
      </svg>
      <div className="relative flex items-start gap-4">
        {icono && (
          <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 shadow-inner ring-1 ring-white/30 backdrop-blur sm:grid">
            <IconoNav nombre={icono} className="h-7 w-7" trazo={1.8} />
          </span>
        )}
        <div className="min-w-0 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">{etiqueta}</p>
          <h1 className="mt-1.5 text-[1.9rem] font-bold leading-tight tracking-tight [text-wrap:balance] sm:text-[2.4rem]">{titulo}</h1>
          <div className="mt-3 text-base leading-relaxed text-white/90 sm:text-[1.05rem]">{texto}</div>
          {children && <div className="mt-5 flex flex-wrap gap-2.5">{children}</div>}
        </div>
      </div>
    </header>
  );
}

/** Botón dentro de la Cabecera (siempre blanco o de vidrio, porque el fondo es de color). */
export function BotonCabecera({ to, children, claro = false }: { to: string; children: ReactNode; claro?: boolean }) {
  const a = acentoDeRuta(useLocation().pathname);
  return (
    <Link
      to={to}
      style={claro ? undefined : { color: a.medio }}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 ${claro ? "bg-white/12 text-white ring-1 ring-white/35 backdrop-blur hover:bg-white/22" : "bg-white shadow hover:shadow-lg"}`}
    >
      {children}
    </Link>
  );
}

/** Sección con título pequeño y una línea de ayuda. */
export function Seccion({ id, titulo, texto, derecha, children }: { id: string; titulo: string; texto?: ReactNode; derecha?: ReactNode; children: ReactNode }) {
  const a = acentoDeRuta(useLocation().pathname);
  return (
    <section aria-labelledby={id}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 id={id} className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-marca">
            <span aria-hidden="true" className="h-5 w-1.5 rounded-full" style={{ background: a.vivo }} />
            {titulo}
          </h2>
          {texto && <p className="mt-0.5 max-w-3xl pl-4 text-sm text-tinta-suave">{texto}</p>}
        </div>
        {derecha}
      </div>
      {children}
    </section>
  );
}

/** Dato grande y compacto, con una barra de color a un lado. `grande` lo hace protagonista. */
export function Kpi({ valor, texto, nota, tono = "verde", grande = false }: { valor: ReactNode; texto: ReactNode; nota?: ReactNode; tono?: "verde" | "ambar" | "rojo"; grande?: boolean }) {
  const barra = tono === "rojo" ? "#c0583a" : tono === "ambar" ? "#e0a526" : "#2d9a5a";
  return (
    <div className="vidrio relative h-full overflow-hidden rounded-2xl p-4 pl-5" style={{ ["--glow" as string]: barra }}>
      <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: barra }} aria-hidden="true" />
      <p className={`font-bold leading-none tabular-nums text-tinta ${grande ? "text-[2.6rem]" : "text-[1.7rem]"}`}>{valor}</p>
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
  radar: { ruta: "/radar", icono: "radar", nombre: "Radar de noticias", texto: "Lo que dicen los medios de la comuna" },
  propuesta: { ruta: "/propuesta", icono: "corazon", nombre: "Propuesta de valor", texto: "Por qué existe y qué falta por hacer" },
  fuentes: { ruta: "/fuentes", icono: "fuentes", nombre: "Fuentes y calidad", texto: "De dónde sale cada dato" },
  identidad: { ruta: "/identidad", icono: "paleta", nombre: "Manual de identidad", texto: "Colores, letras y reglas del sitio" },
};

/** Cierre de cada página: tres enlaces a módulos que se conectan con lo que acabas de ver. */
export function Relacionados({ ids, className = "" }: { ids: (keyof typeof RELACIONES)[]; className?: string }) {
  return (
    <Revelar className={className}>
      <section aria-label="Sigue por aquí" className="vidrio vidrio--quieto rounded-3xl p-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-ladera">Sigue por aquí</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {ids.map((id) => {
            const r = RELACIONES[id];
            return (
              <Link key={id} to={r.ruta} className="fila-modulo group flex items-center gap-3 rounded-2xl border border-nivel bg-superficie p-3.5">
                <span className="fila-modulo-icono grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-menta text-marca">
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
