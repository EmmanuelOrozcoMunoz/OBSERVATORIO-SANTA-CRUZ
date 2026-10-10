import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { useSearchParams } from "react-router-dom";
import type { Map as MapaML } from "maplibre-gl";
import MapaVivo, { type FiltroSiniestros, type Modo } from "../components/mapa/MapaVivo";
import { BotonesCamara, HoraSol, Joystick } from "../components/mapa/ControlesMapa";
import { horaColombia } from "../lib/sol";
import PanelCapas from "../components/mapa/PanelCapas";
import PanelRuteo from "../components/mapa/PanelRuteo";
import Buscador, { type Resultado } from "../components/mapa/Buscador";
import Leyenda, { type BloqueLeyenda } from "../components/mapa/Leyenda";
import Icono from "../components/mapa/Iconos";
import FichaBarrio from "../components/FichaBarrio";
import FichaElemento from "../components/FichaElemento";
import { Cargando, ErrorCarga } from "../components/Estado";
import { CAPAS, COLORES_BARRIO, ESCALA_ALERTA, TEMAS, capaPorId, type Tema } from "../lib/capas";
import { cargar, useDatos } from "../lib/datos";
import { dec, dec2, num } from "../lib/formato";
import type { Coleccion, Elemento, FichaBarrio as Ficha, Indicadores, Props } from "../lib/tipos";

const CLAVE_AYUDA = "observatorio-santa-cruz:ayuda-mapa-vista";
const CLAVE_SOLO = "observatorio-santa-cruz:solo-mapa";
const CLAVE_PANEL = "observatorio-santa-cruz:panel-temas-abierto";
const CLAVE_NOCHE = "observatorio-santa-cruz:mapa-noche";

function leerAyuda() {
  try {
    return localStorage.getItem(CLAVE_AYUDA) !== "1";
  } catch {
    return true;
  }
}

/** Preferencia guardada en el navegador (si no hay almacenamiento, queda solo en memoria). */
function usePreferencia(clave: string, inicial: boolean) {
  const [v, setV] = useState(() => {
    try {
      const g = localStorage.getItem(clave);
      return g == null ? inicial : g === "1";
    } catch {
      return inicial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(clave, v ? "1" : "0");
    } catch {
      /* sin almacenamiento */
    }
  }, [clave, v]);
  return [v, setV] as const;
}

/** Deslizar en el celular: llama a `fn` si el dedo se movió más de 50 px en la dirección pedida. */
function useDeslizar(direccion: "arriba" | "abajo", fn: () => void) {
  const inicio = useRef<{ x: number; y: number } | null>(null);
  return {
    onTouchStart: (e: TouchEvent) => {
      const t = e.touches[0];
      inicio.current = { x: t.clientX, y: t.clientY };
    },
    onTouchEnd: (e: TouchEvent) => {
      const i = inicio.current;
      inicio.current = null;
      if (!i) return;
      const t = e.changedTouches[0];
      const dy = t.clientY - i.y, dx = t.clientX - i.x;
      if (Math.abs(dy) > 50 && Math.abs(dy) > Math.abs(dx) * 1.3 && (direccion === "arriba" ? dy < 0 : dy > 0)) fn();
    },
  };
}

/** Cortes por cuantiles para pintar barrios (5 grupos). */
function cortes(valores: number[]) {
  const v = [...valores].sort((a, b) => a - b);
  return [0.2, 0.4, 0.6, 0.8].map((q) => v[Math.min(v.length - 1, Math.floor(q * v.length))]);
}

function FichaComuna({ p, santaCruz, onVerSantaCruz }: { p: Props; santaCruz?: Props; onVerSantaCruz: () => void }) {
  const fila = (etiqueta: string, valor: string, ref?: string) => (
    <div className="flex items-baseline justify-between gap-3 border-b border-nivel py-2 text-base">
      <dt className="text-tinta-suave">{etiqueta}</dt>
      <dd className="text-right font-semibold tabular-nums">
        {valor}
        {ref && <span className="block text-sm font-normal text-tinta-tenue">{ref}</span>}
      </dd>
    </div>
  );
  const sc = santaCruz && !p.es_santa_cruz ? santaCruz : undefined;
  return (
    <article className="space-y-4">
      <header>
        <p className="text-tinta-suave">{String(p.tipo ?? "")} de Medellín</p>
        <h2 className="text-3xl font-bold leading-tight [font-stretch:112%]">{String(p.nombre)}</h2>
        <p className="text-tinta-suave">{dec(p.area_ha as number)} hectáreas</p>
      </header>
      <dl>
        {fila("Equipamientos colectivos", num(p.equipamientos as number), sc && `Santa Cruz: ${num(sc.equipamientos as number)}`)}
        {fila("Equipamientos de salud", num(p.salud as number), sc && `Santa Cruz: ${num(sc.salud as number)}`)}
        {fila("Colegios y sedes educativas", num(p.sedes_educativas as number), sc && `Santa Cruz: ${num(sc.sedes_educativas as number)}`)}
        {fila("Canchas y escenarios deportivos", num(p.escenarios_deportivos as number), sc && `Santa Cruz: ${num(sc.escenarios_deportivos as number)}`)}
        {fila("Bibliotecas", num(p.bibliotecas as number), sc && `Santa Cruz: ${num(sc.bibliotecas as number)}`)}
        {fila("Estaciones del sistema Metro", num(p.estaciones as number), sc && `Santa Cruz: ${num(sc.estaciones as number)}`)}
        {p.imcv != null &&
          fila(
            `Calidad de vida (IMCV ${String(p.imcv_anio ?? "")})`,
            dec2(p.imcv as number),
            sc ? `Santa Cruz: ${dec2(sc.imcv as number)}` : "De 0 a 100, más alto es mejor",
          )}
      </dl>
      <p className="text-sm text-tinta-tenue">
        Conteos hechos con las capas oficiales de la Alcaldía. No dependen del tamaño ni de la población de cada comuna, así que
        sirven para ubicarse, no para comparar directamente.
      </p>
      {!p.es_santa_cruz && (
        <button type="button" onClick={onVerSantaCruz} className="w-full rounded-xl bg-ladera px-4 py-3 text-lg font-semibold text-papel hover:bg-ladera-hondo">
          Volver a Santa Cruz
        </button>
      )}
    </article>
  );
}

/** Marca de "elegido": chulo blanco sobre círculo verde. */
function Chulo() {
  return (
    <span aria-hidden="true" className="grid h-6 w-6 place-items-center rounded-full bg-[#1a4d2e] text-white shadow">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

function BotonTema({ t, activo, soloComuna, onClick }: { t: Tema; activo: boolean; soloComuna: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={`tarjeta-tema group flex w-full min-w-[11.5rem] items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left ${
        activo ? "border-marca bg-superficie text-tinta shadow-lg" : "border-transparent bg-superficie/90 text-tinta"
      }`}
    >
      <span className="icono-tema grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: activo ? t.color : `${t.color}1f`, color: activo ? "#fff" : t.color }}>
        <Icono nombre={t.id} className="h-7 w-7" />
      </span>
      <span className="leading-tight">
        <span className="block text-[1.05rem] font-semibold">{t.nombre}</span>
        <span className="block text-sm text-tinta-suave">{soloComuna ? "Solo Santa Cruz" : t.ayuda}</span>
      </span>
      {activo && <Chulo />}
    </button>
  );
}

/** Tarjeta cuadrada del tema: ícono grande y nombre corto. Al pasar el mouse sube 4 px; elegida, borde verde. */
function TemaCuadro({ t, activo, soloComuna, onClick }: { t: Tema; activo: boolean; soloComuna: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      title={t.ayuda}
      onClick={onClick}
      className={`tarjeta-tema flex min-h-[5.6rem] flex-col items-start justify-between rounded-2xl border-2 p-3 text-left ${
        activo ? "border-marca bg-superficie text-tinta shadow-lg" : "border-transparent bg-superficie/90 text-tinta shadow-sm"
      }`}
      style={activo ? { backgroundImage: `linear-gradient(160deg, ${t.color}1a, transparent 70%)` } : undefined}
    >
      <span className="flex w-full items-center justify-between">
        <span className="icono-tema grid h-9 w-9 place-items-center rounded-xl transition-colors" style={{ background: activo ? t.color : `${t.color}1a`, color: activo ? "#fff" : t.color }}>
          <Icono nombre={t.id} className="h-6 w-6" />
        </span>
        {activo && <Chulo />}
      </span>
      <span className="mt-2 block text-[1rem] font-semibold leading-tight">{t.nombre}</span>
      {soloComuna && <span className="text-xs text-tinta-tenue">Solo Santa Cruz</span>}
    </button>
  );
}

export default function Mapa() {
  const [params, setParams] = useSearchParams();
  const indicadores = useDatos<Indicadores>("indicadores.json");

  const [modo, setModo] = useState<Modo>(params.get("vista") === "ciudad" ? "ciudad" : "comuna");
  const [activas, setActivas] = useState(() => {
    const base = new Set(["lineas_transporte", "estaciones", "equipamientos"]);
    for (const id of (params.get("capas") ?? "").split(",")) if (CAPAS.some((c) => c.id === id)) base.add(id);
    return base;
  });
  const [estados, setEstados] = useState<Record<string, "cargando" | "listo" | "error">>({});
  const [vista3d, setVista3d] = useState(params.get("3d") === "1");
  const [recorrido, setRecorrido] = useState(false);
  const [seleccion, setSeleccion] = useState<{ capa: string; elemento: Elemento } | null>(null);
  const [destino, setDestino] = useState<{ elemento: Elemento; n: number } | null>(null);
  const [reencuadre, setReencuadre] = useState(0);
  const [colorBarrios, setColorBarrios] = useState("");
  const [filtroSin, setFiltroSin] = useState<FiltroSiniestros>({ clase: "Atropello", anio: "Todos" });
  const [masOpciones, setMasOpciones] = useState(false);
  const [verLeyenda, setVerLeyenda] = useState(true);
  const [ruteo, setRuteo] = useState(params.get("ruta") === "1");
  const [clicRuta, setClicRuta] = useState<{ lon: number; lat: number; n: number } | null>(null);
  const [rutas, setRutas] = useState<Coleccion | null>(null);
  const [puntosRuta, setPuntosRuta] = useState<Coleccion | null>(null);
  const onGeoRuta = useCallback((r: Coleccion | null, p: Coleccion | null) => {
    setRutas(r);
    setPuntosRuta(p);
  }, []);
  const onEncuadrarRuta = useCallback((e: Elemento) => setDestino({ elemento: e, n: Date.now() }), []);
  const alternarRuteo = () => {
    setRuteo((v) => !v);
    setSeleccion(null);
    setClicRuta(null);
    if (modo !== "comuna") cambiarModo("comuna");
  };
  const [ayuda, setAyuda] = useState(leerAyuda);
  const comunas = useDatos<{ features: Elemento[] }>("comunas_ciudad.geojson");

  // Modo inmersivo ---------------------------------------------------------------
  const [mapaML, setMapaML] = useState<MapaML | null>(null);
  const [solo, setSolo] = usePreferencia(CLAVE_SOLO, false);
  const [panelAbierto, setPanelAbierto] = usePreferencia(CLAVE_PANEL, true);
  const [noche, setNoche] = usePreferencia(CLAVE_NOCHE, false);
  const [hora, setHora] = useState(() => Math.min(17.5, Math.max(6.5, horaColombia())));
  const [opacidad, setOpacidad] = useState(100);
  const [aviso, setAviso] = useState<string | null>(null);
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 3200);
    return () => clearTimeout(t);
  }, [aviso]);
  // El Layout esconde el menú lateral y la barra del celular con este atributo
  useEffect(() => {
    document.documentElement.toggleAttribute("data-solo-mapa", solo);
    const salir = (e: KeyboardEvent) => e.key === "Escape" && setSolo(false);
    if (solo) window.addEventListener("keydown", salir);
    return () => window.removeEventListener("keydown", salir);
  }, [solo, setSolo]);
  useEffect(() => () => document.documentElement.removeAttribute("data-solo-mapa"), []);
  const deslizarArriba = useDeslizar("arriba", () => setSolo(true));
  const deslizarAbajo = useDeslizar("abajo", () => setSolo(false));
  /** Clases para lo que se esconde en Solo Mapa: fundido de 300 ms, sin desmontar (los filtros no se pierden). */
  const cromo = `transition-opacity duration-300 ${solo ? "pointer-events-none opacity-0" : "opacity-100"}`;

  const onEstado = useCallback((id: string, e: "cargando" | "listo" | "error") => {
    setEstados((s) => (s[id] === e ? s : { ...s, [id]: e }));
  }, []);

  const seleccionar = useCallback(
    (capa: string, elemento: Elemento) => {
      setSeleccion({ capa, elemento });
      setMasOpciones(false);
      if (capa === "barrios") setParams((p) => { p.set("barrio", String(elemento.properties?.codigo ?? "")); return p; }, { replace: true });
    },
    [setParams],
  );

  const cerrarFicha = () => {
    setSeleccion(null);
    setParams((p) => { p.delete("barrio"); return p; }, { replace: true });
  };

  // Abrir un barrio desde la URL (?barrio=0201)
  useEffect(() => {
    const codigo = params.get("barrio");
    if (!codigo || indicadores.estado !== "listo" || seleccion) return;
    cargar<{ features: Elemento[] }>("barrios.geojson").then((c) => {
      const f = c.features.find((x) => x.properties?.codigo === codigo);
      if (f) {
        setSeleccion({ capa: "barrios", elemento: f });
        setDestino({ elemento: f, n: Date.now() });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indicadores.estado]);

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setSeleccion(null);
    setParams((p) => { if (m === "ciudad") p.set("vista", "ciudad"); else p.delete("vista"); p.delete("barrio"); return p; }, { replace: true });
  };

  const temaActivo = (t: Tema) => t.capas.every((c) => activas.has(c));
  const alternarTema = (t: Tema) =>
    setActivas((s) => {
      const n = new Set(s);
      if (temaActivo(t)) t.capas.forEach((c) => n.delete(c));
      else t.capas.forEach((c) => n.add(c));
      return n;
    });
  const alternarCapa = (id: string) =>
    setActivas((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const elegirResultado = (r: Resultado) => {
    const tema = TEMAS.find((t) => t.capas.includes(r.capa));
    if (tema) setActivas((s) => new Set([...s, r.capa]));
    seleccionar(r.capa, r.elemento);
    setDestino({ elemento: r.elemento, n: Date.now() });
  };

  const iniciarRecorrido = () => {
    if (modo !== "comuna") cambiarModo("comuna");
    setVista3d(true);
    setRecorrido(true);
  };

  const cerrarAyuda = () => {
    setAyuda(false);
    try {
      localStorage.setItem(CLAVE_AYUDA, "1");
    } catch {
      /* sin almacenamiento: la ayuda vuelve a salir la próxima vez */
    }
  };

  // Pintar barrios por un indicador -------------------------------------------
  const coloreo = useMemo(() => {
    if (!colorBarrios || indicadores.estado !== "listo" || modo !== "comuna") return null;
    const def = COLORES_BARRIO.find((c) => c.id === colorBarrios);
    if (!def) return null;
    const filas = indicadores.datos.barrios.map((b) => ({ codigo: b.codigo, v: b[def.id as keyof Ficha] as number | null }));
    const valores = filas.map((f) => f.v).filter((v): v is number => v != null);
    const c = cortes(valores);
    const escala = def.mayorEsPeor ? ESCALA_ALERTA : [...ESCALA_ALERTA].reverse();
    const clase = (v: number) => c.filter((x) => v > x).length;
    const colores = Object.fromEntries(filas.filter((f) => f.v != null).map((f) => [f.codigo, escala[clase(f.v as number)]]));
    const max = Math.max(...valores);
    const limites = [Math.min(...valores), ...c, max];
    const f = (v: number) => (max < 10 ? dec2(v) : num(Math.round(v)));
    const bloque: BloqueLeyenda = {
      titulo: `${def.nombre}${def.unidad ? ` (${def.unidad})` : ""}`,
      items: escala.map((color, i) => ({ color, etiqueta: `${f(limites[i])} a ${f(limites[i + 1])}`, forma: "area" as const })),
      nota: "Más oscuro = situación más difícil.",
    };
    return { colores, bloque };
  }, [colorBarrios, indicadores, modo]);

  const leyenda: BloqueLeyenda[] = [
    ...(vista3d && modo === "comuna"
      ? [{
          titulo: "Edificaciones en 3D (catastro)",
          items: [
            { color: "#d1e7d1", etiqueta: "1 piso", forma: "area" as const },
            { color: "#4a8c6f", etiqueta: "2 pisos", forma: "area" as const },
            { color: "#1a4d2e", etiqueta: "3 pisos o más", forma: "area" as const },
          ],
          nota: "Altura = pisos × 3 m. Las sombras siguen la posición real del sol a la hora elegida. El relieve está exagerado 1,6 veces para que se note.",
        }]
      : []),
    ...(coloreo ? [coloreo.bloque] : []),
    ...CAPAS.filter((c) => activas.has(c.id)).map((c) => ({ titulo: c.nombre, items: c.leyenda })),
  ];

  const santaCruzProps = comunas.estado === "listo" ? comunas.datos.features.find((f) => f.properties?.es_santa_cruz)?.properties ?? undefined : undefined;

  const contenidoFicha = (() => {
    if (!seleccion) return null;
    if (seleccion.capa === "comunas")
      return <FichaComuna p={seleccion.elemento.properties ?? {}} santaCruz={santaCruzProps} onVerSantaCruz={() => cambiarModo("comuna")} />;
    if (seleccion.capa === "barrios") {
      if (indicadores.estado === "error") return <ErrorCarga error={indicadores.error} reintentar={indicadores.reintentar} />;
      if (indicadores.estado !== "listo") return <Cargando />;
      const ficha = indicadores.datos.barrios.find((b) => b.codigo === seleccion.elemento.properties?.codigo);
      return ficha ? <FichaBarrio ficha={ficha} indicadores={indicadores.datos} /> : null;
    }
    const def = capaPorId(seleccion.capa);
    return def ? <FichaElemento def={def} props={seleccion.elemento.properties ?? {}} /> : null;
  })();

  return (
    <div className="relative flex h-full bg-papel">
      <div className="relative min-w-0 flex-1">
        <MapaVivo
          modo={modo}
          activas={activas}
          vista3d={vista3d}
          recorrido={recorrido}
          onFinRecorrido={() => setRecorrido(false)}
          colorBarrio={coloreo?.colores ?? null}
          filtroSiniestros={filtroSin}
          seleccion={seleccion}
          destino={destino}
          reencuadre={reencuadre}
          onSeleccionar={seleccionar}
          onEstado={onEstado}
          ruteoActivo={ruteo}
          onClicMapa={(lon, lat) => setClicRuta({ lon, lat, n: Date.now() })}
          rutas={ruteo ? rutas : null}
          puntosRuta={ruteo ? puntosRuta : null}
          onMapa={setMapaML}
          noche={noche}
          hora={hora}
          opacidad={opacidad / 100}
        />

        {/* Barra superior: modo, búsqueda y vista */}
        <div className={`pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-wrap items-start gap-2 md:inset-x-4 md:top-4 md:gap-3 ${cromo}`}>
          <div role="radiogroup" aria-label="Qué parte de la ciudad ver" className={`flex rounded-2xl bg-superficie/95 p-1.5 shadow-lg backdrop-blur ${solo ? "" : "pointer-events-auto"}`}>
            {(
              [
                ["comuna", "Santa Cruz"],
                ["ciudad", "Toda Medellín"],
              ] as const
            ).map(([id, nombre]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={modo === id}
                onClick={() => cambiarModo(id)}
                className={`rounded-xl px-4 py-2.5 text-base font-semibold transition-colors md:px-5 md:text-lg ${modo === id ? "bg-tinta text-papel" : "text-tinta hover:bg-papel-hondo"}`}
              >
                {nombre}
              </button>
            ))}
          </div>
          <div className={`order-last w-full md:order-none md:w-64 2xl:w-80 ${solo ? "" : "pointer-events-auto"}`}>
            <Buscador onElegir={elegirResultado} modo={modo} />
          </div>
          <div className={`ml-auto flex gap-2 ${solo ? "" : "pointer-events-auto"}`}>
            <button
              type="button"
              aria-pressed={ruteo}
              onClick={alternarRuteo}
              className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-base font-semibold shadow-lg ${ruteo ? "bg-ambar text-white" : "bg-tinta text-papel"}`}
            >
              <Icono nombre="ruta" className="h-6 w-6" />
              {ruteo ? "Salir de rutas" : "¿Cómo llego?"}
            </button>
            <button
              type="button"
              aria-pressed={vista3d}
              onClick={() => setVista3d((v) => !v)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-base font-semibold shadow-lg ${vista3d ? "bg-ladera text-papel" : "bg-superficie/95 text-tinta"}`}
            >
              <Icono nombre="3d" className="h-6 w-6" />
              {vista3d ? "Ver en plano" : "Ver en 3D"}
            </button>
            <button
              type="button"
              aria-pressed={solo}
              onClick={() => setSolo(true)}
              title="Esconder todo y ver solo el mapa (Esc para salir)"
              className="flex items-center gap-2 rounded-2xl bg-[#1a4d2e] px-4 py-3 text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Solo Mapa <span aria-hidden="true" className="text-lg leading-none">⛶</span>
            </button>
            <button
              type="button"
              onClick={() => (recorrido ? setRecorrido(false) : iniciarRecorrido())}
              className={`hidden items-center gap-2 rounded-2xl px-4 py-3 text-base font-semibold shadow-lg sm:flex ${recorrido ? "bg-ambar text-white" : "bg-superficie/95 text-tinta"}`}
            >
              <Icono nombre="giro" className="h-6 w-6" />
              <span className="sr-only 2xl:not-sr-only">{recorrido ? "Detener recorrido" : "Recorrido"}</span>
            </button>
          </div>
        </div>

        {/* Temas: qué quiere ver (computador) */}
        <nav
          aria-label="Qué quiere ver en el mapa"
          className={`absolute left-4 top-24 z-10 w-[19rem] flex-col gap-2 overflow-y-auto pb-1 pr-1 pt-1 ${panelAbierto ? "bottom-4" : ""} ${ruteo ? "hidden" : "hidden lg:flex"} ${cromo}`}
        >
          <button
            type="button"
            aria-expanded={panelAbierto}
            onClick={() => setPanelAbierto((v) => !v)}
            className="flex w-full items-center justify-between gap-3 rounded-2xl bg-[#14301f]/90 px-4 py-3 text-left text-papel shadow-md backdrop-blur transition hover:bg-[#14301f]"
          >
            <span>
              <span className="block text-lg font-bold [font-stretch:110%]">¿Qué quiere ver?</span>
              <span className="block text-sm text-papel/75">
                {panelAbierto ? "Toque uno o varios. Se pueden combinar." : `${TEMAS.filter(temaActivo).length} temas encendidos`}
              </span>
            </span>
            <svg viewBox="0 0 24 24" aria-hidden="true" className={`h-6 w-6 shrink-0 transition-transform duration-300 ${panelAbierto ? "" : "rotate-180"}`} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="m6 15 6-6 6 6" />
            </svg>
            <span className="sr-only">{panelAbierto ? "Colapsar panel" : "Abrir panel"}</span>
          </button>
          {panelAbierto && (
          <>
          <div className="grid grid-cols-2 gap-2">
            {TEMAS.map((t) => (
              <TemaCuadro
                key={t.id}
                t={t}
                activo={temaActivo(t)}
                soloComuna={modo === "ciudad" && t.capas.every((c) => !capaPorId(c)?.archivoCiudad)}
                onClick={() => alternarTema(t)}
              />
            ))}
          </div>
          <label className="block rounded-2xl bg-superficie/90 px-4 py-3 shadow-sm">
            <span className="flex items-baseline justify-between text-sm font-semibold">
              Opacidad de las capas
              <span className="tabular-nums text-tinta-suave">{opacidad}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={opacidad}
              onChange={(e) => setOpacidad(Number(e.target.value))}
              className="rango-verde mt-2 w-full"
              aria-describedby="ayuda-opacidad"
            />
            <span id="ayuda-opacidad" className="mt-1 block text-xs text-tinta-tenue">Bájela para admirar el mapa de fondo.</span>
          </label>
          <button
            type="button"
            onClick={() => setMasOpciones(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-tinta/25 bg-superficie/85 px-3 py-3 text-base font-semibold hover:bg-superficie"
          >
            <Icono nombre="capas" className="h-5 w-5" />
            Más opciones y leyenda
          </button>
          </>
          )}
        </nav>

        {/* Temas en celular y tableta: fila deslizable abajo. Deslizar hacia arriba = Solo Mapa */}
        <div {...deslizarArriba} className={`absolute inset-x-0 bottom-0 z-10 lg:hidden ${ruteo ? "hidden" : ""} ${cromo}`}>
          <div className="mx-auto mb-1 flex w-fit items-center gap-2 rounded-full bg-superficie/85 px-3 py-1 text-xs font-semibold text-tinta-suave shadow">
            <span aria-hidden="true" className="h-1 w-8 rounded-full bg-tinta/30" />
            Deslice hacia arriba para ver solo el mapa
          </div>
        <nav aria-label="Qué quiere ver en el mapa" className="flex gap-2 overflow-x-auto px-3 pb-3">
          {TEMAS.map((t) => (
            <div key={t.id} className="shrink-0">
              <BotonTema t={t} activo={temaActivo(t)} soloComuna={modo === "ciudad" && t.capas.every((c) => !capaPorId(c)?.archivoCiudad)} onClick={() => alternarTema(t)} />
            </div>
          ))}
          <button type="button" onClick={() => setMasOpciones(true)} className="shrink-0 rounded-2xl bg-tinta px-4 text-base font-semibold text-papel">
            Más opciones
          </button>
        </nav>
        </div>

        {/* Controles de cámara: zoom, brújula, día/noche, foto HD */}
        <div className={`absolute right-3 z-10 md:right-4 ${solo ? "top-4" : "top-[17rem] md:top-40 xl:top-24"}`}>
          <BotonesCamara mapa={mapaML} noche={noche} onNoche={() => setNoche((v) => !v)} conNoche={!solo} onAviso={setAviso} />
        </div>

        {/* Control 3D (joystick) y hora del sol */}
        <div className={`absolute right-3 z-10 flex flex-col items-end gap-2 md:right-4 ${solo ? "bottom-6" : ruteo ? "bottom-6" : "bottom-28 lg:bottom-6"}`}>
          {vista3d && !noche && !solo && <HoraSol hora={hora} onHora={setHora} />}
          <Joystick mapa={mapaML} />
        </div>

        {/* Solo Mapa: salir */}
        {solo && (
          <>
            <button
              type="button"
              onClick={() => setSolo(false)}
              className="salida-limpia absolute left-4 top-4 z-20 flex items-center gap-2 rounded-2xl bg-superficie/95 px-4 py-3 text-base font-semibold text-tinta shadow-lg backdrop-blur hover:bg-superficie"
            >
              <span aria-hidden="true" className="text-xl leading-none">✕</span> Salir del modo limpio
            </button>
            {/* En el celular: deslizar hacia abajo desde el borde de arriba también sale */}
            <div {...deslizarAbajo} aria-hidden="true" className="absolute inset-x-0 top-0 z-[15] h-10 lg:hidden" />
          </>
        )}

        {/* Avisos cortos (foto descargada, etc.) */}
        {aviso && (
          <p role="status" className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[#14301f] px-5 py-2.5 text-base font-semibold text-white shadow-xl">
            {aviso}
          </p>
        )}

        {/* Leyenda compacta (computador), arriba a la derecha junto a los controles */}
        {leyenda.length > 0 && !ruteo && (
          <div className={`absolute right-20 top-24 z-10 hidden w-64 rounded-2xl bg-superficie/95 shadow-lg backdrop-blur xl:block ${cromo}`}>
            <button
              type="button"
              aria-expanded={verLeyenda}
              onClick={() => setVerLeyenda((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-base font-bold"
            >
              Leyenda
              <span className="text-sm font-medium text-tinta-suave">{verLeyenda ? "Ocultar" : "Mostrar"}</span>
            </button>
            {verLeyenda && (
              <div className="max-h-[52vh] overflow-y-auto px-4 pb-4">
                <Leyenda bloques={leyenda} />
              </div>
            )}
          </div>
        )}

        {/* Ayuda la primera vez */}
        {ayuda && !solo && (
          <div role="dialog" aria-label="Cómo usar el mapa" className="absolute left-1/2 top-1/2 z-20 w-[min(92%,30rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-superficie p-6 shadow-2xl">
            <h2 className="text-2xl font-bold [font-stretch:110%]">Así se usa el mapa</h2>
            <ol className="mt-4 space-y-3 text-lg">
              <li><strong>1.</strong> Elija qué quiere ver con los botones grandes: Metro, colegios, parques…</li>
              <li><strong>2.</strong> Toque un barrio o un punto para ver su información.</li>
              <li><strong>3.</strong> Use <strong>Ver en 3D</strong> para ver la montaña y <strong>Toda Medellín</strong> para comparar con otras comunas.</li>
            </ol>
            <button type="button" onClick={cerrarAyuda} className="mt-6 w-full rounded-2xl bg-ladera px-4 py-3.5 text-lg font-semibold text-papel hover:bg-ladera-hondo">
              Entendido, ver el mapa
            </button>
          </div>
        )}

        {/* Más opciones */}
        {masOpciones && (
          <aside aria-label="Más opciones del mapa" className="absolute inset-y-0 left-0 z-30 w-full max-w-sm overflow-y-auto bg-papel p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold [font-stretch:110%]">Más opciones</h2>
              <button type="button" onClick={() => setMasOpciones(false)} className="flex items-center gap-1 rounded-xl border border-nivel bg-superficie px-3 py-2 text-base font-medium">
                <Icono nombre="cerrar" className="h-5 w-5" /> Cerrar
              </button>
            </div>
            <PanelCapas
              modo={modo}
              activas={activas}
              cargando={estados}
              onCambiar={alternarCapa}
              colorBarrios={colorBarrios}
              onColorBarrios={setColorBarrios}
              filtroSiniestros={filtroSin}
              onFiltroSiniestros={setFiltroSin}
            />
            <section className="mt-8 border-t border-nivel pt-4">
              <h3 className="mb-2 text-lg font-bold">Leyenda</h3>
              <Leyenda bloques={leyenda} />
            </section>
            <button type="button" onClick={() => setReencuadre((n) => n + 1)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-nivel bg-superficie px-4 py-3 text-base font-semibold">
              <Icono nombre="inicio" className="h-5 w-5" /> Centrar el mapa otra vez
            </button>
          </aside>
        )}
      </div>

      {/* ¿Cómo llego? */}
      {ruteo && (
        <aside
          aria-label="Rutas caminando"
          className={`absolute inset-x-0 bottom-0 z-40 max-h-[62%] overflow-y-auto rounded-t-3xl bg-papel p-5 shadow-2xl md:static md:z-auto md:max-h-none md:w-[26rem] md:shrink-0 md:rounded-none md:border-l md:border-nivel md:shadow-none ${solo ? "!hidden" : ""}`}
        >
          <PanelRuteo clic={clicRuta} onGeo={onGeoRuta} onEncuadrar={onEncuadrarRuta} onCerrar={alternarRuteo} />
        </aside>
      )}

      {/* Ficha */}
      {!ruteo && contenidoFicha && (
        <aside
          aria-label="Ficha"
          className={`absolute inset-x-0 bottom-0 z-40 max-h-[62%] overflow-y-auto rounded-t-3xl bg-papel p-5 shadow-2xl md:static md:z-auto md:max-h-none md:w-[26rem] md:shrink-0 md:rounded-none md:border-l md:border-nivel md:shadow-none ${solo ? "!hidden" : ""}`}
        >
          <div className="mb-3 flex justify-end">
            <button type="button" onClick={cerrarFicha} className="flex items-center gap-1 rounded-xl border border-nivel bg-superficie px-3 py-2 text-base font-medium hover:bg-papel-hondo">
              <Icono nombre="cerrar" className="h-5 w-5" /> Cerrar
            </button>
          </div>
          {contenidoFicha}
        </aside>
      )}
    </div>
  );
}
