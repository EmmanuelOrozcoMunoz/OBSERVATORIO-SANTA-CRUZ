import { Link, useNavigate, useParams } from "react-router-dom";
import { useDatos } from "../lib/datos";
import { dec, dec2, num, pct } from "../lib/formato";
import type { Indicadores } from "../lib/tipos";
import { ConDatos } from "../components/Estado";
import { BotonCabecera, Cabecera, Kpi, Relacionados, Seccion } from "../components/Pagina";
import { Revelar } from "../components/Animacion";

type Conteo = { nombre: string; n: number };
type Seguridad = { hurto_2017: { total: number; por_barrio: Conteo[] }; homicidio_2017: { total: number; por_barrio: Conteo[] }; camaras: { total: number; por_barrio: Conteo[] } };
type Eje = { destinos: Record<string, { nombre: string; por_barrio: { barrio: string; minutos_ruta_rapida: number; minutos_por_la_49: number; pct_49_en_el_camino: number }[] }> };
type Fila = Record<string, number | string | null>;

const en = (l: Conteo[] | undefined, nombre: string) => l?.find((x) => x.nombre === nombre)?.n ?? 0;

/** Barra de dos filas: el barrio contra el total de la comuna, en la misma escala. */
function Comparar({ titulo, barrio, comuna, unidad, mayorEsMalo = true, dec: d = 1 }: { titulo: string; barrio: number | null; comuna: number | null; unidad: string; mayorEsMalo?: boolean; dec?: number }) {
  const max = Math.max(barrio ?? 0, comuna ?? 0, 0.0001);
  const f = (v: number | null) => (v == null ? "Sin dato" : v.toLocaleString("es-CO", { maximumFractionDigits: d }));
  const peor = barrio != null && comuna != null && (mayorEsMalo ? barrio > comuna : barrio < comuna);
  return (
    <div className="rounded-2xl border border-nivel bg-superficie p-4 shadow-sm">
      <p className="text-sm font-semibold">{titulo}</p>
      {[{ n: "Este barrio", v: barrio, c: peor ? "#c0583a" : "#2d6a4f" }, { n: "Toda la comuna", v: comuna, c: "#1d2b2a" }].map((r) => (
        <div key={r.n} className="mt-2 grid grid-cols-[6.5rem_1fr_auto] items-center gap-2 text-xs">
          <span className="text-tinta-suave">{r.n}</span>
          <span className="relative h-2.5 rounded-full bg-papel-hondo"><span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${((r.v ?? 0) / max) * 100}%`, background: r.c, transition: "width 600ms ease" }} /></span>
          <span className="min-w-[3.5rem] text-right font-semibold tabular-nums">{f(r.v)} {unidad}</span>
        </div>
      ))}
    </div>
  );
}

function Contenido({ ind, seg, eje }: { ind: Indicadores; seg: Seguridad | null; eje: Eje | null }) {
  const { codigo } = useParams();
  const ir = useNavigate();
  const b = ind.barrios.find((x) => x.codigo === codigo) ?? ind.barrios[0];
  const c = ind.comuna;
  const acc = (ind.accesibilidad?.barrios as Fila[] | undefined)?.find((x) => x.barrio === b.nombre);
  const accC = ind.accesibilidad?.comuna as Fila | undefined;
  const e49 = eje?.destinos.transporte_masivo.por_barrio.find((x) => x.barrio === b.nombre);
  const atrMil = (x: { atropellos: number; poblacion_2018: number | null }) => (x.poblacion_2018 ? (x.atropellos / x.poblacion_2018) * 1000 : null);
  const anchoB = ind.infraestructura?.andenes.barrios.find((x: Fila) => x.barrio === b.nombre) as Fila | undefined;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-5 lg:px-8">
      <Cabecera
        etiqueta="Mi barrio"
        icono="personas"
        titulo={b.nombre}
        texto={<>{num(b.poblacion_2018)} personas y {num(b.viviendas_2018)} viviendas (Censo 2018) en {dec(b.area_ha)} hectáreas. Todo lo que el observatorio sabe de este barrio, en un solo lugar.</>}
      >
        <BotonCabecera to={`/mapa?barrio=${b.codigo}`}>Verlo en el mapa</BotonCabecera>
        <BotonCabecera to="/accesibilidad" claro>Accesibilidad</BotonCabecera>
      </Cabecera>

      <nav aria-label="Elegir barrio" className="flex flex-wrap gap-2">
        {ind.barrios.map((x) => (
          <button key={x.codigo} type="button" onClick={() => ir(`/barrios/${x.codigo}`)} aria-pressed={x.codigo === b.codigo}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${x.codigo === b.codigo ? "bg-acento text-white shadow" : "bg-superficie text-tinta ring-1 ring-nivel hover:bg-menta"}`}>
            {x.nombre}
          </button>
        ))}
      </nav>

      <Seccion id="t-b-cifras" titulo="Lo básico" texto="Datos del Censo 2018, el POT y el inventario oficial.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            <Kpi key="p" valor={num(b.poblacion_2018)} texto="personas" nota={`${pct(((b.poblacion_2018 ?? 0) / (c.poblacion_2018 ?? 1)) * 100)} de la comuna`} />,
            <Kpi key="d" valor={num(Math.round(b.densidad_hab_ha ?? 0))} texto="habitantes por hectárea" nota={`Comuna: ${num(Math.round(c.densidad_hab_ha ?? 0))}`} tono="ambar" />,
            <Kpi key="e" valor={`${dec2(b.espacio_publico_m2_hab)} m²`} texto="de espacio público por habitante" nota="Referencia nacional: 15 m²" tono="rojo" />,
            <Kpi key="q" valor={num(b.equipamientos)} texto="equipamientos colectivos" nota={`${b.sedes_educativas} sedes educativas`} />,
          ].map((k, i) => <Revelar key={i} retraso={i * 50} className="h-full">{k}</Revelar>)}
        </div>
      </Seccion>

      <Seccion id="t-b-comp" titulo="Este barrio frente a la comuna" texto="Rojo = peor que el total de la comuna.">
        <div className="grid gap-3 md:grid-cols-2">
          <Comparar titulo="Espacio público por habitante" barrio={b.espacio_publico_m2_hab} comuna={c.espacio_publico_m2_hab} unidad="m²" mayorEsMalo={false} dec={2} />
          <Comparar titulo="Atropellos por cada 1.000 habitantes" barrio={atrMil(b)} comuna={atrMil({ atropellos: ind.barrios.reduce((s, x) => s + x.atropellos, 0), poblacion_2018: c.poblacion_2018 ?? null })} unidad="" />
          <Comparar titulo="Superficie con amenaza alta por movimiento en masa" barrio={b.amenaza_alta_pct} comuna={c.amenaza_pct?.Alta ?? null} unidad="%" />
          {acc && accC && <Comparar titulo="Minutos promedio caminando al Metro o Metrocable" barrio={acc.transporte_masivo_promedio_min as number} comuna={accC.transporte_masivo_promedio_min as number} unidad="min" />}
        </div>
      </Seccion>

      <Seccion id="t-b-mov" titulo="Movilidad y la Carrera 49" texto="Tiempos caminando por la red de calles y escaleras, con la pendiente.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {acc && <Kpi valor={pct(acc.transporte_masivo_10min_pct as number)} texto="de las personas llegan al Metro en 10 min o menos" tono="ambar" />}
          {acc && <Kpi valor={`${dec(acc.transporte_masivo_promedio_min as number)} min`} texto="promedio hasta la estación más cercana" />}
          {e49 && <Kpi valor={`${dec(e49.minutos_ruta_rapida)} → ${dec(e49.minutos_por_la_49)}`} texto="min a la estación: ruta rápida contra ir por la 49" nota={`${pct(e49.pct_49_en_el_camino)} de la ruta rápida ya va por la 49`} tono={e49.minutos_por_la_49 - e49.minutos_ruta_rapida <= 3 ? "verde" : "rojo"} />}
          <Kpi valor={num(b.atropellos)} texto="atropellos registrados (2019 a 2025)" nota={`${num(b.siniestros_viales)} siniestros en total`} tono="rojo" />
        </div>
        <p className="mt-3 text-sm">
          <Link className="font-semibold text-marca underline underline-offset-2" to="/corredor-49">Ver el análisis completo de la Carrera 49</Link>
        </p>
      </Seccion>

      {seg && (
        <Seccion id="t-b-seg" titulo="Seguridad" texto="Hurto y homicidio son de 2017, el último año publicado. Solo conteos por barrio, nunca puntos de víctimas.">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi valor={num(en(seg.hurto_2017.por_barrio, b.nombre))} texto="hurtos en 2017" nota={`Comuna: ${num(seg.hurto_2017.total)}`} tono="ambar" />
            <Kpi valor={num(en(seg.homicidio_2017.por_barrio, b.nombre))} texto="homicidios en 2017" nota={`Comuna: ${num(seg.homicidio_2017.total)}`} tono="rojo" />
            <Kpi valor={num(en(seg.camaras.por_barrio, b.nombre))} texto="cámaras de vigilancia registradas" nota={`Comuna: ${num(seg.camaras.total)}`} />
            {anchoB && <Kpi valor={`${dec2(anchoB.ancho_mediano_m as number)} m`} texto="ancho mediano de andén" nota={`${pct(anchoB.andenes_angostos_pct as number)} más angosto que 1,2 m`} tono="rojo" />}
          </div>
        </Seccion>
      )}

      <Relacionados ids={["mapa", "indicadores", "prioridades"]} />
    </div>
  );
}

export default function Barrio() {
  const ind = useDatos<Indicadores>("indicadores.json");
  const seg = useDatos<Seguridad>("seguridad.json");
  const eje = useDatos<Eje>("eje49.json");
  return (
    <ConDatos estado={ind}>
      {(d) => <Contenido ind={d} seg={seg.estado === "listo" ? seg.datos : null} eje={eje.estado === "listo" ? eje.datos : null} />}
    </ConDatos>
  );
}
